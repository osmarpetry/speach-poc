import { describe, it, expect, vi, beforeEach } from 'vitest';
import { sendToBackground, sendToTab } from '../../../utils/messages';
import type { ExtensionMessage } from '../../../utils/messages';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('sendToBackground', () => {
  it('calls chrome.runtime.sendMessage with correct TTS_SPEAK payload', () => {
    const message: ExtensionMessage = { type: 'TTS_SPEAK', text: 'Hello world' };
    sendToBackground(message);
    expect(chrome.runtime.sendMessage).toHaveBeenCalledWith(message);
  });

  it('calls chrome.runtime.sendMessage with TTS_PAUSE', () => {
    sendToBackground({ type: 'TTS_PAUSE' });
    expect(chrome.runtime.sendMessage).toHaveBeenCalledWith({ type: 'TTS_PAUSE' });
  });

  it('calls chrome.runtime.sendMessage with TTS_RESUME', () => {
    sendToBackground({ type: 'TTS_RESUME' });
    expect(chrome.runtime.sendMessage).toHaveBeenCalledWith({ type: 'TTS_RESUME' });
  });

  it('calls chrome.runtime.sendMessage with TTS_STOP', () => {
    sendToBackground({ type: 'TTS_STOP' });
    expect(chrome.runtime.sendMessage).toHaveBeenCalledWith({ type: 'TTS_STOP' });
  });

  it('calls chrome.runtime.sendMessage with OPEN_READER payload', () => {
    const message: ExtensionMessage = {
      type: 'OPEN_READER',
      html: '<p>content</p>',
      url: 'https://example.com',
    };
    sendToBackground(message);
    expect(chrome.runtime.sendMessage).toHaveBeenCalledWith(message);
  });
});

describe('sendToTab', () => {
  it('calls chrome.tabs.sendMessage with tabId and message', () => {
    const message: ExtensionMessage = { type: 'TTS_STATE_UPDATE', state: 'speaking' };
    sendToTab(42, message);
    expect(chrome.tabs.sendMessage).toHaveBeenCalledWith(42, message);
  });
});
