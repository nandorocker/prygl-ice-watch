
import { IceStatusReport } from '../types';

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'minimax/minimax-m2.5';

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

export async function fetchPryglStatus(): Promise<IceStatusReport> {
  const prompt = `
    TASK: Provide a status report on ice skating safety at the Brno Reservoir (Brněnská přehrada / Prygl) for today.

    PRIMARY SOURCE: Search for the latest public posts from 'https://www.facebook.com/prygl/'.
    Look for keywords like "bruslení", "led", "tloušťka", "bezpečné", and specific dates from the current winter season.

    SECONDARY SOURCES: Check Brno news sites (e.g., Brněnský deník, iDNES Brno) or official water rescue reports.

    REQUIRED INFO:
    1. SKATING STATUS: Is it safe/possible to skate today? (YES/NO/UNSURE)
    2. ICE THICKNESS: What is the most recently reported thickness in centimeters?
    3. LAST UPDATE DATE: Exactly when was this information posted or measured?
    4. WARNINGS: Are there specific dangerous areas (e.g., near the dam, under bridges)?

    Format your summary to be extremely clear and emphasize the date of the report found.
  `;

  try {
    // First call: trigger web search
    const firstData = await callOpenRouter([{ role: 'user', content: prompt }], true);
    const firstMessage = firstData.choices[0]?.message;
    const firstContent: string = firstMessage?.content || '';
    const annotations: any[] = firstMessage?.annotations || [];

    let text: string;

    // MiniMax returns a tool-call intermediate response; if so, feed the search
    // results back in a second call so it can synthesize the final answer.
    if (firstContent.includes('<minimax:tool_call>') && annotations.length > 0) {
      const searchContext = annotations
        .filter((a: any) => a.type === 'url_citation' && a.url_citation?.content)
        .map((a: any) => `Source: ${a.url_citation.title}\nURL: ${a.url_citation.url}\n\n${a.url_citation.content}`)
        .join('\n\n---\n\n');

      const secondData = await callOpenRouter([
        { role: 'user', content: prompt },
        { role: 'assistant', content: firstContent },
        { role: 'user', content: `Here are the web search results:\n\n${searchContext}\n\nNow provide the ice status report based on these results.` },
      ], false);

      text = secondData.choices[0]?.message?.content || 'Could not retrieve summary.';
    } else {
      text = firstContent || 'Could not retrieve summary.';
    }

    const lowerText = text.toLowerCase();
    let canSkate: 'YES' | 'NO' | 'UNSURE' = 'UNSURE';

    const positiveWords = ["skating is possible", "safe to skate", "bruslení je možné", "bezpečné", "vhodné k bruslení"];
    const negativeWords = ["unsafe", "danger", "not safe", "nebezpečné", "tenký led", "nevstupujte", "not recommended"];

    if (positiveWords.some(word => lowerText.includes(word))) {
      canSkate = 'YES';
    }
    if (negativeWords.some(word => lowerText.includes(word))) {
      canSkate = 'NO';
    }

    return {
      summary: text,
      canSkate,
      lastUpdated: new Date().toLocaleString(),
      sources: [],
      warnings: [],
    };
  } catch (error) {
    console.error("Error fetching Prygl status:", error);
    throw error;
  }
}
