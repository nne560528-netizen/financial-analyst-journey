import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  LayoutDashboard,
  CheckSquare,
  BookOpen,
  Map,
  FolderKanban,
  Languages,
  Award,
  TrendingUp,
  Clock,
  Target,
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  Edit3,
  Search,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  FileText,
  Upload,
  LogIn,
  LogOut,
  User,
  Cloud,
  CloudOff,
  Database,
  AlertTriangle,
  X,
  Check,
  Sparkles,
  Briefcase,
  BarChart3,
  Sliders,
  RefreshCw,
  Menu,
  GraduationCap,
  Link as LinkIcon,
  Bookmark,
  Volume2,
  ShieldCheck,
  Info
} from 'lucide-react';

// Firebase SDK Imports
import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  signInAnonymously,
  signInWithCustomToken,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  onSnapshot
} from 'firebase/firestore';

// ============================================================================
// 1. FIREBASE INITIALIZATION & STORAGE CONSTANTS
// ============================================================================
let firebaseApp = null;
let auth = null;
let db = null;
const appId = typeof __app_id !== 'undefined' ? __app_id : 'financial-analyst-journey';

try {
  if (typeof __firebase_config !== 'undefined' && __firebase_config) {
    const firebaseConfig = JSON.parse(__firebase_config);
    firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    auth = getAuth(firebaseApp);
    db = getFirestore(firebaseApp);
  }
} catch (err) {
  console.warn('Firebase configuration unavailable, running in local/offline mode:', err);
}

// Utility to get today's local YYYY-MM-DD date string
const getTodayStr = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getOffsetDateStr = (offsetDays) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// ============================================================================
// 2. REALISTIC INITIAL SAMPLE DATA FOR FIRST-YEAR FINANCIAL ANALYSIS STUDENT
// ============================================================================
const CATEGORIES = [
  'Excel',
  'Accounting',
  'Financial Analysis',
  'Corporate Finance',
  'Power BI',
  'SQL',
  'English / IELTS',
  'University Study'
];

const PROFICIENCY_LEVELS = [
  'Beginner',
  'Elementary',
  'Intermediate',
  'Upper-Intermediate',
  'Advanced'
];

const createDefaultTasksForDate = (dateStr) => [
  {
    id: `task-${dateStr}-1`,
    title: 'Study Excel for 30 minutes',
    category: 'Excel',
    priority: 'High',
    date: dateStr,
    completed: true,
    durationMins: 30
  },
  {
    id: `task-${dateStr}-2`,
    title: 'Learn Accounting or Financial Analysis for 30 minutes',
    category: 'Financial Analysis',
    priority: 'High',
    date: dateStr,
    completed: true,
    durationMins: 30
  },
  {
    id: `task-${dateStr}-3`,
    title: 'Practice IELTS for 30 minutes',
    category: 'English / IELTS',
    priority: 'Medium',
    date: dateStr,
    completed: false,
    durationMins: 30
  },
  {
    id: `task-${dateStr}-4`,
    title: 'Learn 5–10 finance vocabulary words',
    category: 'English / IELTS',
    priority: 'Medium',
    date: dateStr,
    completed: true,
    durationMins: 20
  },
  {
    id: `task-${dateStr}-5`,
    title: 'Review previous lessons',
    category: 'University Study',
    priority: 'Medium',
    date: dateStr,
    completed: false,
    durationMins: 25
  },
  {
    id: `task-${dateStr}-6`,
    title: 'Practice a financial exercise',
    category: 'Corporate Finance',
    priority: 'High',
    date: dateStr,
    completed: false,
    durationMins: 40
  },
  {
    id: `task-${dateStr}-7`,
    title: "Write down tomorrow's goals",
    category: 'University Study',
    priority: 'Low',
    date: dateStr,
    completed: false,
    durationMins: 10
  }
];

const INITIAL_SKILLS = [
  {
    id: 'skill-excel',
    name: 'Microsoft Excel',
    level: 'Intermediate',
    goal: 'Master XLOOKUP, SUMIFS, Pivot Tables, Power Query & dynamic financial modeling shortcuts.',
    completedLessons: 14,
    totalLessons: 20,
    notes: 'Completed dynamic array formulas and conditional formatting. Practicing index-match and sensitivity tables next.',
    resources: [
      { title: 'Corporate Finance Institute – Excel Crash Course', url: 'https://corporatefinanceinstitute.com' },
      { title: 'ExcelJet Function Guide', url: 'https://exceljet.net' }
    ]
  },
  {
    id: 'skill-accounting',
    name: 'Accounting Fundamentals',
    level: 'Intermediate',
    goal: 'Understand the 3 core financial statements, accrual vs. cash accounting, and GAAP/IFRS basics.',
    completedLessons: 11,
    totalLessons: 16,
    notes: 'Solid grasp of double-entry bookkeeping and how depreciation links Income Statement, Balance Sheet, and Cash Flow.',
    resources: [
      { title: 'AccountingCoach – Financial Statements', url: 'https://www.accountingcoach.com' }
    ]
  },
  {
    id: 'skill-fsa',
    name: 'Financial Statement Analysis',
    level: 'Elementary',
    goal: 'Perform horizontal/vertical analysis and compute liquidity, profitability, and solvency ratios.',
    completedLessons: 7,
    totalLessons: 15,
    notes: 'Practiced DuPont ROE decomposition on listed retail companies.',
    resources: [
      { title: 'Investopedia – Financial Ratio Analysis', url: 'https://www.investopedia.com' }
    ]
  },
  {
    id: 'skill-corpfin',
    name: 'Corporate Finance',
    level: 'Elementary',
    goal: 'Master Time Value of Money (TVM), NPV, IRR, WACC, and capital budgeting decision rules.',
    completedLessons: 5,
    totalLessons: 14,
    notes: 'Working through WACC cost of equity (CAPM) and after-tax cost of debt problems.',
    resources: [
      { title: 'Aswath Damodaran – Corporate Finance Lectures', url: 'https://pages.stern.nyu.edu/~adamodar/' }
    ]
  },
  {
    id: 'skill-modeling',
    name: 'Financial Modeling',
    level: 'Beginner',
    goal: 'Build a clean 3-statement forecast model with revenue drivers and scenario switches.',
    completedLessons: 3,
    totalLessons: 15,
    notes: 'Learned model formatting standards (blue font for hardcoded inputs, black for formulas).',
    resources: [
      { title: 'Wall Street Prep – Modeling Best Practices', url: 'https://www.wallstreetprep.com' }
    ]
  },
  {
    id: 'skill-powerbi',
    name: 'Power BI',
    level: 'Beginner',
    goal: 'Import financial datasets, transform via Power Query, write core DAX measures, and build executive P&L dashboards.',
    completedLessons: 4,
    totalLessons: 14,
    notes: 'Installed Power BI Desktop and built first star-schema data model.',
    resources: [
      { title: 'Microsoft Learn – Power BI Data Analyst', url: 'https://learn.microsoft.com' }
    ]
  },
  {
    id: 'skill-sql',
    name: 'SQL',
    level: 'Beginner',
    goal: 'Write SELECT, WHERE, GROUP BY, HAVING, and JOIN queries to extract financial & sales records.',
    completedLessons: 3,
    totalLessons: 12,
    notes: 'Practicing INNER JOIN and LEFT JOIN across customer & invoice tables.',
    resources: [
      { title: 'SQLBolt – Interactive SQL Lessons', url: 'https://sqlbolt.com' }
    ]
  },
  {
    id: 'skill-fineng',
    name: 'Financial English',
    level: 'Intermediate',
    goal: 'Read annual reports (10-K) fluently and articulate variance analysis in professional English.',
    completedLessons: 10,
    totalLessons: 16,
    notes: 'Reading quarterly earnings releases and summarizing MD&A sections weekly.',
    resources: [
      { title: 'Financial Times – Markets & Companies', url: 'https://www.ft.com' }
    ]
  },
  {
    id: 'skill-ielts',
    name: 'IELTS',
    level: 'Intermediate',
    goal: 'Achieve an overall IELTS Band 7.0+ before Year 2 internship applications.',
    completedLessons: 12,
    totalLessons: 20,
    notes: 'Currently averaging 6.0–6.5 in Reading & Listening; focusing on Academic Writing Task 1 chart descriptions.',
    resources: [
      { title: 'IELTS Liz – Academic Tips & Practice', url: 'https://ieltsliz.com' }
    ]
  }
];

const INITIAL_ROADMAP = [
  {
    month: 1,
    title: 'Excel Fundamentals',
    objectives: 'Build speed and accuracy in core spreadsheet formulas, lookups, and clean financial formatting.',
    tasks: [
      { id: 'm1-1', text: 'SUM, AVERAGE, IF', completed: true },
      { id: 'm1-2', text: 'SUMIF, SUMIFS', completed: true },
      { id: 'm1-3', text: 'XLOOKUP, VLOOKUP', completed: true },
      { id: 'm1-4', text: 'Basic Excel formatting', completed: true }
    ],
    notes: 'Completed ahead of schedule! Keyboard shortcuts (Alt + H + O + I, Ctrl + Shift + L) feel natural now.',
    resources: ['CFI Excel Crash Course', 'ExcelJet Shortcuts Cheat Sheet']
  },
  {
    month: 2,
    title: 'Advanced Excel',
    objectives: 'Automate data aggregation, dynamic variance highlighting, and ETL cleanup workflows.',
    tasks: [
      { id: 'm2-1', text: 'Pivot Tables', completed: true },
      { id: 'm2-2', text: 'Conditional Formatting', completed: true },
      { id: 'm2-3', text: 'Power Query', completed: false },
      { id: 'm2-4', text: 'Financial data analysis exercises', completed: false }
    ],
    notes: 'Working on Power Query unpivoting monthly budget columns into tabular format.',
    resources: ['Leila Gharani Power Query Tutorials']
  },
  {
    month: 3,
    title: 'Accounting Fundamentals',
    objectives: 'Master the structure of the three core financial statements and how transactions flow between them.',
    tasks: [
      { id: 'm3-1', text: 'Income Statement', completed: true },
      { id: 'm3-2', text: 'Balance Sheet', completed: true },
      { id: 'm3-3', text: 'Cash Flow Statement', completed: false },
      { id: 'm3-4', text: 'Relationships between financial statements', completed: false }
    ],
    notes: 'Reviewed Operating vs. Investing vs. Financing cash flows using indirect method.',
    resources: ['University Financial Accounting Textbook', 'AccountingCoach']
  },
  {
    month: 4,
    title: 'Financial Statement Analysis',
    objectives: 'Evaluate company profitability, efficiency, liquidity, and leverage using industry-standard ratios.',
    tasks: [
      { id: 'm4-1', text: 'Horizontal Analysis', completed: false },
      { id: 'm4-2', text: 'Vertical Analysis', completed: false },
      { id: 'm4-3', text: 'Financial Ratios', completed: false },
      { id: 'm4-4', text: 'ROA, ROE, ROS, Current Ratio, Debt-to-Equity', completed: false }
    ],
    notes: 'Plan to compare two listed consumer goods companies for ratio benchmarking.',
    resources: ['Investopedia Ratio Guide']
  },
  {
    month: 5,
    title: 'Corporate Finance',
    objectives: 'Understand capital allocation, discounting cash flows, and corporate cost of capital.',
    tasks: [
      { id: 'm5-1', text: 'Time Value of Money', completed: false },
      { id: 'm5-2', text: 'NPV', completed: false },
      { id: 'm5-3', text: 'IRR', completed: false },
      { id: 'm5-4', text: 'WACC', completed: false },
      { id: 'm5-5', text: 'Capital Budgeting', completed: false }
    ],
    notes: '',
    resources: ['Damodaran Corporate Finance Notes']
  },
  {
    month: 6,
    title: 'Project 1 – Financial Statement Analysis',
    objectives: 'Deliver a portfolio-ready 3-year historical financial statement analysis and executive PDF summary.',
    tasks: [
      { id: 'm6-1', text: "Analyze a listed company's financial statements over three years", completed: false },
      { id: 'm6-2', text: 'Create an Excel workbook', completed: false },
      { id: 'm6-3', text: 'Write a short financial analysis report', completed: false }
    ],
    notes: 'Target company candidate: Vinamilk (VNM) or FPT Corporation (FPT).',
    resources: ['Annual Report PDF & HoSE Filings']
  },
  {
    month: 7,
    title: 'Power BI Fundamentals',
    objectives: 'Build interactive business intelligence data models and DAX KPIs for finance teams.',
    tasks: [
      { id: 'm7-1', text: 'Data Import', completed: false },
      { id: 'm7-2', text: 'Power Query', completed: false },
      { id: 'm7-3', text: 'Data Cleaning', completed: false },
      { id: 'm7-4', text: 'Data Modeling', completed: false },
      { id: 'm7-5', text: 'DAX Fundamentals', completed: false }
    ],
    notes: '',
    resources: ['Microsoft Learn Power BI Path']
  },
  {
    month: 8,
    title: 'Project 2 – Financial Dashboard',
    objectives: 'Design an interactive executive P&L and margin variance dashboard in Power BI.',
    tasks: [
      { id: 'm8-1', text: 'Build a financial dashboard', completed: false },
      { id: 'm8-2', text: 'Display revenue, expenses, profit, and profit margins', completed: false },
      { id: 'm8-3', text: 'Visualize financial performance', completed: false }
    ],
    notes: '',
    resources: ['Power BI Financial Dashboard Templates']
  },
  {
    month: 9,
    title: 'SQL and Financial English',
    objectives: 'Query relational financial databases and read English financial reports with confidence.',
    tasks: [
      { id: 'm9-1', text: 'SELECT, WHERE, GROUP BY, ORDER BY, JOIN', completed: false },
      { id: 'm9-2', text: 'Learn financial terminology', completed: false },
      { id: 'm9-3', text: 'Practice reading financial reports in English', completed: false }
    ],
    notes: '',
    resources: ['SQLBolt', 'Financial Times Lexicon']
  },
  {
    month: 10,
    title: 'Project 3 – Financial Forecasting',
    objectives: 'Construct a dynamic 12-month / 3-year operating budget and forecast model in Excel.',
    tasks: [
      { id: 'm10-1', text: 'Revenue forecasting', completed: false },
      { id: 'm10-2', text: 'Expense forecasting', completed: false },
      { id: 'm10-3', text: 'Budget planning', completed: false },
      { id: 'm10-4', text: 'Build a financial model in Excel', completed: false }
    ],
    notes: '',
    resources: ['CFI FP&A Modeling Guide']
  },
  {
    month: 11,
    title: 'Internship Preparation',
    objectives: 'Package technical skills and completed finance projects into a compelling candidate profile.',
    tasks: [
      { id: 'm11-1', text: 'Create an English CV', completed: false },
      { id: 'm11-2', text: 'Optimize LinkedIn profile', completed: false },
      { id: 'm11-3', text: 'Organize project portfolio', completed: false },
      { id: 'm11-4', text: 'Prepare application documents', completed: false }
    ],
    notes: '',
    resources: ['Harvard OCS Resume Guide']
  },
  {
    month: 12,
    title: 'Internship Application',
    objectives: 'Execute targeted internship applications and master technical & behavioral finance interviews.',
    tasks: [
      { id: 'm12-1', text: 'Practice interview questions', completed: false },
      { id: 'm12-2', text: 'Research companies', completed: false },
      { id: 'm12-3', text: 'Apply for Finance Intern positions', completed: false },
      { id: 'm12-4', text: 'Apply for Financial Analyst Intern positions', completed: false },
      { id: 'm12-5', text: 'Apply for FP&A Intern positions', completed: false }
    ],
    notes: '',
    resources: ['400 Investment Banking & Corporate Finance Questions']
  }
];

