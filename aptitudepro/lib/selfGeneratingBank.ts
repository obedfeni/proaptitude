// selfGeneratingBank.ts
// Drop this file next to questions.ts — no other changes needed.

import {
  Question,
  QuestionBank,
  QUESTION_BANK,
  buildBlendedTest,
} from './questions';

// ── SSR-safe localStorage helpers ─────────────────────────────────────────────
// Next.js renders on the server where `window` / `localStorage` do not exist.
// Always guard every read/write with this helper.

function safeGetItem(key: string): string | null {
  if (typeof window === 'undefined') return null;
  try { return localStorage.getItem(key); } catch { return null; }
}

function safeSetItem(key: string, value: string): void {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem(key, value); } catch { /* quota exceeded or private mode */ }
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface TemplateParameter {
  min: number;
  max: number;
  step?: number;
}

interface QuestionTemplate {
  id: string;
  category: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  parameters: Record<string, TemplateParameter>;
  generate: (params: Record<string, number>) => Omit<
    Question,
    'id' | 'category' | 'type' | 'difficulty' | 'weight' | 'timesAsked' | 'timesCorrect'
  >;
}

export interface EvolvedQuestion extends Question {
  parentId?: string;
  evolutionCount: number;
}

export interface PendingQuestion extends Question {
  submittedBy: string;
  submittedAt: number;
  votes: number;
  flags: { userId: string; reason: string; timestamp: number }[];
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewedAt?: number;
}

