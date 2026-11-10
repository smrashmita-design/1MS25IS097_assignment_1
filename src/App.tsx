import React, { useState, useEffect } from 'react';
import { Sidebar, NavTab } from './components/Sidebar.js';
import { Header } from './components/Header.js';
import { Dashboard } from './components/Dashboard.js';
import { NewAnalysis } from './components/NewAnalysis.js';
import { ResultsView } from './components/ResultsView.js';
import { HistoryView } from './components/HistoryView.js';
import { AboutView } from './components/AboutView.js';
import { ResearchAnalysisResult, HistoryItem, ApiStatus } from './types/research.js';
import { 
  getHistory, 
  saveAnalysisToHistory, 
  deleteHistoryItem, 
  clearAllHistory, 
  getStoredTheme, 
  setStoredTheme 
} from './services/storage.js';
import { checkApiStatus, regenerateDiagramRequest, getProjectZipUrl } from './services/api.js';
import { SAMPLE_PAPERS } from './data/samplePapers.js';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [selectedResult, setSelectedResult] = useState<ResearchAnalysisResult | null>(null);
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [apiStatus, setApiStatus] = useState<ApiStatus>({
    configured: false,
    reachable: false,
    model: 'gemini-2.5-flash'
  });
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isOpenMobile, setIsOpenMobile] = useState<boolean>(false);
  const [isRegeneratingDiagram, setIsRegeneratingDiagram] = useState<boolean>(false);

  // Initialize theme, history, and API status
  useEffect(() => {
    // 1. Theme initialization
    const storedTheme = getStoredTheme();
    setTheme(storedTheme);
    if (storedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // 2. Load stored history
    const storedHistory = getHistory();
    setHistoryItems(storedHistory);

    // 3. Fetch API status from backend (the key itself stays on the server)
    checkApiStatus().then(status => setApiStatus(status));
  }, []);

  // Theme toggle
  const handleToggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    setStoredTheme(nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Analysis completion callback
  const handleAnalysisComplete = (result: ResearchAnalysisResult) => {
    saveAnalysisToHistory(result);
    setHistoryItems(getHistory());
    setSelectedResult(result);
  };

  // Select an analysis (from history or samples)
  const handleSelectAnalysis = (result: ResearchAnalysisResult) => {
    setSelectedResult(result);
  };

  // Delete an item from history
  const handleDeleteHistoryItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = deleteHistoryItem(id);
    setHistoryItems(updated);
    if (selectedResult && selectedResult.id === id) {
      setSelectedResult(null);
    }
  };

  // Clear all history items
  const handleClearAllHistory = () => {
    clearAllHistory();
    setHistoryItems([]);
    setSelectedResult(null);
  };

  // Diagram regeneration
  const handleRegenerateDiagram = async (instruction?: string) => {
    if (!selectedResult) return;
    setIsRegeneratingDiagram(true);

    try {
      const updatedArch = await regenerateDiagramRequest({
        paperTitle: selectedResult.paper.title,
        architectureDescription: selectedResult.architecture.description,
        currentMermaid: selectedResult.architecture.mermaidCode,
        userInstruction: instruction
      });

      const updatedResult: ResearchAnalysisResult = {
        ...selectedResult,
        architecture: updatedArch
      };

      setSelectedResult(updatedResult);
      saveAnalysisToHistory(updatedResult);
      setHistoryItems(getHistory());
    } catch (err: any) {
      alert(`Regeneration failed: ${err.message || 'Please check your API key.'}`);
    } finally {
      setIsRegeneratingDiagram(false);
    }
  };

  // The diagram source was repaired in the browser so it could be rendered.
  // Persist the repaired version so history and exports stay consistent.
  const handleMermaidRepaired = (code: string) => {
    setSelectedResult(prev => {
      if (!prev || prev.architecture.mermaidCode === code) return prev;

      const updated: ResearchAnalysisResult = {
        ...prev,
        architecture: { ...prev.architecture, mermaidCode: code }
      };
      saveAnalysisToHistory(updated);
      setHistoryItems(getHistory());
      return updated;
    });
  };

  // Download complete source code ZIP
  const handleDownloadProjectZip = () => {
    window.location.href = getProjectZipUrl();
  };

  // Navigation tab selection
  const handleSelectTab = (tab: NavTab) => {
    setCurrentTab(tab);
    // If navigating to another tab, exit active single paper view unless it's history
    if (tab !== 'history') {
      setSelectedResult(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#0B1120] text-slate-900 dark:text-slate-100 flex transition-colors duration-200">
      {/* Left Navigation Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        historyCount={historyItems.length}
        isOpenMobile={isOpenMobile}
        onToggleMobile={() => setIsOpenMobile(!isOpenMobile)}
      />

      {/* Main Content Area */}
      <div className="flex-1 md:pl-72 flex flex-col min-h-screen min-w-0">
        {/* Sticky Top Header */}
        <Header
          currentTab={currentTab}
          isAnalyzing={false}
          apiStatus={apiStatus}
          theme={theme}
          onToggleTheme={handleToggleTheme}
          onToggleMobileMenu={() => setIsOpenMobile(!isOpenMobile)}
          onDownloadProjectZip={handleDownloadProjectZip}
        />

        {/* Page Body Viewport */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 lg:p-10">
          {selectedResult ? (
            <ResultsView
              result={selectedResult}
              isDark={theme === 'dark'}
              onBack={() => setSelectedResult(null)}
              onRegenerateDiagram={handleRegenerateDiagram}
              isRegeneratingDiagram={isRegeneratingDiagram}
              onMermaidRepaired={handleMermaidRepaired}
            />
          ) : currentTab === 'dashboard' ? (
            <Dashboard
              onNavigateNewAnalysis={() => setCurrentTab('new-analysis')}
              onSelectAnalysis={handleSelectAnalysis}
              historyItems={historyItems}
              onDeleteHistoryItem={handleDeleteHistoryItem}
              samplePapers={SAMPLE_PAPERS}
              onSelectSamplePaper={handleSelectAnalysis}
            />
          ) : currentTab === 'new-analysis' ? (
            <NewAnalysis
              onAnalysisComplete={handleAnalysisComplete}
              apiStatus={apiStatus}
            />
          ) : currentTab === 'history' ? (
            <HistoryView
              historyItems={historyItems}
              onSelectAnalysis={handleSelectAnalysis}
              onDeleteHistoryItem={handleDeleteHistoryItem}
              onClearAllHistory={handleClearAllHistory}
              onNavigateNewAnalysis={() => setCurrentTab('new-analysis')}
            />
          ) : currentTab === 'about' ? (
            <AboutView onDownloadProjectZip={handleDownloadProjectZip} />
          ) : null}
        </main>
      </div>
    </div>
  );
};

export default App;
