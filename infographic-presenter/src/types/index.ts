export interface Slide {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  imagePrompt?: string;
  layout: 'title' | 'content' | 'image-left' | 'image-right' | 'full-image' | 'chart';
  chartData?: ChartData;
  backgroundColor?: string;
  textColor?: string;
}

export interface ChartData {
  type: 'bar' | 'pie' | 'line';
  labels: string[];
  values: number[];
  colors?: string[];
}

export interface Presentation {
  id: string;
  title: string;
  slides: Slide[];
  theme: Theme;
  createdAt: Date;
  updatedAt: Date;
}

export interface Theme {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  fontFamily: string;
}

export interface ParsedData {
  type: 'text' | 'csv' | 'excel' | 'pdf' | 'image';
  content: string;
  structuredData?: Record<string, unknown>[];
  metadata?: Record<string, string>;
}

export interface GenerateRequest {
  data: ParsedData;
  slideCount?: number;
  template?: string;
  customInstructions?: string;
  theme?: Partial<Theme>;
}

export interface RevisionRequest {
  slideId: string;
  instruction: string;
  currentSlide: Slide;
}

export interface ExportOptions {
  format: 'pptx' | 'svg';
  slideIds?: string[];
}

export const DEFAULT_THEME: Theme = {
  primaryColor: '#3B82F6',
  secondaryColor: '#10B981',
  backgroundColor: '#FFFFFF',
  textColor: '#1F2937',
  fontFamily: 'Inter, sans-serif',
};
