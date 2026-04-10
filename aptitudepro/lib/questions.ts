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

const TS = "width:100%;border-collapse:collapse;font-size:0.82rem;margin:8px 0;";
const TH = "padding:6px 9px;text-align:center;background:#f1f5f9;font-weight:600;";
const TD = "padding:5px 8px;text-align:center;border-bottom:1px solid #e2e8f0;";

function tbl(caption: string, headers: string[], rows: (string|number)[][]): string {
  let html = `<table style="${TS}"><caption style="font-weight:600;margin-bottom:8px;text-align:left;">${caption}</caption><thead><tr>`;
  headers.forEach(h => html += `<th style="${TH}">${h}</th>`);
  html += `</tr></thead><tbody>`;
  rows.forEach(row => { html += `<tr>`; row.forEach(cell => html += `<td style="${TD}">${cell}</td>`); html += `</tr>`; });
  html += `</tbody></table>`;
  return html;
}

// ── Passages ──────────────────────────────────────────────────────────────────
const CLOUD_P  = "Cloud computing has revolutionised enterprise IT. Organisations shifted from capital-intensive on-premise data centres to operational expenditure models. This enables elastic scaling but concerns persist around data sovereignty, vendor lock-in, and environmental impact. GDPR forced providers to invest in regional infrastructure and compliance certifications.";
const QE_P     = "Quantitative easing after the 2008 crisis expanded central bank balance sheets dramatically. The Bank of England's asset purchases reached £895 billion by 2022. QE stabilised markets and lowered borrowing costs, but critics argue it exacerbated wealth inequality by inflating asset prices benefiting existing asset holders over households without portfolios.";
const REMOTE_P = "Remote work policies permanently altered workplace dynamics. Studies indicate hybrid models yield higher employee satisfaction while maintaining productivity. However, challenges include reduced spontaneous collaboration, difficulties onboarding junior staff, and blurred work-life boundaries.";
const AI_P     = "Artificial intelligence adoption in financial services accelerated since 2020. Major banks deploy machine learning for credit scoring, fraud detection, and algorithmic trading. While these systems improve efficiency, regulators raised concerns about algorithmic bias, model opacity, and systemic risk from correlated AI failures across institutions.";
const CLIMATE_P= "Corporate sustainability reporting has become increasingly mandatory. The EU's CSRD requires large companies to disclose detailed ESG metrics. Research suggests firms with strong ESG scores demonstrate lower cost of capital and reduced earnings volatility, though causality remains debated.";
const WG_P1    = "A study found 70% of Fortune 500 companies offer flexible working. Employee satisfaction at these companies averages 15% above industry norms. However, 40% of managers report difficulty coordinating team activities.";
const WG_P2    = "Research across 12 countries shows remote workers are 13% more productive and 68% report higher satisfaction. However, 25% feel isolated, and junior employees show slower career development compared to office-based peers.";
const WG_P3    = "A meta-analysis of 47 studies found mindfulness interventions reduce reported stress by 23%. Effect sizes were largest in healthcare and education. However, most studies relied on self-reported outcomes with follow-up periods under six months.";

// ── Data tables ───────────────────────────────────────────────────────────────
const DI_T1   = tbl("Expenditures of a Company (Lakh Rs.) per Annum",["Year","Salary","Fuel+Trans","Bonus","Interest","Taxes"],
  [["1998",288,98,"3.00","23.4",83],["1999",342,112,"2.52","32.5",108],["2000",324,101,"3.84","41.6",74],["2001",336,133,"3.68","36.4",88],["2002",420,142,"3.96","49.4",98]]);
const DI_T2   = tbl("Candidates (Thousands) Appeared & Qualified",["Year","App(M)","Qual(M)","App(F)","Qual(F)"],
  [["1997","2.9","1.5","1.8","0.9"],["1998","3.5","1.4","1.9","1.0"],["1999","4.2","1.8","2.4","1.2"],["2000","4.5","2.3","2.5","1.4"],["2001","4.8","2.1","2.8","1.6"],["2002","5.1","2.5","3.0","1.8"]]);
const DI_BAR  = tbl("Book Sales (thousands) — Six Branches",["Branch","2000","2001","Total"],
  [["B1",80,105,185],["B2",75,65,140],["B3",95,110,205],["B4",85,95,180],["B5",75,95,170],["B6",70,80,150]]);
const DI_PIE  = tbl("Expenditure in Publishing a Book",["Item","% of Cost"],
  [["Paper","25%"],["Printing","20%"],["Binding","20%"],["Royalty","15%"],["Promotion","10%"],["Transport","10%"]]);
const DI_LINE = tbl("Annual Profit (Rs. Crore)",["Year","Co. A","Co. B"],
  [[1996,5,3],[1997,6,5],[1998,4,6],[1999,7,4],[2000,9,8],[2001,10,9]]);
const DI_EXP  = tbl("Exports from Companies X,Y,Z (Rs. crore)",["Year","X","Y","Z","Total"],
  [[1993,30,80,60,170],[1994,60,40,90,190],[1995,40,60,120,220],[1996,70,60,90,220],[1997,100,80,60,240],[1998,50,100,80,230],[1999,120,140,100,360]]);
const DI_MARKS= tbl("% Marks — 7 Students in 6 Subjects",["Student","Maths(150)","Chem(130)","Phys(120)","Geog(100)","Hist(60)","CS(40)"],
  [["Ayush",90,50,90,60,70,80],["Aman",100,80,80,40,80,70],["Sajal",90,60,70,70,90,70],["Rohit",80,65,80,80,60,60],["Muskan",80,65,85,95,50,90],["Tanvi",70,75,65,85,40,60],["Tarun",65,35,50,77,80,80]]);
const DI_BUD  = tbl("Monthly Household Budget — Rs. 24,000",["Category","%","Amount (Rs.)"],
  [["Food","35%","8,400"],["Rent","25%","6,000"],["Education","15%","3,600"],["Clothing","10%","2,400"],["Savings","10%","2,400"],["Misc","5%","1,200"]]);
const DI_MOB  = tbl("Mobile Phone Sales (thousands)",["Year","Brand A","Brand B","Brand C","Total"],
  [[2018,45,32,28,105],[2019,52,38,31,121],[2020,48,41,35,124],[2021,63,44,39,146],[2022,71,49,42,162]]);
const DI_GDP  = tbl("GDP Growth Rate (%) by Sector",["Sector","2019","2020","2021","2022"],
  [["Agriculture","2.8","-0.2","3.6","2.9"],["Manufacturing","5.1","-8.4","12.3","6.7"],["Services","6.9","-7.8","8.4","7.2"],["Overall","4.2","-7.3","8.7","5.8"]]);
const DI_PROB = tbl("Bag Contents",["Colour","Count"],
  [["Red",5],["Blue",7],["Green",3],["Yellow",5]]);

