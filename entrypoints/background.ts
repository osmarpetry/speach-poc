import { speak, pause, resume, stop } from '../utils/tts';
import { sendToTab } from '../utils/messages';
import type { ExtensionMessage, TTSState } from '../utils/messages';

export default defineBackground({
  type: 'module',
  main() {
    let activeTTSTabId: number | null = null;

    const broadcast = (state: TTSState) => {
      if (activeTTSTabId !== null) {
        sendToTab(activeTTSTabId, { type: 'TTS_STATE_UPDATE', state });
      }
    };

    chrome.runtime.onMessage.addListener(
      (message: ExtensionMessage, sender) => {
        const tabId = sender.tab?.id ?? null;

        void (async () => {
          switch (message.type) {
            case 'TTS_SPEAK': {
              activeTTSTabId = tabId;
              broadcast('speaking');
              const s = await chrome.storage.sync.get(['lang', 'rate']);
              await speak(
                message.text,
                {
                  lang: (s['lang'] as string | undefined) ?? 'en-US',
                  rate: (s['rate'] as number | undefined) ?? 1.0,
                },
                (evt) => {
                  if (
                    ['end', 'interrupted', 'cancelled', 'error'].includes(evt)
                  ) {
                    broadcast('idle');
                  } else if (evt === 'pause') {
                    broadcast('paused');
                  } else if (evt === 'resume') {
                    broadcast('speaking');
                  }
                },
              ).catch(() => broadcast('idle'));
              break;
            }
            case 'TTS_PAUSE':
              pause();
              broadcast('paused');
              break;
            case 'TTS_RESUME':
              resume();
              broadcast('speaking');
              break;
            case 'TTS_STOP':
              stop();
              broadcast('idle');
              activeTTSTabId = null;
              break;
            case 'OPEN_READER':
              await chrome.storage.session.set({
                readerArticle: {
                  html: message.html,
                  url: message.url,
                  sourceLang: message.sourceLang ?? 'en',
                  timestamp: Date.now(),
                },
              });
              await chrome.tabs.create({
                url: chrome.runtime.getURL('/reader.html'),
                active: true,
              });
              break;
            case 'TTS_STATE_UPDATE':
              // Background doesn't handle its own broadcast messages
              break;
          }
        })();

        return false;
      },
    );

    chrome.storage.onChanged.addListener((changes, area) => {
      if (area !== 'sync') return;
      if (!('lang' in changes) && !('rate' in changes)) return;
      if (activeTTSTabId !== null) {
        stop();
        broadcast('idle');
        activeTTSTabId = null;
      }
    });
  },
});
