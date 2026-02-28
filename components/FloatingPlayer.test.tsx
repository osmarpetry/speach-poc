import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { FloatingPlayer } from './FloatingPlayer';

// Stub useTextSelection so FloatingPlayer renders in controlled state
vi.mock('../hooks/useTextSelection', () => ({
  useTextSelection: vi.fn(() => ({
    text: '',
    rect: null,
    isActive: false,
  })),
}));

const mockOnOpenReader = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
});

describe('FloatingPlayer', () => {
  it('renders nothing when isActive=false', () => {
    render(
      <FloatingPlayer onOpenReader={mockOnOpenReader} isActive={false} />,
    );
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('shows Play button when isActive=true and state is idle', () => {
    render(
      <FloatingPlayer
        onOpenReader={mockOnOpenReader}
        isActive={true}
        text="hello"
        ttsState="idle"
      />,
    );
    expect(screen.getByRole('button', { name: /play/i })).toBeInTheDocument();
  });

  it('shows Open Reader button when isActive=true', () => {
    render(
      <FloatingPlayer
        onOpenReader={mockOnOpenReader}
        isActive={true}
        text="hello"
        ttsState="idle"
      />,
    );
    expect(
      screen.getByRole('button', { name: /open reader/i }),
    ).toBeInTheDocument();
  });

  it('clicking Play sends TTS_SPEAK message with text', () => {
    render(
      <FloatingPlayer
        onOpenReader={mockOnOpenReader}
        isActive={true}
        text="hello"
        ttsState="idle"
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /play/i }));
    expect(chrome.runtime.sendMessage).toHaveBeenCalledWith({
      type: 'TTS_SPEAK',
      text: 'hello',
    });
  });

  it('shows Pause button when ttsState=speaking', () => {
    render(
      <FloatingPlayer
        onOpenReader={mockOnOpenReader}
        isActive={true}
        text="hello"
        ttsState="speaking"
      />,
    );
    expect(
      screen.getByRole('button', { name: /pause/i }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^play$/i })).toBeNull();
  });

  it('clicking Pause sends TTS_PAUSE message', () => {
    render(
      <FloatingPlayer
        onOpenReader={mockOnOpenReader}
        isActive={true}
        text="hello"
        ttsState="speaking"
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /pause/i }));
    expect(chrome.runtime.sendMessage).toHaveBeenCalledWith({
      type: 'TTS_PAUSE',
    });
  });

  it('clicking Stop sends TTS_STOP message', () => {
    render(
      <FloatingPlayer
        onOpenReader={mockOnOpenReader}
        isActive={true}
        text="hello"
        ttsState="speaking"
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /stop/i }));
    expect(chrome.runtime.sendMessage).toHaveBeenCalledWith({
      type: 'TTS_STOP',
    });
  });

  it('clicking Open Reader calls onOpenReader', () => {
    render(
      <FloatingPlayer
        onOpenReader={mockOnOpenReader}
        isActive={true}
        text="hello"
        ttsState="idle"
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /open reader/i }));
    expect(mockOnOpenReader).toHaveBeenCalled();
  });

  it('transitions to paused state when receiving TTS_STATE_UPDATE message', () => {
    // Capture the onMessage listener added by FloatingPlayer
    let capturedListener: ((msg: unknown) => void) | null = null;
    (chrome.runtime.onMessage.addListener as ReturnType<typeof vi.fn>).mockImplementation(
      (fn: (msg: unknown) => void) => {
        capturedListener = fn;
      },
    );

    render(
      <FloatingPlayer
        onOpenReader={mockOnOpenReader}
        isActive={true}
        text="hello"
        ttsState="idle"
      />,
    );

    act(() => {
      capturedListener?.({ type: 'TTS_STATE_UPDATE', state: 'speaking' });
    });

    expect(screen.getByRole('button', { name: /pause/i })).toBeInTheDocument();
  });

  it('mousedown on Play button calls preventDefault (prevents selection collapse)', () => {
    render(
      <FloatingPlayer
        onOpenReader={mockOnOpenReader}
        isActive={true}
        text="hello"
        ttsState="idle"
      />,
    );
    const playBtn = screen.getByRole('button', { name: /play/i });
    const event = new MouseEvent('mousedown', { bubbles: true, cancelable: true });
    const preventDefaultSpy = vi.spyOn(event, 'preventDefault');
    fireEvent(playBtn, event);
    expect(preventDefaultSpy).toHaveBeenCalled();
  });
});
