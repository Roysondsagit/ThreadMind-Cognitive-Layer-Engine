
import { Thread, Category } from "../types";

const STORAGE_KEY = 'threadmind_vault';
const API_BASE = import.meta.env?.VITE_API_URL ?? '';
const USER_ID = 'current-user';

const useApi = () => !!API_BASE;

// Convert backend snake_case to frontend camelCase
const toThread = (raw: Record<string, any>): Thread => ({
  id: String(raw._id || raw.id),
  userId: raw.user_id || raw.userId,
  contentType: raw.content_type || raw.contentType,
  originalContent: raw.original_content || raw.originalContent,
  title: raw.title,
  summary: raw.summary,
  extractedText: raw.extracted_text || raw.extractedText,
  tags: raw.tags || [],
  intent: raw.intent,
  category: raw.category,
  viewCount: raw.view_count ?? raw.viewCount ?? 0,
  lastViewed: raw.last_viewed || raw.lastViewed || new Date().toISOString(),
  createdAt: raw.created_at || raw.createdAt || new Date().toISOString(),
});

// Convert frontend camelCase to backend snake_case
const toApiPayload = (thread: Thread) => ({
  user_id: thread.userId,
  content_type: thread.contentType,
  original_content: thread.originalContent,
  title: thread.title,
  summary: thread.summary,
  extracted_text: thread.extractedText,
  tags: thread.tags,
  intent: thread.intent,
  category: thread.category,
});

/**
 * Persistence Layer: Uses MongoDB via backend API when VITE_API_URL is set.
 * Falls back to LocalStorage for zero-config demo.
 */
export const getThreads = async (): Promise<Thread[]> => {
  if (useApi()) {
    try {
      const res = await fetch(`${API_BASE}/api/threads/${USER_ID}`);
      if (!res.ok) throw new Error('Failed to fetch threads');
      const data = await res.json();
      return Array.isArray(data) ? data.map(toThread) : [];
    } catch (err) {
      console.error('API getThreads error:', err);
      return [];
    }
  }
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const saveThread = async (thread: Thread): Promise<void> => {
  if (useApi()) {
    try {
      const res = await fetch(`${API_BASE}/api/threads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(toApiPayload(thread)),
      });
      if (!res.ok) throw new Error('Failed to save thread');
      const { id } = await res.json();
      thread.id = id; // Update with server-generated ID
    } catch (err) {
      console.error('API saveThread error:', err);
      throw err;
    }
    return;
  }
  const threads = await getThreads();
  const updated = [thread, ...threads];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
};

export const deleteThread = async (id: string): Promise<void> => {
  if (useApi()) {
    try {
      const res = await fetch(`${API_BASE}/api/threads/${id}`, { method: 'DELETE' });
      if (!res.ok && res.status !== 404) throw new Error('Failed to delete thread');
    } catch (err) {
      console.error('API deleteThread error:', err);
      throw err;
    }
    return;
  }
  const threads = await getThreads();
  const updated = threads.filter(t => t.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
};

export const markAsViewed = async (id: string): Promise<void> => {
  if (useApi()) {
    try {
      await fetch(`${API_BASE}/api/threads/${id}/view`, { method: 'PATCH' });
    } catch (err) {
      console.error('API markAsViewed error:', err);
    }
    return;
  }
  const threads = await getThreads();
  const updated = threads.map(t =>
    t.id === id ? { ...t, viewCount: t.viewCount + 1, lastViewed: new Date().toISOString() } : t
  );
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
};

/**
 * SMART RESURFACING ALGORITHM
 * Final Score = (0.5 × Semantic) + (0.3 × Time Decay) + (0.2 × Randomness)
 */
export const calculateResurfacingScore = (thread: Thread, semanticScore: number = 0.5): number => {
  const now = new Date();
  const lastViewed = new Date(thread.lastViewed);
  const diffHours = (now.getTime() - lastViewed.getTime()) / (1000 * 3600);

  const timeWeight = Math.min(diffHours / 168, 1.0);
  const randomness = Math.random();

  return (0.5 * semanticScore) + (0.3 * timeWeight) + (0.2 * randomness);
};

export const getRecommendation = (threads: Thread[]): { thread: Thread, reason: string } | null => {
  if (threads.length === 0) return null;

  const obsession = detectCurrentObsession(threads);

  const scored = threads.map(t => ({
    thread: t,
    score: calculateResurfacingScore(t, obsession === t.category ? 0.9 : 0.5)
  }));

  const best = scored.sort((a, b) => b.score - a.score)[0].thread;
  const reason = obsession === best.category
    ? `You've been exploring ${best.category} lately. Revisit this?`
    : "Surfacing a high-signal memory you haven't seen in a while.";

  return { thread: best, reason };
};

export const detectCurrentObsession = (threads: Thread[]): Category | null => {
  if (threads.length < 3) return null;
  const recent = threads.slice(0, 10);
  const counts: Record<string, number> = {};
  recent.forEach(t => counts[t.category] = (counts[t.category] || 0) + 1);

  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  return sorted[0][1] >= 3 ? (sorted[0][0] as Category) : null;
};
