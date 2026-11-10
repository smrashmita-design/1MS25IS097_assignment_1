import { HistoryItem, ResearchAnalysisResult } from '../types/research.js';

const STORAGE_KEY = 'researchlens_history_v1';
const THEME_KEY = 'researchlens_theme';

export function getHistory(): HistoryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Failed to read history from localStorage:', e);
    return [];
  }
}

export function saveAnalysisToHistory(result: ResearchAnalysisResult): void {
  try {
    const history = getHistory();
    // Prevent duplicate entries by id or paper title
    const filtered = history.filter(item => item.id !== result.id && item.paperTitle !== result.paper.title);
    
    const newItem: HistoryItem = {
      id: result.id,
      paperTitle: result.paper.title,
      paperUrl: result.paper.url,
      sourceType: result.metadata.sourceType,
      analysisDate: result.metadata.generatedAt || new Date().toISOString(),
      results: result
    };

    const updated = [newItem, ...filtered].slice(0, 50); // Store up to 50 recent papers
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save to localStorage history:', e);
  }
}

export function deleteHistoryItem(id: string): HistoryItem[] {
  try {
    const history = getHistory();
    const updated = history.filter(item => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Failed to delete history item:', e);
    return getHistory();
  }
}

export function clearAllHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error('Failed to clear history:', e);
  }
}

export function getStoredTheme(): 'light' | 'dark' {
  try {
    const theme = localStorage.getItem(THEME_KEY);
    if (theme === 'dark' || theme === 'light') return theme;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

export function setStoredTheme(theme: 'light' | 'dark'): void {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {}
}
