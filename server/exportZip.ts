import archiver from 'archiver';
import path from 'path';
import fs from 'fs';
import { Response } from 'express';

export function createProjectZipStream(res: Response, projectRoot: string) {
  const archive = archiver('zip', {
    zlib: { level: 9 }
  });

  res.attachment('ResearchLens-AI-SourceCode.zip');
  archive.pipe(res);

  // Files/folders to explicitly exclude
  const excludes = [
    'node_modules',
    '.git',
    '.env',
    '.env.local',
    'dist',
    'dist-ssr',
    'uploads',
    'tmp'
  ];

  // Helper to recursively add files
  function addDirectoryToZip(dir: string, baseDir: string = '') {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      if (excludes.includes(entry.name)) continue;

      const fullPath = path.join(dir, entry.name);
      const relativePath = path.join(baseDir, entry.name).replace(/\\/g, '/');

      if (entry.isDirectory()) {
        addDirectoryToZip(fullPath, relativePath);
      } else if (entry.isFile()) {
        archive.file(fullPath, { name: relativePath });
      }
    }
  }

  addDirectoryToZip(projectRoot);
  archive.finalize();
}
