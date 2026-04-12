// selfGeneratingBank.ts
// Fully integrated question bank with static questions, templates, and adaptive engine.

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
  id: string; category: string; difficulty: 1|2|3|4|5;
  parameters: Record<string, TemplateParameter>;
  generate: (params: Record<string, number>) => Omit<Question, 'id'|'category'|'type'|'difficulty'|'weight'|'timesAsked'|'timesCorrect'>;
}
export interface EvolvedQuestion extends Question { parentId?: string; evolutionCount: number; }
export interface PendingQuestion extends Question {
  submittedBy: string; submittedAt: number; votes: number;
  flags: { userId: string; reason: string; timestamp: number }[];
  status: 'pending'|'approved'|'rejected'; reviewedBy?: string; reviewedAt?: number;
}
export interface PerformanceStats {
  [questionId: string]: {
    timesAsked: number; timesCorrect: number; avgResponseTime?: number;
    lastSeen: number; difficultyRating: number; category: string;
  };
}

// ── Passage constants (Watson-Glaser & Verbal) ────────────────────────────────
const WG_P1 = `A recent survey of Fortune 500 companies found that 70% offer flexible working arrangements to their employees. Companies with flexible working policies reported above-average employee satisfaction scores. However, 40% of managers report difficulty coordinating team activities in flexible environments.`;
const WG_P2 = `A study of 5,000 employees found that remote workers are 13% more productive than office-based counterparts. 68% of remote workers report higher job satisfaction. However, junior employees in remote settings show slower career progression, and some report weaker connections to organisational culture.`;
const WG_P3 = `A meta-analysis of 120 mindfulness studies found that workplace mindfulness interventions reduce stress by an average of 23%. Effect sizes were largest in healthcare and education sectors. However, most studies had follow-up periods of less than six months, limiting conclusions about long-term benefits.`;
const QE_P  = `Quantitative easing (QE) involves central banks purchasing financial assets to inject liquidity into the economy. The Bank of England's asset purchases reached £895 billion by 2022. Proponents argue QE stabilises markets and reduces borrowing costs. Critics argue it exacerbates wealth inequality by inflating asset prices benefiting those who own them.`;
const AI_P  = `Major banks now use machine learning for credit scoring, fraud detection, and portfolio optimisation. These systems can process thousands of variables simultaneously. However, regulators have raised concerns about algorithmic bias and systemic risk from correlated AI failures across institutions. Model opacity also presents challenges for accountability.`;
const CLIMATE_P = `ESG (Environmental, Social, Governance) investing has grown substantially, with global ESG assets exceeding $35 trillion by 2020. Research suggests firms with strong ESG scores demonstrate lower cost of capital and better long-term financial resilience. However, critics note that ESG metrics lack standardisation, and causality remains debated.`;
const CLOUD_P   = `Cloud computing allows organisations to access scalable IT resources on demand without maintaining physical infrastructure. Key benefits include elastic scaling capability, reduced capital expenditure, and pay-as-you-go pricing. However, data sovereignty concerns have forced providers to invest in regional infrastructure and compliance certifications including GDPR.`;
const REMOTE_P  = `Remote working has become mainstream following the COVID-19 pandemic. Studies show that productivity is maintained or improved for most remote workers, and employees report higher work-life satisfaction. However, challenges include reduced spontaneous collaboration, difficulties onboarding new employees, and blurred work-life boundaries for some workers.`;
const WG_P4 = `A growing number of organisations have adopted hybrid working models that combine remote and in-office work. Proponents argue that hybrid systems improve employee autonomy, reduce commuting time, and expand access to a broader talent pool. Some studies report increases in self-reported productivity under hybrid arrangements. However, critics note that productivity metrics are often inconsistent and may not capture long-term output quality. They also argue that hybrid systems can create coordination inefficiencies, particularly in large teams where informal communication plays a key role in problem-solving. Additionally, junior employees may receive fewer mentoring opportunities compared to fully in-office environments. Despite these concerns, many firms are reluctant to return to fully office-based systems, citing employee retention benefits and reduced operational costs associated with office space.`;
const WG_P5 = `Artificial intelligence systems are increasingly being deployed in financial decision-making processes such as credit scoring, fraud detection, and portfolio management. These systems can process large datasets faster than traditional methods and identify patterns that may not be visible to human analysts. Nevertheless, concerns remain regarding model transparency and bias. Some researchers argue that AI systems may reproduce historical inequalities present in training data. Others highlight the risk of over-reliance on automated systems, particularly when human oversight is reduced. Regulatory bodies have begun exploring frameworks to ensure accountability in AI-driven financial decisions, though consensus on global standards has not yet been achieved.`;
const WG_P6 = `Environmental, Social, and Governance (ESG) criteria have become increasingly integrated into corporate strategy and investment decision-making. Many institutional investors now consider ESG performance as part of their risk assessment process. Supporters argue that firms with strong ESG profiles may benefit from improved reputation, lower cost of capital, and stronger long-term resilience. However, critics caution that ESG metrics lack standardisation, making comparisons across firms difficult. Some studies suggest a correlation between ESG performance and financial returns, but causation remains contested due to confounding factors such as industry type and firm size.`;
const WG_P7 = `Remote work has significantly altered labour market dynamics by enabling firms to hire employees beyond geographical constraints. This has increased access to global talent pools and allowed some organisations to reduce operational costs. However, labour economists note that remote work may also contribute to regional inequality, as high-skilled jobs become concentrated in digitally connected sectors. Additionally, some workers report weaker organisational culture and reduced opportunities for career advancement. The long-term effects of remote work on productivity and labour market structure remain uncertain and continue to be studied.`;
const WG_P8 = `Several cities have introduced congestion pricing schemes to reduce traffic in central business districts. The policy charges drivers a fee to enter high-traffic zones during peak hours. Proponents argue that congestion pricing reduces travel time, lowers emissions, and encourages the use of public transportation. However, critics argue that such policies disproportionately affect low- and middle-income commuters who rely on private vehicles. In some cases, alternative public transport infrastructure has not expanded at the same rate as demand shifts, leading to overcrowding. Early evaluations show mixed outcomes depending on city layout, availability of alternatives, and enforcement mechanisms.`;
const WG_P9 = `Digital learning platforms have expanded access to education by allowing students to learn remotely and at their own pace. These systems often use adaptive algorithms to personalise learning content based on student performance. While some studies show improved engagement and flexibility, others suggest that self-directed learning requires higher levels of discipline, which may disadvantage certain learners. Additionally, concerns have been raised about unequal access to devices and stable internet connections. As a result, educators debate whether digital learning enhances or widens educational inequality.`;
const WG_P10 = `Pharmaceutical companies conduct clinical trials to test the safety and effectiveness of new drugs. These trials typically progress through multiple phases, each designed to evaluate different aspects such as dosage, side effects, and overall efficacy. While randomised controlled trials are considered the gold standard, critics argue that trial populations may not fully represent real-world patients. This can lead to differences between observed trial results and actual clinical outcomes. Regulatory agencies require evidence of both safety and efficacy before approving new medications for public use.`;
const WG_P11 = `Governments and corporations are increasingly adopting net-zero carbon targets. These targets aim to balance emitted greenhouse gases with equivalent removal from the atmosphere. Supporters argue that clear targets encourage innovation in renewable energy and improve long-term environmental planning. However, critics argue that some organisations rely heavily on carbon offsetting, which may not reduce actual emissions. The effectiveness of net-zero strategies varies significantly depending on implementation methods and regulatory oversight.`;
const WG_P12 = `Automation technologies are increasingly being used to replace repetitive tasks in manufacturing, logistics, and administrative work. This shift has led to productivity gains in many sectors. However, economists note that while automation reduces demand for certain job categories, it may also create new roles requiring higher skill levels. The net effect on employment levels varies depending on industry structure and workforce adaptability. There is ongoing debate about whether automation leads to long-term job displacement or job transformation.`;

// ── Static question arrays ────────────────────────────────────────────────────
// These are injected into QUESTION_BANK at runtime alongside template-generated questions.

