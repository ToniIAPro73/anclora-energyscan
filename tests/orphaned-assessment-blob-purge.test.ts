import {
  ENERGYSCAN_ASSESSMENT_BLOB_PREFIXES,
  formatOrphanedBlobPurgeReport,
  purgeOrphanedAssessmentBlobs,
  type BlobListPage,
  type ListedAssessmentBlob,
  type OrphanedBlobPurgeDeps,
} from '@/lib/orphaned-assessment-blob-purge';

const NOW = new Date('2026-10-14T00:00:00.000Z');
const OWNER = 'c123456789012345678901234';
const ASSESSMENT = 'c223456789012345678901234';
const BATCH = '123e4567-e89b-42d3-a456-426614174000';

function blob(pathname: string, ageDays: number, size: number): ListedAssessmentBlob {
  return {
    pathname,
    uploadedAt: new Date(NOW.getTime() - ageDays * 24 * 60 * 60 * 1000),
    size,
  };
}

function defaultDeps(blobs: ListedAssessmentBlob[] = []): OrphanedBlobPurgeDeps & {
  list: jest.Mock<Promise<BlobListPage>, [ { prefix: string; cursor?: string; limit: number } ]>;
  findReferencedPaths: jest.Mock<Promise<string[]>, [string[]]>;
  delete: jest.Mock<Promise<void>, [string]>;
} {
  return {
    list: jest.fn(async ({ prefix }) => ({ blobs: blobs.filter(({ pathname }) => pathname.startsWith(prefix)), hasMore: false })),
    findReferencedPaths: jest.fn(async (_pathnames: string[]) => [] as string[]),
    delete: jest.fn(async (_pathname: string) => undefined),
  };
}

