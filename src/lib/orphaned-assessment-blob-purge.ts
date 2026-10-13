import { ASSESSMENT_RETENTION_MS } from './assessment-retention';
import { toBlobPurgeDiagnostic, type BlobPurgeDiagnostic } from './blob-purge-diagnostics';

export const ENERGYSCAN_ASSESSMENT_BLOB_PREFIXES = ['assessment-drafts/', 'assessments/'] as const;
export const BLOB_PURGE_PAGE_SIZE = 1000;
export const DEFAULT_BLOB_PURGE_BATCH_LIMIT = 100;
export const MAX_BLOB_PURGE_BATCH_LIMIT = 1000;

const DAY_MS = 24 * 60 * 60 * 1000;
const UUID_V4_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const ASSESSMENT_ID_PATTERN = /^c[a-z0-9]{24}$/i;

export type BlobPurgeAgeBand = '0-30' | '31-90' | 'over-90';
export type BlobPurgeObjectType = 'a' | 'a-legacy' | 'b' | 'c' | 'd';

export type BlobPurgeCell = { count: number; sizeBytes: number };
export type BlobPurgeMatrix = Record<BlobPurgeAgeBand, Record<BlobPurgeObjectType, BlobPurgeCell>>;
export type BlobPurgeShapeCell = BlobPurgeCell & { shape: string; segmentCount: number; ageBand: BlobPurgeAgeBand };
export type BlobPurgeLegacyShapeCell = {
  ageBand: BlobPurgeAgeBand;
  referenced: BlobPurgeCell;
  orphaned: BlobPurgeCell;
};

export type ListedAssessmentBlob = {
  pathname: string;
  uploadedAt: Date;
  size: number;
};

export type BlobListPage = {
  blobs: ListedAssessmentBlob[];
  cursor?: string;
  hasMore: boolean;
};

export type OrphanedBlobPurgeResult = {
  scanned: number;
  matrix: BlobPurgeMatrix;
  shapes: BlobPurgeShapeCell[];
  legacyShape: BlobPurgeLegacyShapeCell[];
  candidateCount: number;
  batchLimit: number;
  attempted: number;
  deleted: number;
  failed: number;
  skippedReferenced: number;
  deferred: number;
};

export type OrphanedBlobPurgeOptions = {
  now?: Date | number;
  apply?: boolean;
  batchLimit?: number;
};

export type OrphanedBlobPurgeDeps = {
  list: (options: { prefix: string; cursor?: string; limit: number }) => Promise<BlobListPage>;
  findReferencedPaths: (pathnames: string[]) => Promise<string[]>;
  delete: (pathname: string) => Promise<unknown>;
  onDeleteFailure?: (diagnostic: BlobPurgeDiagnostic) => void;
};

function emptyMatrix(): BlobPurgeMatrix {
  const cell = (): BlobPurgeCell => ({ count: 0, sizeBytes: 0 });
  return {
    '0-30': { a: cell(), 'a-legacy': cell(), b: cell(), c: cell(), d: cell() },
    '31-90': { a: cell(), 'a-legacy': cell(), b: cell(), c: cell(), d: cell() },
    'over-90': { a: cell(), 'a-legacy': cell(), b: cell(), c: cell(), d: cell() },
  };
}

