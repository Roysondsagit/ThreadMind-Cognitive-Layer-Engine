
export enum Intent {
  IDEA = 'Idea',
  INSPIRATION = 'Inspiration',
  RESOURCE = 'Resource',
  TASK = 'Task'
}

export enum Category {
  FITNESS = 'Fitness',
  CODING = 'Coding',
  FOOD = 'Food',
  TRAVEL = 'Travel',
  DESIGN = 'Design',
  OTHER = 'Other'
}

export interface Thread {
  id: string;
  userId: string;
  contentType: 'url' | 'text' | 'voice' | 'image';
  originalContent: string;
  title: string;
  summary: string;
  extractedText?: string; // The "Main Text" or "Full Caption"
  tags: string[];
  intent: Intent;
  category: Category;
  viewCount: number;
  lastViewed: string;
  createdAt: string;
  score?: number;
}

export interface CognitiveAnalysis {
  title: string;
  summary: string;
  extractedText: string;
  tags: string[];
  intent: Intent;
  category: Category;
}
