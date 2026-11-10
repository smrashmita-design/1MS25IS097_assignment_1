import express, { Request, Response } from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { config } from './config.js';
import { extractFromPdfBuffer, extractFromUrl } from './paperExtractor.js';
import { analyzePaperWithGemini, regenerateDiagramWithGemini } from './gemini.js';
import { SAMPLE_PAPERS } from './samplePapers.js';
import { createProjectZipStream } from './exportZip.js';
import { warmUpMermaid } from './mermaidValidator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Multer in-memory storage for PDF uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 30 * 1024 * 1024 // 30MB max PDF size
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf')) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file type. Only PDF research papers are supported.'));
    }
  }
});

/** True when the failure came from the Gemini API rather than our own code. */
function isGeminiError(error: any): boolean {
  const raw = String(error?.message || '');
  return typeof error?.status === 'number' || raw.includes('"code":') || raw.includes('ApiError');
}

/**
 * Maps an upstream Gemini failure onto a readable message.
 * Raw API payloads are never forwarded to the browser.
 */
function describeGeminiError(error: any): { status: number; message: string } {
  const raw = String(error?.message || error || '');
  const status = error?.status;

  if (raw.includes('API_KEY_INVALID') || raw.includes('PERMISSION_DENIED') || status === 403) {
    return {
      status: 403,
      message: 'The server rejected the GEMINI_API_KEY. Verify the key stored in the server .env file against Google AI Studio.'
    };
  }

  if (raw.includes('RESOURCE_EXHAUSTED') || raw.includes('429') || raw.includes('quota')) {
    return {
      status: 429,
      message: 'The Gemini API quota for this project is exhausted (the free tier allows 20 requests per day). Wait for the quota to reset or use a billing-enabled API key.'
    };
  }

  if (raw.includes('UNAVAILABLE') || raw.includes('high demand') || status === 503) {
    return {
      status: 503,
      message: 'The Gemini model is temporarily busy. The request was retried automatically - please try again in a moment.'
    };
  }

  if (raw.includes('NOT_FOUND') || raw.includes('404')) {
    return {
      status: 502,
      message: `The configured model "${config.defaultModel}" is not available for this API key. Set GEMINI_MODEL in the server .env file to a model your key can access.`
    };
  }

  return {
    status: 500,
    message: 'The Gemini request failed unexpectedly. Check the backend console for details.'
  };
}

/** Shared handler for the two AI endpoints. */
function handleAiError(res: Response, error: any, fallback: string) {
  console.error('AI request error:', error);

  if (isGeminiError(error)) {
    const { status, message } = describeGeminiError(error);
    return res.status(status).json({ error: message });
  }

  return res.status(500).json({ error: error?.message || fallback });
}

// 1. API Status Endpoint (reports whether the SERVER has a key loaded from .env)
app.get('/api/status', (_req: Request, res: Response) => {
  res.json({
    configured: config.hasApiKey(),
    model: config.defaultModel,
    source: config.apiKeySource(),
    reachable: true,
    message: config.hasApiKey()
      ? 'Gemini API is configured on the server via .env and ready.'
      : 'GEMINI_API_KEY is not set on the server. Add it to the .env file in the project root and restart the backend.'
  });
});

// NOTE: There is deliberately no endpoint that accepts an API key from the client.
// The key lives only in the server environment (.env / process.env).

// 3. Sample Papers Endpoints
app.get('/api/samples', (_req: Request, res: Response) => {
  const summaries = SAMPLE_PAPERS.map(p => ({
    id: p.id,
    title: p.paper.title,
    authors: p.paper.authors,
    year: p.paper.year,
    url: p.paper.url,
    abstract: p.paper.abstract.substring(0, 200) + '...'
  }));
  res.json(summaries);
});

app.get('/api/samples/:id', (req: Request, res: Response) => {
  const paper = SAMPLE_PAPERS.find(p => p.id === req.params.id);
  if (!paper) {
    return res.status(404).json({ error: 'Sample paper not found.' });
  }
  res.json(paper);
});

