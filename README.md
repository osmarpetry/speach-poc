# Speach — Speechify Clone Chrome Extension

A Chrome Extension POC that mimics Speechify: select any text on a webpage → a floating player appears → click Play → the browser reads it aloud. Includes a reader mode that extracts article content and reads the full page.

## Stack

| Layer | Technology |
|---|---|
| Extension framework | WXT (handles manifest, HMR, Shadow DOM helpers) |
| UI | React 18 + TypeScript (strict) |
| Article extraction | @mozilla/readability |
| TTS engine | `chrome.tts` (plays in background even when tab loses focus) |
| State transport | `chrome.storage.session` (reader content) + `chrome.storage.sync` (settings) |
| Unit tests | Vitest + React Testing Library |
| E2E tests | Playwright (persistent context with real extension) |
| Component explorer | Storybook 8 |

---

## Prerequisites

- **macOS / Linux / Windows** with a modern Chromium-based browser installed
- **Bun** ≥ 1.0 — install with:
  ```bash
  curl -fsSL https://bun.sh/install | bash
  ```
- **Node.js** ≥ 18 (only needed by a few Storybook internals — Bun handles the rest)

---

## Getting Started

### 1. Install dependencies

```bash
bun install
```

### 2. Development mode (hot-reload)

```bash
bun run dev
```

WXT starts Vite in watch mode and writes the extension to `.output/chrome-mv3/`.

### 3. Load the extension in Chrome

1. Open Chrome and navigate to `chrome://extensions`
2. Enable **Developer mode** (toggle in the top-right corner)
3. Click **Load unpacked**
4. Select the `.output/chrome-mv3` folder inside this project
5. The extension icon (🗣) appears in your toolbar

> **Note:** After every `bun run dev` rebuild, Chrome auto-reloads the extension. Refresh the tab you're testing on.

---

## Using the Extension

### Text-to-Speech on any webpage

