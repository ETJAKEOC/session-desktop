import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { useTimerOptionsByMode } from '../../../../../hooks/useParamSelector';
import { setDisappearingMessagesByConvoId } from '../../../../../interactions/conversationInteractions';
import { TimerOptions } from '../../../../../session/disappearing_messages/timerOptions';
import { DisappearingMessageConversationModeType } from '../../../../../session/disappearing_messages/types';
import { closeRightPanel } from '../../../../../state/ducks/conversations';

import {
  getSelectedConversationExpirationModes,
  useSelectedConversationDisappearingMode,
  useSelectedConversationKey,
  useSelectedExpireTimer,
  useSelectedIsGroupOrCommunity,
} from '../../../../../state/selectors/selectedConversation';
import { Flex } from '../../../../basic/Flex';
import { SessionButton, SessionButtonColor } from '../../../../basic/SessionButton';
import { SpacerLG } from '../../../../basic/Text';
import {
  HeaderSubtitle,
  StyledScrollContainer,
} from '../../../../conversation/right-panel/overlay/components';
import { DisappearingModes } from './DisappearingModes';
import { TimeOptions } from './TimeOptions';
import { useConversationSettingsModalIsStandalone } from '../../../../../state/selectors/modal';
import { updateConversationSettingsModal } from '../../../../../state/ducks/modalDialog';
import { useShowConversationSettingsFor } from '../../../../menuAndSettingsHooks/useShowConversationSettingsFor';
import { sectionActions } from '../../../../../state/ducks/section';

const ButtonSpacer = styled.div`
  height: 80px;
`;

const StyledButtonContainer = styled.div`
  background: linear-gradient(0deg, var(--background-primary-color), transparent);
  position: absolute;
  width: 100%;
  bottom: 0px;

  .session-button {
    font-weight: 500;
    min-width: 90px;
    width: fit-content;
    margin: 35px auto 10px;
  }
`;

const StyledNonAdminDescription = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 var(--margins-lg);
  color: var(--text-secondary-color);
  font-size: var(--font-size-sm);
  text-align: center;
  line-height: 15px;
`;

function loadDefaultTimeValue(
  modeSelected: DisappearingMessageConversationModeType,
  hasOnlyOneMode: boolean
) {
  // NOTE if there is only 1 disappearing message mode available the default state is that it is turned off
  if (hasOnlyOneMode) {
    return 0;
  }

  return modeSelected !== 'off'
    ? modeSelected === 'deleteAfterSend'
      ? TimerOptions.DEFAULT_OPTIONS.DELETE_AFTER_SEND
      : TimerOptions.DEFAULT_OPTIONS.DELETE_AFTER_READ
    : 0;
}

/** if there is only one disappearing message mode and 'off' enabled then we trigger single mode UI */
function useSingleMode(disappearingModeOptions: Record<string, boolean> | undefined) {
  const singleMode: DisappearingMessageConversationModeType | undefined =
    disappearingModeOptions &&
    disappearingModeOptions.off !== undefined &&
    Object.keys(disappearingModeOptions).length === 2
      ? (Object.keys(disappearingModeOptions)[1] as DisappearingMessageConversationModeType)
      : undefined;

  return { singleMode };
}

export const DisappearingMessagesPage = () => {
  const dispatch = useDispatch();
  const selectedConversationKey = useSelectedConversationKey();
  const disappearingModeOptions = useSelector(getSelectedConversationExpirationModes);
  const { singleMode } = useSingleMode(disappearingModeOptions);
  const hasOnlyOneMode = !!(singleMode && singleMode.length > 0);

  const isGroup = useSelectedIsGroupOrCommunity();
  const expirationMode = useSelectedConversationDisappearingMode() || 'off';
  const expireTimer = useSelectedExpireTimer();

  const [modeSelected, setModeSelected] = useState<DisappearingMessageConversationModeType>(
    hasOnlyOneMode ? singleMode : expirationMode
  );

  const [timeSelected, setTimeSelected] = useState(expireTimer || 0);
  const timerOptions = useTimerOptionsByMode(modeSelected, hasOnlyOneMode);
  const isStandalone = useConversationSettingsModalIsStandalone();

  const showConvoSettingsCb = useShowConversationSettingsFor(selectedConversationKey);

  const handleSetMode = async () => {
    if (hasOnlyOneMode) {
      if (selectedConversationKey && singleMode) {
        await setDisappearingMessagesByConvoId(
          selectedConversationKey,
          timeSelected === 0 ? 'off' : singleMode,
          timeSelected
        );
        dispatch(closeRightPanel());
        dispatch(sectionActions.resetRightOverlayMode());
      }
      return;
    }
    if (selectedConversationKey && modeSelected) {
      await setDisappearingMessagesByConvoId(selectedConversationKey, modeSelected, timeSelected);
      if (isStandalone) {
        dispatch(updateConversationSettingsModal(null));
      } else {
        showConvoSettingsCb?.({
          settingsModalPage: 'default',
        });
      }
    }
  };

  useEffect(() => {
    // NOTE loads a time value from the conversation model or the default
    setTimeSelected(
      expireTimer !== undefined && expireTimer > -1
        ? expireTimer
        : loadDefaultTimeValue(modeSelected, hasOnlyOneMode)
    );
  }, [expireTimer, hasOnlyOneMode, modeSelected]);

  if (!disappearingModeOptions) {
    return null;
  }

  if (!selectedConversationKey) {
    return null;
  }

  return (
    <StyledScrollContainer style={{ position: 'relative' }}>
      <Flex $container={true} $flexDirection={'column'} $alignItems={'center'}>
        <HeaderSubtitle>
          {singleMode === 'deleteAfterRead'
            ? window.i18n('disappearingMessagesDisappearAfterReadDescription')
            : singleMode === 'deleteAfterSend'
              ? window.i18n('disappearingMessagesDisappearAfterSendDescription')
              : window.i18n('disappearingMessagesDescription1')}
        </HeaderSubtitle>
        <DisappearingModes
          options={disappearingModeOptions}
          selected={modeSelected}
          setSelected={setModeSelected}
          hasOnlyOneMode={hasOnlyOneMode}
        />
        {(hasOnlyOneMode || modeSelected !== 'off') && (
          <>
            <TimeOptions
              options={timerOptions}
              selected={timeSelected}
              setSelected={setTimeSelected}
              hasOnlyOneMode={hasOnlyOneMode}
              disabled={
                singleMode
                  ? disappearingModeOptions[singleMode]
                  : modeSelected
                    ? disappearingModeOptions[modeSelected]
                    : undefined
              }
            />
          </>
        )}

        {isGroup && (
          <>
            <SpacerLG />
            {/* We want those to be shown no matter our admin rights in a group. */}
            <StyledNonAdminDescription>
              {window.i18n('disappearingMessagesDescription')}
              <br />
              {window.i18n('disappearingMessagesOnlyAdmins')}
            </StyledNonAdminDescription>
          </>
        )}
        <ButtonSpacer />

        <StyledButtonContainer>
          <SessionButton
            buttonColor={SessionButtonColor.PrimaryDark}
            onClick={handleSetMode}
            disabled={
              singleMode
                ? disappearingModeOptions[singleMode]
                : modeSelected
                  ? disappearingModeOptions[modeSelected]
                  : undefined
            }
            dataTestId={'disappear-set-button'}
          >
            {window.i18n('set')}
          </SessionButton>
        </StyledButtonContainer>
      </Flex>
    </StyledScrollContainer>
  );
};
