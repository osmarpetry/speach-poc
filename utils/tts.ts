import type { TTSEventCallback, TTSOptions } from './types';

export async function speak(
  text: string,
  options: TTSOptions = {},
  onEvent?: TTSEventCallback,
): Promise<void> {
  return new Promise((resolve, reject) => {
    chrome.tts.speak(text, {
      lang: options.lang ?? 'en-US',
      rate: options.rate ?? 1.0,
      enqueue: false,
      onEvent: (event) => {
        onEvent?.(event.type, event.charIndex);
        if (event.type === 'start') resolve();
        if (event.type === 'error') reject(new Error(event.errorMessage));
      },
    });
  });
}

export const pause = (): void => chrome.tts.pause();
export const resume = (): void => chrome.tts.resume();
export const stop = (): void => chrome.tts.stop();
