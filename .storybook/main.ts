import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: [
    '../components/**/*.stories.tsx',
    '../entrypoints/**/*.stories.tsx',
  ],
  framework: { name: '@storybook/react-vite', options: {} },
};

export default config;
