export interface Question {
  id: string;
  category: string;
  type: 'numerical' | 'verbal' | 'logical' | 'mechanical' | 'spatial' | 'abstract' | 'sjt' | 'watson' | 'iq' | 'error' | 'critical' | 'electrical';
  difficulty: 1 | 2 | 3 | 4 | 5;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
  table?: string;
  diagram?: string;
  passage?: string;
  weight: number;
  timesAsked: number;
  timesCorrect: number;
}

export type QuestionBank = Record<string, Question[]>;

// Table styling helpers
const TS = "width:100%;border-collapse:collapse;font-size:0.82rem;margin:8px 0;";
const TH = "padding:6px 9px;text-align:center;background:#f1f5f9;font-weight:600;";
const TD = "padding:5px 8px;text-align:center;border-bottom:1px solid #e2e8f0;";

function tbl(caption: string, headers: string[], rows: (string|number)[][]): string {
  let html = `<table style="${TS}"><caption style="font-weight:600;margin-bottom:8px;text-align:left;">${caption}</caption><thead><tr>`;
  headers.forEach(h => html += `<th style="${TH}">${h}</th>`);
  html += `</tr></thead><tbody>`;
  rows.forEach(row => {
    html += `<tr>`;
    row.forEach(cell => html += `<td style="${TD}">${cell}</td>`);
    html += `</tr>`;
  });
  html += `</tbody></table>`;
  return html;
}

// Passages for verbal/watson questions
const CLOUD_P = "Cloud computing has revolutionised enterprise IT. Organisations shifted from capital-intensive on-premise data centres to operational expenditure models. This enables elastic scaling but concerns persist around data sovereignty, vendor lock-in, and environmental impact. GDPR forced providers to invest in regional infrastructure and compliance certifications.";

const QE_P = "Quantitative easing after the 2008 crisis expanded central bank balance sheets dramatically. The Bank of England's asset purchases reached £895 billion by 2022. QE stabilised markets and lowered borrowing costs, but critics argue it exacerbated wealth inequality by inflating asset prices benefiting existing asset holders over households without portfolios.";

const REMOTE_P = "Remote work policies permanently altered workplace dynamics. Studies indicate hybrid models yield higher employee satisfaction while maintaining productivity. However, challenges include reduced spontaneous collaboration, difficulties onboarding junior staff, and blurred work-life boundaries.";

const AI_P = "Artificial intelligence adoption in financial services accelerated since 2020. Major banks deploy machine learning for credit scoring, fraud detection, and algorithmic trading. While these systems improve efficiency, regulators raised concerns about algorithmic bias, model opacity, and systemic risk from correlated AI failures across institutions.";

const CLIMATE_P = "Corporate sustainability reporting has become increasingly mandatory. The EU's CSRD requires large companies to disclose detailed ESG metrics. Research suggests firms with strong ESG scores demonstrate lower cost of capital and reduced earnings volatility, though causality remains debated.";

const WG_P1 = "A study found 70% of Fortune 500 companies offer flexible working. Employee satisfaction at these companies averages 15% above industry norms. However, 40% of managers report difficulty coordinating team activities.";

const WG_P2 = "Research across 12 countries shows remote workers are 13% more productive and 68% report higher satisfaction. However, 25% feel isolated, and junior employees show slower career development compared to office-based peers.";

const WG_P3 = "A meta-analysis of 47 studies found mindfulness interventions reduce reported stress by 23%. Effect sizes were largest in healthcare and education. However, most studies relied on self-reported outcomes with follow-up periods under six months.";

// Data Interpretation Tables
const DI_T1 = tbl("Expenditures of a Company (Lakh Rs.) per Annum", 
  ["Year", "Salary", "Fuel+Trans", "Bonus", "Interest", "Taxes"],
  [["1998", 288, 98, "3.00", "23.4", 83], ["1999", 342, 112, "2.52", "32.5", 108], 
   ["2000", 324, 101, "3.84", "41.6", 74], ["2001", 336, 133, "3.68", "36.4", 88], 
   ["2002", 420, 142, "3.96", "49.4", 98]]);

const DI_T2 = tbl("Candidates (Thousands) Appeared & Qualified",
  ["Year", "App(M)", "Qual(M)", "App(F)", "Qual(F)"],
  [["1997", "2.9", "1.5", "1.8", "0.9"], ["1998", "3.5", "1.4", "1.9", "1.0"],
   ["1999", "4.2", "1.8", "2.4", "1.2"], ["2000", "4.5", "2.3", "2.5", "1.4"],
   ["2001", "4.8", "2.1", "2.8", "1.6"], ["2002", "5.1", "2.5", "3.0", "1.8"]]);

const DI_BAR = tbl("Book Sales (thousands) — Six Branches",
  ["Branch", "2000", "2001", "Total"],
  [["B1", 80, 105, 185], ["B2", 75, 65, 140], ["B3", 95, 110, 205],
   ["B4", 85, 95, 180], ["B5", 75, 95, 170], ["B6", 70, 80, 150]]);

const DI_PIE = tbl("Expenditure in Publishing a Book",
  ["Item", "% of Cost"],
  [["Paper", "25%"], ["Printing", "20%"], ["Binding", "20%"],
   ["Royalty", "15%"], ["Promotion", "10%"], ["Transport", "10%"]]);

const DI_LINE = tbl("Annual Profit (Rs. Crore)",
  ["Year", "Co. A", "Co. B"],
  [[1996, 5, 3], [1997, 6, 5], [1998, 4, 6], [1999, 7, 4], [2000, 9, 8], [2001, 10, 9]]);

const DI_EXP = tbl("Exports from Companies X,Y,Z (Rs. crore)",
  ["Year", "X", "Y", "Z", "Total"],
  [[1993, 30, 80, 60, 170], [1994, 60, 40, 90, 190], [1995, 40, 60, 120, 220],
   [1996, 70, 60, 90, 220], [1997, 100, 80, 60, 240], [1998, 50, 100, 80, 230],
   [1999, 120, 140, 100, 360]]);

