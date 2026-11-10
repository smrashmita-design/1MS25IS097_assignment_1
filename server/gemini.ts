import { GoogleGenAI } from '@google/genai';
import { config } from './config.js';
import { ExtractedPaperData } from './paperExtractor.js';
import { ResearchAnalysisResult, ArchitectureData } from '../src/types/research.js';
import { EXACT_SYSTEM_PROMPT } from '../src/data/constants.js';
import { ensureRenderableMermaid } from './mermaidValidator.js';

export { EXACT_SYSTEM_PROMPT };

/**
 * Creates a Gemini client bound to the API key from the server environment.
 * The Gemini Developer API (AI Studio) exposes developer instructions and the
 * Google Search grounding tool on the v1beta API version, so we pin it here.
 */
function createGeminiClient(apiKey: string): GoogleGenAI {
  return new GoogleGenAI({
    apiKey,
    httpOptions: { apiVersion: 'v1beta' }
  });
}

/** Transient upstream failures (model busy / quota) that are worth retrying. */
function isTransientError(error: any): boolean {
  const status = error?.status;
  const message = String(error?.message || '');
  return (
    status === 503 ||
    status === 429 ||
    status === 500 ||
    message.includes('UNAVAILABLE') ||
    message.includes('RESOURCE_EXHAUSTED') ||
    message.includes('high demand')
  );
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Runs a Gemini call and retries transient failures (503 high demand, 429 rate
 * limits) with exponential backoff before giving up.
 */
async function generateWithRetry<T extends { text?: string }>(
  call: () => Promise<T>,
  attempts: number = 3
): Promise<T> {
  let lastError: any;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await call();
    } catch (error: any) {
      lastError = error;
      if (!isTransientError(error) || attempt === attempts) break;
      const delay = 1500 * Math.pow(2, attempt - 1);
      console.warn(`Gemini call failed (attempt ${attempt}/${attempts}). Retrying in ${delay}ms...`);
      await sleep(delay);
    }
  }
  throw lastError;
}

// Clean and sanitize Mermaid graph syntax to avoid client rendering crashes.
// The implementation lives in src/utils so the browser can apply the exact
// same repair to diagrams restored from local storage history.
export { sanitizeMermaidCode } from '../src/utils/mermaidSanitizer.js';

