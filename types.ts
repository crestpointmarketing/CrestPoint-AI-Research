export interface ResearchConfig {
  industry: string;
  focusAreas: string[];
  targetAudience: string;
  geography: string;
  timeHorizon: string;
  reportDepth: string;
  outputLanguage: 'English' | 'Chinese';
  outputFormat: 'Markdown' | 'Word' | 'PPT';
  additionalNotes: string;
}

export type SourceType = 'document' | 'url';

export interface Source {
  id: string;
  type: SourceType;
  name: string; // Filename or Page Title
  content: string; // Extracted text content
  metadata?: {
    size?: string;
    url?: string;
    uploadTime: string;
    status: 'pending' | 'processing' | 'indexed' | 'failed';
  };
}

export interface ReportCitation {
  sourceName: string;
  quote: string;
  pageOrSection?: string;
}

export interface SocialPosts {
  linkedin: string;
  twitter: string; // Thread as a single string with separators or specific format
  facebook: string;
  xiaohongshu: string;
}

export interface VisualAsset {
  platform: 'linkedin' | 'twitter' | 'facebook' | 'xiaohongshu';
  prompt: string;
  overlayText: {
    headline: string;
    subtext?: string;
    listItems?: string[]; // For Xiaohongshu
  };
  imageBase64: string;
}

export interface SocialVisuals {
  linkedin: VisualAsset;
  twitter: VisualAsset;
  facebook: VisualAsset;
  xiaohongshu: VisualAsset;
}

export interface GeneratedReport {
  executiveSummary: string;
  fullReport: string; // Markdown
  keyTakeaways: string[];
  citations: ReportCitation[];
  generationTime: string;
  model: string;
}

export type ViewState = 'input' | 'generating' | 'report' | 'knowledge' | 'sources';