const DI_MARKS = tbl("% Marks — 7 Students in 6 Subjects",
  ["Student", "Maths(150)", "Chem(130)", "Phys(120)", "Geog(100)", "Hist(60)", "CS(40)"],
  [["Ayush", 90, 50, 90, 60, 70, 80], ["Aman", 100, 80, 80, 40, 80, 70],
   ["Sajal", 90, 60, 70, 70, 90, 70], ["Rohit", 80, 65, 80, 80, 60, 60],
   ["Muskan", 80, 65, 85, 95, 50, 90], ["Tanvi", 70, 75, 65, 85, 40, 60],
   ["Tarun", 65, 35, 50, 77, 80, 80]]);

const DI_BUD = tbl("Monthly Household Budget — Rs. 24,000",
  ["Category", "%", "Amount (Rs.)"],
  [["Food", "35%", "8,400"], ["Rent", "25%", "6,000"], ["Education", "15%", "3,600"],
   ["Clothing", "10%", "2,400"], ["Savings", "10%", "2,400"], ["Misc", "5%", "1,200"]]);

const DI_MOB = tbl("Mobile Phone Sales (thousands)",
  ["Year", "Brand A", "Brand B", "Brand C", "Total"],
  [[2018, 45, 32, 28, 105], [2019, 52, 38, 31, 121], [2020, 48, 41, 35, 124],
   [2021, 63, 44, 39, 146], [2022, 71, 49, 42, 162]]);

const DI_GDP = tbl("GDP Growth Rate (%) by Sector",
  ["Sector", "2019", "2020", "2021", "2022"],
  [["Agriculture", "2.8", "-0.2", "3.6", "2.9"], ["Manufacturing", "5.1", "-8.4", "12.3", "6.7"],
   ["Services", "6.9", "-7.8", "8.4", "7.2"], ["Overall", "4.2", "-7.3", "8.7", "5.8"]]);

// Fixed SVGs with explicit width and height attributes (Safari compatibility)
const gearSVG = (teeth1: number, teeth2: number, label: string) => 
  `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200" style="max-width:400px;margin:10px 0;"><rect width="300" height="200" fill="#f8fafc"/><text x="150" y="20" text-anchor="middle" font-size="14" font-weight="600">${label}</text><circle cx="80" cy="100" r="50" fill="none" stroke="#334155" stroke-width="3"/><circle cx="220" cy="100" r="40" fill="none" stroke="#334155" stroke-width="3"/><text x="80" y="105" text-anchor="middle" font-size="16">${teeth1}T</text><text x="220" y="105" text-anchor="middle" font-size="16">${teeth2}T</text><text x="150" y="180" text-anchor="middle" font-size="12" fill="#64748b">Gear Ratio: ${teeth2}:${teeth1}</text></svg>`;

const leverSVG = (effort: number, load: number, fulcrum: string) => 
  `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="150" viewBox="0 0 300 150" style="max-width:400px;margin:10px 0;"><rect width="300" height="150" fill="#f8fafc"/><text x="150" y="20" text-anchor="middle" font-size="14" font-weight="600">${fulcrum}</text><line x1="20" y1="100" x2="280" y2="100" stroke="#64748b" stroke-width="4"/><polygon points="140,100 160,100 150,130" fill="#dc2626"/><rect x="10" y="80" width="20" height="20" fill="#2563eb"/><text x="20" y="75" text-anchor="middle" font-size="12">${effort}N</text><rect x="270" y="80" width="20" height="20" fill="#16a34a"/><text x="280" y="75" text-anchor="middle" font-size="12">${load}N</text></svg>`;

