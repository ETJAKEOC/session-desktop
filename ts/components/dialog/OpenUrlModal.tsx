import { shell } from 'electron';
import { isEmpty } from 'lodash';
import { Dispatch } from 'react';
import { useDispatch } from 'react-redux';
import styled from 'styled-components';
import { MessageInteraction } from '../../interactions';
import { OpenUrlModalState, updateOpenUrlModal } from '../../state/ducks/modalDialog';
import { SessionWrapperModal } from '../SessionWrapperModal';
import { SessionButton, SessionButtonColor, SessionButtonType } from '../basic/SessionButton';
import { SpacerMD } from '../basic/Text';
import { I18nSubText } from '../basic/I18nSubText';
import { StyledModalDescriptionContainer } from './shared/ModalDescriptionContainer';

const StyledScrollDescriptionContainer = styled(StyledModalDescriptionContainer)`
  max-height: 110px;
  overflow-y: auto;
`;

export function OpenUrlModal(props: OpenUrlModalState) {
  const dispatch = useDispatch();

  if (!props || isEmpty(props) || !props.urlToOpen) {
    return null;
  }
  const url = props.urlToOpen;

  function onClose() {
    dispatch(updateOpenUrlModal(null));
  }

  function onClickOpen() {
    void shell.openExternal(url);
    onClose();
  }

  function onClickCopy() {
    MessageInteraction.copyBodyToClipboard(url);
    onClose();
  }

  return (
    <SessionWrapperModal
      title={window.i18n('urlOpen')}
      onClose={onClose}
      showExitIcon={true}
      showHeader={true}
    >
      <div className="session-modal__centered">
        <StyledScrollDescriptionContainer>
          <I18nSubText
            localizerProps={{ token: 'urlOpenDescription', asTag: 'span', args: { url } }}
            dataTestId="modal-description"
          />
        </StyledScrollDescriptionContainer>
      </div>
      <SpacerMD />
      <div className="session-modal__button-group">
        <SessionButton
          text={window.i18n('open')}
          buttonColor={SessionButtonColor.Danger}
          buttonType={SessionButtonType.Simple}
          onClick={onClickOpen}
          dataTestId="open-url-confirm-button"
        />
        <SessionButton
          text={window.i18n('urlCopy')}
          buttonType={SessionButtonType.Simple}
          onClick={onClickCopy}
          dataTestId="copy-url-button"
        />
      </div>
    </SessionWrapperModal>
  );
}

export const showLinkVisitWarningDialog = (urlToOpen: string, dispatch: Dispatch<any>) => {
  dispatch(
    updateOpenUrlModal({
      urlToOpen,
    })
  );
};
