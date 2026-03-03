import { IceStatusReport } from '../types';

const CACHE_KEY = 'prygl_cache';
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

interface CacheEntry {
  report: IceStatusReport;
  timestamp: number;
}

function getCached(): IceStatusReport | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const entry: CacheEntry = JSON.parse(raw);
    if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
    return entry.report;
  } catch {
    return null;
  }
}

function setCache(report: IceStatusReport): void {
  try {
    const entry: CacheEntry = { report, timestamp: Date.now() };
    localStorage.setItem(CACHE_KEY, JSON.stringify(entry));
  } catch {
    // Storage quota exceeded or unavailable
  }
}

export function clearCache(): void {
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch {
    // ignore
  }
}

export async function fetchPryglStatus(): Promise<IceStatusReport> {
  const cached = getCached();
  if (cached) return cached;

  const res = await fetch('/api/status');
  if (!res.ok) throw new Error(`API error ${res.status}`);
  const report: IceStatusReport = await res.json();
  setCache(report);
  return report;
}
