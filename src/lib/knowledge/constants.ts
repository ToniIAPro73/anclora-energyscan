export const KNOWLEDGE_CATEGORIES = [
  'regulation',
  'subsidy',
  'price_reference',
  'faq',
  'other',
] as const;

export type KnowledgeCategory = typeof KNOWLEDGE_CATEGORIES[number];

export const SPAIN_REGIONS = [
  { code: 'AND', es: 'Andalucía',           en: 'Andalusia',            de: 'Andalusien' },
  { code: 'ARA', es: 'Aragón',              en: 'Aragon',               de: 'Aragonien' },
  { code: 'AST', es: 'Asturias',            en: 'Asturias',             de: 'Asturien' },
  { code: 'BAL', es: 'Baleares',            en: 'Balearic Islands',     de: 'Balearen' },
  { code: 'CAN', es: 'Canarias',            en: 'Canary Islands',       de: 'Kanarische Inseln' },
  { code: 'CAT', es: 'Cataluña',            en: 'Catalonia',            de: 'Katalonien' },
  { code: 'CLE', es: 'Castilla y León',     en: 'Castile and León',     de: 'Kastilien und León' },
  { code: 'CLM', es: 'Castilla-La Mancha',  en: 'Castile-La Mancha',    de: 'Kastilien-La Mancha' },
  { code: 'CNT', es: 'Cantabria',           en: 'Cantabria',            de: 'Kantabrien' },
  { code: 'EXT', es: 'Extremadura',         en: 'Extremadura',          de: 'Extremadura' },
  { code: 'GAL', es: 'Galicia',             en: 'Galicia',              de: 'Galizien' },
  { code: 'LRI', es: 'La Rioja',            en: 'La Rioja',             de: 'La Rioja' },
  { code: 'MAD', es: 'Madrid',              en: 'Madrid',               de: 'Madrid' },
  { code: 'MUR', es: 'Murcia',              en: 'Murcia',               de: 'Murcia' },
  { code: 'NAV', es: 'Navarra',             en: 'Navarre',              de: 'Navarra' },
  { code: 'PVA', es: 'País Vasco',          en: 'Basque Country',       de: 'Baskenland' },
  { code: 'VAL', es: 'Comunitat Valenciana',en: 'Valencian Community',  de: 'Valencia' },
  { code: 'CEU', es: 'Ceuta',               en: 'Ceuta',                de: 'Ceuta' },
  { code: 'MEL', es: 'Melilla',             en: 'Melilla',              de: 'Melilla' },
] as const;

export type SpainRegionCode = typeof SPAIN_REGIONS[number]['code'];
