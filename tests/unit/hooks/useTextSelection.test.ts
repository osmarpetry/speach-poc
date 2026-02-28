import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTextSelection } from '../../../hooks/useTextSelection';

function mockSelection(text: string, collapsed = false) {
  const range = {
    getBoundingClientRect: () => ({
      top: 100,
      left: 50,
      width: 200,
      height: 20,
      right: 250,
      bottom: 120,
      x: 50,
      y: 100,
      toJSON: () => ({}),
    }),
  };

  const sel = {
    isCollapsed: collapsed,
    rangeCount: collapsed ? 0 : 1,
    toString: () => text,
    getRangeAt: () => range,
  };

  vi.spyOn(window, 'getSelection').mockReturnValue(sel as unknown as Selection);
  return sel;
}

function fireSelectionChange() {
  act(() => {
    document.dispatchEvent(new Event('selectionchange'));
  });
}

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('useTextSelection', () => {
  it('starts with isActive=false and empty text', () => {
    mockSelection('', true);
    const { result } = renderHook(() => useTextSelection());
    expect(result.current.isActive).toBe(false);
    expect(result.current.text).toBe('');
    expect(result.current.rect).toBeNull();
  });

  it('sets isActive=true and text when selection is non-empty', () => {
    const { result } = renderHook(() => useTextSelection());

    mockSelection('Hello world');
    fireSelectionChange();

    expect(result.current.isActive).toBe(true);
    expect(result.current.text).toBe('Hello world');
    expect(result.current.rect).not.toBeNull();
  });

  it('resets to isActive=false when selection collapses', () => {
    const { result } = renderHook(() => useTextSelection());

    mockSelection('Some text');
    fireSelectionChange();
    expect(result.current.isActive).toBe(true);

    mockSelection('', true);
    fireSelectionChange();
    expect(result.current.isActive).toBe(false);
    expect(result.current.text).toBe('');
    expect(result.current.rect).toBeNull();
  });

  it('trims whitespace from selection text', () => {
    const { result } = renderHook(() => useTextSelection());

    mockSelection('  trimmed text  ');
    fireSelectionChange();

    expect(result.current.text).toBe('trimmed text');
  });

  it('does not set isActive when selection text is only whitespace', () => {
    const { result } = renderHook(() => useTextSelection());

    mockSelection('   ');
    fireSelectionChange();

    expect(result.current.isActive).toBe(false);
  });

  it('removes event listener on unmount', () => {
    const removeSpy = vi.spyOn(document, 'removeEventListener');
    const { unmount } = renderHook(() => useTextSelection());
    unmount();
    expect(removeSpy).toHaveBeenCalledWith('selectionchange', expect.any(Function));
  });
});