1. Open any article (e.g. https://en.wikipedia.org/wiki/Artificial_intelligence)
2. Select some text with your mouse or keyboard
3. A floating dark player bar appears **above** the selection
4. Click **▶** to start reading
5. Click **⏸** to pause, click again to resume
6. Click **⏹** to stop

### Reader Mode

1. Select text or just be on any article page
2. Click the **📖** (Reader) button in the floating player
3. A new tab opens with the article cleaned up (no ads, no navigation)
4. Use the controls at the top of the reader page to play, pause, stop
5. Adjust language and speed in the reader controls or in the popup

### Popup Settings

1. Click the extension icon in the Chrome toolbar
2. Change **Language** (English, Português, Español, Français, Deutsch)
3. Adjust **Speed** (0.5x – 3.0x)
4. Click **Save Settings**
5. All future speech will use these settings

---

## Scripts Reference

| Command | Description |
|---|---|
| `bun run dev` | Start WXT in dev/watch mode |
| `bun run build` | Production build → `.output/chrome-mv3/` |
| `bun run typecheck` | TypeScript type check (no emit) |
| `bun run lint` | ESLint across all source files |
| `bun run lint:fix` | Auto-fix lint issues |
| `bun run test` | Run unit tests once (Vitest) |
| `bun run test:watch` | Unit tests in watch mode |
| `bun run test:e2e` | Playwright E2E tests (requires `bun run build` first) |
| `bun run storybook` | Launch Storybook at http://localhost:6006 |
| `bun run build-storybook` | Build Storybook static site |

---

## Running Tests

### Unit tests

```bash
bun run test
```

Runs ~26 tests across:
- `utils/readability.test.ts` — clone protection, null on unparseable HTML
- `utils/messages.test.ts` — discriminated union message sending
- `hooks/useTextSelection.test.ts` — selectionchange events
- `components/FloatingPlayer.test.tsx` — button states, message passing, preventDefault

### E2E tests (Playwright)

E2E tests load the **real built extension** into a real Chromium browser.

```bash
# Step 1: build the extension
bun run build

# Step 2: install Playwright browsers (first time only)
bunx playwright install chromium

# Step 3: run E2E tests
bun run test:e2e
```

> Extensions require **headed** mode — a browser window will open during tests.

### Storybook

```bash
bun run storybook
```

Open http://localhost:6006 to see:
- `FloatingPlayer` in Idle / Speaking / Paused / Hidden states
- `Popup App` with default and pre-saved settings

---

## Architecture Decisions

| Decision | Why |
|---|---|
| `chrome.tts` over `SpeechSynthesisUtterance` | Continues speaking when tab loses focus; runs in privileged process |
| `selectionchange` over `mouseup` | Works for keyboard selections (Shift+Arrow), not just mouse |
| `document.cloneNode(true)` before Readability | Readability mutates/removes DOM nodes — clone protects the live page |
| `chrome.storage.session` for reader content | In-memory, shared across extension contexts, auto-clears on browser restart |
| Shadow DOM for FloatingPlayer | Prevents host page CSS from breaking extension UI |
| `onMouseDown.preventDefault()` on player | Prevents button clicks from collapsing the text selection |
| Discriminated union message types | TypeScript enforces all cases are handled; catches typos at compile time |
| `enqueue: false` in chrome.tts.speak | New speak() always interrupts previous; prevents utterance queue buildup |

---

## Publishing to the Chrome Web Store

### Step 1 — Prepare a production build

```bash
bun run build
```

This creates `.output/chrome-mv3/`.

### Step 2 — Zip the extension

```bash
cd .output
zip -r speach-extension.zip chrome-mv3/
```

Or use WXT's built-in zip command:

```bash
bunx wxt zip
```

This produces `.output/speach-poc-1.0.0-chrome.zip`.

### Step 3 — Create a Chrome Web Store developer account

1. Go to the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
2. Sign in with your Google account
3. Pay the one-time **$5 registration fee**

### Step 4 — Create a new item

1. Click **New item**
2. Upload the `.zip` file from Step 2
3. Fill in the **Store listing**:
   - Name: `Speach — Text to Speech`
   - Description: explain what it does
   - Category: `Productivity`
   - Language: English
4. Upload **screenshots** (1280×800 or 640×400) showing:
   - The floating player over selected text
   - The reader mode tab
   - The popup settings

### Step 5 — Privacy & permissions justification

The extension requests these permissions — you must justify each in the submission form:

| Permission | Justification |
|---|---|
| `tts` | Required to call chrome.tts.speak() for text-to-speech |
| `storage` | Saves user language and speed preferences |
| `tabs` | Opens the reader tab when user clicks the Reader button |
| `activeTab` | Injects content script into the active tab |
| `host_permissions: <all_urls>` | Content script must run on all websites to detect text selection |

### Step 6 — Submit for review

1. Click **Submit for review**
2. Google reviews typically take **1–3 business days** for new extensions
3. You'll receive an email when approved or if changes are needed

### Step 7 — Updates

When you want to release a new version:

1. Bump the version in `package.json` and `wxt.config.ts`
2. Run `bun run build && bunx wxt zip`
3. Go to your item in the Developer Dashboard
4. Click **Package** → **Upload new package**
5. Submit for review

---

## Project Structure

```
speach-poc/
├── entrypoints/
│   ├── background.ts          ← Service worker: TTS engine + message router
│   ├── content.ts             ← Content script: mounts FloatingPlayer in Shadow DOM
│   ├── popup/                 ← Settings popup (lang + speed)
│   └── reader/                ← Reader mode tab
├── components/
│   └── FloatingPlayer.tsx     ← Floating TTS control bar
├── hooks/
│   └── useTextSelection.ts    ← Detects text selection via selectionchange
├── utils/
│   ├── messages.ts            ← Type-safe message passing (discriminated union)
│   ├── tts.ts                 ← chrome.tts wrapper
│   └── readability.ts         ← Article extraction (clone-safe)
├── tests/
│   ├── unit/                  ← Vitest + RTL tests
│   └── e2e/                   ← Playwright tests (real extension)
├── __mocks__/
│   └── chrome.ts              ← vi.fn() stubs for unit tests
└── .storybook/                ← Storybook config with chrome stubs
```
