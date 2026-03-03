import { describe, it, expect, vi, beforeEach } from 'vitest';
import path from 'path';

const statusPath = path.resolve(__dirname, './status');

vi.mock('@vercel/blob', () => ({
  list: vi.fn(),
}));

global.fetch = vi.fn();

describe('/api/status read-only endpoint', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it('returns blob data when available', async () => {
    const reportData = {
      report: {
        summary: 'Ice is safe',
        summaryCs: 'Led je bezpečný',
        canSkate: 'YES' as const,
        lastUpdated: '2024-01-01',
        sources: [],
        warnings: [],
      },
      generatedAt: new Date().toISOString(),
    };

    const { list } = await import('@vercel/blob');
    (list as any).mockResolvedValue({
      blobs: [{ pathname: 'prygl-status/latest.json', url: 'https://blob.com/test' }],
    });

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(reportData),
    });

    const { default: handler } = await import(statusPath);

    const req = { query: {} } as any;
    const json = vi.fn();
    const setHeader = vi.fn();
    const res = { json, setHeader, status: vi.fn().mockReturnThis() } as any;

    await handler(req, res);

    expect(list).toHaveBeenCalledWith({ prefix: 'prygl-status/' });
    expect(json).toHaveBeenCalledWith(reportData.report);
    expect(setHeader).toHaveBeenCalledWith('Cache-Control', 's-maxage=3600, stale-while-revalidate=7200');
  });

  it('returns fallback when no blob exists', async () => {
    const { list } = await import('@vercel/blob');
    (list as any).mockResolvedValue({ blobs: [] });

    const { default: handler } = await import(statusPath);

    const req = { query: {} } as any;
    const json = vi.fn();
    const setHeader = vi.fn();
    const res = { json, setHeader, status: vi.fn().mockReturnThis() } as any;

    await handler(req, res);

    expect(json).toHaveBeenCalledWith(expect.objectContaining({
      canSkate: 'UNSURE',
      summary: expect.stringContaining('prygl.net'),
    }));
  });

  it('returns fallback when blob read fails', async () => {
    const { list } = await import('@vercel/blob');
    (list as any).mockRejectedValue(new Error('Blob error'));

    const { default: handler } = await import(statusPath);

    const req = { query: {} } as any;
    const json = vi.fn();
    const setHeader = vi.fn();
    const res = { json, setHeader, status: vi.fn().mockReturnThis() } as any;

    await handler(req, res);

    expect(json).toHaveBeenCalledWith(expect.objectContaining({
      canSkate: 'UNSURE',
    }));
  });
});
