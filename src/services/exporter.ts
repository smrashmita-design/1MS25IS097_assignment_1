import { ResearchAnalysisResult } from '../types/research.js';

// Format analysis data into a clean, readable text document
export function generateTxtExport(result: ResearchAnalysisResult): string {
  const lineSeparator = '='.repeat(80);
  const subSeparator = '-'.repeat(80);

  const authorsStr = Array.isArray(result.paper.authors) ? result.paper.authors.join(', ') : 'Not specified';
  const yearStr = result.paper.year ? result.paper.year.toString() : 'Unknown';

  let txt = `${lineSeparator}\n`;
  txt += `RESEARCHLENS AI - ACADEMIC RESEARCH EXTRACTION REPORT\n`;
  txt += `Generated on: ${new Date(result.metadata.generatedAt).toLocaleString()}\n`;
  txt += `${lineSeparator}\n\n`;

  // 1. Paper Overview
  txt += `1. PAPER INFORMATION\n`;
  txt += `${subSeparator}\n`;
  txt += `Title:        ${result.paper.title}\n`;
  txt += `Authors:      ${authorsStr}\n`;
  txt += `Year:         ${yearStr}\n`;
  txt += `URL:          ${result.paper.url}\n`;
  txt += `Abstract:\n${result.paper.abstract || 'No abstract available.'}\n\n`;

  if (result.customQuestion && result.customAnswer) {
    txt += `CUSTOM RESEARCH QUESTION INQUIRY\n`;
    txt += `${subSeparator}\n`;
    txt += `Question: ${result.customQuestion}\n`;
    txt += `Agent Response:\n${result.customAnswer}\n\n`;
  }

  // 2. Core Concepts
  txt += `2. CORE CONCEPT EXTRACTION (STUDENT-FRIENDLY SUMMARY)\n`;
  txt += `${subSeparator}\n`;
  txt += `${result.coreConcepts.summary}\n\n`;

  // 3. Problem Statement
  txt += `3. PROBLEM STATEMENT\n`;
  txt += `${subSeparator}\n`;
  txt += `${result.coreConcepts.problemStatement}\n\n`;

  // 4. Proposed Methodology
  txt += `4. PROPOSED METHODOLOGY\n`;
  txt += `${subSeparator}\n`;
  txt += `${result.coreConcepts.methodology}\n\n`;

  // 5. Algorithms & Technical Contributions
  txt += `5. ALGORITHMS AND TECHNICAL CONTRIBUTIONS\n`;
  txt += `${subSeparator}\n`;
  if (result.coreConcepts.keyBreakthroughs?.length > 0) {
    result.coreConcepts.keyBreakthroughs.forEach((b, idx) => {
      txt += `  [${idx + 1}] ${b}\n`;
    });
  } else {
    txt += `  None explicitly listed.\n`;
  }
  txt += `\n`;

  // 6. Architecture Description & Flowchart
  txt += `6. ARCHITECTURE DESCRIPTION & MERMAID FLOWCHART\n`;
  txt += `${subSeparator}\n`;
  txt += `System Pipeline Description:\n${result.architecture.description}\n\n`;
  txt += `[FLOWCHART] Mermaid Source:\n`;
  txt += `\`\`\`mermaid\n`;
  txt += `${result.architecture.mermaidCode}\n`;
  txt += `\`\`\`\n\n`;

  // 7. Future Work Opportunities
  txt += `7. FUTURE WORK & INTERNSHIP EXTENSION OPPORTUNITIES (3 IDEAS)\n`;
  txt += `${subSeparator}\n`;
  result.futureWork.forEach((idea, idx) => {
    txt += `Idea #${idx + 1}: ${idea.title}\n`;
    txt += `  Difficulty:                  ${idea.difficulty}\n`;
    txt += `  Exact Technical Extension:   ${idea.extension}\n`;
    txt += `  Problem Solved:              ${idea.problemSolved}\n`;
    txt += `  Implementation Approach:     ${idea.implementationApproach}\n`;
    txt += `  Target Performance Metric:   ${idea.targetMetric}\n`;
    txt += `  Recommended Tech Stack:      ${idea.technologyStack.join(', ')}\n`;
    txt += `  Portfolio Demonstration:     ${idea.portfolioDemonstration}\n\n`;
  });

  // 8. Recommended Technology Stack Aggregation
  const allTechStacks = Array.from(
    new Set(result.futureWork.flatMap(fw => fw.technologyStack || []))
  );
  txt += `8. RECOMMENDED TECHNOLOGY STACK SUMMARY\n`;
  txt += `${subSeparator}\n`;
  txt += `${allTechStacks.join(', ') || 'PyTorch, Python, Docker, FastAPI'}\n\n`;

  // 9. References and Sources
  txt += `9. REFERENCES AND SOURCES\n`;
  txt += `${subSeparator}\n`;
  if (Array.isArray(result.references) && result.references.length > 0) {
    result.references.forEach((ref, idx) => {
      if (typeof ref === 'string') {
        txt += `  [${idx + 1}] ${ref}\n`;
      } else {
        txt += `  [${idx + 1}] ${ref.title || 'Untitled'}`;
        if (ref.authors) txt += ` - ${ref.authors}`;
        if (ref.year) txt += ` (${ref.year})`;
        if (ref.citation) txt += ` - ${ref.citation}`;
        if (ref.relevance) txt += `\n      Relevance: ${ref.relevance}`;
        txt += `\n`;
      }
    });
  } else {
    txt += `  Direct citations derived from original paper body.\n`;
  }

  txt += `\n${lineSeparator}\n`;
  txt += `End of Report - ResearchLens AI\n`;
  return txt;
}

