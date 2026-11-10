import pdfParse from 'pdf-parse';

export interface ExtractedPaperData {
  title?: string;
  authors?: string[];
  year?: number | null;
  abstract?: string;
  url: string;
  textContent: string;
  sourceType: 'pdf_upload' | 'url_fetch';
  rawBuffer?: Buffer;
}

// Helper to truncate text to approximate token limit (~4 chars per token)
// 20,000 tokens max to leave ample room for prompt + response under 25k limit
export function limitTokenLength(text: string, maxTokens: number = 20000): string {
  const maxChars = maxTokens * 4;
  if (text.length <= maxChars) return text;
  
  // Keep first 70% and last 30% of allowed length
  const headLength = Math.floor(maxChars * 0.7);
  const tailLength = Math.floor(maxChars * 0.3);
  
  return (
    text.substring(0, headLength) +
    "\n\n[... intermediate sections omitted for token efficiency ...]\n\n" +
    text.substring(text.length - tailLength)
  );
}

// Parse text from uploaded PDF buffer
export async function extractFromPdfBuffer(buffer: Buffer, originalFilename?: string): Promise<ExtractedPaperData> {
  try {
    const pdfData = await pdfParse(buffer);
    const fullText = pdfData.text || '';
    
    // Attempt to extract title and abstract from the beginning
    const lines = fullText
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 0);
    
    const candidateTitle = lines.slice(0, 5).join(' ').substring(0, 150) || originalFilename || 'Uploaded Research Paper';
    
    // Abstract extraction heuristic
    let abstract = '';
    const abstractMatch = fullText.match(/abstract[\s:—–-]+([\s\S]{100,1500}?)(?=(?:1\.?\s+|i\.\s+|introduction|keywords|categories))/i);
    if (abstractMatch && abstractMatch[1]) {
      abstract = abstractMatch[1].replace(/\s+/g, ' ').trim();
    }

    const limitedText = limitTokenLength(fullText, 20000);

    return {
      title: candidateTitle,
      abstract: abstract || undefined,
      url: originalFilename ? `local://${originalFilename}` : 'local://uploaded-paper.pdf',
      textContent: limitedText,
      sourceType: 'pdf_upload',
      rawBuffer: buffer
    };
  } catch (error: any) {
    throw new Error(`Failed to extract text from PDF: ${error.message || 'Corrupted or password-protected PDF'}`);
  }
}

