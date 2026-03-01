const BIONIC_ATTR = 'data-bionic';
const BIONIC_WRAP_ATTR = 'data-bionic-wrap';
const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'CODE', 'PRE', 'TEXTAREA', 'INPUT']);

export function boldLeadingChars(word: string, fixation: number): string {
  if (word.length <= 1) return word;
  const n = word.length <= 3 ? 1 : Math.ceil(word.length * fixation);
  return `<b data-bionic="">${word.slice(0, n)}</b>${word.slice(n)}`;
}

export function applyBionicReading(container: Element, fixation = 0.4): void {
  revertBionicReading(container);

  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
  const textNodes: Text[] = [];
  let node: Text | null;
  while ((node = walker.nextNode() as Text | null)) {
    let parent = node.parentElement;
    let skip = false;
    while (parent && parent !== container) {
      if (SKIP_TAGS.has(parent.tagName)) {
        skip = true;
        break;
      }
      parent = parent.parentElement;
    }
    if (!skip) textNodes.push(node);
  }

  for (const textNode of textNodes) {
    const text = textNode.nodeValue ?? '';
    if (!text.trim()) continue;

    const span = document.createElement('span');
    span.setAttribute(BIONIC_WRAP_ATTR, '');

    const parts = text.split(/(\S+)/);
    for (const part of parts) {
      if (!part) continue;
      if (/\S/.test(part)) {
        const wordLen = part.length;
        const n = wordLen <= 1 ? 0 : wordLen <= 3 ? 1 : Math.ceil(wordLen * fixation);
        if (n === 0) {
          span.appendChild(document.createTextNode(part));
        } else {
          const b = document.createElement('b');
          b.setAttribute(BIONIC_ATTR, '');
          b.appendChild(document.createTextNode(part.slice(0, n)));
          span.appendChild(b);
          if (part.slice(n)) span.appendChild(document.createTextNode(part.slice(n)));
        }
      } else {
        span.appendChild(document.createTextNode(part));
      }
    }

    textNode.parentNode?.replaceChild(span, textNode);
  }
}

export function revertBionicReading(container: Element): void {
  const wraps = container.querySelectorAll(`[${BIONIC_WRAP_ATTR}]`);
  for (const wrap of wraps) {
    const textNode = document.createTextNode(wrap.textContent ?? '');
    wrap.parentNode?.replaceChild(textNode, wrap);
  }
}
