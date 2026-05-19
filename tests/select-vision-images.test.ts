import { selectImagesForVisionAnalysis } from '@/lib/vision/select-vision-images';
import type { AttachmentLike } from '@/lib/vision/select-vision-images';

const jpg = (id: string, category?: string, analyzed = false): AttachmentLike => ({
  id,
  type: 'image/jpeg',
  category,
  analysis: analyzed ? { status: 'DONE' } : null,
});

const pdf = (id: string): AttachmentLike => ({ id, type: 'application/pdf' });

describe('selectImagesForVisionAnalysis', () => {
  it('returns empty array when maxImages is 0', () => {
    const result = selectImagesForVisionAnalysis({ attachments: [jpg('a'), jpg('b')], maxImages: 0 });
    expect(result).toHaveLength(0);
  });

  it('excludes non-image attachments (PDFs)', () => {
    const result = selectImagesForVisionAnalysis({
      attachments: [jpg('img'), pdf('doc')],
      maxImages: 10,
    });
    expect(result.map((a) => a.id)).toEqual(['img']);
  });

  it('excludes already-analyzed images by default', () => {
    const result = selectImagesForVisionAnalysis({
      attachments: [jpg('new'), jpg('done', undefined, true)],
      maxImages: 10,
    });
    expect(result.map((a) => a.id)).toEqual(['new']);
  });

  it('includes already-analyzed images when force=true', () => {
    const result = selectImagesForVisionAnalysis({
      attachments: [jpg('done', undefined, true)],
      maxImages: 10,
      force: true,
    });
    expect(result.map((a) => a.id)).toContain('done');
  });

  it('respects maxImages limit', () => {
    const attachments = Array.from({ length: 10 }, (_, i) => jpg(`img-${i}`));
    const result = selectImagesForVisionAnalysis({ attachments, maxImages: 3 });
    expect(result).toHaveLength(3);
  });

  it('prioritizes high-value categories (windows, facade) over interior', () => {
    const attachments = [
      jpg('interior1', 'interior'),
      jpg('facade1', 'facade'),
      jpg('windows1', 'windows'),
    ];
    const result = selectImagesForVisionAnalysis({ attachments, maxImages: 2 });
    const ids = result.map((a) => a.id);
    // windows and facade should come before interior
    expect(ids).toContain('facade1');
    expect(ids).toContain('windows1');
    expect(ids).not.toContain('interior1');
  });

  it('handles EXTERIOR/INTERIOR category variants', () => {
    const attachments = [jpg('ext', 'EXTERIOR'), jpg('int', 'INTERIOR')];
    const result = selectImagesForVisionAnalysis({ attachments, maxImages: 2 });
    expect(result).toHaveLength(2);
  });

  it('returns empty when all are already analyzed and force=false', () => {
    const result = selectImagesForVisionAnalysis({
      attachments: [jpg('done', undefined, true)],
      maxImages: 10,
    });
    expect(result).toHaveLength(0);
  });
});
