import type { Preview } from '@storybook/react';

// Stub chrome so components that call sendToBackground don't throw
(window as Record<string, unknown>)['chrome'] = {
  runtime: {
    sendMessage: () => {},
    onMessage: {
      addListener: () => {},
      removeListener: () => {},
    },
    getURL: (path: string) => `chrome-extension://storybook-stub${path}`,
  },
  storage: {
    sync: { get: async () => ({}), set: async () => {} },
    session: { get: async () => ({}), set: async () => {} },
  },
  tts: {
    speak: () => {},
    pause: () => {},
    resume: () => {},
    stop: () => {},
  },
  tabs: {
    sendMessage: () => {},
    create: () => {},
  },
};

const preview: Preview = {
  parameters: {
    layout: 'centered',
  },
};

export default preview;
