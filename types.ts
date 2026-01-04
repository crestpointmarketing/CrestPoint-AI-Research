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

export interface SocialPostContent {
  title: string;
  content: string;
}

export interface SocialPosts {
  linkedin: SocialPostContent;
  twitter: SocialPostContent; // Thread as a single string
  facebook: SocialPostContent;
  xiaohongshu: SocialPostContent;
}

export interface VisualAsset {
  platform: 'linkedin' | 'twitter' | 'facebook' | 'xiaohongshu';
  prompt: string;
  // Removed overlayText as per new requirements
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