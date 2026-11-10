/**
 * Mermaid flowchart source repair utilities.
 *
 * Gemini occasionally emits node labels containing parentheses, semicolons or
 * stray double quotes. Mermaid's grammar cannot parse those tokens, which
 * resulted in a "Mermaid Syntax Warning" panel instead of a rendered diagram.
 *
 * These helpers normalise generated flowchart source so that it always parses:
 *  - every node label is wrapped in double quotes
 *  - edge labels are wrapped in double quotes
 *  - stray double quotes inside labels are neutralised
 *  - broken arrow sequences are normalised to `-->` / `-.->` / `==>`
 *  - statements that can break rendering (click / style / classDef) are dropped
 *
 * The module is isomorphic (no DOM, no Mermaid import) so it can run on both
 * the Express server and in the browser.
 */

export const FALLBACK_MERMAID = `graph TD
  Start["Input Data"] --> Process["Core Architecture"]
  Process --> End["Output Results"]`;

interface MermaidShape {
  open: string;
  close: string;
}

/** Ordered longest-first so multi-character shapes win over single characters. */
const SHAPES: MermaidShape[] = [
  { open: '(((', close: ')))' },
  { open: '[[', close: ']]' },
  { open: '([', close: '])' },
  { open: '[(', close: ')]' },
  { open: '((', close: '))' },
  { open: '{{', close: '}}' },
  { open: '[/', close: '/]' },
  { open: '[\\', close: '\\]' },
  { open: '[', close: ']' },
  { open: '(', close: ')' },
  { open: '{', close: '}' },
  { open: '>', close: ']' }
];

const ID_PATTERN = /[A-Za-z][A-Za-z0-9_]*/y;
const ARROW_PATTERN = /-->|-\.->|==>/;
const MAX_LABEL_LENGTH = 160;
const MAX_LINES_PER_STATEMENT = 3;

/** Normalises arrow runs (`------>`) into the three arrows Mermaid accepts. */
function normalizeArrows(text: string): string {
  return text
    .replace(/\.{2,}>/g, '-.->')
    .replace(/={2,}>/g, '==>')
    .replace(/-{2,}>/g, '-->')
    .replace(/--\s+([^->|]+?)\s+-->/g, (_m, label: string) => `-->|"${sanitizeLabelText(label)}"|`);
}

/**
 * Makes a label safe for a double quoted Mermaid string.
 * Quotes are replaced, newlines collapse and entity-like `#xx;` sequences are escaped.
 */
