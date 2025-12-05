export interface LenticularSettings {
  lpi: number;
  widthInches: number;
  heightInches: number;
  dpi: number;
  orientation: 'vertical' | 'horizontal';
}

export interface SourceImage {
  file: File;
  url: string;
  name: string;
  id: string;
}

export interface GenerationStatus {
  isGenerating: boolean;
  progress: number;
  error?: string;
}