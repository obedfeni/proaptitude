// selfGeneratingBank.ts
// Works alongside questions.ts — zero changes needed to questions.ts.
//
// HOW IT WORKS:
//   1. Imports QUESTION_BANK and buildBlendedTest from questions.ts (unchanged)
//   2. At module load, injectExtendedQuestions() pushes new questions directly
//      into QUESTION_BANK — so buildBlendedTest automatically sees them
//   3. SelfGeneratingBank.getQuestions() calls buildBlendedTest() (now with
//      the extended pool) then tops up with template-generated + crowd questions

import {
  Question,
  QuestionBank,
  QUESTION_BANK,
  buildBlendedTest,
} from './questions';

// ── SSR-safe localStorage helpers ─────────────────────────────────────────────
function safeGetItem(key: string): string | null {
  if (typeof window === 'undefined') return null;
  try { return localStorage.getItem(key); } catch { return null; }
}
function safeSetItem(key: string, value: string): void {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem(key, value); } catch { /* quota or private mode */ }
}

// ── Types ─────────────────────────────────────────────────────────────────────
interface TemplateParameter { min: number; max: number; step?: number; }

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

// ── New passage constants ─────────────────────────────────────────────────────
// Passages already defined in questions.ts are referenced by the questions
// already in QUESTION_BANK. The passages below are for the NEW extended
// questions added by this file only.

const QE_P = `Quantitative easing (QE) involves central banks purchasing financial assets to inject liquidity into the economy. The Bank of England's asset purchases reached £895 billion by 2022. Proponents argue QE stabilises markets and reduces borrowing costs. Critics argue it exacerbates wealth inequality by inflating asset prices benefiting those who own them.`;

const AI_P = `Major banks now use machine learning for credit scoring, fraud detection, and portfolio optimisation. These systems can process thousands of variables simultaneously. However, regulators have raised concerns about algorithmic bias and systemic risk from correlated AI failures across institutions. Model opacity also presents challenges for accountability.`;

const CLIMATE_P = `ESG (Environmental, Social, Governance) investing has grown substantially, with global ESG assets exceeding $35 trillion by 2020. Research suggests firms with strong ESG scores demonstrate lower cost of capital and better long-term financial resilience. However, critics note that ESG metrics lack standardisation, and causality remains debated.`;

const WG_P4 = `A growing number of organisations have adopted hybrid working models that combine remote and in-office work. Proponents argue that hybrid systems improve employee autonomy, reduce commuting time, and expand access to a broader talent pool. Some studies report increases in self-reported productivity under hybrid arrangements. However, critics note that productivity metrics are often inconsistent and may not capture long-term output quality. They also argue that hybrid systems can create coordination inefficiencies, particularly in large teams where informal communication plays a key role. Additionally, junior employees may receive fewer mentoring opportunities compared to fully in-office environments.`;

const WG_P5 = `Artificial intelligence systems are increasingly being deployed in financial decision-making processes such as credit scoring, fraud detection, and portfolio management. These systems can process large datasets faster than traditional methods and identify patterns that may not be visible to human analysts. Nevertheless, concerns remain regarding model transparency and bias. Some researchers argue that AI systems may reproduce historical inequalities present in training data. Others highlight the risk of over-reliance on automated systems, particularly when human oversight is reduced. Regulatory bodies have begun exploring frameworks to ensure accountability in AI-driven financial decisions, though consensus on global standards has not yet been achieved.`;

const WG_P6 = `Environmental, Social, and Governance (ESG) criteria have become increasingly integrated into corporate strategy and investment decision-making. Many institutional investors now consider ESG performance as part of their risk assessment process. Supporters argue that firms with strong ESG profiles may benefit from improved reputation, lower cost of capital, and stronger long-term resilience. However, critics caution that ESG metrics lack standardisation, making comparisons across firms difficult. Some studies suggest a correlation between ESG performance and financial returns, but causation remains contested due to confounding factors such as industry type and firm size.`;

const WG_P7 = `Remote work has significantly altered labour market dynamics by enabling firms to hire employees beyond geographical constraints. This has increased access to global talent pools and allowed some organisations to reduce operational costs. However, labour economists note that remote work may also contribute to regional inequality, as high-skilled jobs become concentrated in digitally connected sectors. Additionally, some workers report weaker organisational culture and reduced opportunities for career advancement. The long-term effects of remote work on productivity and labour market structure remain uncertain and continue to be studied.`;

const WG_P8 = `Several cities have introduced congestion pricing schemes to reduce traffic in central business districts. The policy charges drivers a fee to enter high-traffic zones during peak hours. Proponents argue that congestion pricing reduces travel time, lowers emissions, and encourages the use of public transportation. However, critics argue that such policies disproportionately affect low- and middle-income commuters who rely on private vehicles. In some cases, alternative public transport infrastructure has not expanded at the same rate as demand shifts, leading to overcrowding. Early evaluations show mixed outcomes depending on city layout, availability of alternatives, and enforcement mechanisms.`;

const WG_P9 = `Digital learning platforms have expanded access to education by allowing students to learn remotely and at their own pace. These systems often use adaptive algorithms to personalise learning content based on student performance. While some studies show improved engagement and flexibility, others suggest that self-directed learning requires higher levels of discipline, which may disadvantage certain learners. Additionally, concerns have been raised about unequal access to devices and stable internet connections.`;

const WG_P10 = `Pharmaceutical companies conduct clinical trials to test the safety and effectiveness of new drugs. These trials typically progress through multiple phases, each designed to evaluate different aspects such as dosage, side effects, and overall efficacy. While randomised controlled trials are considered the gold standard, critics argue that trial populations may not fully represent real-world patients. This can lead to differences between observed trial results and actual clinical outcomes. Regulatory agencies require evidence of both safety and efficacy before approving new medications for public use.`;

const WG_P11 = `Governments and corporations are increasingly adopting net-zero carbon targets. These targets aim to balance emitted greenhouse gases with equivalent removal from the atmosphere. Supporters argue that clear targets encourage innovation in renewable energy and improve long-term environmental planning. However, critics argue that some organisations rely heavily on carbon offsetting, which may not reduce actual emissions. The effectiveness of net-zero strategies varies significantly depending on implementation methods and regulatory oversight.`;

const WG_P12 = `Automation technologies are increasingly being used to replace repetitive tasks in manufacturing, logistics, and administrative work. This shift has led to productivity gains in many sectors. However, economists note that while automation reduces demand for certain job categories, it may also create new roles requiring higher skill levels. The net effect on employment levels varies depending on industry structure and workforce adaptability. There is ongoing debate about whether automation leads to long-term job displacement or job transformation.`;

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
    id, category,
    type: category as Question['type'],
    difficulty, weight: 1.0, timesAsked: 0, timesCorrect: 0,
    table: '', diagram: '', passage: '',
    ...partial,
  } as Question;
}

/** Assigns stable prefixed IDs to a raw question list and fills in Question defaults. */
function hydrateStatic(items: Partial<Question>[], prefix: string): Question[] {
  return items.map((q, i) => ({
    id: `ext-${prefix}-${i}`,
    type: (q.category ?? prefix) as Question['type'],
    weight: 1.0,
    timesAsked: 0,
    timesCorrect: 0,
    table: '',
    diagram: '',
    passage: '',
    difficulty: 3 as const,
    ...q,
  })) as Question[];
}

// ── Extended question definitions ─────────────────────────────────────────────
// These are ADDITIVE — they do not duplicate anything already in questions.ts.
// questions.ts already contains: base verbal, watson (WG_P1/P2/P3), numerical,
// and electrical. Everything below is genuinely new content.

