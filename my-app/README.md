# Smart Crop Care — Mobile App

Expo (React Native) client for **Smart Crop Care and Direct Market Access** — a platform
that takes small and marginal farmers from crop diagnosis through to a profitable sale.

Primary users are Telugu-speaking farmers on basic Android phones with intermittent
connectivity, so every screen is built offline-first, in three languages (Telugu, English,
Hindi), with voice output as a first-class interaction path.

## Getting started

```bash
npm install
npx expo start
```

Open the app in a [development build](https://docs.expo.dev/develop/development-builds/introduction/)
or an Android emulator. Speech-to-text (§ Voice input) requires a development build — it is
not available in Expo Go.

## Project layout

```
src/
  app/            Expo Router screens (file-based routing)
  components/     Shared UI building blocks
  theme/          Design tokens (color, spacing, type scale)
  i18n/           i18next setup + te/en/hi resource files
  lib/
    api/          Typed API client + contract types + mock fallback data
    auth/         Secure token storage (expo-secure-store)
    storage/      SQLite-backed scan history + offline outbox
    network/      Connectivity detection
    speech/       Text-to-speech + speech-recognition capability check
    voice/        Keyword router for the voice assistant
  hooks/
```

## Configuration

Set the backend base URL via an environment variable when one is available:

```
EXPO_PUBLIC_API_BASE_URL=https://api.example.com
```

Without it, the app falls back to local mock data so every screen stays demoable offline.

## EAS builds

See `eas.json` for the `preview` (sideloadable APK) and `production` profiles.
