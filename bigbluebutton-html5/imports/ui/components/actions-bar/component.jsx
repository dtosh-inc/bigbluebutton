import React, { PureComponent } from 'react';
import cx from 'classnames';
import { defineMessages } from 'react-intl';
import { makeCall } from '/imports/ui/services/api';
import Button from '/imports/ui/components/button/component';
import CaptionsButtonContainer from '/imports/ui/components/actions-bar/captions/container';
import withShortcutHelper from '/imports/ui/components/shortcut-help/service';
import { styles } from './styles.scss';
import ActionsDropdown from './actions-dropdown/container';
import ScreenshareButtonContainer from '/imports/ui/components/actions-bar/screenshare/container';
import AudioControlsContainer from '../audio/audio-controls/container';
import JoinVideoOptionsContainer from '../video-provider/video-button/container';
import PresentationOptionsContainer from './presentation-options/component';

const intlMessages = defineMessages({
  leaveSessionLabel: {
    id: 'app.navBar.settingsDropdown.leaveSessionLabel',
    description: 'Leave session button label',
  },
  leaveSessionDesc: {
    id: 'app.navBar.settingsDropdown.leaveSessionDesc',
    description: 'Describes leave session option',
  },
});

class ActionsBar extends PureComponent {
  render() {
    const {
      amIPresenter,
      amIModerator,
      enableVideo,
      isLayoutSwapped,
      toggleSwapLayout,
      handleTakePresenter,
      intl,
      isSharingVideo,
      hasScreenshare,
      stopExternalVideoShare,
      isCaptionsAvailable,
      isMeteorConnected,
      isPollingEnabled,
      isSelectRandomUserEnabled,
      isRaiseHandButtonEnabled,
      isPresentationDisabled,
      isThereCurrentPresentation,
      allowExternalVideo,
      setEmojiStatus,
      currentUser,
      shortcuts,
      layoutContextDispatch,
      sidebarNavigation,
      actionsBarStyle,
      isOldMinimizeButtonEnabled,
    } = this.props;

    const {
      allowLogout: allowLogoutSetting,
    } = Meteor.settings.public.app;

    // Set the logout code to 680 because it's not a real code and can be matched on the other side
    const LOGOUT_CODE = '680';

    const leaveSession = () => {
      makeCall('userLeftMeeting');
      // we don't check askForFeedbackOnLogout here,
      // it is checked in meeting-ended component
      Session.set('codeError', LOGOUT_CODE);
    };

    return (
      <div
        className={styles.actionsbar}
        style={
          {
            height: (actionsBarStyle.innerHeight + actionsBarStyle.padding * 2) || 'auto',
          }
        }
      >
        <div className={styles.left}>
          <ActionsDropdown {...{
            amIPresenter,
            amIModerator,
            isPollingEnabled,
            isSelectRandomUserEnabled,
            allowExternalVideo,
            handleTakePresenter,
            intl,
            isSharingVideo,
            stopExternalVideoShare,
            isMeteorConnected,
          }}
          />
          {isCaptionsAvailable
            ? (
              <CaptionsButtonContainer {...{ intl }} />
            )
            : null}
        </div>
        <div className={styles.center}>
          <AudioControlsContainer {...{ sidebarNavigation }} />
          {enableVideo
            ? (
              <JoinVideoOptionsContainer {...{ sidebarNavigation }} />
            )
            : null}
          <ScreenshareButtonContainer {...{
            amIPresenter,
            isMeteorConnected,
            sidebarNavigation,
          }}
          />
        </div>
        <div className={styles.right}>
          {!isOldMinimizeButtonEnabled ||
            (isOldMinimizeButtonEnabled && isLayoutSwapped && !isPresentationDisabled)
            ? (
              <PresentationOptionsContainer
                isLayoutSwapped={isLayoutSwapped}
                toggleSwapLayout={toggleSwapLayout}
                layoutContextDispatch={layoutContextDispatch}
                hasPresentation={isThereCurrentPresentation}
                hasExternalVideo={isSharingVideo}
                hasScreenshare={hasScreenshare}
              />
            )
            : null}
          {isRaiseHandButtonEnabled
            ? (
              <Button
                icon="hand"
                label={intl.formatMessage({
                  id: `app.actionsBar.emojiMenu.${
                    currentUser.emoji === 'raiseHand'
                      ? 'lowerHandLabel'
                      : 'raiseHandLabel'
                  }`,
                })}
                accessKey={shortcuts.raisehand}
                color={currentUser.emoji === 'raiseHand' ? 'primary' : 'dark'}
                data-test={currentUser.emoji === 'raiseHand' ? 'lowerHandLabel' : 'raiseHandLabel'}
                ghost={currentUser.emoji !== 'raiseHand'}
                className={cx(currentUser.emoji === 'raiseHand' || styles.btn)}
                hideLabel
                circle
                size="lg"
                onClick={() => {
                  setEmojiStatus(
                    currentUser.userId,
                    currentUser.emoji === 'raiseHand' ? 'none' : 'raiseHand',
                  );
                }}
              />
            )
            : null}
        </div>
        {(allowLogoutSetting && isMeteorConnected)
          ? (
            <Button
              className={styles.logout}
              icon="logout"
              data-test="logout"
              color="danger"
              circle
              size="lg"
              hideLabel
              label={intl.formatMessage(intlMessages.leaveSessionLabel)}
              // description={intl.formatMessage(intlMessages.leaveSessionDesc)}
              onClick={leaveSession}
            />
          )
          : null}
      </div>
    );
  }
}

export default withShortcutHelper(ActionsBar, ['raiseHand']);