// Parse text or metadata from a research paper URL
export async function extractFromUrl(rawUrl: string): Promise<ExtractedPaperData> {
  const trimmed = rawUrl.trim();
  
  // 1. Basic URL validation
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`);
  } catch {
    throw new Error(`Invalid URL format: "${rawUrl}". Please provide a valid HTTP or HTTPS research paper URL.`);
  }

  // 2. Check for arXiv link (e.g. arxiv.org/abs/2106.09685 or arxiv.org/pdf/2106.09685.pdf)
  const arxivMatch = trimmed.match(/(?:arxiv\.org\/(?:abs|pdf)\/|arxiv:)([0-9]+\.[0-9]+(?:v[0-9]+)?)/i);
  if (arxivMatch && arxivMatch[1]) {
    const arxivId = arxivMatch[1];
    return await fetchArxivPaper(arxivId, parsedUrl.toString());
  }

  // 3. Check for direct PDF URL
  if (parsedUrl.pathname.toLowerCase().endsWith('.pdf')) {
    return await fetchDirectPdfUrl(parsedUrl.toString());
  }

  // 4. General academic webpage extraction (e.g. HuggingFace paper, Semantic Scholar, open-access journal)
  return await fetchWebpagePaper(parsedUrl.toString());
}

// Fetch paper metadata from arXiv official API
async function fetchArxivPaper(arxivId: string, originalUrl: string): Promise<ExtractedPaperData> {
  try {
    const apiUrl = `https://export.arxiv.org/api/query?id_list=${arxivId}`;
    const res = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'ResearchLensAI/1.0 (academic-research-tool; contact@researchlens.local)'
      }
    });

    if (!res.ok) {
      throw new Error(`arXiv API responded with status ${res.status}`);
    }

    const xml = await res.text();

    // Extract title
    const titleMatch = xml.match(/<title>([\s\S]*?)<\/title>/gi);
    // Note: The first <title> is often the feed title ("arXiv Query..."), the second is the paper title
    let title = 'arXiv:' + arxivId;
    if (titleMatch && titleMatch.length > 1) {
      title = titleMatch[1].replace(/<\/?title>/gi, '').replace(/\s+/g, ' ').trim();
    }

    // Extract summary / abstract
    let abstract = '';
    const summaryMatch = xml.match(/<summary>([\s\S]*?)<\/summary>/i);
    if (summaryMatch && summaryMatch[1]) {
      abstract = summaryMatch[1].replace(/\s+/g, ' ').trim();
    }

    // Extract authors
    const authors: string[] = [];
    const authorMatches = xml.matchAll(/<author>[\s\S]*?<name>([\s\S]*?)<\/name>[\s\S]*?<\/author>/gi);
    for (const m of authorMatches) {
      if (m[1]) authors.push(m[1].trim());
    }

    // Extract publication year
    let year: number | null = null;
    const publishedMatch = xml.match(/<published>([0-9]{4})-/i);
    if (publishedMatch && publishedMatch[1]) {
      year = parseInt(publishedMatch[1], 10);
    }

    // Try fetching the PDF text from arXiv if possible, with timeout fallback
    let fullText = `Title: ${title}\nAuthors: ${authors.join(', ')}\nYear: ${year}\narXiv ID: ${arxivId}\n\nAbstract:\n${abstract}\n`;
    
    try {
      const pdfUrl = `https://arxiv.org/pdf/${arxivId}.pdf`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000); // 12s timeout
      
      const pdfRes = await fetch(pdfUrl, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      clearTimeout(timeoutId);

      if (pdfRes.ok) {
        const buffer = Buffer.from(await pdfRes.arrayBuffer());
        const parsed = await pdfParse(buffer);
        if (parsed.text && parsed.text.length > 200) {
          fullText = parsed.text;
        }
      }
    } catch {
      // If PDF download times out or is blocked, the arXiv API summary + metadata is used!
      fullText += `\n[Note: Primary text compiled from official arXiv metadata and abstract. Supplementary deep research enabled for full analysis.]`;
    }

    return {
      title,
      authors: authors.length > 0 ? authors : undefined,
      year,
      abstract,
      url: originalUrl,
      textContent: limitTokenLength(fullText, 20000),
      sourceType: 'url_fetch'
    };
  } catch (error: any) {
    throw new Error(`Failed to retrieve arXiv paper (${arxivId}): ${error.message}`);
  }
}

// Fetch direct PDF via URL
async function fetchDirectPdfUrl(url: string): Promise<ExtractedPaperData> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (ResearchLens AI)'
      }
    });
    clearTimeout(timeout);

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }

    const buffer = Buffer.from(await res.arrayBuffer());
    const extracted = await extractFromPdfBuffer(buffer, url.split('/').pop() || 'Remote PDF Paper');
    extracted.url = url;
    return extracted;
  } catch (error: any) {
    throw new Error(`Unable to access remote PDF at ${url}: ${error.message}`);
  }
}

// Fetch generic webpage (e.g. OpenReview, Hugging Face Papers, ACM, IEEE open abstract)
async function fetchWebpagePaper(url: string): Promise<ExtractedPaperData> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (ResearchLens AI)'
      }
    });
    clearTimeout(timeout);

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }

    const html = await res.text();

    // Extract title
    let title = '';
    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    if (titleMatch && titleMatch[1]) {
      title = titleMatch[1].replace(/\s+/g, ' ').trim();
    }

    // Extract meta description or citation_abstract
    let abstract = '';
    const metaAbsMatch = html.match(/<meta\s+name=["'](?:citation_abstract|description|dc\.description)["']\s+content=["']([\s\S]*?)["']/i);
    if (metaAbsMatch && metaAbsMatch[1]) {
      abstract = metaAbsMatch[1].trim();
    }

    // Strip scripts, styles, tags to extract body text
    const cleanBody = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, '')
      .replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    return {
      title: title || 'Academic Web Document',
      abstract: abstract || undefined,
      url,
      textContent: limitTokenLength(cleanBody, 20000),
      sourceType: 'url_fetch'
    };
  } catch (error: any) {
    throw new Error(`Failed to retrieve research paper page from ${url}: ${error.message}`);
  }
}
