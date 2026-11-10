import React from 'react';
import { 
  Sparkles, 
  FileSearch, 
  ArrowRight, 
  BookOpen, 
  History, 
  Clock, 
  ExternalLink, 
  ChevronRight,
  Cpu,
  Layers,
  Compass,
  FileCheck2,
  Trash2
} from 'lucide-react';
import { HistoryItem, ResearchAnalysisResult } from '../types/research.js';

interface DashboardProps {
  onNavigateNewAnalysis: () => void;
  onSelectAnalysis: (result: ResearchAnalysisResult) => void;
  historyItems: HistoryItem[];
  onDeleteHistoryItem: (id: string, e: React.MouseEvent) => void;
  samplePapers: ResearchAnalysisResult[];
  onSelectSamplePaper: (paper: ResearchAnalysisResult) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onNavigateNewAnalysis,
  onSelectAnalysis,
  historyItems,
  onDeleteHistoryItem,
  samplePapers,
  onSelectSamplePaper
}) => {
  const totalAnalyzed = historyItems.length;

  return (
    <div className="space-y-10 animate-fade-in max-w-6xl mx-auto pb-16">
      {/* 1. Welcome Hero Section */}
      <div className="relative rounded-3xl bg-linear-to-br from-[#0A192F] via-[#102A4C] to-[#0A192F] text-white p-8 sm:p-12 overflow-hidden shadow-2xl border border-slate-800">
        {/* Glow ambient background elements */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI-Powered Computer Science Paper Extractor</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
            Welcome to <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 via-indigo-300 to-sky-300">ResearchLens AI</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 font-medium">
            Understand research. Visualize innovation. Build the future.
          </p>

          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed pt-1">
            Transform complex academic papers into student-friendly summaries, interactive Mermaid.js system architectures, and concrete resume projects tailored for technical internships.
          </p>

          <div className="pt-4 flex flex-wrap items-center gap-3">
            <button
              onClick={onNavigateNewAnalysis}
              className="px-6 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm sm:text-base shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 transition-all flex items-center gap-2.5 cursor-pointer"
            >
              <FileSearch className="w-5 h-5" />
              <span>Start New Analysis</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Key Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-900">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {totalAnalyzed}
            </span>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Papers Analyzed
            </p>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-100 dark:border-indigo-900">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
              &lt; 25,000
            </span>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Max Tokens per Paper
            </p>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 border border-purple-100 dark:border-purple-900">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
              3 Projects
            </span>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Student Extensions per Paper
            </p>
          </div>
        </div>
      </div>

      {/* 3. How the Application Works (3-step workflow) */}
      <div className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
            How ResearchLens AI Works
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            A three-stage autonomous pipeline designed specifically for university researchers and students.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 relative">
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-bold text-sm flex items-center justify-center">
              1
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Document Ingestion & Grounding
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Accepts research paper URLs (arXiv, OpenReview, direct PDFs) or uploaded PDF files. Paper text is ingested within a strict 25,000-token efficiency boundary with optional Google Search grounding.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 relative">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-bold text-sm flex items-center justify-center">
              2
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Core Concept & Mermaid Architecture
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Gemini synthesizes the problem statement and primary methodology under 300 words, then generates a syntactically pristine Mermaid.js (graph TD) flowchart mapping data preprocessing to final outputs.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 relative">
            <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 font-bold text-sm flex items-center justify-center">
              3
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Student Extensions & Exports
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Brainstorms 3 realistic 3rd-year CS resume projects with target performance metrics, tech stacks, and interview talking points. Downloadable as formatted TXT reports or validated JSON schemas.
            </p>
          </div>
        </div>
      </div>

      {/* 4. Instant Benchmark Sample Papers */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Explore Benchmark Sample Papers</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              One-click demonstration analyses with verified Mermaid architectures and student extensions.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {samplePapers.map((paper) => (
            <div
              key={paper.id}
              onClick={() => onSelectSamplePaper(paper)}
              className="group p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-900">
                    {paper.paper.year}
                  </span>
                  <span className="text-[11px] text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex items-center gap-1 font-semibold">
                    View Analysis <ArrowRight className="w-3 h-3" />
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {paper.paper.title}
                </h3>

                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                  {paper.coreConcepts.summary}
                </p>
              </div>

              <div className="pt-4 mt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                <span>{paper.futureWork.length} Student Projects</span>
                <span className="font-mono text-blue-600 dark:text-blue-400">Mermaid graph TD</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Recently Analyzed Research Papers */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <History className="w-4 h-4 text-slate-500" />
              <span>Recently Analyzed Research Papers</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Locally persisted research analyses in your browser storage.
            </p>
          </div>
          {historyItems.length > 0 && (
            <span className="text-xs text-slate-400 font-medium">
              {historyItems.length} saved
            </span>
          )}
        </div>

        {historyItems.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center">
              <FileSearch className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              No papers analyzed yet in this browser
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Submit your first research paper URL or PDF above, or click one of the benchmark papers to explore the dashboard.
            </p>
            <button
              onClick={onNavigateNewAnalysis}
              className="px-4 py-2 text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-950 rounded-xl transition-colors cursor-pointer"
            >
              Submit a Paper Now
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            {historyItems.slice(0, 5).map((item) => (
              <div
                key={item.id}
                onClick={() => onSelectAnalysis(item.results)}
                className="p-4 sm:p-5 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors flex items-center justify-between gap-4 cursor-pointer group"
              >
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {item.sourceType.replace('_', ' ')}
                    </span>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(item.analysisDate).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {item.paperTitle}
                  </h4>
                  <p className="text-xs text-slate-400 truncate">
                    {item.paperUrl}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={(e) => onDeleteHistoryItem(item.id, e)}
                    className="p-2 text-slate-400 hover:text-red-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Delete from history"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <ChevronRight className="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
