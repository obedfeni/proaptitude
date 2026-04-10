export interface TestResult {
  id: string;
  category: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  timeSpent: number;
  timestamp: string;
  answers: { questionId: string; correct: boolean; selectedOption: number }[];
}

export interface QuestionStats {
  timesAsked: number;
  timesCorrect: number;
  weight: number;
  lastAsked?: number;  // Optional: timestamp of when last asked
}

export interface AppData {
  results: TestResult[];
  questionStats: Record<string, QuestionStats>;
  lastVisit: string;
  streakDays: number;
  totalTestsTaken: number;
}

const STORAGE_KEY = 'aptitudepro_data';

export function loadData(): AppData {
  if (typeof window === 'undefined') {
    return getDefaultData();
  }
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...getDefaultData(), ...parsed };
    }
  } catch (e) {
    console.error('Failed to load data:', e);
  }
  return getDefaultData();
}

export function saveData(data: Partial<AppData>): void {
  if (typeof window === 'undefined') return;
  try {
    const current = loadData();
    const updated = { ...current, ...data, lastVisit: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save data:', e);
  }
}

function getDefaultData(): AppData {
  return {
    results: [],
    questionStats: {},
    lastVisit: new Date().toISOString(),
    streakDays: 0,
    totalTestsTaken: 0
  };
}

export function addTestResult(result: TestResult): void {
  const data = loadData();
  data.results.push(result);
  data.totalTestsTaken++;

  // Update streak
  const lastVisit = new Date(data.lastVisit);
  const today = new Date();
  const diffDays = Math.floor((today.getTime() - lastVisit.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    data.streakDays++;
  } else if (diffDays > 1) {
    data.streakDays = 1;
  }

  saveData(data);
}

export function updateQuestionStats(questionId: string, correct: boolean): void {
  const data = loadData();
  if (!data.questionStats[questionId]) {
    data.questionStats[questionId] = { timesAsked: 0, timesCorrect: 0, weight: 1.0 };
  }
  
  const stats = data.questionStats[questionId];
  stats.timesAsked++;
  stats.lastAsked = Date.now();  // Track when question was last asked
  if (correct) {
    stats.timesCorrect++;
  }
  
  // Adaptive weight calculation
  const accuracy = stats.timesCorrect / stats.timesAsked;
  const frequencyPenalty = Math.min(stats.timesAsked / 10, 1);
  
  // Weight formula: prioritize questions with low accuracy and low frequency
  stats.weight = (1.5 - accuracy) * (1 - frequencyPenalty * 0.3) + 0.5;
  
  // Ensure minimum weight
  if (stats.weight < 0.3) stats.weight = 0.3;
  
  saveData(data);
}

export function getRecentlyAskedQuestions(category: string, limit: number = 20): string[] {
  const data = loadData();
  return Object.entries(data.questionStats)
    .filter(([_, stats]) => stats.lastAsked && stats.lastAsked > 0)
    .sort((a, b) => (b[1].lastAsked || 0) - (a[1].lastAsked || 0))
    .slice(0, limit)
    .map(([id, _]) => id);
}

export function getLeastAskedQuestions(category: string, count: number): string[] {
  const data = loadData();
  return Object.entries(data.questionStats)
    .sort((a, b) => (a[1].timesAsked || 0) - (b[1].timesAsked || 0))
    .slice(0, count)
    .map(([id, _]) => id);
}

export function getAnalytics(): {
  totalTests: number;
  averageScore: number;
  bestCategory: string;
  streakDays: number;
  recentResults: TestResult[];
  categoryPerformance: Record<string, { avg: number; count: number }>;
} {
  const data = loadData();
  const results = data.results;

  if (results.length === 0) {
    return {
      totalTests: 0,
      averageScore: 0,
      bestCategory: 'N/A',
      streakDays: data.streakDays,
      recentResults: [],
      categoryPerformance: {}
    };
  }

  const totalTests = results.length;
  const averageScore = results.reduce((acc, r) => acc + r.percentage, 0) / totalTests;

  const categoryStats: Record<string, { total: number; count: number }> = {};
  results.forEach(r => {
    if (!categoryStats[r.category]) {
      categoryStats[r.category] = { total: 0, count: 0 };
    }
    categoryStats[r.category].total += r.percentage;
    categoryStats[r.category].count++;
  });

  const categoryPerformance: Record<string, { avg: number; count: number }> = {};
  Object.entries(categoryStats).forEach(([cat, stats]) => {
    categoryPerformance[cat] = { avg: stats.total / stats.count, count: stats.count };
  });

  const bestCategory = Object.entries(categoryPerformance)
    .sort((a, b) => b[1].avg - a[1].avg)[0]?.[0] || 'N/A';

  return {
    totalTests,
    averageScore,
    bestCategory,
    streakDays: data.streakDays,
    recentResults: results.slice(-10).reverse(),
    categoryPerformance
  };
}
