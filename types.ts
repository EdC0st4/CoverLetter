export interface GeneratorOptions {
  candidateName: string;
  jobTitle: string;
  companyName: string;
  tone: 'professional' | 'enthusiastic' | 'formal' | 'match_cv';
  language: string;
}

export interface UploadedFile {
  data: string; // Base64 string without prefix
  mimeType: string;
  name: string;
}

export interface LetterState {
  jobDescription: string;
  cvText: string;
  generatedLetter: string;
  isGenerating: boolean;
  error: string | null;
}

export type JobMode = 'text' | 'url';

export const INITIAL_OPTIONS: GeneratorOptions = {
  candidateName: '',
  jobTitle: '',
  companyName: '',
  tone: 'professional',
  language: 'English',
};
