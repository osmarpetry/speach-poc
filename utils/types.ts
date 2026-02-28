export interface TTSOptions {
  lang?: string;
  rate?: number;
}

export type TTSEventType = chrome.tts.TtsEvent['type'];

export type TTSEventCallback = (eventType: TTSEventType, charIndex?: number) => void;