const STATIC_VERBAL: Omit<Question, 'id'|'weight'|'timesAsked'|'timesCorrect'>[] = [
  // Passage-based comprehension
  {category:'verbal',type:'verbal',difficulty:2,passage:CLOUD_P,question:"The primary advantage of cloud computing mentioned is:",options:["Enhanced security","Elastic scaling capability","Reduced environmental impact","GDPR compliance"],correct:1,explanation:"The passage states organisations can benefit from elastic scaling.",table:'',diagram:''},
  {category:'verbal',type:'verbal',difficulty:3,passage:CLOUD_P,question:"According to the passage, what forced providers to invest in regional infrastructure?",options:["Cost reduction","Data sovereignty concerns","GDPR regulations","Vendor lock-in issues"],correct:2,explanation:"GDPR forced providers to invest in regional infrastructure and compliance certifications.",table:'',diagram:''},
  {category:'verbal',type:'verbal',difficulty:3,passage:QE_P,question:"What is the critics' main argument against quantitative easing?",options:["It failed to stabilize markets","It increased borrowing costs","It worsened wealth inequality","It reduced central bank balance sheets"],correct:2,explanation:"Critics argue QE exacerbated wealth inequality by inflating asset prices.",table:'',diagram:''},
  {category:'verbal',type:'verbal',difficulty:2,passage:REMOTE_P,question:"Which remote work challenge is NOT mentioned in the passage?",options:["Reduced spontaneous collaboration","Onboarding difficulties","Lower productivity","Blurred work-life boundaries"],correct:2,explanation:"Lower productivity is not mentioned — the passage says productivity is maintained.",table:'',diagram:''},
  {category:'verbal',type:'verbal',difficulty:4,passage:AI_P,question:"What systemic risk is mentioned regarding AI in financial services?",options:["Individual bank failures","Algorithmic bias","Correlated AI failures across institutions","Model opacity"],correct:2,explanation:"Regulators raised concerns about systemic risk from correlated AI failures across institutions.",table:'',diagram:''},
  {category:'verbal',type:'verbal',difficulty:3,passage:CLIMATE_P,question:"What benefit do firms with strong ESG scores demonstrate?",options:["Higher revenue growth","Lower cost of capital","Increased market share","Faster expansion"],correct:1,explanation:"Research suggests strong ESG scores are linked to lower cost of capital.",table:'',diagram:''},
  // Vocabulary & grammar
  {category:'verbal',type:'verbal',difficulty:2,passage:'',question:"Choose the word most opposite to 'ephemeral':",options:["Transient","Eternal","Fleeting","Brief"],correct:1,explanation:"Ephemeral means short-lived; eternal is its antonym.",table:'',diagram:''},
  {category:'verbal',type:'verbal',difficulty:3,passage:'',question:"Select the correctly spelled word:",options:["Accomodate","Acommodate","Accommodate","Acomadate"],correct:2,explanation:"Accommodate has double c and double m.",table:'',diagram:''},
  {category:'verbal',type:'verbal',difficulty:2,passage:'',question:"The committee _______ the proposal after much deliberation.",options:["adapted","adopted","adept","adjoin"],correct:1,explanation:"Adopted means formally accepted.",table:'',diagram:''},
  {category:'verbal',type:'verbal',difficulty:3,passage:'',question:"Identify the grammatical error: 'Neither the manager nor the employees was present.'",options:["Neither...nor","manager","employees","was"],correct:3,explanation:"With neither...nor, verb agrees with the nearer subject (employees, plural) → were.",table:'',diagram:''},
  {category:'verbal',type:'verbal',difficulty:2,passage:'',question:"Synonym of 'pragmatic':",options:["Idealistic","Theoretical","Practical","Visionary"],correct:2,explanation:"Pragmatic means practical and realistic.",table:'',diagram:''},
  {category:'verbal',type:'verbal',difficulty:3,passage:'',question:"Antonym of 'benevolent':",options:["Malevolent","Beneficent","Benign","Generous"],correct:0,explanation:"Malevolent means wishing harm to others.",table:'',diagram:''},
  {category:'verbal',type:'verbal',difficulty:2,passage:'',question:"'Ubiquitous' means:",options:["Rare","Everywhere","Expensive","Complicated"],correct:1,explanation:"Ubiquitous means present, appearing, or found everywhere.",table:'',diagram:''},
  {category:'verbal',type:'verbal',difficulty:3,passage:'',question:"Idiom: 'To burn the midnight oil' means:",options:["To waste resources","To work late into the night","To start a fire","To study chemistry"],correct:1,explanation:"It means to work or study until late at night.",table:'',diagram:''},
  {category:'verbal',type:'verbal',difficulty:4,passage:'',question:"Which sentence uses the subjunctive mood correctly?",options:["If I was rich, I would travel","If I were rich, I would travel","If I am rich, I would travel","If I be rich, I would travel"],correct:1,explanation:"Subjunctive requires 'were' in hypothetical conditionals.",table:'',diagram:''},
  {category:'verbal',type:'verbal',difficulty:3,passage:'',question:"To _______ is to renounce a throne.",options:["Abdicate","Abolish","Abrogate","Abscond"],correct:0,explanation:"Abdicate means to renounce a throne or high office.",table:'',diagram:''},
  {category:'verbal',type:'verbal',difficulty:2,passage:'',question:"Choose the best word to replace 'very good':",options:["Superb","Adequate","Passable","Mediocre"],correct:0,explanation:"Superb is a precise strong positive adjective.",table:'',diagram:''},
  {category:'verbal',type:'verbal',difficulty:3,passage:'',question:"Choose the correct sentence:",options:["The data is clear","The data are clear","Both are acceptable","Neither is correct"],correct:2,explanation:"'Data' can be treated as singular or plural in modern usage — both are acceptable.",table:'',diagram:''},
  // Hard verbal (Level 4-5)
  {category:'verbal',type:'verbal',difficulty:4,passage:AI_P,question:"Which assumption is most necessary for the argument that AI regulation will reduce systemic risk?",options:["AI systems are currently unregulated","Regulators can identify correlated model failures","Financial institutions will fully replace human oversight","Systemic risk cannot be measured accurately"],correct:1,explanation:"The argument depends on regulators being able to identify correlated failures to mitigate systemic risk.",table:'',diagram:''},
  {category:'verbal',type:'verbal',difficulty:5,passage:'',question:"Which statement is the strongest inference from: 'All observed instances of policy X led to short-term gains but long-term instability'?",options:["Policy X should never be used","Policy X guarantees economic collapse","Policy X may involve a trade-off between short-term gains and long-term risks","Policy X is effective in all cases except recessions"],correct:2,explanation:"The passage supports a probabilistic trade-off, not absolute conclusions.",table:'',diagram:''},
  {category:'verbal',type:'verbal',difficulty:4,passage:'',question:"Select the sentence that is grammatically and stylistically strongest:",options:["The results was significantly affected by external factors.","The results were significantly affected by external factors.","The result were significantly affected by external factors.","The results is significantly affected by external factors."],correct:1,explanation:"'Results' is plural and requires 'were'.",table:'',diagram:''},
  {category:'verbal',type:'verbal',difficulty:5,passage:'',question:"A researcher claims: 'Because productivity increased after implementing flexible work, flexible work caused the increase.' What is the key logical flaw?",options:["False analogy","Circular reasoning","Post hoc ergo propter hoc","Equivocation"],correct:2,explanation:"It assumes causation from sequence (post hoc fallacy).",table:'',diagram:''},
  {category:'verbal',type:'verbal',difficulty:4,passage:'',question:"Which word best fits: 'The politician's statement was so ______ that it could be interpreted in multiple ways.'",options:["lucid","ambiguous","eloquent","rigorous"],correct:1,explanation:"Ambiguous means open to multiple interpretations.",table:'',diagram:''},
  {category:'verbal',type:'verbal',difficulty:5,passage:'',question:"Choose the sentence that best maintains parallel structure:",options:["The company aims to reduce costs, improving efficiency, and innovation.","The company aims to reduce costs, improve efficiency, and innovate.","The company aims reducing costs, improving efficiency, and to innovate.","The company aims to reduction of costs, efficiency improvement, and innovate."],correct:1,explanation:"All verbs are parallel: reduce, improve, innovate.",table:'',diagram:''},
  {category:'verbal',type:'verbal',difficulty:4,passage:'',question:"Which word is closest in meaning to 'intransigent'?",options:["Flexible","Unyielding","Confused","Generous"],correct:1,explanation:"Intransigent means refusing to change one's views.",table:'',diagram:''},
  {category:'verbal',type:'verbal',difficulty:5,passage:'',question:"Which statement best weakens the argument: 'Remote work improves productivity because employees have fewer distractions'?",options:["Employees prefer working remotely","Some employees report increased home distractions and reduced focus","Companies save money on office space","Remote work is becoming more common globally"],correct:1,explanation:"It directly challenges the causal claim about fewer distractions.",table:'',diagram:''},
  // Critical reasoning
  {category:'verbal',type:'verbal',difficulty:5,passage:'',question:"A company increases automation and reports higher profits. Which is the strongest hidden assumption in concluding automation caused the profit increase?",options:["Profits were increasing before automation","No other major cost-cutting measures occurred simultaneously","Automation always reduces costs","Employees did not resist automation"],correct:1,explanation:"To attribute causation to automation, we must assume no other major confounding factors affected profits.",table:'',diagram:''},
  {category:'verbal',type:'verbal',difficulty:4,passage:'',question:"Which statement most weakens: 'Increasing minimum wage reduces unemployment because it increases consumer spending'?",options:["Consumer spending increases economic activity","Some businesses reduce hiring due to higher labor costs","Minimum wage varies across countries","Unemployment rates fluctuate seasonally"],correct:1,explanation:"Higher labor costs leading to reduced hiring directly weakens the causal claim.",table:'',diagram:''},
  {category:'verbal',type:'verbal',difficulty:5,passage:'',question:"If all policy reforms that reduce inflation also slow economic growth, what can be logically concluded?",options:["All inflation-reducing policies are harmful","Some inflation reduction may involve trade-offs with growth","Economic growth causes inflation","Inflation and growth are unrelated"],correct:1,explanation:"The statement implies a consistent trade-off relationship.",table:'',diagram:''},
  {category:'verbal',type:'verbal',difficulty:4,passage:'',question:"Choose the best synonym for 'obfuscate':",options:["Clarify","Confuse","Simplify","Reveal"],correct:1,explanation:"Obfuscate means to deliberately make something unclear.",table:'',diagram:''},
  {category:'verbal',type:'verbal',difficulty:5,passage:'',question:"Which sentence contains a subtle grammatical error?",options:["Neither of the answers are correct.","Each of the students is responsible for their work.","The data suggest a strong correlation.","He insisted that she be present."],correct:0,explanation:"'Neither' is singular; correct form is 'is correct'.",table:'',diagram:''},
  {category:'verbal',type:'verbal',difficulty:4,passage:'',question:"Which inference is most reasonable: 'Despite increased funding, test scores remained unchanged across schools.'",options:["Funding was ineffective in all cases","Increased funding did not directly translate into improved test scores","Schools misused all additional funds","Test scores are unrelated to education quality"],correct:1,explanation:"The statement only supports lack of observable effect, not total ineffectiveness.",table:'',diagram:''},
  {category:'verbal',type:'verbal',difficulty:5,passage:'',question:"A policy analyst argues: 'Since countries with high education spending have high GDP, increasing education spending will increase GDP.' What is the main flaw?",options:["Overgeneralization","Correlation implies causation","False dilemma","Circular reasoning"],correct:1,explanation:"It incorrectly assumes correlation equals causation.",table:'',diagram:''},
  {category:'verbal',type:'verbal',difficulty:4,passage:'',question:"Select the best word to complete: 'The scientist's theory was so ______ that it accounted for every anomaly without contradiction.'",options:["coherent","inconsistent","fragile","ambiguous"],correct:0,explanation:"Coherent means logically consistent and unified.",table:'',diagram:''},
  {category:'verbal',type:'verbal',difficulty:5,passage:'',question:"Which argument is most logically valid?",options:["If A implies B, and B implies C, then C implies A","If all A are B, and all B are C, then all A are C","If some A are B, then all B are A","If A is true, then not A is also true"],correct:1,explanation:"This is a valid syllogism (transitive logic).",table:'',diagram:''},
  {category:'verbal',type:'verbal',difficulty:4,passage:'',question:"Which sentence best maintains formal academic tone?",options:["The results kinda show a big improvement.","The results clearly show significant improvement.","The results are pretty much better.","The results show a lot better outcomes, honestly."],correct:1,explanation:"Formal tone avoids slang and subjective intensifiers.",table:'',diagram:''},
];

