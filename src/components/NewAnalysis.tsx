import React, { useState, useRef } from 'react';
import { 
  FileText, 
  Globe, 
  Upload, 
  HelpCircle, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  FileSearch,
  ArrowRight,
  X,
  FileCode2,
  Cpu
} from 'lucide-react';
import { analyzePaperRequest } from '../services/api.js';
import { ApiStatus, ResearchAnalysisResult } from '../types/research.js';

interface NewAnalysisProps {
  onAnalysisComplete: (result: ResearchAnalysisResult) => void;
  apiStatus: ApiStatus;
}

type InputMode = 'url' | 'pdf';

export const NewAnalysis: React.FC<NewAnalysisProps> = ({
  onAnalysisComplete,
  apiStatus
}) => {
  const [inputMode, setInputMode] = useState<InputMode>('url');
  const [paperUrl, setPaperUrl] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [customQuestion, setCustomQuestion] = useState<string>('');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  
  // Submission & loading state
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadingSteps = [
    'Ingesting academic paper text & document structure...',
    'Synthesizing core problem statement & methodology under 300 words...',
    'Synthesizing mathematical & algorithmic breakthroughs...',
    'Generating syntactically verified Mermaid.js graph TD flowchart...',
    'Formulating 3 concrete student extension projects & technology stacks...'
  ];

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      validateAndSetFile(files[0]);
    }
  };

  const validateAndSetFile = (file: File) => {
    setErrorMessage(null);
    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      setErrorMessage('Unsupported file type. Please upload a PDF document (.pdf).');
      return;
    }

    if (file.size === 0) {
      setErrorMessage('The selected file is empty (0 bytes). Please upload a valid research paper.');
      return;
    }

    if (file.size > 30 * 1024 * 1024) {
      setErrorMessage('File size exceeds 30MB limit. Please upload a smaller paper PDF.');
      return;
    }

    setSelectedFile(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const setExampleUrl = (url: string) => {
    setInputMode('url');
    setPaperUrl(url);
    setSelectedFile(null);
    setErrorMessage(null);
  };

  // Submission handler with comprehensive validation
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // 1. Validate submission empty state
    if (inputMode === 'url' && (!paperUrl || paperUrl.trim().length === 0)) {
      setErrorMessage('Empty submission. Please enter a valid research paper URL or switch to PDF upload.');
      return;
    }

    if (inputMode === 'pdf' && !selectedFile) {
      setErrorMessage('Empty submission. Please drag-and-drop or select a research paper PDF to upload.');
      return;
    }

    // 2. Validate URL format if URL mode
    if (inputMode === 'url') {
      const trimmed = paperUrl.trim();
      const hasValidFormat = /^https?:\/\/.+/i.test(trimmed) || /^(arxiv:|1[0-9]{3}\.[0-9]+)/i.test(trimmed);
      if (!hasValidFormat) {
        setErrorMessage('Invalid URL format. Please provide a valid HTTP or HTTPS academic paper link (e.g. arXiv, OpenReview, Semantic Scholar).');
        return;
      }
    }

    // 3. Submission proceeds regardless of the API key: authentication is
    //    handled entirely by the server (GEMINI_API_KEY in the server .env).

    // Start analysis
    setIsLoading(true);
    setLoadingStep(0);

    // Simulated progress steps for smooth UX
    const interval = setInterval(() => {
      setLoadingStep((prev) => (prev < loadingSteps.length - 1 ? prev + 1 : prev));
    }, 2800);

    try {
      const result = await analyzePaperRequest({
        url: inputMode === 'url' ? paperUrl.trim() : undefined,
        file: inputMode === 'pdf' && selectedFile ? selectedFile : undefined,
        customQuestion: customQuestion.trim() || undefined
      });

      clearInterval(interval);
      onAnalysisComplete(result);
    } catch (err: any) {
      clearInterval(interval);
      setIsLoading(false);
      setErrorMessage(err.message || 'An unexpected failure occurred while analyzing the paper.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-16">
      {/* Title & Introduction */}
      <div className="space-y-2 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Computer Science Research Agent</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Submit Research Paper for AI Extraction
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
          Provide an academic paper URL or upload a local PDF. ResearchLens AI parses technical contributions, generates an architecture flowchart, and formulates student resume extensions.
        </p>
      </div>

      {/* Server Status Notice (API key lives on the server, never in the browser) */}
      {apiStatus.reachable === false && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-xs sm:text-sm text-amber-800 dark:text-amber-300 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold">Backend Server Offline</p>
            <p className="leading-relaxed">
              The ResearchLens API could not be reached. Start the server with{' '}
              <code className="font-mono text-[11px] px-1 py-0.5 rounded bg-amber-100 dark:bg-amber-900/60">npm run server:dev</code>{' '}
              (port 3001) and try again.
            </p>
          </div>
        </div>
      )}

      {apiStatus.reachable !== false && !apiStatus.configured && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-xs sm:text-sm text-amber-800 dark:text-amber-300 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold">Server API Key Not Configured</p>
            <p className="leading-relaxed">
              The Gemini API key is loaded from the server environment only. Add{' '}
              <code className="font-mono text-[11px] px-1 py-0.5 rounded bg-amber-100 dark:bg-amber-900/60">GEMINI_API_KEY</code>{' '}
              to the <code className="font-mono text-[11px] px-1 py-0.5 rounded bg-amber-100 dark:bg-amber-900/60">.env</code> file in the
              project root and restart the backend.
            </p>
          </div>
        </div>
      )}

      {/* Main submission card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
        {/* Mode Selector Tabs */}
        <div className="p-3 bg-slate-50/80 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => {
              setInputMode('url');
              setErrorMessage(null);
            }}
            className={`flex items-center justify-center gap-2.5 py-3 rounded-2xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              inputMode === 'url'
                ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>Option A: Paper URL</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setInputMode('pdf');
              setErrorMessage(null);
            }}
            className={`flex items-center justify-center gap-2.5 py-3 rounded-2xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              inputMode === 'pdf'
                ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Option B: Upload PDF</span>
          </button>
        </div>

        {/* Input Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          {/* Mode A: URL input */}
          {inputMode === 'url' && (
            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Academic Paper URL (arXiv, OpenReview, Direct PDF)
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. https://arxiv.org/abs/1706.03762 or https://arxiv.org/abs/2106.09685"
                  value={paperUrl}
                  onChange={(e) => {
                    setPaperUrl(e.target.value);
                    setErrorMessage(null);
                  }}
                  disabled={isLoading}
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <Globe className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Quick sample link chips */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs text-slate-500 dark:text-slate-400">
                <span className="font-semibold text-slate-600 dark:text-slate-400">Try arXiv:</span>
                <button
                  type="button"
                  onClick={() => setExampleUrl('https://arxiv.org/abs/1706.03762')}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer font-mono text-[11px]"
                >
                  Attention Is All You Need
                </button>
                <button
                  type="button"
                  onClick={() => setExampleUrl('https://arxiv.org/abs/2106.09685')}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer font-mono text-[11px]"
                >
                  LoRA (2106.09685)
                </button>
                <button
                  type="button"
                  onClick={() => setExampleUrl('https://arxiv.org/abs/1512.03385')}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer font-mono text-[11px]"
                >
                  ResNet (1512.03385)
                </button>
              </div>
            </div>
          )}

          {/* Mode B: PDF Drag & Drop */}
          {inputMode === 'pdf' && (
            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Upload Academic Paper PDF
              </label>

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileChange}
                className="hidden"
                disabled={isLoading}
              />

              {!selectedFile ? (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center transition-all cursor-pointer ${
                    isDragging
                      ? 'border-blue-500 bg-blue-50/60 dark:bg-blue-950/40'
                      : 'border-slate-300 dark:border-slate-700 hover:border-blue-400 bg-slate-50/40 dark:bg-slate-950/40'
                  }`}
                >
                  <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-100 dark:border-blue-900">
                    <Upload className="w-7 h-7" />
                  </div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm sm:text-base">
                    Click to browse or drop your research PDF here
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
                    Supports academic papers up to 30MB (.pdf)
                  </p>
                </div>
              ) : (
                <div className="p-5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 dark:text-white text-sm truncate">
                        {selectedFile.name}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • PDF Document
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedFile(null)}
                    disabled={isLoading}
                    className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                    title="Remove file"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Option C: Custom Research Question (Optional) */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                <span>Custom Research Question (Optional)</span>
              </label>
              <span className="text-[11px] text-slate-400">Student inquiry</span>
            </div>
            <textarea
              rows={2}
              placeholder="e.g. How does the multi-head attention mechanism prevent sequence degradation? Or what are the compute limits of training this model?"
              value={customQuestion}
              onChange={(e) => setCustomQuestion(e.target.value)}
              disabled={isLoading}
              className="w-full px-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
            />
          </div>

          {/* Error Message Box */}
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs sm:text-sm text-red-700 dark:text-red-300 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="flex-1 space-y-1">
                <p className="font-semibold">Analysis Notice</p>
                <p className="leading-relaxed">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Loading Progress Box */}
          {isLoading && (
            <div className="p-6 rounded-2xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 space-y-4">
              <div className="flex items-center justify-between text-xs font-bold text-blue-900 dark:text-blue-200">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
                  <span>Agent Analysis in Progress...</span>
                </div>
                <span>Step {loadingStep + 1} of {loadingSteps.length}</span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 rounded-full bg-blue-100 dark:bg-blue-900/50 overflow-hidden">
                <div
                  className="h-full bg-linear-to-r from-blue-600 to-indigo-600 transition-all duration-500 ease-out"
                  style={{ width: `${((loadingStep + 1) / loadingSteps.length) * 100}%` }}
                />
              </div>

              <p className="text-xs text-blue-800 dark:text-blue-300 font-medium">
                {loadingSteps[loadingStep]}
              </p>
            </div>
          )}

          {/* Analyze Paper Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 px-6 rounded-2xl font-bold text-white bg-linear-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 text-sm sm:text-base cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  <span>Processing Research Paper...</span>
                </>
              ) : (
                <>
                  <FileSearch className="w-5 h-5" />
                  <span>Analyze Paper</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Operational Constraints & Feature Notice */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-500 dark:text-slate-400">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
          <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-blue-600" />
            Token Efficient
          </span>
          <p className="leading-relaxed">
            Paper texts are automatically token-budgeted under 25k tokens to guarantee fast, reliable processing.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
          <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <FileCode2 className="w-3.5 h-3.5 text-indigo-600" />
            Mermaid.js Flowchart
          </span>
          <p className="leading-relaxed">
            Strict graph TD architectural flowcharts representing input, processing pipelines, and models.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
          <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Resume Extensions
          </span>
          <p className="leading-relaxed">
            Exactly 3 concrete CS student portfolio projects with difficulty, metrics, and tech stacks.
          </p>
        </div>
      </div>
    </div>
  );
};