// 4. Analyze Paper Endpoint (URL or PDF upload)
app.post('/api/analyze', upload.single('pdfFile'), async (req: Request, res: Response) => {
  try {
    const url = req.body?.url as string | undefined;
    const customQuestion = req.body?.customQuestion as string | undefined;
    const file = req.file;

    // Check submission validity
    if (!url && !file) {
      return res.status(400).json({
        error: 'Empty submission. Please provide either a research paper URL or upload a PDF document.'
      });
    }

    // Check API Key (server-side environment only)
    if (!config.hasApiKey()) {
      return res.status(401).json({
        error: 'GEMINI_API_KEY is not configured on the server. Add it to the .env file in the project root and restart the backend.'
      });
    }

    let extractedData;

    if (file) {
      // PDF File Upload
      if (file.size === 0) {
        return res.status(400).json({ error: 'The uploaded PDF file is empty (0 bytes).' });
      }
      extractedData = await extractFromPdfBuffer(file.buffer, file.originalname);
    } else if (url) {
      // URL submission
      const trimmedUrl = url.trim();
      if (trimmedUrl.length < 5) {
        return res.status(400).json({ error: 'Invalid URL. Please enter a valid academic paper link.' });
      }
      extractedData = await extractFromUrl(trimmedUrl);
    } else {
      return res.status(400).json({ error: 'No paper content detected in submission.' });
    }

    // Run AI analysis with Gemini
    const analysis = await analyzePaperWithGemini(extractedData, customQuestion);
    return res.json(analysis);
  } catch (error: any) {
    return handleAiError(res, error, 'An error occurred during paper analysis.');
  }
});

// 5. Regenerate Mermaid Architecture Diagram Endpoint
app.post('/api/regenerate-diagram', async (req: Request, res: Response) => {
  try {
    const { paperTitle, architectureDescription, currentMermaid, userInstruction } = req.body;
    if (!paperTitle || !architectureDescription) {
      return res.status(400).json({ error: 'Missing paper context for diagram regeneration.' });
    }

    if (!config.hasApiKey()) {
      return res.status(401).json({ error: 'GEMINI_API_KEY is not configured on the server. Add it to the .env file in the project root and restart the backend.' });
    }

    const updated = await regenerateDiagramWithGemini(
      paperTitle,
      architectureDescription,
      currentMermaid || '',
      userInstruction
    );

    return res.json(updated);
  } catch (error: any) {
    return handleAiError(res, error, 'Failed to regenerate diagram.');
  }
});

// 6. Download Source Code ZIP for GitHub submission
app.get('/api/export-project-zip', (_req: Request, res: Response) => {
  try {
    createProjectZipStream(res, projectRoot);
  } catch (error: any) {
    console.error('Error generating project zip:', error);
    res.status(500).json({ error: 'Failed to create project ZIP archive.' });
  }
});

// 7. Error handling middleware for multer or generic exceptions
app.use((err: any, _req: Request, res: Response, _next: any) => {
  console.error('Express global error:', err);
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum supported PDF size is 30MB.' });
    }
    return res.status(400).json({ error: `Upload error: ${err.message}` });
  }
  return res.status(500).json({ error: err.message || 'Internal server error.' });
});

// 8. Serve built frontend assets if present in production
const distPath = path.join(projectRoot, 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (_req: Request, res: Response) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Start server
const PORT = config.port;
app.listen(PORT, () => {
  console.log(`[ResearchLens AI Server] running on http://localhost:${PORT}`);
  console.log(`[Status] Gemini API Key configured: ${config.hasApiKey()} (source: ${config.apiKeySource()})`);
  console.log(`[Model] Default Gemini model: ${config.defaultModel}`);
  if (!config.hasApiKey()) {
    console.warn('[Warning] GEMINI_API_KEY not found. Add it to the .env file in the project root and restart the server.');
  }

  // Pre-load Mermaid in the background for server side flowchart validation.
  warmUpMermaid();
});