function emptyLegacyShape(): BlobPurgeLegacyShapeCell[] {
  const cell = (): BlobPurgeCell => ({ count: 0, sizeBytes: 0 });
  return [
    { ageBand: '0-30', referenced: cell(), orphaned: cell() },
    { ageBand: '31-90', referenced: cell(), orphaned: cell() },
    { ageBand: 'over-90', referenced: cell(), orphaned: cell() },
  ];
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const UUID_V4_SHAPE_PATTERN = UUID_V4_PATTERN;
const CUID_PATTERN = /^c[a-z0-9]{24}$/i;

function getSafeSegmentShape(segment: string): string {
  if (UUID_V4_SHAPE_PATTERN.test(segment)) return '{uuid-v4}';
  if (UUID_PATTERN.test(segment)) return '{other-uuid}';
  if (CUID_PATTERN.test(segment)) return '{cuid}';
  if (/^\d+$/.test(segment)) return '{numeric}';
  return segment.length <= 32 ? '{text-short}' : '{text-long}';
}

function getSafeBlobShape(pathname: string): { shape: string; segmentCount: number } {
  const segments = pathname.split('/');
  const safeSegments = segments.map((segment, index) => {
    if (index === 0 && (segment === 'assessment-drafts' || segment === 'assessments')) return segment;
    if (index === segments.length - 1 && segment.length > 0) return '{file}';
    return getSafeSegmentShape(segment);
  });
  return { shape: safeSegments.join('/'), segmentCount: segments.length };
}

function normalizeStoredPath(path: string): string {
  return path.startsWith('blob:') ? path.slice('blob:'.length) : path;
}

/** Accept only the concrete key shapes EnergyScan writes for assessment files. */
export function isEnergyScanAssessmentBlobPath(pathname: string): boolean {
  if (!pathname || pathname.startsWith('/') || pathname.includes('\\')) return false;
  const segments = pathname.split('/');
  if (segments.some((segment) => !segment || segment === '.' || segment === '..')) return false;

  if (pathname.startsWith('assessment-drafts/')) {
    return segments.length === 4 &&
      segments[0] === 'assessment-drafts' &&
      /^[a-z0-9_-]{1,64}$/i.test(segments[1]) &&
      UUID_V4_PATTERN.test(segments[2]) &&
      segments[3].length > 0;
  }

  if (pathname.startsWith('assessments/')) {
    return segments.length === 3 &&
      segments[0] === 'assessments' &&
      (ASSESSMENT_ID_PATTERN.test(segments[1]) || segments[1] === 'unassigned') &&
      segments[2].length > 0;
  }

  return false;
}

export function isLegacyEnergyScanDraftBlobPath(pathname: string): boolean {
  if (!pathname || pathname.startsWith('/') || pathname.includes('\\')) return false;
  const segments = pathname.split('/');
  if (segments.length !== 3 || segments[0] !== 'assessment-drafts') return false;
  const [, id, filename] = segments;
  return UUID_V4_PATTERN.test(id) && filename.length > 0 && filename !== '.' && filename !== '..' && !filename.includes('..');
}

function getAgeBand(ageMs: number): BlobPurgeAgeBand {
  const ageDays = Math.ceil(Math.max(0, ageMs) / DAY_MS);
  if (ageDays <= 30) return '0-30';
  if (ageDays <= 90) return '31-90';
  return 'over-90';
}

function checkedBatchLimit(value: number | undefined): number {
  const limit = value ?? DEFAULT_BLOB_PURGE_BATCH_LIMIT;
  if (!Number.isSafeInteger(limit) || limit < 1 || limit > MAX_BLOB_PURGE_BATCH_LIMIT) {
    throw new Error('Blob purge batch limit is invalid.');
  }
  return limit;
}

function addOldestCandidate(
  candidates: ListedAssessmentBlob[],
  candidate: ListedAssessmentBlob,
  maxCandidates: number,
) {
  candidates.push(candidate);
  candidates.sort((left, right) => left.uploadedAt.getTime() - right.uploadedAt.getTime());
  if (candidates.length > maxCandidates) candidates.pop();
}

/**
 * Lists only EnergyScan assessment namespaces, classifies each object against
 * all assessment attachment rows, and optionally deletes the oldest orphaned
 * candidates in a bounded batch. Paths and identifiers are never returned.
 */
export async function purgeOrphanedAssessmentBlobs(
  options: OrphanedBlobPurgeOptions,
  deps: OrphanedBlobPurgeDeps,
): Promise<OrphanedBlobPurgeResult> {
  const nowMs = options.now instanceof Date ? options.now.getTime() : options.now ?? Date.now();
  if (!Number.isFinite(nowMs)) throw new Error('Blob purge date is invalid.');
  const batchLimit = checkedBatchLimit(options.batchLimit);
  const matrix = emptyMatrix();
  const legacyShape = emptyLegacyShape();
  const shapeCells = new Map<string, BlobPurgeShapeCell>();
  const candidates: ListedAssessmentBlob[] = [];
  let scanned = 0;
  let candidateCount = 0;

  for (const prefix of ENERGYSCAN_ASSESSMENT_BLOB_PREFIXES) {
    let cursor: string | undefined;
    let hasMore = true;
    while (hasMore) {
      const page = await deps.list({ prefix, cursor, limit: BLOB_PURGE_PAGE_SIZE });
      const validBlobs = page.blobs.filter((blob) => {
        if (!blob.pathname.startsWith(prefix)) return false;
        if (!(blob.uploadedAt instanceof Date) || !Number.isFinite(blob.uploadedAt.getTime()) || !Number.isSafeInteger(blob.size) || blob.size < 0) {
          throw new Error('Blob metadata validation failed.');
        }
        return true;
      });

      const storedPaths = validBlobs.flatMap(({ pathname }) => [pathname, `blob:${pathname}`]);
      const referencedPaths = new Set((storedPaths.length ? await deps.findReferencedPaths(storedPaths) : []).map(normalizeStoredPath));

      for (const blob of validBlobs) {
        scanned += 1;
        const ageMs = nowMs - blob.uploadedAt.getTime();
        const ageBand = getAgeBand(ageMs);
        const legacyShapePath = isLegacyEnergyScanDraftBlobPath(blob.pathname);
        const recognizedShape = legacyShapePath || isEnergyScanAssessmentBlobPath(blob.pathname);
        const referenced = referencedPaths.has(blob.pathname);
        const expiredOrphan = !referenced && ageMs > ASSESSMENT_RETENTION_MS;
        const type: BlobPurgeObjectType = !recognizedShape ? 'd' : referenced ? legacyShapePath ? 'a-legacy' : 'a' : expiredOrphan ? 'b' : 'c';
        const cell = matrix[ageBand][type];
        cell.count += 1;
        cell.sizeBytes += blob.size;

        if (legacyShapePath) {
          const stats = legacyShape.find((entry) => entry.ageBand === ageBand);
          const target = referenced ? stats?.referenced : stats?.orphaned;
          if (target) {
            target.count += 1;
            target.sizeBytes += blob.size;
          }
        }

        const { shape, segmentCount } = getSafeBlobShape(blob.pathname);
        const shapeKey = `${ageBand}:${shape}`;
        const shapeCell = shapeCells.get(shapeKey) ?? { shape, segmentCount, ageBand, count: 0, sizeBytes: 0 };
        shapeCell.count += 1;
        shapeCell.sizeBytes += blob.size;
        shapeCells.set(shapeKey, shapeCell);

        if (recognizedShape && expiredOrphan) {
          candidateCount += 1;
          if (options.apply) addOldestCandidate(candidates, blob, batchLimit);
        }
      }

      hasMore = page.hasMore;
      if (hasMore && !page.cursor) throw new Error('Blob pagination cursor is missing.');
      cursor = page.cursor;
    }
  }

  let deleted = 0;
  let failed = 0;
  let skippedReferenced = 0;
  let attempted = 0;
  if (options.apply) {
    for (const candidate of candidates) {
      const candidateAgeBand = getAgeBand(nowMs - candidate.uploadedAt.getTime());
      let references: string[];
      try {
        references = await deps.findReferencedPaths([candidate.pathname, `blob:${candidate.pathname}`]);
      } catch (error) {
        failed += 1;
        deps.onDeleteFailure?.(toBlobPurgeDiagnostic('CLASSIFY', error));
        continue;
      }
      if (new Set(references.map(normalizeStoredPath)).has(candidate.pathname)) {
        skippedReferenced += 1;
        const legacyShapePath = isLegacyEnergyScanDraftBlobPath(candidate.pathname);
        const oldCell = matrix[candidateAgeBand].b;
        oldCell.count -= 1;
        oldCell.sizeBytes -= candidate.size;
        const newCell = matrix[candidateAgeBand][legacyShapePath ? 'a-legacy' : 'a'];
        newCell.count += 1;
        newCell.sizeBytes += candidate.size;
        if (legacyShapePath) {
          const stats = legacyShape.find((entry) => entry.ageBand === candidateAgeBand);
          if (stats) {
            stats.orphaned.count -= 1;
            stats.orphaned.sizeBytes -= candidate.size;
            stats.referenced.count += 1;
            stats.referenced.sizeBytes += candidate.size;
          }
        }
        continue;
      }
      try {
        attempted += 1;
        await deps.delete(candidate.pathname);
        deleted += 1;
      } catch (error) {
        failed += 1;
        deps.onDeleteFailure?.(toBlobPurgeDiagnostic('DELETE', error));
      }
    }
  }

  return {
    scanned,
    matrix,
    shapes: Array.from(shapeCells.values()).sort((left, right) =>
      left.shape.localeCompare(right.shape) || left.ageBand.localeCompare(right.ageBand)),
    legacyShape,
    candidateCount,
    batchLimit,
    attempted,
    deleted,
    failed,
    skippedReferenced,
    deferred: Math.max(0, candidateCount - candidates.length),
  };
}

export function formatOrphanedBlobPurgeReport(
  result: OrphanedBlobPurgeResult,
  apply: boolean,
): string {
  const ageBands: BlobPurgeAgeBand[] = ['0-30', '31-90', 'over-90'];
  const types: BlobPurgeObjectType[] = ['a', 'a-legacy', 'b', 'c', 'd'];
  const lines = [`mode=${apply ? 'APPLY' : 'SIMULATION'}`, `batch_limit=${result.batchLimit}`];
  for (const ageBand of ageBands) {
    for (const type of types) {
      const { count, sizeBytes } = result.matrix[ageBand][type];
      lines.push(`age=${ageBand} type=${type} count=${count} size_bytes=${sizeBytes}`);
    }
  }
  for (const shape of result.shapes) {
    lines.push(`shape=${shape.shape} segments=${shape.segmentCount} count=${shape.count} size_bytes=${shape.sizeBytes} age=${shape.ageBand}`);
  }
  for (const legacy of result.legacyShape) {
    lines.push(`legacy_shape=assessment-drafts/{uuid-v4}/{file} age=${legacy.ageBand} referenced_count=${legacy.referenced.count} referenced_size_bytes=${legacy.referenced.sizeBytes} orphaned_count=${legacy.orphaned.count} orphaned_size_bytes=${legacy.orphaned.sizeBytes}`);
  }
  lines.push(`candidates=${result.candidateCount} attempted=${result.attempted} deleted=${result.deleted} failed=${result.failed} skipped_referenced=${result.skippedReferenced} deferred=${result.deferred}`);
  return lines.join('\n');
}
