import React from 'react';
import { 
  BookOpen, 
  Cpu, 
  ShieldCheck, 
  Code2, 
  Download, 
  CheckCircle2, 
  Sparkles, 
  Layers, 
  Search, 
  ExternalLink
} from 'lucide-react';
import { EXACT_SYSTEM_PROMPT } from '../data/constants.js';
import { getProjectZipUrl } from '../services/api.js';

interface AboutViewProps {
  onDownloadProjectZip: () => void;
}

export const AboutView: React.FC<AboutViewProps> = ({ onDownloadProjectZip }) => {
  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-fade-in pb-16">
      {/* Title */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900 text-xs font-semibold">
          <BookOpen className="w-3.5 h-3.5" />
          <span>System Documentation & Architecture</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          About ResearchLens AI
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
          An AI-powered Computer Science Research Paper Extractor designed to help undergraduate and graduate students understand complex academic literature, visualize intricate system architectures, and uncover actionable project extensions for their resume.
        </p>
      </div>

      {/* GitHub Submission Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-linear-to-r from-blue-900 via-indigo-900 to-slate-900 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6 border border-blue-800">
        <div className="space-y-2 text-center sm:text-left">
          <span className="px-2.5 py-1 rounded-full bg-blue-400/20 text-blue-300 border border-blue-400/30 text-xs font-bold uppercase tracking-wider">
            GitHub Submission Ready
          </span>
          <h3 className="text-xl font-bold">Download Complete Project Source Code</h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-lg leading-relaxed">
            Download the cleaned repository ZIP archive containing all frontend React components, server-side Gemini SDK code, types, and documentation for submission.
          </p>
        </div>

        <button
          onClick={onDownloadProjectZip}
          className="px-6 py-3.5 rounded-2xl bg-white text-slate-900 hover:bg-slate-100 font-bold text-sm shadow-lg shadow-black/20 flex items-center gap-2 shrink-0 transition-transform active:scale-95 cursor-pointer"
        >
          <Download className="w-4 h-4 text-blue-600" />
          <span>Download Source ZIP</span>
        </button>
      </div>

      {/* Technology Stack Grid */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <Code2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <span>Full-Stack Technology Stack</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
            <span className="font-bold text-blue-600 dark:text-blue-400 block uppercase tracking-wider text-xs">
              Frontend Client
            </span>
            <ul className="space-y-1.5 text-slate-700 dark:text-slate-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span><strong>React 18 + TypeScript:</strong> Modular component architecture</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span><strong>Mermaid.js:</strong> Interactive SVG flowchart rendering & pan/zoom</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span><strong>Tailwind CSS 4:</strong> Navy academic theme with dark mode</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span><strong>Lucide React:</strong> Clean academic and navigation icons</span>
              </li>
            </ul>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
            <span className="font-bold text-indigo-600 dark:text-indigo-400 block uppercase tracking-wider text-xs">
              Server-Side Backend
            </span>
            <ul className="space-y-1.5 text-slate-700 dark:text-slate-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span><strong>Node.js & Express:</strong> High performance REST API endpoints</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span><strong>@google/genai SDK:</strong> Official Google Gen AI SDK integration</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span><strong>Multer & pdf-parse:</strong> Local PDF document stream processing</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span><strong>arXiv API Integration:</strong> Direct academic metadata retrieval</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* AI Research Agent Operational Constraints */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <span>Operational Constraints & Guardrails</span>
        </h2>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0 font-bold">
              1
            </div>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white">Strict Token Efficiency (&lt; 25,000 Tokens)</h4>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed mt-0.5">
                Every uploaded paper and fetched URL is token-budgeted and truncated through intelligent head-and-tail sliding windows to guarantee total execution stays under 25,000 tokens.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 flex items-center justify-center shrink-0 font-bold">
              2
            </div>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white">Google Search Grounding</h4>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed mt-0.5">
                Supplementary web research retrieves recent GitHub repositories and citation metrics while explicitly distinguishing extracted paper facts from external search results.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-lg bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 flex items-center justify-center shrink-0 font-bold">
              3
            </div>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white">Anti-Hallucination & Factual Integrity</h4>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed mt-0.5">
                Temperature is pinned to 0.2 to prevent fabrication of performance metrics, citations, or unsupported architectural claims.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Primary System Prompt Inspection */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Cpu className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>Exact AI Research Agent System Prompt</span>
          </h2>
          <span className="text-xs font-mono text-slate-400">systemInstruction</span>
        </div>

        <div className="rounded-2xl bg-slate-900 text-slate-200 border border-slate-800 p-6 overflow-hidden">
          <pre className="text-xs font-mono overflow-x-auto leading-relaxed whitespace-pre-wrap">
            <code>{EXACT_SYSTEM_PROMPT}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};
