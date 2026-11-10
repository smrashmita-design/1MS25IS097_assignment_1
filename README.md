# ResearchLens AI 🔬
> **AI-Powered Computer Science Research Paper Extractor, Architecture Visualizer & Student Extension Discovery**

ResearchLens AI is a modern web application designed for computer science students, researchers, and university academic evaluation. It allows users to submit research paper URLs (e.g. arXiv, OpenReview, direct PDFs) or upload local academic PDF papers. The autonomous Gemini AI agent extracts technical contributions, synthesizes core concepts in plain language under 300 words, visualizes system architectures with interactive Mermaid.js flowcharts, and discovers exactly 3 concrete resume/internship extension projects.

---

## 🌟 Key Features

1. **Academic Paper Ingestion**
   - **arXiv API & PDF Retrieval:** Instant metadata and text extraction from arXiv links (`https://arxiv.org/abs/...` or `.../pdf/...`).
   - **Local PDF Upload:** Drag-and-drop file processing with client-side validation and server-side text extraction.
   - **Token Efficiency Guardrails:** Strict budgeting ensuring total agent execution stays well under **25,000 tokens**.
   - **Custom Research Questions:** Students can ask custom technical questions answered in the context of the paper.

2. **Core Concept Synthesis**
   - Summarizes the problem statement, why it matters, the proposed methodology, and key mathematical/algorithmic breakthroughs in under 300 words using plain, student-friendly language.
   - Anti-hallucination controls with low-temperature factual grounding.

3. **Mermaid.js Architecture Flowchart**
   - Syntactically verified `graph TD` diagrams representing input data, preprocessing, major system components, model layers, pipelines, and final outputs.
   - Every diagram is repaired (labels quoted, orphan labels given an id, broken arrows normalised) and then validated before it is rendered.
   - The browser re-validates with Mermaid's own parser and falls back to a repaired or rebuilt diagram, so a chart always appears instead of a syntax warning.
   - Interactive zoom in/out, pan, full-screen modal viewport.
   - Direct export to SVG and PNG.
   - Raw source code toggle and one-click copy.
   - Diagram regeneration with custom refinement prompts.

4. **Future Work & Internship Opportunities**
   - Brainstorms exactly 3 concrete, realistic extension projects for a 3rd-year CS student.
   - Includes project title, exact technical extension, problem solved, implementation approach, targeted metric (e.g. latency, memory, accuracy), tech stack (PyTorch, ONNX Runtime, Docker, etc.), difficulty level, and portfolio demonstration tips.

5. **Research History & Local Storage**
   - Persisted locally in browser storage (`localStorage`).
   - Searchable by paper title, keywords, or URL.
   - 1-click reopen, delete, or bulk export.
   - Zero sensitive credentials or API keys stored in client storage.

6. **Structured Export Capabilities**
   - **TXT Export:** Formatted, human-readable academic report containing all 9 sections.
   - **JSON Export:** Validated structured JSON adhering strictly to academic schema requirements.

7. **Pre-Analyzed Benchmark Papers**
   - Instant zero-friction demo mode featuring *Attention Is All You Need* (Transformer), *LoRA: Low-Rank Adaptation*, and *Deep Residual Learning for Image Recognition* (ResNet).

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS 4, Lucide React, Mermaid.js |
| **Backend** | Node.js, Express, TypeScript, Multer, `pdf-parse`, `archiver` |
| **AI & LLM** | Google Gemini API (`@google/genai` official SDK), Google Search Grounding |
| **Styling** | Warm off-white (`#F8F9FA`) with deep navy accents (`#0A192F`), Dark mode |
| **Exports** | Plain Text (`.txt`), Validated Structured JSON (`.json`), Source ZIP |

---

## 📁 Project Structure