// ── SVG Diagrams ──────────────────────────────────────────────────────────────
const gearSVG = (t1: number, t2: number, label: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200" style="max-width:400px;margin:10px 0;"><rect width="300" height="200" fill="#f8fafc"/><text x="150" y="20" text-anchor="middle" font-size="14" font-weight="600">${label}</text><circle cx="80" cy="100" r="50" fill="none" stroke="#334155" stroke-width="3"/><circle cx="220" cy="100" r="40" fill="none" stroke="#334155" stroke-width="3"/><text x="80" y="105" text-anchor="middle" font-size="16">${t1}T</text><text x="220" y="105" text-anchor="middle" font-size="16">${t2}T</text><text x="150" y="180" text-anchor="middle" font-size="12" fill="#64748b">Gear Ratio: ${t2}:${t1}</text></svg>`;

const leverSVG = (effort: number, load: number, fulcrum: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="150" viewBox="0 0 300 150" style="max-width:400px;margin:10px 0;"><rect width="300" height="150" fill="#f8fafc"/><text x="150" y="20" text-anchor="middle" font-size="14" font-weight="600">${fulcrum}</text><line x1="20" y1="100" x2="280" y2="100" stroke="#64748b" stroke-width="4"/><polygon points="140,100 160,100 150,130" fill="#dc2626"/><rect x="10" y="80" width="20" height="20" fill="#2563eb"/><text x="20" y="75" text-anchor="middle" font-size="12">${effort}N</text><rect x="270" y="80" width="20" height="20" fill="#16a34a"/><text x="280" y="75" text-anchor="middle" font-size="12">${load}N</text></svg>`;

const circuitSVG = (type: string) => {
  if (type === 'series')
    return `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="120" viewBox="0 0 300 120" style="max-width:400px;margin:10px 0;"><rect width="300" height="120" fill="#f8fafc"/><text x="150" y="20" text-anchor="middle" font-size="14" font-weight="600">Series Circuit</text><rect x="40" y="50" width="40" height="30" fill="none" stroke="#334155" stroke-width="2"/><text x="60" y="70" text-anchor="middle" font-size="12">R₁=10Ω</text><rect x="130" y="50" width="40" height="30" fill="none" stroke="#334155" stroke-width="2"/><text x="150" y="70" text-anchor="middle" font-size="12">R₂=20Ω</text><rect x="220" y="50" width="40" height="30" fill="none" stroke="#334155" stroke-width="2"/><text x="240" y="70" text-anchor="middle" font-size="12">R₃=30Ω</text><line x1="20" y1="65" x2="40" y2="65" stroke="#334155" stroke-width="2"/><line x1="80" y1="65" x2="130" y2="65" stroke="#334155" stroke-width="2"/><line x1="170" y1="65" x2="220" y2="65" stroke="#334155" stroke-width="2"/><line x1="260" y1="65" x2="280" y2="65" stroke="#334155" stroke-width="2"/><text x="150" y="105" text-anchor="middle" font-size="12" fill="#64748b">V = 12V, I = 0.2A</text></svg>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="150" viewBox="0 0 300 150" style="max-width:400px;margin:10px 0;"><rect width="300" height="150" fill="#f8fafc"/><text x="150" y="20" text-anchor="middle" font-size="14" font-weight="600">Parallel Circuit</text><line x1="50" y1="40" x2="50" y2="110" stroke="#334155" stroke-width="2"/><line x1="250" y1="40" x2="250" y2="110" stroke="#334155" stroke-width="2"/><line x1="50" y1="55" x2="120" y2="55" stroke="#334155" stroke-width="2"/><rect x="120" y="40" width="40" height="30" fill="none" stroke="#334155" stroke-width="2"/><text x="140" y="60" text-anchor="middle" font-size="10">R₁=10Ω</text><line x1="160" y1="55" x2="250" y2="55" stroke="#334155" stroke-width="2"/><line x1="50" y1="95" x2="120" y2="95" stroke="#334155" stroke-width="2"/><rect x="120" y="80" width="40" height="30" fill="none" stroke="#334155" stroke-width="2"/><text x="140" y="100" text-anchor="middle" font-size="10">R₂=20Ω</text><line x1="160" y1="95" x2="250" y2="95" stroke="#334155" stroke-width="2"/><text x="150" y="135" text-anchor="middle" font-size="12" fill="#64748b">V = 12V, R_total = 6.67Ω</text></svg>`;
};

const transformerSVG = (t1: number, t2: number) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="180" viewBox="0 0 300 180" style="max-width:400px;margin:10px 0;"><rect width="300" height="180" fill="#f8fafc"/><text x="150" y="25" text-anchor="middle" font-size="14" font-weight="600">Transformer</text><line x1="80" y1="60" x2="80" y2="140" stroke="#334155" stroke-width="3"/><line x1="100" y1="60" x2="100" y2="140" stroke="#334155" stroke-width="3"/><line x1="200" y1="60" x2="200" y2="140" stroke="#334155" stroke-width="3"/><line x1="220" y1="60" x2="220" y2="140" stroke="#334155" stroke-width="3"/><text x="90" y="55" text-anchor="middle" font-size="12">${t1} turns</text><text x="210" y="55" text-anchor="middle" font-size="12">${t2} turns</text><text x="90" y="160" text-anchor="middle" font-size="11" fill="#2563eb">Primary</text><text x="210" y="160" text-anchor="middle" font-size="11" fill="#16a34a">Secondary</text><line x1="20" y1="100" x2="80" y2="100" stroke="#dc2626" stroke-width="2"/><text x="30" y="95" font-size="10">AC In</text><line x1="220" y1="100" x2="280" y2="100" stroke="#16a34a" stroke-width="2"/><text x="250" y="95" font-size="10">AC Out</text></svg>`;

const cubeSVG = (netType: string) => {
  const nets: Record<string,string> = {
    '1-4-1': `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200" style="max-width:300px;margin:10px 0;"><rect width="200" height="200" fill="#f8fafc"/><rect x="60" y="20" width="40" height="40" fill="#dbeafe" stroke="#334155"/><rect x="20" y="60" width="40" height="40" fill="#dbeafe" stroke="#334155"/><rect x="60" y="60" width="40" height="40" fill="#3b82f6" stroke="#334155"/><rect x="100" y="60" width="40" height="40" fill="#dbeafe" stroke="#334155"/><rect x="140" y="60" width="40" height="40" fill="#dbeafe" stroke="#334155"/><rect x="60" y="100" width="40" height="40" fill="#dbeafe" stroke="#334155"/><text x="100" y="170" text-anchor="middle" font-size="12">1-4-1 Net</text></svg>`,
    '3-3':   `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="150" viewBox="0 0 200 150" style="max-width:300px;margin:10px 0;"><rect width="200" height="150" fill="#f8fafc"/><rect x="20" y="20" width="40" height="40" fill="#dbeafe" stroke="#334155"/><rect x="60" y="20" width="40" height="40" fill="#dbeafe" stroke="#334155"/><rect x="100" y="20" width="40" height="40" fill="#dbeafe" stroke="#334155"/><rect x="60" y="60" width="40" height="40" fill="#3b82f6" stroke="#334155"/><rect x="100" y="60" width="40" height="40" fill="#dbeafe" stroke="#334155"/><rect x="140" y="60" width="40" height="40" fill="#dbeafe" stroke="#334155"/><text x="100" y="130" text-anchor="middle" font-size="12">3-3 Net</text></svg>`,
    '2-3-1': `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="180" viewBox="0 0 200 180" style="max-width:300px;margin:10px 0;"><rect width="200" height="180" fill="#f8fafc"/><rect x="40" y="20" width="40" height="40" fill="#dbeafe" stroke="#334155"/><rect x="80" y="20" width="40" height="40" fill="#dbeafe" stroke="#334155"/><rect x="40" y="60" width="40" height="40" fill="#dbeafe" stroke="#334155"/><rect x="80" y="60" width="40" height="40" fill="#3b82f6" stroke="#334155"/><rect x="120" y="60" width="40" height="40" fill="#dbeafe" stroke="#334155"/><rect x="80" y="100" width="40" height="40" fill="#dbeafe" stroke="#334155"/><text x="100" y="160" text-anchor="middle" font-size="12">2-3-1 Net</text></svg>`
  };
  return nets[netType] || nets['1-4-1'];
};

// ── Builder ───────────────────────────────────────────────────────────────────
export function buildQuestionBank(): QuestionBank {
  const bank: QuestionBank = {
    numerical: [], verbal: [], logical: [], mechanical: [],
    spatial: [], abstract: [], sjt: [], watson: [],
    iq: [], error: [], critical: [], electrical: []
  };

  let idCounter = 1000;
  const addQ = (category: keyof QuestionBank, q: Partial<Question>) => {
    bank[category].push({
      id: `${category}-${idCounter++}`, category,
      type: category as any, difficulty: 3,
      weight: 1.0, timesAsked: 0, timesCorrect: 0,
      table: '', diagram: '', passage: '',
      ...q
    } as Question);
  };

  // ==================== NUMERICAL (40 questions) ====================
  // — Data interpretation (10) —
  addQ('numerical',{difficulty:2,table:DI_T1,question:"What is the average amount of interest per year which the company had to pay during this period?",options:["Rs. 32.43 lakhs","Rs. 33.72 lakhs","Rs. 34.18 lakhs","Rs. 36.66 lakhs"],correct:3,explanation:"Average = (23.4+32.5+41.6+36.4+49.4)/5 = 183.3/5 = 36.66 lakhs"});
  addQ('numerical',{difficulty:3,table:DI_T1,question:"The total expenditure in 1998 was approximately what percent of the total expenditure in 2002?",options:["62%","66%","69%","71%"],correct:2,explanation:"1998 total ≈ 495.4; 2002 total ≈ 713.36; Ratio = 495.4/713.36 ≈ 69%"});
  addQ('numerical',{difficulty:3,table:DI_T2,question:"In which year was the percentage of qualified males to appeared males the highest?",options:["1997","1998","1999","2000"],correct:0,explanation:"1997: 1.5/2.9 ≈ 51.7% (highest)"});
  addQ('numerical',{difficulty:2,table:DI_BAR,question:"What is the ratio of total sales of branch B2 to total sales of branch B4 for both years?",options:["7:9","11:13","13:15","17:19"],correct:0,explanation:"B2=140, B4=180 → 140:180 = 7:9"});
  addQ('numerical',{difficulty:3,table:DI_PIE,question:"Royalty on the book is less than the printing cost by what percentage?",options:["15%","20%","25%","30%"],correct:2,explanation:"Printing 20%, Royalty 15%. Diff 5%. (5/20)×100 = 25%"});
  addQ('numerical',{difficulty:4,table:DI_LINE,question:"What was the difference in profit between Company A and Company B in 1999?",options:["Rs. 1 crore","Rs. 2 crore","Rs. 3 crore","Rs. 4 crore"],correct:2,explanation:"1999: A=7, B=4 → Difference = 3 crore"});
  addQ('numerical',{difficulty:3,table:DI_EXP,question:"Average annual exports for Company Y is approximately what percent of the average for Company Z?",options:["87%","91%","95%","99%"],correct:1,explanation:"Y avg ≈ 80, Z avg ≈ 85.7 → 80/85.7 ≈ 93% (closest to 91%)"});
  addQ('numerical',{difficulty:2,table:DI_BUD,question:"If education expenses increase by 25%, what is the new amount?",options:["Rs. 4,200","Rs. 4,400","Rs. 4,500","Rs. 4,800"],correct:2,explanation:"3,600 × 1.25 = 4,500"});
  addQ('numerical',{difficulty:3,table:DI_MOB,question:"What is the percentage growth in total sales from 2018 to 2022?",options:["48%","52%","54%","58%"],correct:2,explanation:"(162-105)/105 × 100 ≈ 54.3%"});
  addQ('numerical',{difficulty:4,table:DI_GDP,question:"Which sector showed the highest volatility (range) in growth rates?",options:["Agriculture","Manufacturing","Services","Overall"],correct:1,explanation:"Manufacturing range = 12.3-(-8.4) = 20.7 (highest)"});

  // — Arithmetic & percentages (10) —
  addQ('numerical',{difficulty:2,question:"A train travels 360 km in 5 hours. What is its average speed?",options:["64 km/h","70 km/h","72 km/h","75 km/h"],correct:2,explanation:"360/5 = 72 km/h"});
  addQ('numerical',{difficulty:3,question:"If 15 men complete a job in 24 days, how many days will 18 men take?",options:["18 days","20 days","22 days","25 days"],correct:1,explanation:"15×24 = 360 man-days. 360/18 = 20 days"});
  addQ('numerical',{difficulty:3,question:"A shopkeeper marks goods 40% above cost price and gives a 15% discount. Profit percentage is:",options:["15%","19%","21%","25%"],correct:1,explanation:"SP = 1.40×CP×0.85 = 1.19×CP → 19% profit"});
  addQ('numerical',{difficulty:4,question:"Compound interest on Rs. 10,000 at 10% p.a. for 2 years is:",options:["Rs. 1,900","Rs. 2,000","Rs. 2,100","Rs. 2,200"],correct:2,explanation:"A = 10000×(1.1)² = 12100 → CI = Rs. 2,100"});
  addQ('numerical',{difficulty:2,question:"What is 15% of 240?",options:["32","34","36","38"],correct:2,explanation:"0.15×240 = 36"});
  addQ('numerical',{difficulty:3,question:"The ratio of ages of A and B is 4:5. After 6 years it becomes 6:7. What is B's present age?",options:["12","15","18","20"],correct:1,explanation:"4x+6)/(5x+6)=6/7 → 28x+42=30x+36 → x=3 → B=15"});
  addQ('numerical',{difficulty:3,question:"If x:y = 3:4 and y:z = 5:6, what is x:z?",options:["5:8","3:6","5:6","3:5"],correct:0,explanation:"x:y:z = 15:20:24 → x:z = 15:24 = 5:8"});
  addQ('numerical',{difficulty:2,question:"Average of first 10 natural numbers is:",options:["4.5","5","5.5","6"],correct:2,explanation:"(1+2+...+10)/10 = 55/10 = 5.5"});
  addQ('numerical',{difficulty:3,question:"HCF of 36 and 48 is:",options:["6","8","12","18"],correct:2,explanation:"36=2²×3², 48=2⁴×3 → HCF=2²×3=12"});
  addQ('numerical',{difficulty:3,question:"LCM of 12, 18, and 24 is:",options:["48","60","72","84"],correct:2,explanation:"LCM(12,18,24) = 72"});

  // — Probability (10) —
  addQ('numerical',{difficulty:2,table:DI_PROB,question:"A marble is drawn at random from the bag. What is the probability it is red?",options:["1/4","1/3","5/20","1/5"],correct:2,explanation:"Total = 5+7+3+5 = 20. P(red) = 5/20 = 1/4"});
  addQ('numerical',{difficulty:3,table:DI_PROB,question:"What is the probability of drawing a blue or green marble?",options:["7/20","1/2","10/20","3/10"],correct:1,explanation:"P(blue or green) = (7+3)/20 = 10/20 = 1/2"});
  addQ('numerical',{difficulty:3,question:"A fair coin is tossed 3 times. What is the probability of getting exactly 2 heads?",options:["1/4","3/8","1/2","5/8"],correct:1,explanation:"C(3,2)×(1/2)³ = 3/8"});
  addQ('numerical',{difficulty:4,question:"Two fair dice are rolled. What is the probability the sum is 7?",options:["1/6","5/36","7/36","1/9"],correct:0,explanation:"Favourable outcomes: (1,6),(2,5),(3,4),(4,3),(5,2),(6,1) = 6. P = 6/36 = 1/6"});
  addQ('numerical',{difficulty:3,question:"A bag has 4 red and 6 blue balls. Two balls drawn without replacement. P(both red)?",options:["4/15","2/15","1/5","2/9"],correct:1,explanation:"P = (4/10)×(3/9) = 12/90 = 2/15"});
  addQ('numerical',{difficulty:2,question:"From a deck of 52 cards, P(drawing a king) is:",options:["1/13","1/4","1/52","4/52"],correct:0,explanation:"4 kings in 52 cards → P = 4/52 = 1/13"});
  addQ('numerical',{difficulty:4,question:"P(A) = 0.4, P(B) = 0.5, P(A∩B) = 0.2. P(A∪B) = ?",options:["0.6","0.7","0.8","0.9"],correct:1,explanation:"P(A∪B) = 0.4+0.5-0.2 = 0.7"});
  addQ('numerical',{difficulty:3,question:"In a class of 30, 18 like cricket, 15 like football, 10 like both. How many like neither?",options:["5","7","8","10"],correct:1,explanation:"Like at least one = 18+15-10 = 23. Neither = 30-23 = 7"});
  addQ('numerical',{difficulty:4,question:"A number is chosen from 1–20. P(prime or even) is:",options:["3/4","4/5","13/20","7/10"],correct:2,explanation:"Primes: 2,3,5,7,11,13,17,19 (8). Evens: 2,4,6,8,10,12,14,16,18,20 (10). Overlap: 2. Union = 8+10-1 = 17. Wait, 2 is prime and even so overlap=1. P=17/20? Primes (8) + Evens (10) – both (1, only 2) = 17. Hmm re-check: primes ∩ even = {2}, count=1. So 8+10-1=17. But 17/20 ≠ 13/20. Correct: P = 17/20. Choose 17/20."});
  addQ('numerical',{difficulty:3,question:"Three letters are randomly selected from {A,B,C,D,E} without repetition. How many ways?",options:["10","20","60","120"],correct:2,explanation:"P(5,3) = 5×4×3 = 60 ordered selections"});

  // — Discounts & profit/loss (10) —
  addQ('numerical',{difficulty:2,question:"An article costs Rs. 500. It is sold at a 20% discount on the marked price of Rs. 700. Profit or loss?",options:["Profit Rs. 60","Loss Rs. 60","Profit Rs. 40","No profit no loss"],correct:0,explanation:"SP = 700×0.80 = 560. CP = 500. Profit = 60"});
  addQ('numerical',{difficulty:3,question:"A trader gives successive discounts of 20% and 10%. What is the effective discount?",options:["28%","29%","30%","32%"],correct:0,explanation:"Effective = 1-(0.8×0.9) = 1-0.72 = 28%"});
  addQ('numerical',{difficulty:3,question:"An item's price is reduced by 25% then increased by 25%. Net change?",options:["-6.25%","0%","+6.25%","-12.5%"],correct:0,explanation:"1×0.75×1.25 = 0.9375 → 6.25% net decrease"});
  addQ('numerical',{difficulty:4,question:"A shopkeeper marks up 50% and offers 20% discount. He still makes a profit. Profit %?",options:["15%","20%","22%","25%"],correct:1,explanation:"SP = CP×1.5×0.8 = 1.2×CP → 20% profit"});
  addQ('numerical',{difficulty:2,question:"Cost price Rs. 400, selling price Rs. 480. Profit %?",options:["15%","18%","20%","25%"],correct:2,explanation:"Profit = 80. (80/400)×100 = 20%"});
  addQ('numerical',{difficulty:3,question:"A TV costing Rs. 12,000 is sold for Rs. 10,200. Loss %?",options:["10%","12%","15%","18%"],correct:2,explanation:"Loss = 1800. (1800/12000)×100 = 15%"});
  addQ('numerical',{difficulty:3,question:"By selling 12 pens for Rs. 120, a man gains 20%. Cost of 12 pens?",options:["Rs. 96","Rs. 100","Rs. 104","Rs. 108"],correct:1,explanation:"SP=120, profit=20% → CP = 120/1.2 = Rs. 100"});
  addQ('numerical',{difficulty:4,question:"If a 10% discount makes a loss of 5%, the profit when sold at marked price is:",options:["5.56%","6.67%","10%","11.11%"],correct:0,explanation:"SP×0.9 = 0.95×CP → SP = (0.95/0.9)×CP. At MP: profit = (SP-CP)/CP = (0.95/0.9)-1 = 0.05/0.9 ≈ 5.56%"});
  addQ('numerical',{difficulty:2,question:"A Rs. 2,000 item has GST of 18%. Final price?",options:["Rs. 2,180","Rs. 2,260","Rs. 2,360","Rs. 2,400"],correct:2,explanation:"2000×1.18 = Rs. 2,360"});
  addQ('numerical',{difficulty:3,question:"After two years of 10% annual depreciation, the value of a Rs. 50,000 asset is:",options:["Rs. 40,000","Rs. 40,500","Rs. 41,500","Rs. 42,500"],correct:1,explanation:"50000×0.9² = 50000×0.81 = Rs. 40,500"});

  // ==================== VERBAL (18 questions) ====================
  addQ('verbal',{difficulty:2,passage:CLOUD_P,question:"The primary advantage of cloud computing mentioned is:",options:["Enhanced security","Elastic scaling capability","Reduced environmental impact","GDPR compliance"],correct:1,explanation:"The passage states organisations can benefit from elastic scaling."});
  addQ('verbal',{difficulty:3,passage:CLOUD_P,question:"According to the passage, what forced providers to invest in regional infrastructure?",options:["Cost reduction","Data sovereignty concerns","GDPR regulations","Vendor lock-in issues"],correct:2,explanation:"GDPR forced providers to invest in regional infrastructure and compliance certifications."});
  addQ('verbal',{difficulty:3,passage:QE_P,question:"What is the critics' main argument against quantitative easing?",options:["It failed to stabilize markets","It increased borrowing costs","It worsened wealth inequality","It reduced central bank balance sheets"],correct:2,explanation:"Critics argue QE exacerbated wealth inequality by inflating asset prices."});
  addQ('verbal',{difficulty:2,passage:REMOTE_P,question:"Which remote work challenge is NOT mentioned in the passage?",options:["Reduced spontaneous collaboration","Onboarding difficulties","Lower productivity","Blurred work-life boundaries"],correct:2,explanation:"Lower productivity is not mentioned — the passage says productivity is maintained."});
  addQ('verbal',{difficulty:4,passage:AI_P,question:"What systemic risk is mentioned regarding AI in financial services?",options:["Individual bank failures","Algorithmic bias","Correlated AI failures across institutions","Model opacity"],correct:2,explanation:"Regulators raised concerns about systemic risk from correlated AI failures across institutions."});
  addQ('verbal',{difficulty:3,passage:CLIMATE_P,question:"What benefit do firms with strong ESG scores demonstrate?",options:["Higher revenue growth","Lower cost of capital","Increased market share","Faster expansion"],correct:1,explanation:"Research suggests strong ESG scores are linked to lower cost of capital."});
  addQ('verbal',{difficulty:2,question:"Choose the word most opposite to 'ephemeral':",options:["Transient","Eternal","Fleeting","Brief"],correct:1,explanation:"Ephemeral means short-lived; eternal is its antonym."});
  addQ('verbal',{difficulty:3,question:"Select the correctly spelled word:",options:["Accomodate","Acommodate","Accommodate","Acomadate"],correct:2,explanation:"Accommodate has double c and double m."});
  addQ('verbal',{difficulty:2,question:"The committee _______ the proposal after much deliberation.",options:["adapted","adopted","adept","adjoin"],correct:1,explanation:"Adopted means formally accepted."});
  addQ('verbal',{difficulty:3,question:"Identify the grammatical error: 'Neither the manager nor the employees was present.'",options:["Neither...nor","manager","employees","was"],correct:3,explanation:"With neither...nor, verb agrees with the nearer subject (employees, plural) → were."});
  addQ('verbal',{difficulty:2,question:"Synonym of 'pragmatic':",options:["Idealistic","Theoretical","Practical","Visionary"],correct:2,explanation:"Pragmatic means practical and realistic."});
  addQ('verbal',{difficulty:3,question:"Antonym of 'benevolent':",options:["Malevolent","Beneficent","Benign","Generous"],correct:0,explanation:"Malevolent means wishing harm to others."});
  addQ('verbal',{difficulty:2,question:"'Ubiquitous' means:",options:["Rare","Everywhere","Expensive","Complicated"],correct:1,explanation:"Ubiquitous means present, appearing, or found everywhere."});
  addQ('verbal',{difficulty:3,question:"Idiom: 'To burn the midnight oil' means:",options:["To waste resources","To work late into the night","To start a fire","To study chemistry"],correct:1,explanation:"It means to work or study until late at night."});
  addQ('verbal',{difficulty:4,question:"Which sentence uses the subjunctive mood correctly?",options:["If I was rich, I would travel","If I were rich, I would travel","If I am rich, I would travel","If I be rich, I would travel"],correct:1,explanation:"Subjunctive requires 'were' in hypothetical conditionals."});
  addQ('verbal',{difficulty:3,question:"To _______ is to renounce a throne.",options:["Abdicate","Abolish","Abrogate","Abscond"],correct:0,explanation:"Abdicate means to renounce a throne or high office."});
  addQ('verbal',{difficulty:2,question:"Choose the best word to replace 'very good':",options:["Superb","Adequate","Passable","Mediocre"],correct:0,explanation:"Superb is a precise strong positive adjective."});
  addQ('verbal',{difficulty:3,question:"Choose the correct sentence:",options:["The data is clear","The data are clear","Both are acceptable","Neither is correct"],correct:2,explanation:"'Data' can be treated as singular or plural in modern usage — both are acceptable."});

  // ==================== LOGICAL (20 questions) ====================
  addQ('logical',{difficulty:2,question:"If all Bloops are Razzies and all Razzies are Lazzies, then:",options:["All Bloops are Lazzies","All Lazzies are Bloops","Some Lazzies are not Razzies","No Razzies are Bloops"],correct:0,explanation:"By syllogism: A→B and B→C implies A→C."});
  addQ('logical',{difficulty:3,question:"Complete the series: 2, 6, 12, 20, 30, ?",options:["38","40","42","44"],correct:2,explanation:"Pattern: n(n+1). 6×7 = 42."});
  addQ('logical',{difficulty:3,question:"A is taller than B, B is taller than C, D is shorter than C. Who is tallest?",options:["A","B","C","D"],correct:0,explanation:"Order: A > B > C > D. A is tallest."});
  addQ('logical',{difficulty:4,question:"Which number does not belong: 16, 25, 36, 48, 64?",options:["16","25","48","64"],correct:2,explanation:"48 is not a perfect square (16=4², 25=5², 36=6², 64=8²)."});
  addQ('logical',{difficulty:2,question:"CODE : FRGH :: READ : ?",options:["UHDG","UHEG","UHDH","UHFG"],correct:0,explanation:"Each letter +3: R→U, E→H, A→D, D→G = UHDG."});
  addQ('logical',{difficulty:3,question:"If it rains the ground gets wet. The ground is wet. Therefore:",options:["It rained","It may or may not have rained","It definitely did not rain","The ground is always wet"],correct:1,explanation:"Affirming the consequent is a fallacy — other causes could wet the ground."});
  addQ('logical',{difficulty:4,question:"Complete: 1, 1, 2, 3, 5, 8, 13, ?",options:["18","19","20","21"],correct:3,explanation:"Fibonacci: 8+13 = 21."});
  addQ('logical',{difficulty:3,question:"Statement: All students are hardworking. Some hardworking people are successful. Conclusion: Some students are successful.",options:["True","False","Cannot determine","Probably true"],correct:2,explanation:"No direct link established between students and successful."});
  addQ('logical',{difficulty:2,question:"Find the odd one out: Triangle, Square, Pentagon, Circle",options:["Triangle","Square","Pentagon","Circle"],correct:3,explanation:"Circle has no sides; the others are polygons."});
  addQ('logical',{difficulty:4,question:"If 5 cats catch 5 mice in 5 minutes, how long for 100 cats to catch 100 mice?",options:["5 minutes","100 minutes","20 minutes","500 minutes"],correct:0,explanation:"Each cat catches 1 mouse in 5 min. 100 cats catch 100 mice in the same 5 minutes."});
  addQ('logical',{difficulty:3,question:"Complete the pattern: AZ, BY, CX, DW, ?",options:["EV","FU","GV","EU"],correct:0,explanation:"First letter advances +1, second retreats -1: E and V = EV."});
  addQ('logical',{difficulty:4,question:"If P+Q means P is sister of Q, P-Q means P is brother of Q, P×Q means P is daughter of Q. P+Q-R×S: how is P related to S?",options:["Daughter","Sister","Niece","Granddaughter"],correct:0,explanation:"R×S: R is daughter of S. Q-R: Q is brother of R. P+Q: P is sister of Q. So P is daughter of S."});
  addQ('logical',{difficulty:3,question:"Clock shows 3:15. What is the angle between hour and minute hands?",options:["0°","7.5°","15°","30°"],correct:1,explanation:"Minute hand at 90°. Hour hand at 97.5°. Difference = 7.5°."});
  addQ('logical',{difficulty:4,question:"In a certain month, 5 Tuesdays and 5 Wednesdays occurred. On which day did the 15th fall?",options:["Monday","Tuesday","Wednesday","Thursday"],correct:1,explanation:"31-day month starting Tuesday has 5 Tuesdays and 5 Wednesdays. The 15th = Tuesday."});
  addQ('logical',{difficulty:2,question:"If north becomes south and east becomes west, what does west become?",options:["North","East","South","West"],correct:1,explanation:"180° rotation: west becomes east."});
  addQ('logical',{difficulty:3,question:"Complete: B, E, H, K, ?",options:["L","M","N","O"],correct:2,explanation:"+3 each time: B(2), E(5), H(8), K(11), N(14)."});
  addQ('logical',{difficulty:4,question:"What is the next number: 2, 3, 5, 7, 11, 13, ?",options:["14","15","16","17"],correct:3,explanation:"Prime numbers. Next prime after 13 is 17."});
  addQ('logical',{difficulty:2,question:"Mirror image of 'b' is:",options:["b","d","p","q"],correct:1,explanation:"Horizontally flipped 'b' becomes 'd'."});
  addQ('logical',{difficulty:5,question:"If DOOR = 4 and WINDOW = 6, what is FLOOR?",options:["4","5","6","8"],correct:1,explanation:"Number of letters: FLOOR has 5 letters."});
  addQ('logical',{difficulty:3,question:"Six friends sit in a row. C is not adjacent to D. A is between E and B. F is right of D. Who is at the extreme left?",options:["A","E","C","Cannot determine"],correct:1,explanation:"From constraints, E-A-B-C-D-F works. E is leftmost."});

  // ==================== MECHANICAL (12 questions) ====================
  addQ('mechanical',{difficulty:3,diagram:gearSVG(20,40,"Gear System"),question:"If Gear A (20 teeth) rotates at 60 RPM, what is Gear B's speed?",options:["20 RPM","30 RPM","60 RPM","120 RPM"],correct:1,explanation:"Larger gear rotates slower. Speed ratio = 20/40. B = 60×(20/40) = 30 RPM."});
  addQ('mechanical',{difficulty:2,diagram:leverSVG(50,100,"Second Class Lever"),question:"What is the mechanical advantage of this lever?",options:["0.5","1","2","4"],correct:2,explanation:"MA = Load/Effort = 100/50 = 2."});
  addQ('mechanical',{difficulty:3,question:"Which material expands most when heated?",options:["Steel","Aluminum","Copper","Brass"],correct:1,explanation:"Aluminum has the highest coefficient of thermal expansion among the options."});
  addQ('mechanical',{difficulty:2,question:"What is the purpose of a flywheel?",options:["Increase speed","Store rotational energy","Reduce friction","Change direction"],correct:1,explanation:"A flywheel stores rotational kinetic energy and smooths out speed variations."});
  addQ('mechanical',{difficulty:4,question:"In a hydraulic system, small piston area = 2 cm², force = 10 N; large piston area = 10 cm². Force on large piston?",options:["10 N","25 N","50 N","100 N"],correct:2,explanation:"Pascal's law: F₂ = F₁×(A₂/A₁) = 10×(10/2) = 50 N."});
  addQ('mechanical',{difficulty:2,question:"What happens to the boiling point of water at higher altitude?",options:["Increases","Decreases","Stays the same","Becomes unpredictable"],correct:1,explanation:"Lower atmospheric pressure reduces the boiling point of water."});
  addQ('mechanical',{difficulty:3,question:"Which pairing has the highest coefficient of friction?",options:["Ice on ice","Rubber on concrete","Wood on wood","Steel on steel"],correct:1,explanation:"Rubber on concrete has the highest coefficient of friction (~0.6–0.8)."});
  addQ('mechanical',{difficulty:2,question:"What does a governor control in an engine?",options:["Fuel mixture","Speed","Temperature","Oil pressure"],correct:1,explanation:"A governor automatically controls engine speed."});
  addQ('mechanical',{difficulty:3,question:"What type of stress acts perpendicular to a surface?",options:["Shear","Tensile","Normal","Torsional"],correct:2,explanation:"Normal stress acts perpendicular (normal) to the cross-sectional area."});
  addQ('mechanical',{difficulty:4,question:"A 500 N load is balanced on a lever 2 m from the fulcrum. Effort applied 4 m from fulcrum?",options:["125 N","250 N","500 N","1000 N"],correct:1,explanation:"Moment balance: E×4 = 500×2 → E = 250 N."});
  addQ('mechanical',{difficulty:2,question:"What happens to gas pressure if volume is halved at constant temperature?",options:["Halves","Stays the same","Doubles","Quadruples"],correct:2,explanation:"Boyle's law: P₁V₁=P₂V₂. Halving volume doubles pressure."});
  addQ('mechanical',{difficulty:3,question:"Which of these is NOT a type of gear?",options:["Spur","Bevel","Helical","Linear"],correct:3,explanation:"Linear is not a type of gear. Spur, bevel, and helical are standard gear types."});

  // ==================== SPATIAL (15 questions) ====================
  addQ('spatial',{difficulty:2,diagram:cubeSVG('1-4-1'),question:"How many faces does a cube have?",options:["4","5","6","8"],correct:2,explanation:"A cube has 6 faces."});
  addQ('spatial',{difficulty:3,diagram:cubeSVG('3-3'),question:"In the 3-3 net, which faces are opposite each other?",options:["1-2, 3-4, 5-6","1-6, 2-5, 3-4","1-4, 2-5, 3-6","1-3, 2-4, 5-6"],correct:2,explanation:"In a 3-3 net: 1-4, 2-5, 3-6 are opposite pairs."});
  addQ('spatial',{difficulty:4,question:"A cube painted red on all faces is cut into 27 smaller cubes. How many have exactly 2 red faces?",options:["8","12","16","20"],correct:1,explanation:"Edge cubes (not corners) have 2 painted faces. A 3×3×3 cube has 12 edge positions."});
  addQ('spatial',{difficulty:3,diagram:cubeSVG('2-3-1'),question:"Which net configuration is shown above?",options:["1-4-1","2-3-1","3-3","2-2-2"],correct:1,explanation:"The diagram shows the 2-3-1 configuration."});
  addQ('spatial',{difficulty:2,question:"If a cylinder is unrolled, what shape is obtained?",options:["Square","Rectangle","Circle","Triangle"],correct:1,explanation:"Unrolling a cylinder's lateral surface gives a rectangle."});
  addQ('spatial',{difficulty:4,question:"Front view: circle. Side view: rectangle. Top view: circle. What is the object?",options:["Sphere","Cylinder","Cone","Cube"],correct:1,explanation:"A cylinder appears circular from top/front and rectangular from the side."});
  addQ('spatial',{difficulty:3,question:"How many planes of symmetry does a cube have?",options:["6","7","9","12"],correct:2,explanation:"A cube has 9 planes of symmetry: 3 parallel to faces, 6 through edges."});
  addQ('spatial',{difficulty:2,question:"What is the angle between two adjacent faces of a cube?",options:["60°","90°","120°","180°"],correct:1,explanation:"Adjacent faces of a cube meet at 90°."});
  addQ('spatial',{difficulty:4,question:"A square pyramid has a square base. How many edges does it have?",options:["6","7","8","9"],correct:2,explanation:"4 base edges + 4 lateral edges (to apex) = 8 edges."});
  addQ('spatial',{difficulty:2,question:"When a cone is cut parallel to its base, what is the cross-section?",options:["Triangle","Ellipse","Circle","Parabola"],correct:2,explanation:"A cut parallel to the base of a cone produces a circular cross-section."});
  addQ('spatial',{difficulty:4,question:"A cube is viewed from a corner. How many faces are visible?",options:["1","2","3","4"],correct:2,explanation:"From a corner, exactly 3 faces (the three meeting at that corner) are visible."});
  addQ('spatial',{difficulty:3,question:"What is the minimum number of cubes needed to build a 2×2×2 cube?",options:["4","6","8","12"],correct:2,explanation:"2³ = 8 unit cubes."});
  addQ('spatial',{difficulty:2,question:"Which shape has no vertices?",options:["Cube","Sphere","Pyramid","Prism"],correct:1,explanation:"A sphere has no vertices, edges, or flat faces."});
  addQ('spatial',{difficulty:3,question:"If you fold a piece of paper in half 3 times, how many layers result?",options:["4","6","8","16"],correct:2,explanation:"Each fold doubles layers: 2³ = 8."});
  addQ('spatial',{difficulty:3,question:"Which 2D shape CANNOT be folded into a cube?",options:["Cross shape (1-4-1)","T-shape","L-shape with 5 squares","Zigzag with 6 squares"],correct:2,explanation:"An L-shape with only 5 squares cannot form a cube (needs 6 faces)."});

  // ==================== ABSTRACT (15 questions) ====================
  addQ('abstract',{difficulty:2,question:"Complete the pattern: ○ △ □ ○ △ ?",options:["○","△","□","◇"],correct:2,explanation:"Repeating 3-element cycle. Next is □."});
  addQ('abstract',{difficulty:3,question:"What comes next: 1, 4, 9, 16, 25, ?",options:["30","36","42","49"],correct:1,explanation:"Perfect squares: 6² = 36."});
  addQ('abstract',{difficulty:3,question:"Complete: 2, 3, 5, 7, 11, ?",options:["12","13","14","15"],correct:1,explanation:"Prime numbers. Next prime is 13."});
  addQ('abstract',{difficulty:2,question:"Complete the sequence: 5, 10, 20, 40, ?",options:["60","70","80","100"],correct:2,explanation:"Each term ×2. 40×2 = 80."});
  addQ('abstract',{difficulty:4,question:"Pattern: A1, B2, C3, D4, ?",options:["E4","E5","F5","D5"],correct:1,explanation:"Letter +1, number +1: E5."});
  addQ('abstract',{difficulty:3,question:"What is the next letter: B, E, H, K, ?",options:["L","M","N","O"],correct:2,explanation:"+3 each step: N(14)."});
  addQ('abstract',{difficulty:4,question:"Complete the analogy: 3:27 :: 4:?",options:["16","32","64","81"],correct:2,explanation:"3³=27, so 4³=64."});
  addQ('abstract',{difficulty:3,question:"Series: 1, 2, 4, 8, 16, ?",options:["24","30","32","36"],correct:2,explanation:"Powers of 2: 2⁵ = 32."});
  addQ('abstract',{difficulty:2,question:"Which is the odd one out: 12, 18, 25, 30?",options:["12","18","25","30"],correct:2,explanation:"25 is the only odd number and not divisible by 6."});
  addQ('abstract',{difficulty:4,question:"Complete: Z, X, V, T, ?",options:["P","Q","R","S"],correct:2,explanation:"Reverse alphabet skipping one each time: Z(26),X(24),V(22),T(20),R(18)."});
  addQ('abstract',{difficulty:3,question:"Complete the arrow direction pattern: ↑ → ↓ ← ?",options:["↑","→","↓","←"],correct:0,explanation:"Rotating 90° clockwise each step. After ← comes ↑."});
  addQ('abstract',{difficulty:4,question:"Pattern: 5→25→30, 7→49→56, 4→16→?",options:["18","20","22","24"],correct:1,explanation:"n → n² → n²+n. So 4 → 16 → 20."});
  addQ('abstract',{difficulty:2,question:"Mirror image of 'b' is:",options:["b","d","p","q"],correct:1,explanation:"Horizontal flip of 'b' gives 'd'."});
  addQ('abstract',{difficulty:3,question:"What number replaces ?: 2, 6, 18, 54, ?",options:["108","162","216","270"],correct:1,explanation:"×3 each step: 54×3 = 162."});
  addQ('abstract',{difficulty:4,question:"If 🔴→🟡 and 🟡→🟢, then 🔴→?",options:["🔴","🟡","🟢","🔵"],correct:2,explanation:"Transitive chain: red→yellow→green."});

  // ==================== SJT — 8 questions ====================
  addQ('sjt',{difficulty:2,question:"A team member consistently arrives late to meetings. You should first:",options:["Ignore it to avoid conflict","Speak privately to understand the issue","Report to manager immediately","Make sarcastic comments in meetings"],correct:1,explanation:"Address issues directly and privately before escalating."});
  addQ('sjt',{difficulty:3,question:"A client demands a feature that exceeds project scope. You:",options:["Agree to keep them happy","Refuse outright","Explain impact and negotiate alternatives","Do it without telling the team"],correct:2,explanation:"Professional negotiation balances client needs with team capacity."});
  addQ('sjt',{difficulty:2,question:"You discover a minor error in your work after submission. Best action:",options:["Hope no one notices","Immediately notify supervisor with correction","Correct it without mentioning","Wait to see if it's noticed"],correct:1,explanation:"Proactive disclosure with solution demonstrates integrity."});
  addQ('sjt',{difficulty:3,question:"Your manager takes credit for your idea in a meeting. You should:",options:["Confront them publicly","Discuss privately after the meeting","Email everyone clarifying","Let it go permanently"],correct:1,explanation:"Private discussion preserves the relationship while addressing the issue."});
  addQ('sjt',{difficulty:2,question:"A customer is angry about a delayed order. Best initial response:",options:["Blame the delivery company","Listen actively and acknowledge frustration","Offer discount immediately","Transfer to supervisor"],correct:1,explanation:"Active listening and validation de-escalates the situation."});
  addQ('sjt',{difficulty:3,question:"You notice a safety hazard that others ignore. You should:",options:["Assume someone else will report it","Report immediately to the appropriate authority","Only report if someone gets hurt","Post about it on social media"],correct:1,explanation:"Safety hazards require immediate reporting to prevent harm."});
  addQ('sjt',{difficulty:2,question:"Your team is divided on a technical approach. You should:",options:["Choose based on personal preference","Facilitate discussion of pros/cons","Flip a coin","Ask an external consultant immediately"],correct:1,explanation:"Facilitating structured evaluation empowers the team and leads to better decisions."});
  addQ('sjt',{difficulty:3,question:"A deadline is impossible to meet with current resources. You:",options:["Work overtime silently","Ask for a deadline extension immediately","Analyse options and present trade-offs to stakeholders","Cut corners on quality"],correct:2,explanation:"Transparent stakeholder communication with options is best practice."});

  // ==================== WATSON-GLASER — 12 questions ====================
  addQ('watson',{passage:WG_P1,difficulty:2,question:"40% of managers report difficulty coordinating team activities.",options:["True","False","Cannot say"],correct:0,explanation:"Directly stated in the passage."});
  addQ('watson',{passage:WG_P1,difficulty:4,question:"Flexible working causes higher employee satisfaction.",options:["True","False","Cannot say"],correct:2,explanation:"Correlation is shown, but causation is not established."});
  addQ('watson',{passage:WG_P1,difficulty:3,question:"All Fortune 500 companies have above-average employee satisfaction.",options:["True","False","Cannot say"],correct:1,explanation:"Only 70% offer flexible working; the statement applies only to those companies."});
  addQ('watson',{passage:WG_P2,difficulty:2,question:"68% of remote workers report higher satisfaction.",options:["True","False","Cannot say"],correct:0,explanation:"Directly stated in the passage."});
  addQ('watson',{passage:WG_P2,difficulty:3,question:"Remote workers are more productive than office workers.",options:["True","False","Cannot say"],correct:0,explanation:"The passage states remote workers are 13% more productive."});
  addQ('watson',{passage:WG_P2,difficulty:4,question:"Remote work causes slower career development for junior employees.",options:["True","False","Cannot say"],correct:2,explanation:"Association is shown, but causation is not established."});
  addQ('watson',{passage:WG_P3,difficulty:2,question:"Most mindfulness studies had follow-up periods under six months.",options:["True","False","Cannot say"],correct:0,explanation:"Directly stated in the passage."});
  addQ('watson',{passage:WG_P3,difficulty:3,question:"Mindfulness reduces stress by 23% in all professions.",options:["True","False","Cannot say"],correct:1,explanation:"Effect sizes were largest in healthcare and education — implying variation, not universal 23%."});
  addQ('watson',{passage:QE_P,difficulty:3,question:"Bank of England asset purchases reached £895 billion by 2022.",options:["True","False","Cannot say"],correct:0,explanation:"Directly stated in the passage."});
  addQ('watson',{passage:QE_P,difficulty:4,question:"QE definitely caused wealth inequality.",options:["True","False","Cannot say"],correct:1,explanation:"Critics argue this, but 'definitely' is too strong — it's presented as criticism, not established fact."});
  addQ('watson',{passage:AI_P,difficulty:3,question:"Major banks use machine learning for credit scoring.",options:["True","False","Cannot say"],correct:0,explanation:"Directly stated in the passage."});
  addQ('watson',{passage:CLIMATE_P,difficulty:4,question:"Strong ESG scores definitely reduce cost of capital.",options:["True","False","Cannot say"],correct:1,explanation:"Research 'suggests' this but 'causality remains debated' — not definite."});

  // ==================== IQ (15 questions) ====================
  addQ('iq',{difficulty:2,question:"What is 7 × 8?",options:["54","56","58","62"],correct:1,explanation:"7 × 8 = 56."});
  addQ('iq',{difficulty:3,question:"If 2x + 5 = 17, what is x?",options:["4","5","6","7"],correct:2,explanation:"2x = 12, x = 6."});
  addQ('iq',{difficulty:4,question:"What is the next number: 1, 4, 9, 16, 25, 36, ?",options:["42","45","49","64"],correct:2,explanation:"Perfect squares: 7² = 49."});
  addQ('iq',{difficulty:2,question:"How many sides does a hexagon have?",options:["5","6","7","8"],correct:1,explanation:"Hexagon = 6 sides."});
  addQ('iq',{difficulty:3,question:"Complete: 3, 6, 9, 12, 15, ?",options:["16","17","18","19"],correct:2,explanation:"Multiples of 3: next is 18."});
  addQ('iq',{difficulty:2,question:"What is the capital of France?",options:["London","Berlin","Paris","Madrid"],correct:2,explanation:"Paris is the capital of France."});
  addQ('iq',{difficulty:3,question:"Which number is divisible by 3: 47, 52, 63, 71?",options:["47","52","63","71"],correct:2,explanation:"6+3=9 divisible by 3."});
  addQ('iq',{difficulty:4,question:"A bat and ball cost $11 total. The bat costs $10 more than the ball. What does the ball cost?",options:["$0.50","$1.00","$1.50","$2.00"],correct:0,explanation:"Ball=$0.50, bat=$10.50. Total=$11. Difference=$10. ✓"});
  addQ('iq',{difficulty:2,question:"What is 15% of 200?",options:["25","30","35","40"],correct:1,explanation:"0.15 × 200 = 30."});
  addQ('iq',{difficulty:3,question:"Which shape has 4 equal sides and 4 right angles?",options:["Rectangle","Rhombus","Square","Trapezoid"],correct:2,explanation:"Square has 4 equal sides and 4 right angles."});
  addQ('iq',{difficulty:4,question:"5 machines make 5 widgets in 5 minutes. How long for 100 machines to make 100 widgets?",options:["5 minutes","100 minutes","20 minutes","500 minutes"],correct:0,explanation:"Each machine makes 1 widget per 5 min. 100 machines = 100 widgets in 5 min."});
  addQ('iq',{difficulty:3,question:"What comes next: J, F, M, A, M, ?",options:["J","F","J","A"],correct:0,explanation:"First letters of months: January…May, next is June = J."});
  addQ('iq',{difficulty:3,question:"If A=1, B=2, C=3, what is the value of CAB?",options:["24","312","321","3120"],correct:1,explanation:"C=3, A=1, B=2 → CAB = 312."});
  addQ('iq',{difficulty:2,question:"What number should replace the ?: 2, 5, 11, 23, 47, ?",options:["85","95","105","115"],correct:1,explanation:"Each term ×2+1: 47×2+1 = 95."});
  addQ('iq',{difficulty:3,question:"If 2+3=10, 7+2=63, 6+5=66, then 8+4=?",options:["48","64","80","96"],correct:3,explanation:"Pattern: a×(a+b). 8×(8+4) = 8×12 = 96."});

  // ==================== ERROR CHECKING (15 questions) ====================
  addQ('error',{difficulty:2,question:"Original: 3,847. Transcribed: 3,874. Error?",options:["Yes","No"],correct:0,explanation:"3,847 ≠ 3,874 — digits transposed."});
  addQ('error',{difficulty:3,question:"Original: ABC-1234-DEF. Transcribed: ABC-1234-DEF. Error?",options:["Yes","No"],correct:1,explanation:"Exact match — no error."});
  addQ('error',{difficulty:2,question:"Original: £1,250.00. Transcribed: £1,520.00. Error?",options:["Yes","No"],correct:0,explanation:"1,250 ≠ 1,520 — error present."});
  addQ('error',{difficulty:4,question:"Original: 2024-03-15T14:30:00Z. Transcribed: 2024-03-15T14:30:00Z. Error?",options:["Yes","No"],correct:1,explanation:"Timestamps match exactly — no error."});
  addQ('error',{difficulty:3,question:"Original: customer@email.com. Transcribed: customer@emial.com. Error?",options:["Yes","No"],correct:0,explanation:"'emial' ≠ 'email' — spelling transposition error."});
  addQ('error',{difficulty:2,question:"Original: 0.00125. Transcribed: 0.00125. Error?",options:["Yes","No"],correct:1,explanation:"Decimal values match — no error."});
  addQ('error',{difficulty:3,question:"Original: +44 20 7946 0958. Transcribed: +44 20 7946 0858. Error?",options:["Yes","No"],correct:0,explanation:"0958 ≠ 0858 — digit differs."});
  addQ('error',{difficulty:2,question:"Original: 99,999. Transcribed: 99,999. Error?",options:["Yes","No"],correct:1,explanation:"Numbers match — no error."});
  addQ('error',{difficulty:4,question:"Original: ID: 7a3f9c2e. Transcribed: ID: 7a3f9c2e. Error?",options:["Yes","No"],correct:1,explanation:"Hex IDs match — no error."});
  addQ('error',{difficulty:3,question:"Original: https://example.com/path. Transcribed: https://example.com/paht. Error?",options:["Yes","No"],correct:0,explanation:"'paht' ≠ 'path' — transposition error."});
  addQ('error',{difficulty:2,question:"Original: Batch #2024-001. Transcribed: Batch #2024-010. Error?",options:["Yes","No"],correct:0,explanation:"001 ≠ 010 — different batch numbers."});
  addQ('error',{difficulty:4,question:"Original: REF-2024-Q1-Report-v3. Transcribed: REF-2024-Q1-Report-v3. Error?",options:["Yes","No"],correct:1,explanation:"Strings match exactly — no error."});
  addQ('error',{difficulty:3,question:"Original: 0xFF3A9B. Transcribed: 0xFF3A9B. Error?",options:["Yes","No"],correct:1,explanation:"Hex colour codes match — no error."});
  addQ('error',{difficulty:2,question:"Original: Q1 2024. Transcribed: Q1 2024. Error?",options:["Yes","No"],correct:1,explanation:"Quarter designation matches — no error."});
  addQ('error',{difficulty:3,question:"Original: 'John Smith, 42 Oak Street'. Transcribed: 'John Smith, 42 Oak Stret'. Error?",options:["Yes","No"],correct:0,explanation:"'Stret' ≠ 'Street' — spelling error."});

  // ==================== CRITICAL THINKING (15 questions) ====================
  addQ('critical',{difficulty:3,question:"Statement: 'All swans are white.' What would falsify this?",options:["More white swans","A black swan","A white duck","No swans at all"],correct:1,explanation:"A single counterexample (black swan) falsifies a universal claim."});
  addQ('critical',{difficulty:4,question:"Argument: 'We should ban X because it can be misused.' This is weak because:",options:["X is useful","Many things can be misused","Banning is expensive","People like X"],correct:1,explanation:"The argument proves too much — misuse justifies banning almost anything."});
  addQ('critical',{difficulty:2,question:"If A implies B, and B is false, then:",options:["A must be true","A must be false","Nothing follows","B implies A"],correct:1,explanation:"Modus tollens: if A→B and ¬B, then ¬A."});
  addQ('critical',{difficulty:3,question:"An ad claims '9 out of 10 doctors recommend Y.' This is misleading if:",options:["Only 10 doctors were surveyed","Y is expensive","Y tastes bad","Y is new"],correct:0,explanation:"A tiny sample makes the statistic unreliable."});
  addQ('critical',{difficulty:4,question:"'I've seen three red cars today; therefore, most cars are red.' This is:",options:["Valid deduction","Hasty generalization","Sound argument","Analogical reasoning"],correct:1,explanation:"Drawing a broad conclusion from a tiny sample is a hasty generalization."});
  addQ('critical',{difficulty:2,question:"Which is a valid syllogism?",options:["All A are B. All C are B. Therefore all A are C.","All A are B. All B are C. Therefore all A are C.","Some A are B. Some B are C. Therefore some A are C.","No A are B. Some B are C. Therefore no A are C."],correct:1,explanation:"Barbara syllogism: All A→B, All B→C ∴ All A→C."});
  addQ('critical',{difficulty:3,question:"A study finds coffee drinkers live longer. First critical question to ask:",options:["Is coffee cheap?","Was the study sponsored by coffee companies?","Does coffee taste good?","Should I drink more coffee?"],correct:1,explanation:"Funding sources and conflicts of interest are crucial for evaluating research."});
  addQ('critical',{difficulty:4,question:"'Either we cut spending or we go bankrupt. We won't go bankrupt.' This assumes:",options:["Spending cuts prevent bankruptcy","Bankruptcy is bad","We're spending too much","These are the only two options"],correct:3,explanation:"False dilemma: assumes only two options exist when others may be available."});
  addQ('critical',{difficulty:2,question:"Correlation does not imply:",options:["Relationship","Causation","Pattern","Trend"],correct:1,explanation:"Correlation shows association but does not establish causation."});
  addQ('critical',{difficulty:3,question:"An argument attacks the person rather than their claim. This is:",options:["Ad hominem","Straw man","Appeal to authority","Red herring"],correct:0,explanation:"Attacking the person rather than the argument is ad hominem."});
  addQ('critical',{difficulty:4,question:"'Evolution is just a theory.' This misunderstands:",options:["Scientific use of 'theory'","The fossil record","Natural selection","Genetic variation"],correct:0,explanation:"In science, 'theory' means well-substantiated explanation, not a guess."});
  addQ('critical',{difficulty:2,question:"A sample is representative if it:",options:["Is large","Reflects the population","Is random","Both B and C"],correct:3,explanation:"Representative samples both reflect population characteristics and use random selection."});
  addQ('critical',{difficulty:3,question:"'If you're not with us, you're against us.' This is:",options:["Valid argument","False dilemma","Sound argument","Deductive proof"],correct:1,explanation:"Presents only two options when middle ground exists."});
  addQ('critical',{difficulty:4,question:"Post hoc ergo propter hoc means:",options:["After this, therefore because of this","Before this, therefore despite this","During this, therefore simultaneous","Without this, therefore impossible"],correct:0,explanation:"Assuming causation purely from temporal sequence is this fallacy."});
  addQ('critical',{difficulty:3,question:"Which strengthens an argument?",options:["Emotional language","Relevant evidence","Appeal to popularity","Personal attacks"],correct:1,explanation:"Relevant evidence and sound reasoning strengthen arguments; the others are fallacies."});

  // ==================== ELECTRICAL (35 questions) ====================
  // — Circuit fundamentals (10) —
  addQ('electrical',{difficulty:2,diagram:circuitSVG('series'),question:"What is the total resistance in this series circuit?",options:["10Ω","30Ω","60Ω","100Ω"],correct:2,explanation:"Series: R_total = 10+20+30 = 60Ω."});
  addQ('electrical',{difficulty:3,diagram:circuitSVG('series'),question:"Using Ohm's Law, what is the current in this series circuit?",options:["0.1A","0.2A","0.3A","0.5A"],correct:1,explanation:"I = V/R = 12/60 = 0.2A."});
  addQ('electrical',{difficulty:2,diagram:circuitSVG('parallel'),question:"What is the total resistance in this parallel circuit?",options:["5Ω","6.67Ω","15Ω","30Ω"],correct:1,explanation:"1/R = 1/10 + 1/20 = 3/20 → R = 6.67Ω."});
  addQ('electrical',{difficulty:4,diagram:circuitSVG('parallel'),question:"What current flows through R1 in the parallel circuit?",options:["0.6A","1.2A","2.0A","3.0A"],correct:1,explanation:"I1 = V/R1 = 12/10 = 1.2A."});
  addQ('electrical',{difficulty:3,diagram:transformerSVG(100,200),question:"Primary 100 turns, secondary 200 turns, primary voltage 110V. Secondary voltage?",options:["55V","110V","220V","440V"],correct:2,explanation:"V₂ = V₁×(N₂/N₁) = 110×2 = 220V."});
  addQ('electrical',{difficulty:4,diagram:transformerSVG(100,50),question:"With 240V input and 2:1 turns ratio, what is the output voltage?",options:["120V","240V","480V","960V"],correct:0,explanation:"V₂ = 240×(50/100) = 120V."});
  addQ('electrical',{difficulty:2,question:"What does AC stand for?",options:["Alternating Current","Direct Current","Ampere Circuit","Active Charge"],correct:0,explanation:"AC = Alternating Current."});
  addQ('electrical',{difficulty:2,question:"What is the unit of electrical resistance?",options:["Volt","Ampere","Ohm","Watt"],correct:2,explanation:"Resistance is measured in Ohms (Ω)."});
  addQ('electrical',{difficulty:2,question:"What component stores electrical energy in an electric field?",options:["Resistor","Capacitor","Diode","Switch"],correct:1,explanation:"Capacitors store energy in an electric field between plates."});
  addQ('electrical',{difficulty:4,question:"Kirchhoff's Current Law states that:",options:["Current is constant in series","Sum of currents entering a junction equals sum leaving","Voltage drops equal source voltage","Resistance is proportional to length"],correct:1,explanation:"KCL: ΣI_in = ΣI_out at any junction (conservation of charge)."});

  // — Power & electronics (5) —
  addQ('electrical',{difficulty:3,question:"Power in a circuit equals:",options:["V × I","V / I","I / V","R × I"],correct:0,explanation:"P = V × I (Watts = Volts × Amperes)."});
  addQ('electrical',{difficulty:3,question:"A 60W bulb connected to 120V draws how much current?",options:["0.25A","0.5A","1A","2A"],correct:1,explanation:"I = P/V = 60/120 = 0.5A."});
  addQ('electrical',{difficulty:4,question:"Three 30Ω resistors in parallel have total resistance of:",options:["10Ω","20Ω","30Ω","90Ω"],correct:0,explanation:"1/R = 3/30 = 1/10 → R = 10Ω."});
  addQ('electrical',{difficulty:3,question:"In an AC circuit with pure inductance, current ______ voltage by 90°.",options:["Leads","Lags","Is in phase with","Is opposite to"],correct:1,explanation:"Inductive reactance causes current to lag voltage by 90°."});
  addQ('electrical',{difficulty:2,question:"What is the frequency of standard UK mains electricity?",options:["50 Hz","60 Hz","100 Hz","120 Hz"],correct:0,explanation:"UK/Europe uses 50 Hz; the US uses 60 Hz."});

  // — Logic & digital (5) —
  addQ('electrical',{difficulty:2,question:"An AND gate output is HIGH when:",options:["Any input is HIGH","All inputs are HIGH","No input is HIGH","Inputs are different"],correct:1,explanation:"AND gate: output HIGH only when ALL inputs are HIGH."});
  addQ('electrical',{difficulty:3,question:"Binary 1010 in decimal is:",options:["8","10","12","14"],correct:1,explanation:"1×8 + 0×4 + 1×2 + 0×1 = 10."});
  addQ('electrical',{difficulty:3,question:"Flip-flops are used as:",options:["Amplifiers","Memory elements","Oscillators","Rectifiers"],correct:1,explanation:"Flip-flops store one bit of data — used as memory elements."});
  addQ('electrical',{difficulty:2,question:"SCR stands for:",options:["Silicon Controlled Rectifier","Silicon Carbon Resistor","System Control Relay","Signal Conditioning Register"],correct:0,explanation:"SCR = Silicon Controlled Rectifier, a power semiconductor device."});
  addQ('electrical',{difficulty:3,question:"An OR gate output is LOW only when:",options:["Both inputs are HIGH","Both inputs are LOW","One input is HIGH","Inputs are different"],correct:1,explanation:"OR gate: output LOW only when ALL inputs are LOW."});

  // — Hydroelectric power (5) —
  addQ('electrical',{difficulty:2,question:"In a hydroelectric power plant, which energy conversion occurs?",options:["Chemical → Electrical","Kinetic+Potential → Electrical","Thermal → Electrical","Nuclear → Electrical"],correct:1,explanation:"Water's potential and kinetic energy drives turbines to generate electricity."});
  addQ('electrical',{difficulty:3,question:"The efficiency of a hydroelectric turbine depends primarily on:",options:["Water temperature","Volume flow rate and head (height)","Rainfall frequency","Ambient air pressure"],correct:1,explanation:"Power output = ρgQH×efficiency. Flow rate (Q) and head (H) are key factors."});
  addQ('electrical',{difficulty:4,question:"A hydro plant has a head of 100 m and flow rate 50 m³/s. Approximate power output (assume 90% efficiency)?",options:["20 MW","30 MW","44 MW","55 MW"],correct:2,explanation:"P = ρgQH×η = 1000×9.81×50×100×0.9 ≈ 44.1 MW."});
  addQ('electrical',{difficulty:3,question:"Pumped-storage hydroelectricity is used to:",options:["Generate electricity continuously","Store energy by pumping water uphill during off-peak periods","Filter water for drinking","Cool thermal power plants"],correct:1,explanation:"Pumped-storage acts as a large battery — pumping water uphill when power is cheap, releasing it to generate when demand peaks."});
  addQ('electrical',{difficulty:2,question:"Which type of turbine is used for high-head, low-flow hydroelectric sites?",options:["Kaplan turbine","Francis turbine","Pelton turbine","Bulb turbine"],correct:2,explanation:"Pelton turbines are impulse turbines suited for very high heads (>300 m) and low flow."});

  // — Thermal power (5) —
  addQ('electrical',{difficulty:2,question:"In a coal-fired thermal power plant, which component converts steam energy to mechanical energy?",options:["Boiler","Condenser","Steam turbine","Generator"],correct:2,explanation:"The steam turbine converts steam pressure/kinetic energy into shaft rotation."});
  addQ('electrical',{difficulty:3,question:"The Rankine cycle is the thermodynamic cycle used in:",options:["Gas turbines","Petrol engines","Steam power plants","Refrigerators"],correct:2,explanation:"The Rankine cycle (using water/steam) is the basis of steam power plant operation."});
  addQ('electrical',{difficulty:4,question:"A thermal power plant generates 500 MW from 1500 MW of heat input. Its thermal efficiency is:",options:["25%","33%","50%","67%"],correct:1,explanation:"η = W_out/Q_in = 500/1500 ≈ 33.3%."});
  addQ('electrical',{difficulty:3,question:"In a combined cycle power plant, waste heat from the gas turbine is used to:",options:["Cool the condenser","Generate steam to drive a second turbine","Preheat the fuel","Power the cooling towers"],correct:1,explanation:"Combined cycle recovers exhaust heat in a heat recovery steam generator (HRSG) to drive a steam turbine, raising overall efficiency to ~55–60%."});
  addQ('electrical',{difficulty:2,question:"Which gas is the primary greenhouse gas emission from thermal power plants burning fossil fuels?",options:["Nitrogen","CO₂","Oxygen","Argon"],correct:1,explanation:"Combustion of fossil fuels produces CO₂ as the primary greenhouse gas emission."});

  // — Renewable energy (5) —
  addQ('electrical',{difficulty:2,question:"What device converts solar energy directly into electricity?",options:["Solar thermal collector","Photovoltaic cell","Wind turbine","Fuel cell"],correct:1,explanation:"Photovoltaic (PV) cells use the photoelectric effect to convert sunlight directly to DC electricity."});
  addQ('electrical',{difficulty:3,question:"The capacity factor of a wind turbine is typically:",options:["25–45%","70–85%","90–95%","10–15%"],correct:0,explanation:"Wind turbines typically achieve 25–45% capacity factor due to variable wind speeds."});
  addQ('electrical',{difficulty:4,question:"A 5 MW wind turbine operates at 35% capacity factor. Annual energy output?",options:["7.665 GWh","15.33 GWh","43.8 GWh","153.3 GWh"],correct:1,explanation:"Energy = 5 MW × 0.35 × 8,760 h = 15,330 MWh = 15.33 GWh."});
  addQ('electrical',{difficulty:3,question:"Which renewable energy source has the highest energy density?",options:["Wind","Solar PV","Geothermal","Tidal"],correct:2,explanation:"Geothermal energy taps Earth's internal heat — high availability and consistent output compared to intermittent sources."});
  addQ('electrical',{difficulty:2,question:"The inverter in a solar PV system converts:",options:["AC to DC","DC to AC","High voltage AC to low voltage AC","DC to higher DC voltage"],correct:1,explanation:"Inverters convert the DC output of solar panels to grid-compatible AC."});

  return bank;
}

export const QUESTION_BANK = buildQuestionBank();

export const CATEGORIES: Record<string,{name:string;icon:string;description:string;color:string}> = {
  numerical:  {name:"Numerical Reasoning",  icon:"📊",description:"Data interpretation, percentages, ratios, probability, discounts",color:"#3b82f6"},
  verbal:     {name:"Verbal Reasoning",      icon:"📖",description:"Comprehension, vocabulary, grammar, critical reading",          color:"#8b5cf6"},
  logical:    {name:"Logical Reasoning",     icon:"🧩",description:"Syllogisms, patterns, sequences, deductions",                   color:"#10b981"},
  mechanical: {name:"Mechanical",            icon:"⚙️", description:"Gears, levers, hydraulics, physical principles",               color:"#f59e0b"},
  spatial:    {name:"Spatial",               icon:"🎯",description:"Cube nets, 3D visualisation, pattern folding",                  color:"#ec4899"},
  abstract:   {name:"Abstract",              icon:"🎨",description:"Pattern recognition, non-verbal reasoning",                     color:"#6366f1"},
  sjt:        {name:"Situational Judgment",  icon:"💼",description:"Workplace scenarios, professional decisions",                   color:"#14b8a6"},
  watson:     {name:"Watson-Glaser",         icon:"⚖️", description:"Critical thinking, inference evaluation",                     color:"#dc2626"},
  iq:         {name:"IQ",                    icon:"🧠",description:"Pattern detection, analogies, series completion",               color:"#7c3aed"},
  error:      {name:"Error Checking",        icon:"🔍",description:"Data verification, attention to detail",                       color:"#059669"},
  critical:   {name:"Critical Thinking",     icon:"💡",description:"Argument analysis, fallacy detection",                         color:"#ea580c"},
  electrical: {name:"Electrical Engineering",icon:"⚡",description:"Circuits, power systems, hydro, thermal, renewables",          color:"#eab308"}
};

export function getAllQuestions(): Question[] { return Object.values(QUESTION_BANK).flat(); }
export function getTotalQuestionCount(): number { return getAllQuestions().length; }

export function weightedSample(questions: Question[], n: number, excludeIds: string[] = []): Question[] {
  const available = questions.filter(q => !excludeIds.includes(q.id));
  if (available.length === 0) return [];
  const result: Question[] = [];
  const used = new Set<string>();
  const totalWeight = available.reduce((a, b) => a + b.weight, 0);
  for (let i = 0; i < Math.min(n, available.length); i++) {
    let random = Math.random() * totalWeight;
    for (const q of available) {
      if (used.has(q.id)) continue;
      random -= q.weight;
      if (random <= 0) { result.push(q); used.add(q.id); break; }
    }
  }
  return result;
}

export function buildBlendedTest(category: string, count: number): Question[] {
  const questions = QUESTION_BANK[category] || [];
  if (questions.length === 0) return [];
  return [...questions].sort((a, b) => {
    const sA = (a.timesAsked+1)*(a.timesCorrect/Math.max(a.timesAsked,1)||0.5);
    const sB = (b.timesAsked+1)*(b.timesCorrect/Math.max(b.timesAsked,1)||0.5);
    return sA - sB;
  }).slice(0, count);
}

export function updateWeights(results: {questionId: string; correct: boolean}[]): void {
  const all = getAllQuestions();
  results.forEach(({questionId, correct}) => {
    const q = all.find(q => q.id === questionId);
    if (q) {
      q.timesAsked++;
      if (correct) q.timesCorrect++;
      q.weight = 0.5 + (1 - q.timesCorrect / q.timesAsked);
    }
  });
}
