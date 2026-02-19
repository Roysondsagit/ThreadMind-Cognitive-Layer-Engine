
import { Thread, Category } from "../types";

const STORAGE_KEY = 'threadmind_vault';

/**
 * Persistence Layer: Defaulting to LocalStorage for zero-config hackathon demo.
 * Easily swappable for MongoDB/Firebase by updating these functions.
 */
export const getThreads = (): Thread[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const saveThread = (thread: Thread) => {
  const threads = getThreads();
  const updated = [thread, ...threads];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
};

export const deleteThread = (id: string) => {
  const threads = getThreads();
  const updated = threads.filter(t => t.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
};

export const markAsViewed = (id: string) => {
  const threads = getThreads();
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
  
  // Time Decay Weight (0.3): We want a score that grows as time increases, 
  // peaking at 7 days (168 hours).
  const timeWeight = Math.min(diffHours / 168, 1.0);
  
  // Randomness Boost (0.2): To prevent stale dashboards.
  const randomness = Math.random();

  return (0.5 * semanticScore) + (0.3 * timeWeight) + (0.2 * randomness);
};

export const getRecommendation = (threads: Thread[]): { thread: Thread, reason: string } | null => {
  if (threads.length === 0) return null;

  // Check for Contextual Obsession (e.g., "Exploring Coding lately")
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
  // If at least 3 of the last 10 items are in one category, it's an obsession.
  return sorted[0][1] >= 3 ? (sorted[0][0] as Category) : null;
};
