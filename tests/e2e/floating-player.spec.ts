import { test, expect } from './fixtures';

test('FloatingPlayer appears when text is selected', async ({ context }) => {
  const page = await context.newPage();
  await page.goto('https://example.com');

  // Select the heading text
  await page.evaluate(() => {
    const el = document.querySelector('h1');
    if (!el) throw new Error('No h1 found');
    const range = document.createRange();
    range.selectNodeContents(el);
    window.getSelection()!.removeAllRanges();
    window.getSelection()!.addRange(range);
    document.dispatchEvent(new Event('selectionchange'));
  });

  // The shadow DOM host should mount
  const host = page.locator('speach-floating-player');
  await expect(host).toBeAttached({ timeout: 5000 });
});

test('popup page loads and shows controls', async ({
  extensionId,
  context,
}) => {
  const page = await context.newPage();
  await page.goto(`chrome-extension://${extensionId}/popup.html`);
  await expect(
    page.getByRole('combobox', { name: /language/i }),
  ).toBeVisible();
  await expect(page.getByRole('slider', { name: /speed/i })).toBeVisible();
});

test('clicking Play in FloatingPlayer triggers TTS', async ({ context }) => {
  const page = await context.newPage();
  await page.goto('https://example.com');

  await page.evaluate(() => {
    const el = document.querySelector('h1');
    if (!el) throw new Error('No h1 found');
    const range = document.createRange();
    range.selectNodeContents(el);
    window.getSelection()!.removeAllRanges();
    window.getSelection()!.addRange(range);
    document.dispatchEvent(new Event('selectionchange'));
  });

  const host = page.locator('speach-floating-player');
  await expect(host).toBeAttached({ timeout: 5000 });

  // Click the Play button inside the shadow DOM
  const playBtn = page
    .locator('speach-floating-player')
    .locator('pierce/[aria-label="Play"]');
  await playBtn.click();

  // After clicking play, either Pause or Stop button should appear
  const pauseBtn = page
    .locator('speach-floating-player')
    .locator('pierce/[aria-label="Pause"]');
  const stopBtn = page
    .locator('speach-floating-player')
    .locator('pierce/[aria-label="Stop"]');

  await expect(pauseBtn.or(stopBtn)).toBeVisible({ timeout: 3000 });
});
