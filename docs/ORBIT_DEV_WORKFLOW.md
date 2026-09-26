# Orbit + Dev-Client Workflow

> Added 2026-09-26. Expo Orbit (https://github.com/expo/orbit/releases) is
> the desktop launchpad for development builds — installs builds onto
> emulators/devices, opens deep links, and captures snapshots to
> reproduce bugs.

## Why this exists

Several native modules don't run in Expo Go: react-native-webrtc (video
rooms), reanimated/worklets, lottie, camera. Dev-client builds carry the
full native runtime + the dev launcher, so those features test on-device
without waiting for release builds.

## One-time setup

1. Install Orbit (macOS or Windows) from the releases page.
2. Build the dev client (first time, and after any native dependency
   change):

   ```bash
   cd apps/mobile
   eas build --profile development --platform android   # or ios
   ```

   (iOS simulator builds still require a Mac; Android emulator/device
   works from Windows.)

3. In Orbit, pick the device/emulator → it lists your EAS builds →
   install the `development` build.

## Daily loop

- `pnpm --filter @galaxy/mobile dev` starts Metro (port 8083).
- Launch the installed dev client; it connects to Metro — fast refresh
  works with native modules.
- Deep links: Orbit's URL field, e.g.
  `/customer/bookings/create?beautyBundleId=1`, `/bundles/1`,
  `/customer/video/<bookingId>`.
- Bug repro: capture an Orbit snapshot of the screen/state and share it.

## Notes

- The `development` profile points at the production API URL, same as
  `preview`. To test against a local API, rebuild with
  `EXPO_PUBLIC_API_URL` overridden (Android emulator: `10.0.2.2`, physical
  device: your LAN IP) — see LOCAL_TESTING_GUIDE.md for the server setup.
- OTA updates (EAS Update) still flow to dev-client builds; a native
  rebuild is only needed when native deps or `app.json` change.