const circuitSVG = (type: string) => {
  if (type === 'series') {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="120" viewBox="0 0 300 120" style="max-width:400px;margin:10px 0;"><rect width="300" height="120" fill="#f8fafc"/><text x="150" y="20" text-anchor="middle" font-size="14" font-weight="600">Series Circuit</text><rect x="40" y="50" width="40" height="30" fill="none" stroke="#334155" stroke-width="2"/><text x="60" y="70" text-anchor="middle" font-size="12">R₁=10Ω</text><rect x="130" y="50" width="40" height="30" fill="none" stroke="#334155" stroke-width="2"/><text x="150" y="70" text-anchor="middle" font-size="12">R₂=20Ω</text><rect x="220" y="50" width="40" height="30" fill="none" stroke="#334155" stroke-width="2"/><text x="240" y="70" text-anchor="middle" font-size="12">R₃=30Ω</text><line x1="20" y1="65" x2="40" y2="65" stroke="#334155" stroke-width="2"/><line x1="80" y1="65" x2="130" y2="65" stroke="#334155" stroke-width="2"/><line x1="170" y1="65" x2="220" y2="65" stroke="#334155" stroke-width="2"/><line x1="260" y1="65" x2="280" y2="65" stroke="#334155" stroke-width="2"/><text x="150" y="105" text-anchor="middle" font-size="12" fill="#64748b">V = 12V, I = 0.2A</text></svg>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="150" viewBox="0 0 300 150" style="max-width:400px;margin:10px 0;"><rect width="300" height="150" fill="#f8fafc"/><text x="150" y="20" text-anchor="middle" font-size="14" font-weight="600">Parallel Circuit</text><line x1="50" y1="40" x2="50" y2="110" stroke="#334155" stroke-width="2"/><line x1="250" y1="40" x2="250" y2="110" stroke="#334155" stroke-width="2"/><line x1="50" y1="55" x2="120" y2="55" stroke="#334155" stroke-width="2"/><rect x="120" y="40" width="40" height="30" fill="none" stroke="#334155" stroke-width="2"/><text x="140" y="60" text-anchor="middle" font-size="10">R₁=10Ω</text><line x1="160" y1="55" x2="250" y2="55" stroke="#334155" stroke-width="2"/><line x1="50" y1="95" x2="120" y2="95" stroke="#334155" stroke-width="2"/><rect x="120" y="80" width="40" height="30" fill="none" stroke="#334155" stroke-width="2"/><text x="140" y="100" text-anchor="middle" font-size="10">R₂=20Ω</text><line x1="160" y1="95" x2="250" y2="95" stroke="#334155" stroke-width="2"/><text x="150" y="135" text-anchor="middle" font-size="12" fill="#64748b">V = 12V, R_total = 6.67Ω</text></svg>`;
};

const transformerSVG = (turns1: number, turns2: number) => 
  `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="180" viewBox="0 0 300 180" style="max-width:400px;margin:10px 0;"><rect width="300" height="180" fill="#f8fafc"/><text x="150" y="25" text-anchor="middle" font-size="14" font-weight="600">Transformer</text><line x1="80" y1="60" x2="80" y2="140" stroke="#334155" stroke-width="3"/><line x1="100" y1="60" x2="100" y2="140" stroke="#334155" stroke-width="3"/><line x1="200" y1="60" x2="200" y2="140" stroke="#334155" stroke-width="3"/><line x1="220" y1="60" x2="220" y2="140" stroke="#334155" stroke-width="3"/><text x="90" y="55" text-anchor="middle" font-size="12">${turns1} turns</text><text x="210" y="55" text-anchor="middle" font-size="12">${turns2} turns</text><text x="90" y="160" text-anchor="middle" font-size="11" fill="#2563eb">Primary</text><text x="210" y="160" text-anchor="middle" font-size="11" fill="#16a34a">Secondary</text><line x1="20" y1="100" x2="80" y2="100" stroke="#dc2626" stroke-width="2"/><text x="30" y="95" font-size="10">AC In</text><line x1="220" y1="100" x2="280" y2="100" stroke="#16a34a" stroke-width="2"/><text x="250" y="95" font-size="10">AC Out</text></svg>`;

const cubeSVG = (netType: string) => {
  const nets: Record<string, string> = {
    '1-4-1': `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200" style="max-width:300px;margin:10px 0;"><rect width="200" height="200" fill="#f8fafc"/><rect x="60" y="20" width="40" height="40" fill="#dbeafe" stroke="#334155"/><rect x="20" y="60" width="40" height="40" fill="#dbeafe" stroke="#334155"/><rect x="60" y="60" width="40" height="40" fill="#3b82f6" stroke="#334155"/><rect x="100" y="60" width="40" height="40" fill="#dbeafe" stroke="#334155"/><rect x="140" y="60" width="40" height="40" fill="#dbeafe" stroke="#334155"/><rect x="60" y="100" width="40" height="40" fill="#dbeafe" stroke="#334155"/><text x="100" y="170" text-anchor="middle" font-size="12">1-4-1 Net</text></svg>`,
    '3-3': `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="150" viewBox="0 0 200 150" style="max-width:300px;margin:10px 0;"><rect width="200" height="150" fill="#f8fafc"/><rect x="20" y="20" width="40" height="40" fill="#dbeafe" stroke="#334155"/><rect x="60" y="20" width="40" height="40" fill="#dbeafe" stroke="#334155"/><rect x="100" y="20" width="40" height="40" fill="#dbeafe" stroke="#334155"/><rect x="60" y="60" width="40" height="40" fill="#3b82f6" stroke="#334155"/><rect x="100" y="60" width="40" height="40" fill="#dbeafe" stroke="#334155"/><rect x="140" y="60" width="40" height="40" fill="#dbeafe" stroke="#334155"/><text x="100" y="130" text-anchor="middle" font-size="12">3-3 Net</text></svg>`,
    '2-3-1': `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="180" viewBox="0 0 200 180" style="max-width:300px;margin:10px 0;"><rect width="200" height="180" fill="#f8fafc"/><rect x="40" y="20" width="40" height="40" fill="#dbeafe" stroke="#334155"/><rect x="80" y="20" width="40" height="40" fill="#dbeafe" stroke="#334155"/><rect x="40" y="60" width="40" height="40" fill="#dbeafe" stroke="#334155"/><rect x="80" y="60" width="40" height="40" fill="#3b82f6" stroke="#334155"/><rect x="120" y="60" width="40" height="40" fill="#dbeafe" stroke="#334155"/><rect x="80" y="100" width="40" height="40" fill="#dbeafe" stroke="#334155"/><text x="100" y="160" text-anchor="middle" font-size="12">2-3-1 Net</text></svg>`
  };
  return nets[netType] || nets['1-4-1'];
};

