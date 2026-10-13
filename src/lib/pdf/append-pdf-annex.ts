import { PDFDocument } from 'pdf-lib';
import { logSafeError } from '@/lib/safe-logger';

export type PdfAnnex = {
  name: string;
  bytes: Buffer | Uint8Array;
  category?: string | null;
};

/**
 * Appends PDF documents to a main PDF document.
 * @param mainPdfBytes The bytes of the main PDF document.
 * @param annexes Array of PDF annexes to append.
 * @returns The combined PDF as Uint8Array.
 */
export async function appendPdfAnnexes(mainPdfBytes: Uint8Array, annexes: PdfAnnex[]) {
  const outputPdf = await PDFDocument.load(mainPdfBytes);

  for (const annex of annexes) {
    try {
      const sourcePdf = await PDFDocument.load(annex.bytes, { ignoreEncryption: true });
      const pages = await outputPdf.copyPages(sourcePdf, sourcePdf.getPageIndices());
      for (const page of pages) {
        outputPdf.addPage(page);
      }
    } catch {
      // Do not break the entire report generation if one attachment is corrupt.
      logSafeError('attachment_read_failed');
    }
  }

  return outputPdf.save();
}
