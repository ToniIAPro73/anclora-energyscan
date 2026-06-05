import { classifyEnergyDocument } from '@/lib/document-parsing/energy-document-classifier';

describe('classifyEnergyDocument', () => {
  it('classifies budgets', () => {
    expect(classifyEnergyDocument({
      fileName: 'presupuesto-reforma.pdf',
      text: 'Presupuesto con IVA, base imponible y aerotermia',
    })).toBe('budget');
  });

  it('classifies energy certificates', () => {
    expect(classifyEnergyDocument({
      fileName: 'cee.pdf',
      text: 'Certificado de eficiencia energetica con emisiones y energia primaria no renovable',
    })).toBe('certificate');
  });
});
