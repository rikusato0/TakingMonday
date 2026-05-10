/**
 * LD Player exposes both `127.0.0.1:<port>` and `emulator-<n>` adb entries. Expo's `@expo/cli`
 * resolves `emu avd name` for `emulator-*` ids (official QEMU console); LD Player does not
 * implement that console, breaking `npm run android`. Prefer `model:*` naming when emu fails.
 * Re-applied after installs via package.json postinstall (no npm extra deps required).
 */

const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');

/** @returns {string | null} */
function resolveAdbCliPath() {
  const nested = path.join(root, 'node_modules', 'expo', 'node_modules', '@expo', 'cli', 'build', 'src', 'start', 'platforms', 'android', 'adb.js');
  if (fs.existsSync(nested)) return nested;

  const flat = path.join(root, 'node_modules', '@expo', 'cli', 'build', 'src', 'start', 'platforms', 'android', 'adb.js');
  if (fs.existsSync(flat)) return flat;

  return null;
}

const PATCH_MARKER =
  'Third-party Android emulators (e.g. LD Player) advertise an `emulator-*` id';

const OLD =
  '        } else {\n' +
  '            // Given an emulator pid, get the emulator name which can be used to start the emulator later.\n' +
  '            name = await getAdbNameForDeviceIdAsync({\n' +
  '                pid\n' +
  '            }) ?? \'\';\n' +
  '        }';

const PATCHED =
  '        } else {\n' +
  '            // Third-party Android emulators (e.g. LD Player) advertise an `emulator-*` id but do not expose\n' +
  '            // the official QEMU console used by `emu avd name`; fall back to `model:*` like physical devices.\n' +
  '            try {\n' +
  '                name = await getAdbNameForDeviceIdAsync({\n' +
  '                    pid\n' +
  '                }) ?? \'\';\n' +
  '            } catch  {\n' +
  '                const modelItem = deviceInfo.find((info)=>info.includes(\'model:\'));\n' +
  '                name = modelItem ? modelItem.replace(\'model:\', \'\') : `Emulator ${pid}`;\n' +
  '            }\n' +
  '        }';

function main() {
  const adbPath = resolveAdbCliPath();
  if (!adbPath) {
    console.warn(
      '[patch-expo-cli-ldplayer] @expo/cli adb.js not found; skip (run after npm install if using Expo)'
    );
    return;
  }

  let text = fs.readFileSync(adbPath, 'utf8');
  if (text.includes(PATCH_MARKER)) {
    return;
  }

  if (!text.includes(OLD)) {
    console.warn(
      '[patch-expo-cli-ldplayer] @expo/cli adb.js differs from expected; manual check after upgrading Expo:',
      adbPath
    );
    return;
  }

  text = text.replace(OLD, PATCHED);
  fs.writeFileSync(adbPath, text, 'utf8');
  console.log('[patch-expo-cli-ldplayer] Patched Expo CLI adb device naming for LD Player.');
}

main();
