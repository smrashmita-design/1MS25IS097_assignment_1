import { FALLBACK_MERMAID, buildFallbackGraph, sanitizeMermaidCode } from '../src/utils/mermaidSanitizer.js';

export interface MermaidValidation {
  valid: boolean;
  error?: string;
}

let mermaidModule: Promise<typeof import('mermaid')> | null = null;

/**
 * Lazily loads Mermaid on the server. The package is only needed when a paper
 * is analysed, so it is not part of the server boot path.
 */
function loadMermaid(): Promise<typeof import('mermaid')> {
  if (!mermaidModule) {
    mermaidModule = import('mermaid').then(mod => {
      mod.default.initialize({ startOnLoad: false, securityLevel: 'loose' });
      return mod;
    });
  }
  return mermaidModule;
}

/**
 * Loads Mermaid in the background so the first analysis request does not pay
 * the module import cost.
 */
export function warmUpMermaid(): void {
  loadMermaid().catch(error => {
    console.warn('Could not pre-load Mermaid for server-side validation:', error?.message);
  });
}

/**
 * Validates Mermaid source with Mermaid's own parser.
 *
 * In Node there is no DOM, so Mermaid fails during its HTML-sanitisation step
 * (`DOMPurify.sanitize is not a function`) *after* the grammar has parsed the
 * diagram successfully. That specific failure therefore means "syntax is fine".
 */
export async function validateMermaid(code: string): Promise<MermaidValidation> {
  if (!code || !code.trim()) {
    return { valid: false, error: 'Empty Mermaid source.' };
  }

  try {
    const mermaid = await loadMermaid();
    await mermaid.default.parse(code);
    return { valid: true };
  } catch (error: any) {
    const message = String(error?.message || error);

    // The DOM sanitiser is unavailable in Node - the grammar already parsed fine.
    if (message.includes('DOMPurify') || message.includes('sanitize is not a function')) {
      return { valid: true };
    }

    return { valid: false, error: message };
  }
}

/**
 * Produces Mermaid source that is guaranteed to parse.
 *
 * 1. Strict repair (quoting every label).
 * 2. Loose rebuild from the extracted graph structure.
 * 3. A generic, always-valid diagram.
 */
export async function ensureRenderableMermaid(rawCode: string): Promise<{
  code: string;
  strategy: 'repaired' | 'rebuilt' | 'fallback';
  error?: string;
}> {
  const sanitized = sanitizeMermaidCode(rawCode);

  const first = await validateMermaid(sanitized);
  if (first.valid) {
    return { code: sanitized, strategy: 'repaired' };
  }

  const rebuilt = buildFallbackGraph(rawCode);
  const second = await validateMermaid(rebuilt);
  if (second.valid) {
    return { code: rebuilt, strategy: 'rebuilt', error: first.error };
  }

  return { code: FALLBACK_MERMAID, strategy: 'fallback', error: first.error };
}