const STATIC_WATSON: Omit<Question, 'id'|'weight'|'timesAsked'|'timesCorrect'>[] = [
  // Original set
  {category:'watson',type:'watson',difficulty:2,passage:WG_P1,question:"40% of managers report difficulty coordinating team activities.",options:["True","False","Cannot say"],correct:0,explanation:"Directly stated in the passage.",table:'',diagram:''},
  {category:'watson',type:'watson',difficulty:4,passage:WG_P1,question:"Flexible working causes higher employee satisfaction.",options:["True","False","Cannot say"],correct:2,explanation:"Correlation is shown, but causation is not established. The passage links flexible working to satisfaction scores but does not prove it caused them.",table:'',diagram:''},
  {category:'watson',type:'watson',difficulty:3,passage:WG_P1,question:"All Fortune 500 companies have above-average employee satisfaction.",options:["True","False","Cannot say"],correct:1,explanation:"Only 70% offer flexible working; universal satisfaction for all Fortune 500 companies is not stated and cannot be inferred.",table:'',diagram:''},
  {category:'watson',type:'watson',difficulty:2,passage:WG_P2,question:"68% of remote workers report higher satisfaction.",options:["True","False","Cannot say"],correct:0,explanation:"Directly stated in the passage.",table:'',diagram:''},
  {category:'watson',type:'watson',difficulty:3,passage:WG_P2,question:"Remote workers are more productive than office workers.",options:["True","False","Cannot say"],correct:0,explanation:"The passage explicitly states remote workers are 13% more productive.",table:'',diagram:''},
  {category:'watson',type:'watson',difficulty:4,passage:WG_P2,question:"Remote work causes slower career development for junior employees.",options:["True","False","Cannot say"],correct:2,explanation:"Association is shown (slower career progression in remote settings), but the passage does not establish that remote work is the cause.",table:'',diagram:''},
  {category:'watson',type:'watson',difficulty:2,passage:WG_P3,question:"Most mindfulness studies had follow-up periods under six months.",options:["True","False","Cannot say"],correct:0,explanation:"Directly stated in the passage.",table:'',diagram:''},
  {category:'watson',type:'watson',difficulty:3,passage:WG_P3,question:"Mindfulness reduces stress by 23% in all professions.",options:["True","False","Cannot say"],correct:1,explanation:"The 23% figure is the average; effect sizes varied by sector (largest in healthcare and education), so it does not apply equally to all professions.",table:'',diagram:''},
  {category:'watson',type:'watson',difficulty:3,passage:QE_P,question:"Bank of England asset purchases reached £895 billion by 2022.",options:["True","False","Cannot say"],correct:0,explanation:"Directly stated in the passage.",table:'',diagram:''},
  {category:'watson',type:'watson',difficulty:4,passage:QE_P,question:"QE definitely caused wealth inequality.",options:["True","False","Cannot say"],correct:1,explanation:"The passage presents this as a criticism from critics, not as an established fact. The word 'definitely' makes this statement too strong to be supported.",table:'',diagram:''},
  {category:'watson',type:'watson',difficulty:3,passage:AI_P,question:"Major banks use machine learning for credit scoring.",options:["True","False","Cannot say"],correct:0,explanation:"Directly stated in the passage.",table:'',diagram:''},
  {category:'watson',type:'watson',difficulty:4,passage:CLIMATE_P,question:"Strong ESG scores definitely reduce cost of capital.",options:["True","False","Cannot say"],correct:1,explanation:"The passage says research 'suggests' this and notes 'causality remains debated' — definitive causal certainty is not established.",table:'',diagram:''},
  // Extended hard set (WG_P1)
  {category:'watson',type:'watson',difficulty:4,passage:WG_P1,question:"Most companies in the study reported improved productivity after adopting flexible work policies.",options:["True","False","Cannot say"],correct:2,explanation:"The passage mentions productivity improvements but does not quantify whether a majority of companies reported them — 'most' cannot be verified.",table:'',diagram:''},
  {category:'watson',type:'watson',difficulty:5,passage:WG_P1,question:"Flexible working arrangements eliminate coordination problems in teams.",options:["True","False","Cannot say"],correct:1,explanation:"The passage states coordination challenges still exist for 40% of managers, so they are clearly not eliminated.",table:'',diagram:''},
  {category:'watson',type:'watson',difficulty:4,passage:WG_P2,question:"All remote workers experience improved work-life balance.",options:["True","False","Cannot say"],correct:1,explanation:"The passage says many report benefits but does not claim universality. 'All' is too absolute and is contradicted by the nuanced findings.",table:'',diagram:''},
  {category:'watson',type:'watson',difficulty:5,passage:WG_P2,question:"The productivity gains from remote work are solely due to reduced commuting time.",options:["True","False","Cannot say"],correct:2,explanation:"The passage lists multiple contributing factors (flexibility, environment, autonomy) but does not isolate commuting time as the only cause or identify causes definitively.",table:'',diagram:''},
  {category:'watson',type:'watson',difficulty:4,passage:WG_P3,question:"Mindfulness training is equally effective across all occupational sectors.",options:["True","False","Cannot say"],correct:1,explanation:"The passage explicitly states effect sizes vary by sector (largest in healthcare and education), so equal effectiveness is directly contradicted.",table:'',diagram:''},
  {category:'watson',type:'watson',difficulty:5,passage:WG_P3,question:"Long-term effects of mindfulness interventions are well established and consistent.",options:["True","False","Cannot say"],correct:2,explanation:"The passage notes most studies have short follow-up periods, so long-term evidence is insufficient — but 'well established' cannot be called outright False without more data.",table:'',diagram:''},
  {category:'watson',type:'watson',difficulty:4,passage:QE_P,question:"Quantitative easing directly increases income inequality in all cases.",options:["True","False","Cannot say"],correct:1,explanation:"The passage presents inequality as a debated criticism, not a proven universal outcome. 'All cases' and 'directly' make this false.",table:'',diagram:''},
  {category:'watson',type:'watson',difficulty:5,passage:QE_P,question:"The primary goal of quantitative easing is to increase wealth inequality.",options:["True","False","Cannot say"],correct:1,explanation:"QE is described as a monetary stabilisation tool, not a wealth redistribution mechanism. Inequality is a side-effect noted by critics, not its purpose.",table:'',diagram:''},
  {category:'watson',type:'watson',difficulty:4,passage:AI_P,question:"Algorithmic bias is the only risk associated with AI in financial services.",options:["True","False","Cannot say"],correct:1,explanation:"The passage explicitly mentions multiple risks including systemic risk and model opacity. 'Only risk' is directly contradicted.",table:'',diagram:''},
  {category:'watson',type:'watson',difficulty:5,passage:CLIMATE_P,question:"Firms with strong ESG scores always outperform financially.",options:["True","False","Cannot say"],correct:1,explanation:"The passage links ESG to average improvements in performance, not guaranteed universal outperformance. 'Always' is not supported.",table:'',diagram:''},
  // New domain passages
  {category:'watson',type:'watson',difficulty:4,passage:WG_P4,question:"Hybrid working models always improve employee productivity compared to fully office-based systems.",options:["True","False","Cannot say"],correct:1,explanation:"The passage notes productivity is inconsistently measured and also highlights coordination inefficiencies. 'Always' is too absolute and is not supported.",table:'',diagram:''},
  {category:'watson',type:'watson',difficulty:5,passage:WG_P4,question:"One limitation of hybrid work is that it may reduce the effectiveness of informal communication in teams.",options:["True","False","Cannot say"],correct:0,explanation:"The passage explicitly states hybrid systems create coordination inefficiencies due to the reduced role of informal communication.",table:'',diagram:''},
  {category:'watson',type:'watson',difficulty:4,passage:WG_P5,question:"AI systems in finance eliminate the need for human oversight.",options:["True","False","Cannot say"],correct:1,explanation:"The passage explicitly warns about the risks of reduced human oversight, confirming that oversight is still needed. The statement is false.",table:'',diagram:''},
  {category:'watson',type:'watson',difficulty:5,passage:WG_P5,question:"Bias in AI financial systems may originate from the data used to train them.",options:["True","False","Cannot say"],correct:0,explanation:"The passage states AI may reproduce historical inequalities present in training data, directly supporting this statement.",table:'',diagram:''},
  {category:'watson',type:'watson',difficulty:4,passage:WG_P6,question:"ESG performance guarantees higher financial returns for all firms.",options:["True","False","Cannot say"],correct:1,explanation:"The passage notes correlation exists but causation is contested and no guarantee is mentioned. 'Guarantees' and 'all firms' are both unsupported.",table:'',diagram:''},
  {category:'watson',type:'watson',difficulty:5,passage:WG_P6,question:"Differences in industry type can affect observed relationships between ESG and financial performance.",options:["True","False","Cannot say"],correct:0,explanation:"The passage directly states that confounding factors such as industry type influence the observed relationship.",table:'',diagram:''},
  {category:'watson',type:'watson',difficulty:4,passage:WG_P7,question:"Remote work has eliminated regional inequality in labour markets.",options:["True","False","Cannot say"],correct:1,explanation:"The passage explicitly states remote work may increase regional inequality, directly contradicting this claim.",table:'',diagram:''},
  {category:'watson',type:'watson',difficulty:5,passage:WG_P7,question:"The long-term effects of remote work on labour markets are fully understood.",options:["True","False","Cannot say"],correct:1,explanation:"The passage states long-term effects remain uncertain and continue to be studied. They are therefore not fully understood.",table:'',diagram:''},
  {category:'watson',type:'watson',difficulty:4,passage:WG_P8,question:"Congestion pricing always reduces traffic in all cities where it is implemented.",options:["True","False","Cannot say"],correct:1,explanation:"The passage states outcomes are mixed depending on city layout, alternatives, and enforcement. 'Always' is directly contradicted.",table:'',diagram:''},
  {category:'watson',type:'watson',difficulty:5,passage:WG_P8,question:"The success of congestion pricing depends partly on the availability of alternative transport options.",options:["True","False","Cannot say"],correct:0,explanation:"The passage explicitly mentions availability of alternatives as one of the key factors affecting outcomes.",table:'',diagram:''},
  {category:'watson',type:'watson',difficulty:4,passage:WG_P9,question:"Digital learning platforms improve educational outcomes for all students equally.",options:["True","False","Cannot say"],correct:1,explanation:"The passage notes benefits but also disadvantages for certain learners and unequal access issues. Equal improvement for all is directly contradicted.",table:'',diagram:''},
  {category:'watson',type:'watson',difficulty:5,passage:WG_P9,question:"Access to reliable internet can influence the effectiveness of digital learning systems.",options:["True","False","Cannot say"],correct:0,explanation:"The passage explicitly mentions unequal access to internet connections as a concern affecting learning.",table:'',diagram:''},
  {category:'watson',type:'watson',difficulty:4,passage:WG_P10,question:"All drugs that pass clinical trials are completely safe for all patients.",options:["True","False","Cannot say"],correct:1,explanation:"The passage states trials assess safety and efficacy but does not claim complete safety for all patients. Trial populations may not represent all patient groups.",table:'',diagram:''},
  {category:'watson',type:'watson',difficulty:5,passage:WG_P10,question:"Clinical trial results may not always reflect real-world patient outcomes.",options:["True","False","Cannot say"],correct:0,explanation:"The passage explicitly states trial populations may not represent real-world patients, leading to differences in outcomes.",table:'',diagram:''},
  {category:'watson',type:'watson',difficulty:4,passage:WG_P11,question:"All net-zero strategies result in immediate reductions in carbon emissions.",options:["True","False","Cannot say"],correct:1,explanation:"The passage notes effectiveness varies and some organisations rely on carbon offsetting, which may not reduce actual emissions. Immediate reductions for all strategies are not guaranteed.",table:'',diagram:''},
  {category:'watson',type:'watson',difficulty:5,passage:WG_P11,question:"Carbon offsetting may not always lead to a reduction in actual emissions.",options:["True","False","Cannot say"],correct:0,explanation:"The passage explicitly states critics argue that reliance on offsetting may not reduce actual emissions, directly supporting this statement.",table:'',diagram:''},
  {category:'watson',type:'watson',difficulty:4,passage:WG_P12,question:"Automation always leads to job losses in the economy.",options:["True","False","Cannot say"],correct:1,explanation:"The passage states automation reduces some job categories but also creates new roles. Net job loss is not universal — the outcome depends on structure and adaptability.",table:'',diagram:''},
  {category:'watson',type:'watson',difficulty:5,passage:WG_P12,question:"The impact of automation on employment depends on the ability of workers to adapt to new skill requirements.",options:["True","False","Cannot say"],correct:0,explanation:"The passage explicitly states outcomes vary based on workforce adaptability, directly supporting this statement.",table:'',diagram:''},
];