const EXT_VERBAL: Partial<Question>[] = [
  // Hard critical reasoning (levels 4–5) — not in questions.ts base set
  { category:'verbal', difficulty:5, question:"A company increases automation and reports higher profits. Which is the strongest hidden assumption in concluding automation caused the profit increase?", options:["Profits were increasing before automation","No other major cost-cutting measures occurred simultaneously","Automation always reduces costs","Employees did not resist automation"], correct:1, explanation:"To attribute causation to automation, we must assume no other major confounding factors affected profits at the same time." },
  { category:'verbal', difficulty:4, question:"Which statement most weakens: 'Increasing minimum wage reduces unemployment because it increases consumer spending'?", options:["Consumer spending increases economic activity","Some businesses reduce hiring due to higher labor costs","Minimum wage varies across countries","Unemployment rates fluctuate seasonally"], correct:1, explanation:"Higher labor costs leading to reduced hiring directly undercuts the causal mechanism claimed." },
  { category:'verbal', difficulty:5, question:"If all policy reforms that reduce inflation also slow economic growth, what can be logically concluded?", options:["All inflation-reducing policies are harmful","Some inflation reduction may involve trade-offs with growth","Economic growth causes inflation","Inflation and growth are unrelated"], correct:1, explanation:"The premise establishes a consistent co-occurrence, supporting a trade-off — not a value judgment." },
  { category:'verbal', difficulty:4, question:"Choose the best synonym for 'obfuscate':", options:["Clarify","Confuse","Simplify","Reveal"], correct:1, explanation:"Obfuscate means to deliberately render something unclear or unintelligible." },
  { category:'verbal', difficulty:5, question:"Which sentence contains a subtle grammatical error?", options:["Neither of the answers are correct.","Each of the students is responsible for their work.","The data suggest a strong correlation.","He insisted that she be present."], correct:0, explanation:"'Neither' takes a singular verb — correct form is 'Neither of the answers is correct'." },
  { category:'verbal', difficulty:4, question:"Which inference is most reasonable given: 'Despite increased funding, test scores remained unchanged across schools.'", options:["Funding was ineffective in all cases","Increased funding did not directly translate into improved test scores","Schools misused all additional funds","Test scores are unrelated to education quality"], correct:1, explanation:"The evidence supports lack of observable effect — not a universal conclusion about funding." },
  { category:'verbal', difficulty:5, question:"A policy analyst argues: 'Since countries with high education spending have high GDP, increasing education spending will increase GDP.' What is the main flaw?", options:["Overgeneralization","Correlation implies causation","False dilemma","Circular reasoning"], correct:1, explanation:"The argument treats correlation as sufficient evidence of causation." },
  { category:'verbal', difficulty:4, question:"Select the best word: 'The scientist's theory was so ______ that it accounted for every anomaly without contradiction.'", options:["coherent","inconsistent","fragile","ambiguous"], correct:0, explanation:"Coherent means logically consistent and unified — the theory held together without internal contradictions." },
  { category:'verbal', difficulty:5, question:"Which argument is most logically valid?", options:["If A implies B, and B implies C, then C implies A","If all A are B, and all B are C, then all A are C","If some A are B, then all B are A","If A is true, then not A is also true"], correct:1, explanation:"Valid transitive syllogism: All A→B and All B→C therefore All A→C." },
  { category:'verbal', difficulty:4, question:"Which sentence best maintains formal academic tone?", options:["The results kinda show a big improvement.","The results clearly show significant improvement.","The results are pretty much better.","The results show a lot better outcomes, honestly."], correct:1, explanation:"Formal academic writing avoids colloquialisms and subjective intensifiers." },
  { category:'verbal', difficulty:4, passage:AI_P, question:"Which assumption is most necessary for the argument that AI regulation will reduce systemic risk?", options:["AI systems are currently unregulated","Regulators can identify correlated model failures","Financial institutions will fully replace human oversight","Systemic risk cannot be measured accurately"], correct:1, explanation:"The argument depends on regulators having the capability to identify and act on correlated failure patterns." },
  { category:'verbal', difficulty:5, question:"Which statement is the strongest inference from: 'All observed instances of policy X led to short-term gains but long-term instability'?", options:["Policy X should never be used","Policy X guarantees economic collapse","Policy X may involve a trade-off between short-term gains and long-term risks","Policy X is effective in all cases except recessions"], correct:2, explanation:"The evidence supports a probabilistic trade-off pattern — not an absolute prohibition or guarantee." },
  { category:'verbal', difficulty:4, question:"Select the grammatically strongest sentence:", options:["The results was significantly affected by external factors.","The results were significantly affected by external factors.","The result were significantly affected by external factors.","The results is significantly affected by external factors."], correct:1, explanation:"'Results' is plural and requires 'were'. All other options have subject-verb agreement errors." },
  { category:'verbal', difficulty:5, question:"A researcher claims: 'Because productivity increased after implementing flexible work, flexible work caused the increase.' What is the key logical flaw?", options:["False analogy","Circular reasoning","Post hoc ergo propter hoc","Equivocation"], correct:2, explanation:"Assuming causation purely from temporal sequence is the post hoc ergo propter hoc fallacy." },
  { category:'verbal', difficulty:4, question:"Which word best fits: 'The politician's statement was so ______ that it could be interpreted in multiple ways.'", options:["lucid","ambiguous","eloquent","rigorous"], correct:1, explanation:"Ambiguous means open to multiple valid interpretations." },
  { category:'verbal', difficulty:5, question:"Choose the sentence that best maintains parallel structure:", options:["The company aims to reduce costs, improving efficiency, and innovation.","The company aims to reduce costs, improve efficiency, and innovate.","The company aims reducing costs, improving efficiency, and to innovate.","The company aims to reduction of costs, efficiency improvement, and innovate."], correct:1, explanation:"Parallel structure requires matching grammatical form: reduce / improve / innovate are all base infinitives." },
  { category:'verbal', difficulty:4, question:"Which word is closest in meaning to 'intransigent'?", options:["Flexible","Unyielding","Confused","Generous"], correct:1, explanation:"Intransigent means refusing to change one's position or compromise." },
  { category:'verbal', difficulty:5, question:"Which statement best weakens: 'Remote work improves productivity because employees have fewer distractions'?", options:["Employees prefer working remotely","Some employees report increased home distractions and reduced focus","Companies save money on office space","Remote work is becoming more common globally"], correct:1, explanation:"This directly challenges the causal mechanism (fewer distractions) on which the argument depends." },
];

