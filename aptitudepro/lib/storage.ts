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
  lastAsked: number;
  category: string;
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
  if (typeof window === 'undefined') return getDefaultData();
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
    totalTestsTaken: 0,
  };
}

export function addTestResult(result: TestResult): void {
  const data = loadData();
  data.results.push(result);
  data.totalTestsTaken++;

  const lastVisit = new Date(data.lastVisit);
  const today = new Date();
  const diffDays = Math.floor(
    (today.getTime() - lastVisit.getTime()) / (1000 * 60 * 60 * 24)
  );
  if (diffDays === 1) data.streakDays++;
  else if (diffDays > 1) data.streakDays = 1;

  saveData(data);
}

export function updateQuestionStats(
  questionId: string,
  correct: boolean,
  category: string = ''
): void {
  const data = loadData();

  if (!data.questionStats[questionId]) {
    data.questionStats[questionId] = {
      timesAsked: 0,
      timesCorrect: 0,
      weight: 1.0,
      lastAsked: 0,
      category,
    };
  }

  const stats = data.questionStats[questionId];
  stats.timesAsked++;
  stats.timesCorrect = (stats.timesCorrect || 0) + (correct ? 1 : 0);
  stats.lastAsked = Date.now();
  if (!stats.category) stats.category = category;

  const accuracy = stats.timesCorrect / stats.timesAsked;
  const frequencyFactor = Math.min(stats.timesAsked / 10, 1);
  stats.weight = Math.max(
    0.3,
    (1.5 - accuracy) * (1 - frequencyFactor * 0.3) + 0.5
  );

  saveData(data);
}

// Returns recently asked question IDs for THIS category only
export function getRecentlyAskedQuestions(
  category: string,
  limit: number = 40
): string[] {
  const data = loadData();
  return Object.entries(data.questionStats)
    .filter(([_, s]) => s.category === category && s.lastAsked > 0)
    .sort((a, b) => b[1].lastAsked - a[1].lastAsked)
    .slice(0, limit)
    .map(([id]) => id);
}

// Returns persisted stats map for a category — fed into buildBlendedTest
export function getCategoryStatsMap(
  category: string
): Record<string, { timesAsked: number; timesCorrect: number }> {
  const data = loadData();
  const result: Record<string, { timesAsked: number; timesCorrect: number }> = {};
  for (const [id, s] of Object.entries(data.questionStats)) {
    if (s.category === category) {
      result[id] = {
        timesAsked: s.timesAsked,
        timesCorrect: s.timesCorrect,
      };
    }
  }
  return result;
}

export function getLeastAskedQuestions(
  category: string,
  count: number
): string[] {
  const data = loadData();
  return Object.entries(data.questionStats)
    .filter(([_, s]) => s.category === category)
    .sort((a, b) => (a[1].timesAsked || 0) - (b[1].timesAsked || 0))
    .slice(0, count)
    .map(([id]) => id);
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
      categoryPerformance: {},
    };
  }

  const totalTests = results.length;
  const averageScore =
    results.reduce((acc, r) => acc + r.percentage, 0) / totalTests;

  const categoryStats: Record<string, { total: number; count: number }> = {};
  results.forEach(r => {
    if (!categoryStats[r.category])
      categoryStats[r.category] = { total: 0, count: 0 };
    categoryStats[r.category].total += r.percentage;
    categoryStats[r.category].count++;
  });

  const categoryPerformance: Record<string, { avg: number; count: number }> = {};
  Object.entries(categoryStats).forEach(([cat, stats]) => {
    categoryPerformance[cat] = {
      avg: stats.total / stats.count,
      count: stats.count,
    };
  });

  const bestCategory =
    Object.entries(categoryPerformance).sort(
      (a, b) => b[1].avg - a[1].avg
    )[0]?.[0] || 'N/A';

  return {
    totalTests,
    averageScore,
    bestCategory,
    streakDays: data.streakDays,
    recentResults: results.slice(-10).reverse(),
    categoryPerformance,
  };
}
