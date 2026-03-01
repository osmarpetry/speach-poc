import React from 'react';
import ReactDOM from 'react-dom/client';
import { FloatingPlayer } from '../components/FloatingPlayer';
import { sendToBackground } from '../utils/messages';
import { applyBionicReading, revertBionicReading } from '../utils/bionic';

export default defineContentScript({
  matches: ['<all_urls>'],
  cssInjectionMode: 'ui',
  async main(ctx) {
    const stored = await chrome.storage.sync.get(['bionicEnabled', 'bionicFixation']);
    let currentBionicEnabled = (stored['bionicEnabled'] as boolean) ?? false;
    let currentFixation = (stored['bionicFixation'] as number) ?? 0.4;

    if (currentBionicEnabled) {
      applyBionicReading(document.body, currentFixation);
    }

    const storageListener = (
      changes: Record<string, chrome.storage.StorageChange>,
      area: string,
    ) => {
      if (area !== 'sync') return;
      if (!('bionicEnabled' in changes) && !('bionicFixation' in changes)) return;
      if ('bionicEnabled' in changes) currentBionicEnabled = changes['bionicEnabled']!.newValue as boolean;
      if ('bionicFixation' in changes) currentFixation = changes['bionicFixation']!.newValue as number;
      if (currentBionicEnabled) {
        applyBionicReading(document.body, currentFixation);
      } else {
        revertBionicReading(document.body);
      }
    };

    chrome.storage.onChanged.addListener(storageListener);

    const ui = await createShadowRootUi(ctx, {
      name: 'speach-floating-player',
      position: 'overlay',
      anchor: 'body',
      onMount(container) {
        const root = ReactDOM.createRoot(container);
        root.render(
          React.createElement(FloatingPlayer, { onOpenReader: handleOpenReader }),
        );
        return root;
      },
      onRemove(root) {
        chrome.storage.onChanged.removeListener(storageListener);
        root?.unmount();
      },
    });

    ui.mount();

    function handleOpenReader() {
      const selectionText = window.getSelection()?.toString() ?? '';
      sendToBackground({
        type: 'OPEN_READER',
        html: `<p>${selectionText}</p>`,
        url: window.location.href,
        sourceLang: document.documentElement.lang || 'en',
      });
    }
  },
});
