import { describe, it, expect, vi, beforeEach } from 'vitest';

// expo-clipboard ships JS that imports react-native internals — in the node
// test environment the real module would crash on import, so it is mocked.
vi.mock('expo-clipboard', () => ({
  setStringAsync: vi.fn(),
}));

import * as Clipboard from 'expo-clipboard';
import { copyText } from '../clipboard';

describe('copyText', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('resolves true when the clipboard accepts the text', async () => {
    vi.mocked(Clipboard.setStringAsync).mockResolvedValue(true);

    await expect(copyText('GOB-123456')).resolves.toBe(true);
    expect(Clipboard.setStringAsync).toHaveBeenCalledWith('GOB-123456');
  });

  it('resolves false when the native module throws (old OTA binary without expo-clipboard)', async () => {
    vi.mocked(Clipboard.setStringAsync).mockRejectedValue(
      new Error('The native module is missing from this binary'),
    );

    await expect(copyText('GOB-123456')).resolves.toBe(false);
  });

  it('resolves false when setStringAsync reports failure', async () => {
    vi.mocked(Clipboard.setStringAsync).mockResolvedValue(false);

    await expect(copyText('GOB-123456')).resolves.toBe(false);
  });
});
