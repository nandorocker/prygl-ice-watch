import { IceStatusReport } from '../types';

const CACHE_KEY_PREFIX = 'prygl_cache_';

function getCached(today: string): IceStatusReport | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY_PREFIX + today);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setCache(today: string, report: IceStatusReport): void {
  try {
    // Remove stale entries from previous days
    Object.keys(localStorage)
      .filter(k => k.startsWith(CACHE_KEY_PREFIX) && k !== CACHE_KEY_PREFIX + today)
      .forEach(k => localStorage.removeItem(k));
    localStorage.setItem(CACHE_KEY_PREFIX + today, JSON.stringify(report));
  } catch {
    // Storage quota exceeded or unavailable — silently ignore
  }
}

export async function fetchPryglStatus(force = false): Promise<IceStatusReport> {
  const today = new Date().toISOString().split('T')[0];

  if (!force) {
    const cached = getCached(today);
    if (cached) return cached;
  }

  const res = await fetch('/api/status' + (force ? '?force=1' : ''));
  if (!res.ok) throw new Error(`API error ${res.status}`);
  const report: IceStatusReport = await res.json();
  setCache(today, report);
  return report;
}
