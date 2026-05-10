'use strict';

/**
 * This machine hits `fetch failed` / TLS errors when Expo CLI contacts Expo/npm APIs.
 *
 * `--offline` / `EXPO_OFFLINE=1` skips networked doctor checks AND avoids downloading Expo Go
 * metadata/APKs. You must install Expo Go on the emulator/device once — sideload from another
 * browser or APK from https://expo.dev/go — then runs like `npm run android` work on LAN (`exp://`).
 *
 * Use `npm run android:online` (or unset `EXPO_OFFLINE`) when HTTPS to Expo works and you want
 * automatic Expo Go installs and version lookups.
 */

const path = require('path');
const { spawnSync } = require('child_process');

const root = path.join(__dirname, '..');
const expoCli = path.join(root, 'node_modules', 'expo', 'bin', 'cli');

process.env.EXPO_OFFLINE ??= '1';

const expoArgs = ['start', ...process.argv.slice(2)];
const result = spawnSync(process.execPath, [expoCli, ...expoArgs], {
  cwd: root,
  stdio: 'inherit',
  env: process.env,
});

process.exit(result.status === null ? 1 : result.status);