export function buildQuestionBank(): QuestionBank {
  const bank: QuestionBank = {
    numerical: [],
    verbal: [],
    logical: [],
    mechanical: [],
    spatial: [],
    abstract: [],
    sjt: [],
    watson: [],
    iq: [],
    error: [],
    critical: [],
    electrical: []
  };

  let idCounter = 1000;
  const addQ = (category: keyof QuestionBank, q: Partial<Question>) => {
    const full: Question = {
      id: `${category}-${idCounter++}`,
      category,
      type: category as any,
      difficulty: 3,
      weight: 1.0,
      timesAsked: 0,
      timesCorrect: 0,
      table: '',
      diagram: '',
      passage: '',
      ...q
    } as Question;
    bank[category].push(full);
  };

  // ==================== NUMERICAL (25 questions) ====================
  addQ('numerical', { difficulty: 2, table: DI_T1, question: "What is the average amount of interest per year which the company had to pay during this period?", options: ["Rs. 32.43 lakhs", "Rs. 33.72 lakhs", "Rs. 34.18 lakhs", "Rs. 36.66 lakhs"], correct: 3, explanation: "Average = (23.4+32.5+41.6+36.4+49.4)/5 = 183.3/5 = 36.66 lakhs" });
  addQ('numerical', { difficulty: 3, table: DI_T1, question: "The total expenditure on all items in 1998 was approximately what percent of the total expenditure in 2002?", options: ["62%", "66%", "69%", "71%"], correct: 1, explanation: "1998 total = 288+98+3+23.4+83 = 495.4; 2002 total = 420+142+3.96+49.4+98 = 713.36; Ratio = 495.4/713.36 ≈ 69%" });
  addQ('numerical', { difficulty: 3, table: DI_T2, question: "In which year was the percentage of qualified candidates to appeared candidates the highest for males?", options: ["1997", "1998", "1999", "2000"], correct: 0, explanation: "1997: 1.5/2.9 ≈ 51.7% (highest)" });
  addQ('numerical', { difficulty: 2, table: DI_BAR, question: "What is the ratio of total sales of branch B2 for both years to the total sales of branch B4 for both years?", options: ["7:9", "11:13", "13:15", "17:19"], correct: 0, explanation: "B2 total = 140, B4 total = 180 → 140:180 = 7:9" });
  addQ('numerical', { difficulty: 3, table: DI_PIE, question: "Royalty on the book is less than the printing cost by what percentage?", options: ["15%", "20%", "25%", "30%"], correct: 2, explanation: "Printing 20%, Royalty 15%. Difference 5%. (5/20)×100 = 25%" });
  addQ('numerical', { difficulty: 4, table: DI_LINE, question: "What was the difference in profit between Company A and Company B in 1999?", options: ["Rs. 1 crore", "Rs. 2 crore", "Rs. 3 crore", "Rs. 4 crore"], correct: 2, explanation: "1999: A=7, B=4 → Difference = 3 crore" });
  addQ('numerical', { difficulty: 3, table: DI_EXP, question: "Average annual exports during the given period for Company Y is approximately what percent of the average for Company Z?", options: ["87%", "91%", "95%", "99%"], correct: 1, explanation: "Y avg ≈ 80, Z avg ≈ 85.7 → 80/85.7 ≈ 93% (closest to 91%)" });
  addQ('numerical', { difficulty: 2, table: DI_BUD, question: "If education expenses increase by 25%, what is the new amount?", options: ["Rs. 4,200", "Rs. 4,400", "Rs. 4,500", "Rs. 4,800"], correct: 2, explanation: "3,600 × 1.25 = 4,500" });
  addQ('numerical', { difficulty: 3, table: DI_MOB, question: "What is the percentage growth in total sales from 2018 to 2022?", options: ["48%", "52%", "54%", "58%"], correct: 2, explanation: "(162-105)/105 × 100 ≈ 54.3%" });
  addQ('numerical', { difficulty: 4, table: DI_GDP, question: "Which sector showed the highest volatility (range) in growth rates?", options: ["Agriculture", "Manufacturing", "Services", "Overall"], correct: 1, explanation: "Manufacturing range = 20.7 (highest)" });

  // Arithmetic & Percentages (15 more to reach ~25)
  addQ('numerical', { difficulty: 2, question: "A train travels 360 km in 5 hours. What is its average speed?", options: ["64 km/h", "70 km/h", "72 km/h", "75 km/h"], correct: 2, explanation: "360/5 = 72 km/h" });
  addQ('numerical', { difficulty: 3, question: "If 15 men can complete a work in 24 days, how many days will 18 men take?", options: ["18 days", "20 days", "22 days", "25 days"], correct: 1, explanation: "360 man-days / 18 = 20 days" });
  addQ('numerical', { difficulty: 3, question: "A shopkeeper marks goods 40% above cost price and gives 15% discount. What is profit percentage?", options: ["15%", "19%", "21%", "25%"], correct: 1, explanation: "Profit = 19%" });
  addQ('numerical', { difficulty: 4, question: "Compound interest on Rs. 10,000 at 10% p.a. for 2 years is:", options: ["Rs. 1,900", "Rs. 2,000", "Rs. 2,100", "Rs. 2,200"], correct: 2, explanation: "₹2,100" });
  addQ('numerical', { difficulty: 2, question: "What is 15% of 240?", options: ["32", "34", "36", "38"], correct: 2, explanation: "36" });
  addQ('numerical', { difficulty: 3, question: "The ratio of ages of A and B is 4:5. After 6 years, it becomes 6:7. What is B's present age?", options: ["12", "15", "18", "20"], correct: 1, explanation: "B = 15" });
  addQ('numerical', { difficulty: 3, question: "If x:y = 3:4 and y:z = 5:6, what is x:z?", options: ["5:8", "3:6", "5:6", "3:5"], correct: 0, explanation: "5:8" });
  addQ('numerical', { difficulty: 2, question: "Average of first 10 natural numbers is:", options: ["4.5", "5", "5.5", "6"], correct: 2, explanation: "5.5" });
  addQ('numerical', { difficulty: 3, question: "If selling price is doubled, profit triples. Find profit percent.", options: ["50%", "75%", "100%", "125%"], correct: 2, explanation: "100%" });
  addQ('numerical', { difficulty: 2, question: "HCF of 36 and 48 is:", options: ["6", "8", "12", "18"], correct: 2, explanation: "12" });
  addQ('numerical', { difficulty: 3, question: "LCM of 12, 18, and 24 is:", options: ["48", "60", "72", "84"], correct: 2, explanation: "72" });
  addQ('numerical', { difficulty: 4, question: "Sum of squares of two numbers is 145. Sum of numbers is 17. Product is:", options: ["60", "64", "72", "84"], correct: 2, explanation: "72" });
  addQ('numerical', { difficulty: 2, question: "A pipe fills a tank in 6 hours, another empties in 8 hours. Together they fill it in:", options: ["20 hours", "22 hours", "24 hours", "26 hours"], correct: 2, explanation: "24 hours" });

  // ==================== VERBAL (20 questions) ====================
  addQ('verbal', { difficulty: 2, passage: CLOUD_P, question: "The primary advantage of cloud computing mentioned is:", options: ["Enhanced security", "Elastic scaling capability", "Reduced environmental impact", "GDPR compliance"], correct: 1, explanation: "Elastic scaling capability" });
  addQ('verbal', { difficulty: 3, passage: CLOUD_P, question: "According to the passage, what forced providers to invest in regional infrastructure?", options: ["Cost reduction", "Data sovereignty concerns", "GDPR regulations", "Vendor lock-in issues"], correct: 2, explanation: "GDPR regulations" });
  addQ('verbal', { difficulty: 3, passage: QE_P, question: "What is the critics' main argument against quantitative easing?", options: ["It failed to stabilize markets", "It increased borrowing costs", "It worsened wealth inequality", "It reduced central bank balance sheets"], correct: 2, explanation: "It worsened wealth inequality" });
  addQ('verbal', { difficulty: 2, passage: REMOTE_P, question: "What challenge of remote work is NOT mentioned?", options: ["Reduced spontaneous collaboration", "Onboarding difficulties", "Lower productivity", "Blurred work-life boundaries"], correct: 2, explanation: "Lower productivity" });
  addQ('verbal', { difficulty: 4, passage: AI_P, question: "What is the systemic risk mentioned regarding AI in financial services?", options: ["Individual bank failures", "Algorithmic bias", "Correlated AI failures across institutions", "Model opacity"], correct: 2, explanation: "Correlated AI failures across institutions" });
  addQ('verbal', { difficulty: 3, passage: CLIMATE_P, question: "What benefit do firms with strong ESG scores demonstrate?", options: ["Higher revenue growth", "Lower cost of capital", "Increased market share", "Faster expansion"], correct: 1, explanation: "Lower cost of capital" });

  addQ('verbal', { difficulty: 2, question: "Choose the word most opposite to 'ephemeral':", options: ["Transient", "Eternal", "Fleeting", "Brief"], correct: 1, explanation: "Eternal" });
  addQ('verbal', { difficulty: 3, question: "Select the correctly spelled word:", options: ["Accomodate", "Acommodate", "Accommodate", "Acomadate"], correct: 2, explanation: "Accommodate" });
  addQ('verbal', { difficulty: 2, question: "The committee _______ the proposal after much deliberation.", options: ["adapted", "adopted", "adept", "adjoin"], correct: 1, explanation: "adopted" });
  addQ('verbal', { difficulty: 3, question: "Identify the error: 'Neither the manager nor the employees was present.'", options: ["Neither...nor", "manager", "employees", "was"], correct: 3, explanation: "was → were" });
  addQ('verbal', { difficulty: 2, question: "Synonym of 'pragmatic':", options: ["Idealistic", "Theoretical", "Practical", "Visionary"], correct: 2, explanation: "Practical" });
  addQ('verbal', { difficulty: 3, question: "Antonym of 'benevolent':", options: ["Malevolent", "Beneficent", "Benign", "Generous"], correct: 0, explanation: "Malevolent" });
  addQ('verbal', { difficulty: 3, question: "To _______ is to renounce a throne.", options: ["Abdicate", "Abolish", "Abrogate", "Abscond"], correct: 0, explanation: "Abdicate" });
  addQ('verbal', { difficulty: 2, question: "'Ubiquitous' means:", options: ["Rare", "Everywhere", "Expensive", "Complicated"], correct: 1, explanation: "Everywhere" });
  addQ('verbal', { difficulty: 3, question: "Idiom: 'To burn the midnight oil' means:", options: ["To waste resources", "To work late into night", "To start a fire", "To study chemistry"], correct: 1, explanation: "To work late into night" });
  addQ('verbal', { difficulty: 2, question: "Choose the correct sentence:", options: ["The data is clear", "The data are clear", "Both are acceptable", "Neither is correct"], correct: 2, explanation: "Both are acceptable in modern usage" });
  addQ('verbal', { difficulty: 4, question: "Which sentence uses the subjunctive mood correctly?", options: ["If I was rich, I would travel", "If I were rich, I would travel", "If I am rich, I would travel", "If I be rich, I would travel"], correct: 1, explanation: "If I were rich..." });
  addQ('verbal', { difficulty: 3, question: "Choose the best replacement for 'very good':", options: ["Superb", "Adequate", "Passable", "Mediocre"], correct: 0, explanation: "Superb" });

  // ==================== LOGICAL (18 questions) ====================
  addQ('logical', { difficulty: 2, question: "If all Bloops are Razzies and all Razzies are Lazzies, then:", options: ["All Bloops are Lazzies", "All Lazzies are Bloops", "Some Lazzies are not Razzies", "No Razzies are Bloops"], correct: 0, explanation: "All Bloops are Lazzies" });
  addQ('logical', { difficulty: 3, question: "Complete the series: 2, 6, 12, 20, 30, ?", options: ["38", "40", "42", "44"], correct: 2, explanation: "42 (n(n+1))" });
  addQ('logical', { difficulty: 3, question: "If A is taller than B, B is taller than C, and D is shorter than C, who is tallest?", options: ["A", "B", "C", "D"], correct: 0, explanation: "A" });
  addQ('logical', { difficulty: 2, question: "CODE : FRGH :: READ : ?", options: ["UHDG", "UHEG", "UHDH", "UHFG"], correct: 0, explanation: "UHDG (+3 each letter)" });
  addQ('logical', { difficulty: 3, question: "Complete: 1, 1, 2, 3, 5, 8, 13, ?", options: ["18", "19", "20", "21"], correct: 3, explanation: "21 (Fibonacci)" });
  addQ('logical', { difficulty: 2, question: "Find the odd one out: Triangle, Square, Pentagon, Circle", options: ["Triangle", "Square", "Pentagon", "Circle"], correct: 3, explanation: "Circle (no sides)" });
  addQ('logical', { difficulty: 3, question: "Complete the pattern: AZ, BY, CX, DW, ?", options: ["EV", "FU", "EV", "GV"], correct: 0, explanation: "EV" });
  addQ('logical', { difficulty: 2, question: "If north becomes south and east becomes west, what does west become?", options: ["North", "East", "South", "West"], correct: 1, explanation: "East" });
  addQ('logical', { difficulty: 3, question: "Clock shows 3:15. What is the angle between hour and minute hands?", options: ["0°", "7.5°", "15°", "30°"], correct: 1, explanation: "7.5°" });
  addQ('logical', { difficulty: 4, question: "If 5 cats catch 5 mice in 5 minutes, how long for 100 cats to catch 100 mice?", options: ["5 minutes", "100 minutes", "20 minutes", "500 minutes"], correct: 0, explanation: "5 minutes" });

  // ==================== MECHANICAL (12 questions) ====================
  addQ('mechanical', { difficulty: 3, diagram: gearSVG(20, 40, "Gear System"), question: "If Gear A (20 teeth) rotates at 60 RPM, what is Gear B's speed?", options: ["20 RPM", "30 RPM", "60 RPM", "120 RPM"], correct: 1, explanation: "30 RPM (larger gear slower)" });
  addQ('mechanical', { difficulty: 2, diagram: leverSVG(50, 100, "Second Class Lever"), question: "What is the mechanical advantage of this lever?", options: ["0.5", "1", "2", "4"], correct: 2, explanation: "MA = 2" });
  addQ('mechanical', { difficulty: 3, question: "Which material expands most when heated?", options: ["Steel", "Aluminum", "Copper", "Brass"], correct: 1, explanation: "Aluminum" });
  addQ('mechanical', { difficulty: 2, question: "What is the purpose of a flywheel?", options: ["Increase speed", "Store rotational energy", "Reduce friction", "Change direction"], correct: 1, explanation: "Store rotational energy" });
  addQ('mechanical', { difficulty: 4, question: "In a hydraulic system, if a small piston (area 2 cm²) is pushed with 10N force, what force is exerted on a large piston (area 10 cm²)?", options: ["10N", "25N", "50N", "100N"], correct: 2, explanation: "50N (Pascal's law)" });
  addQ('mechanical', { difficulty: 2, question: "What happens to boiling point of water at higher altitude?", options: ["Increases", "Decreases", "Stays same", "Becomes unpredictable"], correct: 1, explanation: "Decreases" });
  addQ('mechanical', { difficulty: 3, question: "Which has the highest coefficient of friction?", options: ["Ice on ice", "Rubber on concrete", "Wood on wood", "Steel on steel"], correct: 1, explanation: "Rubber on concrete" });
  addQ('mechanical', { difficulty: 2, question: "What does a governor control in an engine?", options: ["Fuel mixture", "Speed", "Temperature", "Oil pressure"], correct: 1, explanation: "Speed" });

  // ==================== SPATIAL (12 questions) ====================
  addQ('spatial', { difficulty: 2, diagram: cubeSVG('1-4-1'), question: "How many faces does a cube have?", options: ["4", "5", "6", "8"], correct: 2, explanation: "6 faces" });
  addQ('spatial', { difficulty: 3, diagram: cubeSVG('3-3'), question: "If the 3-3 net is folded, which faces are opposite each other?", options: ["1-2, 3-4, 5-6", "1-6, 2-5, 3-4", "1-4, 2-5, 3-6", "1-3, 2-4, 5-6"], correct: 2, explanation: "1-4, 2-5, 3-6" });
  addQ('spatial', { difficulty: 4, question: "A cube is painted red on all faces and cut into 27 smaller cubes. How many have exactly 2 red faces?", options: ["8", "12", "16", "20"], correct: 1, explanation: "12 (edge cubes)" });
  addQ('spatial', { difficulty: 2, question: "If a cylinder is unrolled, what shape is obtained?", options: ["Square", "Rectangle", "Circle", "Triangle"], correct: 1, explanation: "Rectangle" });
  addQ('spatial', { difficulty: 3, question: "When a cone is cut parallel to its base, what is the cross-section?", options: ["Triangle", "Ellipse", "Circle", "Parabola"], correct: 2, explanation: "Circle" });
  addQ('spatial', { difficulty: 2, question: "Which shape has no vertices?", options: ["Cube", "Sphere", "Pyramid", "Prism"], correct: 1, explanation: "Sphere" });

  // ==================== ABSTRACT (12 questions) ====================
  addQ('abstract', { difficulty: 2, question: "Complete the pattern: ○ △ □ ○ △ ?", options: ["○", "△", "□", "◇"], correct: 2, explanation: "□" });
  addQ('abstract', { difficulty: 3, question: "What comes next: 1, 4, 9, 16, 25, ?", options: ["30", "36", "42", "49"], correct: 1, explanation: "36 (6²)" });
  addQ('abstract', { difficulty: 3, question: "Complete: 2, 3, 5, 7, 11, ?", options: ["12", "13", "14", "15"], correct: 1, explanation: "13 (prime)" });
  addQ('abstract', { difficulty: 2, question: "Which shape does not belong: 🔺 🔻 🔷 🔹?", options: ["🔺", "🔻", "🔷", "🔹"], correct: 2, explanation: "🔷 (diamond)" });
  addQ('abstract', { difficulty: 3, question: "What is the next letter: B, E, H, K, ?", options: ["L", "M", "N", "O"], correct: 2, explanation: "N (+3)" });
  addQ('abstract', { difficulty: 2, question: "Complete: 5, 10, 20, 40, ?", options: ["60", "70", "80", "100"], correct: 2, explanation: "80 (×2)" });

  // ==================== SJT - SITUATIONAL JUDGMENT (10 questions - reduced) ====================
  addQ('sjt', { difficulty: 2, question: "Your team member consistently arrives late to meetings. You should:", options: ["Ignore it to avoid conflict", "Speak privately to understand the issue", "Report to manager immediately", "Make sarcastic comments in meetings"], correct: 1, explanation: "Speak privately to understand the issue" });
  addQ('sjt', { difficulty: 3, question: "A client demands a feature that exceeds project scope. You:", options: ["Agree to keep them happy", "Refuse outright", "Explain impact and negotiate alternatives", "Do it without telling the team"], correct: 2, explanation: "Explain impact and negotiate alternatives" });
  addQ('sjt', { difficulty: 2, question: "You discover a colleague made an error affecting the project. You:", options: ["Fix it silently", "Publicly point out the mistake", "Discuss privately and decide how to address", "Report to management"], correct: 2, explanation: "Discuss privately" });
  addQ('sjt', { difficulty: 3, question: "Your manager assigns you a task outside your expertise. You:", options: ["Decline immediately", "Accept and figure it out alone", "Accept but ask for resources/training", "Pretend to be sick"], correct: 2, explanation: "Accept but ask for resources/training" });
  addQ('sjt', { difficulty: 2, question: "A customer is angry about a service issue. You:", options: ["Transfer to supervisor immediately", "Listen, apologize, and offer solution", "Explain why it's not your fault", "Hang up"], correct: 1, explanation: "Listen, apologize, and offer solution" });
  addQ('sjt', { difficulty: 3, question: "A coworker takes credit for your work. You:", options: ["Publicly accuse them", "Document your contributions and speak to them", "Let it go to avoid conflict", "Sabotage their future work"], correct: 1, explanation: "Document your contributions and speak to them" });
  addQ('sjt', { difficulty: 2, question: "You're asked to work with someone you previously had conflict with. You:", options: ["Refuse the assignment", "Approach with fresh start mindset", "Request different partner", "Be passive-aggressive"], correct: 1, explanation: "Approach with fresh start mindset" });
  addQ('sjt', { difficulty: 3, question: "Your idea is rejected in a meeting. You:", options: ["Argue until accepted", "Ask for feedback and refine the proposal", "Withdraw and sulk", "Criticize the accepted idea"], correct: 1, explanation: "Ask for feedback and refine the proposal" });
  addQ('sjt', { difficulty: 2, question: "A junior colleague asks for help with a task you find tedious. You:", options: ["Tell them to figure it out", "Help thoroughly as it's development opportunity", "Do it yourself quickly", "Complain to their manager"], correct: 1, explanation: "Help thoroughly" });
  addQ('sjt', { difficulty: 3, question: "A deadline is impossible to meet with current resources. You:", options: ["Work overtime silently", "Ask for deadline extension immediately", "Analyze options and present trade-offs to stakeholders", "Cut corners on quality"], correct: 2, explanation: "Analyze options and present trade-offs" });

  // ==================== WATSON-GLASER (12 questions) ====================
  addQ('watson', { difficulty: 3, passage: WG_P1, question: "The passage suggests flexible working causes higher employee satisfaction.", options: ["True", "Probably True", "Insufficient Data", "Probably False", "False"], correct: 0, explanation: "True" });
  addQ('watson', { difficulty: 4, passage: WG_P1, question: "40% of managers at Fortune 500 companies report difficulty coordinating teams.", options: ["True", "Probably True", "Insufficient Data", "Probably False", "False"], correct: 0, explanation: "True" });
  addQ('watson', { difficulty: 3, passage: WG_P2, question: "Remote work always leads to slower career development.", options: ["True", "Probably True", "Insufficient Data", "Probably False", "False"], correct: 3, explanation: "Probably False" });
  addQ('watson', { difficulty: 2, question: "Statement: All mammals are warm-blooded. Whales are mammals. Inference: Whales are warm-blooded.", options: ["True", "Probably True", "Insufficient Data", "Probably False", "False"], correct: 0, explanation: "True" });
  addQ('watson', { difficulty: 3, question: "Statement: Most successful entrepreneurs take risks. John takes risks. Inference: John is a successful entrepreneur.", options: ["True", "Probably True", "Insufficient Data", "Probably False", "False"], correct: 2, explanation: "Insufficient Data" });

  // ==================== IQ (8 questions) ====================
  addQ('iq', { difficulty: 2, question: "What number should replace the question mark: 2, 5, 11, 23, 47, ?", options: ["85", "95", "105", "115"], correct: 1, explanation: "95" });
  addQ('iq', { difficulty: 3, question: "If 2+3=10, 7+2=63, 6+5=66, then 8+4=?", options: ["48", "64", "80", "96"], correct: 3, explanation: "96" });
  addQ('iq', { difficulty: 2, question: "Which word is the odd one out: Apple, Banana, Carrot, Date?", options: ["Apple", "Banana", "Carrot", "Date"], correct: 2, explanation: "Carrot" });
  addQ('iq', { difficulty: 3, question: "Complete the analogy: 8:4 :: 27:?", options: ["6", "8", "9", "12"], correct: 2, explanation: "9" });

  // ==================== ERROR CHECKING (8 questions) ====================
  addQ('error', { difficulty: 2, question: "Compare: 'John Smith, 42 Oak Street' vs 'John Smith, 42 Oak Stret'. Is there an error?", options: ["No error", "Name error", "Number error", "Street error"], correct: 3, explanation: "Street error" });
  addQ('error', { difficulty: 3, question: "Compare: 'Order #12345, Qty: 100, Price: $50.00' vs 'Order #12345, Qty: 100, Price: $500.00'. Error?", options: ["No error", "Order number", "Quantity", "Price"], correct: 3, explanation: "Price" });
  addQ('error', { difficulty: 2, question: "Compare: '2024-03-15' vs '2024-03-51'. Error?", options: ["No error", "Year", "Month", "Day"], correct: 3, explanation: "Day" });

  // ==================== CRITICAL THINKING (10 questions) ====================
  addQ('critical', { difficulty: 3, question: "Which is a strong argument against implementing a 4-day work week?", options: ["Employees prefer it", "It reduces productivity in all industries", "It might not suit customer-facing roles", "It saves costs"], correct: 2, explanation: "It might not suit customer-facing roles" });
  addQ('critical', { difficulty: 2, question: "Which statement is an opinion rather than fact?", options: ["Water boils at 100°C at sea level", "Paris is capital of France", "Chocolate is the best flavor", "Earth orbits the Sun"], correct: 2, explanation: "Chocolate is the best flavor" });
  addQ('critical', { difficulty: 3, question: "A politician claims crime rose 50% last year. What should you check first?", options: ["Their political party", "Base numbers and previous trends", "Media coverage", "Police funding"], correct: 1, explanation: "Base numbers and previous trends" });

  // ==================== ELECTRICAL ENGINEERING (20 questions) ====================
  addQ('electrical', { difficulty: 2, diagram: circuitSVG('series'), question: "What is the total resistance in this series circuit?", options: ["10Ω", "30Ω", "60Ω", "100Ω"], correct: 2, explanation: "60Ω" });
  addQ('electrical', { difficulty: 2, diagram: circuitSVG('parallel'), question: "What is the total resistance in this parallel circuit?", options: ["5Ω", "6.67Ω", "15Ω", "30Ω"], correct: 1, explanation: "6.67Ω" });
  addQ('electrical', { difficulty: 3, question: "Ohm's Law states that:", options: ["V = I/R", "V = I×R", "V = R/I", "I = V×R"], correct: 1, explanation: "V = I×R" });
  addQ('electrical', { difficulty: 3, diagram: transformerSVG(100, 200), question: "If primary has 100 turns, secondary 200 turns, and primary voltage is 110V, secondary voltage is:", options: ["55V", "110V", "220V", "440V"], correct: 2, explanation: "220V" });
  addQ('electrical', { difficulty: 2, question: "What is the unit of electrical resistance?", options: ["Volt", "Ampere", "Ohm", "Watt"], correct: 2, explanation: "Ohm" });
  addQ('electrical', { difficulty: 3, question: "In an AC circuit with pure inductance, current ______ voltage by 90°.", options: ["Leads", "Lags", "Is in phase with", "Is opposite to"], correct: 1, explanation: "Lags" });
  addQ('electrical', { difficulty: 2, question: "An AND gate output is HIGH when:", options: ["Any input is HIGH", "All inputs are HIGH", "No input is HIGH", "Inputs are different"], correct: 1, explanation: "All inputs are HIGH" });
  addQ('electrical', { difficulty: 3, question: "Binary 1010 in decimal is:", options: ["8", "10", "12", "14"], correct: 1, explanation: "10" });
  addQ('electrical', { difficulty: 3, question: "Flip-flops are used as:", options: ["Amplifiers", "Memory elements", "Oscillators", "Rectifiers"], correct: 1, explanation: "Memory elements" });
  addQ('electrical', { difficulty: 2, question: "SCR stands for:", options: ["Silicon Controlled Rectifier", "Silicon Carbon Resistor", "System Control Relay", "Signal Conditioning Register"], correct: 0, explanation: "Silicon Controlled Rectifier" });

  return bank;
}