describe('purgeOrphanedAssessmentBlobs', () => {
  it('paginates each EnergyScan assessment prefix and classifies referenced, expired and recent objects', async () => {
    const referenced = `assessment-drafts/${OWNER}/${BATCH}/photo-1-synthetic.png`;
    const expired = `assessment-drafts/${OWNER}/${BATCH}/photo-2-old.png`;
    const recent = `assessments/${ASSESSMENT}/recent.pdf`;
    const deps = defaultDeps();
    deps.list.mockImplementation(async ({ prefix, cursor }) => {
      if (prefix === 'assessment-drafts/' && !cursor) {
        return { blobs: [blob(referenced, 120, 7)], cursor: 'opaque-next-page', hasMore: true };
      }
      if (prefix === 'assessment-drafts/' && cursor) {
        return { blobs: [blob(expired, 31, 11)], hasMore: false };
      }
      return { blobs: [blob(recent, 29, 13)], hasMore: false };
    });
    deps.findReferencedPaths.mockImplementation(async (paths) => paths.includes(`blob:${referenced}`) ? [`blob:${referenced}`] : []);

    const result = await purgeOrphanedAssessmentBlobs({ now: NOW, apply: true }, deps);

    expect(deps.list).toHaveBeenCalledTimes(3);
    expect(deps.list).toHaveBeenNthCalledWith(1, { prefix: ENERGYSCAN_ASSESSMENT_BLOB_PREFIXES[0], cursor: undefined, limit: 1000 });
    expect(deps.list).toHaveBeenNthCalledWith(2, { prefix: ENERGYSCAN_ASSESSMENT_BLOB_PREFIXES[0], cursor: 'opaque-next-page', limit: 1000 });
    expect(deps.list).toHaveBeenNthCalledWith(3, { prefix: ENERGYSCAN_ASSESSMENT_BLOB_PREFIXES[1], cursor: undefined, limit: 1000 });
    expect(deps.delete).toHaveBeenCalledTimes(1);
    expect(deps.delete).toHaveBeenCalledWith(expired);
    expect(result.scanned).toBe(3);
    expect(result.matrix['over-90'].a).toEqual({ count: 1, sizeBytes: 7 });
    expect(result.matrix['31-90'].b).toEqual({ count: 1, sizeBytes: 11 });
    expect(result.matrix['0-30'].c).toEqual({ count: 1, sizeBytes: 13 });
    expect(result.deleted).toBe(1);
  });

  it('does not delete an object at 30 days or a recent orphan and leaves simulation read-only', async () => {
    const deps = defaultDeps([
      blob(`assessment-drafts/${OWNER}/${BATCH}/exact-cutoff.png`, 30, 5),
      blob(`assessment-drafts/${OWNER}/${BATCH}/recent.png`, 29, 9),
    ]);

    const result = await purgeOrphanedAssessmentBlobs({ now: NOW }, deps);

    expect(deps.delete).not.toHaveBeenCalled();
    expect(result.candidateCount).toBe(0);
    expect(result.matrix['0-30'].c).toEqual({ count: 2, sizeBytes: 14 });
  });

  it('continues after a deletion error and returns aggregate failure counts', async () => {
    const first = `assessment-drafts/${OWNER}/${BATCH}/old-one.png`;
    const second = `assessment-drafts/${OWNER}/${BATCH}/old-two.png`;
    const deps = defaultDeps([blob(first, 90, 10), blob(second, 31, 20)]);
    deps.delete.mockImplementation(async (pathname) => {
      if (pathname === first) throw new Error('synthetic deletion failure');
    });

    const result = await purgeOrphanedAssessmentBlobs({ now: NOW, apply: true, batchLimit: 2 }, deps);

    expect(deps.delete).toHaveBeenCalledTimes(2);
    expect(result.attempted).toBe(2);
    expect(result.deleted).toBe(1);
    expect(result.failed).toBe(1);
  });

  it('bounds deletion to the configured limit and defers remaining oldest-first candidates', async () => {
    const older = `assessment-drafts/${OWNER}/${BATCH}/older.png`;
    const newer = `assessment-drafts/${OWNER}/${BATCH}/newer.png`;
    const deps = defaultDeps([blob(newer, 31, 10), blob(older, 90, 10)]);

    const result = await purgeOrphanedAssessmentBlobs({ now: NOW, apply: true, batchLimit: 1 }, deps);

    expect(deps.delete).toHaveBeenCalledTimes(1);
    expect(deps.delete).toHaveBeenCalledWith(older);
    expect(result.candidateCount).toBe(2);
    expect(result.attempted).toBe(1);
    expect(result.deferred).toBe(1);
  });

  it('ignores objects outside the requested EnergyScan prefix', async () => {
    const deps = defaultDeps([blob('other-project/private/file.png', 200, 99)]);
    deps.list.mockImplementation(async ({ prefix }) => ({
      blobs: prefix === 'assessment-drafts/' ? [blob('other-project/private/file.png', 200, 99)] : [],
      hasMore: false,
    }));

    const result = await purgeOrphanedAssessmentBlobs({ now: NOW, apply: true }, deps);

    expect(deps.delete).not.toHaveBeenCalled();
    expect(deps.list.mock.calls.map(([options]) => options.prefix)).toEqual([...ENERGYSCAN_ASSESSMENT_BLOB_PREFIXES]);
    expect(result.scanned).toBe(0);
  });

  it('reports unknown EnergyScan shapes as class d and never deletes them', async () => {
    const unknown = 'assessment-drafts/synthetic-legacy-owner/old-private-fixture.pdf';
    const recognized = `assessment-drafts/${OWNER}/${BATCH}/recognized-old.png`;
    const deps = defaultDeps([blob(unknown, 120, 99), blob(recognized, 31, 17)]);

    const result = await purgeOrphanedAssessmentBlobs({ now: NOW, apply: true }, deps);
    const report = formatOrphanedBlobPurgeReport(result, true);

    expect(result.matrix['over-90'].d).toEqual({ count: 1, sizeBytes: 99 });
    expect(result.shapes).toContainEqual({
      shape: 'assessment-drafts/{text-short}/{file}',
      segmentCount: 3,
      ageBand: 'over-90',
      count: 1,
      sizeBytes: 99,
    });
    expect(deps.delete).toHaveBeenCalledTimes(1);
    expect(deps.delete).toHaveBeenCalledWith(recognized);
    expect(report).toContain('shape=assessment-drafts/{text-short}/{file} segments=3 count=1 size_bytes=99 age=over-90');
    expect(report).not.toContain('synthetic-legacy-owner');
    expect(report).not.toContain('old-private-fixture.pdf');
    expect(report).not.toContain(unknown);
  });

  it('labels each path segment with a bounded, identifier-free shape category', async () => {
    const otherUuid = '123e4567-e89b-11d3-a456-426614174000';
    const longSegment = 'x'.repeat(40);
    const paths = [
      `assessment-drafts/${OWNER}/${otherUuid}/private-a.png`,
      `assessments/123/private-b.pdf`,
      `assessment-drafts/${longSegment}/${BATCH}/private-c.pdf`,
    ];
    const deps = defaultDeps(paths.map((path, index) => blob(path, 40 + index, 10 + index)));
    const result = await purgeOrphanedAssessmentBlobs({ now: NOW }, deps);
    const report = formatOrphanedBlobPurgeReport(result, false);

    expect(report).toContain('shape=assessment-drafts/{cuid}/{other-uuid}/{file} segments=4 count=1 size_bytes=10 age=31-90');
    expect(report).toContain('shape=assessments/{numeric}/{file} segments=3 count=1 size_bytes=11 age=31-90');
    expect(report).toContain('shape=assessment-drafts/{text-long}/{uuid-v4}/{file} segments=4 count=1 size_bytes=12 age=31-90');
    for (const path of paths) expect(report).not.toContain(path);
    expect(report).not.toContain('private-a.png');
    expect(report).not.toContain(otherUuid);
    expect(report).not.toContain(longSegment);
  });

  it('formats aggregate counts without paths, filenames, cursors or user IDs', async () => {
    const path = `assessment-drafts/${OWNER}/${BATCH}/private-fixture-filename.png`;
    const deps = defaultDeps([blob(path, 31, 42)]);
    const result = await purgeOrphanedAssessmentBlobs({ now: NOW }, deps);

    const output = formatOrphanedBlobPurgeReport(result, false);

    expect(output).toContain('mode=SIMULATION');
    expect(output).toContain('age=31-90 type=b count=1 size_bytes=42');
    expect(output).not.toContain(OWNER);
    expect(output).not.toContain(BATCH);
    expect(output).not.toContain('private-fixture-filename');
    expect(output).not.toContain(path);
  });
});
