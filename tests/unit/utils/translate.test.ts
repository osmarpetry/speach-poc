import { describe, it, expect, vi, beforeEach } from 'vitest';
import { translate } from '../../../utils/translate';

describe('translate', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('skips translation when base languages match', async () => {
    const result = await translate('hello', 'en-US', 'en-GB');
    expect(result).toBe('hello');
  });

  it('skips translation when exact same language', async () => {
    const result = await translate('olá', 'pt-BR', 'pt-PT');
    expect(result).toBe('olá');
  });

  it('returns translated text on success', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        responseData: { translatedText: 'olá mundo' },
        responseStatus: 200,
      }),
    }));

    const result = await translate('hello world', 'en', 'pt-BR');
    expect(result).toBe('olá mundo');
  });

  it('throws when fetch response is not ok', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 429,
    }));

    await expect(translate('hello', 'en', 'pt-BR')).rejects.toThrow('Translation failed: 429');
  });

  it('throws when API returns non-200 status', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        responseData: { translatedText: '' },
        responseStatus: 403,
      }),
    }));

    await expect(translate('hello', 'en', 'pt-BR')).rejects.toThrow('Translation API error');
  });
});
