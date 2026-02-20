
import { GoogleGenAI, Type } from "@google/genai";
import { CognitiveAnalysis, Intent, Category, Thread } from "../types";

const API_KEY = process.env.API_KEY;
const GEMINI_MODEL = "gemini-2.5-flash"; // Try gemini-2.0-flash if 404

function stripHtml(html: string): string {
  const doc = new DOMParser().parseFromString(html, "text/html");
  return doc.body?.textContent?.replace(/\s+/g, " ").trim().slice(0, 15000) || "";
}

/** Fetch URL content via CORS proxy (works for public blogs/articles) */
async function fetchUrlContent(url: string): Promise<string | null> {
  try {
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
    const res = await fetch(proxyUrl, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return null;
    const html = await res.text();
    return stripHtml(html);
  } catch {
    return null;
  }
}

export const processContent = async (
  input: string | { data: string; mimeType: string }, 
  mode: string
): Promise<CognitiveAnalysis> => {
  if (!API_KEY || API_KEY === "PLACEHOLDER_API_KEY") {
    throw new Error("Please set a valid GEMINI_API_KEY in .env.local. Get one at https://aistudio.google.com/apikey");
  }
  const ai = new GoogleGenAI({ apiKey: API_KEY });

  let contentToAnalyze: string;
  let isUrlOnly = false;

  if (typeof input === "string") {
    const trimmed = input.trim();
    const looksLikeUrl = /^https?:\/\//i.test(trimmed);
    if (looksLikeUrl && mode === "url") {
      const fetched = await fetchUrlContent(trimmed);
      if (fetched && fetched.length > 100) {
        contentToAnalyze = `URL: ${trimmed}\n\nPAGE CONTENT:\n${fetched}`;
      } else {
        contentToAnalyze = trimmed;
        isUrlOnly = true;
      }
    } else {
      contentToAnalyze = trimmed;
    }
  } else {
    contentToAnalyze = "[Audio/Image input]";
  }

  const urlOnlyInstruction = isUrlOnly
    ? "\n\nNOTE: You only have the URL (Instagram/Twitter block scraping). Infer title, summary, and category from the URL and domain. For extractedText, describe what type of content this link likely points to."
    : "";

  const systemInstruction = `
    You are the ThreadMind Cognitive Layer. You rescue information from digital entropy.

    EXTRACTION RULES:
    1. BLOGS/ARTICLES: Extract the Title and the full "Main Text" (body content). Summarize the body into one sentence.
    2. INSTAGRAM/TWITTER URLs (when only URL given): Infer from the URL structure. Title: short description. Summary: what this link likely contains. ExtractedText: "Instagram/Twitter post - paste caption manually for full extraction."
    3. PLAIN TEXT: Extract key ideas. Summarize into one sentence.
    ${urlOnlyInstruction}

    SCHEMA (return valid JSON):
    - Title: Max 5 words.
    - Summary: EXACTLY one sentence (Max 25 words).
    - ExtractedText: The "Main Text" or description rescued from the input.
    - Tags: 3 specific hashtags (lowercase, no #).
    - Category: Fitness, Coding, Food, Travel, Design, or Other.
    - Intent: Idea, Inspiration, Resource, or Task.

    Input Context: ${mode}
  `;

  const contentPart = typeof input === "string"
    ? { text: `Target:\n${contentToAnalyze}` }
    : { inlineData: input };

  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: { parts: [contentPart] },
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          summary: { type: Type.STRING },
          extractedText: { type: Type.STRING },
          tags: { type: Type.ARRAY, items: { type: Type.STRING } },
          intent: { type: Type.STRING, enum: Object.values(Intent) },
          category: { type: Type.STRING, enum: Object.values(Category) }
        },
        required: ["title", "summary", "extractedText", "tags", "intent", "category"]
      }
    }
  });

  const text = response.text?.trim?.() ?? "";
  if (!text) throw new Error("Gemini returned no response. Check your API key and model.");
  try {
    return JSON.parse(text) as CognitiveAnalysis;
  } catch (e) {
    console.error("Gemini Parse Error:", e);
    return {
      title: "Rescued Artifact",
      summary: "A new insight has been added to your cognitive layer.",
      extractedText: "Original content saved but full text extraction failed.",
      tags: ["rescued"],
      intent: Intent.RESOURCE,
      category: Category.OTHER
    };
  }
};

export const queryVault = async (question: string, threads: Thread[]): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY! });
  const context = threads.map(t => `[${t.category} / ${t.intent}] ${t.title}: ${t.summary} (Full Detail: ${t.extractedText?.substring(0, 200)}...)`).join("\n---\n");
  
  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: `Question: ${question}\n\nMy Knowledge Vault Context:\n${context}`,
    config: {
      systemInstruction: "You are the ThreadMind Cognitive Assistant. Answer questions based ONLY on the provided vault context. If the information isn't there, say you haven't saved anything about it yet. Keep answers concise and helpful."
    }
  });

  return response.text?.trim() ?? "";
};

export const transcribeAudio = async (audioData: string, mimeType: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY! });
  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: {
      parts: [
        { inlineData: { data: audioData, mimeType } },
        { text: "Transcribe the audio exactly. No preamble." }
      ]
    }
  });
  return response.text?.trim() ?? "";
};

export const semanticSearch = async (query: string, threads: any[]): Promise<string[]> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY! });
  const threadContext = threads.map(t => `${t.id}: [${t.category}] ${t.title} - ${t.summary} (Content: ${t.extractedText?.substring(0, 100)})`).join("\n");
  
  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: `Return a JSON array of IDs for entries relevant to: "${query}"\n\nVault:\n${threadContext}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: { type: Type.ARRAY, items: { type: Type.STRING } }
    }
  });

  const text = response.text?.trim() ?? "[]";
  return JSON.parse(text);
};
