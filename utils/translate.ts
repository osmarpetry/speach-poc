export async function translate(
  text: string,
  sourceLang: string,
  targetLang: string,
): Promise<string> {
  if (sourceLang.split('-')[0] === targetLang.split('-')[0]) return text;

  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLang}|${targetLang}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Translation failed: ${res.status}`);
  const data = await res.json() as { responseData: { translatedText: string }; responseStatus: number };
  if (data.responseStatus !== 200) throw new Error('Translation API error');
  return data.responseData.translatedText;
}
