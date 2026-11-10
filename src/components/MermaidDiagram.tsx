import React, { useEffect, useState, useRef } from 'react';
import mermaid from 'mermaid';
import { 
  Maximize2, 
  Copy, 
  Check, 
  Download, 
  RefreshCw, 
  Code, 
  Eye, 
  AlertTriangle,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { DiagramModal } from './DiagramModal.js';
import { ArchitectureData } from '../types/research.js';
import { FALLBACK_MERMAID, buildFallbackGraph, sanitizeMermaidCode } from '../utils/mermaidSanitizer.js';

interface MermaidDiagramProps {
  architecture: ArchitectureData;
  paperTitle: string;
  isDark: boolean;
  onRegenerateDiagram?: (instruction?: string) => Promise<void>;
  isRegenerating?: boolean;
  /** Called with the repaired source when the original could not be rendered. */
  onMermaidRepaired?: (code: string) => void;
}

export const MermaidDiagram: React.FC<MermaidDiagramProps> = ({
  architecture,
  paperTitle,
  isDark,
  onRegenerateDiagram,
  isRegenerating = false,
  onMermaidRepaired
}) => {
  const [svgHtml, setSvgHtml] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [scale, setScale] = useState<number>(1);
  const [copied, setCopied] = useState<boolean>(false);
  const [showCode, setShowCode] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  // The source that was actually rendered (after repair), shown in "View Code".
  const [renderedCode, setRenderedCode] = useState<string>(architecture.mermaidCode);

  // Regeneration modal state
  const [showRegenDialog, setShowRegenDialog] = useState<boolean>(false);
  const [regenInstruction, setRegenInstruction] = useState<string>('');

  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize and render diagram whenever mermaidCode or theme changes
  useEffect(() => {
    let isMounted = true;
    const renderChart = async () => {
      if (!architecture.mermaidCode) {
        setError('No Mermaid flowchart code provided for this paper.');
        return;
      }

      const renderWith = async (code: string) => {
        const id = 'mermaid-' + Math.random().toString(36).substring(2, 9);
        const { svg } = await mermaid.render(id, code);
        return { svg, code };
      };

      try {
        setError(null);
        mermaid.initialize({
          startOnLoad: false,
          theme: isDark ? 'dark' : 'neutral',
          securityLevel: 'loose',
          // Never let Mermaid inject its "Syntax error in text" diagram into the
          // page layout - failures are handled by the repair chain below.
          suppressErrorRendering: true,
          fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif',
          flowchart: {
            htmlLabels: true,
            curve: 'basis',
            useMaxWidth: true,
            padding: 20
          }
        });

        // The browser's own parser is the authority on what can be rendered.
        // Try the source as-is, then repaired, then a rebuilt graph, then a
        // guaranteed valid fallback - so a diagram always appears.
        const candidates: Array<{ code: string; repaired: boolean }> = [
          { code: architecture.mermaidCode, repaired: false },
          { code: sanitizeMermaidCode(architecture.mermaidCode), repaired: true },
          { code: buildFallbackGraph(architecture.mermaidCode), repaired: true }
        ];

        let lastError: any = null;
        let done = false;

        for (const candidate of candidates) {
          try {
            // Validate with the parser before rendering (cheap and precise).
            await mermaid.parse(candidate.code);
            const { svg, code } = await renderWith(candidate.code);

            if (!isMounted) return;
            setRenderedCode(code);
            setSvgHtml(svg);
            setError(null);
            if (candidate.repaired && code !== architecture.mermaidCode) {
              onMermaidRepaired?.(code);
            }
            done = true;
            break;
          } catch (err: any) {
            lastError = err;
            console.warn('Mermaid candidate rejected:', err?.message?.split('\n')[0]);
          }
        }

        if (!done) {
          const { svg, code } = await renderWith(FALLBACK_MERMAID);
          if (!isMounted) return;
          setRenderedCode(code);
          setSvgHtml(svg);
          onMermaidRepaired?.(code);
        }
      } catch (err: any) {
        console.error('Mermaid render failure:', err);
        if (isMounted) {
          setError(
            err.message || 
            'Invalid Mermaid syntax encountered. You can view the raw source or request AI regeneration.'
          );
        }
      }
    };

    renderChart();

    return () => {
      isMounted = false;
    };
  }, [architecture.mermaidCode, isDark]);

  const handleCopySource = () => {
    navigator.clipboard.writeText(renderedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.2, 2.2));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.2, 0.5));
  const handleResetZoom = () => setScale(1);

  const downloadSvg = () => {
    if (!svgHtml) return;
    const blob = new Blob([svgHtml], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${paperTitle.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-architecture.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadPng = () => {
    if (!svgHtml) return;
    const svgElement = containerRef.current?.querySelector('svg');
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    // Scale canvas for crisp 2x resolution
    const rect = svgElement.getBoundingClientRect();
    const width = (rect.width || 800) * 2;
    const height = (rect.height || 600) * 2;
    canvas.width = width;
    canvas.height = height;

    img.onload = () => {
      if (ctx) {
        ctx.fillStyle = isDark ? '#0F172A' : '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        const pngUrl = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = pngUrl;
        a.download = `${paperTitle.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-architecture.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  const submitRegeneration = async () => {
    if (onRegenerateDiagram) {
      await onRegenerateDiagram(regenInstruction.trim() || undefined);
      setShowRegenDialog(false);
      setRegenInstruction('');
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-all duration-200">
      {/* Header controls bar */}
      <div className="p-4 sm:px-6 bg-slate-50/70 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-600 dark:bg-blue-400"></div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            System Architecture Flowchart
          </span>
          <span className="text-[11px] px-2 py-0.5 rounded font-mono bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
            graph TD
          </span>
        </div>

        {/* Toolbar */}
        <div className="flex items-center flex-wrap gap-1.5 sm:gap-2">
          {/* Zoom controls (visual mode only) */}
          {!showCode && !error && (
            <div className="hidden sm:flex items-center bg-white dark:bg-slate-800 rounded-lg p-0.5 border border-slate-200 dark:border-slate-700">
              <button
                onClick={handleZoomOut}
                className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="px-1.5 text-[11px] font-mono font-medium text-slate-600 dark:text-slate-400">
                {Math.round(scale * 100)}%
              </span>
              <button
                onClick={handleZoomIn}
                className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleResetZoom}
                className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded border-l border-slate-200 dark:border-slate-700 cursor-pointer"
                title="Reset Zoom"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Toggle between visual and raw source */}
          <button
            onClick={() => setShowCode(!showCode)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
              showCode
                ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
            title="Toggle Raw Mermaid Code"
          >
            {showCode ? <Eye className="w-3.5 h-3.5" /> : <Code className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{showCode ? 'View Diagram' : 'View Code'}</span>
          </button>

          {/* Copy Mermaid Source */}
          <button
            onClick={handleCopySource}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
            title="Copy Mermaid.js Source"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copied ? 'Copied!' : 'Copy'}</span>
          </button>

          {/* Download dropdown / buttons */}
          {!error && !showCode && (
            <>
              <button
                onClick={downloadSvg}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                title="Download SVG file"
              >
                <Download className="w-3.5 h-3.5" />
                <span>SVG</span>
              </button>
              <button
                onClick={downloadPng}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                title="Download PNG file"
              >
                <Download className="w-3.5 h-3.5" />
                <span>PNG</span>
              </button>
            </>
          )}

          {/* Full Screen Modal */}
          {!error && !showCode && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
              title="Full Screen View"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Regenerate diagram with AI */}
          {onRegenerateDiagram && (
            <button
              onClick={() => setShowRegenDialog(true)}
              disabled={isRegenerating}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-xs disabled:opacity-50 transition-colors cursor-pointer"
              title="Regenerate architecture diagram using Gemini"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
              <span className="hidden md:inline">Regenerate</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Diagram Display Area */}
      <div className="relative min-h-[380px] p-6 flex items-center justify-center bg-slate-50/40 dark:bg-slate-950/40 overflow-hidden">
        {showCode ? (
          <div className="w-full">
            <div className="flex items-center justify-between pb-2 text-xs text-slate-400">
              <span>Mermaid.js Source Definition</span>
              <span>graph TD</span>
            </div>
            <pre className="p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800">
              <code>{renderedCode}</code>
            </pre>
          </div>
        ) : error ? (
          <div className="max-w-md text-center p-6 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-200">
            <AlertTriangle className="w-8 h-8 text-amber-600 dark:text-amber-400 mx-auto mb-2" />
            <h4 className="font-semibold text-sm mb-1">Mermaid Syntax Warning</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-4">{error}</p>
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setShowCode(true)}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-100 dark:bg-amber-900/60 text-amber-900 dark:text-amber-100 cursor-pointer"
              >
                Inspect Mermaid Code
              </button>
              {onRegenerateDiagram && (
                <button
                  onClick={() => onRegenerateDiagram()}
                  disabled={isRegenerating}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 text-white cursor-pointer"
                >
                  Regenerate with AI
                </button>
              )}
            </div>
          </div>
        ) : (
          <div
            ref={containerRef}
            className="w-full overflow-auto flex items-center justify-center transition-transform duration-150"
            style={{
              transform: `scale(${scale})`,
              transformOrigin: 'top center'
            }}
            dangerouslySetInnerHTML={{ __html: svgHtml }}
          />
        )}
      </div>

      {/* Architecture pipeline description note */}
      {architecture.description && (
        <div className="p-4 sm:px-6 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-800">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
            Pipeline Description
          </p>
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            {architecture.description}
          </p>
          {architecture.limitationNote && (
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 italic">
              * Note: {architecture.limitationNote}
            </p>
          )}
        </div>
      )}

      {/* Full-screen modal */}
      <DiagramModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        svgHtml={svgHtml}
        paperTitle={paperTitle}
        mermaidCode={renderedCode}
        onDownloadSvg={downloadSvg}
        onDownloadPng={downloadPng}
      />

      {/* AI Regeneration Prompt Dialog */}
      {showRegenDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center gap-2.5 text-blue-600 dark:text-blue-400 font-bold">
              <Sparkles className="w-5 h-5" />
              <h3 className="text-slate-900 dark:text-white text-base">Regenerate Architecture Diagram</h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Gemini will re-evaluate the paper architecture to generate a cleaner, more detailed, or specialized flowchart.
            </p>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Custom Adjustment / Refinement Prompt (Optional)
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Focus on the mathematical attention layers, or include subgraphs for preprocessing and training stages..."
                value={regenInstruction}
                onChange={(e) => setRegenInstruction(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowRegenDialog(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitRegeneration}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md cursor-pointer"
              >
                Regenerate Diagram
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
