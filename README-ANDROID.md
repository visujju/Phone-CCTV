# StreamHub TV Android app

StreamHub is shipped as a native Android APK with its launcher UI bundled inside the app. It is not a PWA: there is no web app manifest or service worker.

The Android app uses a fullscreen WebView for the launcher and opens a selected streaming destination directly in that WebView. TV remote D-pad keys are mapped to launcher navigation, the Back key returns through site history to the home screen, and an auto-hiding native toolbar provides Back, Reload, and Open in browser controls.

## APK build

A push to the active Arena branch runs `.github/workflows/android-apk.yml`. The workflow builds a debug-signed APK and publishes it to the public GitHub release named **StreamHub TV Browser APK 1.0.1**.

The APK is intended for Android/Android TV sideload testing. It is not signed for Google Play distribution.

## Local build

Requirements: JDK 17, Android SDK platform 35, and Gradle 8.9.

```sh
gradle -p android assembleDebug
```

Output: `android/app/build/outputs/apk/debug/app-debug.apk`.
