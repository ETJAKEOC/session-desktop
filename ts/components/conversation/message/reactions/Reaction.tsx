import { useMemo, useRef } from 'react';
import styled from 'styled-components';
import { isUsAnySogsFromCache } from '../../../../session/apis/open_group_api/sogsv3/knownBlindedkeys';
import { UserUtils } from '../../../../session/utils';
import {
  useIsMessageSelectionMode,
  useSelectedIsLegacyGroup,
} from '../../../../state/selectors/selectedConversation';
import { SortedReactionList } from '../../../../types/Reaction';
import { abbreviateNumber } from '../../../../util/numbers';
import { nativeEmojiData } from '../../../../util/emoji';
import { ReactionPopup } from './ReactionPopup';
import { SessionTooltip } from '../../../SessionTooltip';

const StyledReaction = styled.button<{
  selected: boolean;
  inModal: boolean;
  showCount: boolean;
}>`
  display: flex;
  justify-content: ${props => (props.showCount ? 'flex-start' : 'center')};
  align-items: center;

  background-color: var(--message-bubbles-received-background-color);
  box-shadow: 0 0 0 1px
    ${props => (props.selected ? 'var(--primary-color)' : 'var(--transparent-color)')};
  border-radius: var(--border-radius-message-box);
  box-sizing: border-box;
  padding: 0 7px;
  margin: 0 4px var(--margins-sm);
  height: 24px;
  min-width: ${props => (props.showCount ? '48px' : '24px')};

  span {
    width: 100%;
  }

  ${props => !props.onClick && 'cursor: not-allowed;'}
`;

const StyledReactionContainer = styled.div<{
  inModal: boolean;
}>`
  position: relative;
  ${props => props.inModal && 'white-space: nowrap; margin-right: 8px;'}
`;

export type ReactionProps = {
  emoji: string;
  messageId: string;
  reactions: SortedReactionList;
  inModal: boolean;
  inGroup: boolean;
  onClick?: (emoji: string) => void;
  onSelected?: (emoji: string) => boolean;
  handlePopupReaction?: (emoji: string) => void;
  handlePopupClick?: (emoji: string) => void;
};

export const Reaction = (props: ReactionProps) => {
  const {
    emoji,
    messageId,
    reactions,
    inModal,
    inGroup,
    onClick,
    onSelected,
    handlePopupReaction,
    handlePopupClick,
  } = props;

  const isMessageSelection = useIsMessageSelectionMode();
  const reactionsMap = useMemo(
    () => (reactions && Object.fromEntries(reactions)) || {},
    [reactions]
  );
  const senders = reactionsMap[emoji]?.senders || [];
  const count = reactionsMap[emoji]?.count;
  const showCount = count !== undefined && (count > 1 || inGroup);

  const reactionRef = useRef<HTMLDivElement>(null);

  const isLegacyGroup = useSelectedIsLegacyGroup();

  const me = UserUtils.getOurPubKeyStrFromCache();
  const isBlindedMe =
    senders && senders.length > 0 && senders.filter(isUsAnySogsFromCache).length > 0;

  const selected = () => {
    if (onSelected) {
      return onSelected(emoji);
    }

    return senders && senders.length > 0 && (senders.includes(me) || isBlindedMe);
  };

  const handleReactionClick = () => {
    if (!isMessageSelection) {
      // Note: disable emoji clicks if the legacy group is deprecated (group is readonly)
      if (onClick && !isLegacyGroup) {
        onClick(emoji);
      }
    }
  };

  const renderTooltip = inGroup && !inModal;

  const content = useMemo(
    () =>
      renderTooltip ? (
        <ReactionPopup
          messageId={messageId}
          emoji={emoji}
          count={reactionsMap[emoji]?.count}
          senders={reactionsMap[emoji]?.senders}
          onClick={() => {
            if (isLegacyGroup) {
              return;
            }
            if (handlePopupReaction) {
              handlePopupReaction('');
            }
            if (handlePopupClick) {
              handlePopupClick(emoji);
            }
          }}
        />
      ) : null,
    [
      emoji,
      handlePopupClick,
      handlePopupReaction,
      isLegacyGroup,
      messageId,
      reactionsMap,
      renderTooltip,
    ]
  );

  const reactionContainer = (
    <StyledReactionContainer ref={reactionRef} inModal={inModal}>
      <StyledReaction
        showCount={showCount}
        selected={selected()}
        inModal={inModal}
        onClick={handleReactionClick}
        onMouseEnter={() => handlePopupReaction?.(emoji)}
      >
        <span
          role={'img'}
          aria-label={nativeEmojiData?.ariaLabels ? nativeEmojiData.ariaLabels[emoji] : undefined}
        >
          {emoji}
          {showCount && `\u00A0\u00A0${abbreviateNumber(count)}`}
        </span>
      </StyledReaction>
    </StyledReactionContainer>
  );

  return renderTooltip ? (
    <SessionTooltip
      horizontalPosition="right"
      debounceTimeout={50}
      content={content}
      maxContentWidth={'270px'}
    >
      {reactionContainer}
    </SessionTooltip>
  ) : (
    reactionContainer
  );
};
