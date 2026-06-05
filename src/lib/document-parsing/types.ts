export type DocumentParserEngine = 'auto' | 'native' | 'mineru' | 'fallback';

export type ParsedDocument = {
  engine: 'native' | 'mineru';
  sourceFileName: string;
  mimeType?: string;
  markdown?: string;
  text?: string;
  json?: unknown;
  tables?: unknown[];
  images?: string[];
  metadata?: Record<string, unknown>;
  warnings: string[];
  confidence?: number;
};

export type ParseDocumentInput = {
  buffer: Uint8Array;
  fileName: string;
  mimeType?: string;
  engine?: DocumentParserEngine;
};

export type ParseDocumentResult = ParsedDocument & {
  requestedEngine: DocumentParserEngine;
};
