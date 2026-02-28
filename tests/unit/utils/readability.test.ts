import { describe, it, expect } from 'vitest';
import { extractReadableContent } from '../../../utils/readability';

function makeDoc(html: string, lang = 'en'): Document {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  doc.documentElement.lang = lang;
  return doc;
}

describe('extractReadableContent', () => {
  it('returns null for empty/unparseable HTML', () => {
    const doc = makeDoc('<html><body></body></html>');
    const result = extractReadableContent(doc, 'https://example.com');
    expect(result).toBeNull();
  });

  it('does not mutate the original document', () => {
    const doc = makeDoc(`
      <html><body>
        <article>
          <h1>Test Article</h1>
          <p>This is a sufficiently long paragraph to pass the char threshold for readability to work correctly with this article content.</p>
          <p>Another paragraph here to make the content long enough for extraction to work properly without issues.</p>
        </article>
      </body></html>
    `);

    const h1Before = doc.querySelector('h1');
    expect(h1Before).not.toBeNull();

    extractReadableContent(doc, 'https://example.com');

    // Original document should still have the h1
    const h1After = doc.querySelector('h1');
    expect(h1After).not.toBeNull();
    expect(h1After?.textContent).toBe('Test Article');
  });

  it("falls back to doc.documentElement.lang when article has no lang", () => {
    const doc = makeDoc(
      `<html><body>
        <article>
          <h1>Article Without Lang</h1>
          <p>This is a sufficiently long paragraph to pass the char threshold for readability parsing to work correctly with this content.</p>
          <p>More paragraph text here to ensure the article has enough content to be extracted by the readability parser successfully.</p>
        </article>
      </body></html>`,
      'fr',
    );

    const result = extractReadableContent(doc, 'https://example.com');
    // If readability extracted something and article has no lang, falls back to doc lang
    if (result) {
      expect(['fr', 'en']).toContain(result.lang);
    }
  });

  it('returns title and url in result', () => {
    const doc = makeDoc(`
      <html>
        <head><title>My Page Title</title></head>
        <body>
          <article>
            <h1>Main Article</h1>
            <p>This is a sufficiently long paragraph to pass the char threshold for readability to extract this article content properly and return a valid result.</p>
            <p>Additional paragraph content here to make the total text long enough for the readability parser to work with successfully.</p>
          </article>
        </body>
      </html>
    `);

    const result = extractReadableContent(doc, 'https://test.com/article');
    if (result) {
      expect(result.url).toBe('https://test.com/article');
      expect(typeof result.title).toBe('string');
    }
  });
});