const EXT_WATSON: Partial<Question>[] = [
  // WG_P4 — Hybrid work (NEW passage)
  { category:'watson', difficulty:4, passage:WG_P4, question:"Hybrid working models always improve employee productivity compared to fully office-based systems.", options:["True","False","Cannot say"], correct:1, explanation:"The passage notes productivity metrics are inconsistent and coordination inefficiencies exist. 'Always' is too absolute and is not supported." },
  { category:'watson', difficulty:5, passage:WG_P4, question:"One limitation of hybrid work is that it may reduce the effectiveness of informal communication in teams.", options:["True","False","Cannot say"], correct:0, explanation:"The passage explicitly states hybrid systems create coordination inefficiencies due to informal communication being reduced." },
  { category:'watson', difficulty:4, passage:WG_P4, question:"Most companies in the study reported improved productivity after adopting flexible work policies.", options:["True","False","Cannot say"], correct:2, explanation:"The passage mentions productivity improvements but does not quantify whether a majority of companies reported them — 'most' cannot be verified." },
  { category:'watson', difficulty:5, passage:WG_P4, question:"Flexible working arrangements eliminate coordination problems in teams.", options:["True","False","Cannot say"], correct:1, explanation:"The passage states coordination challenges still exist for managers in hybrid environments, so they are clearly not eliminated." },
  // WG_P5 — AI in finance (NEW passage)
  { category:'watson', difficulty:4, passage:WG_P5, question:"AI systems in finance eliminate the need for human oversight.", options:["True","False","Cannot say"], correct:1, explanation:"The passage explicitly warns about the risks of reduced human oversight, confirming oversight remains necessary." },
  { category:'watson', difficulty:5, passage:WG_P5, question:"Bias in AI financial systems may originate from the data used to train them.", options:["True","False","Cannot say"], correct:0, explanation:"The passage directly states AI may reproduce historical inequalities present in training data." },
  // WG_P6 — ESG (NEW passage)
  { category:'watson', difficulty:4, passage:WG_P6, question:"ESG performance guarantees higher financial returns for all firms.", options:["True","False","Cannot say"], correct:1, explanation:"The passage says correlation exists but causation is contested. 'Guarantees' and 'all firms' are both unsupported." },
  { category:'watson', difficulty:5, passage:WG_P6, question:"Differences in industry type can affect observed relationships between ESG and financial performance.", options:["True","False","Cannot say"], correct:0, explanation:"The passage directly states industry type is a confounding factor in the observed relationship." },
  // WG_P7 — Remote work & labour markets (NEW passage)
  { category:'watson', difficulty:4, passage:WG_P7, question:"Remote work has eliminated regional inequality in labour markets.", options:["True","False","Cannot say"], correct:1, explanation:"The passage explicitly states remote work may increase regional inequality — the opposite of what is claimed." },
  { category:'watson', difficulty:5, passage:WG_P7, question:"The long-term effects of remote work on labour markets are fully understood.", options:["True","False","Cannot say"], correct:1, explanation:"The passage explicitly states these effects remain uncertain and are still being studied." },
  // WG_P8 — Congestion pricing (NEW passage)
  { category:'watson', difficulty:4, passage:WG_P8, question:"Congestion pricing always reduces traffic in all cities where it is implemented.", options:["True","False","Cannot say"], correct:1, explanation:"The passage states outcomes are mixed depending on city layout and available alternatives. 'Always' is directly contradicted." },
  { category:'watson', difficulty:5, passage:WG_P8, question:"The success of congestion pricing depends partly on the availability of alternative transport options.", options:["True","False","Cannot say"], correct:0, explanation:"The passage explicitly lists availability of alternatives as a key factor determining outcomes." },
  // WG_P9 — EdTech (NEW passage)
  { category:'watson', difficulty:4, passage:WG_P9, question:"Digital learning platforms improve educational outcomes for all students equally.", options:["True","False","Cannot say"], correct:1, explanation:"The passage notes disadvantages for certain learners and unequal access issues. Equal improvement for all is directly contradicted." },
  { category:'watson', difficulty:5, passage:WG_P9, question:"Access to reliable internet can influence the effectiveness of digital learning systems.", options:["True","False","Cannot say"], correct:0, explanation:"The passage explicitly raises unequal access to internet connections as a concern affecting learning." },
  // WG_P10 — Drug trials (NEW passage)
  { category:'watson', difficulty:4, passage:WG_P10, question:"All drugs that pass clinical trials are completely safe for all patients.", options:["True","False","Cannot say"], correct:1, explanation:"Trial populations may not represent all patient groups. 'Completely safe for all' is not supported." },
  { category:'watson', difficulty:5, passage:WG_P10, question:"Clinical trial results may not always reflect real-world patient outcomes.", options:["True","False","Cannot say"], correct:0, explanation:"The passage explicitly states trial populations may not represent real-world patients, leading to differences in outcomes." },
  // WG_P11 — Net-zero (NEW passage)
  { category:'watson', difficulty:4, passage:WG_P11, question:"All net-zero strategies result in immediate reductions in carbon emissions.", options:["True","False","Cannot say"], correct:1, explanation:"The passage notes effectiveness varies and some rely on offsetting, which may not reduce actual emissions. Immediate reductions are not guaranteed." },
  { category:'watson', difficulty:5, passage:WG_P11, question:"Carbon offsetting may not always lead to a reduction in actual emissions.", options:["True","False","Cannot say"], correct:0, explanation:"The passage explicitly states critics argue offsetting may not reduce actual emissions." },
  // WG_P12 — Automation (NEW passage)
  { category:'watson', difficulty:4, passage:WG_P12, question:"Automation always leads to job losses in the economy.", options:["True","False","Cannot say"], correct:1, explanation:"The passage states automation reduces some categories but also creates new roles. Universal job loss is not supported." },
  { category:'watson', difficulty:5, passage:WG_P12, question:"The impact of automation on employment depends on the ability of workers to adapt to new skill requirements.", options:["True","False","Cannot say"], correct:0, explanation:"The passage explicitly states outcomes vary based on workforce adaptability." },
  // Hard traps on existing QE_P / AI_P / CLIMATE_P (additional difficulty variants)
  { category:'watson', difficulty:4, passage:QE_P, question:"Quantitative easing directly increases income inequality in all cases.", options:["True","False","Cannot say"], correct:1, explanation:"The passage presents inequality as a debated criticism, not a proven universal outcome. 'All cases' and 'directly' are unsupported." },
  { category:'watson', difficulty:5, passage:QE_P, question:"The primary goal of quantitative easing is to increase wealth inequality.", options:["True","False","Cannot say"], correct:1, explanation:"QE is described as a monetary stabilisation tool. Inequality is a side-effect noted by critics, not its stated purpose." },
  { category:'watson', difficulty:4, passage:AI_P, question:"Algorithmic bias is the only risk associated with AI in financial services.", options:["True","False","Cannot say"], correct:1, explanation:"The passage mentions multiple risks (systemic risk, model opacity, correlated failures). 'Only risk' is directly contradicted." },
  { category:'watson', difficulty:5, passage:CLIMATE_P, question:"Firms with strong ESG scores always outperform financially.", options:["True","False","Cannot say"], correct:1, explanation:"The passage links ESG to average improvements, not guaranteed universal outperformance. 'Always' is unsupported." },
];

