# Changelog

## v1.2.0-beta4 - 2022-06-16
- Updated electron to version 19 and other dependencies
- Update xCloud Regions in settings #140
- Added support for Apple Silicon #139

## v1.2.0-beta3 - 2022-05-06
- Update dependencies
- Improve bitrate and enable streaming of Xbox 360 games (credits to `award` on the OpenXbox discord)
- Added an overview of connected gamepads on the settings page
- Added button in streaming view to send the Nexus button press for gamepads that do not support the Xbox button

## v1.2.0-beta2 - 2022-02-05
- Rebuild branch from main and started over
- Updated lots of dependencies to latest version
- Updated xbox-xcloud-player to 1.2.0 with support for channel control v2. Should improve reliability of controls
- Fixed homestreaming only login
- Added experimental region switcher in settings

## v1.2.0-beta1 - 2021-11-19
- Updated lots of dependencies to latest version
- Changed the login flow of the application and removed the popup

## v1.1.0 - 2021-10-15
- Added link to MS Flight Simulator wiki page
- Enable Dialog support only in stream configuration
- Enable menu bar on windows to access plugin controls

## v1.1.0-beta4 - 2021-10-09
- Added a update notifier for new updates
- Added keyboard controls for right trigger, left trigger, view and menu button
- Open a popup for authentication for quicker access
- WebUI (beta) stream now opens in full screen
- Fixed modal ui not sending the correct response

## v1.1.0-beta3 - 2021-09-24
- Added support for Opentrack
- Added an option to expose a WebUI to start streams on other devices 

## v1.1.0-beta2 - 2021-09-17
- Implemented xbox-xcloud-player for improved rendering performance
- Improved gamepad responsiveness
- Updated xCloud UI with a better looking library

## v1.1.0-beta1 - 2021-09-14
- xCloud support!
- Cleanup stream timers and intervals when disconnecting from a stream
- Fixed left and right audio channels #30 (Fix credits: @tuxuser)

## v1.0.3 -  2021-09-07
- Add AppImage format for Linux

## v1.0.2 -  2021-08-25
- Improved feedback for connection errors
- Added experimental bitrate control in the debug menu while streaming

## v1.0.1 -  2021-08-03
- Bump dependencies to newer versions
- Fixed an error when logging in using a dev build

## v1.0.0 -  2021-07-30
- First public release