const INITIAL_PROJECTS = [
  {
    id: 'proj-1',
    title: 'Project 1: Financial Statement Analysis',
    status: 'In Progress',
    deadline: getOffsetDateStr(45),
    tools: ['Excel', 'Financial Ratios', 'PDF Report'],
    description:
      "Analyze a listed company's financial statements over three consecutive fiscal years. Build a standardized Excel workbook with horizontal/vertical analysis and key ratios (ROA, ROE, ROS, Current Ratio, Debt-to-Equity), then summarize insights in a concise PDF report.",
    notes: 'Collected 3-year audited statements. Cleaning Income Statement line items in Sheet 1.',
    files: [
      { id: 'f-101', name: 'Company_3Yr_Financials_Model.xlsx', type: 'Excel Workbook', size: '420 KB', url: '' }
    ]
  },
  {
    id: 'proj-2',
    title: 'Project 2: Financial Dashboard',
    status: 'Planning',
    deadline: getOffsetDateStr(95),
    tools: ['Power BI', 'DAX', 'Power Query'],
    description:
      'Use Power BI to build an interactive executive financial dashboard visualizing monthly revenue, operating expenses, net profit, and gross/operating profit margins with YoY and Budget variance slicers.',
    notes: 'Will use a multi-region retail dataset with Actual vs. Budget tables.',
    files: []
  },
  {
    id: 'proj-3',
    title: 'Project 3: Financial Forecasting Model',
    status: 'Planning',
    deadline: getOffsetDateStr(150),
    tools: ['Excel', 'FP&A', 'Scenario Analysis'],
    description:
      'Build a dynamic financial planning and forecasting model in Excel featuring driver-based revenue forecasting, fixed vs. variable expense modeling, working capital schedule, and Base/Bull/Bear scenario toggles.',
    notes: 'Reference Month 10 FP&A budgeting structure.',
    files: []
  }
];

const INITIAL_ENGLISH_DATA = {
  currentLevel: 5.5,
  targetLevel: 7.0,
  weeklyGoalHours: 7,
  skills: [
    { id: 'eng-listening', name: 'Listening', current: 6.0, target: 7.5, hours: 18, notes: 'Practicing Cambridge IELTS Section 3 & 4 academic discussions.' },
    { id: 'eng-reading', name: 'Reading', current: 6.0, target: 7.5, hours: 22, notes: 'Improving skimming speed on True/False/Not Given passages.' },
    { id: 'eng-writing', name: 'Writing', current: 5.5, target: 6.5, hours: 14, notes: 'Focusing on Task 1 trend verbs (surge, plateau, dip) which also help in finance reports.' },
    { id: 'eng-speaking', name: 'Speaking', current: 5.5, target: 6.5, hours: 12, notes: 'Recording 2-minute Part 2 cue card answers daily.' },
    { id: 'eng-vocab', name: 'Vocabulary', current: 6.0, target: 7.0, hours: 16, notes: 'Building topic clusters: economics, business, sustainability, technology.' },
    { id: 'eng-finance', name: 'Financial English', current: 6.0, target: 7.5, hours: 20, notes: 'Reading annual report highlights and earnings call transcripts.' }
  ],
  practiceHistory: [
    { id: 'ph-1', date: getOffsetDateStr(-1), module: 'Financial English', scoreOrDuration: '45 mins', notes: 'Analyzed FPT Q3 financial highlights in English and noted 8 new terms.' },
    { id: 'ph-2', date: getOffsetDateStr(-2), module: 'Reading', scoreOrDuration: 'Band 6.5 (28/40)', notes: 'Cambridge 18 Test 2 Reading Passage 1–3 timed practice.' },
    { id: 'ph-3', date: getOffsetDateStr(-4), module: 'Writing', scoreOrDuration: '50 mins', notes: 'Wrote Task 1 line graph comparison on corporate R&D expenditure.' },
    { id: 'ph-4', date: getOffsetDateStr(-6), module: 'Listening', scoreOrDuration: 'Band 6.0 (25/40)', notes: 'Completed full listening mock test; reviewed spelling mistakes.' }
  ],
  vocabulary: [
    {
      id: 'v-1',
      term: 'EBITDA',
      category: 'Financial English',
      definition: 'Earnings Before Interest, Taxes, Depreciation, and Amortization — a proxy for operating cash flow.',
      example: 'The company improved its EBITDA margin from 18% to 21.5% through cost optimization.',
      mastered: true
    },
    {
      id: 'v-2',
      term: 'Working Capital',
      category: 'Financial English',
      definition: 'Current assets minus current liabilities; measures short-term operational liquidity.',
      example: 'Efficient inventory management freed up $2.4M in net working capital.',
      mastered: true
    },
    {
      id: 'v-3',
      term: 'Solvency',
      category: 'Financial English',
      definition: 'The ability of a company to meet its long-term debts and financial obligations.',
      example: 'Analysts evaluate the Debt-to-Equity ratio to assess long-term solvency.',
      mastered: false
    },
    {
      id: 'v-4',
      term: 'Amortization',
      category: 'Financial English',
      definition: 'Gradual write-off of the initial cost of an intangible asset or scheduled loan repayment.',
      example: 'Software patent amortization is recorded as an operating expense on the income statement.',
      mastered: false
    },
    {
      id: 'v-5',
      term: 'Mitigate',
      category: 'General IELTS',
      definition: 'To make something harmful, severe, or risky less damaging.',
      example: 'Hedging currency exposure helps multinational firms mitigate foreign exchange risk.',
      mastered: true
    },
    {
      id: 'v-6',
      term: 'Fluctuate',
      category: 'General IELTS',
      definition: 'To rise and fall irregularly in number or amount.',
      example: 'Raw material prices fluctuated sharply throughout the third quarter.',
      mastered: true
    }
  ]
};

const INITIAL_READINESS = [
  { id: 'r-1', label: 'Excel proficiency', completed: true, category: 'Technical', note: 'Comfortable with SUMIFS, XLOOKUP, Pivot Tables' },
  { id: 'r-2', label: 'Understanding of financial statements', completed: true, category: 'Finance Core', note: 'Can read IS, BS, and CFS and explain linkages' },
  { id: 'r-3', label: 'Basic financial analysis skills', completed: false, category: 'Finance Core', note: 'Practicing ratio & variance commentary' },
  { id: 'r-4', label: 'Power BI knowledge', completed: false, category: 'Technical', note: 'Learning Power Query and DAX basics' },
  { id: 'r-5', label: 'Basic SQL knowledge', completed: false, category: 'Technical', note: 'Mastering SELECT, GROUP BY, JOIN' },
  { id: 'r-6', label: 'English communication', completed: true, category: 'Language', note: 'Studying toward IELTS 7.0 & Financial English fluency' },
  { id: 'r-7', label: 'English CV', completed: false, category: 'Career Prep', note: 'Drafting 1-page finance-focused resume' },
  { id: 'r-8', label: 'LinkedIn profile', completed: false, category: 'Career Prep', note: 'Add headline, coursework, and project links' },
  { id: 'r-9', label: 'Personal finance projects', completed: false, category: 'Portfolio', note: '3 projects planned (FSA, Power BI, Forecasting)' },
  { id: 'r-10', label: 'Interview preparation', completed: false, category: 'Career Prep', note: 'Accounting & behavioral STAR stories' }
];

const SUGGESTED_ROLES = [
  {
    title: 'Financial Analyst Intern',
    focus: 'Financial modeling, variance analysis, KPI reporting, industry benchmarking',
    keySkills: ['Excel', 'Financial Statement Analysis', 'Power BI', 'Financial English'],
    matchWeight: 88
  },
  {
    title: 'Finance Intern',
    focus: 'General corporate finance support, treasury tracking, budgeting assistance, ad-hoc analysis',
    keySkills: ['Excel', 'Accounting Fundamentals', 'Corporate Finance'],
    matchWeight: 92
  },
  {
    title: 'FP&A Intern',
    focus: 'Budgeting & forecasting, Actual vs. Budget variance decks, department cost analysis',
    keySkills: ['Excel', 'Financial Modeling', 'Power BI', 'SQL'],
    matchWeight: 85
  },
  {
    title: 'Corporate Finance Intern',
    focus: 'Capital budgeting (NPV/IRR), valuation support, M&A or strategic investment research',
    keySkills: ['Corporate Finance', 'Financial Statement Analysis', 'Excel'],
    matchWeight: 84
  },
  {
    title: 'Accounting & Finance Intern',
    focus: 'General ledger reconciliation, financial reporting support, audit documentation',
    keySkills: ['Accounting Fundamentals', 'Excel', 'Financial English'],
    matchWeight: 94
  }
];

const INITIAL_WEEKLY_HOURS = [
  { day: 'Mon', hours: 2.0 },
  { day: 'Tue', hours: 2.5 },
  { day: 'Wed', hours: 1.5 },
  { day: 'Thu', hours: 3.0 },
  { day: 'Fri', hours: 2.0 },
  { day: 'Sat', hours: 3.5 },
  { day: 'Sun', hours: 2.5 }
];

const getDefaultAppState = () => {
  const today = getTodayStr();
  const yesterday = getOffsetDateStr(-1);
  return {
    tasks: [
      ...createDefaultTasksForDate(today),
      {
        id: `task-${yesterday}-1`,
        title: 'Complete Balance Sheet equation exercises',
        category: 'Accounting',
        priority: 'High',
        date: yesterday,
        completed: true,
        durationMins: 45
      },
      {
        id: `task-${yesterday}-2`,
        title: 'Practice XLOOKUP with approximate match',
        category: 'Excel',
        priority: 'Medium',
        date: yesterday,
        completed: true,
        durationMins: 30
      }
    ],
    skills: INITIAL_SKILLS,
    roadmap: INITIAL_ROADMAP,
    projects: INITIAL_PROJECTS,
    english: INITIAL_ENGLISH_DATA,
    readiness: INITIAL_READINESS,
    weeklyHours: INITIAL_WEEKLY_HOURS,
    extraStudyHours: 48.5
  };
};

// ============================================================================
// 3. REUSABLE UI COMPONENTS (MODALS, BADGES, PROGRESS BARS, TOASTS)
// ============================================================================

