import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { existsSync } from 'node:fs';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import type { ParseDocumentInput, ParsedDocument } from './types';

const execFileAsync = promisify(execFile);

function resolveMineruWrapperPath() {
  return process.env.MINERU_AGENT_INGEST_PATH
    ?? `${process.env.HOME}/projects/agent-tooling/mineru/bin/mineru-agent-ingest.sh`;
}

function resolveMineruBackend() {
  return process.env.MINERU_DEFAULT_BACKEND ?? 'pipeline';
}

function resolveMineruTimeoutMs() {
  const raw = Number(process.env.MINERU_PARSE_TIMEOUT_MS ?? '180000');
  return Number.isFinite(raw) && raw > 0 ? raw : 180000;
}

function parseOutputBlock(stdout: string, marker: string) {
  const lines = stdout.split(/\r?\n/);
  const index = lines.findIndex((line) => line.trim() === marker);
  if (index === -1) return '';
  return lines.slice(index + 1).map((line) => line.trim()).find(Boolean) ?? '';
}

function parseOutputFiles(stdout: string, marker: string) {
  const lines = stdout.split(/\r?\n/);
  const index = lines.findIndex((line) => line.trim() === marker);
  if (index === -1) return [];
  const collected: string[] = [];
  for (let i = index + 1; i < lines.length; i += 1) {
    const line = lines[i].trim();
    if (!line) continue;
    if (line.startsWith('===')) break;
    collected.push(line);
  }
  return collected;
}

export class MinerUDocumentParser {
  async parse(input: ParseDocumentInput): Promise<ParsedDocument> {
    const wrapperPath = resolveMineruWrapperPath();
    if (!existsSync(wrapperPath)) {
      throw new Error(`MinerU no instalado o wrapper no encontrado en ${wrapperPath}`);
    }

    const tempRoot = await mkdtemp(path.join(os.tmpdir(), 'energyscan-mineru-'));
    const tempInputPath = path.join(tempRoot, input.fileName || 'document.pdf');

    try {
      await writeFile(tempInputPath, input.buffer);
      const { stdout, stderr } = await execFileAsync(
        wrapperPath,
        [tempInputPath, 'energyscan', resolveMineruBackend()],
        {
          timeout: resolveMineruTimeoutMs(),
          maxBuffer: 1024 * 1024 * 12,
        }
      );

      const outputRoot = parseOutputBlock(stdout, '=== OUTPUT_ROOT ===');
      const markdownCandidates = parseOutputFiles(stdout, '=== MARKDOWN_CANDIDATES ===');
      const jsonCandidates = parseOutputFiles(stdout, '=== JSON_CANDIDATES ===');
      const outputFiles = parseOutputFiles(stdout, '=== OUTPUT_FILES ===');

      if (!outputRoot) {
        throw new Error('MinerU no devolvio OUTPUT_ROOT');
      }
      if (markdownCandidates.length === 0) {
        throw new Error('MinerU no genero Markdown util');
      }

      const markdown = await readFile(markdownCandidates[0], 'utf8');
      const json = jsonCandidates[0]
        ? JSON.parse(await readFile(jsonCandidates[0], 'utf8'))
        : undefined;

      return {
        engine: 'mineru',
        sourceFileName: input.fileName,
        mimeType: input.mimeType,
        markdown,
        text: markdown,
        json,
        images: outputFiles.filter((file) => /\.(png|jpg|jpeg|webp)$/i.test(file)),
        metadata: {
          outputRoot,
          backend: resolveMineruBackend(),
          markdownPath: markdownCandidates[0],
          jsonPath: jsonCandidates[0],
          stderr: stderr.trim() || undefined,
        },
        warnings: [],
        confidence: markdown.trim().length > 400 ? 0.9 : 0.72,
      };
    } catch (error) {
      if (error instanceof Error && /timed out/i.test(error.message)) {
        throw new Error('MinerU supero el timeout configurado para este documento');
      }
      throw error;
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  }
}