const STATIC_NUMERICAL: Omit<Question, 'id'|'weight'|'timesAsked'|'timesCorrect'>[] = [
  {category:'numerical',type:'numerical',difficulty:2,passage:'',question:"A train travels 360 km in 5 hours. What is its average speed?",options:["64 km/h","70 km/h","72 km/h","75 km/h"],correct:2,explanation:"360 ÷ 5 = 72 km/h",table:'',diagram:''},
  {category:'numerical',type:'numerical',difficulty:3,passage:'',question:"If 15 men complete a job in 24 days, how many days will 18 men take?",options:["18 days","20 days","22 days","25 days"],correct:1,explanation:"15×24 = 360 man-days. 360÷18 = 20 days",table:'',diagram:''},
  {category:'numerical',type:'numerical',difficulty:3,passage:'',question:"A shopkeeper marks goods 40% above cost price and gives a 15% discount. Profit percentage is:",options:["15%","19%","21%","25%"],correct:1,explanation:"SP = 1.40 × CP × 0.85 = 1.19 × CP → 19% profit",table:'',diagram:''},
  {category:'numerical',type:'numerical',difficulty:4,passage:'',question:"Compound interest on Rs. 10,000 at 10% p.a. for 2 years is:",options:["Rs. 1,900","Rs. 2,000","Rs. 2,100","Rs. 2,200"],correct:2,explanation:"A = 10000 × (1.1)² = 12100 → CI = Rs. 2,100",table:'',diagram:''},
  {category:'numerical',type:'numerical',difficulty:2,passage:'',question:"What is 15% of 240?",options:["32","34","36","38"],correct:2,explanation:"0.15 × 240 = 36",table:'',diagram:''},
  {category:'numerical',type:'numerical',difficulty:3,passage:'',question:"The ratio of ages of A and B is 4:5. After 6 years it becomes 6:7. What is B's present age?",options:["12","15","18","20"],correct:1,explanation:"(4x+6)/(5x+6)=6/7 → 28x+42=30x+36 → x=3 → B=15",table:'',diagram:''},
  {category:'numerical',type:'numerical',difficulty:3,passage:'',question:"If x:y = 3:4 and y:z = 5:6, what is x:z?",options:["5:8","3:6","5:6","3:5"],correct:0,explanation:"x:y:z = 15:20:24 → x:z = 15:24 = 5:8",table:'',diagram:''},
  {category:'numerical',type:'numerical',difficulty:2,passage:'',question:"Average of first 10 natural numbers is:",options:["4.5","5","5.5","6"],correct:2,explanation:"(1+2+...+10)/10 = 55/10 = 5.5",table:'',diagram:''},
  {category:'numerical',type:'numerical',difficulty:3,passage:'',question:"HCF of 36 and 48 is:",options:["6","8","12","18"],correct:2,explanation:"36=2²×3², 48=2⁴×3 → HCF=2²×3=12",table:'',diagram:''},
  // Percentages
  {category:'numerical',type:'numerical',difficulty:3,passage:'',question:"A population increases from 50,000 to 60,000. What is the percentage increase?",options:["15%","18%","20%","25%"],correct:2,explanation:"Increase = 10,000. (10,000/50,000)×100 = 20%",table:'',diagram:''},
  {category:'numerical',type:'numerical',difficulty:3,passage:'',question:"If a value decreases from 200 to 150, the percentage decrease is:",options:["20%","25%","30%","35%"],correct:1,explanation:"Decrease = 50. (50/200)×100 = 25%",table:'',diagram:''},
  {category:'numerical',type:'numerical',difficulty:4,passage:'',question:"A number is increased by 20% and then decreased by 20%. The net change is:",options:["0%","4% decrease","4% increase","10% decrease"],correct:1,explanation:"Net = 1.2 × 0.8 = 0.96 → 4% decrease",table:'',diagram:''},
  // Profit & Loss
  {category:'numerical',type:'numerical',difficulty:3,passage:'',question:"A product costing Rs. 500 is sold for Rs. 600. Profit percentage is:",options:["10%","15%","20%","25%"],correct:2,explanation:"Profit = 100. (100/500)×100 = 20%",table:'',diagram:''},
  {category:'numerical',type:'numerical',difficulty:4,passage:'',question:"A trader marks goods 30% above cost price and gives a 10% discount. Profit percentage is:",options:["15%","17%","18%","20%"],correct:1,explanation:"SP = 1.3 × 0.9 × CP = 1.17 × CP → 17% profit",table:'',diagram:''},
  {category:'numerical',type:'numerical',difficulty:3,passage:'',question:"If a seller sells an item at cost price, the profit is:",options:["0%","5%","10%","Loss of 5%"],correct:0,explanation:"No gain no loss → 0%",table:'',diagram:''},
  // Discounts
  {category:'numerical',type:'numerical',difficulty:3,passage:'',question:"An item marked at Rs. 1000 is sold at 20% discount. Selling price is:",options:["Rs. 700","Rs. 750","Rs. 800","Rs. 850"],correct:2,explanation:"Discount = 200 → SP = 1000 - 200 = Rs. 800",table:'',diagram:''},
  {category:'numerical',type:'numerical',difficulty:4,passage:'',question:"Two successive discounts of 10% and 20% are equivalent to a single discount of:",options:["28%","30%","32%","25%"],correct:0,explanation:"Effective discount = 1 - (0.9 × 0.8) = 1 - 0.72 = 0.28 = 28%",table:'',diagram:''},
  // Mean / Median / Mode
  {category:'numerical',type:'numerical',difficulty:3,passage:'',question:"Find the mean of 5, 10, 15, 20.",options:["10","12.5","15","17.5"],correct:1,explanation:"Sum = 50 → Mean = 50/4 = 12.5",table:'',diagram:''},
  {category:'numerical',type:'numerical',difficulty:4,passage:'',question:"Median of 3, 7, 9, 15, 21 is:",options:["7","9","10","15"],correct:1,explanation:"Middle value of the 5 ordered values (position 3) = 9",table:'',diagram:''},
  {category:'numerical',type:'numerical',difficulty:4,passage:'',question:"Mode of 2, 4, 4, 6, 6, 6, 8 is:",options:["4","6","8","2"],correct:1,explanation:"6 appears three times — the most frequent value",table:'',diagram:''},
  // Ratios
  {category:'numerical',type:'numerical',difficulty:3,passage:'',question:"Divide 360 in the ratio 2:3.",options:["120 and 240","144 and 216","150 and 210","180 and 180"],correct:1,explanation:"Total parts = 5. 360×(2/5)=144, 360×(3/5)=216",table:'',diagram:''},
  {category:'numerical',type:'numerical',difficulty:3,passage:'',question:"If A:B = 3:5 and B:C = 4:7, find A:C.",options:["12:35","15:28","3:7","4:5"],correct:0,explanation:"A:B:C = 12:20:35 → A:C = 12:35",table:'',diagram:''},
  {category:'numerical',type:'numerical',difficulty:4,passage:'',question:"The ratio of boys to girls in a class is 5:3. If there are 40 students, number of girls is:",options:["12","15","18","20"],correct:1,explanation:"Total parts = 8. Girls = (3/8) × 40 = 15",table:'',diagram:''},
  // LCM / HCF
  {category:'numerical',type:'numerical',difficulty:3,passage:'',question:"HCF of 24 and 36 is:",options:["6","8","12","18"],correct:2,explanation:"24=2³×3, 36=2²×3² → HCF=2²×3=12",table:'',diagram:''},
  {category:'numerical',type:'numerical',difficulty:3,passage:'',question:"LCM of 6, 8, and 12 is:",options:["24","36","48","60"],correct:0,explanation:"6=2×3, 8=2³, 12=2²×3 → LCM=2³×3=24",table:'',diagram:''},
  // Statistics
  {category:'numerical',type:'numerical',difficulty:4,passage:'',question:"The average of 5 numbers is 20. If one number is removed, the average becomes 18. The removed number is:",options:["25","28","30","32"],correct:1,explanation:"Total = 5×20=100. New total = 4×18=72. Removed = 100-72 = 28",table:'',diagram:''},
  {category:'numerical',type:'numerical',difficulty:4,passage:'',question:"If all values in a dataset increase by 10, the mean:",options:["Increases by 10","Decreases by 10","Remains same","Doubles"],correct:0,explanation:"Adding a constant to every value shifts the mean by that same constant",table:'',diagram:''},
  {category:'numerical',type:'numerical',difficulty:4,passage:'',question:"A salary increases by 10% and then by 20%. Total increase is:",options:["30%","32%","28%","25%"],correct:1,explanation:"1.1 × 1.2 = 1.32 → 32% total increase",table:'',diagram:''},
];

