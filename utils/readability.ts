import { Readability } from '@mozilla/readability';

export interface ReadableArticle {
  title: string;
  content: string;
  textContent: string;
  lang: string;
  url: string;
}

export function extractReadableContent(
  doc: Document,
  pageUrl: string,
): ReadableArticle | null {
  // CRITICAL: Readability removes DOM nodes during parse — clone to protect live page
  const clone = doc.cloneNode(true) as Document;
  const article = new Readability(clone, {
    charThreshold: 200,
    keepClasses: false,
  }).parse();

  if (!article) return null;

  return {
    title: article.title ?? doc.title,
    content: article.content ?? '',
    textContent: article.textContent ?? '',
    lang: article.lang ?? doc.documentElement.lang ?? 'en',
    url: pageUrl,
  };
}
