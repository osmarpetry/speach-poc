import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  use: { headless: false },
  projects: [{ name: 'chromium', use: { channel: 'chromium' } }],
});
