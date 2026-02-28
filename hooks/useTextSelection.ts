import { useState, useEffect } from 'react';

interface TextSelectionState {
  text: string;
  rect: DOMRect | null;
  isActive: boolean;
}

export function useTextSelection(): TextSelectionState {
  const [state, setState] = useState<TextSelectionState>({
    text: '',
    rect: null,
    isActive: false,
  });

  useEffect(() => {
    const handler = () => {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed || sel.rangeCount === 0) {
        setState({ text: '', rect: null, isActive: false });
        return;
      }
      const text = sel.toString().trim();
      if (!text) {
        setState({ text: '', rect: null, isActive: false });
        return;
      }
      const rect = sel.getRangeAt(0).getBoundingClientRect();
      setState({ text, rect, isActive: true });
    };

    document.addEventListener('selectionchange', handler);
    return () => document.removeEventListener('selectionchange', handler);
  }, []);

  return state;
}
