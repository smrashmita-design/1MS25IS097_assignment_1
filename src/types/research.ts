export interface PaperInfo {
  title: string;
  authors: string[];
  year: number | null;
  url: string;
  abstract: string;
  venue?: string;
  doi?: string;
}

export interface CoreConcepts {
  problemStatement: string;
  methodology: string;
  keyBreakthroughs: string[];
  summary: string; // Under 300 words, plain accessible student-friendly language
  whyItMatters?: string;
  importantAlgorithms?: string[];
  mainContributions?: string[];
}

export interface ArchitectureData {
  description: string;
  mermaidCode: string;
  limitationNote?: string;
  components?: string[];
}

export interface FutureWorkItem {
  title: string;
  extension: string;
  problemSolved: string;
  implementationApproach: string;
  targetMetric: string; // e.g., latency reduction, memory consumption, inference speed
  technologyStack: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | string;
  portfolioDemonstration: string;
}

export interface ReferenceItem {
  title: string;
  authors?: string;
  year?: number | string;
  citation?: string;
  url?: string;
  relevance?: string;
}

export interface AnalysisMetadata {
  generatedAt: string;
  sourceType: 'pdf_upload' | 'url_fetch' | 'sample_paper';
  modelUsed?: string;
  tokenCountEstimate?: number;
  supplementaryWebResearchUsed?: boolean;
}

export interface ResearchAnalysisResult {
  id: string;
  paper: PaperInfo;
  coreConcepts: CoreConcepts;
  architecture: ArchitectureData;
  futureWork: FutureWorkItem[];
  references: ReferenceItem[] | string[];
  metadata: AnalysisMetadata;
  customQuestion?: string;
  customAnswer?: string;
  supplementaryResearchNotes?: string;
}

export interface HistoryItem {
  id: string;
  paperTitle: string;
  paperUrl: string;
  sourceType: 'pdf_upload' | 'url_fetch' | 'sample_paper';
  analysisDate: string;
  results: ResearchAnalysisResult;
}

export interface ApiStatus {
  configured: boolean;
  model: string;
  message?: string;
  /** False when the backend could not be reached at all. */
  reachable?: boolean;
  /** Where the server loaded the key from (currently always the server env). */
  source?: 'env' | 'missing';
}
