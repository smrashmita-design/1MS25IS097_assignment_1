import React, { useState } from 'react';
import { 
  Search, 
  Trash2, 
  ExternalLink, 
  Calendar, 
  FileText, 
  ArrowRight,
  History,
  AlertCircle,
  FileSearch
} from 'lucide-react';
import { HistoryItem, ResearchAnalysisResult } from '../types/research.js';

interface HistoryViewProps {
  historyItems: HistoryItem[];
  onSelectAnalysis: (result: ResearchAnalysisResult) => void;
  onDeleteHistoryItem: (id: string, e: React.MouseEvent) => void;
  onClearAllHistory: () => void;
  onNavigateNewAnalysis: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  historyItems,
  onSelectAnalysis,
  onDeleteHistoryItem,
  onClearAllHistory,
  onNavigateNewAnalysis
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Filter history based on search query
  const filtered = historyItems.filter((item) => {
    const query = searchQuery.toLowerCase();
    const titleMatch = (item.paperTitle || '').toLowerCase().includes(query);
    const urlMatch = (item.paperUrl || '').toLowerCase().includes(query);
    const summaryMatch = (item.results?.coreConcepts?.summary || '').toLowerCase().includes(query);
    return titleMatch || urlMatch || summaryMatch;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in pb-16">
      {/* Header with Title and Clear Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <History className="w-7 h-7 text-blue-600 dark:text-blue-400" />
            <span>Research Paper History</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Reopen, search, or export previously analyzed research papers stored in your browser session.
          </p>
        </div>

        {historyItems.length > 0 && (
          <div>
            {!showClearConfirm ? (
              <button
                onClick={() => setShowClearConfirm(true)}
                className="px-3.5 py-2 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl border border-red-200 dark:border-red-900 transition-colors cursor-pointer"
              >
                Clear All History
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    onClearAllHistory();
                    setShowClearConfirm(false);
                  }}
                  className="px-3 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg cursor-pointer"
                >
                  Yes, Clear All
                </button>
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Search Filter Bar */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search history by paper title, URL, or keyword..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-sm shadow-xs"
        />
        <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>

      {/* History Items List */}
      {historyItems.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <FileSearch className="w-7 h-7" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white text-base">
            No research papers stored yet
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
            Every paper you analyze with ResearchLens AI is safely stored in local browser storage for instantaneous retrieval.
          </p>
          <button
            onClick={onNavigateNewAnalysis}
            className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md cursor-pointer"
          >
            Start Your First Analysis
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-8 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
          <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-1" />
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            No matching papers found for &ldquo;{searchQuery}&rdquo;
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Try adjusting your search terms or clear the filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectAnalysis(item.results)}
              className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 shadow-xs hover:shadow-md transition-all cursor-pointer group space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-900">
                    {item.sourceType.replace('_', ' ')}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(item.analysisDate).toLocaleDateString()} at {new Date(item.analysisDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => onDeleteHistoryItem(item.id, e)}
                    className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Delete paper"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    Reopen Analysis <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>

              <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {item.paperTitle}
              </h3>

              {item.results?.coreConcepts?.summary && (
                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {item.results.coreConcepts.summary}
                </p>
              )}

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-400">
                <span className="truncate max-w-md">{item.paperUrl}</span>
                <span className="font-mono text-[11px] text-blue-600 dark:text-blue-400">
                  {item.results?.futureWork?.length || 3} Student Extensions
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