export interface PerformanceStats {
  [questionId: string]: {
    timesAsked: number;
    timesCorrect: number;
    avgResponseTime?: number;
    lastSeen: number;
    difficultyRating: number;
    category: string;
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function randomParam(p: TemplateParameter): number {
  if (p.step) {
    const steps = Math.floor((p.max - p.min) / p.step);
    return p.min + Math.floor(Math.random() * (steps + 1)) * p.step;
  }
  return Math.floor(Math.random() * (p.max - p.min + 1)) + p.min;
}

function makeId(prefix: string, i: number): string {
  return `gen-${prefix}-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 7)}`;
}

function blankQuestion(
  category: string,
  difficulty: 1 | 2 | 3 | 4 | 5,
  partial: ReturnType<QuestionTemplate['generate']>,
  id: string
): Question {
  return {
    id,
    category,
    type: category as Question['type'],
    difficulty,
    weight: 1.0,
    timesAsked: 0,
    timesCorrect: 0,
    table: '',
    diagram: '',
    passage: '',
    ...partial,
  } as Question;
}

// ── Template Engine ───────────────────────────────────────────────────────────

class TemplateEngine {
  private templates: QuestionTemplate[] = [];

  constructor() {
    this.init();
  }

  private add(t: QuestionTemplate) {
    this.templates.push(t);
  }

  private init() {
    // ── Numerical ──────────────────────────────────────────────────────────
    this.add({
      id: 'num_pct', category: 'numerical', difficulty: 2,
      parameters: { a: { min: 5, max: 95, step: 5 }, b: { min: 100, max: 1000, step: 100 } },
      generate: ({ a, b }) => {
        const ans = (a * b) / 100;
        return {
          question: `What is ${a}% of ${b}?`,
          options: [ans.toFixed(0), (ans + 10).toFixed(0), (ans - 10).toFixed(0), (ans + 25).toFixed(0)],
          correct: 0,
          explanation: `${a}% of ${b} = (${a}/100) × ${b} = ${ans.toFixed(0)}`,
        };
      },
    });

    this.add({
      id: 'num_discount', category: 'numerical', difficulty: 3,
      parameters: { discount: { min: 10, max: 40, step: 5 }, price: { min: 500, max: 5000, step: 500 } },
      generate: ({ discount, price }) => {
        const sp = price * (1 - discount / 100);
        return {
          question: `A shopkeeper offers ${discount}% discount on an item marked Rs. ${price}. What is the selling price?`,
          options: [`Rs. ${sp.toFixed(0)}`, `Rs. ${(sp + 50).toFixed(0)}`, `Rs. ${(sp - 50).toFixed(0)}`, `Rs. ${(price * 0.9).toFixed(0)}`],
          correct: 0,
          explanation: `SP = ${price} × (1 − ${discount}/100) = Rs. ${sp.toFixed(0)}`,
        };
      },
    });

    this.add({
      id: 'num_ratio', category: 'numerical', difficulty: 3,
      parameters: { r1: { min: 2, max: 7 }, r2: { min: 3, max: 9 }, val: { min: 20, max: 100, step: 10 } },
      generate: ({ r1, r2, val }) => {
        const ans = (val * r2) / r1;
        return {
          question: `The ratio of A:B is ${r1}:${r2}. If A is ${val}, what is B?`,
          options: [ans.toFixed(0), (ans + 10).toFixed(0), (ans - 10).toFixed(0), (ans * 2).toFixed(0)],
          correct: 0,
          explanation: `B = (A × ${r2}) / ${r1} = ${ans.toFixed(0)}`,
        };
      },
    });

    this.add({
      id: 'num_avg', category: 'numerical', difficulty: 2,
      parameters: { a: { min: 10, max: 50 }, b: { min: 20, max: 60 }, c: { min: 30, max: 70 }, d: { min: 40, max: 80 }, e: { min: 50, max: 90 } },
      generate: ({ a, b, c, d, e }) => {
        const avg = (a + b + c + d + e) / 5;
        return {
          question: `Find the average of ${a}, ${b}, ${c}, ${d}, ${e}.`,
          options: [avg.toFixed(1), (avg + 5).toFixed(1), (avg - 5).toFixed(1), (avg + 10).toFixed(1)],
          correct: 0,
          explanation: `Average = (${a}+${b}+${c}+${d}+${e}) / 5 = ${avg.toFixed(1)}`,
        };
      },
    });

    this.add({
      id: 'num_profit', category: 'numerical', difficulty: 3,
      parameters: { cp: { min: 100, max: 500, step: 50 }, sp: { min: 120, max: 600, step: 50 } },
      generate: ({ cp, sp }) => {
        const profit = ((sp - cp) / cp) * 100;
        return {
          question: `Cost price = Rs. ${cp}, Selling price = Rs. ${sp}. Find profit percentage.`,
          options: [`${profit.toFixed(1)}%`, `${(profit + 5).toFixed(1)}%`, `${(profit - 5).toFixed(1)}%`, `${(profit * 1.5).toFixed(1)}%`],
          correct: 0,
          explanation: `Profit% = ((${sp}−${cp})/${cp}) × 100 = ${profit.toFixed(1)}%`,
        };
      },
    });

    this.add({
      id: 'num_si', category: 'numerical', difficulty: 3,
      parameters: { p: { min: 1000, max: 10000, step: 1000 }, r: { min: 5, max: 15 }, t: { min: 1, max: 5 } },
      generate: ({ p, r, t }) => {
        const si = (p * r * t) / 100;
        return {
          question: `Principal = Rs. ${p}, Rate = ${r}% p.a., Time = ${t} year(s). Find Simple Interest.`,
          options: [`Rs. ${si.toFixed(0)}`, `Rs. ${(si + 500).toFixed(0)}`, `Rs. ${(si - 500).toFixed(0)}`, `Rs. ${(si * 2).toFixed(0)}`],
          correct: 0,
          explanation: `SI = (${p} × ${r} × ${t}) / 100 = Rs. ${si.toFixed(0)}`,
        };
      },
    });

    // ── Logical ───────────────────────────────────────────────────────────
    this.add({
      id: 'log_arith', category: 'logical', difficulty: 2,
      parameters: { start: { min: 1, max: 10 }, step: { min: 2, max: 5 } },
      generate: ({ start, step }) => {
        const [n1, n2, n3, n4] = [start, start + step, start + step * 2, start + step * 3];
        return {
          question: `Complete the sequence: ${n1}, ${n2}, ${n3}, ?`,
          options: [n4.toString(), (n4 + step).toString(), (n4 - step).toString(), (n4 * 2).toString()],
          correct: 0,
          explanation: `Add ${step} each time: ${n1} → ${n2} → ${n3} → ${n4}`,
        };
      },
    });

    this.add({
      id: 'log_geo', category: 'logical', difficulty: 3,
      parameters: { start: { min: 2, max: 5 }, ratio: { min: 2, max: 4 } },
      generate: ({ start, ratio }) => {
        const n1 = start, n2 = start * ratio, n3 = n2 * ratio, n4 = n3 * ratio;
        return {
          question: `Complete the sequence: ${n1}, ${n2}, ${n3}, ?`,
          options: [n4.toString(), (n4 * ratio).toString(), (n4 / ratio).toString(), (n4 + ratio).toString()],
          correct: 0,
          explanation: `Multiply by ${ratio} each time: ${n1} → ${n2} → ${n3} → ${n4}`,
        };
      },
    });

    this.add({
      id: 'log_letters', category: 'logical', difficulty: 3,
      parameters: { startCode: { min: 65, max: 80 }, step: { min: 1, max: 3 } },
      generate: ({ startCode, step }) => {
        const c = (n: number) => String.fromCharCode(n);
        const [l1, l2, l3, l4] = [startCode, startCode + step, startCode + step * 2, startCode + step * 3].map(c);
        return {
          question: `Complete the letter sequence: ${l1}, ${l2}, ${l3}, ?`,
          options: [l4, c(l4.charCodeAt(0) + step), c(l4.charCodeAt(0) - step), l1],
          correct: 0,
          explanation: `Add ${step} positions each time: ${l1} → ${l2} → ${l3} → ${l4}`,
        };
      },
    });

    // ── Verbal ────────────────────────────────────────────────────────────
    this.add({
      id: 'verb_synonym', category: 'verbal', difficulty: 2,
      parameters: { wordIndex: { min: 0, max: 7 } },
      generate: ({ wordIndex }) => {
        const words = [
          { word: 'Happy',     correct: 'Joyful',      wrong: ['Sad',    'Angry',  'Tired']    },
          { word: 'Big',       correct: 'Large',        wrong: ['Small',  'Tiny',   'Narrow']   },
          { word: 'Fast',      correct: 'Quick',        wrong: ['Slow',   'Lazy',   'Steady']   },
          { word: 'Smart',     correct: 'Intelligent',  wrong: ['Dull',   'Slow',   'Stupid']   },
          { word: 'Brave',     correct: 'Courageous',   wrong: ['Scared', 'Timid',  'Fearful']  },
          { word: 'Beautiful', correct: 'Attractive',   wrong: ['Ugly',   'Plain',  'Dull']     },
          { word: 'Rich',      correct: 'Wealthy',      wrong: ['Poor',   'Broke',  'Needy']    },
          { word: 'Quiet',     correct: 'Silent',       wrong: ['Loud',   'Noisy',  'Chatty']   },
        ];
        const item = words[wordIndex % words.length];
        return {
          question: `Select the synonym of "${item.word}":`,
          options: [item.correct, ...item.wrong],
          correct: 0,
          explanation: `"${item.word}" means the same as "${item.correct}"`,
        };
      },
    });

    this.add({
      id: 'verb_antonym', category: 'verbal', difficulty: 2,
      parameters: { wordIndex: { min: 0, max: 3 } },
      generate: ({ wordIndex }) => {
        const words = [
          { word: 'Hot',    correct: 'Cold', wrong: ['Warm',      'Boiling',    'Heat']      },
          { word: 'Dark',   correct: 'Light', wrong: ['Night',    'Black',      'Dim']        },
          { word: 'Strong', correct: 'Weak',  wrong: ['Powerful', 'Tough',      'Sturdy']    },
          { word: 'Rich',   correct: 'Poor',  wrong: ['Wealthy',  'Affluent',   'Prosperous'] },
        ];
        const item = words[wordIndex % words.length];
        return {
          question: `Select the antonym of "${item.word}":`,
          options: [item.correct, ...item.wrong],
          correct: 0,
          explanation: `The opposite of "${item.word}" is "${item.correct}"`,
        };
      },
    });

    // ── Spatial ───────────────────────────────────────────────────────────
    this.add({
      id: 'spatial_faces', category: 'spatial', difficulty: 2,
      parameters: { shapeIndex: { min: 0, max: 3 } },
      generate: ({ shapeIndex }) => {
        const shapes = [
          { name: 'cube',                  faces: 6,  wrong: [4, 8, 12] },
          { name: 'tetrahedron',           faces: 4,  wrong: [3, 5, 6]  },
          { name: 'octahedron',            faces: 8,  wrong: [6, 10, 12]},
          { name: 'square-base pyramid',   faces: 5,  wrong: [4, 6, 8]  },
        ];
        const s = shapes[shapeIndex % shapes.length];
        return {
          question: `How many faces does a ${s.name} have?`,
          options: [s.faces.toString(), ...s.wrong.map(String)],
          correct: 0,
          explanation: `A ${s.name} has ${s.faces} faces.`,
        };
      },
    });

    this.add({
      id: 'spatial_edges', category: 'spatial', difficulty: 3,
      parameters: { shapeIndex: { min: 0, max: 2 } },
      generate: ({ shapeIndex }) => {
        const shapes = [
          { name: 'cube',             edges: 12, wrong: [8, 10, 14] },
          { name: 'tetrahedron',      edges: 6,  wrong: [4, 5, 8]   },
          { name: 'triangular prism', edges: 9,  wrong: [8, 10, 12] },
        ];
        const s = shapes[shapeIndex % shapes.length];
        return {
          question: `How many edges does a ${s.name} have?`,
          options: [s.edges.toString(), ...s.wrong.map(String)],
          correct: 0,
          explanation: `A ${s.name} has ${s.edges} edges.`,
        };
      },
    });

    // ── Electrical ────────────────────────────────────────────────────────
    this.add({
      id: 'elec_ohm', category: 'electrical', difficulty: 2,
      parameters: { v: { min: 12, max: 240, step: 12 }, r: { min: 10, max: 100, step: 10 } },
      generate: ({ v, r }) => {
        const i = v / r;
        return {
          question: `A circuit has voltage ${v}V and resistance ${r}Ω. What is the current?`,
          options: [`${i.toFixed(1)}A`, `${(i * 2).toFixed(1)}A`, `${(i / 2).toFixed(1)}A`, `${(i + 0.5).toFixed(1)}A`],
          correct: 0,
          explanation: `Ohm's Law: I = V/R = ${v}/${r} = ${i.toFixed(1)}A`,
        };
      },
    });

    this.add({
      id: 'elec_power', category: 'electrical', difficulty: 2,
      parameters: { v: { min: 12, max: 240, step: 12 }, i: { min: 1, max: 10 } },
      generate: ({ v, i }) => {
        const p = v * i;
        return {
          question: `A device operates at ${v}V and draws ${i}A. What is the power consumption?`,
          options: [`${p}W`, `${p * 2}W`, `${p / 2}W`, `${p + 50}W`],
          correct: 0,
          explanation: `P = V × I = ${v} × ${i} = ${p}W`,
        };
      },
    });

    this.add({
      id: 'elec_series', category: 'electrical', difficulty: 3,
      parameters: { r1: { min: 10, max: 50, step: 10 }, r2: { min: 20, max: 60, step: 10 }, r3: { min: 30, max: 70, step: 10 } },
      generate: ({ r1, r2, r3 }) => {
        const rt = r1 + r2 + r3;
        return {
          question: `Three resistors ${r1}Ω, ${r2}Ω, ${r3}Ω in series. Total resistance?`,
          options: [`${rt}Ω`, `${rt - 10}Ω`, `${rt + 10}Ω`, `${rt / 2}Ω`],
          correct: 0,
          explanation: `Series: R = ${r1}+${r2}+${r3} = ${rt}Ω`,
        };
      },
    });

    this.add({
      id: 'elec_parallel', category: 'electrical', difficulty: 4,
      parameters: { r1: { min: 10, max: 50, step: 10 }, r2: { min: 20, max: 60, step: 10 } },
      generate: ({ r1, r2 }) => {
        const rt = (r1 * r2) / (r1 + r2);
        return {
          question: `Two resistors ${r1}Ω and ${r2}Ω in parallel. Total resistance?`,
          options: [`${rt.toFixed(1)}Ω`, `${(rt + 5).toFixed(1)}Ω`, `${(rt - 5).toFixed(1)}Ω`, `${(rt * 2).toFixed(1)}Ω`],
          correct: 0,
          explanation: `1/R = 1/${r1}+1/${r2} → R = ${rt.toFixed(1)}Ω`,
        };
      },
    });

    // ── Mechanical ────────────────────────────────────────────────────────
    this.add({
      id: 'mech_lever', category: 'mechanical', difficulty: 3,
      parameters: { load: { min: 100, max: 500, step: 50 }, effort: { min: 50, max: 200, step: 25 } },
      generate: ({ load, effort }) => {
        const ma = (load / effort).toFixed(1);
        return {
          question: `A lever lifts ${load}N with effort ${effort}N. What is the mechanical advantage?`,
          options: [ma, (parseFloat(ma) + 0.5).toFixed(1), (parseFloat(ma) - 0.5).toFixed(1), (parseFloat(ma) * 2).toFixed(1)],
          correct: 0,
          explanation: `MA = Load/Effort = ${load}/${effort} = ${ma}`,
        };
      },
    });

    this.add({
      id: 'mech_gear', category: 'mechanical', difficulty: 3,
      parameters: { t1: { min: 20, max: 40, step: 10 }, t2: { min: 40, max: 80, step: 10 }, rpm: { min: 60, max: 180, step: 30 } },
      generate: ({ t1, t2, rpm }) => {
        const out = (rpm * t1) / t2;
        return {
          question: `Gear A has ${t1} teeth, Gear B has ${t2} teeth. A rotates at ${rpm} RPM. B rotates at?`,
          options: [`${out} RPM`, `${out * 2} RPM`, `${out / 2} RPM`, `${out + 20} RPM`],
          correct: 0,
          explanation: `B RPM = ${rpm} × ${t1}/${t2} = ${out} RPM`,
        };
      },
    });

    // ── Abstract ──────────────────────────────────────────────────────────
    this.add({
      id: 'abs_power', category: 'abstract', difficulty: 2,
      parameters: { start: { min: 1, max: 5 }, multiplier: { min: 2, max: 4 } },
      generate: ({ start, multiplier }) => {
        const m = multiplier;
        const [n1, n2, n3, n4] = [start, start * m, start * m * m, start * m * m * m];
        return {
          question: `What comes next? ${n1}, ${n2}, ${n3}, ___`,
          options: [n4.toString(), (n4 + m).toString(), (n4 * m).toString(), (n4 - m).toString()],
          correct: 0,
          explanation: `Multiply by ${m} each time: ${n1} → ${n2} → ${n3} → ${n4}`,
        };
      },
    });
  }

  generateQuestions(category: string, count: number): Question[] {
    const pool = this.templates.filter(t => t.category === category);
    if (!pool.length) return [];
    return Array.from({ length: count }, (_, i) => {
      const tmpl = pool[i % pool.length];
      const params: Record<string, number> = {};
      for (const [k, p] of Object.entries(tmpl.parameters)) params[k] = randomParam(p);
      return blankQuestion(tmpl.category, tmpl.difficulty, tmpl.generate(params), makeId(tmpl.id, i));
    });
  }

  get count() { return this.templates.length; }
}

// ── Evolution Engine ──────────────────────────────────────────────────────────

class EvolutionEngine {
  evolve(question: Question, stats: PerformanceStats[string]): EvolvedQuestion | null {
    if (stats.timesAsked < 20) return null;
    const accuracy = stats.timesCorrect / stats.timesAsked;
    if (accuracy > 0.85 && question.difficulty >= 5) return null;
    if (accuracy < 0.35 && question.difficulty <= 1) return null;
    if (accuracy >= 0.35 && accuracy <= 0.85) return null;

    const evolved: EvolvedQuestion = {
      ...question,
      id: `evo-${question.id}-${Date.now()}`,
      parentId: question.id,
      evolutionCount: 1,
      difficulty: (accuracy > 0.85
        ? Math.min(5, question.difficulty + 1)
        : Math.max(1, question.difficulty - 1)) as Question['difficulty'],
      explanation: `[${accuracy > 0.85 ? 'Evolved' : 'Simplified'}] ${question.explanation}`,
    };
    return evolved;
  }
}

// ── Crowd Bank ────────────────────────────────────────────────────────────────

class CrowdBank {
  private pending: PendingQuestion[] = [];
  private readonly KEY = 'crowd_questions';

  constructor() { this.load(); }

  private load() {
    // FIX: SSR-safe localStorage access
    const s = safeGetItem(this.KEY);
    if (s) {
      try { this.pending = JSON.parse(s); } catch { this.pending = []; }
    }
  }

  private save() {
    safeSetItem(this.KEY, JSON.stringify(this.pending));
  }

  submit(q: Omit<Question, 'id' | 'timesAsked' | 'timesCorrect' | 'weight'>, userId: string): string {
    const id = `pending-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    this.pending.push({
      ...q, id, weight: 1, timesAsked: 0, timesCorrect: 0,
      submittedBy: userId, submittedAt: Date.now(),
      votes: 1, flags: [], status: 'pending',
    });
    this.save();
    return id;
  }

  vote(id: string, up: boolean) {
    const q = this.pending.find(p => p.id === id);
    if (q) { q.votes += up ? 1 : -1; this.save(); }
  }

  flag(id: string, userId: string, reason: string) {
    const q = this.pending.find(p => p.id === id);
    if (q) { q.flags.push({ userId, reason, timestamp: Date.now() }); this.save(); }
  }

  /** Returns approved Question or null. Auto-approves at 5+ votes, 0 flags. */
  approve(id: string, reviewerId: string): Question | null {
    const idx = this.pending.findIndex(p => p.id === id);
    if (idx === -1) return null;
    const p = this.pending[idx];
    if (p.votes < 5 || p.flags.length > 0) return null;

    p.status = 'approved'; p.reviewedBy = reviewerId; p.reviewedAt = Date.now();
    const approved: Question = { ...p, id: `crowd-${Date.now()}-${p.id}`, timesAsked: 0, timesCorrect: 0 };
    this.pending.splice(idx, 1);
    this.save();
    return approved;
  }

  getPending(): PendingQuestion[] { return [...this.pending]; }

  getStats() {
    const pending = this.pending.filter(p => p.status === 'pending').length;
    const totalVotes = this.pending.reduce((s, q) => s + q.votes, 0);
    return { pending, totalVotes, avgVotes: this.pending.length ? totalVotes / this.pending.length : 0 };
  }
}

// ── Self-Generating Bank ──────────────────────────────────────────────────────

export class SelfGeneratingBank {
  private templates = new TemplateEngine();
  private evolution = new EvolutionEngine();
  private crowd = new CrowdBank();
  private stats: PerformanceStats = {};
  private readonly STATS_KEY = 'question_performance';

  constructor() { this.loadStats(); }

  // ── Stats persistence ──────────────────────────────────────────────────

  private loadStats() {
    // FIX: SSR-safe localStorage access
    const s = safeGetItem(this.STATS_KEY);
    if (s) {
      try { this.stats = JSON.parse(s); } catch { this.stats = {}; }
    }
  }

  private saveStats() {
    safeSetItem(this.STATS_KEY, JSON.stringify(this.stats));
  }

  // ── Public API ─────────────────────────────────────────────────────────

  /**
   * Records a user's answer. Call this after every answered question.
   * @param questionId  The question's id field
   * @param correct     Whether the user answered correctly
   * @param category    The question's category (required for stats initialisation)
   * @param responseMs  Optional response time in milliseconds
   */
  recordAnswer(questionId: string, correct: boolean, category: string, responseMs?: number): void {
    if (!this.stats[questionId]) {
      this.stats[questionId] = {
        timesAsked: 0,
        timesCorrect: 0,
        lastSeen: Date.now(),
        difficultyRating: 3,
        category,
      };
    }
    const s = this.stats[questionId];
    s.timesAsked++;
    if (correct) s.timesCorrect++;
    if (responseMs !== undefined) s.avgResponseTime = responseMs;
    s.lastSeen = Date.now();
    const acc = s.timesCorrect / s.timesAsked;
    if (acc > 0.8) s.difficultyRating = Math.min(5, s.difficultyRating + 0.1);
    if (acc < 0.4) s.difficultyRating = Math.max(1, s.difficultyRating - 0.1);
    this.saveStats();
  }

  /**
   * Builds a blended test, mixing the static bank, generated, and crowd questions.
   * Delegates base selection to buildBlendedTest() from questions.ts.
   *
   * @param category   Category key e.g. 'numerical'
   * @param count      Total questions wanted (default 10)
   * @param excludeIds Question IDs to exclude
   */
  getQuestions(category: string, count = 10, excludeIds: string[] = []): Question[] {
    const statsForBank: Record<string, { timesAsked: number; timesCorrect: number }> = {};
    for (const [id, s] of Object.entries(this.stats)) {
      statsForBank[id] = { timesAsked: s.timesAsked, timesCorrect: s.timesCorrect };
    }

    // 60% from the static bank (adaptive via buildBlendedTest)
    const baseCount = Math.round(count * 0.6);
    const base = buildBlendedTest(category, baseCount, excludeIds, statsForBank);

    // 30% generated from templates
    const genCount = Math.round(count * 0.3);
    const generated = this.templates.generateQuestions(category, genCount);

    // Remainder from crowd (pending with 3+ votes) — typically 1 slot for count=10
    const crowdTarget = count - base.length - generated.length;
    const crowd: Question[] = crowdTarget > 0
      ? (this.crowd.getPending()
          .filter(p => p.status === 'pending' && p.category === category && p.votes >= 3)
          .slice(0, crowdTarget) as Question[])
      : [];

    // Fisher-Yates merge shuffle
    const merged = [...base, ...generated, ...crowd];
    for (let i = merged.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [merged[i], merged[j]] = [merged[j], merged[i]];
    }

    return merged.slice(0, count);
  }

  /**
   * Scans all performance stats and evolves questions that have been seen 20+ times.
   * Returns newly evolved question variants.
   * NOTE: Only static bank questions can be evolved (generated Qs have ephemeral IDs).
   */
  evolveAndImprove(): EvolvedQuestion[] {
    const evolved: EvolvedQuestion[] = [];
    for (const [id, stats] of Object.entries(this.stats)) {
      let original: Question | undefined;
      for (const qs of Object.values(QUESTION_BANK)) {
        original = qs.find(q => q.id === id);
        if (original) break;
      }
      if (!original) continue;
      const e = this.evolution.evolve(original, stats);
      if (e) evolved.push(e);
    }
    return evolved;
  }

  /** Submit a user-contributed question for community review. */
  submitQuestion(
    q: Omit<Question, 'id' | 'timesAsked' | 'timesCorrect' | 'weight'>,
    userId: string
  ): string {
    return this.crowd.submit(q, userId);
  }

  voteQuestion(questionId: string, upvote: boolean): void {
    this.crowd.vote(questionId, upvote);
  }

  flagQuestion(questionId: string, userId: string, reason: string): void {
    this.crowd.flag(questionId, userId, reason);
  }

  approvePending(questionId: string, reviewerId: string): Question | null {
    return this.crowd.approve(questionId, reviewerId);
  }

  getCrowdStats() { return this.crowd.getStats(); }
  getPerformanceStats(): PerformanceStats { return { ...this.stats }; }

  getCategoryInsights(category: string) {
    const questions = QUESTION_BANK[category] ?? [];
    let totalCorrect = 0, totalAttempts = 0;
    const perf: { id: string; accuracy: number }[] = [];

    for (const q of questions) {
      const s = this.stats[q.id];
      if (s && s.timesAsked > 0) {
        const acc = s.timesCorrect / s.timesAsked;
        totalCorrect += s.timesCorrect;
        totalAttempts += s.timesAsked;
        perf.push({ id: q.id, accuracy: acc });
      }
    }

    perf.sort((a, b) => a.accuracy - b.accuracy);
    return {
      accuracy: totalAttempts > 0 ? totalCorrect / totalAttempts : 0,
      totalAttempts,
      weakTopics:   perf.slice(0, 3).map(p => p.id),
      strongTopics: perf.slice(-3).map(p => p.id),
    };
  }

  get templateCount() { return this.templates.count; }
}

// ── Singleton factory ─────────────────────────────────────────────────────────
// Returns a new instance each call — use useMemo/useRef in React to avoid
// re-creating on every render (see AptitudeApp.tsx).
export function createSelfGeneratingBank(): SelfGeneratingBank {
  return new SelfGeneratingBank();
}
