import { useEffect, useState } from 'react';

const LANGUAGES = [
  { value: 'en-US', label: 'English (US)' },
  { value: 'pt-BR', label: 'Português (BR)' },
  { value: 'es-ES', label: 'Español (ES)' },
  { value: 'fr-FR', label: 'Français (FR)' },
  { value: 'de-DE', label: 'Deutsch (DE)' },
];

export default function App() {
  const [lang, setLang] = useState('en-US');
  const [rate, setRate] = useState(1.0);
  const [bionicEnabled, setBionicEnabled] = useState(false);
  const [bionicFixation, setBionicFixation] = useState(0.4);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    chrome.storage.sync
      .get(['lang', 'rate', 'bionicEnabled', 'bionicFixation'])
      .then((s) => {
        if (s['lang']) setLang(s['lang'] as string);
        if (s['rate']) setRate(s['rate'] as number);
        if (s['bionicEnabled'] !== undefined) setBionicEnabled(s['bionicEnabled'] as boolean);
        if (s['bionicFixation'] !== undefined) setBionicFixation(s['bionicFixation'] as number);
      });
  }, []);

  const handleSave = () => {
    chrome.storage.sync.set({ lang, rate, bionicEnabled, bionicFixation }).then(() => {
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    });
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Speach Settings</h2>

      <div style={styles.field}>
        <label htmlFor="lang-select" style={styles.label}>
          Language
        </label>
        <select
          id="lang-select"
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
      </div>

      <div style={styles.field}>
        <label htmlFor="rate-slider" style={styles.label}>
          Speed: {rate.toFixed(1)}x
        </label>
        <input
          id="rate-slider"
          type="range"
          min="0.5"
          max="3.0"
          step="0.1"
          value={rate}
          onChange={(e) => setRate(parseFloat(e.target.value))}
          style={styles.slider}
          aria-label="Speed"
        />
        <div style={styles.sliderLabels}>
          <span>0.5x</span>
          <span>3.0x</span>
        </div>
      </div>

      <div style={styles.field}>
        <label style={{ ...styles.label, ...styles.checkboxLabel }}>
          <input
            type="checkbox"
            checked={bionicEnabled}
            onChange={(e) => setBionicEnabled(e.target.checked)}
            aria-label="Bionic Reading"
          />
          Bionic Reading
        </label>
      </div>

      {bionicEnabled && (
        <div style={styles.field}>
          <label htmlFor="fixation-slider" style={styles.label}>
            Fixation: {bionicFixation.toFixed(1)}
          </label>
          <input
            id="fixation-slider"
            type="range"
            min="0.2"
            max="0.6"
            step="0.1"
            value={bionicFixation}
            onChange={(e) => setBionicFixation(parseFloat(e.target.value))}
            style={styles.slider}
            aria-label="Fixation"
          />
          <div style={styles.sliderLabels}>
            <span>0.2</span>
            <span>0.6</span>
          </div>
        </div>
      )}

      <button onClick={handleSave} style={styles.button}>
        {saved ? 'Saved!' : 'Save Settings'}
      </button>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: 260,
    padding: '16px',
    fontFamily: 'system-ui, sans-serif',
    fontSize: 14,
    color: '#1a1a1a',
  },
  title: {
    margin: '0 0 16px',
    fontSize: 16,
    fontWeight: 600,
  },
  field: {
    marginBottom: 16,
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  label: {
    fontWeight: 500,
    fontSize: 13,
  },
  select: {
    padding: '6px 8px',
    borderRadius: 6,
    border: '1px solid #ccc',
    fontSize: 13,
    cursor: 'pointer',
  },
  slider: {
    width: '100%',
    cursor: 'pointer',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    cursor: 'pointer',
  },
  sliderLabels: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: 11,
    color: '#666',
  },
  button: {
    width: '100%',
    padding: '8px',
    borderRadius: 6,
    border: 'none',
    background: '#6366f1',
    color: '#fff',
    fontWeight: 600,
    fontSize: 13,
    cursor: 'pointer',
  },
};
