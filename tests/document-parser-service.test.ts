import { DocumentParserService } from '@/lib/document-parsing/service';

describe('DocumentParserService', () => {
  const input = {
    buffer: new Uint8Array([1, 2, 3]),
    fileName: 'presupuesto.pdf',
    mimeType: 'application/pdf',
    engine: 'auto' as const,
  };

  it('uses native parser when quality is good', async () => {
    const service = new DocumentParserService({
      nativeParser: {
        parse: jest.fn().mockResolvedValue({
          engine: 'native',
          sourceFileName: 'presupuesto.pdf',
          text: 'Presupuesto con importe total 18.450,00 EUR y aerotermia incluida. '.repeat(12),
          metadata: { textQuality: 'good' },
          warnings: [],
          confidence: 0.9,
        }),
      },
      mineruParser: {
        parse: jest.fn(),
      },
    });

    const result = await service.parsePdf(input);
    expect(result.engine).toBe('native');
  });

  it('falls back to native when MinerU fails in auto mode', async () => {
    const service = new DocumentParserService({
      nativeParser: {
        parse: jest.fn().mockResolvedValue({
          engine: 'native',
          sourceFileName: 'scan.pdf',
          text: 'texto corto',
          metadata: { textQuality: 'weak' },
          warnings: ['texto parcial'],
          confidence: 0.4,
        }),
      },
      mineruParser: {
        parse: jest.fn().mockRejectedValue(new Error('wrapper missing')),
      },
    });

    const result = await service.parsePdf({ ...input, fileName: 'scan.pdf' });
    expect(result.engine).toBe('native');
    expect(result.warnings.join(' ')).toMatch(/MinerU no estuvo disponible/);
  });

  it('supports explicit fallback mode', async () => {
    const service = new DocumentParserService({
      nativeParser: {
        parse: jest.fn().mockResolvedValue({
          engine: 'native',
          sourceFileName: 'scan.pdf',
          text: 'fallback native text',
          metadata: { textQuality: 'weak' },
          warnings: [],
          confidence: 0.3,
        }),
      },
      mineruParser: {
        parse: jest.fn().mockRejectedValue(new Error('timeout')),
      },
    });

    const result = await service.parsePdf({ ...input, engine: 'fallback' });
    expect(result.engine).toBe('native');
    expect(result.requestedEngine).toBe('fallback');
  });
});