const STATIC_ELECTRICAL: Omit<Question, 'id'|'weight'|'timesAsked'|'timesCorrect'>[] = [
  // Motors & Machines
  {category:'electrical',type:'electrical',difficulty:5,passage:'',question:"Maximum torque in an induction motor occurs when:",options:["Rotor resistance = stator resistance","Rotor reactance = rotor resistance","Slip = 1","Rotor resistance = rotor reactance"],correct:3,explanation:"Condition for maximum torque: rotor resistance R2 equals rotor reactance X2.",table:'',diagram:''},
  {category:'electrical',type:'electrical',difficulty:5,passage:'',question:"Back EMF in a DC motor is proportional to:",options:["Flux only","Speed only","Flux × speed","Armature current"],correct:2,explanation:"Eb = kΦω — back EMF is proportional to the product of flux and angular speed.",table:'',diagram:''},
  {category:'electrical',type:'electrical',difficulty:5,passage:'',question:"A synchronous motor operates at:",options:["Below synchronous speed","Above synchronous speed","Exactly synchronous speed","Variable speed"],correct:2,explanation:"Speed is locked to supply frequency — synchronous motors cannot operate at any other speed.",table:'',diagram:''},
  {category:'electrical',type:'electrical',difficulty:5,passage:'',question:"In an induction motor, the slip at maximum torque is proportional to:",options:["Rotor resistance","Stator voltage","Supply frequency","Power factor"],correct:0,explanation:"Slip at maximum torque is directly proportional to rotor resistance.",table:'',diagram:''},
  {category:'electrical',type:'electrical',difficulty:5,passage:'',question:"Starting torque of a single-phase induction motor is zero because:",options:["No back EMF","Single-phase supply produces no rotating field","High resistance","Low frequency"],correct:1,explanation:"Single-phase supply creates a pulsating field, not a rotating field, so starting torque is zero.",table:'',diagram:''},
  {category:'electrical',type:'electrical',difficulty:5,passage:'',question:"In a synchronous motor, increasing load causes:",options:["Speed decrease","Increase in torque angle","Loss of synchronism immediately","Frequency change"],correct:1,explanation:"Increased load increases the torque angle (load angle δ) while speed remains synchronous.",table:'',diagram:''},
  // Transformers
  {category:'electrical',type:'electrical',difficulty:5,passage:'',question:"In a transformer, core losses depend mainly on:",options:["Load current","Voltage and frequency","Resistance","Temperature only"],correct:1,explanation:"Core losses (hysteresis + eddy current) depend on applied voltage and supply frequency.",table:'',diagram:''},
  {category:'electrical',type:'electrical',difficulty:5,passage:'',question:"Transformer regulation is maximum when power factor is:",options:["Unity","Leading","Lagging","Zero"],correct:2,explanation:"Voltage drop is highest at lagging power factor due to leakage reactance effects.",table:'',diagram:''},
  {category:'electrical',type:'electrical',difficulty:5,passage:'',question:"All-day efficiency of a transformer is important for:",options:["Power transformers","Distribution transformers","Instrument transformers","High-frequency transformers"],correct:1,explanation:"Distribution transformers operate under varying load throughout the entire day.",table:'',diagram:''},
  {category:'electrical',type:'electrical',difficulty:5,passage:'',question:"Hysteresis loss in a transformer depends on:",options:["Voltage only","Frequency and flux density","Current","Load current"],correct:1,explanation:"Hysteresis loss is a function of frequency and maximum flux density (Steinmetz equation).",table:'',diagram:''},
  // Power Systems
  {category:'electrical',type:'electrical',difficulty:5,passage:'',question:"Ferranti effect occurs in:",options:["Short lines","Medium lines","Long transmission lines","DC lines"],correct:2,explanation:"Ferranti effect is prominent in long AC transmission lines due to high line capacitance causing receiving-end voltage to exceed sending-end voltage.",table:'',diagram:''},
  {category:'electrical',type:'electrical',difficulty:5,passage:'',question:"Per-unit system simplifies calculations by:",options:["Eliminating units","Normalizing values to base quantities","Reducing voltage","Increasing current"],correct:1,explanation:"All quantities are expressed as fractions of base values, simplifying multi-voltage-level systems.",table:'',diagram:''},
  {category:'electrical',type:'electrical',difficulty:5,passage:'',question:"Load flow analysis is used to determine:",options:["Fault currents","Voltage profile and power flows","Transient stability","Insulation failure"],correct:1,explanation:"Load flow (power flow) analysis gives bus voltages, angles, active and reactive power flows.",table:'',diagram:''},
  {category:'electrical',type:'electrical',difficulty:5,passage:'',question:"Corona loss depends strongly on:",options:["Voltage only","Frequency only","Conductor diameter only","Voltage, frequency, and conductor size"],correct:3,explanation:"Corona depends on voltage level, supply frequency, conductor diameter, and atmospheric conditions.",table:'',diagram:''},
  {category:'electrical',type:'electrical',difficulty:5,passage:'',question:"Skin effect causes:",options:["Uniform current distribution","Higher resistance at DC","Current concentration near conductor surface","Lower resistance at high frequency"],correct:2,explanation:"At high frequency, AC current flows near the conductor surface, effectively reducing the conducting cross-section.",table:'',diagram:''},
  {category:'electrical',type:'electrical',difficulty:5,passage:'',question:"The most economical voltage level for transmission depends mainly on:",options:["Current only","Distance and power level","Resistance","Frequency"],correct:1,explanation:"Higher voltage is chosen based on distance and power to minimise I²R losses.",table:'',diagram:''},
  {category:'electrical',type:'electrical',difficulty:5,passage:'',question:"Load factor is defined as:",options:["Max load / average load","Average load / peak load","Peak load / average load","Energy / max demand"],correct:1,explanation:"Load factor = average load divided by peak (maximum) load, expressing utilisation efficiency.",table:'',diagram:''},
  {category:'electrical',type:'electrical',difficulty:5,passage:'',question:"Power factor improvement reduces:",options:["Voltage","Current drawn for same power","Frequency","Resistance"],correct:1,explanation:"For the same real power output, a higher power factor means less current is drawn.",table:'',diagram:''},
  // Power Electronics
  {category:'electrical',type:'electrical',difficulty:5,passage:'',question:"A fully controlled rectifier uses:",options:["Diodes only","SCRs only","Transistors","Capacitors"],correct:1,explanation:"Fully controlled rectifiers use Silicon Controlled Rectifiers (SCRs) for phase-controlled output.",table:'',diagram:''},
  {category:'electrical',type:'electrical',difficulty:5,passage:'',question:"Firing angle in an SCR circuit controls:",options:["Output voltage","Frequency","Resistance","Inductance"],correct:0,explanation:"Adjusting the firing angle (trigger delay) controls the average DC output voltage.",table:'',diagram:''},
  {category:'electrical',type:'electrical',difficulty:5,passage:'',question:"In a chopper circuit, duty cycle controls:",options:["Frequency","Output voltage","Current ripple only","Switching loss only"],correct:1,explanation:"Average output voltage = Vin × duty cycle (D).",table:'',diagram:''},
  {category:'electrical',type:'electrical',difficulty:5,passage:'',question:"A boost converter is used to:",options:["Step down voltage","Step up DC voltage","Convert AC to DC","Invert polarity"],correct:1,explanation:"A boost (step-up) converter increases DC output voltage above the input voltage.",table:'',diagram:''},
  {category:'electrical',type:'electrical',difficulty:5,passage:'',question:"In a MOSFET, conduction is controlled by:",options:["Gate current","Gate-source voltage","Drain resistance","Supply frequency"],correct:1,explanation:"MOSFETs are voltage-controlled devices — gate-source voltage controls the channel conductivity.",table:'',diagram:''},
  {category:'electrical',type:'electrical',difficulty:5,passage:'',question:"In PWM control, output voltage is controlled by:",options:["Frequency only","Duty cycle","Inductance","Resistance"],correct:1,explanation:"Average output voltage in PWM is proportional to the duty cycle.",table:'',diagram:''},
  // Protection, Relays & Circuit Breakers
  {category:'electrical',type:'electrical',difficulty:5,passage:'',question:"A Buchholz relay is used in:",options:["Circuit breakers","Overhead lines","Oil-immersed transformers","Generators"],correct:2,explanation:"It detects internal faults (gas accumulation or oil surge) in oil-immersed transformers.",table:'',diagram:''},
  {category:'electrical',type:'electrical',difficulty:5,passage:'',question:"Differential protection operates based on:",options:["Voltage difference","Current difference between input and output","Power difference","Frequency difference"],correct:1,explanation:"It trips when the difference between measured input and output currents exceeds the set threshold.",table:'',diagram:''},
  {category:'electrical',type:'electrical',difficulty:5,passage:'',question:"Arc extinction in circuit breakers is primarily achieved by:",options:["Increasing voltage","Cooling and deionization of the arc medium","Increasing current","Reducing resistance"],correct:1,explanation:"Arc is extinguished by cooling it and deionizing the medium between contacts.",table:'',diagram:''},
  {category:'electrical',type:'electrical',difficulty:5,passage:'',question:"An overcurrent relay operates when:",options:["Voltage exceeds limit","Current exceeds preset pickup value","Frequency drops","Power factor changes"],correct:1,explanation:"Overcurrent relays send a trip signal when monitored current exceeds a pre-set pickup value.",table:'',diagram:''},
  {category:'electrical',type:'electrical',difficulty:5,passage:'',question:"Distance relays are primarily used for protection of:",options:["Transformers","Generators","Transmission lines","Capacitors"],correct:2,explanation:"Distance relays measure apparent impedance and are the primary protection for transmission lines.",table:'',diagram:''},
  {category:'electrical',type:'electrical',difficulty:5,passage:'',question:"In a differential relay, tripping occurs when:",options:["Incoming current equals outgoing current","Difference between currents exceeds set threshold","Voltage is low","Frequency is unstable"],correct:1,explanation:"It operates on the imbalance between measured input and output currents exceeding the bias-adjusted threshold.",table:'',diagram:''},
  {category:'electrical',type:'electrical',difficulty:5,passage:'',question:"Inverse time relays operate such that:",options:["Trip time increases with fault current","Trip time decreases with fault current","Trip time is constant","Trip depends on voltage only"],correct:1,explanation:"Higher fault current produces faster tripping — the relay is inversely time-proportional to current.",table:'',diagram:''},
  {category:'electrical',type:'electrical',difficulty:5,passage:'',question:"The primary function of a circuit breaker is to:",options:["Increase voltage","Store energy","Interrupt fault current safely","Regulate frequency"],correct:2,explanation:"Circuit breakers safely isolate faulted sections by interrupting fault currents.",table:'',diagram:''},
  {category:'electrical',type:'electrical',difficulty:5,passage:'',question:"SF6 circuit breakers are preferred because:",options:["Low cost","Excellent arc quenching and high dielectric strength","Low dielectric strength","Slow operation"],correct:1,explanation:"SF6 gas has very high dielectric strength and superior arc quenching properties.",table:'',diagram:''},
  {category:'electrical',type:'electrical',difficulty:5,passage:'',question:"The main purpose of arc extinction in a breaker is to:",options:["Increase current","Maintain load continuity","Prevent restriking of the arc","Increase voltage"],correct:2,explanation:"Arc extinction must prevent re-ignition (restriking) after current interruption to ensure permanent isolation.",table:'',diagram:''},
  {category:'electrical',type:'electrical',difficulty:5,passage:'',question:"A vacuum circuit breaker is best suited for:",options:["High voltage ultra-long lines","Medium voltage systems","DC transmission only","Low frequency systems"],correct:1,explanation:"VCBs are widely used in medium voltage (11 kV–33 kV) distribution applications.",table:'',diagram:''},
  // Switchgear & Substations
  {category:'electrical',type:'electrical',difficulty:5,passage:'',question:"Switchgear refers to:",options:["Only transformers","Combined protection, control, and switching equipment in power systems","Only circuit breakers","Only relays"],correct:1,explanation:"Switchgear encompasses the full assembly of protective, control, and switching devices.",table:'',diagram:''},
  {category:'electrical',type:'electrical',difficulty:5,passage:'',question:"Busbars in switchgear are used for:",options:["Energy storage","Power distribution within the substation","Voltage transformation","Frequency control"],correct:1,explanation:"Busbars are conductors that distribute incoming power to multiple outgoing feeders.",table:'',diagram:''},
  {category:'electrical',type:'electrical',difficulty:5,passage:'',question:"Isolators are operated:",options:["Under load conditions","Only after the circuit breaker has opened","During fault conditions","Automatically under protection relay command"],correct:1,explanation:"Isolators are no-load isolating devices and must only be operated after the circuit breaker has interrupted current.",table:'',diagram:''},
  {category:'electrical',type:'electrical',difficulty:5,passage:'',question:"A Motor Control Centre (MCC) is used to:",options:["Generate power","Control and protect multiple motors from a central point","Increase motor speed","Convert AC to DC"],correct:1,explanation:"MCCs centralise motor starters, protection devices, and control wiring for multiple motors.",table:'',diagram:''},
  {category:'electrical',type:'electrical',difficulty:5,passage:'',question:"Overload relays in MCCs protect against:",options:["Short circuits only","Overheating due to prolonged excessive current","Voltage spikes","Frequency variation"],correct:1,explanation:"Thermal overload relays prevent motor winding overheating caused by sustained overcurrent.",table:'',diagram:''},
  {category:'electrical',type:'electrical',difficulty:5,passage:'',question:"Soft starters in MCCs are used to:",options:["Increase starting torque abruptly","Reduce inrush current during motor start","Increase voltage permanently","Convert AC to DC"],correct:1,explanation:"Soft starters ramp up voltage gradually to limit inrush current and reduce mechanical stress on start-up.",table:'',diagram:''},
  {category:'electrical',type:'electrical',difficulty:5,passage:'',question:"Instrument transformers are used in substations to:",options:["Increase power output","Step down high voltage/current to safe levels for measurement","Store energy","Improve frequency stability"],correct:1,explanation:"Current Transformers (CTs) and Potential Transformers (PTs) reduce high values for metering and relay inputs.",table:'',diagram:''},
  {category:'electrical',type:'electrical',difficulty:5,passage:'',question:"A current transformer (CT) should never be:",options:["Open-circuited under load","Short-circuited under load","Used in AC systems","Used with protection relays"],correct:0,explanation:"Open-circuiting a loaded CT causes the full primary current to drive the secondary open, producing dangerously high voltages.",table:'',diagram:''},
  {category:'electrical',type:'electrical',difficulty:5,passage:'',question:"Lightning arresters in substations are used to:",options:["Control frequency","Protect equipment from lightning and switching surge voltages","Increase power factor","Regulate load flow"],correct:1,explanation:"They provide a low-impedance path to divert surge energy safely to ground.",table:'',diagram:''},
  {category:'electrical',type:'electrical',difficulty:5,passage:'',question:"Capacitor banks in substations are mainly used for:",options:["Voltage reduction","Reactive power compensation and power factor improvement","Fault detection","Energy storage for DC systems"],correct:1,explanation:"Capacitor banks supply reactive power locally, improving power factor and reducing reactive current on lines.",table:'',diagram:''},
  {category:'electrical',type:'electrical',difficulty:5,passage:'',question:"Busbar protection in substations is typically:",options:["Time-delayed overcurrent protection","A unit (differential) protection scheme","Voltage-based protection only","Manual protection"],correct:1,explanation:"Busbar protection is a high-speed unit protection scheme that compares all currents entering and leaving the busbar zone.",table:'',diagram:''},
  {category:'electrical',type:'electrical',difficulty:5,passage:'',question:"Earth fault protection detects:",options:["Line-to-line faults only","Leakage of current to ground","Overvoltage only","Frequency imbalance"],correct:1,explanation:"Earth fault protection detects current flowing to ground due to insulation failure or conductor contact with earth.",table:'',diagram:''},
  {category:'electrical',type:'electrical',difficulty:5,passage:'',question:"Distance protection zones are used to:",options:["Increase voltage levels","Divide transmission line protection into graded sections","Control reactive power","Regulate transformers"],correct:1,explanation:"Zones 1, 2, and 3 provide time-graded protection covering different proportions of the line and backup for adjacent lines.",table:'',diagram:''},
  {category:'electrical',type:'electrical',difficulty:5,passage:'',question:"The main function of a substation is to:",options:["Generate electricity","Transmit power only","Transform voltage levels and distribute power","Store electrical energy"],correct:2,explanation:"Substations step up voltage for transmission or step down for distribution, and switch/route power between circuits.",table:'',diagram:''},
  {category:'electrical',type:'electrical',difficulty:5,passage:'',question:"A grid substation primarily:",options:["Converts AC to DC","Interconnects multiple transmission lines and networks","Stores energy","Reduces frequency"],correct:1,explanation:"Grid (bulk power) substations interconnect different transmission voltage levels and multiple circuits.",table:'',diagram:''},
  // Electrical Faults
  {category:'electrical',type:'electrical',difficulty:5,passage:'',question:"A 3-phase symmetrical fault is characterized by:",options:["Unequal current in phases","Equal fault current in all three phases","Zero sequence current only","No fault current in one phase"],correct:1,explanation:"In a symmetrical (3-phase) fault, all phases carry equal magnitude fault currents at the same phase displacement.",table:'',diagram:''},
  {category:'electrical',type:'electrical',difficulty:5,passage:'',question:"Which fault produces the highest short-circuit current in a power system?",options:["Single line-to-ground fault","Line-to-line fault","Double line-to-ground fault","3-phase symmetrical fault"],correct:3,explanation:"3-phase faults are symmetrical and produce maximum fault current because the fault impedance is minimum.",table:'',diagram:''},
  {category:'electrical',type:'electrical',difficulty:5,passage:'',question:"Symmetrical faults are mainly analyzed using:",options:["Per-unit system only","Positive sequence networks","Ohm's law only","DC equivalent circuits"],correct:1,explanation:"Symmetrical 3-phase faults only involve the positive sequence network.",table:'',diagram:''},
  {category:'electrical',type:'electrical',difficulty:5,passage:'',question:"Single line-to-ground faults are analyzed using:",options:["Only positive sequence network","Positive, negative, and zero sequence networks in series","Only negative sequence","Only DC analysis"],correct:1,explanation:"SLG faults involve all three sequence networks connected in series at the fault point.",table:'',diagram:''},
  {category:'electrical',type:'electrical',difficulty:5,passage:'',question:"In line-to-line faults, the zero-sequence current is:",options:["Maximum","Zero","Equal to positive sequence","Random"],correct:1,explanation:"LL faults do not involve ground, so no zero-sequence current path exists.",table:'',diagram:''},
  {category:'electrical',type:'electrical',difficulty:5,passage:'',question:"Double line-to-ground faults involve:",options:["Only positive sequence network","All three sequence networks with negative and zero in parallel","Only zero sequence network","No sequence networks"],correct:1,explanation:"DLG faults require the positive sequence in series with the parallel combination of negative and zero sequence networks.",table:'',diagram:''},
  {category:'electrical',type:'electrical',difficulty:5,passage:'',question:"Fault current magnitude is primarily limited by:",options:["Generator speed","System impedance at fault point","Voltage level only","Load power factor"],correct:1,explanation:"Higher total system impedance between source and fault point reduces fault current magnitude.",table:'',diagram:''},
  {category:'electrical',type:'electrical',difficulty:5,passage:'',question:"Subtransient fault current is:",options:["The lowest current level","The initial highest short-circuit current","Steady-state fault current","Zero current at fault instant"],correct:1,explanation:"Subtransient current is the highest level, occurring in the first few cycles immediately after fault inception.",table:'',diagram:''},
  {category:'electrical',type:'electrical',difficulty:5,passage:'',question:"Zero sequence currents flow in:",options:["Balanced 3-phase faults only","Unbalanced faults involving a ground path","All AC loads","DC systems only"],correct:1,explanation:"Zero sequence components only appear when there is a path to ground (earth), i.e., ground-related unbalanced faults.",table:'',diagram:''},
  {category:'electrical',type:'electrical',difficulty:5,passage:'',question:"Negative sequence components represent:",options:["Normal balanced system operation","Unbalanced conditions in the system","Only ground faults","Power factor correction"],correct:1,explanation:"Negative sequence indicates phase imbalance — the reverse rotating component caused by unbalanced conditions.",table:'',diagram:''},
  {category:'electrical',type:'electrical',difficulty:5,passage:'',question:"Distance relays estimate fault location based on:",options:["Current magnitude only","Measured impedance between relay and fault","Voltage frequency","Power factor angle"],correct:1,explanation:"Distance relays calculate impedance from measured V and I to determine how far the fault is from the relay.",table:'',diagram:''},
  {category:'electrical',type:'electrical',difficulty:5,passage:'',question:"Fault resistance increases:",options:["Fault current","System voltage","Total fault impedance","Relay tripping speed"],correct:2,explanation:"Fault resistance adds to the total impedance in the fault loop, reducing fault current.",table:'',diagram:''},
  {category:'electrical',type:'electrical',difficulty:5,passage:'',question:"Arc faults are dangerous because they:",options:["Have zero current","Generate intense heat and energy release","Reduce system voltage to zero instantly","Are always symmetrical"],correct:1,explanation:"Arc faults produce extremely high temperatures and energy, causing severe equipment damage and fire risk.",table:'',diagram:''},
  {category:'electrical',type:'electrical',difficulty:5,passage:'',question:"Restriking in circuit breakers refers to:",options:["Permanent fault clearing","Re-ignition of the arc after current interruption","Voltage stabilization","Load balancing"],correct:1,explanation:"Restriking is the re-establishment of the arc after current has been interrupted, indicating failed breaking.",table:'',diagram:''},
  // Control Systems
  {category:'electrical',type:'electrical',difficulty:5,passage:'',question:"A system is stable if all poles are located in:",options:["Right half of s-plane","Left half of s-plane","On the imaginary axis","At the origin only"],correct:1,explanation:"Stability requires all poles to have negative real parts — located in the left half of the s-plane.",table:'',diagram:''},
  {category:'electrical',type:'electrical',difficulty:5,passage:'',question:"PID controller stands for:",options:["Proportional Integral Derivative","Power Input Device","Parallel Induction Device","Phase Inversion Detector"],correct:0,explanation:"PID = Proportional + Integral + Derivative — the three control actions combined.",table:'',diagram:''},
  // Generation
  {category:'electrical',type:'electrical',difficulty:5,passage:'',question:"The efficiency of a thermal power plant is mainly limited by:",options:["Generator losses","Carnot cycle efficiency","Transformer losses","Transmission losses"],correct:1,explanation:"The Carnot cycle sets the theoretical maximum thermodynamic efficiency for any heat engine.",table:'',diagram:''},
  {category:'electrical',type:'electrical',difficulty:5,passage:'',question:"Hydro power plants convert energy from:",options:["Thermal energy","Potential energy of stored water","Nuclear energy","Wind energy"],correct:1,explanation:"Water head (potential energy) converts to kinetic energy driving turbines to produce electricity.",table:'',diagram:''},
];

