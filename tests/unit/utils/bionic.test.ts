import { describe, it, expect } from 'vitest';
import { boldLeadingChars, applyBionicReading, revertBionicReading } from '../../../utils/bionic';

describe('boldLeadingChars', () => {
  it('returns single-char word unchanged', () => {
    expect(boldLeadingChars('a', 0.4)).toBe('a');
  });

  it('bolds first 1 char of a 2-char word', () => {
    expect(boldLeadingChars('hi', 0.4)).toBe('<b data-bionic="">h</b>i');
  });

  it('bolds first 1 char of a 3-char word regardless of fixation', () => {
    expect(boldLeadingChars('the', 0.6)).toBe('<b data-bionic="">t</b>he');
  });

  it('bolds first 2 chars of a 4-char word at fixation 0.4', () => {
    // ceil(4 * 0.4) = ceil(1.6) = 2
    expect(boldLeadingChars('word', 0.4)).toBe('<b data-bionic="">wo</b>rd');
  });

  it('bolds more chars at higher fixation', () => {
    // fixation 0.4: ceil(7 * 0.4) = ceil(2.8) = 3
    // fixation 0.6: ceil(7 * 0.6) = ceil(4.2) = 5
    const low = boldLeadingChars('reading', 0.4);
    const high = boldLeadingChars('reading', 0.6);
    const boldLow = low.match(/<b[^>]*>(.*?)<\/b>/)?.[1]?.length ?? 0;
    const boldHigh = high.match(/<b[^>]*>(.*?)<\/b>/)?.[1]?.length ?? 0;
    expect(boldHigh).toBeGreaterThan(boldLow);
  });
});

describe('applyBionicReading', () => {
  function makeContainer(html: string): HTMLElement {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div;
  }

  it('applies bold to leading chars of words in text nodes', () => {
    const container = makeContainer('<p>Hello world</p>');
    applyBionicReading(container, 0.4);
    expect(container.querySelector('[data-bionic]')).not.toBeNull();
  });

  it('skips content inside <code> elements', () => {
    const container = makeContainer('<code>hello world</code>');
    applyBionicReading(container, 0.4);
    expect(container.querySelector('[data-bionic]')).toBeNull();
  });

  it('skips content inside <script> elements', () => {
    const container = makeContainer('<script>var x = 1;</script>');
    applyBionicReading(container, 0.4);
    expect(container.querySelector('[data-bionic]')).toBeNull();
  });

  it('is idempotent when called twice', () => {
    const container = makeContainer('<p>Hello world</p>');
    applyBionicReading(container, 0.4);
    const countAfterFirst = container.querySelectorAll('[data-bionic]').length;
    applyBionicReading(container, 0.4);
    const countAfterSecond = container.querySelectorAll('[data-bionic]').length;
    expect(countAfterSecond).toBe(countAfterFirst);
  });

  it('higher fixation bolds more chars per word', () => {
    const container1 = makeContainer('<p>reading</p>');
    const container2 = makeContainer('<p>reading</p>');
    applyBionicReading(container1, 0.4);
    applyBionicReading(container2, 0.6);
    const bold1 = container1.querySelector('[data-bionic]')!.textContent!.length;
    const bold2 = container2.querySelector('[data-bionic]')!.textContent!.length;
    expect(bold2).toBeGreaterThan(bold1);
  });
});

describe('revertBionicReading', () => {
  it('restores original text content and removes bionic elements', () => {
    const container = document.createElement('div');
    container.innerHTML = '<p>Hello world</p>';
    const original = container.textContent;
    applyBionicReading(container, 0.4);
    revertBionicReading(container);
    expect(container.textContent).toBe(original);
    expect(container.querySelector('[data-bionic]')).toBeNull();
  });

  it('removes data-bionic-wrap spans after revert', () => {
    const container = document.createElement('div');
    container.innerHTML = '<p>Test text</p>';
    applyBionicReading(container, 0.4);
    expect(container.querySelector('[data-bionic-wrap]')).not.toBeNull();
    revertBionicReading(container);
    expect(container.querySelector('[data-bionic-wrap]')).toBeNull();
  });
});
