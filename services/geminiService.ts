
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { IceStatusReport, GroundingSource } from "../types";

export async function fetchPryglStatus(): Promise<IceStatusReport> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = 'gemini-3-flash-preview';
  
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
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text || "Could not retrieve summary.";
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    const sources: GroundingSource[] = chunks
      .filter((chunk: any) => chunk.web)
      .map((chunk: any) => ({
        title: chunk.web.title || "Source",
        uri: chunk.web.uri
      }));

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
      sources,
      warnings: [], 
    };
  } catch (error) {
    console.error("Error fetching Prygl status:", error);
    throw error;
  }
}