export async function analyzePaperWithGemini(
  paperData: ExtractedPaperData,
  customQuestion?: string
): Promise<ResearchAnalysisResult> {
  const apiKey = config.getApiKey();
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured on the server. Add it to the .env file in the project root and restart the backend.');
  }

  const ai = createGeminiClient(apiKey);
  const modelName = config.defaultModel;

  const prompt = `Analyze the following academic research paper according to the system instructions.
You must return your output strictly in valid JSON format matching the schema below.
Do not wrap your output in anything other than the JSON object.

JSON Schema:
{
  "paper": {
    "title": "Exact or inferred title of paper",
    "authors": ["Author 1", "Author 2"],
    "year": 2024,
    "url": "${paperData.url}",
    "abstract": "Abstract of the paper"
  },
  "coreConcepts": {
    "problemStatement": "Detailed description of the problem being addressed and why it matters",
    "methodology": "Proposed solution and primary methodology",
    "keyBreakthroughs": ["Contribution 1", "Contribution 2", "Key algorithmic/math breakthrough"],
    "summary": "Under 300 words summary explaining the core concept in student-friendly, plain language"
  },
  "architecture": {
    "description": "Comprehensive explanation of the system pipeline, layers, and data flow",
    "mermaidCode": "graph TD\\n  A[\\"Input Data\\"] --> B[\\"Preprocessing\\"]\\n  B --> C[\\"Core Model\\"]\\n  C --> D[\\"Output\\"]"
  },
  "futureWork": [
    {
      "title": "Title of Project 1",
      "extension": "Exact technical extension",
      "problemSolved": "Problem this extension solves",
      "implementationApproach": "Concrete step-by-step implementation approach",
      "targetMetric": "Targeted metric (e.g. 40% memory reduction, latency reduction)",
      "technologyStack": ["PyTorch", "ONNX Runtime", "FastAPI"],
      "difficulty": "Intermediate",
      "portfolioDemonstration": "How to showcase this on GitHub/interview"
    },
    {
      "title": "Title of Project 2",
      "extension": "...",
      "problemSolved": "...",
      "implementationApproach": "...",
      "targetMetric": "...",
      "technologyStack": ["..."],
      "difficulty": "...",
      "portfolioDemonstration": "..."
    },
    {
      "title": "Title of Project 3",
      "extension": "...",
      "problemSolved": "...",
      "implementationApproach": "...",
      "targetMetric": "...",
      "technologyStack": ["..."],
      "difficulty": "...",
      "portfolioDemonstration": "..."
    }
  ],
  "references": [
    {
      "title": "Key Reference Paper Title",
      "authors": "Author et al.",
      "year": 2023,
      "citation": "Conference or Journal",
      "relevance": "Why relevant"
    }
  ],
  "customQuestionAnswer": "${customQuestion ? 'Answer to the user custom research question' : ''}",
  "supplementaryResearchNotes": "Notes distinguishing paper claims from web findings (if web research was used)"
}

${customQuestion ? `USER CUSTOM RESEARCH QUESTION: "${customQuestion}"\nPlease answer this question thoroughly in the customQuestionAnswer field based on the paper analysis.` : ''}

PAPER SOURCE DETAILS:
- Title candidate: ${paperData.title || 'Unknown'}
- URL / Path: ${paperData.url}
- Source Type: ${paperData.sourceType}
${paperData.abstract ? `- Extracted Abstract: ${paperData.abstract}\n` : ''}

PAPER CONTENT (EXCERPT FOR ANALYSIS):
${paperData.textContent}`;

  // Call Gemini with system prompt and search tool if supported
  let rawText = '';
  try {
    const response = await generateWithRetry(() =>
      ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          systemInstruction: EXACT_SYSTEM_PROMPT,
          temperature: 0.2, // Low temperature for high factual accuracy
          tools: [{ googleSearch: {} }] // Google Search Grounding for supplementary research
        }
      })
    );

    rawText = response.text || '';
  } catch (searchError: any) {
    // If googleSearch fails or model restricts search with system instructions, retry without search tool
    console.warn('Retrying Gemini call without search tool:', searchError.message);
    const retryResponse = await generateWithRetry(() =>
      ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          systemInstruction: EXACT_SYSTEM_PROMPT,
          temperature: 0.2
        }
      })
    );
    rawText = retryResponse.text || '';
  }

  // Parse JSON response
  const parsedData = extractAndParseJson(rawText);

  // Validate, repair and guarantee the Mermaid flowchart can be rendered
  const mermaidResult = await ensureRenderableMermaid(parsedData.architecture?.mermaidCode || '');
  if (mermaidResult.strategy !== 'repaired') {
    console.warn(`Mermaid diagram required repair (${mermaidResult.strategy}):`, mermaidResult.error);
  }
  const sanitizedMermaid = mermaidResult.code;

  const result: ResearchAnalysisResult = {
    id: 'analysis-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
    paper: {
      title: parsedData.paper?.title || paperData.title || 'Research Paper Analysis',
      authors: Array.isArray(parsedData.paper?.authors) ? parsedData.paper.authors : (paperData.authors || ['Academic Authors']),
      year: parsedData.paper?.year || paperData.year || new Date().getFullYear(),
      url: paperData.url,
      abstract: parsedData.paper?.abstract || paperData.abstract || 'Abstract extracted during AI research analysis.'
    },
    coreConcepts: {
      problemStatement: parsedData.coreConcepts?.problemStatement || 'Problem statement extracted from paper.',
      methodology: parsedData.coreConcepts?.methodology || 'Methodology described in the research paper.',
      keyBreakthroughs: Array.isArray(parsedData.coreConcepts?.keyBreakthroughs) ? parsedData.coreConcepts.keyBreakthroughs : [],
      summary: parsedData.coreConcepts?.summary || 'Summary synthesized by ResearchLens AI Agent.'
    },
    architecture: {
      description: parsedData.architecture?.description || 'System architecture components extracted according to the paper.',
      mermaidCode: sanitizedMermaid,
      limitationNote: parsedData.architecture?.limitationNote
    },
    futureWork: Array.isArray(parsedData.futureWork) ? parsedData.futureWork.slice(0, 3) : [],
    references: parsedData.references || [],
    metadata: {
      generatedAt: new Date().toISOString(),
      sourceType: paperData.sourceType,
      modelUsed: modelName,
      supplementaryWebResearchUsed: Boolean(parsedData.supplementaryResearchNotes)
    },
    customQuestion: customQuestion || undefined,
    customAnswer: parsedData.customQuestionAnswer || undefined,
    supplementaryResearchNotes: parsedData.supplementaryResearchNotes || undefined
  };

  return result;
}

