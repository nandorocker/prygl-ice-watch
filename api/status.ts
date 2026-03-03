import type { VercelRequest, VercelResponse } from '@vercel/node';
import { list } from '@vercel/blob';

const BLOB_KEY = 'prygl-status/latest.json';

const FALLBACK_REPORT = {
  summary: 'Unable to retrieve current conditions. Please check prygl.net directly.',
  summaryCs: 'Nelze získat aktuální podmínky. Zkontrolujte prosím přímo prygl.net.',
  canSkate: 'UNSURE' as const,
  lastUpdated: new Date().toLocaleString(),
  sources: [{ title: 'prygl.net', uri: 'https://prygl.net' }],
  warnings: [],
};

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=7200');

  try {
    const blobs = await list({ prefix: 'prygl-status/' });
    const cachedBlob = blobs.blobs.find(b => b.pathname === BLOB_KEY);

    if (cachedBlob) {
      const response = await fetch(cachedBlob.url);
      if (response.ok) {
        const cached = await response.json();
        res.json(cached.report);
        return;
      }
    }
  } catch (error) {
    console.warn('Blob read failed:', error);
  }

  res.json(FALLBACK_REPORT);
}