const EXT_NUMERICAL: Partial<Question>[] = [
  // Percentages
  { category:'numerical', difficulty:3, question:"A population increases from 50,000 to 60,000. What is the percentage increase?", options:["15%","18%","20%","25%"], correct:2, explanation:"Increase = 10,000. (10,000/50,000)×100 = 20%" },
  { category:'numerical', difficulty:3, question:"If a value decreases from 200 to 150, the percentage decrease is:", options:["20%","25%","30%","35%"], correct:1, explanation:"Decrease = 50. (50/200)×100 = 25%" },
  { category:'numerical', difficulty:4, question:"A number is increased by 20% and then decreased by 20%. The net change is:", options:["0%","4% decrease","4% increase","10% decrease"], correct:1, explanation:"Net = 1.2 × 0.8 = 0.96 → 4% net decrease" },
  // Profit & Loss
  { category:'numerical', difficulty:3, question:"A product costing Rs. 500 is sold for Rs. 600. Profit percentage is:", options:["10%","15%","20%","25%"], correct:2, explanation:"Profit = 100. (100/500)×100 = 20%" },
  { category:'numerical', difficulty:4, question:"A trader marks goods 30% above cost price and gives a 10% discount. Profit percentage is:", options:["15%","17%","18%","20%"], correct:1, explanation:"SP = 1.3 × 0.9 × CP = 1.17 × CP → 17% profit" },
  // Discounts
  { category:'numerical', difficulty:3, question:"An item marked at Rs. 1000 is sold at 20% discount. Selling price is:", options:["Rs. 700","Rs. 750","Rs. 800","Rs. 850"], correct:2, explanation:"Discount = Rs.200 → SP = Rs.800" },
  { category:'numerical', difficulty:4, question:"Two successive discounts of 10% and 20% are equivalent to a single discount of:", options:["28%","30%","32%","25%"], correct:0, explanation:"Effective = 1-(0.9×0.8) = 0.28 = 28%" },
  // Mean / Median / Mode
  { category:'numerical', difficulty:3, question:"Find the mean of 5, 10, 15, 20.", options:["10","12.5","15","17.5"], correct:1, explanation:"Sum = 50 → Mean = 50/4 = 12.5" },
  { category:'numerical', difficulty:4, question:"Median of 3, 7, 9, 15, 21 is:", options:["7","9","10","15"], correct:1, explanation:"Middle value of 5 ordered values (position 3) = 9" },
  { category:'numerical', difficulty:4, question:"Mode of 2, 4, 4, 6, 6, 6, 8 is:", options:["4","6","8","2"], correct:1, explanation:"6 appears three times — the most frequent value" },
  // Ratios
  { category:'numerical', difficulty:3, question:"Divide 360 in the ratio 2:3.", options:["120 and 240","144 and 216","150 and 210","180 and 180"], correct:1, explanation:"Total parts = 5. 360×(2/5)=144, 360×(3/5)=216" },
  { category:'numerical', difficulty:3, question:"If A:B = 3:5 and B:C = 4:7, find A:C.", options:["12:35","15:28","3:7","4:5"], correct:0, explanation:"A:B:C = 12:20:35 → A:C = 12:35" },
  { category:'numerical', difficulty:4, question:"The ratio of boys to girls in a class is 5:3. If there are 40 students, number of girls is:", options:["12","15","18","20"], correct:1, explanation:"Total parts = 8. Girls = (3/8)×40 = 15" },
  // LCM / HCF
  { category:'numerical', difficulty:3, question:"HCF of 24 and 36 is:", options:["6","8","12","18"], correct:2, explanation:"24=2³×3, 36=2²×3² → HCF=2²×3=12" },
  { category:'numerical', difficulty:3, question:"LCM of 6, 8, and 12 is:", options:["24","36","48","60"], correct:0, explanation:"6=2×3, 8=2³, 12=2²×3 → LCM=2³×3=24" },
  // Statistics
  { category:'numerical', difficulty:4, question:"The average of 5 numbers is 20. If one number is removed, the average becomes 18. The removed number is:", options:["25","28","30","32"], correct:1, explanation:"Total=5×20=100. Remaining=4×18=72. Removed=100-72=28" },
  { category:'numerical', difficulty:4, question:"If all values in a dataset increase by 10, the mean:", options:["Increases by 10","Decreases by 10","Remains the same","Doubles"], correct:0, explanation:"Adding a constant to every value shifts the mean by that same constant" },
  { category:'numerical', difficulty:4, question:"A salary increases by 10% then by 20%. Total increase is:", options:["30%","32%","28%","25%"], correct:1, explanation:"1.1 × 1.2 = 1.32 → 32% total increase" },
];

