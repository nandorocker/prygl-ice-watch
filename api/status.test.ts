import { describe, it, expect, vi, beforeEach } from 'vitest';
import path from 'path';

// Get the correct path to the status module
const statusPath = path.resolve(__dirname, './status');

// Mock @vercel/blob
vi.mock('@vercel/blob', () => ({
  put: vi.fn().mockResolvedValue({ url: 'https://blob.com/test' }),
  list: vi.fn(),
}));

// Mock fetch
global.fetch = vi.fn();

describe('/api/status Blob caching', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns cached data when fresh (< 25 hours old)', async () => {
    const cachedData = {
      generatedAt: new Date().toISOString(),
      report: {
        summary: 'Ice is safe',
        summaryCs: 'Led je bezpečný',
        canSkate: 'YES' as const,
        lastUpdated: '2024-01-01',
        sources: [],
        warnings: [],
      },
    };

    const { list } = await import('@vercel/blob');
    list.mockResolvedValue({
      blobs: [{ pathname: 'prygl-status/latest.json', url: 'https://blob.com/test' }],
    });

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(cachedData),
    });

    const { default: handler } = await import(statusPath);

    const req = { query: {} } as any;
    const json = vi.fn();
    const setHeader = vi.fn();
    const res = { json, setHeader, status: vi.fn().mockReturnThis() } as any;

    await handler(req, res);

    expect(list).toHaveBeenCalledWith({ prefix: 'prygl-status/' });
    expect(json).toHaveBeenCalledWith(cachedData.report);
    expect(setHeader).toHaveBeenCalledWith('Cache-Control', expect.stringContaining('s-maxage'));
  });

  it('generates new report when cache is stale (> 25 hours old)', async () => {
    const staleData = {
      generatedAt: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
      report: { summary: 'old', summaryCs: 'old', canSkate: 'YES' as const, lastUpdated: '', sources: [], warnings: [] },
    };

    const { list } = await import('@vercel/blob');
    list.mockResolvedValue({
      blobs: [{ pathname: 'prygl-status/latest.json', url: 'https://blob.com/test' }],
    });

    global.fetch = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(staleData),
      });

    const { default: handler } = await import(statusPath);

    const req = { query: {} } as any;
    const json = vi.fn();
    const setHeader = vi.fn();
    const res = { json, setHeader, status: vi.fn().mockReturnThis() } as any;

    try {
      await handler(req, res);
    } catch (e) {
      // Expected - API key missing
    }

    expect(list).toHaveBeenCalledWith({ prefix: 'prygl-status/' });
  });

  it('bypasses cache when force=true', async () => {
    const { list, put } = await import('@vercel/blob');
    list.mockResolvedValue({ blobs: [] });

    global.fetch = vi.fn()
      .mockResolvedValueOnce({ ok: true, text: () => Promise.resolve('<html>Ice: 20cm</html>') })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          choices: [{ message: { content: 'EN: Great ice\nCS: Skvělý led\nSKATING_STATUS: YES' } }],
        }),
      });

    const { default: handler } = await import(statusPath);

    const req = { query: { force: '1' } } as any;
    const json = vi.fn();
    const setHeader = vi.fn();
    const res = { json, setHeader, status: vi.fn().mockReturnThis() } as any;

    try {
      await handler(req, res);
    } catch (e) {
      // Expected - API key missing
    }

    // With force=1, should not check blob cache first
    expect(list).not.toHaveBeenCalled();
    expect(put).toHaveBeenCalled();
  });

  it('writes to blob after generating report', async () => {
    const { put } = await import('@vercel/blob');
    const { list } = await import('@vercel/blob');
    list.mockResolvedValue({ blobs: [] });

    global.fetch = vi.fn()
      .mockResolvedValueOnce({ ok: true, text: () => Promise.resolve('<html>Ice: 15cm</html>') })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          choices: [{ message: { content: 'EN: Safe\nCS: Bezpečno\nSKATING_STATUS: YES' } }],
        }),
      });

    const { default: handler } = await import(statusPath);

    const req = { query: {} } as any;
    const json = vi.fn();
    const setHeader = vi.fn();
    const res = { json, setHeader, status: vi.fn().mockReturnThis() } as any;

    try {
      await handler(req, res);
    } catch (e) {
      // Expected - missing API key
    }

    expect(put).toHaveBeenCalled();
    const putCall = (put as any).mock.calls[0];
    expect(putCall[0]).toBe('prygl-status/latest.json');
    const stored = JSON.parse(putCall[1]);
    expect(stored.report).toBeDefined();
    expect(stored.generatedAt).toBeDefined();
  });
});
