import React from 'react';
import ReactDOM from 'react-dom/client';
import { FloatingPlayer } from '../components/FloatingPlayer';
import { extractReadableContent } from '../utils/readability';
import { sendToBackground } from '../utils/messages';

export default defineContentScript({
  matches: ['<all_urls>'],
  cssInjectionMode: 'ui',
  async main(ctx) {
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
        root?.unmount();
      },
    });

    ui.mount();

    function handleOpenReader() {
      const article = extractReadableContent(document, window.location.href);
      sendToBackground({
        type: 'OPEN_READER',
        html:
          article?.content ??
          `<p>${window.getSelection()?.toString() ?? ''}</p>`,
        url: window.location.href,
      });
    }
  },
});
