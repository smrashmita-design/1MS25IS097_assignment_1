/**
 * Verifies that every generated Mermaid flowchart can actually be rendered.
 *
 * It runs the same repair chain the browser uses (see MermaidDiagram.tsx) but
 * against Mermaid's *browser* build inside jsdom - that build has the strict
 * flowchart grammar, so anything that parses here renders in the browser too.
 *
 * Usage: node scripts/verify-mermaid.mjs
 */
import { JSDOM } from 'jsdom';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

// --- Browser-like DOM -------------------------------------------------------
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', { pretendToBeVisual: true });
const g = globalThis;
g.window = dom.window;
g.document = dom.window.document;
Object.defineProperty(globalThis, 'navigator', { value: dom.window.navigator, configurable: true });
g.Element = dom.window.Element;
g.HTMLElement = dom.window.HTMLElement;
g.SVGElement = dom.window.SVGElement;
g.Node = dom.window.Node;
g.DOMParser = dom.window.DOMParser;
g.XMLSerializer = dom.window.XMLSerializer;
g.getComputedStyle = dom.window.getComputedStyle;
g.requestAnimationFrame = (cb) => setTimeout(cb, 0);
g.cancelAnimationFrame = (id) => clearTimeout(id);

const { default: mermaid } = await import(
  pathToFileURL(path.join(root, 'node_modules/mermaid/dist/mermaid.esm.mjs')).href
);
const { sanitizeMermaidCode, buildFallbackGraph, FALLBACK_MERMAID } = await import(
  pathToFileURL(path.join(root, 'src/utils/mermaidSanitizer.ts')).href
);

mermaid.initialize({ startOnLoad: false, securityLevel: 'loose', suppressErrorRendering: true });

// --- Corpus -----------------------------------------------------------------
const corpus = {
  'reported bug - unquoted parens':
    'graph TD\n  A[Input Layer] --> B[Frozen Weight Matrix W0 (Frozen)]\n  B --> C[Output Predictions]',
  'quoted label used as edge target':
    'graph TD\n  C["Build Image"] --> D["Runtime|Container"]\n  D --> "Manifest, Adapter, Workers"]',
  'quoted edge target without pipe':
    'graph TD\n  D["Runtime"] --> "Manifest, Adapter, Workers"]',
  'stadium shape with parens':
    'graph TD\n  A([Start (here)]) --> B([End])',
  'edge label with parens':
    'graph TD\n  A -->|yes (true)| B',
  'broken arrow and stray paren':
    'graph TD\n  A[Input (x)) --> C ------------>',
  'double quotes inside label':
    'graph TD\n  A["The "Model" Layer"] --> B[Out]',
  'semicolons and pipes in labels':
    'graph TD\n  A[Input; step 1 | alt] --> B[Output]',
  'decision node with braces':
    'graph TD\n  A{"Is it valid?"} --> B["Yes"]',
  'unbalanced subgraph':
    'graph TD\n  subgraph S1[Group]\n  A[Input] --> B[Out]',
  'balanced subgraph':
    'graph TD\n  subgraph S1["Group"]\n    A[Input]\n  end\n  A --> B[Out]',
  'subgraph with plain title':
    'graph TD\n  subgraph Group\n    A[Input]\n  end\n  A --> B[Out]',
  'subgraph with quoted title only':
    'graph TD\n  subgraph "Group"\n    A[Input]\n  end\n  A --> B[Out]',
  'two subgraphs':
    'graph TD\n  subgraph A["One"]\n    X[Input]\n  end\n  subgraph B["Two"]\n    Y[Model]\n  end\n  X --> Y',
  'html tags in label':
    'graph TD\n  A[<b>Input</b>] --> B[Out]',
  'multi line label':
    'graph TD\n  A[Input Layer\n  Second Line] --> B[Out]',
  'long arrow chain':
    'graph TD\n  A[Input] -------> B[Mid] ------> C[Output]',
  'markdown fenced':
    '```mermaid\ngraph TD\n  A[Input] --> B[Output]\n```',
  'prose before header':
    'Here is the diagram:\n\ngraph TD\n  A[Input] --> B[Output]',
  'style and classDef statements':
    'graph TD\n  A[Input] --> B[Out]\n  style A fill:#3498db\n  classDef hot fill:#f00',
  'flowchart LR header':
    'flowchart LR\n  A[Input] --> B[Output]',
  'empty': '',
  'garbage': 'total nonsense without any graph'
};

// --- The chain used by the browser ------------------------------------------
async function renderable(code) {
  for (const candidate of [code, sanitizeMermaidCode(code), buildFallbackGraph(code), FALLBACK_MERMAID]) {
    try {
      await mermaid.parse(candidate);
      return { ok: true, code: candidate };
    } catch {
      /* try the next candidate */
    }
  }
  return { ok: false, code: '' };
}

let passed = 0;
let failed = 0;

for (const [name, code] of Object.entries(corpus)) {
  const result = await renderable(code);
  if (result.ok) {
    passed++;
    console.log(`PASS  ${name}`);
  } else {
    failed++;
    console.log(`FAIL  ${name}`);
  }
}

// The strict repair alone should already be enough for most of the corpus.
let repairFailures = 0;
for (const [name, code] of Object.entries(corpus)) {
  try {
    await mermaid.parse(sanitizeMermaidCode(code));
  } catch (e) {
    const repaired = buildFallbackGraph(code);
    try {
      await mermaid.parse(repaired);
      console.log(`NOTE  ${name}: needed the loose rebuild`);
    } catch {
      repairFailures++;
      console.log(`BAD   ${name}: repair and rebuild both failed`);
    }
  }
}

console.log(`\nrender chain : ${passed} passed, ${failed} failed`);
console.log(`repair level : ${repairFailures} unrecoverable`);
process.exit(failed === 0 && repairFailures === 0 ? 0 : 1);
