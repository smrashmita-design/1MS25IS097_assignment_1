import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

// Load .env from the project root so the API key is always found,
// regardless of the working directory the server was started from.
dotenv.config({ path: path.join(projectRoot, '.env') });

export const config = {
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3001,
  defaultModel: process.env.GEMINI_MODEL || 'gemini-2.5-flash',

  /**
   * The Gemini API key is read exclusively from the server environment
   * (.env / process.env). It is never accepted from, or exposed to, the client.
   */
  getApiKey(): string {
    return (process.env.GEMINI_API_KEY || '').trim();
  },

  hasApiKey(): boolean {
    return this.getApiKey().length > 0;
  },

  /** Where the key came from - surfaced in /api/status for diagnostics. */
  apiKeySource(): 'env' | 'missing' {
    return this.hasApiKey() ? 'env' : 'missing';
  }
};
