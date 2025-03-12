import { expect } from 'chai';
import { GroupPubkeyType, UserGroupsGet } from 'libsession_util_nodejs';
import { omit } from 'lodash';
import Long from 'long';
import Sinon from 'sinon';
import { getSodiumNode } from '../../../../../../node/sodiumNode';
import { NotEmptyArrayOfBatchResults } from '../../../../../../session/apis/snode_api/BatchResultEntry';
import { SnodeNamespaces } from '../../../../../../session/apis/snode_api/namespaces';
import { ConvoHub } from '../../../../../../session/conversations';
import { LibSodiumWrappers } from '../../../../../../session/crypto';
import { MessageSender } from '../../../../../../session/sending';
import { UserUtils } from '../../../../../../session/utils';
import { RunJobResult } from '../../../../../../session/utils/job_runners/PersistedJob';
import { GroupSync } from '../../../../../../session/utils/job_runners/jobs/GroupSyncJob';
import {
  GroupDestinationChanges,
  GroupSuccessfulChange,
  LibSessionUtil,
  PendingChangesForGroup,
} from '../../../../../../session/utils/libsession/libsession_utils';
import { MetaGroupWrapperActions } from '../../../../../../webworker/workers/browser/libsession_worker_interface';
import { TestUtils } from '../../../../../test-utils';
import { stubWindowFeatureFlags, stubWindowLog, TypedStub } from '../../../../../test-utils/utils';
import { NetworkTime } from '../../../../../../util/NetworkTime';

function validInfo(sodium: LibSodiumWrappers) {
  return {
    type: 'GroupInfo',
    ciphertext: sodium.randombytes_buf(12),
    seqno: Long.fromNumber(123),
    namespace: SnodeNamespaces.ClosedGroupInfo,
    timestamp: 1234,
  } as const;
}
function validMembers(sodium: LibSodiumWrappers) {
  return {
    type: 'GroupMember',
    ciphertext: sodium.randombytes_buf(12),
    seqno: Long.fromNumber(321),
    namespace: SnodeNamespaces.ClosedGroupMembers,
    timestamp: 4321,
  } as const;
}

function validKeys(sodium: LibSodiumWrappers) {
  return {
    type: 'GroupKeys',
    ciphertext: sodium.randombytes_buf(12),
    namespace: SnodeNamespaces.ClosedGroupKeys,
    timestamp: 3333,
  } as const;
}

function validUserGroup03WithSecKey(pubkey?: GroupPubkeyType) {
  const group: UserGroupsGet = {
    authData: new Uint8Array(30),
    secretKey: new Uint8Array(30),
    destroyed: false,
    invitePending: false,
    joinedAtSeconds: Math.floor(Date.now() / 1000),
    kicked: false,
    priority: 0,
    pubkeyHex: pubkey || TestUtils.generateFakeClosedGroupV2PkStr(),
    name: 'Valid usergroup 03',
    disappearingTimerSeconds: 0,
  };
  return group;
}

