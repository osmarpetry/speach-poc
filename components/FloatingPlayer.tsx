import { useEffect, useState } from 'react';
import { useTextSelection } from '../hooks/useTextSelection';
import { sendToBackground } from '../utils/messages';
import type { TTSState } from '../utils/messages';

interface FloatingPlayerProps {
  onOpenReader: () => void;
  // Props for Storybook / testing — override internal state when provided
  ttsState?: TTSState;
  isActive?: boolean;
  text?: string;
}

export function FloatingPlayer({
  onOpenReader,
  ttsState: ttsStateProp,
  isActive: isActiveProp,
  text: textProp,
}: FloatingPlayerProps) {
  const selection = useTextSelection();
  const [ttsState, setTtsState] = useState<TTSState>(ttsStateProp ?? 'idle');

  // Allow prop to override internal state (for stories/tests)
  const isActive = isActiveProp !== undefined ? isActiveProp : selection.isActive;
  const text = textProp !== undefined ? textProp : selection.text;
  const rect = selection.rect;

  useEffect(() => {
    if (ttsStateProp !== undefined) setTtsState(ttsStateProp);
  }, [ttsStateProp]);

  useEffect(() => {
    if (typeof chrome === 'undefined') return;
    const listener = (message: unknown) => {
      const msg = message as { type: string; state?: TTSState };
      if (msg.type === 'TTS_STATE_UPDATE' && msg.state) {
        setTtsState(msg.state);
      }
    };
    chrome.runtime.onMessage.addListener(listener);
    return () => chrome.runtime.onMessage.removeListener(listener);
  }, []);

  // Reset state to idle when selection goes away
  useEffect(() => {
    if (!isActive) setTtsState('idle');
  }, [isActive]);

  if (!isActive) return null;

  const positionStyle: React.CSSProperties = rect
    ? {
        position: 'fixed',
        top: rect.top - 48 - 8,
        left: rect.left + rect.width / 2,
        transform: 'translateX(-50%)',
        zIndex: 2147483647,
      }
    : {
        position: 'fixed',
        top: 20,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 2147483647,
      };

  const handlePlay = () => {
    setTtsState('speaking');
    sendToBackground({ type: 'TTS_SPEAK', text });
  };

  const handlePause = () => {
    sendToBackground({ type: 'TTS_PAUSE' });
  };

  const handleResume = () => {
    sendToBackground({ type: 'TTS_RESUME' });
  };

  const handleStop = () => {
    setTtsState('idle');
    sendToBackground({ type: 'TTS_STOP' });
  };

  const handleReader = () => {
    onOpenReader();
  };

  return (
    <div style={{ ...positionStyle, ...styles.player }}>
      {ttsState === 'idle' && (
        <button
          aria-label="Play"
          style={styles.btn}
          onMouseDown={(e) => e.preventDefault()}
          onClick={handlePlay}
        >
          ▶
        </button>
      )}
      {ttsState === 'speaking' && (
        <button
          aria-label="Pause"
          style={styles.btn}
          onMouseDown={(e) => e.preventDefault()}
          onClick={handlePause}
        >
          ⏸
        </button>
      )}
      {ttsState === 'paused' && (
        <button
          aria-label="Resume"
          style={styles.btn}
          onMouseDown={(e) => e.preventDefault()}
          onClick={handleResume}
        >
          ▶
        </button>
      )}
      {ttsState !== 'idle' && (
        <button
          aria-label="Stop"
          style={styles.btn}
          onMouseDown={(e) => e.preventDefault()}
          onClick={handleStop}
        >
          ⏹
        </button>
      )}
      <button
        aria-label="Open Reader"
        style={{ ...styles.btn, ...styles.readerBtn }}
        onMouseDown={(e) => e.preventDefault()}
        onClick={handleReader}
      >
        📖
      </button>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  player: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    background: '#1a1a1a',
    borderRadius: 8,
    padding: '6px 8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
    userSelect: 'none',
  },
  btn: {
    background: 'transparent',
    border: 'none',
    color: '#fff',
    fontSize: 16,
    cursor: 'pointer',
    padding: '4px 6px',
    borderRadius: 4,
    lineHeight: 1,
    transition: 'background 0.15s',
  },
  readerBtn: {
    marginLeft: 4,
    borderLeft: '1px solid #444',
    paddingLeft: 10,
  },
};