// ── Helper functions ──────────────────────────────────────────────────────────
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
  difficulty: 1|2|3|4|5,
  partial: ReturnType<QuestionTemplate['generate']>,
  id: string
): Question {
  return { id, category, type: category as Question['type'], difficulty, weight: 1.0, timesAsked: 0, timesCorrect: 0, table: '', diagram: '', passage: '', ...partial } as Question;
}

/** Assigns stable IDs to static question arrays. */
function hydrateStatic<T extends Omit<Question, 'id'|'weight'|'timesAsked'|'timesCorrect'>>(
  items: T[], prefix: string
): Question[] {
  return items.map((q, i) => ({
    ...q,
    id: `static-${prefix}-${i}`,
    weight: 1.0,
    timesAsked: 0,
    timesCorrect: 0,
  })) as unknown as Question[];
}

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
    this.add({ id:'log_geo', category:'logical', difficulty:3, parameters:{ start:{min:2,max:5}, ratio:{min:2,max:4} }, generate:({start,ratio})=>{ const [n1,n2,n3,n4]=[start,start*ratio,start*ratio*ratio,start*ratio*ratio*ratio]; return { question:`Complete the sequence: ${n1}, ${n2}, ${n3}, ?`, options:[n4.toString(),(n4*ratio).toString(),(n4/ratio).toString(),(n4+ratio).toString()], correct:0, explanation:`Multiply by ${ratio} each time: ${n1} → ${n2} → ${n3} → ${n4}`, passage:'' }; } });
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