describe('GroupSyncJob run()', () => {
  afterEach(() => {
    Sinon.restore();
  });
  it('does not throw if no user keys', async () => {
    const job = new GroupSync.GroupSyncJob({
      identifier: TestUtils.generateFakeClosedGroupV2PkStr(),
    });

    const func = async () => job.run();
    // Note: the run() function should never throw, at most it should return "permanent failure"
    await expect(func()).to.be.not.eventually.rejected;
  });

  it('permanent failure if group is not a 03 one', async () => {
    const job = new GroupSync.GroupSyncJob({
      identifier: TestUtils.generateFakeClosedGroupV2PkStr().slice(2),
    });
    const result = await job.run();
    expect(result).to.be.eq(RunJobResult.PermanentFailure);
  });

  it('permanent failure if user has no ed keypair', async () => {
    Sinon.stub(UserUtils, 'getOurPubKeyStrFromCache').returns(TestUtils.generateFakePubKeyStr());
    Sinon.stub(UserUtils, 'getUserED25519KeyPairBytes').resolves(undefined);
    Sinon.stub(ConvoHub.use(), 'get').resolves({}); // anything not falsy
    const job = new GroupSync.GroupSyncJob({
      identifier: TestUtils.generateFakeClosedGroupV2PkStr(),
    });
    const result = await job.run();
    expect(result).to.be.eq(RunJobResult.PermanentFailure);
  });

  it('permanent failure if user has no own conversation', async () => {
    Sinon.stub(UserUtils, 'getOurPubKeyStrFromCache').returns(TestUtils.generateFakePubKeyStr());
    Sinon.stub(UserUtils, 'getUserED25519KeyPairBytes').resolves({} as any); // anything not falsy
    Sinon.stub(ConvoHub.use(), 'get').returns(undefined as any);
    const job = new GroupSync.GroupSyncJob({
      identifier: TestUtils.generateFakeClosedGroupV2PkStr(),
    });
    const result = await job.run();
    expect(result).to.be.eq(RunJobResult.PermanentFailure);
  });

  it('calls pushChangesToGroupSwarmIfNeeded if preconditions are fine', async () => {
    Sinon.stub(UserUtils, 'getOurPubKeyStrFromCache').returns(TestUtils.generateFakePubKeyStr());
    Sinon.stub(UserUtils, 'getUserED25519KeyPairBytes').resolves({} as any); // anything not falsy
    const taskedRun = Sinon.stub(GroupSync, 'pushChangesToGroupSwarmIfNeeded').resolves(
      RunJobResult.Success
    );
    Sinon.stub(ConvoHub.use(), 'get').returns({} as any); // anything not falsy
    const job = new GroupSync.GroupSyncJob({
      identifier: TestUtils.generateFakeClosedGroupV2PkStr(),
    });
    const result = await job.run();
    expect(result).to.be.eq(RunJobResult.Success);
    expect(taskedRun.callCount).to.be.eq(1);
  });
});

