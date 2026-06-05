import { assessPdfTextQuality, extractTextFromPdf } from '@/lib/ocr/pdf-extractor';
import type { ParseDocumentInput, ParsedDocument } from './types';

export class NativePdfParser {
  async parse(input: ParseDocumentInput): Promise<ParsedDocument> {
    const extracted = await extractTextFromPdf(input.buffer);
    const text = extracted.fullText.trim();
    const textQuality = assessPdfTextQuality(text);
    const warnings: string[] = [];

    if (textQuality === 'weak') {
      warnings.push('La extraccion nativa del PDF es parcial. Puede convenir MinerU para OCR, tablas o layout.');
    }
    if (textQuality === 'empty') {
      warnings.push('La extraccion nativa del PDF no ha encontrado texto util.');
    }

    return {
      engine: 'native',
      sourceFileName: input.fileName,
      mimeType: input.mimeType,
      text,
      metadata: {
        pages: extracted.pages.length,
        textQuality,
      },
      warnings,
      confidence: textQuality === 'good' ? 0.92 : textQuality === 'weak' ? 0.55 : 0.1,
    };
  }
}
