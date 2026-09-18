/**
 * Clipboard helper — copy text to the device clipboard with a graceful
 * fallback for binaries that predate expo-clipboard (OTA-only installs
 * get the JS bundle without the native module; calling it throws).
 *
 * Callers branch on the boolean to show "copied" / "copy failed" feedback.
 */

import * as Clipboard from 'expo-clipboard';

export async function copyText(text: string): Promise<boolean> {
  try {
    // setStringAsync rejects when the native module is missing from an
    // old OTA binary — resolve false so callers can toast instead of crash.
    return await Clipboard.setStringAsync(text);
  } catch {
    return false;
  }
}
