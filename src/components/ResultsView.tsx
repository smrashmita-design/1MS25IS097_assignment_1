import React, { useState } from 'react';
import { 
  BookOpen, 
  Layers, 
  Lightbulb, 
  Binary, 
  Cpu, 
  ExternalLink, 
  Share2, 
  ArrowLeft,
  Calendar,
  Users,
  Compass,
  FileCheck,
  CheckCircle2,
  Code,
  Sparkles,
  HelpCircle,
  FileText
} from 'lucide-react';
import { ResearchAnalysisResult, FutureWorkItem } from '../types/research.js';
import { MermaidDiagram } from './MermaidDiagram.js';
import { ExportButtons } from './ExportButtons.js';

interface ResultsViewProps {
  result: ResearchAnalysisResult;
  isDark: boolean;
  onBack: () => void;
  onRegenerateDiagram?: (instruction?: string) => Promise<void>;
  isRegeneratingDiagram?: boolean;
  /** Called when the diagram source had to be repaired to render. */
  onMermaidRepaired?: (code: string) => void;
}

export const ResultsView: React.FC<ResultsViewProps> = ({
  result,
  isDark,
  onBack,
  onRegenerateDiagram,
  isRegeneratingDiagram,
  onMermaidRepaired
}) => {
  const [activeTab, setActiveTab] = useState<string>('all');

  const tabs = [
    { id: 'all', label: 'Complete Report' },
    { id: 'overview', label: '1. Paper Overview' },
    { id: 'concepts', label: '2. Core Concept' },
    { id: 'problem', label: '3. Problem Statement' },
    { id: 'methodology', label: '4. Methodology' },
    { id: 'algorithms', label: '5. Algorithms & Contributions' },
    { id: 'flowchart', label: '6. Architecture Flowchart' },
    { id: 'future-work', label: '7. Future Work & Internships' },
    { id: 'tech-stack', label: '8. Recommended Tech Stack' },
    { id: 'references', label: '9. References & Sources' }
  ];

  // Difficulty badge colors
  const getDifficultyBadge = (difficulty: string) => {
    const diff = (difficulty || '').toLowerCase();
    if (diff.includes('beginner')) {
      return 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
    }
    if (diff.includes('advanced')) {
      return 'bg-purple-100 dark:bg-purple-950/50 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800';
    }
    return 'bg-blue-100 dark:bg-blue-950/50 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800';
  };

  // Aggregated tech stacks
  const allTechStacks = Array.from(
    new Set(result.futureWork.flatMap(fw => fw.technologyStack || []))
  );

  return (
    <div className="space-y-6 pb-16 animate-fade-in max-w-6xl mx-auto">
      {/* Top action row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>

        <div className="flex items-center gap-3">
          <ExportButtons result={result} />
        </div>
      </div>

      {/* Hero Header Card */}
      <div className="p-6 md:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-linear-to-bl from-blue-500/10 via-indigo-500/5 to-transparent rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
              Computer Science Research Extraction
            </span>
            {result.paper.year && (
              <span className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                <Calendar className="w-3.5 h-3.5" />
                {result.paper.year}
              </span>
            )}
            <span className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 capitalize">
              Source: {result.metadata.sourceType.replace('_', ' ')}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
            {result.paper.title}
          </h1>

          {result.paper.authors && result.paper.authors.length > 0 && (
            <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              <Users className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
              <span className="font-medium">{result.paper.authors.join(', ')}</span>
            </div>
          )}

          {result.paper.url && (
            <div className="pt-1">
              <a
                href={result.paper.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
              >
                <span>Original Research Paper URL: {result.paper.url}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Custom Question Q&A Banner (if provided) */}
      {result.customQuestion && (
        <div className="p-6 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/60 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 mb-2">
            <HelpCircle className="w-4 h-4" />
            <span>Custom Research Question Analysis</span>
          </div>
          <p className="font-semibold text-slate-900 dark:text-white text-sm md:text-base mb-2">
            &ldquo;{result.customQuestion}&rdquo;
          </p>
          <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-white/60 dark:bg-slate-900/60 p-4 rounded-xl border border-indigo-100 dark:border-indigo-950">
            {result.customAnswer || 'Extracted answer based on paper content and system pipeline.'}
          </div>
        </div>
      )}

      {/* Tabs navigation */}
      <div className="flex items-center gap-1 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800 scrollbar-none">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3.5 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Sections rendering */}
      <div className="space-y-8">
        {/* 1. Paper Overview */}
        {(activeTab === 'all' || activeTab === 'overview') && (
          <section className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              <BookOpen className="w-4 h-4" />
              <span>Section 1: Paper Overview & Abstract</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Paper Abstract</h3>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-950/50 p-5 rounded-xl border border-slate-100 dark:border-slate-800 font-serif italic">
              {result.paper.abstract || 'No abstract text available in source.'}
            </p>
          </section>
        )}

        {/* 2. Core Concept Extraction */}
        {(activeTab === 'all' || activeTab === 'concepts') && (
          <section className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                <Sparkles className="w-4 h-4" />
                <span>Section 2: Core Concept Extraction (Student-Friendly Summary)</span>
              </div>
              <span className="text-[11px] px-2 py-0.5 rounded font-medium bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                &lt; 300 words
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Conceptual Summary</h3>
            <div className="text-sm md:text-base text-slate-800 dark:text-slate-200 leading-relaxed bg-blue-50/50 dark:bg-blue-950/30 p-6 rounded-xl border border-blue-100 dark:border-blue-900/60">
              {result.coreConcepts.summary}
            </div>
          </section>
        )}

        {/* 3. Problem Statement */}
        {(activeTab === 'all' || activeTab === 'problem') && (
          <section className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              <Lightbulb className="w-4 h-4" />
              <span>Section 3: Problem Statement</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">What Problem Does This Address & Why It Matters</h3>
            <p className="text-sm md:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
              {result.coreConcepts.problemStatement}
            </p>
          </section>
        )}

        {/* 4. Proposed Methodology */}
        {(activeTab === 'all' || activeTab === 'methodology') && (
          <section className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              <Layers className="w-4 h-4" />
              <span>Section 4: Proposed Methodology</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Primary Technical Solution</h3>
            <p className="text-sm md:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
              {result.coreConcepts.methodology}
            </p>
          </section>
        )}

        {/* 5. Algorithms and Technical Contributions */}
        {(activeTab === 'all' || activeTab === 'algorithms') && (
          <section className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              <Binary className="w-4 h-4" />
              <span>Section 5: Algorithms & Key Technical Contributions</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Mathematical & Algorithmic Breakthroughs</h3>
            
            {result.coreConcepts.keyBreakthroughs && result.coreConcepts.keyBreakthroughs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {result.coreConcepts.keyBreakthroughs.map((item, idx) => (
                  <div 
                    key={idx}
                    className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-2"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 text-xs font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                        Breakthrough #{idx + 1}
                      </h4>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed pl-8">
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500">No explicit algorithmic breakthroughs enumerated.</p>
            )}
          </section>
        )}

        {/* 6. Architecture Flowchart */}
        {(activeTab === 'all' || activeTab === 'flowchart') && (
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              <Cpu className="w-4 h-4" />
              <span>Section 6: Architecture Flowchart (Mermaid.js)</span>
            </div>
            <MermaidDiagram
              architecture={result.architecture}
              paperTitle={result.paper.title}
              isDark={isDark}
              onRegenerateDiagram={onRegenerateDiagram}
              isRegenerating={isRegeneratingDiagram}
              onMermaidRepaired={onMermaidRepaired}
            />
          </section>
        )}

        {/* 7. Future Work & Internship Opportunities */}
        {(activeTab === 'all' || activeTab === 'future-work') && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                <Compass className="w-4 h-4" />
                <span>Section 7: Future Work & Student Extension Projects</span>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                3 Concrete Resume Projects
              </span>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {result.futureWork.map((project: FutureWorkItem, idx: number) => (
                <div
                  key={idx}
                  className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 relative overflow-hidden"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                          Project #{idx + 1}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${getDifficultyBadge(project.difficulty)}`}>
                          {project.difficulty}
                        </span>
                      </div>
                      <h4 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                        {project.title}
                      </h4>
                    </div>

                    <div className="text-right">
                      <span className="text-[11px] uppercase font-semibold text-slate-400 block">Target Metric</span>
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-md border border-emerald-200 dark:border-emerald-900 inline-block">
                        {project.targetMetric}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
                    <div className="space-y-1">
                      <span className="font-bold text-slate-900 dark:text-white">Technical Extension:</span>
                      <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{project.extension}</p>
                    </div>

                    <div className="space-y-1">
                      <span className="font-bold text-slate-900 dark:text-white">Problem Solved:</span>
                      <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{project.problemSolved}</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800/80 space-y-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider block">
                      Implementation Approach
                    </span>
                    <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                      {project.implementationApproach}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 space-y-1.5">
                    <span className="text-xs font-bold text-blue-900 dark:text-blue-300 uppercase tracking-wider flex items-center gap-1.5">
                      <FileCheck className="w-3.5 h-3.5" />
                      Portfolio & Internship Interview Demonstration
                    </span>
                    <p className="text-xs sm:text-sm text-blue-950 dark:text-blue-200 leading-relaxed">
                      {project.portfolioDemonstration}
                    </p>
                  </div>

                  {/* Tech stack pills */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-xs font-semibold text-slate-400 mr-2">Tech Stack:</span>
                    {project.technologyStack && project.technologyStack.map((tech, tIdx) => (
                      <span
                        key={tIdx}
                        className="px-2.5 py-1 text-xs font-mono font-medium rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 8. Recommended Technology Stack */}
        {(activeTab === 'all' || activeTab === 'tech-stack') && (
          <section className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              <Code className="w-4 h-4" />
              <span>Section 8: Recommended Technology Stack</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Frameworks & Libraries for Extension</h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Recommended development tools and ecosystems for replicating and extending this research:
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              {allTechStacks.map((tech, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>{tech}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 9. References and Sources */}
        {(activeTab === 'all' || activeTab === 'references') && (
          <section className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              <FileText className="w-4 h-4" />
              <span>Section 9: References and Sources</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Academic Citations</h3>
            
            {Array.isArray(result.references) && result.references.length > 0 ? (
              <div className="space-y-3 pt-2">
                {result.references.map((ref: any, idx: number) => {
                  const isObj = typeof ref === 'object';
                  return (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/70 text-xs sm:text-sm space-y-1"
                    >
                      <div className="flex items-start gap-2">
                        <span className="font-mono text-slate-400 font-bold shrink-0">[{idx + 1}]</span>
                        <div className="space-y-0.5">
                          <p className="font-semibold text-slate-900 dark:text-white">
                            {isObj ? ref.title : ref}
                          </p>
                          {isObj && (
                            <p className="text-slate-500 dark:text-slate-400 text-xs">
                              {ref.authors && <span>{ref.authors} </span>}
                              {ref.year && <span>({ref.year}) </span>}
                              {ref.citation && <span>— {ref.citation}</span>}
                            </p>
                          )}
                          {isObj && ref.relevance && (
                            <p className="text-xs text-blue-600 dark:text-blue-400 italic">
                              Relevance: {ref.relevance}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-500">Citations extracted directly from the paper body.</p>
            )}

            {result.supplementaryResearchNotes && (
              <div className="p-4 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-900 dark:text-amber-200 mt-4">
                <span className="font-bold block mb-1">Supplementary Web Research Note:</span>
                {result.supplementaryResearchNotes}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
};
