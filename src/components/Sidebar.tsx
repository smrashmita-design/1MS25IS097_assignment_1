import React from 'react';
import { 
  LayoutDashboard, 
  FileSearch, 
  History, 
  Info, 
  Sparkles,
  BookOpen,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';

export type NavTab = 'dashboard' | 'new-analysis' | 'history' | 'about';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  historyCount: number;
  isOpenMobile: boolean;
  onToggleMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  historyCount,
  isOpenMobile,
  onToggleMobile
}) => {
  const navItems = [
    {
      id: 'dashboard' as NavTab,
      label: 'Dashboard',
      icon: LayoutDashboard,
      description: 'Overview & recent analyses'
    },
    {
      id: 'new-analysis' as NavTab,
      label: 'New Analysis',
      icon: FileSearch,
      description: 'Submit PDF or paper URL',
      badge: 'Agent'
    },
    {
      id: 'history' as NavTab,
      label: 'Research History',
      icon: History,
      description: 'Saved analyses & reports',
      count: historyCount
    },
    {
      id: 'about' as NavTab,
      label: 'About & Docs',
      icon: Info,
      description: 'Architecture & methodology'
    }
  ];

  const handleNav = (tab: NavTab) => {
    onSelectTab(tab);
    if (isOpenMobile) onToggleMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 md:hidden"
          onClick={onToggleMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-[#0A192F] text-slate-100 flex flex-col border-r border-slate-800 transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg tracking-tight text-white font-sans">ResearchLens</span>
                <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded">AI</span>
              </div>
              <p className="text-xs text-slate-400">Academic Paper Agent</p>
            </div>
          </div>
          <button
            onClick={onToggleMobile}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 md:hidden"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Primary Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Navigation
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`w-full group flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-left transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white font-medium shadow-md shadow-blue-600/20'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium truncate">{item.label}</span>
                    {item.badge && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                        {item.badge}
                      </span>
                    )}
                    {typeof item.count === 'number' && item.count > 0 && (
                      <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-slate-800 text-slate-300">
                        {item.count}
                      </span>
                    )}
                  </div>
                  <p className={`text-[11px] truncate ${isActive ? 'text-blue-100' : 'text-slate-400'}`}>
                    {item.description}
                  </p>
                </div>
                {isActive && <ChevronRight className="w-4 h-4 text-blue-200 shrink-0" />}
              </button>
            );
          })}
        </nav>

        {/* Quick Agent Feature Pill */}
        <div className="p-4 mx-4 mb-4 rounded-xl bg-slate-900/90 border border-slate-800">
          <div className="flex items-center gap-2 mb-1.5 text-blue-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Gemini Research Core</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Automatic architecture flowcharts, student extensions, & citation grounding under 25k tokens.
          </p>
        </div>

        {/* User / Academic Assignment Badge */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/40 text-xs text-slate-400 flex items-center justify-between">
          <div>
            <p className="text-slate-300 font-medium">Computer Science Dept.</p>
            <p className="text-[11px] text-slate-400">Academic Capstone</p>
          </div>
          <div className="w-2 h-2 rounded-full bg-emerald-400 ring-4 ring-emerald-400/20" title="System Online" />
        </div>
      </aside>
    </>
  );
};