// ── Static bank registry ──────────────────────────────────────────────────────
// These questions are merged into QUESTION_BANK at runtime if not already present.
export const INTEGRATED_STATIC_BANK: Record<string, Question[]> = {
  verbal:     hydrateStatic(STATIC_VERBAL,     'verbal'),
  watson:     hydrateStatic(STATIC_WATSON,     'watson'),
  numerical:  hydrateStatic(STATIC_NUMERICAL,  'numerical'),
  electrical: hydrateStatic(STATIC_ELECTRICAL, 'electrical'),
};

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
  submit(q: Omit<Question, 'id'|'timesAsked'|'timesCorrect'|'weight'>, userId: string): string {
    const id = `pending-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    this.pending.push({ ...q, id, weight: 1, timesAsked: 0, timesCorrect: 0, submittedBy: userId, submittedAt: Date.now(), votes: 1, flags: [], status: 'pending' });
    this.save(); return id;
  }
  vote(id: string, up: boolean) { const q = this.pending.find(p => p.id === id); if (q) { q.votes += up ? 1 : -1; this.save(); } }
  flag(id: string, userId: string, reason: string) { const q = this.pending.find(p => p.id === id); if (q) { q.flags.push({ userId, reason, timestamp: Date.now() }); this.save(); } }
  approve(id: string, reviewerId: string): Question | null {
    const idx = this.pending.findIndex(p => p.id === id);
    if (idx === -1) return null;
    const p = this.pending[idx];
    if (p.votes < 5 || p.flags.length > 0) return null;
    p.status = 'approved'; p.reviewedBy = reviewerId; p.reviewedAt = Date.now();
    const approved: Question = { ...p, id: `crowd-${Date.now()}-${p.id}`, timesAsked: 0, timesCorrect: 0 };
    this.pending.splice(idx, 1); this.save(); return approved;
  }
  getPending(): PendingQuestion[] { return [...this.pending]; }
  getStats() { const pending = this.pending.filter(p => p.status === 'pending').length; const totalVotes = this.pending.reduce((s, q) => s + q.votes, 0); return { pending, totalVotes, avgVotes: this.pending.length ? totalVotes / this.pending.length : 0 }; }
}

// ── Self-Generating Bank ──────────────────────────────────────────────────────
export class SelfGeneratingBank {
  private templates = new TemplateEngine();
  private evolution = new EvolutionEngine();
  private crowd = new CrowdBank();
  private stats: PerformanceStats = {};
  private readonly STATS_KEY = 'question_performance';

  constructor() { this.loadStats(); }

  private loadStats() { const s = safeGetItem(this.STATS_KEY); if (s) { try { this.stats = JSON.parse(s); } catch { this.stats = {}; } } }
  private saveStats() { safeSetItem(this.STATS_KEY, JSON.stringify(this.stats)); }

  /** Returns the full question pool for a category: static bank + INTEGRATED_STATIC_BANK. */
  private getAllStatic(category: string): Question[] {
    const fromBase = QUESTION_BANK[category] ?? [];
    const integrated = INTEGRATED_STATIC_BANK[category] ?? [];
    // Merge, deduplicating by id
    const seen = new Set(fromBase.map(q => q.id));
    return [...fromBase, ...integrated.filter(q => !seen.has(q.id))];
  }

  recordAnswer(questionId: string, correct: boolean, category: string, responseMs?: number): void {
    if (!this.stats[questionId]) {
      this.stats[questionId] = { timesAsked: 0, timesCorrect: 0, lastSeen: Date.now(), difficultyRating: 3, category };
    }
    const s = this.stats[questionId];
    s.timesAsked++; if (correct) s.timesCorrect++; if (responseMs !== undefined) s.avgResponseTime = responseMs; s.lastSeen = Date.now();
    const acc = s.timesCorrect / s.timesAsked;
    if (acc > 0.8) s.difficultyRating = Math.min(5, s.difficultyRating + 0.1);
    if (acc < 0.4) s.difficultyRating = Math.max(1, s.difficultyRating - 0.1);
    this.saveStats();
  }

  getQuestions(category: string, count = 10, excludeIds: string[] = []): Question[] {
    const statsForBank: Record<string, { timesAsked: number; timesCorrect: number }> = {};
    for (const [id, s] of Object.entries(this.stats)) statsForBank[id] = { timesAsked: s.timesAsked, timesCorrect: s.timesCorrect };

    // 60% from the full static bank (includes integrated questions)
    const baseCount = Math.round(count * 0.6);
    const allStatic = this.getAllStatic(category).filter(q => !excludeIds.includes(q.id));

    // Sort by adaptive priority: least seen + weak accuracy first
    const sorted = allStatic.sort((a, b) => {
      const sa = statsForBank[a.id] ?? { timesAsked: 0, timesCorrect: 0 };
      const sb = statsForBank[b.id] ?? { timesAsked: 0, timesCorrect: 0 };
      const accA = sa.timesAsked ? sa.timesCorrect / sa.timesAsked : 0.5;
      const accB = sb.timesAsked ? sb.timesCorrect / sb.timesAsked : 0.5;
      return (sa.timesAsked - sb.timesAsked) + (accA - accB) * 5;
    });
    const base = sorted.slice(0, baseCount);

    // Fallback to buildBlendedTest if available and base is short
    let blendedBase = base;
    try { blendedBase = buildBlendedTest(category, baseCount, excludeIds, statsForBank); } catch { /* not available */ }
    const finalBase = blendedBase.length >= baseCount ? blendedBase : base;

    // 30% generated from templates
    const genCount = Math.round(count * 0.3);
    const generated = this.templates.generateQuestions(category, genCount);

    // Remainder from crowd
    const crowdTarget = count - finalBase.length - generated.length;
    const crowd: Question[] = crowdTarget > 0
      ? (this.crowd.getPending().filter(p => p.status === 'pending' && p.category === category && p.votes >= 3).slice(0, crowdTarget) as Question[])
      : [];

    const merged = [...finalBase, ...generated, ...crowd];
    for (let i = merged.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [merged[i], merged[j]] = [merged[j], merged[i]]; }
    return merged.slice(0, count);
  }

  evolveAndImprove(): EvolvedQuestion[] {
    const evolved: EvolvedQuestion[] = [];
    for (const [id, stats] of Object.entries(this.stats)) {
      const all = this.getAllStatic(stats.category);
      const original = all.find(q => q.id === id);
      if (!original) continue;
      const e = this.evolution.evolve(original, stats);
      if (e) evolved.push(e);
    }
    return evolved;
  }

  submitQuestion(q: Omit<Question, 'id'|'timesAsked'|'timesCorrect'|'weight'>, userId: string): string { return this.crowd.submit(q, userId); }
  voteQuestion(questionId: string, upvote: boolean): void { this.crowd.vote(questionId, upvote); }
  flagQuestion(questionId: string, userId: string, reason: string): void { this.crowd.flag(questionId, userId, reason); }
  approvePending(questionId: string, reviewerId: string): Question | null { return this.crowd.approve(questionId, reviewerId); }
  getCrowdStats() { return this.crowd.getStats(); }
  getPerformanceStats(): PerformanceStats { return { ...this.stats }; }

  getCategoryInsights(category: string) {
    const questions = this.getAllStatic(category);
    let totalCorrect = 0, totalAttempts = 0;
    const perf: { id: string; accuracy: number }[] = [];
    for (const q of questions) {
      const s = this.stats[q.id];
      if (s && s.timesAsked > 0) {
        const acc = s.timesCorrect / s.timesAsked;
        totalCorrect += s.timesCorrect; totalAttempts += s.timesAsked;
        perf.push({ id: q.id, accuracy: acc });
      }
    }
    perf.sort((a, b) => a.accuracy - b.accuracy);
    return { accuracy: totalAttempts > 0 ? totalCorrect / totalAttempts : 0, totalAttempts, weakTopics: perf.slice(0, 3).map(p => p.id), strongTopics: perf.slice(-3).map(p => p.id) };
  }

  /** Summary of all integrated static questions by category. */
  getBankSummary(): Record<string, number> {
    const summary: Record<string, number> = {};
    for (const [cat, qs] of Object.entries(INTEGRATED_STATIC_BANK)) summary[cat] = qs.length;
    return summary;
  }

  get templateCount() { return this.templates.count; }
}

export function createSelfGeneratingBank(): SelfGeneratingBank {
  return new SelfGeneratingBank();
}
