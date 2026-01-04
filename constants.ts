import { Box, TrendingUp, Cpu, Scale, Briefcase, DollarSign, AlertTriangle } from "lucide-react";

export const FOCUS_AREAS = [
  { id: 'market_size', label: 'Market Size & Growth', icon: TrendingUp },
  { id: 'competitive', label: 'Competitive Landscape', icon: Box },
  { id: 'tech_trends', label: 'Technology Trends', icon: Cpu },
  { id: 'policy', label: 'Policy & Regulation', icon: Scale },
  { id: 'business_models', label: 'Business Models', icon: Briefcase },
  { id: 'investment', label: 'Investment Opps', icon: DollarSign },
  { id: 'risks', label: 'Risks & Challenges', icon: AlertTriangle },
];

export const TARGET_AUDIENCES = [
  "Executive Management",
  "Investors / VCs",
  "Strategy Team",
  "Marketing Team",
  "Product Team",
  "General Public"
];

export const GEOGRAPHIES = [
  "Global",
  "North America (US/Canada)",
  "Europe (EMEA)",
  "Asia Pacific (APAC)",
  "China",
  "Latin America",
  "Emerging Markets"
];

export const TIME_HORIZONS = [
  "Current State (Snapshot)",
  "Retrospective (Last 12-24 Months)",
  "Near Term (1-2 Years)",
  "Strategic Outlook (3-5 Years)",
  "Long Term Vision (5+ Years)"
];

export const REPORT_DEPTHS = [
  "Brief Overview (2-3 pages)",
  "Standard Analysis (5-10 pages)",
  "Deep Dive Professional (15+ pages)"
];

export const INITIAL_RESEARCH_CONFIG = {
  industry: '',
  focusAreas: [],
  targetAudience: 'Executive Management',
  geography: 'Global',
  timeHorizon: 'Strategic Outlook (3-5 Years)',
  reportDepth: 'Standard Analysis (5-10 pages)',
  outputLanguage: 'English' as const,
  outputFormat: 'Markdown' as const,
  additionalNotes: ''
};