const EXT_ELECTRICAL: Partial<Question>[] = [
  // Motors (new variants not in questions.ts)
  { category:'electrical', difficulty:5, question:"In an induction motor, the slip at maximum torque is proportional to:", options:["Rotor resistance","Stator voltage","Supply frequency","Power factor"], correct:0, explanation:"Slip at maximum torque sm = R2/X2 — directly proportional to rotor resistance." },
  { category:'electrical', difficulty:5, question:"Starting torque of a single-phase induction motor is zero because:", options:["No back EMF","Single-phase supply produces no rotating field","High resistance","Low frequency"], correct:1, explanation:"Single-phase supply creates a pulsating field, not a rotating one, so net starting torque is zero." },
  { category:'electrical', difficulty:5, question:"In a synchronous motor, increasing load causes:", options:["Speed decrease","Increase in torque angle","Loss of synchronism immediately","Frequency change"], correct:1, explanation:"Load increase increases the torque angle (load angle δ) while speed remains locked to supply frequency." },
  // Transformers (new variants)
  { category:'electrical', difficulty:5, question:"Transformer regulation is maximum when power factor is:", options:["Unity","Leading","Lagging","Zero"], correct:2, explanation:"Voltage drop is highest at lagging power factor due to leakage reactance effects." },
  { category:'electrical', difficulty:5, question:"All-day efficiency of a transformer is important for:", options:["Power transformers","Distribution transformers","Instrument transformers","High-frequency transformers"], correct:1, explanation:"Distribution transformers supply varying loads throughout the day — all-day energy efficiency is the relevant metric." },
  { category:'electrical', difficulty:5, question:"Hysteresis loss in a transformer depends on:", options:["Voltage only","Frequency and flux density","Current","Load current"], correct:1, explanation:"Hysteresis loss = kh × f × Bm^n — a function of frequency and maximum flux density." },
  // Power systems
  { category:'electrical', difficulty:5, question:"The most economical voltage level for transmission depends mainly on:", options:["Current only","Distance and power level","Resistance","Frequency"], correct:1, explanation:"Higher transmission voltage is chosen based on power level and distance to minimise I²R losses." },
  { category:'electrical', difficulty:5, question:"Load factor is defined as:", options:["Max load / average load","Average load / peak load","Peak load / average load","Energy / max demand"], correct:1, explanation:"Load factor = average load ÷ peak (maximum) load." },
  { category:'electrical', difficulty:5, question:"Power factor improvement reduces:", options:["Voltage","Current drawn for the same power","Frequency","Resistance"], correct:1, explanation:"For the same real power, a higher power factor means lower current is drawn from the supply." },
  // Protection — relays
  { category:'electrical', difficulty:5, question:"An overcurrent relay operates when:", options:["Voltage exceeds limit","Current exceeds preset pickup value","Frequency drops","Power factor changes"], correct:1, explanation:"Overcurrent relays send a trip signal when monitored current exceeds the pre-set pickup value." },
  { category:'electrical', difficulty:5, question:"Distance relays are primarily used for protection of:", options:["Transformers","Generators","Transmission lines","Capacitors"], correct:2, explanation:"Distance relays measure apparent impedance and are the primary protection device for transmission lines." },
  { category:'electrical', difficulty:5, question:"In a differential relay, tripping occurs when:", options:["Incoming current equals outgoing current","Difference between currents exceeds set threshold","Voltage is low","Frequency is unstable"], correct:1, explanation:"It operates on the imbalance between measured input and output currents exceeding the bias-adjusted threshold." },
  { category:'electrical', difficulty:5, question:"Inverse time relays operate such that:", options:["Trip time increases with fault current","Trip time decreases with fault current","Trip time is constant","Trip depends on voltage only"], correct:1, explanation:"Higher fault current → faster tripping. The relay is inversely time-proportional to current magnitude." },
  // Circuit breakers
  { category:'electrical', difficulty:5, question:"SF6 circuit breakers are preferred because:", options:["Low cost","Excellent arc quenching and high dielectric strength","Low dielectric strength","Slow operation"], correct:1, explanation:"SF6 gas has very high dielectric strength and superior arc quenching properties." },
  { category:'electrical', difficulty:5, question:"The main purpose of arc extinction in a circuit breaker is to:", options:["Increase current","Maintain load continuity","Prevent restriking of the arc","Increase voltage"], correct:2, explanation:"Arc extinction must prevent re-ignition (restriking) after current interruption to ensure permanent isolation." },
  { category:'electrical', difficulty:5, question:"A vacuum circuit breaker is best suited for:", options:["High voltage ultra-long lines","Medium voltage systems","DC transmission only","Low frequency systems"], correct:1, explanation:"VCBs are widely used in medium voltage (11 kV–33 kV) distribution applications." },
  // Switchgear & MCCs
  { category:'electrical', difficulty:5, question:"Switchgear refers to:", options:["Only transformers","Combined protection, control, and switching equipment in power systems","Only circuit breakers","Only relays"], correct:1, explanation:"Switchgear encompasses the full assembly of protective, control, and switching devices in a power system." },
  { category:'electrical', difficulty:5, question:"Busbars in switchgear are used for:", options:["Energy storage","Power distribution within the substation","Voltage transformation","Frequency control"], correct:1, explanation:"Busbars collect incoming power and distribute it to multiple outgoing feeders." },
  { category:'electrical', difficulty:5, question:"Isolators are operated:", options:["Under load conditions","Only after the circuit breaker has opened","During fault conditions","Automatically under protection relay command"], correct:1, explanation:"Isolators are no-load isolating devices and must only be operated after the circuit breaker has interrupted current." },
  { category:'electrical', difficulty:5, question:"A Motor Control Centre (MCC) is used to:", options:["Generate power","Control and protect multiple motors from a central point","Increase motor speed","Convert AC to DC"], correct:1, explanation:"MCCs centralise motor starters, protection devices, and control wiring for multiple motors." },
  { category:'electrical', difficulty:5, question:"Overload relays in MCCs protect against:", options:["Short circuits only","Overheating due to prolonged excessive current","Voltage spikes","Frequency variation"], correct:1, explanation:"Thermal overload relays prevent motor winding overheating caused by sustained overcurrent." },
  { category:'electrical', difficulty:5, question:"Soft starters in MCCs are used to:", options:["Increase starting torque abruptly","Reduce inrush current during motor start","Increase voltage permanently","Convert AC to DC"], correct:1, explanation:"Soft starters ramp up voltage gradually to limit inrush current and reduce mechanical stress on start-up." },
  // Substation equipment
  { category:'electrical', difficulty:5, question:"Instrument transformers are used in substations to:", options:["Increase power output","Step down high voltage/current to safe levels for measurement","Store energy","Improve frequency stability"], correct:1, explanation:"CTs and PTs reduce high values to safe ranges for metering and protection relay inputs." },
  { category:'electrical', difficulty:5, question:"A current transformer (CT) should never be:", options:["Open-circuited under load","Short-circuited under load","Used in AC systems","Used with protection relays"], correct:0, explanation:"Open-circuiting a loaded CT causes dangerously high voltages at the secondary terminals." },
  { category:'electrical', difficulty:5, question:"Lightning arresters in substations are used to:", options:["Control frequency","Protect equipment from surge voltages","Increase power factor","Regulate load flow"], correct:1, explanation:"They provide a low-impedance path to divert lightning and switching surge energy safely to ground." },
  { category:'electrical', difficulty:5, question:"Capacitor banks in substations are mainly used for:", options:["Voltage reduction","Reactive power compensation and power factor improvement","Fault detection","Energy storage for DC systems"], correct:1, explanation:"Capacitor banks supply reactive power locally, improving power factor and reducing reactive current on lines." },
  // Substation protection
  { category:'electrical', difficulty:5, question:"Busbar protection in substations is typically:", options:["Time-delayed overcurrent protection","A unit (differential) protection scheme","Voltage-based protection only","Manual protection"], correct:1, explanation:"Busbar protection is a high-speed unit protection scheme comparing all currents entering and leaving the busbar zone." },
  { category:'electrical', difficulty:5, question:"Earth fault protection detects:", options:["Line-to-line faults only","Leakage of current to ground","Overvoltage only","Frequency imbalance"], correct:1, explanation:"Earth fault protection detects current flowing to ground due to insulation failure or conductor contact with earth." },
  { category:'electrical', difficulty:5, question:"Distance protection zones are used to:", options:["Increase voltage levels","Divide transmission line protection into graded sections","Control reactive power","Regulate transformers"], correct:1, explanation:"Zones 1, 2, and 3 provide time-graded protection covering different proportions of the line." },
  { category:'electrical', difficulty:5, question:"The main function of a substation is to:", options:["Generate electricity","Transmit power only","Transform voltage levels and distribute power","Store electrical energy"], correct:2, explanation:"Substations step up voltage for transmission or step it down for distribution, and route power between circuits." },
  { category:'electrical', difficulty:5, question:"A grid substation primarily:", options:["Converts AC to DC","Interconnects multiple transmission lines and networks","Stores energy","Reduces frequency"], correct:1, explanation:"Grid substations interconnect different transmission voltage levels and multiple circuits." },
  // Faults
  { category:'electrical', difficulty:5, question:"A 3-phase symmetrical fault is characterised by:", options:["Unequal current in phases","Equal fault current in all three phases","Zero sequence current only","No fault current in one phase"], correct:1, explanation:"In a symmetrical 3-phase fault, all phases carry equal magnitude fault currents." },
  { category:'electrical', difficulty:5, question:"Which fault produces the highest short-circuit current in a power system?", options:["Single line-to-ground fault","Line-to-line fault","Double line-to-ground fault","3-phase symmetrical fault"], correct:3, explanation:"3-phase faults produce maximum fault current because total fault impedance is minimum." },
  { category:'electrical', difficulty:5, question:"Single line-to-ground faults are analysed using:", options:["Only positive sequence network","Positive, negative, and zero sequence networks in series","Only negative sequence","Only DC analysis"], correct:1, explanation:"SLG faults involve all three sequence networks connected in series at the fault point." },
  { category:'electrical', difficulty:5, question:"In line-to-line faults, the zero-sequence current is:", options:["Maximum","Zero","Equal to positive sequence","Random"], correct:1, explanation:"LL faults do not involve a ground path, so zero-sequence current is absent." },
  { category:'electrical', difficulty:5, question:"Double line-to-ground faults involve:", options:["Only positive sequence network","All three sequence networks with negative and zero in parallel","Only zero sequence network","No sequence networks"], correct:1, explanation:"DLG faults require positive sequence in series with the parallel combination of negative and zero sequence networks." },
  { category:'electrical', difficulty:5, question:"Fault current magnitude is primarily limited by:", options:["Generator speed","System impedance at the fault point","Voltage level only","Load power factor"], correct:1, explanation:"Higher total system impedance between source and fault reduces fault current magnitude." },
  { category:'electrical', difficulty:5, question:"Subtransient fault current is:", options:["The lowest current level","The initial highest short-circuit current","Steady-state fault current","Zero at fault instant"], correct:1, explanation:"Subtransient current is the highest level, occurring in the first few cycles immediately after fault inception." },
  { category:'electrical', difficulty:5, question:"Zero sequence currents flow in:", options:["Balanced 3-phase faults only","Unbalanced faults involving a ground path","All AC loads","DC systems only"], correct:1, explanation:"Zero sequence components only appear when there is a path to ground — in ground-related unbalanced faults." },
  { category:'electrical', difficulty:5, question:"Negative sequence components represent:", options:["Normal balanced system operation","Unbalanced conditions in the system","Only ground faults","Power factor correction"], correct:1, explanation:"Negative sequence indicates phase imbalance — the reverse-rotating component caused by unbalanced conditions." },
  { category:'electrical', difficulty:5, question:"Distance relays estimate fault location based on:", options:["Current magnitude only","Measured impedance between relay and fault","Voltage frequency","Power factor angle"], correct:1, explanation:"Distance relays calculate impedance from measured V and I to determine how far the fault is from the relay." },
  { category:'electrical', difficulty:5, question:"Fault resistance increases:", options:["Fault current","System voltage","Total fault impedance","Relay tripping speed"], correct:2, explanation:"Fault resistance adds to total loop impedance, reducing fault current." },
  { category:'electrical', difficulty:5, question:"Arc faults are dangerous because they:", options:["Have zero current","Generate intense heat and energy release","Reduce system voltage to zero instantly","Are always symmetrical"], correct:1, explanation:"Arc faults produce extremely high temperatures and energy, causing severe equipment damage and fire risk." },
  { category:'electrical', difficulty:5, question:"Restriking in circuit breakers refers to:", options:["Permanent fault clearing","Re-ignition of the arc after current interruption","Voltage stabilisation","Load balancing"], correct:1, explanation:"Restriking is the re-establishment of the arc after current has been interrupted, indicating a failed breaking operation." },
];

