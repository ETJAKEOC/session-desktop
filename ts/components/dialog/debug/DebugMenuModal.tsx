import { AnimatePresence } from 'framer-motion';
import styled from 'styled-components';
import { useDispatch } from 'react-redux';
import useUpdate from 'react-use/lib/useUpdate';
import { Flex } from '../../basic/Flex';
import { SpacerMD, SpacerSM } from '../../basic/Text';
import { updateDebugMenuModal } from '../../../state/ducks/modalDialog';
import { AboutInfo, DataGenerationActions, DebugActions, OtherInfo } from './components';
import { SessionWrapperModal2 } from '../../SessionWrapperModal2';
import { FeatureFlags } from './FeatureFlags';
import { ReleaseChannel } from './ReleaseChannel';

const StyledContent = styled(Flex)`
  padding-inline: var(--margins-sm);

  h2 {
    font-size: var(--font-size-xl);
  }

  h2,
  h3 {
    margin: var(--margins-md) 0;
    padding: 0;
    text-decoration: underline;
  }

  p,
  i {
    line-height: 1.4;
    margin: 0;
    padding: 0;
    text-align: start;
  }
`;

export function DebugMenuModal() {
  const dispatch = useDispatch();

  // NOTE we use forceUpdate here and pass it through so the entire modal refreshes when a flag is toggled
  const forceUpdate = useUpdate();

  const onClose = () => {
    dispatch(updateDebugMenuModal(null));
  };

  return (
    <AnimatePresence>
      <SessionWrapperModal2
        title={'Debug Menu'}
        onClose={onClose}
        showExitIcon={true}
        contentBorder={false}
        contentWidth={'75%'}
        shouldOverflow={true}
        allowOutsideClick={false}
      >
        <StyledContent
          $container={true}
          $flexDirection="column"
          $alignItems="flex-start"
          padding="var(--margins-sm) 0"
        >
          <DebugActions />
          <SpacerSM />
          <DataGenerationActions />
          <SpacerSM />
          <FeatureFlags flags={window.sessionFeatureFlags} forceUpdate={forceUpdate} />
          <SpacerSM />
          <ReleaseChannel />
          <SpacerSM />
          <AboutInfo />
          <OtherInfo />
          <SpacerMD />
        </StyledContent>
      </SessionWrapperModal2>
    </AnimatePresence>
  );
}