// Regenerate or refine a Mermaid diagram with specific instructions
export async function regenerateDiagramWithGemini(
  paperTitle: string,
  architectureDescription: string,
  currentMermaid: string,
  userInstruction?: string
): Promise<ArchitectureData> {
  const apiKey = config.getApiKey();
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured.');
  }

  const ai = createGeminiClient(apiKey);
  const modelName = config.defaultModel;

  const prompt = `You are an expert at creating valid Mermaid.js flowcharts (graph TD) for academic Computer Science papers.

Paper Title: "${paperTitle}"
Architecture Description: "${architectureDescription}"
Current Mermaid Code:
\`\`\`mermaid
${currentMermaid}
\`\`\`

User Feedback/Adjustment: "${userInstruction || 'Regenerate with clearer hierarchy, cleaner node names, and strict valid syntax.'}"

TASK:
Generate an improved, syntactically pristine Mermaid.js diagram representing:
- Input data
- Data preprocessing
- Major system components
- Model architecture or algorithmic layers
- Processing pipeline
- Intermediate outputs
- Final outputs

RULES (breaking any of these makes the diagram fail to render):
- The first line must be exactly: graph TD
- Always wrap every node label in double quotes, e.g. A["Input Tokens"] --> B["Multi-Head Attention (8 heads)"]
- Always wrap every edge label in double quotes, e.g. A -->|"yes"| B
- Inside a quoted label you may use parentheses, hyphens, commas, slashes and pipes, but never use a double quote or a semicolon
- Keep every label shorter than 40 characters and on a single line
- Use only these three arrows: -->, -.-> and ==>
- Use plain single word node ids such as A, B, C
- Decision points may use the diamond shape, e.g. A{"Is it valid?"}
- Never use click, style, classDef, class or linkStyle statements
- No invalid syntax, no HTML tags inside node titles
- Return your response strictly as JSON:
{
  "description": "Refined architecture explanation",
  "mermaidCode": "graph TD\\n..."
}`;

  const response = await generateWithRetry(() =>
    ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        temperature: 0.1
      }
    })
  );

  const parsed = extractAndParseJson(response.text || '');
  const mermaidResult = await ensureRenderableMermaid(parsed.mermaidCode || currentMermaid);
  if (mermaidResult.strategy !== 'repaired') {
    console.warn(`Mermaid diagram required repair (${mermaidResult.strategy}):`, mermaidResult.error);
  }
  return {
    description: parsed.description || architectureDescription,
    mermaidCode: mermaidResult.code
  };
}

// Robust JSON extraction from LLM response
function extractAndParseJson(raw: string): any {
  let cleaned = raw.trim();

  // Strip markdown code fences if wrapped in ```json ... ```
  const jsonBlockMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (jsonBlockMatch && jsonBlockMatch[1]) {
    cleaned = jsonBlockMatch[1].trim();
  }

  // Find first { and last }
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }

  try {
    return JSON.parse(cleaned);
  } catch (e: any) {
    console.error('Failed to parse Gemini JSON directly. Attempting lenient repair...', e.message);
    // Lenient regex cleanups for trailing commas or unescaped newlines
    try {
      const repaired = cleaned
        .replace(/,\s*([}\]])/g, '$1') // remove trailing commas
        .replace(/[\u0000-\u0019]+/g, ''); // remove control chars
      return JSON.parse(repaired);
    } catch {
      throw new Error(`Unable to parse AI response into structured research data: ${e.message}. Raw output snippet: ${raw.substring(0, 200)}...`);
    }
  }
}