// ── Bank injection ────────────────────────────────────────────────────────────
// Pushes extended questions into QUESTION_BANK once at module load.
// Uses id-prefix deduplication so it is safe to call multiple times.

let _injected = false;

function injectExtendedQuestions(): void {
  if (_injected) return;
  _injected = true;

  const batches: { key: string; items: Partial<Question>[]; prefix: string }[] = [
    { key: 'verbal',     items: EXT_VERBAL,     prefix: 'verbal'     },
    { key: 'watson',     items: EXT_WATSON,     prefix: 'watson'     },
    { key: 'numerical',  items: EXT_NUMERICAL,  prefix: 'numerical'  },
    { key: 'electrical', items: EXT_ELECTRICAL, prefix: 'electrical' },
  ];

  for (const { key, items, prefix } of batches) {
    if (!QUESTION_BANK[key]) (QUESTION_BANK as QuestionBank)[key] = [];
    const existingIds = new Set(QUESTION_BANK[key].map((q: Question) => q.id));
    for (const q of hydrateStatic(items, prefix)) {
      if (!existingIds.has(q.id)) {
        QUESTION_BANK[key].push(q);
        existingIds.add(q.id);
      }
    }
  }
}

// Run immediately when the module is first imported
injectExtendedQuestions();

// ── Template Engine ───────────────────────────────────────────────────────────
class TemplateEngine {
  private templates: QuestionTemplate[] = [];
  constructor() { this.init(); }
  private add(t: QuestionTemplate) { this.templates.push(t); }

