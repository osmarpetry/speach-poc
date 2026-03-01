import type { Meta, StoryObj } from '@storybook/react';
import { FloatingPlayer } from './FloatingPlayer';

const meta: Meta<typeof FloatingPlayer> = {
  component: FloatingPlayer,
  args: { onOpenReader: () => {} },
};

export default meta;
type Story = StoryObj<typeof FloatingPlayer>;

export const Idle: Story = {
  args: { ttsState: 'idle', isActive: true, text: 'Hello world' },
};

export const Speaking: Story = {
  args: { ttsState: 'speaking', isActive: true, text: 'Hello world' },
};

export const Paused: Story = {
  args: { ttsState: 'paused', isActive: true, text: 'Hello world' },
};

export const Hidden: Story = {
  args: { isActive: false },
};

export const SpeakingWithPreview: Story = {
  args: {
    ttsState: 'speaking',
    isActive: true,
    text: 'The quick brown fox jumps over the lazy dog near the river bank',
  },
};