describe('GroupSyncJob resultsToSuccessfulChange', () => {
  let sodium: LibSodiumWrappers;
  beforeEach(async () => {
    sodium = await getSodiumNode();
  });
  it('no or empty results return empty array', () => {
    expect(
      LibSessionUtil.batchResultsToGroupSuccessfulChange(null, {
        allOldHashes: new Set(),
        messages: [],
      })
    ).to.be.deep.eq([]);

    expect(
      LibSessionUtil.batchResultsToGroupSuccessfulChange(
        [] as unknown as NotEmptyArrayOfBatchResults,
        {
          allOldHashes: new Set(),
          messages: [],
        }
      )
    ).to.be.deep.eq([]);
  });

  it('extract one result with 200 and messagehash', () => {
    const member = validMembers(sodium);
    const info = validInfo(sodium);
    const batchResults: NotEmptyArrayOfBatchResults = [{ code: 200, body: { hash: 'hash1' } }];
    const request: GroupDestinationChanges = {
      allOldHashes: new Set(),
      messages: [info, member],
    };
    const results = LibSessionUtil.batchResultsToGroupSuccessfulChange(batchResults, request);
    expect(results).to.be.deep.eq([
      {
        updatedHash: 'hash1',
        pushed: info,
      },
    ]);
  });

  it('extract two results with 200 and messagehash', () => {
    const member = validMembers(sodium);
    const info = validInfo(sodium);
    const batchResults: NotEmptyArrayOfBatchResults = [
      { code: 200, body: { hash: 'hash1' } },
      { code: 200, body: { hash: 'hash2' } },
    ];
    const request: GroupDestinationChanges = {
      allOldHashes: new Set(),
      messages: [info, member],
    };
    const results = LibSessionUtil.batchResultsToGroupSuccessfulChange(batchResults, request);
    expect(results).to.be.deep.eq([
      {
        updatedHash: 'hash1',
        pushed: info,
      },
      {
        updatedHash: 'hash2',
        pushed: member,
      },
    ]);
  });

  it('skip message hashes not a string', () => {
    const member = validMembers(sodium);
    const info = validInfo(sodium);
    const batchResults: NotEmptyArrayOfBatchResults = [
      { code: 200, body: { hash: 123 as any as string } },
      { code: 200, body: { hash: 'hash2' } },
    ];
    const request: GroupDestinationChanges = {
      allOldHashes: new Set(),
      messages: [info, member],
    };
    const results = LibSessionUtil.batchResultsToGroupSuccessfulChange(batchResults, request);
    expect(results).to.be.deep.eq([
      {
        updatedHash: 'hash2',
        pushed: member,
      },
    ]);
  });

  it('skip request item without data', () => {
    const member = validMembers(sodium);
    const info = validInfo(sodium);
    const infoNoData = omit(info, 'ciphertext');
    const batchResults: NotEmptyArrayOfBatchResults = [
      { code: 200, body: { hash: 'hash1' } },
      { code: 200, body: { hash: 'hash2' } },
    ];
    const request: GroupDestinationChanges = {
      allOldHashes: new Set(),
      messages: [infoNoData as any as PendingChangesForGroup, member],
    };
    const results = LibSessionUtil.batchResultsToGroupSuccessfulChange(batchResults, request);
    expect(results).to.be.deep.eq([
      {
        updatedHash: 'hash2',
        pushed: member,
      },
    ]);
  });

  it('skip request item without 200 code', () => {
    const member = validMembers(sodium);
    const info = validInfo(sodium);
    const batchResults: NotEmptyArrayOfBatchResults = [
      { code: 200, body: { hash: 'hash1' } },
      { code: 401, body: { hash: 'hash2' } },
    ];
    const request: GroupDestinationChanges = {
      allOldHashes: new Set(),
      messages: [info, member],
    };
    const results = LibSessionUtil.batchResultsToGroupSuccessfulChange(batchResults, request);
    expect(results).to.be.deep.eq([
      {
        updatedHash: 'hash1',
        pushed: info,
      },
    ]);

    // another test swapping the results
    batchResults[0].code = 401;
    batchResults[1].code = 200;
    const results2 = LibSessionUtil.batchResultsToGroupSuccessfulChange(batchResults, request);
    expect(results2).to.be.deep.eq([
      {
        updatedHash: 'hash2',
        pushed: member,
      },
    ]);
  });
});