export const QUESTION_BANK = buildQuestionBank();

export const CATEGORIES: Record<string, { name: string; icon: string; description: string; color: string }> = {
  numerical: { name: "Numerical Reasoning", icon: "📊", description: "Data interpretation, percentages, ratios, financial analysis", color: "#3b82f6" },
  verbal: { name: "Verbal Reasoning", icon: "📖", description: "Comprehension, vocabulary, grammar, critical reading", color: "#8b5cf6" },
  logical: { name: "Logical Reasoning", icon: "🧩", description: "Syllogisms, patterns, sequences, deductions", color: "#10b981" },
  mechanical: { name: "Mechanical", icon: "⚙️", description: "Gears, levers, hydraulics, physical principles", color: "#f59e0b" },
  spatial: { name: "Spatial", icon: "🎯", description: "Cube nets, 3D visualization, pattern folding", color: "#ec4899" },
  abstract: { name: "Abstract", icon: "🎨", description: "Pattern recognition, non-verbal reasoning", color: "#6366f1" },
  sjt: { name: "Situational Judgment", icon: "💼", description: "Workplace scenarios, professional decisions", color: "#14b8a6" },
  watson: { name: "Watson-Glaser", icon: "⚖️", description: "Critical thinking, inference evaluation", color: "#dc2626" },
  iq: { name: "IQ", icon: "🧠", description: "Pattern detection, analogies, series completion", color: "#7c3aed" },
  error: { name: "Error Checking", icon: "🔍", description: "Data verification, attention to detail", color: "#059669" },
  critical: { name: "Critical Thinking", icon: "💡", description: "Argument analysis, fallacy detection", color: "#ea580c" },
  electrical: { name: "Electrical Engineering", icon: "⚡", description: "Circuits, power systems, electronics", color: "#eab308" }
};

