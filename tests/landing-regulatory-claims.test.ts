import fs from 'node:fs';
import path from 'node:path';

const landingSource = fs.readFileSync(path.join(process.cwd(), 'src/app/page.tsx'), 'utf8');
const i18nSource = fs.readFileSync(path.join(process.cwd(), 'src/lib/i18n.ts'), 'utf8');
const localeSources = ['ca', 'fr', 'it', 'pt'].map((locale) => fs.readFileSync(path.join(process.cwd(), `src/lib/i18n-${locale}.ts`), 'utf8'));
const surfaces = [landingSource, i18nSource, ...localeSources].join('\n');

describe('landing regulatory claims', () => {
  it('does not present class E in 2033 as a residential obligation', () => {
    const obligation = /(?:obligator\w*|mandatory|must|required|verpflicht\w*|muss)/i;
    const classEIn2033 = /(?:2033[\s\S]{0,120}(?:clase|class|klasse)\s*e|(?:clase|class|klasse)\s*e[\s\S]{0,120}2033)/i;

    expect(surfaces).not.toMatch(new RegExp(`${obligation.source}[\\s\\S]{0,160}${classEIn2033.source}|${classEIn2033.source}[\\s\\S]{0,160}${obligation.source}`, 'i'));
    expect(landingSource).not.toMatch(/year:\s*['"]2033['"][\s\S]{0,100}title:\s*['"](?:Clase|Class|Klasse) E['"]/i);
    expect(landingSource).not.toMatch(/label:\s*t\.statsTarget,\s*val:\s*['"]2033['"]/i);
    expect([i18nSource, ...localeSources].join('\n')).not.toMatch(/statsTarget:\s*['"][^'"]*(?:clas+e|class|klasse)\s*e/i);
  });

  it('defines the landing timeline for every active locale', () => {
    for (const locale of ['es', 'ca', 'en', 'de', 'fr', 'it', 'pt']) {
      expect(landingSource).toMatch(new RegExp(`\\n    ${locale}: \\[`));
    }
  });
});
