# StreamHub TV Android APK

StreamHub is packaged as a native Android WebView app for Android TV and Android phones. The app ships its UI in `android/app/src/main/assets/streamhub/`; no PWA manifest or service worker is used.

## Build an installable debug APK

Requirements: JDK 17, Android SDK platform 35, and Gradle 8.9.

```sh
gradle -p android assembleDebug
```

The APK is written to `android/app/build/outputs/apk/debug/app-debug.apk`. It is debug-signed for testing/sideloading; it is not a Play Store release signature.

A GitHub Actions workflow builds this APK for the active branch and attaches it to the public **StreamHub TV Browser APK** GitHub release.

## Install

On Android, download and open the APK, then allow installation from the browser/file manager if Android asks. On Android TV, transfer the APK to the TV and sideload it. The app is fullscreen, landscape, supports D-pad navigation, and opens external streaming destinations in the browser when requested.