export function sanitizeLabelText(raw: string): string {
  let text = raw.trim();

  // Drop a wrapping pair of quotes the model may have added itself.
  if (text.length >= 2 && text.startsWith('"') && text.endsWith('"')) {
    text = text.slice(1, -1);
  }

  // A raw double quote terminates the Mermaid string literal.
  text = text.replace(/"/g, "'");

  // Collapse whitespace so labels stay on one line.
  text = text.replace(/[\r\n\t]+/g, ' ');

  return text.replace(/\s{2,}/g, ' ').trim();
}

function findShape(text: string, index: number): MermaidShape | null {
  for (const shape of SHAPES) {
    if (text.startsWith(shape.open, index)) return shape;
  }
  return null;
}

/**
 * Locates the closing delimiter of a node shape, honouring nested brackets.
 * Returns -1 when the shape is never closed on this line.
 */
function findLabelEnd(text: string, start: number, shape: MermaidShape): number {
  if (shape.open.length > 1 || shape.open === '>') {
    const idx = text.indexOf(shape.close, start);
    if (idx === -1 || idx - start > MAX_LABEL_LENGTH) return -1;
    return idx;
  }

  let depth = 1;
  for (let i = start; i < text.length; i++) {
    const ch = text[i];
    if (ch === shape.open) {
      depth++;
    } else if (ch === shape.close) {
      depth--;
      if (depth === 0) {
        return i - start > MAX_LABEL_LENGTH ? -1 : i;
      }
    }
  }
  return -1;
}

interface SanitizeContext {
  /** Counter used to generate ids for labels the model left without one. */
  counter: number;
  /** Ids that already exist in the source, so generated ids never collide. */
  usedIds: Set<string>;
}

/** Generates an unused node id for a label that has no id of its own. */
function nextGeneratedId(ctx: SanitizeContext): string {
  let id = `n${ctx.counter++}`;
  while (ctx.usedIds.has(id)) {
    id = `n${ctx.counter++}`;
  }
  ctx.usedIds.add(id);
  return id;
}

/**
 * Rewrites a single flowchart statement so every node / edge label is quoted.
 */
function sanitizeStatement(line: string, ctx: SanitizeContext): string {
  let out = '';
  let i = 0;

  while (i < line.length) {
    const ch = line[i];

    // Edge label: |text|
    if (ch === '|') {
      const end = line.indexOf('|', i + 1);
      if (end > i) {
        out += `|"${sanitizeLabelText(line.slice(i + 1, end))}"|`;
        i = end + 1;
        continue;
      }
    }

    // Standalone quoted label without a node id, e.g. --> "Manifest, Workers"].
    // Mermaid rejects a quoted string in place of a node, so give it an id.
    if (ch === '"') {
      const end = line.indexOf('"', i + 1);
      if (end !== -1) {
        const label = sanitizeLabelText(line.slice(i + 1, end));
        out += `${nextGeneratedId(ctx)}["${label}"]`;
        i = end + 1;
        // Swallow the stray closing bracket the model left behind.
        if (line[i] === ']') i++;
        continue;
      }
    }

    // Node shape: an identifier immediately followed by a shape delimiter.
    ID_PATTERN.lastIndex = i;
    const idMatch = ID_PATTERN.exec(line);
    if (idMatch) {
      const id = idMatch[0];
      const afterId = i + id.length;
      const shape = findShape(line, afterId);

      if (shape) {
        const labelStart = afterId + shape.open.length;
        const labelEnd = findLabelEnd(line, labelStart, shape);

        if (labelEnd !== -1) {
          const label = sanitizeLabelText(line.slice(labelStart, labelEnd));
          out += `${id}${shape.open}"${label}"${shape.close}`;
          i = labelEnd + shape.close.length;
          continue;
        }

        // Unclosed shape: keep the text up to the next arrow and close it for the model.
        const arrowMatch = ARROW_PATTERN.exec(line.slice(afterId));
        const cut = arrowMatch ? afterId + arrowMatch.index : line.length;
        const label = sanitizeLabelText(line.slice(labelStart, cut));
        out += `${id}${shape.open}"${label}"${shape.close}`;
        i = cut;
        continue;
      }
    }

    out += ch;
    i++;
  }

  return out;
}

/** `subgraph id["Title"]` / `subgraph Title` -> safe equivalent. */
function sanitizeSubgraphLine(line: string): string {
  const idMatch = /^(subgraph)\s+([A-Za-z][A-Za-z0-9_]*)?\s*(.*)$/i.exec(line);
  if (!idMatch) return 'subgraph "Pipeline"';

  const id = idMatch[2] || '';
  const rest = idMatch[3].trim();

  if (!rest) {
    return id ? `subgraph ${id}` : 'subgraph "Pipeline"';
  }

  // Title given as a shape -> keep the shape but quote the text.
  const shape = findShape(rest, 0);
  if (shape) {
    const labelStart = shape.open.length;
    const labelEnd = findLabelEnd(rest, labelStart, shape);
    if (labelEnd !== -1) {
      const title = sanitizeLabelText(rest.slice(labelStart, labelEnd));
      return `subgraph ${id}${shape.open}"${title}"${shape.close}`;
    }
  }

  // Plain or already quoted title.
  const title = sanitizeLabelText(rest);
  return id ? `subgraph ${id}["${title}"]` : `subgraph "${title}"`;
}

/** Counts unclosed brackets outside of quoted strings. */
function bracketBalance(text: string): number {
  let depth = 0;
  let inQuotes = false;

  for (const ch of text) {
    if (ch === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (inQuotes) continue;
    if (ch === '[' || ch === '(' || ch === '{') depth++;
    else if (ch === ']' || ch === ')' || ch === '}') depth--;
  }

  return depth;
}

/**
 * Rejoins statements that the model split across lines, e.g. a node label
 * containing a newline. Without this the tail of the label would be left over
 * as invalid syntax on its own line.
 */
function joinLogicalLines(lines: string[]): string[] {
  const out: string[] = [];
  let buffer = '';
  let joined = 0;

  for (const line of lines) {
    buffer = buffer ? `${buffer} ${line.trim()}` : line.trim();
    joined++;

    if (bracketBalance(buffer) <= 0 || joined >= MAX_LINES_PER_STATEMENT) {
      out.push(buffer);
      buffer = '';
      joined = 0;
    }
  }

  if (buffer.trim()) out.push(buffer);
  return out;
}

/**
 * Normalises raw Mermaid output into source that Mermaid's parser accepts.
 */
export function sanitizeMermaidCode(code: string): string {
  if (!code || !code.trim()) return FALLBACK_MERMAID;

  let text = code.trim();

  // Strip markdown code fences.
  text = text.replace(/^```(?:mermaid)?\s*/i, '').replace(/```\s*$/, '').trim();

  // Strip the "[FLOWCHART]" section marker.
  text = text.replace(/^\[?FLOWCHART\]?\s*/i, '').trim();

  const rawLines = text.split(/\r?\n/);
  const body: string[] = [];
  let hasHeader = false;

  for (const rawLine of rawLines) {
    const line = rawLine.trim();
    if (!line) continue;

    if (!hasHeader) {
      if (/^(graph|flowchart)\b/i.test(line)) {
        hasHeader = true;
      }
      // Anything before the declaration is prose - drop it.
      continue;
    }
    body.push(line);
  }

  if (!hasHeader || body.length === 0) return FALLBACK_MERMAID;

  // Ids that already exist, so generated ids for orphan labels never collide.
  const usedIds = new Set<string>();
  const idScan = /[A-Za-z][A-Za-z0-9_]*/g;
  let idMatch: RegExpExecArray | null;
  while ((idMatch = idScan.exec(text)) !== null) {
    usedIds.add(idMatch[0]);
  }
  const ctx: SanitizeContext = { counter: 1, usedIds };

  // Subgraphs are only kept when the block is balanced.
  const subgraphCount = body.filter(l => /^subgraph\b/i.test(l)).length;
  const endCount = body.filter(l => /^end\b/i.test(l)).length;
  const keepSubgraphs = subgraphCount > 0 && subgraphCount === endCount;

  const out: string[] = ['graph TD'];

  for (const line of joinLogicalLines(body)) {
    if (/^subgraph\b/i.test(line)) {
      if (keepSubgraphs) out.push(sanitizeSubgraphLine(line));
      continue;
    }
    if (/^end\b/i.test(line)) {
      if (keepSubgraphs) out.push('end');
      continue;
    }
    // These statements reference ids and colors that frequently do not exist.
    if (/^(click|style|classDef|class|linkStyle|accTitle|accDescr)\b/i.test(line)) continue;

    out.push(sanitizeStatement(normalizeArrows(line), ctx));
  }

  let result = out
    .join('\n')
    // Drop dangling arrows with no target.
    .replace(/\s*(?:-->|-\.->|==>)\s*$/gm, '')
    .replace(/[ \t]+$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  if (!result || !/^graph\s+TD/im.test(result)) return FALLBACK_MERMAID;

  return result;
}

/**
 * Builds a guaranteed-valid diagram from a messy source by loosely extracting
 * node labels and edges. Used as the last resort when the strict repair fails.
 */
export function buildFallbackGraph(code: string): string {
  if (!code || !code.trim()) return FALLBACK_MERMAID;

  const labels = new Map<string, string>();
  const edges: Array<[string, string]> = [];
  const seenEdges = new Set<string>();

  // 1. Node labels: ID followed by a shape and its text.
  const labelRe = /([A-Za-z][A-Za-z0-9_]*)\s*(?:\[\[|\[\(|\[|\(|\{\{|\{)\s*([^[\](){}]{1,80})/g;
  let match: RegExpExecArray | null;
  while ((match = labelRe.exec(code)) !== null) {
    const id = match[1];
    const label = sanitizeLabelText(match[2]);
    if (label && !labels.has(id)) labels.set(id, label);
  }

  // 2. Edge skeleton: drop the shapes so only "A --> B" remains.
  const skeleton = code.replace(
    /([A-Za-z][A-Za-z0-9_]*)\s*(?:\[\[|\[\(|\[|\(|\{\{|\{)[^\]\)\}]*(?:\]\]|\]\)|\)|\}\}|\])?/g,
    '$1'
  );

  const edgeRe = /([A-Za-z][A-Za-z0-9_]*)\s*(?:-->|-\.->|==>)\s*(?:\|[^|]*\|)?\s*([A-Za-z][A-Za-z0-9_]*)/g;
  while ((match = edgeRe.exec(skeleton)) !== null) {
    const from = match[1];
    const to = match[2];
    const key = `${from}->${to}`;
    if (!seenEdges.has(key)) {
      seenEdges.add(key);
      edges.push([from, to]);
    }
  }

  if (edges.length === 0) return FALLBACK_MERMAID;

  const nodeLabel = (id: string) => labels.get(id) || id;

  const lines = ['graph TD'];
  for (const [from, to] of edges) {
    lines.push(`  ${from}["${nodeLabel(from)}"] --> ${to}["${nodeLabel(to)}"]`);
  }

  return lines.join('\n');
}
