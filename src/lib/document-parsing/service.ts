import { classifyEnergyDocument } from './energy-document-classifier';
import { MinerUDocumentParser } from './mineru-parser';
import { NativePdfParser } from './native-pdf-parser';
import type { DocumentParserEngine, ParseDocumentInput, ParseDocumentResult, ParsedDocument } from './types';

type ParserDeps = {
  nativeParser: { parse(input: ParseDocumentInput): Promise<ParsedDocument> };
  mineruParser: { parse(input: ParseDocumentInput): Promise<ParsedDocument> };
};

function shouldPreferMineru(nativeResult: ParsedDocument) {
  const textQuality = nativeResult.metadata?.textQuality;
  const text = nativeResult.text ?? '';
  const kind = classifyEnergyDocument({ fileName: nativeResult.sourceFileName, text });

  if (textQuality === 'empty' || textQuality === 'weak') return true;
  if (kind === 'unknown' && text.length < 500) return true;
  if (/\t/.test(text)) return true;
  return false;
}

export class DocumentParserService {
  constructor(private readonly deps: ParserDeps = {
    nativeParser: new NativePdfParser(),
    mineruParser: new MinerUDocumentParser(),
  }) {}

  async parsePdf(input: ParseDocumentInput): Promise<ParseDocumentResult> {
    const requestedEngine = input.engine ?? 'auto';

    if (requestedEngine === 'native') {
      return { ...(await this.deps.nativeParser.parse(input)), requestedEngine };
    }

    if (requestedEngine === 'mineru') {
      return { ...(await this.deps.mineruParser.parse(input)), requestedEngine };
    }

    if (requestedEngine === 'fallback') {
      try {
        return { ...(await this.deps.mineruParser.parse(input)), requestedEngine };
      } catch (error) {
        const native = await this.deps.nativeParser.parse(input);
        return {
          ...native,
          requestedEngine,
          warnings: [
            `MinerU no estuvo disponible: ${error instanceof Error ? error.message : 'error desconocido'}`,
            ...native.warnings,
          ],
        };
      }
    }

    const native = await this.deps.nativeParser.parse(input);
    if (!shouldPreferMineru(native)) {
      return { ...native, requestedEngine };
    }

    try {
      const mineru = await this.deps.mineruParser.parse(input);
      return {
        ...mineru,
        requestedEngine,
        warnings: [...native.warnings, ...mineru.warnings],
      };
    } catch (error) {
      return {
        ...native,
        requestedEngine,
        warnings: [
          ...native.warnings,
          `MinerU no estuvo disponible: ${error instanceof Error ? error.message : 'error desconocido'}`,
        ],
      };
    }
  }
}
