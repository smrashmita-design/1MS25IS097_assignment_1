import React, { useState } from 'react';
import { Download, FileText, Code2, Check, AlertCircle } from 'lucide-react';
import { ResearchAnalysisResult } from '../types/research.js';
import { 
  generateTxtExport, 
  generateValidatedJsonExport, 
  triggerDownload, 
  getPaperFileSlug 
} from '../services/exporter.js';

interface ExportButtonsProps {
  result: ResearchAnalysisResult;
}

export const ExportButtons: React.FC<ExportButtonsProps> = ({ result }) => {
  const [copiedTxt, setCopiedTxt] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const slug = getPaperFileSlug(result.paper?.title || 'research-paper');

  const handleExportTxt = () => {
    try {
      setDownloadError(null);
      const textContent = generateTxtExport(result);
      triggerDownload(textContent, `${slug}-analysis.txt`, 'text/plain;charset=utf-8');
    } catch (e: any) {
      setDownloadError(`TXT export failed: ${e.message}`);
    }
  };

  const handleExportJson = () => {
    try {
      setDownloadError(null);
      const { jsonString, valid, errors } = generateValidatedJsonExport(result);
      
      if (!valid) {
        setDownloadError(`JSON Validation Error: ${errors.join(', ')}`);
        return;
      }

      triggerDownload(jsonString, `${slug}-analysis.json`, 'application/json;charset=utf-8');
    } catch (e: any) {
      setDownloadError(`JSON export failed: ${e.message}`);
    }
  };

  const handleCopyTxt = () => {
    try {
      const textContent = generateTxtExport(result);
      navigator.clipboard.writeText(textContent);
      setCopiedTxt(true);
      setTimeout(() => setCopiedTxt(false), 2000);
    } catch (e: any) {
      setDownloadError('Could not copy to clipboard.');
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        {/* Export TXT button */}
        <button
          onClick={handleExportTxt}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-300 dark:border-slate-700 shadow-xs transition-all cursor-pointer"
          title="Export formatted readable academic report (.txt)"
        >
          <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span>Export TXT</span>
        </button>

        {/* Export JSON button */}
        <button
          onClick={handleExportJson}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-300 dark:border-slate-700 shadow-xs transition-all cursor-pointer"
          title="Export validated structured JSON (.json)"
        >
          <Code2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Export JSON</span>
        </button>

        {/* Copy TXT to Clipboard */}
        <button
          onClick={handleCopyTxt}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          title="Copy full text report to clipboard"
        >
          {copiedTxt ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-emerald-600 dark:text-emerald-400">Copied</span>
            </>
          ) : (
            <span>Copy Text</span>
          )}
        </button>
      </div>

      {downloadError && (
        <div className="p-2.5 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{downloadError}</span>
        </div>
      )}
    </div>
  );
};
