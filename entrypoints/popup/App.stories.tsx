import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import App from './App';

const meta: Meta<typeof App> = {
  component: App,
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof App>;

export const Default: Story = {};

export const WithSavedSettings: Story = {
  decorators: [
    (Story) => {
      // Override the chrome storage mock for this story
      const win = window as unknown as Record<string, unknown>;
      win['chrome'] = {
        ...(win['chrome'] as Record<string, unknown>),
        storage: {
          sync: {
            get: async () => ({ lang: 'pt-BR', rate: 1.5 }),
            set: async () => {},
          },
          session: {
            get: async () => ({}),
            set: async () => {},
          },
        },
      };
      return React.createElement(Story);
    },
  ],
};

export const BionicEnabled: Story = {
  decorators: [
    (Story) => {
      const win = window as unknown as Record<string, unknown>;
      win['chrome'] = {
        ...(win['chrome'] as Record<string, unknown>),
        storage: {
          sync: {
            get: async () => ({ bionicEnabled: true, bionicFixation: 0.4, lang: 'en-US', rate: 1.0 }),
            set: async () => {},
          },
          session: {
            get: async () => ({}),
            set: async () => {},
          },
        },
      };
      return React.createElement(Story);
    },
  ],
};