  private init() {
    // Numerical templates
    this.add({ id:'num_pct', category:'numerical', difficulty:2, parameters:{ a:{min:5,max:95,step:5}, b:{min:100,max:1000,step:100} }, generate:({a,b})=>{ const ans=(a*b)/100; return { question:`What is ${a}% of ${b}?`, options:[ans.toFixed(0),(ans+10).toFixed(0),(ans-10).toFixed(0),(ans+25).toFixed(0)], correct:0, explanation:`${a}% of ${b} = (${a}/100) × ${b} = ${ans.toFixed(0)}`, passage:'' }; } });
    this.add({ id:'num_discount', category:'numerical', difficulty:3, parameters:{ discount:{min:10,max:40,step:5}, price:{min:500,max:5000,step:500} }, generate:({discount,price})=>{ const sp=price*(1-discount/100); return { question:`A shopkeeper offers ${discount}% discount on an item marked Rs. ${price}. What is the selling price?`, options:[`Rs. ${sp.toFixed(0)}`,`Rs. ${(sp+50).toFixed(0)}`,`Rs. ${(sp-50).toFixed(0)}`,`Rs. ${(price*0.9).toFixed(0)}`], correct:0, explanation:`SP = ${price} × (1 − ${discount}/100) = Rs. ${sp.toFixed(0)}`, passage:'' }; } });
    this.add({ id:'num_ratio', category:'numerical', difficulty:3, parameters:{ r1:{min:2,max:7}, r2:{min:3,max:9}, val:{min:20,max:100,step:10} }, generate:({r1,r2,val})=>{ const ans=(val*r2)/r1; return { question:`The ratio of A:B is ${r1}:${r2}. If A is ${val}, what is B?`, options:[ans.toFixed(0),(ans+10).toFixed(0),(ans-10).toFixed(0),(ans*2).toFixed(0)], correct:0, explanation:`B = (A × ${r2}) / ${r1} = ${ans.toFixed(0)}`, passage:'' }; } });
    this.add({ id:'num_avg', category:'numerical', difficulty:2, parameters:{ a:{min:10,max:50}, b:{min:20,max:60}, c:{min:30,max:70}, d:{min:40,max:80}, e:{min:50,max:90} }, generate:({a,b,c,d,e})=>{ const avg=(a+b+c+d+e)/5; return { question:`Find the average of ${a}, ${b}, ${c}, ${d}, ${e}.`, options:[avg.toFixed(1),(avg+5).toFixed(1),(avg-5).toFixed(1),(avg+10).toFixed(1)], correct:0, explanation:`Average = (${a}+${b}+${c}+${d}+${e}) / 5 = ${avg.toFixed(1)}`, passage:'' }; } });
    this.add({ id:'num_profit', category:'numerical', difficulty:3, parameters:{ cp:{min:100,max:500,step:50}, sp:{min:150,max:600,step:50} }, generate:({cp,sp})=>{ const profit=((sp-cp)/cp)*100; return { question:`Cost price = Rs. ${cp}, Selling price = Rs. ${sp}. Find profit percentage.`, options:[`${profit.toFixed(1)}%`,`${(profit+5).toFixed(1)}%`,`${(profit-5).toFixed(1)}%`,`${(profit*1.5).toFixed(1)}%`], correct:0, explanation:`Profit% = ((${sp}−${cp})/${cp}) × 100 = ${profit.toFixed(1)}%`, passage:'' }; } });
    this.add({ id:'num_si', category:'numerical', difficulty:3, parameters:{ p:{min:1000,max:10000,step:1000}, r:{min:5,max:15}, t:{min:1,max:5} }, generate:({p,r,t})=>{ const si=(p*r*t)/100; return { question:`Principal = Rs. ${p}, Rate = ${r}% p.a., Time = ${t} year(s). Find Simple Interest.`, options:[`Rs. ${si.toFixed(0)}`,`Rs. ${(si+500).toFixed(0)}`,`Rs. ${(si-500).toFixed(0)}`,`Rs. ${(si*2).toFixed(0)}`], correct:0, explanation:`SI = (${p} × ${r} × ${t}) / 100 = Rs. ${si.toFixed(0)}`, passage:'' }; } });
    // Logical templates
    this.add({ id:'log_arith', category:'logical', difficulty:2, parameters:{ start:{min:1,max:10}, step:{min:2,max:5} }, generate:({start,step})=>{ const [n1,n2,n3,n4]=[start,start+step,start+step*2,start+step*3]; return { question:`Complete the sequence: ${n1}, ${n2}, ${n3}, ?`, options:[n4.toString(),(n4+step).toString(),(n4-step).toString(),(n4*2).toString()], correct:0, explanation:`Add ${step} each time: ${n1} → ${n2} → ${n3} → ${n4}`, passage:'' }; } });
    this.add({ id:'log_geo', category:'logical', difficulty:3, parameters:{ start:{min:2,max:5}, ratio:{min:2,max:4} }, generate:({start,ratio})=>{ const [n1,n2,n3,n4]=[start,start*ratio,start*ratio*ratio,start*ratio**3]; return { question:`Complete the sequence: ${n1}, ${n2}, ${n3}, ?`, options:[n4.toString(),(n4*ratio).toString(),(n4/ratio).toString(),(n4+ratio).toString()], correct:0, explanation:`Multiply by ${ratio} each time: ${n1} → ${n2} → ${n3} → ${n4}`, passage:'' }; } });
    this.add({ id:'log_letters', category:'logical', difficulty:3, parameters:{ startCode:{min:65,max:80}, step:{min:1,max:3} }, generate:({startCode,step})=>{ const c=(n:number)=>String.fromCharCode(n); const [l1,l2,l3,l4]=[startCode,startCode+step,startCode+step*2,startCode+step*3].map(c); return { question:`Complete the letter sequence: ${l1}, ${l2}, ${l3}, ?`, options:[l4,c(l4.charCodeAt(0)+step),c(l4.charCodeAt(0)-step),l1], correct:0, explanation:`Add ${step} positions each time: ${l1} → ${l2} → ${l3} → ${l4}`, passage:'' }; } });
    // Verbal templates
    this.add({ id:'verb_synonym', category:'verbal', difficulty:2, parameters:{ wordIndex:{min:0,max:7} }, generate:({wordIndex})=>{ const words=[{word:'Happy',correct:'Joyful',wrong:['Sad','Angry','Tired']},{word:'Big',correct:'Large',wrong:['Small','Tiny','Narrow']},{word:'Fast',correct:'Quick',wrong:['Slow','Lazy','Steady']},{word:'Smart',correct:'Intelligent',wrong:['Dull','Slow','Stupid']},{word:'Brave',correct:'Courageous',wrong:['Scared','Timid','Fearful']},{word:'Beautiful',correct:'Attractive',wrong:['Ugly','Plain','Dull']},{word:'Rich',correct:'Wealthy',wrong:['Poor','Broke','Needy']},{word:'Quiet',correct:'Silent',wrong:['Loud','Noisy','Chatty']}]; const item=words[wordIndex%words.length]; return { question:`Select the synonym of "${item.word}":`, options:[item.correct,...item.wrong], correct:0, explanation:`"${item.word}" means the same as "${item.correct}"`, passage:'' }; } });
    this.add({ id:'verb_antonym', category:'verbal', difficulty:2, parameters:{ wordIndex:{min:0,max:3} }, generate:({wordIndex})=>{ const words=[{word:'Hot',correct:'Cold',wrong:['Warm','Boiling','Heat']},{word:'Dark',correct:'Light',wrong:['Night','Black','Dim']},{word:'Strong',correct:'Weak',wrong:['Powerful','Tough','Sturdy']},{word:'Rich',correct:'Poor',wrong:['Wealthy','Affluent','Prosperous']}]; const item=words[wordIndex%words.length]; return { question:`Select the antonym of "${item.word}":`, options:[item.correct,...item.wrong], correct:0, explanation:`The opposite of "${item.word}" is "${item.correct}"`, passage:'' }; } });
    // Spatial templates
    this.add({ id:'spatial_faces', category:'spatial', difficulty:2, parameters:{ shapeIndex:{min:0,max:3} }, generate:({shapeIndex})=>{ const shapes=[{name:'cube',faces:6,wrong:[4,8,12]},{name:'tetrahedron',faces:4,wrong:[3,5,6]},{name:'octahedron',faces:8,wrong:[6,10,12]},{name:'square-base pyramid',faces:5,wrong:[4,6,8]}]; const s=shapes[shapeIndex%shapes.length]; return { question:`How many faces does a ${s.name} have?`, options:[s.faces.toString(),...s.wrong.map(String)], correct:0, explanation:`A ${s.name} has ${s.faces} faces.`, passage:'' }; } });
    this.add({ id:'spatial_edges', category:'spatial', difficulty:3, parameters:{ shapeIndex:{min:0,max:2} }, generate:({shapeIndex})=>{ const shapes=[{name:'cube',edges:12,wrong:[8,10,14]},{name:'tetrahedron',edges:6,wrong:[4,5,8]},{name:'triangular prism',edges:9,wrong:[8,10,12]}]; const s=shapes[shapeIndex%shapes.length]; return { question:`How many edges does a ${s.name} have?`, options:[s.edges.toString(),...s.wrong.map(String)], correct:0, explanation:`A ${s.name} has ${s.edges} edges.`, passage:'' }; } });
    // Electrical templates
    this.add({ id:'elec_ohm', category:'electrical', difficulty:2, parameters:{ v:{min:12,max:240,step:12}, r:{min:10,max:100,step:10} }, generate:({v,r})=>{ const i=v/r; return { question:`A circuit has voltage ${v}V and resistance ${r}Ω. What is the current?`, options:[`${i.toFixed(1)}A`,`${(i*2).toFixed(1)}A`,`${(i/2).toFixed(1)}A`,`${(i+0.5).toFixed(1)}A`], correct:0, explanation:`Ohm's Law: I = V/R = ${v}/${r} = ${i.toFixed(1)}A`, passage:'' }; } });
    this.add({ id:'elec_power', category:'electrical', difficulty:2, parameters:{ v:{min:12,max:240,step:12}, i:{min:1,max:10} }, generate:({v,i})=>{ const p=v*i; return { question:`A device operates at ${v}V and draws ${i}A. What is the power consumption?`, options:[`${p}W`,`${p*2}W`,`${p/2}W`,`${p+50}W`], correct:0, explanation:`P = V × I = ${v} × ${i} = ${p}W`, passage:'' }; } });
    this.add({ id:'elec_series', category:'electrical', difficulty:3, parameters:{ r1:{min:10,max:50,step:10}, r2:{min:20,max:60,step:10}, r3:{min:30,max:70,step:10} }, generate:({r1,r2,r3})=>{ const rt=r1+r2+r3; return { question:`Three resistors ${r1}Ω, ${r2}Ω, ${r3}Ω in series. Total resistance?`, options:[`${rt}Ω`,`${rt-10}Ω`,`${rt+10}Ω`,`${rt/2}Ω`], correct:0, explanation:`Series: R = ${r1}+${r2}+${r3} = ${rt}Ω`, passage:'' }; } });
    this.add({ id:'elec_parallel', category:'electrical', difficulty:4, parameters:{ r1:{min:10,max:50,step:10}, r2:{min:20,max:60,step:10} }, generate:({r1,r2})=>{ const rt=(r1*r2)/(r1+r2); return { question:`Two resistors ${r1}Ω and ${r2}Ω in parallel. Total resistance?`, options:[`${rt.toFixed(1)}Ω`,`${(rt+5).toFixed(1)}Ω`,`${(rt-5).toFixed(1)}Ω`,`${(rt*2).toFixed(1)}Ω`], correct:0, explanation:`1/R = 1/${r1}+1/${r2} → R = ${rt.toFixed(1)}Ω`, passage:'' }; } });
    // Mechanical templates
    this.add({ id:'mech_lever', category:'mechanical', difficulty:3, parameters:{ load:{min:100,max:500,step:50}, effort:{min:50,max:200,step:25} }, generate:({load,effort})=>{ const ma=(load/effort).toFixed(1); return { question:`A lever lifts ${load}N with effort ${effort}N. What is the mechanical advantage?`, options:[ma,(parseFloat(ma)+0.5).toFixed(1),(parseFloat(ma)-0.5).toFixed(1),(parseFloat(ma)*2).toFixed(1)], correct:0, explanation:`MA = Load/Effort = ${load}/${effort} = ${ma}`, passage:'' }; } });
    this.add({ id:'mech_gear', category:'mechanical', difficulty:3, parameters:{ t1:{min:20,max:40,step:10}, t2:{min:40,max:80,step:10}, rpm:{min:60,max:180,step:30} }, generate:({t1,t2,rpm})=>{ const out=(rpm*t1)/t2; return { question:`Gear A has ${t1} teeth, Gear B has ${t2} teeth. A rotates at ${rpm} RPM. B rotates at?`, options:[`${out} RPM`,`${out*2} RPM`,`${out/2} RPM`,`${out+20} RPM`], correct:0, explanation:`B RPM = ${rpm} × ${t1}/${t2} = ${out} RPM`, passage:'' }; } });
    // Abstract templates
    this.add({ id:'abs_power', category:'abstract', difficulty:2, parameters:{ start:{min:1,max:5}, multiplier:{min:2,max:4} }, generate:({start,multiplier})=>{ const [n1,n2,n3,n4]=[start,start*multiplier,start*multiplier**2,start*multiplier**3]; return { question:`What comes next? ${n1}, ${n2}, ${n3}, ___`, options:[n4.toString(),(n4+multiplier).toString(),(n4*multiplier).toString(),(n4-multiplier).toString()], correct:0, explanation:`Multiply by ${multiplier} each time: ${n1} → ${n2} → ${n3} → ${n4}`, passage:'' }; } });
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
    return {
      ...question,
      id: `evo-${question.id}-${Date.now()}`,
      parentId: question.id,
      evolutionCount: 1,
      difficulty: (accuracy > 0.85
        ? Math.min(5, question.difficulty + 1)
        : Math.max(1, question.difficulty - 1)) as Question['difficulty'],
      explanation: `[${accuracy > 0.85 ? 'Evolved' : 'Simplified'}] ${question.explanation}`,
    };
  }
}