describe('GroupSyncJob pushChangesToGroupSwarmIfNeeded', () => {
  let groupPk: GroupPubkeyType;
  let userkeys: TestUtils.TestUserKeyPairs;
  let sodium: LibSodiumWrappers;

  let sendStub: TypedStub<typeof MessageSender, 'sendEncryptedDataToSnode'>;
  let pendingChangesForGroupStub: TypedStub<typeof LibSessionUtil, 'pendingChangesForGroup'>;
  let saveDumpsToDbStub: TypedStub<typeof LibSessionUtil, 'saveDumpsToDb'>;

  beforeEach(async () => {
    sodium = await getSodiumNode();
    groupPk = TestUtils.generateFakeClosedGroupV2PkStr();
    userkeys = await TestUtils.generateUserKeyPairs();

    stubWindowLog();
    Sinon.stub(UserUtils, 'getOurPubKeyStrFromCache').returns(userkeys.x25519KeyPair.pubkeyHex);
    Sinon.stub(UserUtils, 'getUserED25519KeyPairBytes').resolves(userkeys.ed25519KeyPair);

    pendingChangesForGroupStub = Sinon.stub(LibSessionUtil, 'pendingChangesForGroup');
    saveDumpsToDbStub = Sinon.stub(LibSessionUtil, 'saveDumpsToDb');
    sendStub = Sinon.stub(MessageSender, 'sendEncryptedDataToSnode');
  });
  afterEach(() => {
    Sinon.restore();
  });

  it('call savesDumpToDb even if no changes are required on the serverside', async () => {
    pendingChangesForGroupStub.resolves({ allOldHashes: new Set(), messages: [] });

    const result = await GroupSync.pushChangesToGroupSwarmIfNeeded({
      groupPk,
      extraStoreRequests: [],
      allow401s: false,
    });
    expect(result).to.be.eq(RunJobResult.Success);
    expect(sendStub.callCount).to.be.eq(0);
    expect(pendingChangesForGroupStub.callCount).to.be.eq(1);
    expect(saveDumpsToDbStub.callCount).to.be.eq(1);
    expect(saveDumpsToDbStub.firstCall.args).to.be.deep.eq([groupPk]);
  });

  it('calls sendEncryptedDataToSnode with the right data and retry if network returned nothing', async () => {
    TestUtils.stubLibSessionWorker(undefined);
    stubWindowFeatureFlags();
    TestUtils.stubUserGroupWrapper('getGroup', validUserGroup03WithSecKey());

    const info = validInfo(sodium);
    const member = validMembers(sodium);
    const networkTimestamp = 4444;
    Sinon.stub(NetworkTime, 'now').returns(networkTimestamp);
    pendingChangesForGroupStub.resolves({
      messages: [info, member],
      allOldHashes: new Set('123'),
    });

    const result = await GroupSync.pushChangesToGroupSwarmIfNeeded({
      groupPk,
      extraStoreRequests: [],
      allow401s: false,
    });

    sendStub.resolves(undefined);
    expect(result).to.be.eq(RunJobResult.RetryJobIfPossible); // not returning anything in the sendstub so network issue happened
    expect(sendStub.callCount).to.be.eq(1);
    expect(pendingChangesForGroupStub.callCount).to.be.eq(1);
    expect(saveDumpsToDbStub.callCount).to.be.eq(1);
    expect(saveDumpsToDbStub.firstCall.args).to.be.deep.eq([groupPk]);
  });

  it('calls sendEncryptedDataToSnode and retry if network returned nothing', async () => {
    stubWindowFeatureFlags();
    TestUtils.stubUserGroupWrapper('getGroup', validUserGroup03WithSecKey(groupPk));

    const info = validInfo(sodium);
    const member = validMembers(sodium);
    const keys = validKeys(sodium);
    pendingChangesForGroupStub.resolves({
      messages: [keys, info, member],
      allOldHashes: new Set('123'),
    });
    const changes: Array<GroupSuccessfulChange> = [
      {
        pushed: keys,
        updatedHash: 'hashkeys',
      },
      {
        pushed: info,
        updatedHash: 'hashinfo',
      },
      {
        pushed: member,
        updatedHash: 'hashmember',
      },
    ];
    Sinon.stub(LibSessionUtil, 'batchResultsToGroupSuccessfulChange').returns(changes);
    const metaConfirmPushed = Sinon.stub(MetaGroupWrapperActions, 'metaConfirmPushed').resolves();

    sendStub.resolves([
      { code: 200, body: { hash: 'hashkeys' } },
      { code: 200, body: { hash: 'hashinfo' } },
      { code: 200, body: { hash: 'hashmember' } },
      { code: 200, body: {} }, // because we are giving a set of allOldHashes
    ]);
    const result = await GroupSync.pushChangesToGroupSwarmIfNeeded({
      groupPk,
      extraStoreRequests: [],
      allow401s: false,
    });

    expect(sendStub.callCount).to.be.eq(1);
    expect(pendingChangesForGroupStub.callCount).to.be.eq(1);

    expect(saveDumpsToDbStub.firstCall.args).to.be.deep.eq([groupPk]);
    expect(saveDumpsToDbStub.secondCall.args).to.be.deep.eq([groupPk]);
    expect(saveDumpsToDbStub.callCount).to.be.eq(2);

    expect(metaConfirmPushed.firstCall.args).to.be.deep.eq([
      groupPk,
      {
        groupInfo: [123, 'hashinfo'],
        groupMember: [321, 'hashmember'],
      },
    ]);
    expect(metaConfirmPushed.callCount).to.be.eq(1);

    expect(result).to.be.eq(RunJobResult.Success);
  });
});
