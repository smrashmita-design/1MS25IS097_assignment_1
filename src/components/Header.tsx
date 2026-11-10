import React from 'react';
import { 
  Menu, 
  Key, 
  Sun, 
  Moon, 
  Download, 
  CheckCircle2, 
  AlertCircle
} from 'lucide-react';
import { NavTab } from './Sidebar.js';
import { ApiStatus } from '../types/research.js';

interface HeaderProps {
  currentTab: NavTab;
  isAnalyzing: boolean;
  apiStatus: ApiStatus;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onToggleMobileMenu: () => void;
  onDownloadProjectZip: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  isAnalyzing,
  apiStatus,
  theme,
  onToggleTheme,
  onToggleMobileMenu,
  onDownloadProjectZip
}) => {
  const getTabTitle = (tab: NavTab) => {
    switch (tab) {
      case 'dashboard':
        return 'Research Dashboard';
      case 'new-analysis':
        return 'Submit Paper for AI Extraction';
      case 'history':
        return 'Research History & Archives';
      case 'about':
        return 'About ResearchLens AI';
      default:
        return 'Dashboard';
    }
  };

  // The API key lives only in the server environment, so this is a read-only
  // status indicator (never an input field).
  const isServerReachable = apiStatus.reachable !== false;
  const isGeminiReady = apiStatus.configured && isServerReachable;

  const statusTitle = !isServerReachable
    ? 'Backend server offline. Start it with "npm run server:dev" (port 3001).'
    : isGeminiReady
      ? `Gemini API key loaded from the server .env (${apiStatus.model}). The key is never exposed to the browser.`
      : 'GEMINI_API_KEY is not set on the server. Add it to the .env file in the project root and restart the backend.';

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 md:px-8 flex items-center justify-between transition-colors duration-200">
      {/* Left: Mobile hamburger & breadcrumb title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileMenu}
          className="p-2 -ml-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg md:hidden cursor-pointer"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-base md:text-lg font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>{getTabTitle(currentTab)}</span>
            {isAnalyzing && (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-800 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400"></span>
                Analyzing...
              </span>
            )}
          </h2>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Gemini API Status Pill (read-only - key is server-side only) */}
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
            isGeminiReady
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
              : 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800'
          }`}
          title={statusTitle}
          role="status"
          aria-live="polite"
        >
          <Key className="w-3.5 h-3.5 shrink-0" />
          <span className="hidden sm:inline">
            {isGeminiReady ? 'Gemini API: Ready' : isServerReachable ? 'Server Key Missing' : 'Server Offline'}
          </span>
          {isGeminiReady ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
          )}
        </div>

        {/* Download Source Code ZIP (GitHub Readiness) */}
        <button
          onClick={onDownloadProjectZip}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
          title="Download complete project source ZIP for GitHub repository submission"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Download Code ZIP</span>
        </button>

        {/* Dark Mode Toggle */}
        <button
          onClick={onToggleTheme}
          className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
          aria-label="Toggle Theme"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-600" />
          )}
        </button>
      </div>
    </header>
  );
};