const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel, confirmText = 'Delete' }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-semibold text-[#172B4D]">{title}</h3>
            <p className="text-sm text-slate-600 mt-1 leading-relaxed">{message}</p>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2.5 mt-6">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors shadow-xs"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

const ProgressBar = ({ percentage, height = 'h-2', colorClass = 'bg-[#A3B18A]', trackClass = 'bg-slate-100' }) => {
  const clamped = Math.min(100, Math.max(0, Math.round(percentage || 0)));
  return (
    <div className={`w-full ${trackClass} rounded-full overflow-hidden ${height}`}>
      <div
        className={`${colorClass} ${height} rounded-full transition-all duration-500 ease-out`}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
};

const PriorityBadge = ({ priority }) => {
  const styles = {
    High: 'bg-rose-50 text-rose-700 border-rose-200',
    Medium: 'bg-amber-50 text-amber-700 border-amber-200',
    Low: 'bg-slate-100 text-slate-600 border-slate-200'
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${styles[priority] || styles.Medium}`}>
      {priority}
    </span>
  );
};

const CategoryBadge = ({ category }) => {
  const map = {
    Excel: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Accounting: 'bg-blue-50 text-blue-700 border-blue-200',
    'Financial Analysis': 'bg-indigo-50 text-indigo-700 border-indigo-200',
    'Corporate Finance': 'bg-violet-50 text-violet-700 border-violet-200',
    'Power BI': 'bg-amber-50 text-amber-700 border-amber-200',
    SQL: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    'English / IELTS': 'bg-[#A3B18A]/20 text-[#3A5A40] border-[#A3B18A]/40',
    'University Study': 'bg-slate-100 text-slate-700 border-slate-200'
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border ${map[category] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
      {category}
    </span>
  );
};

// ============================================================================
// 4. MAIN APPLICATION COMPONENT
// ============================================================================
export default function App() {
  // Navigation & UI State
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);

  // Auth & Storage Sync State
  const [user, setUser] = useState(null);
  const [isGuest, setIsGuest] = useState(true);
  const [syncStatus, setSyncStatus] = useState('local'); // 'cloud' | 'local' | 'syncing' | 'error'
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [supabaseConfig, setSupabaseConfig] = useState(() => {
    try {
      const saved = localStorage.getItem('faj_supabase_cfg');
      return saved ? JSON.parse(saved) : { url: '', anonKey: '', connected: false };
    } catch {
      return { url: '', anonKey: '', connected: false };
    }
  });

  // Main Application Data State
  const [appData, setAppData] = useState(() => {
    try {
      const cached = localStorage.getItem('faj_local_data_v1');
      return cached ? JSON.parse(cached) : getDefaultAppState();
    } catch {
      return getDefaultAppState();
    }
  });

  // Confirm Dialog State
  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  const isRemoteUpdateRef = useRef(false);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 3500);
  };

  // --------------------------------------------------------------------------
  // Firebase Authentication Lifecycle (Rule 3: Auth First)
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (!auth) {
      setLoading(false);
      setSyncStatus('local');
      return;
    }

    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else if (!auth.currentUser) {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.warn('Auth initialization fallback to local storage:', err);
        setSyncStatus('local');
        setLoading(false);
      }
    };

    initAuth();

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setIsGuest(currentUser.isAnonymous);
      } else {
        setIsGuest(true);
        setSyncStatus('local');
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // --------------------------------------------------------------------------
  // Firestore Real-time Sync Scoped Strictly to users/{uid}/careerData/main
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (!user || !db) {
      setLoading(false);
      setSyncStatus('local');
      return;
    }

    setSyncStatus('syncing');
    const userDocRef = doc(db, 'artifacts', appId, 'users', user.uid, 'careerData', 'main');

    const unsubscribe = onSnapshot(
      userDocRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const remoteData = snapshot.data();
          if (remoteData && remoteData.payload) {
            isRemoteUpdateRef.current = true;
            setAppData((prev) => ({
              ...getDefaultAppState(),
              ...prev,
              ...remoteData.payload
            }));
          }
        } else {
          // Seed initial profile data to Firestore for new user
          setDoc(userDocRef, {
            payload: appData,
            updatedAt: new Date().toISOString()
          }).catch((e) => console.warn('Initial seed warning:', e));
        }
        setSyncStatus('cloud');
        setLoading(false);
      },
      (error) => {
        console.warn('Firestore sync error, falling back to browser storage:', error);
        setSyncStatus('local');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // --------------------------------------------------------------------------
  // Persist Changes Automatically (Firestore + LocalStorage Backup)
  // --------------------------------------------------------------------------
  const updateAppData = (updater) => {
    setAppData((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;

      // Always save local fallback copy
      try {
        localStorage.setItem('faj_local_data_v1', JSON.stringify(next));
      } catch (e) {
        console.warn('LocalStorage quota warning:', e);
      }

      // Sync to Firestore if authenticated
      if (user && db) {
        setSyncStatus('syncing');
        const userDocRef = doc(db, 'artifacts', appId, 'users', user.uid, 'careerData', 'main');
        setDoc(userDocRef, {
          payload: next,
          updatedAt: new Date().toISOString()
        })
          .then(() => setSyncStatus('cloud'))
          .catch(() => setSyncStatus('local'));
      }

      return next;
    });
  };

  // --------------------------------------------------------------------------
  // Automatic Real-Time Calculations Across All Modules
  // --------------------------------------------------------------------------
  const metrics = useMemo(() => {
    const todayStr = getTodayStr();
    const todayTasks = appData.tasks.filter((t) => t.date === todayStr);
    const todayCompleted = todayTasks.filter((t) => t.completed).length;
    const todayCompletionPct = todayTasks.length > 0 ? Math.round((todayCompleted / todayTasks.length) * 100) : 0;

    const totalCompletedTasks = appData.tasks.filter((t) => t.completed).length;

    // Skills overall %
    const skillPercentages = appData.skills.map((s) =>
      s.totalLessons > 0 ? Math.min(100, Math.round((s.completedLessons / s.totalLessons) * 100)) : 0
    );
    const avgSkillPct =
      skillPercentages.length > 0
        ? Math.round(skillPercentages.reduce((a, b) => a + b, 0) / skillPercentages.length)
        : 0;

    // Roadmap overall %
    const roadmapMonths = appData.roadmap.map((m) => {
      const total = m.tasks.length;
      const done = m.tasks.filter((t) => t.completed).length;
      const pct = total > 0 ? Math.round((done / total) * 100) : 0;
      const status = pct === 100 ? 'Completed' : pct > 0 ? 'In Progress' : 'Not Started';
      return { ...m, pct, status, doneCount: done, totalCount: total };
    });
    const avgRoadmapPct =
      roadmapMonths.length > 0
        ? Math.round(roadmapMonths.reduce((a, b) => a + b.pct, 0) / roadmapMonths.length)
        : 0;

    // Overall Learning Progress (weighted average of Skills + Roadmap)
    const overallLearningPct = Math.round((avgSkillPct + avgRoadmapPct) / 2);

    // Total Study Hours
    const weeklySum = appData.weeklyHours.reduce((acc, item) => acc + (Number(item.hours) || 0), 0);
    const totalStudyHours = Number((appData.extraStudyHours + weeklySum).toFixed(1));

    // Projects
    const completedProjects = appData.projects.filter((p) => p.status === 'Completed').length;
    const totalProjects = appData.projects.length;

    // Internship Readiness Score %
    const readinessDone = appData.readiness.filter((r) => r.completed).length;
    const readinessTotal = appData.readiness.length;
    const readinessPct = readinessTotal > 0 ? Math.round((readinessDone / readinessTotal) * 100) : 0;

    return {
      todayStr,
      todayTasks,
      todayCompleted,
      todayCompletionPct,
      totalCompletedTasks,
      avgSkillPct,
      roadmapMonths,
      avgRoadmapPct,
      overallLearningPct,
      weeklySum: Number(weeklySum.toFixed(1)),
      totalStudyHours,
      completedProjects,
      totalProjects,
      readinessDone,
      readinessTotal,
      readinessPct
    };
  }, [appData]);

  // Helper to trigger confirmation dialog
  const requestDelete = (title, message, onConfirmAction) => {
    setConfirmState({
      isOpen: true,
      title,
      message,
      onConfirm: () => {
        onConfirmAction();
        setConfirmState((prev) => ({ ...prev, isOpen: false }));
      }
    });
  };

  // Navigation items
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tasks', label: 'Daily Tasks', icon: CheckSquare, badge: `${metrics.todayCompleted}/${metrics.todayTasks.length}` },
    { id: 'skills', label: 'Learning Tracker', icon: BookOpen, badge: `${metrics.avgSkillPct}%` },
    { id: 'roadmap', label: '12-Month Roadmap', icon: Map, badge: `${metrics.avgRoadmapPct}%` },
    { id: 'projects', label: 'Project Portfolio', icon: FolderKanban, badge: `${metrics.completedProjects}/${metrics.totalProjects}` },
    { id: 'english', label: 'IELTS & English', icon: Languages, badge: `${appData.english.currentLevel}` },
    { id: 'readiness', label: 'Internship Readiness', icon: Award, badge: `${metrics.readinessPct}%` }
  ];

  // ==========================================================================
  // RENDER LAYOUT
  // ==========================================================================
  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#172B4D] font-sans antialiased flex flex-col lg:flex-row">
      {/* Inject Google Font Inter */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        body, button, input, select, textarea {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }
        .tabular-nums {
          font-variant-numeric: tabular-nums;
        }
      `}</style>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-20 lg:bottom-6 right-4 lg:right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border bg-white border-slate-200 text-sm font-medium text-[#172B4D] animate-in fade-in slide-in-from-bottom-4">
          {toast.type === 'error' ? (
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-[#588157] shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Global Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmState.isOpen}
        title={confirmState.title}
        message={confirmState.message}
        onConfirm={confirmState.onConfirm}
        onCancel={() => setConfirmState((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* Auth & Storage Settings Modal */}
      <AuthSettingsModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        user={user}
        isGuest={isGuest}
        syncStatus={syncStatus}
        supabaseConfig={supabaseConfig}
        setSupabaseConfig={setSupabaseConfig}
        showToast={showToast}
        onResetDemo={() => {
          updateAppData(getDefaultAppState());
          showToast('Sample student data restored.');
        }}
      />

      {/* ====================================================================
          DESKTOP FIXED LEFT SIDEBAR
      ==================================================================== */}
      <aside className="hidden lg:flex lg:flex-col lg:w-72 lg:fixed lg:inset-y-0 bg-[#172B4D] text-white border-r border-slate-800 z-30">
        {/* Brand Header */}
        <div className="px-6 py-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#A3B18A] text-[#172B4D] flex items-center justify-center font-bold shadow-sm">
              <TrendingUp className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h1 className="font-bold text-base tracking-tight text-white leading-tight">
                Financial Analyst
              </h1>
              <p className="text-xs text-[#A3B18A] font-medium tracking-wide uppercase mt-0.5">
                Journey • Year 1 → 2
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3.5 py-5 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Career Workspace
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? 'bg-[#A3B18A] text-[#172B4D] font-semibold shadow-sm'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${active ? 'text-[#172B4D]' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </span>
                {item.badge && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-md tabular-nums ${
                      active
                        ? 'bg-[#172B4D]/15 text-[#172B4D] font-semibold'
                        : 'bg-white/10 text-slate-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Storage Status & User Account Panel */}
        <div className="p-4 border-t border-white/10 bg-[#11203A] space-y-3">
          {/* Storage / Sync Indicator */}
          <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs">
            <div className="flex items-center gap-2">
              {syncStatus === 'cloud' && !isGuest ? (
                <>
                  <Cloud className="w-3.5 h-3.5 text-[#A3B18A]" />
                  <span className="text-slate-200 font-medium">Cloud Synced</span>
                </>
              ) : supabaseConfig.connected ? (
                <>
                  <Database className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-slate-200 font-medium">Supabase Ready</span>
                </>
              ) : (
                <>
                  <CloudOff className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-slate-300 font-medium">Browser Storage</span>
                </>
              )}
            </div>
            <span className="w-2 h-2 rounded-full bg-[#A3B18A]" />
          </div>

          {/* Profile / Auth Button */}
          <button
            onClick={() => setAuthModalOpen(true)}
            className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-left"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-[#A3B18A]/20 text-[#A3B18A] flex items-center justify-center shrink-0">
                <User className="w-4 h-4" />
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-white truncate">
                  {user && !user.isAnonymous ? user.displayName || user.email : 'Year 1 Student (Guest)'}
                </p>
                <p className="text-[11px] text-slate-400 truncate">
                  {user && !user.isAnonymous ? 'Account & Sync' : 'Sign in to sync across devices'}
                </p>
              </div>
            </div>
            <Sliders className="w-4 h-4 text-slate-400 shrink-0" />
          </button>
        </div>
      </aside>

      {/* ====================================================================
          MOBILE & TABLET TOP HEADER
      ==================================================================== */}
      <header className="lg:hidden sticky top-0 z-30 bg-[#172B4D] text-white px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg hover:bg-white/10 text-white"
            aria-label="Toggle Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#A3B18A] text-[#172B4D] flex items-center justify-center font-bold">
              <TrendingUp className="w-4 h-4 stroke-[2.5]" />
            </div>
            <span className="font-bold text-sm tracking-tight">Financial Analyst Journey</span>
          </div>
        </div>
        <button
          onClick={() => setAuthModalOpen(true)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/10 text-xs font-medium text-slate-200"
        >
          {syncStatus === 'cloud' && !isGuest ? (
            <Cloud className="w-3.5 h-3.5 text-[#A3B18A]" />
          ) : (
            <CloudOff className="w-3.5 h-3.5 text-amber-400" />
          )}
          <span>{user && !user.isAnonymous ? 'Synced' : 'Local'}</span>
        </button>
      </header>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-slate-900/60" onClick={() => setMobileMenuOpen(false)} />
          <div className="relative w-72 max-w-[85vw] bg-[#172B4D] text-white flex flex-col h-full z-50">
            <div className="p-5 border-b border-white/10 flex items-center justify-between">
              <span className="font-bold text-base">Navigation</span>
              <button onClick={() => setMobileMenuOpen(false)} className="p-1.5 rounded-lg hover:bg-white/10">
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium ${
                      active ? 'bg-[#A3B18A] text-[#172B4D] font-semibold' : 'text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </span>
                    {item.badge && <span className="text-xs opacity-80 tabular-nums">{item.badge}</span>}
                  </button>
                );
              })}
            </nav>
            <div className="p-4 border-t border-white/10">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setAuthModalOpen(true);
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-white/10 text-sm font-medium flex items-center justify-center gap-2"
              >
                <User className="w-4 h-4 text-[#A3B18A]" />
                <span>Account & Storage Settings</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          MAIN CONTENT VIEWPORT
      ==================================================================== */}
      <main className="flex-1 lg:pl-72 pb-20 lg:pb-10">
        {/* Local Storage Notice Banner when in Guest/Local Mode */}
        {(isGuest || syncStatus === 'local') && (
          <div className="bg-amber-50/90 border-b border-amber-200/80 px-4 sm:px-8 py-2 text-xs text-amber-900 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Info className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>
                <strong>Local Browser Mode:</strong> Your progress is saved automatically on this browser. Sign in or connect Supabase to sync across devices.
              </span>
            </div>
            <button
              onClick={() => setAuthModalOpen(true)}
              className="text-amber-950 font-semibold underline hover:text-amber-700"
            >
              Configure Sync / Account
            </button>
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 text-slate-500">
              <RefreshCw className="w-8 h-8 animate-spin text-[#172B4D] mb-3" />
              <p className="text-sm font-medium">Loading your Financial Analyst workspace...</p>
            </div>
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <DashboardView
                  appData={appData}
                  metrics={metrics}
                  updateAppData={updateAppData}
                  setActiveTab={setActiveTab}
                  showToast={showToast}
                />
              )}
              {activeTab === 'tasks' && (
                <DailyTasksView
                  appData={appData}
                  metrics={metrics}
                  updateAppData={updateAppData}
                  requestDelete={requestDelete}
                  showToast={showToast}
                />
              )}
              {activeTab === 'skills' && (
                <LearningTrackerView
                  appData={appData}
                  updateAppData={updateAppData}
                  showToast={showToast}
                />
              )}
              {activeTab === 'roadmap' && (
                <RoadmapView
                  metrics={metrics}
                  updateAppData={updateAppData}
                  showToast={showToast}
                />
              )}
              {activeTab === 'projects' && (
                <ProjectPortfolioView
                  appData={appData}
                  updateAppData={updateAppData}
                  requestDelete={requestDelete}
                  showToast={showToast}
                />
              )}
              {activeTab === 'english' && (
                <EnglishTrackerView
                  appData={appData}
                  updateAppData={updateAppData}
                  requestDelete={requestDelete}
                  showToast={showToast}
                />
              )}
              {activeTab === 'readiness' && (
                <InternshipReadinessView
                  appData={appData}
                  metrics={metrics}
                  updateAppData={updateAppData}
                  requestDelete={requestDelete}
                  showToast={showToast}
                />
              )}
            </>
          )}
        </div>
      </main>

      {/* ====================================================================
          MOBILE BOTTOM QUICK NAVIGATION BAR
      ==================================================================== */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-white border-t border-slate-200 z-30 flex items-center justify-around py-1.5 px-1 shadow-lg">
        {navItems.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const active = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] font-medium transition-colors ${
                active ? 'text-[#172B4D] font-semibold' : 'text-slate-500'
              }`}
            >
              <div className={`p-1 rounded-lg mb-0.5 ${active ? 'bg-[#A3B18A]/30 text-[#172B4D]' : ''}`}>
                <Icon className="w-4 h-4" />
              </div>
              <span className="truncate max-w-[60px]">{item.label.split(' ')[0]}</span>
            </button>
          );
        })}
        <button
          onClick={() => setActiveTab(activeTab === 'english' ? 'readiness' : 'english')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] font-medium ${
            activeTab === 'english' || activeTab === 'readiness' ? 'text-[#172B4D] font-semibold' : 'text-slate-500'
          }`}
        >
          <div
            className={`p-1 rounded-lg mb-0.5 ${
              activeTab === 'english' || activeTab === 'readiness' ? 'bg-[#A3B18A]/30 text-[#172B4D]' : ''
            }`}
          >
            <Award className="w-4 h-4" />
          </div>
          <span>More</span>
        </button>
      </nav>
    </div>
  );
}

// ============================================================================
// MODULE A: DASHBOARD – OVERVIEW
// ============================================================================
function DashboardView({ appData, metrics, updateAppData, setActiveTab, showToast }) {
  const [quickHoursDay, setQuickHoursDay] = useState('Thu');
  const [quickHoursAdd, setQuickHoursAdd] = useState('0.5');

  const handleToggleTodayTask = (taskId) => {
    updateAppData((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t))
    }));
  };

  const handleLogStudyHours = (e) => {
    e.preventDefault();
    const delta = parseFloat(quickHoursAdd);
    if (isNaN(delta) || delta <= 0) return;
    updateAppData((prev) => ({
      ...prev,
      weeklyHours: prev.weeklyHours.map((item) =>
        item.day === quickHoursDay ? { ...item, hours: Number((item.hours + delta).toFixed(1)) } : item
      )
    }));
    showToast(`Logged +${delta}h study time for ${quickHoursDay}`);
  };

  const maxWeeklyHours = Math.max(4, ...appData.weeklyHours.map((d) => d.hours));

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#172B4D] text-white">
              <Briefcase className="w-3.5 h-3.5 text-[#A3B18A]" />
              Career Goal: Become a Financial Analyst
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#A3B18A]/20 text-[#3A5A40] border border-[#A3B18A]/40">
              <Target className="w-3.5 h-3.5" />
              Target: Ready to apply for an internship in Year 2
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#172B4D] tracking-tight">
            Welcome back!
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Year 1 Financial Analysis Roadmap • Stay consistent today to build your Year 2 internship advantage.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setActiveTab('tasks')}
            className="px-4 py-2.5 rounded-xl bg-[#172B4D] hover:bg-[#1E3A66] text-white text-sm font-medium transition-colors shadow-xs flex items-center gap-2"
          >
            <CheckSquare className="w-4 h-4 text-[#A3B18A]" />
            <span>Today&apos;s Tasks ({metrics.todayCompletionPct}%)</span>
          </button>
        </div>
      </div>

      {/* 5 KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        <KpiCard
          title="Overall Learning Progress"
          value={`${metrics.overallLearningPct}%`}
          subtitle={`Skills ${metrics.avgSkillPct}% • Roadmap ${metrics.avgRoadmapPct}%`}
          icon={TrendingUp}
          accent="sage"
          progress={metrics.overallLearningPct}
        />
        <KpiCard
          title="Completed Tasks"
          value={metrics.totalCompletedTasks}
          subtitle={`Today: ${metrics.todayCompleted}/${metrics.todayTasks.length} (${metrics.todayCompletionPct}%)`}
          icon={CheckCircle2}
          accent="navy"
          progress={metrics.todayCompletionPct}
        />
        <KpiCard
          title="Total Study Hours"
          value={`${metrics.totalStudyHours}h`}
          subtitle={`This week: ${metrics.weeklySum}h logged`}
          icon={Clock}
          accent="sage"
        />
        <KpiCard
          title="Completed Projects"
          value={`${metrics.completedProjects}/${metrics.totalProjects}`}
          subtitle="Portfolio deliverables"
          icon={FolderKanban}
          accent="navy"
          progress={metrics.totalProjects > 0 ? Math.round((metrics.completedProjects / metrics.totalProjects) * 100) : 0}
        />
        <KpiCard
          title="Internship Readiness"
          value={`${metrics.readinessPct}%`}
          subtitle={`${metrics.readinessDone} of ${metrics.readinessTotal} criteria met`}
          icon={Award}
          accent="sage"
          progress={metrics.readinessPct}
        />
      </div>

      {/* Charts Row: Weekly Learning Activity & Today's Focus */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chart 1: Weekly Learning Activity */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-5">
              <div>
                <h3 className="text-base font-bold text-[#172B4D]">Weekly Learning Activity</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Daily study hours across technical skills, English & coursework ({metrics.weeklySum} hrs this week)
                </p>
              </div>
              <form onSubmit={handleLogStudyHours} className="flex items-center gap-1.5 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
                <select
                  value={quickHoursDay}
                  onChange={(e) => setQuickHoursDay(e.target.value)}
                  className="text-xs font-medium bg-white border border-slate-200 rounded-lg px-2 py-1 text-[#172B4D]"
                >
                  {appData.weeklyHours.map((d) => (
                    <option key={d.day} value={d.day}>{d.day}</option>
                  ))}
                </select>
                <select
                  value={quickHoursAdd}
                  onChange={(e) => setQuickHoursAdd(e.target.value)}
                  className="text-xs font-medium bg-white border border-slate-200 rounded-lg px-2 py-1 text-[#172B4D]"
                >
                  <option value="0.5">+0.5h</option>
                  <option value="1">+1.0h</option>
                  <option value="1.5">+1.5h</option>
                  <option value="2">+2.0h</option>
                </select>
                <button
                  type="submit"
                  className="px-2.5 py-1 rounded-lg bg-[#172B4D] text-white text-xs font-medium hover:bg-[#1E3A66]"
                >
                  Log
                </button>
              </form>
            </div>

            {/* Interactive SVG / Bar Visualization */}
            <div className="grid grid-cols-7 gap-3 items-end h-48 pt-6 pb-2 px-2 bg-[#F8F9FA] rounded-xl border border-slate-100">
              {appData.weeklyHours.map((item) => {
                const heightPct = Math.round((item.hours / maxWeeklyHours) * 100);
                return (
                  <div key={item.day} className="flex flex-col items-center h-full justify-end group">
                    <span className="text-xs font-semibold text-[#172B4D] tabular-nums mb-1.5">
                      {item.hours}h
                    </span>
                    <div className="w-full max-w-[42px] bg-slate-200/70 rounded-t-lg h-32 flex items-end overflow-hidden">
                      <div
                        className="w-full bg-[#172B4D] group-hover:bg-[#588157] transition-all duration-500 rounded-t-lg"
                        style={{ height: `${Math.max(8, heightPct)}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-slate-600 mt-2">{item.day}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Recommended Year 1 target: 14–18 hrs/week</span>
            <span className="font-semibold text-[#588157]">Avg: {(metrics.weeklySum / 7).toFixed(1)} hrs/day</span>
          </div>
        </div>

        {/* Today's Focus Checklist */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-[#172B4D]">Today&apos;s Focus Routine</h3>
              <p className="text-xs text-slate-500 mt-0.5">{metrics.todayStr}</p>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-[#A3B18A]/25 text-[#3A5A40] tabular-nums">
              {metrics.todayCompleted}/{metrics.todayTasks.length} Done
            </span>
          </div>

          <ProgressBar percentage={metrics.todayCompletionPct} height="h-2" colorClass="bg-[#588157]" />

          <div className="mt-4 space-y-2 flex-1 overflow-y-auto max-h-60 pr-1">
            {metrics.todayTasks.length === 0 ? (
              <p className="text-sm text-slate-500 py-6 text-center">No tasks scheduled for today.</p>
            ) : (
              metrics.todayTasks.map((task) => (
                <button
                  key={task.id}
                  onClick={() => handleToggleTodayTask(task.id)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left transition-all ${
                    task.completed
                      ? 'bg-slate-50/80 border-slate-200/80 text-slate-400'
                      : 'bg-white border-slate-200 hover:border-[#A3B18A] text-[#172B4D]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {task.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-[#588157] shrink-0" />
                    ) : (
                      <Circle className="w-4 h-4 text-slate-300 shrink-0" />
                    )}
                    <span className={`text-xs font-medium truncate ${task.completed ? 'line-through' : ''}`}>
                      {task.title}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 ml-2 shrink-0">{task.category}</span>
                </button>
              ))
            )}
          </div>

          <button
            onClick={() => setActiveTab('tasks')}
            className="mt-4 w-full py-2 text-xs font-semibold text-[#172B4D] bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            Open Full Task Manager & Calendar →
          </button>
        </div>
      </div>

      {/* Bottom Charts Row: Skill Development Progress & Monthly Roadmap Completion */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 2: Skill Development Progress */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-[#172B4D]">Skill Development Progress</h3>
              <p className="text-xs text-slate-500 mt-0.5">Completion across 9 core financial & language competencies</p>
            </div>
            <button
              onClick={() => setActiveTab('skills')}
              className="text-xs font-semibold text-[#588157] hover:underline"
            >
              Update Skills
            </button>
          </div>
          <div className="space-y-3">
            {appData.skills.map((skill) => {
              const pct = skill.totalLessons > 0 ? Math.round((skill.completedLessons / skill.totalLessons) * 100) : 0;
              return (
                <div key={skill.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-[#172B4D]">{skill.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">{skill.level}</span>
                      <span className="font-bold text-[#172B4D] tabular-nums w-9 text-right">{pct}%</span>
                    </div>
                  </div>
                  <ProgressBar
                    percentage={pct}
                    height="h-2"
                    colorClass={pct >= 70 ? 'bg-[#588157]' : pct >= 40 ? 'bg-[#A3B18A]' : 'bg-[#172B4D]'}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 3: Monthly Roadmap Completion */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-[#172B4D]">Monthly Roadmap Completion</h3>
                <p className="text-xs text-slate-500 mt-0.5">12-Month preparation timeline for Year 2 internship</p>
              </div>
              <button
                onClick={() => setActiveTab('roadmap')}
                className="text-xs font-semibold text-[#588157] hover:underline"
              >
                View Roadmap
              </button>
            </div>

            <div className="grid grid-cols-6 sm:grid-cols-12 gap-2 items-end h-48 pt-6 pb-2 px-3 bg-[#F8F9FA] rounded-xl border border-slate-100">
              {metrics.roadmapMonths.map((m) => (
                <div key={m.month} className="flex flex-col items-center h-full justify-end group" title={`Month ${m.month}: ${m.title} (${m.pct}%)`}>
                  <span className="text-[10px] font-semibold text-slate-600 tabular-nums mb-1">
                    {m.pct}%
                  </span>
                  <div className="w-full max-w-[24px] bg-slate-200/80 rounded-t-md h-32 flex items-end overflow-hidden">
                    <div
                      className={`w-full transition-all duration-500 rounded-t-md ${
                        m.pct === 100 ? 'bg-[#588157]' : m.pct > 0 ? 'bg-[#A3B18A]' : 'bg-slate-300'
                      }`}
                      style={{ height: `${Math.max(6, m.pct)}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-semibold text-[#172B4D] mt-1.5">M{m.month}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 text-center">
            <div className="p-2 rounded-lg bg-slate-50">
              <div className="text-xs text-slate-500">Completed</div>
              <div className="text-sm font-bold text-[#588157] tabular-nums">
                {metrics.roadmapMonths.filter((m) => m.pct === 100).length} Months
              </div>
            </div>
            <div className="p-2 rounded-lg bg-slate-50">
              <div className="text-xs text-slate-500">In Progress</div>
              <div className="text-sm font-bold text-[#172B4D] tabular-nums">
                {metrics.roadmapMonths.filter((m) => m.pct > 0 && m.pct < 100).length} Months
              </div>
            </div>
            <div className="p-2 rounded-lg bg-slate-50">
              <div className="text-xs text-slate-500">Remaining</div>
              <div className="text-sm font-bold text-slate-600 tabular-nums">
                {metrics.roadmapMonths.filter((m) => m.pct === 0).length} Months
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function KpiCard({ title, value, subtitle, icon: Icon, accent, progress }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-colors flex flex-col justify-between">
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs font-semibold text-slate-500 leading-snug">{title}</span>
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
            accent === 'sage' ? 'bg-[#A3B18A]/25 text-[#3A5A40]' : 'bg-[#172B4D]/10 text-[#172B4D]'
          }`}
        >
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="mt-3">
        <div className="text-2xl font-bold text-[#172B4D] tabular-nums tracking-tight">{value}</div>
        <div className="text-xs text-slate-500 mt-1">{subtitle}</div>
        {typeof progress === 'number' && (
          <div className="mt-3">
            <ProgressBar
              percentage={progress}
              height="h-1.5"
              colorClass={accent === 'sage' ? 'bg-[#588157]' : 'bg-[#172B4D]'}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// MODULE B: DAILY TASK MANAGEMENT & CALENDAR VIEW
// ============================================================================
function DailyTasksView({ appData, metrics, updateAppData, requestDelete, showToast }) {
  const [selectedDate, setSelectedDate] = useState(getTodayStr());
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All'); // 'All' | 'Incomplete' | 'Completed'
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  // Add/Edit Task Form State
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskCategory, setTaskCategory] = useState('Excel');
  const [taskPriority, setTaskPriority] = useState('High');
  const [taskDate, setTaskDate] = useState(getTodayStr());

  useEffect(() => {
    if (!editingTaskId) {
      setTaskDate(selectedDate);
    }
  }, [selectedDate, editingTaskId]);

  // Tasks filtered for the selected date
  const dayTasks = useMemo(() => {
    return appData.tasks.filter((t) => {
      if (t.date !== selectedDate) return false;
      if (categoryFilter !== 'All' && t.category !== categoryFilter) return false;
      if (statusFilter === 'Completed' && !t.completed) return false;
      if (statusFilter === 'Incomplete' && t.completed) return false;
      return true;
    });
  }, [appData.tasks, selectedDate, categoryFilter, statusFilter]);

  const allSelectedDayTasks = appData.tasks.filter((t) => t.date === selectedDate);
  const completedCount = allSelectedDayTasks.filter((t) => t.completed).length;
  const incompleteCount = allSelectedDayTasks.length - completedCount;
  const completionPct = allSelectedDayTasks.length > 0 ? Math.round((completedCount / allSelectedDayTasks.length) * 100) : 0;

  const handleSaveTask = (e) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    if (editingTaskId) {
      updateAppData((prev) => ({
        ...prev,
        tasks: prev.tasks.map((t) =>
          t.id === editingTaskId
            ? { ...t, title: taskTitle.trim(), category: taskCategory, priority: taskPriority, date: taskDate }
            : t
        )
      }));
      showToast('Task updated.');
      setEditingTaskId(null);
    } else {
      const newTask = {
        id: `task-${Date.now()}`,
        title: taskTitle.trim(),
        category: taskCategory,
        priority: taskPriority,
        date: taskDate,
        completed: false,
        durationMins: 30
      };
      updateAppData((prev) => ({
        ...prev,
        tasks: [newTask, ...prev.tasks]
      }));
      setSelectedDate(taskDate);
      showToast('Task added to schedule.');
    }

    setTaskTitle('');
  };

  const startEditTask = (task) => {
    setEditingTaskId(task.id);
    setTaskTitle(task.title);
    setTaskCategory(task.category);
    setTaskPriority(task.priority);
    setTaskDate(task.date);
  };

  const toggleTask = (id) => {
    updateAppData((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    }));
  };

  const deleteTask = (task) => {
    requestDelete(
      'Delete Daily Task?',
      `Are you sure you want to delete "${task.title}"?`,
      () => {
        updateAppData((prev) => ({
          ...prev,
          tasks: prev.tasks.filter((t) => t.id !== task.id)
        }));
        showToast('Task deleted.');
      }
    );
  };

  const handleLoadDefaultRoutine = () => {
    const defaults = createDefaultTasksForDate(selectedDate).map((t, idx) => ({
      ...t,
      id: `task-${selectedDate}-${Date.now()}-${idx}`,
      completed: false
    }));
    updateAppData((prev) => ({
      ...prev,
      tasks: [...prev.tasks, ...defaults]
    }));
    showToast(`Added 7 default analyst routine tasks for ${selectedDate}.`);
  };

  // Calendar grid generation
  const calendarDays = useMemo(() => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0=Sun
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells = [];
    for (let i = 0; i < firstDayOfWeek; i++) {
      cells.push(null);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const tasksOnDay = appData.tasks.filter((t) => t.date === dateStr);
      const doneOnDay = tasksOnDay.filter((t) => t.completed).length;
      cells.push({
        day,
        dateStr,
        total: tasksOnDay.length,
        done: doneOnDay
      });
    }
    return cells;
  }, [calendarMonth, appData.tasks]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#172B4D]">Daily Task Management</h2>
          <p className="text-sm text-slate-600 mt-0.5">
            Execute daily study habits across Excel, Accounting, Finance, SQL, Power BI & IELTS.
          </p>
        </div>
        <button
          onClick={handleLoadDefaultRoutine}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:border-[#A3B18A] text-sm font-medium text-[#172B4D] shadow-xs transition-colors"
        >
          <Sparkles className="w-4 h-4 text-[#588157]" />
          <span>Load Default Daily Routine</span>
        </button>
      </div>

      {/* Main Grid: Task List + Add Form on Left, Interactive Calendar & Stats on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Daily Progress, Task Form, Filters & Checklist */}
        <div className="lg:col-span-7 space-y-5">
          {/* Daily Completion Progress Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Selected Date
                </span>
                <h3 className="text-lg font-bold text-[#172B4D] flex items-center gap-2">
                  <span>{selectedDate}</span>
                  {selectedDate === metrics.todayStr && (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-[#A3B18A]/25 text-[#3A5A40]">
                      Today
                    </span>
                  )}
                </h3>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <div className="text-right">
                  <span className="text-slate-500">Completed: </span>
                  <span className="font-bold text-[#588157] tabular-nums">{completedCount}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-500">Remaining: </span>
                  <span className="font-bold text-[#172B4D] tabular-nums">{incompleteCount}</span>
                </div>
                <div className="text-lg font-bold text-[#172B4D] tabular-nums">{completionPct}%</div>
              </div>
            </div>
            <ProgressBar percentage={completionPct} height="h-2.5" colorClass="bg-[#588157]" />
          </div>

          {/* Add / Edit Task Form */}
          <form onSubmit={handleSaveTask} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-[#172B4D]">
                {editingTaskId ? 'Edit Task' : 'Add New Study Task'}
              </h4>
              {editingTaskId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingTaskId(null);
                    setTaskTitle('');
                  }}
                  className="text-xs text-slate-500 hover:text-slate-700"
                >
                  Cancel Edit
                </button>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-2.5">
              <input
                type="text"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                placeholder="e.g., Practice NPV & IRR exercises for 40 minutes..."
                className="flex-1 px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-[#172B4D]"
                required
              />
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-[#172B4D] hover:bg-[#1E3A66] text-white text-sm font-medium transition-colors flex items-center justify-center gap-1.5 shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>{editingTaskId ? 'Save' : 'Add Task'}</span>
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <select
                value={taskCategory}
                onChange={(e) => setTaskCategory(e.target.value)}
                className="px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 bg-[#F8F9FA] text-[#172B4D]"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <select
                value={taskPriority}
                onChange={(e) => setTaskPriority(e.target.value)}
                className="px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 bg-[#F8F9FA] text-[#172B4D]"
              >
                <option value="High">Priority: High</option>
                <option value="Medium">Priority: Medium</option>
                <option value="Low">Priority: Low</option>
              </select>
              <input
                type="date"
                value={taskDate}
                onChange={(e) => setTaskDate(e.target.value)}
                className="px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 bg-[#F8F9FA] text-[#172B4D]"
              />
            </div>
          </form>

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {['All', 'Incomplete', 'Completed'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    statusFilter === st
                      ? 'bg-[#172B4D] text-white'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white border border-slate-200 text-[#172B4D]"
            >
              <option value="All">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Task List */}
          <div className="space-y-2.5">
            {dayTasks.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
                <p className="text-sm font-medium text-slate-600">No tasks matching your filter on {selectedDate}.</p>
                <p className="text-xs text-slate-400 mt-1">
                  Add a custom task above or click &ldquo;Load Default Daily Routine&rdquo;.
                </p>
              </div>
            ) : (
              dayTasks.map((task) => (
                <div
                  key={task.id}
                  className={`bg-white rounded-xl border p-4 shadow-2xs transition-all flex items-center justify-between gap-3 ${
                    task.completed ? 'border-slate-200/80 bg-slate-50/60' : 'border-slate-200 hover:border-[#A3B18A]'
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <button
                      onClick={() => toggleTask(task.id)}
                      className="mt-0.5 text-slate-400 hover:text-[#588157] transition-colors shrink-0"
                      aria-label="Toggle Task Completion"
                    >
                      {task.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-[#588157]" />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </button>
                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-sm font-medium leading-snug ${
                          task.completed ? 'line-through text-slate-400' : 'text-[#172B4D]'
                        }`}
                      >
                        {task.title}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <CategoryBadge category={task.category} />
                        <PriorityBadge priority={task.priority} />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => startEditTask(task)}
                      className="p-2 rounded-lg text-slate-400 hover:text-[#172B4D] hover:bg-slate-100 transition-colors"
                      title="Edit Task"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteTask(task)}
                      className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Delete Task"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Interactive Calendar View */}
        <div className="lg:col-span-5">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs sticky top-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-[#588157]" />
                <h3 className="text-base font-bold text-[#172B4D]">
                  {calendarMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h3>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() =>
                    setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1))
                  }
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    const now = new Date();
                    setCalendarMonth(new Date(now.getFullYear(), now.getMonth(), 1));
                    setSelectedDate(getTodayStr());
                  }}
                  className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 text-[#172B4D]"
                >
                  Today
                </button>
                <button
                  onClick={() =>
                    setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1))
                  }
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Weekday Headers */}
            <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-slate-400 pb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                <div key={d}>{d}</div>
              ))}
            </div>

            {/* Calendar Cells */}
            <div className="grid grid-cols-7 gap-1.5">
              {calendarDays.map((cell, idx) => {
                if (!cell) return <div key={`empty-${idx}`} className="h-12" />;
                const isSelected = cell.dateStr === selectedDate;
                const isToday = cell.dateStr === metrics.todayStr;
                const allDone = cell.total > 0 && cell.done === cell.total;

                return (
                  <button
                    key={cell.dateStr}
                    onClick={() => setSelectedDate(cell.dateStr)}
                    className={`h-12 rounded-xl flex flex-col items-center justify-center border text-xs transition-all relative ${
                      isSelected
                        ? 'bg-[#172B4D] text-white border-[#172B4D] font-bold shadow-xs'
                        : isToday
                        ? 'bg-[#A3B18A]/20 border-[#A3B18A] text-[#172B4D] font-semibold'
                        : 'bg-[#F8F9FA] border-transparent hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <span className="tabular-nums">{cell.day}</span>
                    {cell.total > 0 && (
                      <span
                        className={`mt-1 w-1.5 h-1.5 rounded-full ${
                          allDone
                            ? 'bg-[#588157]'
                            : isSelected
                            ? 'bg-[#A3B18A]'
                            : 'bg-amber-500'
                        }`}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#588157]" /> All tasks done
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" /> Tasks scheduled
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MODULE C: LEARNING TRACKER (9 CORE SKILLS)
// ============================================================================
function LearningTrackerView({ appData, updateAppData, showToast }) {
  const [editingSkill, setEditingSkill] = useState(null);
  const [newResourceTitle, setNewResourceTitle] = useState('');
  const [newResourceUrl, setNewResourceUrl] = useState('');

  const handleAdjustLessons = (skillId, delta) => {
    updateAppData((prev) => ({
      ...prev,
      skills: prev.skills.map((s) => {
        if (s.id !== skillId) return s;
        const updated = Math.min(s.totalLessons, Math.max(0, s.completedLessons + delta));
        return { ...s, completedLessons: updated };
      })
    }));
  };

  const handleSaveSkillModal = (e) => {
    e.preventDefault();
    if (!editingSkill) return;
    updateAppData((prev) => ({
      ...prev,
      skills: prev.skills.map((s) => (s.id === editingSkill.id ? editingSkill : s))
    }));
    showToast(`Updated ${editingSkill.name} progress & notes.`);
    setEditingSkill(null);
  };

  const handleAddResource = () => {
    if (!newResourceTitle.trim() || !editingSkill) return;
    const url = newResourceUrl.trim() || 'https://corporatefinanceinstitute.com';
    setEditingSkill({
      ...editingSkill,
      resources: [...editingSkill.resources, { title: newResourceTitle.trim(), url }]
    });
    setNewResourceTitle('');
    setNewResourceUrl('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#172B4D]">Learning Tracker – Core Competencies</h2>
        <p className="text-sm text-slate-600 mt-0.5">
          Track lesson completion, proficiency levels, study notes, and curated resources across all 9 analyst pillars.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {appData.skills.map((skill) => {
          const pct =
            skill.totalLessons > 0 ? Math.round((skill.completedLessons / skill.totalLessons) * 100) : 0;

          return (
            <div
              key={skill.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="inline-block px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-[#A3B18A]/20 text-[#3A5A40] mb-1.5">
                      {skill.level}
                    </span>
                    <h3 className="text-base font-bold text-[#172B4D]">{skill.name}</h3>
                  </div>
                  <button
                    onClick={() => setEditingSkill(skill)}
                    className="p-2 rounded-lg text-slate-400 hover:text-[#172B4D] hover:bg-slate-100 transition-colors"
                    title="Edit Skill Details"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-xs text-slate-600 mt-2 leading-relaxed">{skill.goal}</p>

                {/* Progress Bar & Quick Lesson Incrementer */}
                <div className="mt-4 p-3.5 rounded-xl bg-[#F8F9FA] border border-slate-100">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-medium text-slate-600">
                      Lessons: <strong className="text-[#172B4D] tabular-nums">{skill.completedLessons}</strong> /{' '}
                      <span className="tabular-nums">{skill.totalLessons}</span>
                    </span>
                    <span className="font-bold text-[#588157] tabular-nums">{pct}%</span>
                  </div>
                  <ProgressBar percentage={pct} height="h-2" colorClass="bg-[#588157]" />

                  <div className="flex items-center justify-between mt-3">
                    <span className="text-[11px] text-slate-500">Quick update:</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleAdjustLessons(skill.id, -1)}
                        className="w-7 h-7 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-xs font-bold text-[#172B4D]"
                      >
                        -1
                      </button>
                      <button
                        onClick={() => handleAdjustLessons(skill.id, 1)}
                        className="w-7 h-7 rounded-lg bg-[#172B4D] hover:bg-[#1E3A66] text-xs font-bold text-white"
                      >
                        +1
                      </button>
                    </div>
                  </div>
                </div>

                {/* Notes Preview */}
                {skill.notes && (
                  <div className="mt-3.5">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Study Notes</div>
                    <p className="text-xs text-slate-600 mt-1 line-clamp-2">{skill.notes}</p>
                  </div>
                )}
              </div>

              {/* Resources */}
              <div className="mt-4 pt-3 border-t border-slate-100">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Resources ({skill.resources.length})
                </div>
                <div className="space-y-1">
                  {skill.resources.map((res, idx) => (
                    <a
                      key={idx}
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between text-xs text-[#172B4D] hover:text-[#588157] font-medium truncate"
                    >
                      <span className="truncate">{res.title}</span>
                      <ExternalLink className="w-3 h-3 shrink-0 ml-1.5 opacity-60" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Skill Modal */}
      {editingSkill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-[#172B4D]">Update {editingSkill.name}</h3>
              <button onClick={() => setEditingSkill(null)} className="p-1.5 rounded-lg hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSkillModal} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Proficiency Level</label>
                  <select
                    value={editingSkill.level}
                    onChange={(e) => setEditingSkill({ ...editingSkill, level: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200"
                  >
                    {PROFICIENCY_LEVELS.map((lvl) => (
                      <option key={lvl} value={lvl}>{lvl}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Completed Lessons</label>
                  <input
                    type="number"
                    min="0"
                    max={editingSkill.totalLessons}
                    value={editingSkill.completedLessons}
                    onChange={(e) =>
                      setEditingSkill({
                        ...editingSkill,
                        completedLessons: Math.max(0, parseInt(e.target.value, 10) || 0)
                      })
                    }
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Total Lessons</label>
                  <input
                    type="number"
                    min="1"
                    value={editingSkill.totalLessons}
                    onChange={(e) =>
                      setEditingSkill({
                        ...editingSkill,
                        totalLessons: Math.max(1, parseInt(e.target.value, 10) || 1)
                      })
                    }
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Learning Goal</label>
                <input
                  type="text"
                  value={editingSkill.goal}
                  onChange={(e) => setEditingSkill({ ...editingSkill, goal: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Personal Study Notes</label>
                <textarea
                  rows="3"
                  value={editingSkill.notes}
                  onChange={(e) => setEditingSkill({ ...editingSkill, notes: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200"
                />
              </div>

              {/* Manage Links */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Resources & Links</label>
                <div className="space-y-1.5 mb-2">
                  {editingSkill.resources.map((r, i) => (
                    <div key={i} className="flex items-center justify-between text-xs bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
                      <span className="truncate font-medium">{r.title}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setEditingSkill({
                            ...editingSkill,
                            resources: editingSkill.resources.filter((_, idx) => idx !== i)
                          })
                        }
                        className="text-rose-600 hover:underline ml-2"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    placeholder="Resource title"
                    value={newResourceTitle}
                    onChange={(e) => setNewResourceTitle(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200"
                  />
                  <input
                    type="url"
                    placeholder="https://..."
                    value={newResourceUrl}
                    onChange={(e) => setNewResourceUrl(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200"
                  />
                  <button
                    type="button"
                    onClick={handleAddResource}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-[#172B4D]"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingSkill(null)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-medium text-white bg-[#172B4D] hover:bg-[#1E3A66] rounded-xl"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// MODULE D: 12-MONTH LEARNING ROADMAP
// ============================================================================
function RoadmapView({ metrics, updateAppData, showToast }) {
  const [expandedMonth, setExpandedMonth] = useState(2); // Default expand Month 2 (currently in progress)
  const [newResourceInput, setNewResourceInput] = useState({});

  const toggleRoadmapTask = (monthNum, taskId) => {
    updateAppData((prev) => ({
      ...prev,
      roadmap: prev.roadmap.map((m) => {
        if (m.month !== monthNum) return m;
        return {
          ...m,
          tasks: m.tasks.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t))
        };
      })
    }));
  };

  const updateMonthNotes = (monthNum, notes) => {
    updateAppData((prev) => ({
      ...prev,
      roadmap: prev.roadmap.map((m) => (m.month === monthNum ? { ...m, notes } : m))
    }));
  };

  const addMonthResource = (monthNum) => {
    const val = (newResourceInput[monthNum] || '').trim();
    if (!val) return;
    updateAppData((prev) => ({
      ...prev,
      roadmap: prev.roadmap.map((m) =>
        m.month === monthNum ? { ...m, resources: [...m.resources, val] } : m
      )
    }));
    setNewResourceInput((prev) => ({ ...prev, [monthNum]: '' }));
    showToast(`Added resource to Month ${monthNum}.`);
  };

  return (
    <div className="space-y-6">
      {/* Header & Overall Roadmap Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div>
            <h2 className="text-2xl font-bold text-[#172B4D]">12-Month Learning Roadmap</h2>
            <p className="text-sm text-slate-600 mt-0.5">
              Structured 1-year curriculum taking you from Excel basics to Year 2 Finance Internship interviews.
            </p>
          </div>
          <div className="text-left sm:text-right">
            <span className="text-xs font-semibold text-slate-500 uppercase">Overall Completion</span>
            <div className="text-2xl font-bold text-[#588157] tabular-nums">{metrics.avgRoadmapPct}%</div>
          </div>
        </div>
        <ProgressBar percentage={metrics.avgRoadmapPct} height="h-2.5" colorClass="bg-[#588157]" />
      </div>

      {/* 12 Months Interactive Cards */}
      <div className="space-y-3.5">
        {metrics.roadmapMonths.map((m) => {
          const isOpen = expandedMonth === m.month;
          const statusStyles = {
            Completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
            'In Progress': 'bg-amber-50 text-amber-700 border-amber-200',
            'Not Started': 'bg-slate-100 text-slate-600 border-slate-200'
          };

          return (
            <div
              key={m.month}
              className={`bg-white rounded-2xl border transition-all overflow-hidden ${
                isOpen ? 'border-[#172B4D] shadow-sm' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              {/* Accordion Header */}
              <button
                onClick={() => setExpandedMonth(isOpen ? null : m.month)}
                className="w-full px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left"
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                      m.pct === 100
                        ? 'bg-[#588157] text-white'
                        : m.pct > 0
                        ? 'bg-[#172B4D] text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    M{m.month}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-bold text-[#172B4D]">
                        Month {m.month}: {m.title}
                      </h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusStyles[m.status]}`}>
                        {m.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{m.objectives}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 self-end sm:self-center shrink-0">
                  <div className="w-28 hidden sm:block">
                    <div className="flex justify-between text-[11px] font-semibold text-slate-600 mb-1 tabular-nums">
                      <span>
                        {m.doneCount}/{m.totalCount}
                      </span>
                      <span>{m.pct}%</span>
                    </div>
                    <ProgressBar percentage={m.pct} height="h-1.5" colorClass="bg-[#588157]" />
                  </div>
                  <span className="sm:hidden text-xs font-bold text-[#172B4D] tabular-nums">{m.pct}%</span>
                  {isOpen ? (
                    <ChevronUp className="w-5 h-5 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  )}
                </div>
              </button>

              {/* Expanded Details */}
              {isOpen && (
                <div className="px-5 pb-6 pt-2 border-t border-slate-100 bg-[#F8F9FA]/60 grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Checklist & Objectives */}
                  <div className="lg:col-span-7 space-y-4">
                    <div className="p-3.5 rounded-xl bg-white border border-slate-200/80">
                      <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Learning Objectives
                      </div>
                      <p className="text-sm text-[#172B4D] mt-1">{m.objectives}</p>
                    </div>

                    <div>
                      <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                        Milestone Checklist ({m.doneCount}/{m.totalCount} Completed)
                      </div>
                      <div className="space-y-2">
                        {m.tasks.map((task) => (
                          <button
                            key={task.id}
                            onClick={() => toggleRoadmapTask(m.month, task.id)}
                            className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                              task.completed
                                ? 'bg-emerald-50/40 border-emerald-200/80 text-slate-500'
                                : 'bg-white border-slate-200 hover:border-[#A3B18A] text-[#172B4D]'
                            }`}
                          >
                            {task.completed ? (
                              <CheckCircle2 className="w-4 h-4 text-[#588157] shrink-0" />
                            ) : (
                              <Circle className="w-4 h-4 text-slate-300 shrink-0" />
                            )}
                            <span className={`text-sm font-medium ${task.completed ? 'line-through' : ''}`}>
                              {task.text}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Notes & Resources */}
                  <div className="lg:col-span-5 space-y-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                        Month {m.month} Study Notes
                      </label>
                      <textarea
                        rows="4"
                        value={m.notes}
                        onChange={(e) => updateMonthNotes(m.month, e.target.value)}
                        placeholder="Record key formulas, takeaways, or questions..."
                        className="w-full p-3 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-[#172B4D]"
                      />
                    </div>

                    <div>
                      <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                        Recommended Resources
                      </div>
                      <ul className="space-y-1.5 mb-2">
                        {m.resources.map((res, idx) => (
                          <li
                            key={idx}
                            className="flex items-center gap-2 text-xs font-medium text-[#172B4D] bg-white px-3 py-2 rounded-lg border border-slate-200"
                          >
                            <Bookmark className="w-3.5 h-3.5 text-[#588157] shrink-0" />
                            <span>{res}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newResourceInput[m.month] || ''}
                          onChange={(e) =>
                            setNewResourceInput((prev) => ({ ...prev, [m.month]: e.target.value }))
                          }
                          placeholder="Add course, book, or link..."
                          className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => addMonthResource(m.month)}
                          className="px-3 py-1.5 rounded-lg bg-[#172B4D] text-white text-xs font-medium"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// MODULE E: PROJECT PORTFOLIO
// ============================================================================
function ProjectPortfolioView({ appData, updateAppData, requestDelete, showToast }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  const emptyProject = {
    id: '',
    title: '',
    status: 'Planning',
    deadline: getOffsetDateStr(60),
    tools: ['Excel'],
    description: '',
    notes: '',
    files: []
  };

  const [formState, setFormState] = useState(emptyProject);
  const [toolInput, setToolInput] = useState('');
  const [linkTitle, setLinkTitle] = useState('');
  const [linkUrl, setLinkUrl] = useState('');

  const openNewProjectModal = () => {
    setEditingProject(null);
    setFormState({ ...emptyProject, id: `proj-${Date.now()}` });
    setModalOpen(true);
  };

  const openEditProjectModal = (proj) => {
    setEditingProject(proj);
    setFormState({ ...proj });
    setModalOpen(true);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const sizeKB = Math.max(1, Math.round(file.size / 1024));
    const newAttachment = {
      id: `file-${Date.now()}`,
      name: file.name,
      type: file.type || 'Document',
      size: `${sizeKB} KB`,
      url: ''
    };
    setFormState((prev) => ({
      ...prev,
      files: [...prev.files, newAttachment]
    }));
    showToast(`Attached "${file.name}"`);
  };

  const handleAddExternalLink = () => {
    if (!linkTitle.trim()) return;
    setFormState((prev) => ({
      ...prev,
      files: [
        ...prev.files,
        {
          id: `link-${Date.now()}`,
          name: linkTitle.trim(),
          type: 'External Link',
          size: 'URL',
          url: linkUrl.trim() || 'https://github.com'
        }
      ]
    }));
    setLinkTitle('');
    setLinkUrl('');
  };

  const handleSaveProject = (e) => {
    e.preventDefault();
    if (!formState.title.trim()) return;

    if (editingProject) {
      updateAppData((prev) => ({
        ...prev,
        projects: prev.projects.map((p) => (p.id === editingProject.id ? formState : p))
      }));
      showToast('Project updated.');
    } else {
      updateAppData((prev) => ({
        ...prev,
        projects: [...prev.projects, formState]
      }));
      showToast('New finance project added to portfolio.');
    }
    setModalOpen(false);
  };

  const handleDeleteProject = (proj) => {
    requestDelete(
      'Delete Portfolio Project?',
      `Remove "${proj.title}" and all attached metadata from your portfolio?`,
      () => {
        updateAppData((prev) => ({
          ...prev,
          projects: prev.projects.filter((p) => p.id !== proj.id)
        }));
        showToast('Project removed.');
      }
    );
  };

  const statusBadge = (status) => {
    const map = {
      Completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      'In Progress': 'bg-amber-50 text-amber-700 border-amber-200',
      Planning: 'bg-slate-100 text-slate-600 border-slate-200'
    };
    return map[status] || map.Planning;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#172B4D]">Project Portfolio</h2>
          <p className="text-sm text-slate-600 mt-0.5">
            Showcase hands-on financial modeling, Power BI dashboards, and company analysis reports on your CV.
          </p>
        </div>
        <button
          onClick={openNewProjectModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#172B4D] hover:bg-[#1E3A66] text-white text-sm font-medium shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4 text-[#A3B18A]" />
          <span>Add New Project</span>
        </button>
      </div>

      {/* Project Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {appData.projects.map((proj) => (
          <div
            key={proj.id}
            className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusBadge(proj.status)}`}>
                  {proj.status}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditProjectModal(proj)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-[#172B4D] hover:bg-slate-100"
                    title="Edit Project"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteProject(proj)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                    title="Delete Project"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h3 className="text-lg font-bold text-[#172B4D] leading-snug">{proj.title}</h3>

              <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1.5">
                <CalendarIcon className="w-3.5 h-3.5 text-[#588157]" />
                <span>Target Deadline: {proj.deadline}</span>
              </div>

              {/* Tools Tags */}
              <div className="flex flex-wrap gap-1.5 mt-3">
                {proj.tools.map((tool, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-[#F8F9FA] border border-slate-200 text-[#172B4D]"
                  >
                    {tool}
                  </span>
                ))}
              </div>

              <p className="text-xs text-slate-600 mt-4 leading-relaxed">{proj.description}</p>

              {proj.notes && (
                <div className="mt-4 p-3 rounded-xl bg-[#F8F9FA] border border-slate-100">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
                    Working Notes
                  </span>
                  <p className="text-xs text-slate-700 mt-1">{proj.notes}</p>
                </div>
              )}
            </div>

            {/* Attached Deliverables / Files */}
            <div className="mt-5 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500">
                  Deliverables & Files ({proj.files.length})
                </span>
                <button
                  onClick={() => openEditProjectModal(proj)}
                  className="text-xs font-semibold text-[#588157] hover:underline"
                >
                  + Attach File
                </button>
              </div>
              {proj.files.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No files or links attached yet.</p>
              ) : (
                <div className="space-y-1.5">
                  {proj.files.map((f) => (
                    <div
                      key={f.id}
                      className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-50 border border-slate-200/80 text-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className="w-3.5 h-3.5 text-[#172B4D] shrink-0" />
                        <span className="font-medium text-[#172B4D] truncate">{f.name}</span>
                      </div>
                      {f.url ? (
                        <a
                          href={f.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#588157] hover:underline shrink-0 ml-2"
                        >
                          Open
                        </a>
                      ) : (
                        <span className="text-[11px] text-slate-400 shrink-0 ml-2">{f.size}</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Project Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-[#172B4D]">
                {editingProject ? 'Edit Finance Project' : 'Create Finance Portfolio Project'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="p-1.5 rounded-lg hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProject} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Project Title</label>
                <input
                  type="text"
                  required
                  value={formState.title}
                  onChange={(e) => setFormState({ ...formState, title: e.target.value })}
                  placeholder="e.g., Project 4: Discounted Cash Flow (DCF) Valuation"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Status</label>
                  <select
                    value={formState.status}
                    onChange={(e) => setFormState({ ...formState, status: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200"
                  >
                    <option value="Planning">Planning</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Target Deadline</label>
                  <input
                    type="date"
                    value={formState.deadline}
                    onChange={(e) => setFormState({ ...formState, deadline: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              {/* Tools Tag Manager */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Tools & Methods</label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {formState.tools.map((t, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-xs font-medium text-[#172B4D]"
                    >
                      {t}
                      <button
                        type="button"
                        onClick={() =>
                          setFormState({
                            ...formState,
                            tools: formState.tools.filter((_, i) => i !== idx)
                          })
                        }
                        className="text-slate-400 hover:text-rose-600"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={toolInput}
                    onChange={(e) => setToolInput(e.target.value)}
                    placeholder="Add tool (e.g., Power BI, SQL, DCF)..."
                    className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!toolInput.trim()) return;
                      setFormState({ ...formState, tools: [...formState.tools, toolInput.trim()] });
                      setToolInput('');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold"
                  >
                    Add Tag
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Scope & Description</label>
                <textarea
                  rows="3"
                  value={formState.description}
                  onChange={(e) => setFormState({ ...formState, description: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Progress Notes</label>
                <textarea
                  rows="2"
                  value={formState.notes}
                  onChange={(e) => setFormState({ ...formState, notes: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200"
                />
              </div>

              {/* File Upload & Link Attachment */}
              <div className="p-3.5 rounded-xl bg-[#F8F9FA] border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#172B4D]">Project Files & Portfolio Links</span>
                  <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-[#172B4D] text-xs font-medium text-[#172B4D]">
                    <Upload className="w-3.5 h-3.5 text-[#588157]" />
                    <span>Upload File</span>
                    <input type="file" className="hidden" onChange={handleFileUpload} />
                  </label>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    placeholder="Link title (e.g., Power BI Live Report)"
                    value={linkTitle}
                    onChange={(e) => setLinkTitle(e.target.value)}
                    className="flex-1 px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                  />
                  <input
                    type="url"
                    placeholder="https://drive.google.com/..."
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    className="flex-1 px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddExternalLink}
                    className="px-3 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-xs font-semibold"
                  >
                    Add Link
                  </button>
                </div>

                {formState.files.length > 0 && (
                  <div className="space-y-1.5">
                    {formState.files.map((f) => (
                      <div key={f.id} className="flex items-center justify-between text-xs bg-white px-3 py-1.5 rounded-lg border border-slate-200">
                        <span className="truncate font-medium">{f.name}</span>
                        <button
                          type="button"
                          onClick={() =>
                            setFormState({
                              ...formState,
                              files: formState.files.filter((item) => item.id !== f.id)
                            })
                          }
                          className="text-rose-600 hover:underline ml-2"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-medium text-white bg-[#172B4D] hover:bg-[#1E3A66] rounded-xl"
                >
                  Save Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// MODULE F: IELTS & ENGLISH LEARNING TRACKER
// ============================================================================
function EnglishTrackerView({ appData, updateAppData, requestDelete, showToast }) {
  const { english } = appData;

  // Practice Log Form
  const [practiceModule, setPracticeModule] = useState('Financial English');
  const [practiceScore, setPracticeScore] = useState('');
  const [practiceNotes, setPracticeNotes] = useState('');

  // Vocabulary Form & Filter
  const [vocabSearch, setVocabSearch] = useState('');
  const [vocabFilter, setVocabFilter] = useState('All');
  const [newTerm, setNewTerm] = useState('');
  const [newTermCat, setNewTermCat] = useState('Financial English');
  const [newTermDef, setNewTermDef] = useState('');
  const [newTermEx, setNewTermEx] = useState('');

  const totalEnglishHours = english.skills.reduce((sum, s) => sum + (Number(s.hours) || 0), 0);

  const handleUpdateLevel = (newLevel) => {
    const val = parseFloat(newLevel);
    if (isNaN(val)) return;
    updateAppData((prev) => ({
      ...prev,
      english: { ...prev.english, currentLevel: val }
    }));
  };

  const handleAdjustSkillScore = (skillId, field, delta) => {
    updateAppData((prev) => ({
      ...prev,
      english: {
        ...prev.english,
        skills: prev.english.skills.map((s) => {
          if (s.id !== skillId) return s;
          if (field === 'current') {
            const nextVal = Math.min(9.0, Math.max(0, Number((s.current + delta).toFixed(1))));
            return { ...s, current: nextVal };
          }
          if (field === 'hours') {
            const nextHrs = Math.max(0, Number((s.hours + delta).toFixed(1)));
            return { ...s, hours: nextHrs };
          }
          return s;
        })
      }
    }));
  };

  const handleAddPracticeLog = (e) => {
    e.preventDefault();
    if (!practiceScore.trim()) return;
    const entry = {
      id: `ph-${Date.now()}`,
      date: getTodayStr(),
      module: practiceModule,
      scoreOrDuration: practiceScore.trim(),
      notes: practiceNotes.trim() || 'Completed scheduled practice session.'
    };
    updateAppData((prev) => ({
      ...prev,
      english: {
        ...prev.english,
        practiceHistory: [entry, ...prev.english.practiceHistory]
      }
    }));
    setPracticeScore('');
    setPracticeNotes('');
    showToast('English practice session logged.');
  };

  const handleAddVocabulary = (e) => {
    e.preventDefault();
    if (!newTerm.trim() || !newTermDef.trim()) return;
    const vocabItem = {
      id: `v-${Date.now()}`,
      term: newTerm.trim(),
      category: newTermCat,
      definition: newTermDef.trim(),
      example: newTermEx.trim(),
      mastered: false
    };
    updateAppData((prev) => ({
      ...prev,
      english: {
        ...prev.english,
        vocabulary: [vocabItem, ...prev.english.vocabulary]
      }
    }));
    setNewTerm('');
    setNewTermDef('');
    setNewTermEx('');
    showToast(`Added "${vocabItem.term}" to Vocabulary Notebook.`);
  };

  const toggleVocabMastered = (id) => {
    updateAppData((prev) => ({
      ...prev,
      english: {
        ...prev.english,
        vocabulary: prev.english.vocabulary.map((v) =>
          v.id === id ? { ...v, mastered: !v.mastered } : v
        )
      }
    }));
  };

  const deleteVocab = (item) => {
    requestDelete(
      'Delete Vocabulary Entry?',
      `Remove "${item.term}" from your vocabulary notebook?`,
      () => {
        updateAppData((prev) => ({
          ...prev,
          english: {
            ...prev.english,
            vocabulary: prev.english.vocabulary.filter((v) => v.id !== item.id)
          }
        }));
        showToast('Vocabulary term deleted.');
      }
    );
  };

  const filteredVocab = english.vocabulary.filter((v) => {
    if (vocabFilter !== 'All' && v.category !== vocabFilter) return false;
    if (
      vocabSearch.trim() &&
      !v.term.toLowerCase().includes(vocabSearch.toLowerCase()) &&
      !v.definition.toLowerCase().includes(vocabSearch.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header & Top IELTS Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-[#172B4D]">IELTS & Financial English Tracker</h2>
            <p className="text-sm text-slate-600 mt-0.5">
              Build international communication fluency to read 10-K filings, write analysis reports, and ace English interviews.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="px-4 py-2.5 rounded-xl bg-[#F8F9FA] border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 block">Current IELTS</span>
              <select
                value={english.currentLevel}
                onChange={(e) => handleUpdateLevel(e.target.value)}
                className="text-lg font-bold text-[#172B4D] bg-transparent focus:outline-none tabular-nums"
              >
                {[4.5, 5.0, 5.5, 6.0, 6.5, 7.0, 7.5, 8.0].map((lvl) => (
                  <option key={lvl} value={lvl}>Band {lvl.toFixed(1)}</option>
                ))}
              </select>
            </div>
            <div className="px-4 py-2.5 rounded-xl bg-[#A3B18A]/20 border border-[#A3B18A]/40">
              <span className="text-[11px] font-semibold text-[#3A5A40] block">Target Score</span>
              <span className="text-lg font-bold text-[#172B4D] tabular-nums">Band {english.targetLevel.toFixed(1)}</span>
            </div>
            <div className="px-4 py-2.5 rounded-xl bg-[#F8F9FA] border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 block">Logged Practice</span>
              <span className="text-lg font-bold text-[#172B4D] tabular-nums">{totalEnglishHours} hrs</span>
            </div>
            <div className="px-4 py-2.5 rounded-xl bg-[#F8F9FA] border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 block">Saved Terms</span>
              <span className="text-lg font-bold text-[#588157] tabular-nums">{english.vocabulary.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 6 Skill Modules Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {english.skills.map((s) => {
          const pct = Math.min(100, Math.round((s.current / s.target) * 100));
          return (
            <div key={s.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-base font-bold text-[#172B4D]">{s.name}</h3>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-[#172B4D] text-white tabular-nums">
                    {s.current.toFixed(1)} / {s.target.toFixed(1)}
                  </span>
                </div>
                <ProgressBar percentage={pct} height="h-2" colorClass="bg-[#588157]" />
                <p className="text-xs text-slate-600 mt-3 leading-relaxed">{s.notes}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1">
                  <span className="text-slate-500">Band:</span>
                  <button
                    onClick={() => handleAdjustSkillScore(s.id, 'current', -0.5)}
                    className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 font-bold"
                  >
                    -0.5
                  </button>
                  <button
                    onClick={() => handleAdjustSkillScore(s.id, 'current', 0.5)}
                    className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 font-bold"
                  >
                    +0.5
                  </button>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-500 tabular-nums">{s.hours}h</span>
                  <button
                    onClick={() => handleAdjustSkillScore(s.id, 'hours', 1)}
                    className="px-2 py-0.5 rounded bg-[#A3B18A]/25 text-[#3A5A40] font-semibold hover:bg-[#A3B18A]/40"
                  >
                    +1h
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress Chart + Practice History */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Visual Comparison Chart */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <h3 className="text-base font-bold text-[#172B4D]">Current vs. Target Band Chart</h3>
          <p className="text-xs text-slate-500 mt-0.5 mb-5">Visual gap analysis across all 6 English modules</p>

          <div className="space-y-4">
            {english.skills.map((s) => {
              const currentPct = Math.round((s.current / 9) * 100);
              const targetPct = Math.round((s.target / 9) * 100);
              return (
                <div key={s.id}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-semibold text-[#172B4D]">{s.name}</span>
                    <span className="text-slate-500 tabular-nums">
                      Current {s.current.toFixed(1)} → Target {s.target.toFixed(1)}
                    </span>
                  </div>
                  <div className="relative h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="absolute inset-y-0 left-0 bg-[#A3B18A]/35 rounded-full"
                      style={{ width: `${targetPct}%` }}
                    />
                    <div
                      className="absolute inset-y-0 left-0 bg-[#172B4D] rounded-full transition-all duration-500"
                      style={{ width: `${currentPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100 flex items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-[#172B4D]" /> Current Band
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-[#A3B18A]/50" /> Target Band
            </span>
          </div>
        </div>

        {/* Practice History Log */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col">
          <h3 className="text-base font-bold text-[#172B4D]">Practice History</h3>
          <p className="text-xs text-slate-500 mt-0.5 mb-4">Log IELTS mock tests, reading sessions, and finance report reviews</p>

          <form onSubmit={handleAddPracticeLog} className="grid grid-cols-1 sm:grid-cols-12 gap-2 mb-4 p-3 rounded-xl bg-[#F8F9FA] border border-slate-200">
            <select
              value={practiceModule}
              onChange={(e) => setPracticeModule(e.target.value)}
              className="sm:col-span-3 px-2.5 py-2 text-xs font-medium rounded-lg border border-slate-200 bg-white"
            >
              {english.skills.map((s) => (
                <option key={s.id} value={s.name}>{s.name}</option>
              ))}
            </select>
            <input
              type="text"
              required
              placeholder="Score or duration (e.g., Band 6.5)"
              value={practiceScore}
              onChange={(e) => setPracticeScore(e.target.value)}
              className="sm:col-span-3 px-2.5 py-2 text-xs rounded-lg border border-slate-200 bg-white"
            />
            <input
              type="text"
              placeholder="Key takeaway..."
              value={practiceNotes}
              onChange={(e) => setPracticeNotes(e.target.value)}
              className="sm:col-span-4 px-2.5 py-2 text-xs rounded-lg border border-slate-200 bg-white"
            />
            <button
              type="submit"
              className="sm:col-span-2 py-2 px-3 rounded-lg bg-[#172B4D] text-white text-xs font-semibold hover:bg-[#1E3A66]"
            >
              Log
            </button>
          </form>

          <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
            {english.practiceHistory.map((item) => (
              <div key={item.id} className="p-3 rounded-xl border border-slate-200/80 flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#172B4D]">{item.module}</span>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-[#A3B18A]/20 text-[#3A5A40]">
                      {item.scoreOrDuration}
                    </span>
                    <span className="text-[11px] text-slate-400">{item.date}</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">{item.notes}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Interactive Vocabulary Notebook */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
          <div>
            <h3 className="text-lg font-bold text-[#172B4D]">Vocabulary Notebook</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Save high-frequency Financial English terminology and Academic IELTS vocabulary.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={vocabSearch}
                onChange={(e) => setVocabSearch(e.target.value)}
                placeholder="Search terms..."
                className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-[#F8F9FA]"
              />
            </div>
            {['All', 'Financial English', 'General IELTS'].map((cat) => (
              <button
                key={cat}
                onClick={() => setVocabFilter(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                  vocabFilter === cat ? 'bg-[#172B4D] text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Add Vocabulary Form */}
        <form onSubmit={handleAddVocabulary} className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 p-4 rounded-xl bg-[#F8F9FA] border border-slate-200 mb-5">
          <input
            type="text"
            required
            placeholder="Term (e.g., Liquidity)"
            value={newTerm}
            onChange={(e) => setNewTerm(e.target.value)}
            className="sm:col-span-2 px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white font-medium"
          />
          <select
            value={newTermCat}
            onChange={(e) => setNewTermCat(e.target.value)}
            className="sm:col-span-2 px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white"
          >
            <option value="Financial English">Financial English</option>
            <option value="General IELTS">General IELTS</option>
          </select>
          <input
            type="text"
            required
            placeholder="Clear definition..."
            value={newTermDef}
            onChange={(e) => setNewTermDef(e.target.value)}
            className="sm:col-span-3 px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white"
          />
          <input
            type="text"
            placeholder="Example sentence in context..."
            value={newTermEx}
            onChange={(e) => setNewTermEx(e.target.value)}
            className="sm:col-span-3 px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white"
          />
          <button
            type="submit"
            className="sm:col-span-2 py-2 px-3 rounded-lg bg-[#172B4D] text-white text-xs font-semibold hover:bg-[#1E3A66]"
          >
            + Save Term
          </button>
        </form>

        {/* Vocabulary Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVocab.map((v) => (
            <div
              key={v.id}
              className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                v.mastered ? 'bg-emerald-50/30 border-emerald-200/80' : 'bg-white border-slate-200'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      {v.category}
                    </span>
                    <h4 className="text-base font-bold text-[#172B4D]">{v.term}</h4>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => toggleVocabMastered(v.id)}
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                        v.mastered
                          ? 'bg-[#588157] text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {v.mastered ? 'Mastered' : 'Learning'}
                    </button>
                    <button
                      onClick={() => deleteVocab(v)}
                      className="p-1 text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-slate-700 mt-2 leading-relaxed">{v.definition}</p>
              </div>
              {v.example && (
                <p className="text-[11px] italic text-slate-500 mt-3 pt-2 border-t border-slate-100">
                  &ldquo;{v.example}&rdquo;
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MODULE G: INTERNSHIP READINESS & TARGET ROLES
// ============================================================================
function InternshipReadinessView({ appData, metrics, updateAppData, requestDelete, showToast }) {
  const [newCriterion, setNewCriterion] = useState('');
  const [newCriterionNote, setNewCriterionNote] = useState('');

  const toggleReadinessItem = (id) => {
    updateAppData((prev) => ({
      ...prev,
      readiness: prev.readiness.map((r) => (r.id === id ? { ...r, completed: !r.completed } : r))
    }));
  };

  const handleAddCriterion = (e) => {
    e.preventDefault();
    if (!newCriterion.trim()) return;
    const item = {
      id: `r-${Date.now()}`,
      label: newCriterion.trim(),
      completed: false,
      category: 'Custom',
      note: newCriterionNote.trim() || 'Added personal readiness goal'
    };
    updateAppData((prev) => ({
      ...prev,
      readiness: [...prev.readiness, item]
    }));
    setNewCriterion('');
    setNewCriterionNote('');
    showToast('Added readiness requirement.');
  };

  const deleteReadinessItem = (item) => {
    requestDelete(
      'Remove Readiness Requirement?',
      `Remove "${item.label}" from your internship readiness checklist?`,
      () => {
        updateAppData((prev) => ({
          ...prev,
          readiness: prev.readiness.filter((r) => r.id !== item.id)
        }));
        showToast('Item removed.');
      }
    );
  };

  return (
    <div className="space-y-6">
      {/* Header & Readiness Score Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-8">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#A3B18A]/25 text-[#3A5A40] mb-2">
              <GraduationCap className="w-3.5 h-3.5" />
              Year 2 Internship Readiness Assessment
            </span>
            <h2 className="text-2xl font-bold text-[#172B4D]">Internship Readiness Tracker</h2>
            <p className="text-sm text-slate-600 mt-1">
              Complete all 10 core technical, portfolio, and career preparation milestones before submitting your Year 2 applications.
            </p>
            <div className="mt-4">
              <div className="flex justify-between text-xs font-semibold mb-1.5">
                <span className="text-slate-600">
                  Completed Requirements: {metrics.readinessDone} of {metrics.readinessTotal}
                </span>
                <span className="text-[#588157] tabular-nums">{metrics.readinessPct}% Ready</span>
              </div>
              <ProgressBar percentage={metrics.readinessPct} height="h-3" colorClass="bg-[#588157]" />
            </div>
          </div>

          <div className="lg:col-span-4 flex flex-col items-center justify-center p-5 rounded-2xl bg-[#172B4D] text-white text-center">
            <span className="text-xs uppercase tracking-wider text-[#A3B18A] font-semibold">
              Readiness Score
            </span>
            <div className="text-4xl font-bold tabular-nums my-1">{metrics.readinessPct}%</div>
            <p className="text-xs text-slate-300">
              {metrics.readinessPct >= 80
                ? 'Strong candidate profile! Ready to apply.'
                : metrics.readinessPct >= 50
                ? 'Solid foundation — finish projects & CV next.'
                : 'Building core technical & English skills.'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Split: Interactive Checklist + Suggested Job Titles */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Readiness Checklist */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-[#172B4D]">Core Readiness Checklist</h3>

          <div className="space-y-2.5">
            {appData.readiness.map((item) => (
              <div
                key={item.id}
                className={`p-3.5 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                  item.completed
                    ? 'bg-emerald-50/40 border-emerald-200/80'
                    : 'bg-white border-slate-200 hover:border-[#A3B18A]'
                }`}
              >
                <button
                  onClick={() => toggleReadinessItem(item.id)}
                  className="flex items-start gap-3 text-left flex-1 min-w-0"
                >
                  {item.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-[#588157] shrink-0 mt-0.5" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-300 shrink-0 mt-0.5" />
                  )}
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`text-sm font-semibold ${
                          item.completed ? 'text-slate-500 line-through' : 'text-[#172B4D]'
                        }`}
                      >
                        {item.label}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                        {item.category}
                      </span>
                    </div>
                    {item.note && <p className="text-xs text-slate-500 mt-1">{item.note}</p>}
                  </div>
                </button>
                <button
                  onClick={() => deleteReadinessItem(item)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 shrink-0"
                  title="Remove"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Add Custom Criterion */}
          <form onSubmit={handleAddCriterion} className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              placeholder="Add custom requirement (e.g., Complete 2 mock interviews)..."
              value={newCriterion}
              onChange={(e) => setNewCriterion(e.target.value)}
              className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200"
            />
            <input
              type="text"
              placeholder="Note (optional)"
              value={newCriterionNote}
              onChange={(e) => setNewCriterionNote(e.target.value)}
              className="sm:w-44 px-3 py-2 text-xs rounded-xl border border-slate-200"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-[#172B4D] text-white text-xs font-semibold hover:bg-[#1E3A66]"
            >
              + Add
            </button>
          </form>
        </div>

        {/* Suggested Target Job Titles */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center gap-2 mb-1">
              <Briefcase className="w-4 h-4 text-[#588157]" />
              <h3 className="text-base font-bold text-[#172B4D]">Target Internship Roles</h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Recommended Year 2 internship titles aligned with your Financial Analysis major
            </p>

            <div className="space-y-3">
              {SUGGESTED_ROLES.map((role, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-[#F8F9FA] border border-slate-200/90 hover:border-[#A3B18A] transition-colors"
                >
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-sm font-bold text-[#172B4D]">{role.title}</h4>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-[#A3B18A]/25 text-[#3A5A40] tabular-nums">
                      {role.matchWeight}% Track Fit
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{role.focus}</p>
                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    {role.keySkills.map((sk, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded text-[10px] font-semibold bg-white border border-slate-200 text-slate-700"
                      >
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// AUTHENTICATION & STORAGE SETTINGS MODAL (FIREBASE + SUPABASE OPTION)
// ============================================================================
function AuthSettingsModal({
  isOpen,
  onClose,
  user,
  isGuest,
  syncStatus,
  supabaseConfig,
  setSupabaseConfig,
  showToast,
  onResetDemo
}) {
  const [mode, setMode] = useState('login'); // 'login' | 'register' | 'supabase'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [authError, setAuthError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [sbUrl, setSbUrl] = useState(supabaseConfig.url || '');
  const [sbKey, setSbKey] = useState(supabaseConfig.anonKey || '');

  if (!isOpen) return null;

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setAuthError('');
    if (!auth) {
      setAuthError('Cloud auth service is not configured in this sandbox; local storage remains active.');
      return;
    }
    setSubmitting(true);
    try {
      if (mode === 'register') {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        if (fullName.trim()) {
          await updateProfile(cred.user, { displayName: fullName.trim() });
        }
        showToast('Account created & synced to cloud!');
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        showToast('Signed in successfully!');
      }
      onClose();
    } catch (err) {
      setAuthError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
      await signInAnonymously(auth);
      showToast('Signed out. Switched to Guest / Browser Storage mode.');
      onClose();
    } catch (err) {
      setAuthError(err.message);
    }
  };

  const handleSaveSupabase = (e) => {
    e.preventDefault();
    const nextCfg = {
      url: sbUrl.trim(),
      anonKey: sbKey.trim(),
      connected: Boolean(sbUrl.trim() && sbKey.trim())
    };
    setSupabaseConfig(nextCfg);
    try {
      localStorage.setItem('faj_supabase_cfg', JSON.stringify(nextCfg));
    } catch {}
    showToast(
      nextCfg.connected
        ? 'Supabase credentials saved! Hybrid sync enabled.'
        : 'Supabase configuration cleared.'
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#588157]" />
            <h3 className="text-lg font-bold text-[#172B4D]">Account & Data Sync</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Sync Status Box */}
        <div className="p-3.5 rounded-xl bg-[#F8F9FA] border border-slate-200 mb-4 text-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium">Current Storage Status:</span>
            <span className="font-bold text-[#172B4D]">
              {syncStatus === 'cloud' && !isGuest
                ? 'Cloud Synced (Private User Vault)'
                : 'Local Browser Storage'}
            </span>
          </div>
          {user && !isGuest && (
            <div className="text-slate-600 truncate">Signed in as: {user.email}</div>
          )}
        </div>

        {/* Mode Switcher Tabs */}
        <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-xl mb-4 text-xs font-semibold">
          <button
            onClick={() => {
              setMode('login');
              setAuthError('');
            }}
            className={`py-2 rounded-lg transition-colors ${
              mode === 'login' ? 'bg-white text-[#172B4D] shadow-2xs' : 'text-slate-500'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => {
              setMode('register');
              setAuthError('');
            }}
            className={`py-2 rounded-lg transition-colors ${
              mode === 'register' ? 'bg-white text-[#172B4D] shadow-2xs' : 'text-slate-500'
            }`}
          >
            Register
          </button>
          <button
            onClick={() => {
              setMode('supabase');
              setAuthError('');
            }}
            className={`py-2 rounded-lg transition-colors ${
              mode === 'supabase' ? 'bg-white text-[#172B4D] shadow-2xs' : 'text-slate-500'
            }`}
          >
            Supabase
          </button>
        </div>

        {authError && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
            {authError}
          </div>
        )}

        {mode === 'supabase' ? (
          <form onSubmit={handleSaveSupabase} className="space-y-3">
            <p className="text-xs text-slate-600 leading-relaxed">
              Optionally connect your own Supabase Project URL and Anon Key. When unconfigured, the app automatically uses Cloud Auth / Local Browser Storage.
            </p>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Supabase Project URL</label>
              <input
                type="url"
                value={sbUrl}
                onChange={(e) => setSbUrl(e.target.value)}
                placeholder="https://xyzcompany.supabase.co"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Supabase Anon Public Key</label>
              <input
                type="password"
                value={sbKey}
                onChange={(e) => setSbKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-[#172B4D] hover:bg-[#1E3A66] text-white text-xs font-semibold"
            >
              Save Supabase Configuration
            </button>
          </form>
        ) : user && !isGuest ? (
          <div className="space-y-3">
            <p className="text-xs text-slate-600">
              Your tasks, 12-month roadmap, skills, projects, and IELTS notes are securely saved to your personal account.
            </p>
            <button
              onClick={handleLogout}
              className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        ) : (
          <form onSubmit={handleEmailAuth} className="space-y-3">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Student Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g., Minh Nguyen"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200"
                />
              </div>
            )}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">University / Personal Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@university.edu"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 rounded-xl bg-[#172B4D] hover:bg-[#1E3A66] text-white text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <LogIn className="w-4 h-4 text-[#A3B18A]" />
              <span>{submitting ? 'Please wait...' : mode === 'register' ? 'Create Account' : 'Sign In'}</span>
            </button>
          </form>
        )}

        {/* Reset Sample Data Option */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-500">Need fresh starter templates?</span>
          <button
            type="button"
            onClick={() => {
              onResetDemo();
              onClose();
            }}
            className="text-xs font-semibold text-[#588157] hover:underline"
          >
            Restore Sample Data
          </button>
        </div>
      </div>
    </div>
  );
}