import sharp from 'sharp';
import { isEligiblePropertyPhoto, preparePropertyPhoto } from '@/lib/vision/property-photo';

describe('property photo privacy gate', () => {
  it('accepts only processed exterior/interior image attachments with completed empty OCR text', () => {
    expect(isEligiblePropertyPhoto({ type: 'image/jpeg', category: 'EXTERIOR', ocrStatus: 'done', ocrData: { text: '' } })).toBe(true);
    expect(isEligiblePropertyPhoto({ type: 'application/pdf', category: 'EXTERIOR', ocrStatus: 'done', ocrData: { text: '' } })).toBe(false);
    expect(isEligiblePropertyPhoto({ type: 'image/png', category: 'CEE', ocrStatus: 'done', ocrData: { text: '' } })).toBe(false);
    expect(isEligiblePropertyPhoto({ type: 'image/jpeg', category: 'EXTERIOR', ocrStatus: 'skipped', ocrData: null })).toBe(false);
    expect(isEligiblePropertyPhoto({ type: 'image/jpeg', category: 'EXTERIOR', ocrStatus: 'done', ocrData: { text: 'SYNTHETIC_DOCUMENT_TEXT' } })).toBe(false);
  });

  it('converts to a bounded metadata-free JPEG before external analysis', async () => {
    const input = await sharp({ create: { width: 2000, height: 1000, channels: 3, background: '#88aa33' } })
      .jpeg()
      .withMetadata({ exif: { IFD0: { ImageDescription: 'SYNTHETIC_EXIF_SENTINEL' } } })
      .toBuffer();
    const prepared = await preparePropertyPhoto(input);
    const output = await sharp(prepared).metadata();
    expect(output.format).toBe('jpeg');
    expect(output.width).toBeLessThanOrEqual(1280);
    expect(output.height).toBeLessThanOrEqual(1280);
    expect(output.exif).toBeUndefined();
    expect(prepared.toString('utf8')).not.toContain('SYNTHETIC_EXIF_SENTINEL');
  });
});
