import type { VercelRequest, VercelResponse } from '@vercel/node';
import { put, list } from '@vercel/blob';

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'minimax/minimax-m2.5';
const BLOB_KEY = 'prygl-status/latest.json';
const MAX_AGE_MS = 25 * 60 * 60 * 1000; // 25 hours

const reportPrompt = `
  TASK: Report the current ice skating conditions at Brno Reservoir (Brněnská přehrada / Prygl).

  RULES:
  - Only report information that is explicitly present in the source. Do not speculate or fill gaps.
  - Do NOT mention sources, websites, or search results — only the facts found.
  - Do NOT explain what was not found or what sources lacked. Silence is better than padding.
  - If ice thickness is known, state it. If the date of the measurement is known, state it. If there are warnings, state them. Otherwise say nothing about those fields.
  - Keep the response short. 2–4 sentences maximum.

  Provide the report in BOTH English and Czech.
  Format your response as:
  ---
  EN: [your English report here]
  CS: [your Czech report here]
  ---
  Then end with exactly one of:
  SKATING_STATUS: YES
  SKATING_STATUS: NO
  SKATING_STATUS: UNSURE
`;

async function callOpenRouter(messages: { role: string; content: string }[], useWebPlugin: boolean) {
  const body: Record<string, unknown> = { model: MODEL, messages };
  if (useWebPlugin) body.plugins = [{ id: 'web' }];

  const response = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenRouter error ${response.status}: ${err}`);
  }

  return response.json();
}

interface CacheData {
  report: {
    summary: string;
    summaryCs: string;
    canSkate: 'YES' | 'NO' | 'UNSURE';
    lastUpdated: string;
    sources: { title: string; uri: string }[];
    warnings: string[];
  };
  generatedAt: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const force = req.query.force === '1';

  // Try to read from Blob cache first (unless force)
  if (!force) {
    try {
      const blobs = await list({ prefix: 'prygl-status/' });
      const cachedBlob = blobs.blobs.find(b => b.pathname === BLOB_KEY);

      if (cachedBlob) {
        const response = await fetch(cachedBlob.url);
        if (response.ok) {
          const cached: CacheData = await response.json();
          const cachedTime = new Date(cached.generatedAt).getTime();

          if (Date.now() - cachedTime < MAX_AGE_MS) {
            res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=600');
            res.json(cached.report);
            return;
          }
        }
      }
    } catch (blobError) {
      console.warn('Blob read failed, falling back to generate:', blobError);
    }
  }

  // Generate fresh report
  const report = await generateReport();

  // Write to Blob cache
  try {
    await put(BLOB_KEY, JSON.stringify({ report, generatedAt: new Date().toISOString() }), {
      access: 'public',
    });
  } catch (writeError) {
    console.warn('Blob write failed:', writeError);
  }

  if (!force) {
    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=3600');
  }
  res.json(report);
}

async function generateReport(): Promise<{
  summary: string;
  summaryCs: string;
  canSkate: 'YES' | 'NO' | 'UNSURE';
  lastUpdated: string;
  sources: { title: string; uri: string }[];
  warnings: string[];
}> {
  const today = new Date().toISOString().split('T')[0];

  let textEn: string;
  let textCs: string;
  let canSkate: 'YES' | 'NO' | 'UNSURE' = 'UNSURE';
  let sources: { title: string; uri: string }[] = [];

  try {
    // Primary: fetch prygl.net directly — no CORS proxy needed server-side
    const pageRes = await fetch('https://prygl.net');
    if (!pageRes.ok) throw new Error(`prygl.net fetch error ${pageRes.status}`);
    const html = await pageRes.text();
    const plainText = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

    const data = await callOpenRouter([{
      role: 'user',
      content: `The following is the current content of prygl.net, the official Brno Reservoir ice conditions website. Today is ${today}.

${plainText.slice(0, 8000)}

Based ONLY on this content, provide the ice skating safety report. ${reportPrompt}`,
    }], false);

    const fullText = data.choices[0]?.message?.content || '';
    const { en, cs, status } = parseBilingualResponse(fullText);
    textEn = en || 'Could not retrieve summary.';
    textCs = cs || textEn; // Fallback to English if Czech missing
    if (status) canSkate = status;
    sources = [{ title: 'prygl.net', uri: 'https://prygl.net' }];
  } catch (fetchError) {
    console.warn('Direct prygl.net fetch failed, falling back to web search:', fetchError);

    // Fallback: web search via OpenRouter plugin
    const prompt = `Today's date is ${today}.\n${reportPrompt}\nPRIMARY SOURCE: Search for the latest content from https://prygl.net and https://www.facebook.com/prygl/`;
    const firstData = await callOpenRouter([{ role: 'user', content: prompt }], true);
    const firstMessage = firstData.choices[0]?.message;
    const firstContent: string = firstMessage?.content || '';
    const annotations: any[] = firstMessage?.annotations || [];

    const isMidToolCall = firstContent.includes('<minimax:tool_call>') || firstContent.includes('<search>');
    if (isMidToolCall && annotations.length > 0) {
      const citationAnnotations = annotations.filter((a: any) => a.type === 'url_citation' && a.url_citation?.content);
      const searchContext = citationAnnotations
        .map((a: any) => `Source: ${a.url_citation.title}\nURL: ${a.url_citation.url}\n\n${a.url_citation.content}`)
        .join('\n\n---\n\n');

      const secondData = await callOpenRouter([{
        role: 'user',
        content: `The following web search results have already been retrieved for you. Do NOT perform any additional searches. Based only on these results, write the ice skating safety report.

SEARCH RESULTS:
${searchContext}

---
${prompt}`,
      }], false);

      const fullText = secondData.choices[0]?.message?.content || '';
      const { en, cs, status } = parseBilingualResponse(fullText);
      textEn = en || 'Could not retrieve summary.';
      textCs = cs || textEn;
      if (status) canSkate = status;
      sources = citationAnnotations.map((a: any) => ({
        title: a.url_citation.title || a.url_citation.url,
        uri: a.url_citation.url,
      }));
    } else {
      const { en, cs, status } = parseBilingualResponse(firstContent);
      textEn = en || 'Could not retrieve summary.';
      textCs = cs || textEn;
      if (status) canSkate = status;
    }
  }

  return {
    summary: textEn,
    summaryCs: textCs,
    canSkate,
    lastUpdated: new Date().toLocaleString(),
    sources,
    warnings: [],
  };
}

function parseBilingualResponse(text: string): { en: string; cs: string; status: 'YES' | 'NO' | 'UNSURE' | null } {
  // Extract status from the full raw text before any stripping
  const statusMatch = text.match(/SKATING_STATUS:\s*(YES|NO|UNSURE)/i);
  const status = statusMatch ? statusMatch[1].toUpperCase() as 'YES' | 'NO' | 'UNSURE' : null;

  // Try to extract EN and CS sections
  const enMatch = text.match(/EN:\s*([\s\S]*?)(?:CS:|---|$)/i);
  const csMatch = text.match(/CS:\s*([\s\S]*?)(?:EN:|---|$)/i);

  let en = enMatch?.[1]?.trim() || text;
  let cs = csMatch?.[1]?.trim() || '';

  // If no Czech found, try to translate basic response
  if (!cs && en) {
    cs = en; // Will be handled by frontend fallback
  }

  // Clean up status from summaries
  en = en.replace(/SKATING_STATUS:\s*(YES|NO|UNSURE)/gi, '').trim();
  cs = cs.replace(/SKATING_STATUS:\s*(YES|NO|UNSURE)/gi, '').trim();

  return { en, cs, status };
}