```
C:\Rashmita\
├── client/                     # Frontend assets & styling
├── src/
│   ├── components/             # Reusable React components
│   │   ├── Sidebar.tsx         # Primary navigation (Dashboard, New, History, About)
│   │   ├── Header.tsx          # Read-only server status, dark mode toggle, ZIP download
│   │   ├── Dashboard.tsx       # Hero, stats, 3-step workflow, benchmark papers
│   │   ├── NewAnalysis.tsx     # Submission page (URL & PDF upload, custom questions)
│   │   ├── ResultsView.tsx     # 9-section tabbed research dashboard
│   │   ├── MermaidDiagram.tsx  # Mermaid rendering, SVG/PNG download, regeneration
│   │   ├── DiagramModal.tsx    # Full-screen pan/zoom modal
│   │   ├── ExportButtons.tsx   # TXT and JSON export handlers
│   │   ├── HistoryView.tsx     # Searchable local paper history
│   │   └── AboutView.tsx       # System documentation & prompt specifications
│   ├── data/
│   │   ├── constants.ts        # AI Research Agent exact system prompt
│   │   └── samplePapers.ts     # Pre-analyzed benchmark research papers
│   ├── services/
│   │   ├── api.ts              # Backend API client
│   │   ├── exporter.ts         # TXT & JSON formatters and validators
│   │   └── storage.ts          # LocalStorage history manager
│   ├── types/
│   │   └── research.ts         # TypeScript interfaces & JSON schemas
│   ├── utils/
│   │   └── mermaidSanitizer.ts # Flowchart repair (shared by server & browser)
│   ├── App.tsx                 # Root React application
│   ├── main.tsx                # React DOM entry point
│   └── index.css               # Tailwind CSS & custom design tokens
├── server/
│   ├── config.ts               # Server environment configuration & key management
│   ├── gemini.ts               # Official @google/genai SDK integration & agent logic
│   ├── mermaidValidator.ts     # Flowchart validation with Mermaid's own parser
│   ├── paperExtractor.ts       # arXiv API, PDF extraction, token limiters
│   ├── exportZip.ts            # Project source code ZIP streaming endpoint
│   ├── samplePapers.ts         # Server sample paper exports
│   └── index.ts                # Express server and REST API endpoints
├── scripts/
│   └── verify-mermaid.mjs      # Verifies the flowchart repair chain renders
├── index.html                  # HTML entry point with academic Google Fonts
├── vite.config.ts              # Vite configuration with proxy to port 3001
├── tsconfig.json               # TypeScript configuration
├── package.json                # Project dependencies and run scripts
├── .env.example                # Example environment variables
└── README.md                   # Complete documentation
```

---

## 🚀 Installation & Setup