export function getAllQuestions(): Question[] {
  return Object.values(QUESTION_BANK).flat();
}

export function getTotalQuestionCount(): number {
  return getAllQuestions().length;
}

export function weightedSample(questions: Question[], n: number, excludeIds: string[] = []): Question[] {
  const available = questions.filter(q => !excludeIds.includes(q.id));
  if (available.length === 0) return [];

  const weights = available.map(q => q.weight);
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  const result: Question[] = [];
  const used = new Set<string>();

  for (let i = 0; i < Math.min(n, available.length); i++) {
    let random = Math.random() * totalWeight;
    for (const q of available) {
      if (used.has(q.id)) continue;
      random -= q.weight;
      if (random <= 0) {
        result.push(q);
        used.add(q.id);
        break;
      }
    }
  }
  return result;
}

export function buildBlendedTest(category: string, count: number): Question[] {
  const questions = QUESTION_BANK[category] || [];
  if (questions.length === 0) return [];

  const sorted = [...questions].sort((a, b) => {
    const scoreA = (a.timesAsked + 1) * (a.timesCorrect / Math.max(a.timesAsked, 1) || 0.5);
    const scoreB = (b.timesAsked + 1) * (b.timesCorrect / Math.max(b.timesAsked, 1) || 0.5);
    return scoreA - scoreB;
  });

  return sorted.slice(0, count);
}

export function updateWeights(results: { questionId: string; correct: boolean }[]): void {
  results.forEach(({ questionId, correct }) => {
    const allQuestions = getAllQuestions();
    const question = allQuestions.find(q => q.id === questionId);
    if (question) {
      question.timesAsked++;
      if (correct) question.timesCorrect++;
      const accuracy = question.timesCorrect / question.timesAsked;
      question.weight = 0.5 + (1 - accuracy);
    }
  });
}