// ── Crowd Bank ────────────────────────────────────────────────────────────────
class CrowdBank {
  private pending: PendingQuestion[] = [];
  private readonly KEY = 'crowd_questions';

  constructor() { this.load(); }
  private load() { const s = safeGetItem(this.KEY); if (s) { try { this.pending = JSON.parse(s); } catch { this.pending = []; } } }
  private save() { safeSetItem(this.KEY, JSON.stringify(this.pending)); }

  submit(q: Omit<Question, 'id' | 'timesAsked' | 'timesCorrect' | 'weight'>, userId: string): string {
    const id = `pending-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    this.pending.push({ ...q, id, weight: 1, timesAsked: 0, timesCorrect: 0, submittedBy: userId, submittedAt: Date.now(), votes: 1, flags: [], status: 'pending' });
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

  constructor() {
    // Guarantee injection has run before any question fetching
    injectExtendedQuestions();
    this.loadStats();
  }

  // ── Stats persistence ────────────────────────────────────────────────────
  private loadStats() {
    const s = safeGetItem(this.STATS_KEY);
    if (s) { try { this.stats = JSON.parse(s); } catch { this.stats = {}; } }
  }
  private saveStats() { safeSetItem(this.STATS_KEY, JSON.stringify(this.stats)); }

  // ── Public API ───────────────────────────────────────────────────────────

  /**
   * Records a user's answer. Call after every answered question.
   * @param questionId  The question's id field
   * @param correct     Whether the user answered correctly
   * @param category    The question's category
   * @param responseMs  Optional response time in milliseconds
   */
  recordAnswer(questionId: string, correct: boolean, category: string, responseMs?: number): void {
    if (!this.stats[questionId]) {
      this.stats[questionId] = { timesAsked: 0, timesCorrect: 0, lastSeen: Date.now(), difficultyRating: 3, category };
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
   * Returns a blended question set for the given category.
   *
   * Mix:
   *   60% → buildBlendedTest() from questions.ts (adaptive, now includes injected questions)
   *   30% → procedural templates (always fresh numbers/words)
   *   10% → crowd-sourced questions with 3+ votes
   */
  getQuestions(category: string, count = 10, excludeIds: string[] = []): Question[] {
    const statsForBank: Record<string, { timesAsked: number; timesCorrect: number }> = {};
    for (const [id, s] of Object.entries(this.stats)) {
      statsForBank[id] = { timesAsked: s.timesAsked, timesCorrect: s.timesCorrect };
    }

    // 60% from adaptive static bank (buildBlendedTest now sees injected questions too)
    const baseCount = Math.round(count * 0.6);
    const base = buildBlendedTest(category, baseCount, excludeIds, statsForBank);

    // 30% from procedural templates
    const genCount = Math.round(count * 0.3);
    const generated = this.templates.generateQuestions(category, genCount);

    // Remainder from crowd
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
   * Scans all performance stats and evolves questions seen 20+ times.
   * Returns newly evolved question variants.
   */
  evolveAndImprove(): EvolvedQuestion[] {
    const evolved: EvolvedQuestion[] = [];
    for (const [id, stats] of Object.entries(this.stats)) {
      let original: Question | undefined;
      for (const qs of Object.values(QUESTION_BANK)) {
        original = (qs as Question[]).find((q: Question) => q.id === id);
        if (original) break;
      }
      if (!original) continue;
      const e = this.evolution.evolve(original, stats);
      if (e) evolved.push(e);
    }
    return evolved;
  }

  /** Submit a user-contributed question for community review. */
  submitQuestion(q: Omit<Question, 'id' | 'timesAsked' | 'timesCorrect' | 'weight'>, userId: string): string {
    return this.crowd.submit(q, userId);
  }

  voteQuestion(questionId: string, upvote: boolean): void { this.crowd.vote(questionId, upvote); }
  flagQuestion(questionId: string, userId: string, reason: string): void { this.crowd.flag(questionId, userId, reason); }
  approvePending(questionId: string, reviewerId: string): Question | null { return this.crowd.approve(questionId, reviewerId); }
  getCrowdStats() { return this.crowd.getStats(); }
  getPerformanceStats(): PerformanceStats { return { ...this.stats }; }

  getCategoryInsights(category: string) {
    const questions = (QUESTION_BANK[category] ?? []) as Question[];
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
      weakTopics: perf.slice(0, 3).map(p => p.id),
      strongTopics: perf.slice(-3).map(p => p.id),
    };
  }

  /** Returns how many questions are in each category after injection. */
  getBankSummary(): Record<string, number> {
    return Object.fromEntries(
      Object.entries(QUESTION_BANK).map(([k, v]) => [k, (v as Question[]).length])
    );
  }

  get templateCount() { return this.templates.count; }
}

// ── Singleton factory ─────────────────────────────────────────────────────────
// Use useMemo/useRef in React to avoid re-creating on every render.
export function createSelfGeneratingBank(): SelfGeneratingBank {
  return new SelfGeneratingBank();
}