// Generate validated structured JSON matching the exact specification schema
export function generateValidatedJsonExport(result: ResearchAnalysisResult): { jsonString: string; valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Construct target JSON schema object strictly
  const exportObject = {
    paper: {
      title: result.paper?.title || '',
      authors: Array.isArray(result.paper?.authors) ? result.paper.authors : [],
      year: typeof result.paper?.year === 'number' ? result.paper.year : null,
      url: result.paper?.url || '',
      abstract: result.paper?.abstract || ''
    },
    coreConcepts: {
      problemStatement: result.coreConcepts?.problemStatement || '',
      methodology: result.coreConcepts?.methodology || '',
      keyBreakthroughs: Array.isArray(result.coreConcepts?.keyBreakthroughs) ? result.coreConcepts.keyBreakthroughs : [],
      summary: result.coreConcepts?.summary || ''
    },
    architecture: {
      description: result.architecture?.description || '',
      mermaidCode: result.architecture?.mermaidCode || ''
    },
    futureWork: (result.futureWork || []).map(fw => ({
      title: fw.title || '',
      extension: fw.extension || '',
      problemSolved: fw.problemSolved || '',
      implementationApproach: fw.implementationApproach || '',
      targetMetric: fw.targetMetric || '',
      technologyStack: Array.isArray(fw.technologyStack) ? fw.technologyStack : [],
      difficulty: fw.difficulty || 'Intermediate',
      portfolioDemonstration: fw.portfolioDemonstration || ''
    })),
    references: result.references || [],
    metadata: {
      generatedAt: result.metadata?.generatedAt || new Date().toISOString(),
      sourceType: result.metadata?.sourceType || 'url_fetch'
    }
  };

  // Validation checks according to prompt requirements
  if (!exportObject.paper.title) errors.push('Paper title is missing.');
  if (!exportObject.coreConcepts.summary) errors.push('Core concepts summary is missing.');
  if (!exportObject.architecture.mermaidCode) errors.push('Mermaid flowchart code is missing.');
  if (!Array.isArray(exportObject.futureWork) || exportObject.futureWork.length === 0) {
    errors.push('Future work opportunities are missing.');
  }

  let jsonString = '';
  try {
    jsonString = JSON.stringify(exportObject, null, 2);
    // Double check that it parses back cleanly
    JSON.parse(jsonString);
  } catch (e: any) {
    errors.push(`JSON serialization error: ${e.message}`);
  }

  return {
    jsonString,
    valid: errors.length === 0,
    errors
  };
}

// Browser helper to trigger file download
export function triggerDownload(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Clean filename slug from paper title
export function getPaperFileSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
    .substring(0, 45) || 'research-paper';
}
