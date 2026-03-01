import { useEffect, useState } from 'react';
import { sendToBackground } from '../../utils/messages';
import { translate } from '../../utils/translate';
import type { TTSState } from '../../utils/messages';

interface ReaderArticle {
  html: string;
  url: string;
  sourceLang?: string;
  timestamp: number;
}

const LANGUAGES = [
  { value: 'en-US', label: 'English (US)' },
  { value: 'pt-BR', label: 'Português (BR)' },
  { value: 'es-ES', label: 'Español (ES)' },
  { value: 'fr-FR', label: 'Français (FR)' },
  { value: 'de-DE', label: 'Deutsch (DE)' },
];

export default function App() {
  const [article, setArticle] = useState<ReaderArticle | null>(null);
  const [ttsState, setTtsState] = useState<TTSState>('idle');
  const [lang, setLang] = useState('en-US');
  const [rate, setRate] = useState(1.0);
  const [loading, setLoading] = useState(true);
  const [sourceLang, setSourceLang] = useState('en');
  const [translating, setTranslating] = useState(false);

  useEffect(() => {
    chrome.storage.session.get(['readerArticle']).then((s) => {
      const data = s['readerArticle'] as ReaderArticle | undefined;
      if (data) {
        setArticle(data);
        setSourceLang(data.sourceLang ?? 'en');
      }
      setLoading(false);
    });

    chrome.storage.sync.get(['lang', 'rate']).then((s) => {
      if (s['lang']) setLang(s['lang'] as string);
      if (s['rate']) setRate(s['rate'] as number);
    });

    const messageListener = (message: unknown) => {
      const msg = message as { type: string; state?: TTSState };
      if (msg.type === 'TTS_STATE_UPDATE' && msg.state) {
        setTtsState(msg.state);
      }
    };
    chrome.runtime.onMessage.addListener(messageListener);

    const storageListener = (changes: Record<string, chrome.storage.StorageChange>, area: string) => {
      if (area !== 'sync') return;
      if (changes['lang']) setLang(changes['lang'].newValue as string);
      if (changes['rate']) setRate(changes['rate'].newValue as number);
      if (changes['lang'] ?? changes['rate']) setTtsState('idle');
    };
    chrome.storage.onChanged.addListener(storageListener);

    return () => {
      chrome.runtime.onMessage.removeListener(messageListener);
      chrome.storage.onChanged.removeListener(storageListener);
    };
  }, []);

  const handlePlay = () => {
    if (!article) return;
    const textContent = new DOMParser()
      .parseFromString(article.html, 'text/html')
      .body.textContent ?? '';
    chrome.storage.sync.set({ lang, rate }).then(() => {
      sendToBackground({ type: 'TTS_SPEAK', text: textContent });
    });
  };

  const handlePause = () => sendToBackground({ type: 'TTS_PAUSE' });
  const handleResume = () => sendToBackground({ type: 'TTS_RESUME' });
  const handleStop = () => {
    setTtsState('idle');
    sendToBackground({ type: 'TTS_STOP' });
  };

  const handleParagraphClick = async (e: React.MouseEvent<HTMLElement>) => {
    const target = e.target as HTMLElement;
    const para = target.closest('p, h1, h2, h3, h4, h5, h6, li');
    if (!para || translating) return;
    const text = para.textContent?.trim() ?? '';
    if (!text) return;
    setTranslating(true);
    try {
      const translated = await translate(text, sourceLang, lang);
      sendToBackground({ type: 'TTS_SPEAK', text: translated });
    } catch {
      // silently fail
    } finally {
      setTranslating(false);
    }
  };

  if (loading) {
    return <div style={styles.loading}>Loading article…</div>;
  }

  if (!article) {
    return (
      <div style={styles.loading}>
        No article found. Please use the Reader button on a webpage.
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.controls}>
        <div style={styles.controlsInner}>
          {ttsState === 'idle' && (
            <button aria-label="Play" style={styles.btn} onClick={handlePlay}>
              ▶ Play
            </button>
          )}
          {ttsState === 'speaking' && (
            <button aria-label="Pause" style={styles.btn} onClick={handlePause}>
              ⏸ Pause
            </button>
          )}
          {ttsState === 'paused' && (
            <button aria-label="Resume" style={styles.btn} onClick={handleResume}>
              ▶ Resume
            </button>
          )}
          {ttsState !== 'idle' && (
            <button aria-label="Stop" style={styles.stopBtn} onClick={handleStop}>
              ⏹ Stop
            </button>
          )}

          <label htmlFor="reader-lang" style={styles.label}>
            Lang
          </label>
          <select
            id="reader-lang"
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            style={styles.select}
          >
            {LANGUAGES.map((l) => (
              <option key={l.value} value={l.value}>
                {l.label}
              </option>
            ))}
          </select>

          <label htmlFor="reader-rate" style={styles.label}>
            {rate.toFixed(1)}x
          </label>
          <input
            id="reader-rate"
            type="range"
            min="0.5"
            max="3.0"
            step="0.1"
            value={rate}
            onChange={(e) => setRate(parseFloat(e.target.value))}
            aria-label="Speed"
            style={styles.slider}
          />

          {translating && <span style={styles.label}>Translating…</span>}

          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            style={styles.sourceLink}
          >
            Original ↗
          </a>
        </div>
      </div>

      <article
        style={{ ...styles.article, cursor: translating ? 'wait' : 'pointer' }}
        dangerouslySetInnerHTML={{ __html: article.html }}
        onClick={handleParagraphClick}
      />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    background: '#fafaf9',
    minHeight: '100vh',
    fontFamily: 'Georgia, serif',
  },
  loading: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    fontFamily: 'system-ui, sans-serif',
    color: '#666',
  },
  controls: {
    position: 'sticky',
    top: 0,
    background: '#1a1a1a',
    color: '#fff',
    zIndex: 100,
    padding: '10px 16px',
  },
  controlsInner: {
    maxWidth: 680,
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  btn: {
    padding: '6px 14px',
    borderRadius: 6,
    border: 'none',
    background: '#6366f1',
    color: '#fff',
    fontWeight: 600,
    fontSize: 13,
    cursor: 'pointer',
  },
  stopBtn: {
    padding: '6px 14px',
    borderRadius: 6,
    border: 'none',
    background: '#444',
    color: '#fff',
    fontWeight: 600,
    fontSize: 13,
    cursor: 'pointer',
  },
  label: {
    fontSize: 12,
    color: '#aaa',
  },
  select: {
    padding: '4px 8px',
    borderRadius: 4,
    border: '1px solid #444',
    background: '#333',
    color: '#fff',
    fontSize: 12,
    cursor: 'pointer',
  },
  slider: {
    cursor: 'pointer',
    width: 80,
  },
  sourceLink: {
    marginLeft: 'auto',
    color: '#aaa',
    fontSize: 12,
    textDecoration: 'none',
  },
  article: {
    maxWidth: 680,
    margin: '40px auto',
    padding: '0 24px 80px',
    lineHeight: 1.8,
    fontSize: 18,
    color: '#1a1a1a',
  },
};
