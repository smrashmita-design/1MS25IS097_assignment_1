import { ApiStatus, ArchitectureData, ResearchAnalysisResult } from '../types/research.js';

/**
 * Reads a JSON response body safely. When the backend is unreachable the Vite
 * proxy (or Express) can return HTML/plain text instead of JSON, so we never
 * assume `res.json()` will succeed.
 */
async function readJson(res: Response): Promise<any> {
  const text = await res.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { error: text.slice(0, 300) };
  }
}

export async function checkApiStatus(): Promise<ApiStatus> {
  try {
    const res = await fetch('/api/status');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (error: any) {
    return {
      configured: false,
      reachable: false,
      model: 'gemini-2.5-flash',
      message: 'Backend server not responding or offline. Start it with "npm run server:dev" (port 3001).'
    };
  }
}

export async function analyzePaperRequest(params: {
  url?: string;
  file?: File;
  customQuestion?: string;
}): Promise<ResearchAnalysisResult> {
  const { url, file, customQuestion } = params;

  const offlineMessage =
    'Cannot reach the ResearchLens backend. Make sure the server is running on port 3001 (npm run server:dev).';

  if (file) {
    const formData = new FormData();
    formData.append('pdfFile', file);
    if (customQuestion) formData.append('customQuestion', customQuestion);

    let res: Response;
    try {
      res = await fetch('/api/analyze', {
        method: 'POST',
        body: formData
      });
    } catch {
      throw new Error(offlineMessage);
    }

    const data = await readJson(res);
    if (!res.ok) {
      throw new Error(data.error || 'Analysis failed.');
    }
    return data;
  } else if (url) {
    let res: Response;
    try {
      res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url,
          customQuestion
        })
      });
    } catch {
      throw new Error(offlineMessage);
    }

    const data = await readJson(res);
    if (!res.ok) {
      throw new Error(data.error || 'Analysis failed.');
    }
    return data;
  }

  throw new Error('Please provide either a paper URL or upload a PDF.');
}

export async function regenerateDiagramRequest(params: {
  paperTitle: string;
  architectureDescription: string;
  currentMermaid: string;
  userInstruction?: string;
}): Promise<ArchitectureData> {
  let res: Response;
  try {
    res = await fetch('/api/regenerate-diagram', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
  } catch {
    throw new Error('Cannot reach the ResearchLens backend. Make sure the server is running on port 3001.');
  }

  const data = await readJson(res);
  if (!res.ok) {
    throw new Error(data.error || 'Failed to regenerate diagram.');
  }
  return data;
}

export async function getSamplePapersList(): Promise<any[]> {
  const res = await fetch('/api/samples');
  if (!res.ok) throw new Error('Failed to load sample papers.');
  return await res.json();
}

export async function getSamplePaper(id: string): Promise<ResearchAnalysisResult> {
  const res = await fetch(`/api/samples/${id}`);
  if (!res.ok) throw new Error('Failed to load sample paper details.');
  return await res.json();
}

export function getProjectZipUrl(): string {
  return '/api/export-project-zip';
}