### Prerequisites
- **Node.js** (v18.0.0 or higher, v22+ recommended)
- **npm** (v9.0.0 or higher)
- A **Google Gemini API Key** from [Google AI Studio](https://aistudio.google.com/)

### 1. Clone or Extract the Project
```bash
git clone <repository-url>
cd ResearchLens-AI
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Open `.env` and paste your Gemini API key:
```env
GEMINI_API_KEY=your_actual_gemini_api_key_here
PORT=3001
GEMINI_MODEL=gemini-2.5-flash
```

> **The API key lives on the server only.** There is no API key input anywhere in the UI.
> The backend reads `GEMINI_API_KEY` from the `.env` file in the project root (it is loaded
> from the project root regardless of the directory the server is started from) and uses it
> for every Gemini call. The key is never sent to the browser and never stored in
> `localStorage`. Restart the backend (`npm run server:dev`) after changing `.env`.
>
> The header shows a read-only **Gemini API: Ready / Server Key Missing / Server Offline**
> indicator that reflects the backend's real status via `GET /api/status`.

---

## 🏃 Running the Application

### Development Mode (Concurrent Frontend & Backend)
Run both the Vite frontend (`http://localhost:5173`) and the Express backend (`http://localhost:3001`):
```bash
npm run dev
```

### Production Build & Run
Build the optimized frontend bundle and run the unified Express server:
```bash
npm run build
npm start
```
The application will be live at **`http://localhost:3001`**.

---

## 🤖 How to Use the AI Research Agent

1. **Open the Dashboard:** View summary statistics and explore pre-loaded benchmark papers (*Attention Is All You Need*, *LoRA*, *ResNet*).
2. **Submit a Paper:**
   - Click **New Analysis** in the sidebar.
   - Choose **Option A (Paper URL)** and enter an arXiv URL (e.g. `https://arxiv.org/abs/2106.09685`) or direct paper link.
   - Or choose **Option B (Upload PDF)** and select a research paper file from your computer.
   - *(Optional)* Add a custom research question for the agent to answer.
3. **Analyze:** Click **Analyze Paper**. The agent will:
   - Ingest and budget tokens to remain under 25,000 tokens.
   - Summarize the core concept under 300 words.
   - Formulate the Mermaid architecture diagram (`graph TD`).
   - Brainstorm 3 student resume extension projects.
4. **Explore the Results Dashboard:**
   - Navigate through the 9 specialized sections or view the complete report.
   - Pan and zoom the Mermaid diagram in full-screen or download it as SVG/PNG.
   - Regenerate the diagram with custom instructions if desired.
5. **Export Your Report:**
   - Click **Export TXT** to download a clean, formatted text document.
   - Click **Export JSON** to download a validated structured JSON schema.

---

## 📄 Academic Research Agent Prompt

ResearchLens AI strictly follows this system prompt for all extractions:

```
You are an advanced Computer Science Research Agent specializing in parsing academic papers, extracting system architectures, and identifying student development opportunities.

OPERATIONAL CONSTRAINTS:
- You must always prioritize token efficiency. Ensure your total analysis and tool execution stays well under 25,000 tokens.
- If a paper is too long to ingest entirely, use the Web Search tool to look up summaries, abstracts, and open-source implementations (e.g. GitHub) of the paper's title to gather context efficiently.
- Always distinguish information extracted from the actual paper from supplementary web research.
- Never fabricate research findings, citations, experiments, performance metrics or technical claims.

When a user provides a research paper URL or PDF, execute these steps:

1. CORE CONCEPT EXTRACTION
Summarize the problem statement, primary methodology, and key breakthroughs in under 300 words. Explain complex concepts in student-friendly language.

2. ARCHITECTURAL FLOWCHART (MERMAID.JS)
Generate a clean, syntactically correct Mermaid.js flowchart using graph TD representing input data, preprocessing, major components, model layers, pipeline, and outputs.

3. FUTURE WORK & INTERNSHIP OPPORTUNITIES
Brainstorm exactly 3 concrete, realistic ways a third-year CS student could build upon this paper for a resume project (title, extension, problem solved, implementation, target metric, tech stack, difficulty, portfolio demonstration).
```

---

## 🔒 Security & Privacy

- All Gemini API interactions happen exclusively on the Node.js server.
- The API key is read only from the server environment (`.env` / `process.env`); the client
  has no key input, no key endpoint, and no key in the JavaScript bundle.
- API keys are never stored in client browser storage or exposed in JavaScript bundles.
- No confidential research documents are permanently stored on the server disk; PDF files are processed in-memory.

---

## 🩺 Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| Header shows **Server Offline** | Backend not running | `npm run server:dev` (port 3001) |
| Header shows **Server Key Missing** | `GEMINI_API_KEY` absent from `.env` | Add it to `.env` in the project root, then restart the backend |
| `400 ... Developer instruction is not enabled for api version v1` | SDK pinned to the wrong API version | Already handled — the client pins `apiVersion: 'v1beta'` in `server/gemini.ts` |
| `Cannot find module 'archiver'` / ESM export error | `archiver` v8 is ESM-only and breaks the default import | Already handled — `archiver` is pinned to `^7.0.1` in `package.json` |
| "Mermaid Syntax Warning" panel | The model emitted a label the Mermaid grammar cannot parse | Already handled — the diagram is repaired and re-validated in the browser, which falls back to a rebuilt graph; run `npm run verify:mermaid` to re-check the repair chain |
| `The Gemini API quota for this project is exhausted` | Free tier limit (20 requests/day) | Wait for the daily reset or use a billing-enabled API key |

---

## 📝 License
MIT License. Created for Computer Science academic assignment and technical presentation.
