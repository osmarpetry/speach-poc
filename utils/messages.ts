export type TTSState = 'idle' | 'speaking' | 'paused';

export type ExtensionMessage =
  | { type: 'TTS_SPEAK'; text: string }
  | { type: 'TTS_PAUSE' }
  | { type: 'TTS_RESUME' }
  | { type: 'TTS_STOP' }
  | { type: 'OPEN_READER'; html: string; url: string }
  | { type: 'TTS_STATE_UPDATE'; state: TTSState };

export function sendToBackground(message: ExtensionMessage): void {
  chrome.runtime.sendMessage(message);
}

export function sendToTab(tabId: number, message: ExtensionMessage): void {
  chrome.tabs.sendMessage(tabId, message);
}
