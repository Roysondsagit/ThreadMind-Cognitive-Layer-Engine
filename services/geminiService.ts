
import { GoogleGenAI, Type } from "@google/genai";
import { CognitiveAnalysis, Intent, Category, Thread } from "../types";

const API_KEY = process.env.API_KEY;

export const processContent = async (
  input: string | { data: string; mimeType: string }, 
  mode: string
): Promise<CognitiveAnalysis> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY! });
  
  const systemInstruction = `
    You are the ThreadMind Cognitive Layer. You rescue information from digital entropy.

    EXTRACTION RULES:
    1. BLOGS/ARTICLES: Extract the Title and the full "Main Text" (body content). Summarize the body into one sentence.
    2. INSTAGRAM: Extract the "Full Caption" including all hashtags and emojis. Summarize the caption's value into one sentence.
    3. TWITTER/X: Extract the full text of the tweet/thread. Summarize the narrative into one sentence.

    SCHEMA:
    - Title: Max 5 words.
    - Summary: EXACTLY one sentence (Max 25 words).
    - ExtractedText: The "Main Text" or "Full Caption" rescued from the input.
    - Tags: 3 specific hashtags.
    - Category: Fitness, Coding, Food, Travel, Design, or Other.
    - Intent: Idea, Inspiration, Resource, or Task.

    Input Context: ${mode}
    Return result as valid JSON.
  `;

  const contentPart = typeof input === 'string' 
    ? { text: `Target: ${input}` }
    : { inlineData: input };

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
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

  try {
    return JSON.parse(response.text.trim()) as CognitiveAnalysis;
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
    model: "gemini-3-flash-preview",
    contents: `Question: ${question}\n\nMy Knowledge Vault Context:\n${context}`,
    config: {
      systemInstruction: "You are the ThreadMind Cognitive Assistant. Answer questions based ONLY on the provided vault context. If the information isn't there, say you haven't saved anything about it yet. Keep answers concise and helpful."
    }
  });

  return response.text.trim();
};

export const transcribeAudio = async (audioData: string, mimeType: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY! });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: {
      parts: [
        { inlineData: { data: audioData, mimeType } },
        { text: "Transcribe the audio exactly. No preamble." }
      ]
    }
  });
  return response.text.trim();
};

export const semanticSearch = async (query: string, threads: any[]): Promise<string[]> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY! });
  const threadContext = threads.map(t => `${t.id}: [${t.category}] ${t.title} - ${t.summary} (Content: ${t.extractedText?.substring(0, 100)})`).join("\n");
  
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Return a JSON array of IDs for entries relevant to: "${query}"\n\nVault:\n${threadContext}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: { type: Type.ARRAY, items: { type: Type.STRING } }
    }
  });

  return JSON.parse(response.text.trim());
};
