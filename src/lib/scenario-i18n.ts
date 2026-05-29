import type { AppLanguage, PdfLanguage } from './preferences';
import type { ImprovementScenario, SubsidyInfoItem } from './domain/energy-assessment';

type ExtLang = AppLanguage | 'ca' | 'fr' | 'it' | 'pt';

const scenarioCopy: Record<ExtLang, Record<string, Partial<ImprovementScenario>>> = {
  es: {},
  ca: {
    basic: {
      title: 'Paquet bàsic de reducció de demanda',
      objective: 'Millorar el confort i reduir les pèrdues sense renovació profunda.',
      description: 'Actuacions de baix impacte constructiu en obertures, infiltracions i control de sistemes.',
      estimatedCostRange: 'Inversió baixa-mitjana',
      estimatedSavingsRange: 'Estalvi qualitatiu baix-mitjà, depenent de l\'ús real',
      expectedLetterImpact: 'Millora potencial subjecta a avaluació tècnica oficial',
      rationale: 'Ruta orientativa basada en dades declarades i no substitut del certificat energètic oficial.',
    },
    envelope: {
      title: 'Millora de l\'envolupant',
      objective: 'Reduir la demanda energètica abans de renovar els sistemes.',
      description: 'Paquet d\'aïllament i obertures per reduir la demanda de calefacció i refrigeració.',
      estimatedCostRange: 'Inversió mitjana-alta',
      estimatedSavingsRange: 'Estalvi qualitatiu mitjà-alt si l\'envolupant actual és dèbil',
      expectedLetterImpact: 'Millora potencial subjecta a avaluació tècnica oficial',
      rationale: 'Ruta orientativa basada en dades declarades i no substitut del certificat energètic oficial.',
    },
    systems: {
      title: 'Electrificació eficient de sistemes',
      objective: 'Reduir la dependència de combustibles fòssils i millorar el rendiment tèrmic.',
      description: 'Renovació de calefacció, refrigeració i ACS amb sistemes d\'alta eficiència.',
      estimatedCostRange: 'Inversió mitjana',
      estimatedSavingsRange: 'Estalvi qualitatiu mitjà, major quan es substitueix gas o elèctric directe',
      expectedLetterImpact: 'Millora potencial subjecta a avaluació tècnica oficial',
      rationale: 'Ruta orientativa basada en dades declarades i no substitut del certificat energètic oficial.',
    },
    renewables: {
      title: 'Fotovoltaica i solar tèrmica',
      objective: 'Afegir generació renovable on les condicions de coberta i ús ho permetin.',
      description: 'Revisió de l\'autoconsum fotovoltaic i el suport solar tèrmic per a l\'ACS.',
      estimatedCostRange: 'Inversió mitjana',
      estimatedSavingsRange: 'Estalvi qualitatiu variable depenent de l\'ús, orientació, coberta i compensació',
      expectedLetterImpact: 'Millora potencial subjecta a avaluació tècnica oficial',
      rationale: 'Ruta orientativa basada en dades declarades i no substitut del certificat energètic oficial.',
    },
    deep: {
      title: 'Renovació profunda combinada',
      objective: 'Coordinar envolupant, sistemes i renovables.',
      description: 'Ruta integrada per a habitatges amb envolupant dèbil, sistemes penalitzadors i horitzó de venda, lloguer o renovació rellevant.',
      estimatedCostRange: 'Inversió alta',
      estimatedSavingsRange: 'Estalvi qualitatiu alt, subjecte a disseny tècnic i ús real',
      expectedLetterImpact: 'Millora potencial subjecta a avaluació tècnica oficial',
      rationale: 'Ruta orientativa basada en dades declarades i no substitut del certificat energètic oficial.',
    },
  },
  en: {
    basic: {
      title: 'Basic demand reduction package',
      objective: 'Improve comfort and reduce losses without deep renovation.',
      description: 'Low-construction-impact actions targeting openings, infiltration and system controls.',
      estimatedCostRange: 'Low-medium investment',
      estimatedSavingsRange: 'Low-medium qualitative savings, depending on real use',
      expectedLetterImpact: 'Potential improvement subject to official technical assessment',
      rationale: 'Indicative route based on declared data and not a substitute for an official energy certificate.',
    },
    envelope: {
      title: 'Envelope improvement',
      objective: 'Reduce energy demand before replacing systems.',
      description: 'Insulation and openings package to reduce heating and cooling demand.',
      estimatedCostRange: 'Medium-high investment',
      estimatedSavingsRange: 'Medium-high qualitative savings if the current envelope is weak',
      expectedLetterImpact: 'Potential improvement subject to official technical assessment',
      rationale: 'Indicative route based on declared data and not a substitute for an official energy certificate.',
    },
    systems: {
      title: 'Efficient system electrification',
      objective: 'Reduce fossil fuel dependence and improve thermal performance.',
      description: 'Heating, cooling and hot-water renewal with high-efficiency systems.',
      estimatedCostRange: 'Medium investment',
      estimatedSavingsRange: 'Medium qualitative savings, higher when replacing gas or direct electric systems',
      expectedLetterImpact: 'Potential improvement subject to official technical assessment',
      rationale: 'Indicative route based on declared data and not a substitute for an official energy certificate.',
    },
    renewables: {
      title: 'Photovoltaics and solar thermal',
      objective: 'Add renewable generation where roof and usage conditions allow it.',
      description: 'Review of photovoltaic self-consumption and solar thermal support for hot water.',
      estimatedCostRange: 'Medium investment',
      estimatedSavingsRange: 'Variable qualitative savings depending on usage, orientation, roof and compensation',
      expectedLetterImpact: 'Potential improvement subject to official technical assessment',
      rationale: 'Indicative route based on declared data and not a substitute for an official energy certificate.',
    },
    deep: {
      title: 'Combined deep retrofit',
      objective: 'Coordinate envelope, systems and renewables.',
      description: 'Integrated route for homes with weak envelope, penalised systems and relevant sale, rental or renovation horizon.',
      estimatedCostRange: 'High investment',
      estimatedSavingsRange: 'High qualitative savings, subject to technical design and real use',
      expectedLetterImpact: 'Potential improvement subject to official technical assessment',
      rationale: 'Indicative route based on declared data and not a substitute for an official energy certificate.',
    },
  },
  de: {
    basic: {
      title: 'Basispaket zur Reduzierung des Bedarfs',
      objective: 'Komfort verbessern und Verluste ohne tiefgreifende Sanierung reduzieren.',
      description: 'Maßnahmen mit geringem baulichem Eingriff an Öffnungen, Infiltrationen und Systemsteuerung.',
      estimatedCostRange: 'Niedrige bis mittlere Investition',
      estimatedSavingsRange: 'Niedrige bis mittlere qualitative Einsparung, abhängig von der realen Nutzung',
      expectedLetterImpact: 'Mögliche Verbesserung vorbehaltlich offizieller technischer Bewertung',
      rationale: 'Orientierende Route auf Basis deklarierter Daten; kein Ersatz für einen offiziellen Energieausweis.',
    },
    envelope: {
      title: 'Verbesserung der Gebäudehülle',
      objective: 'Energiebedarf reduzieren, bevor Systeme erneuert werden.',
      description: 'Paket für Dämmung und Öffnungen zur Verringerung von Heiz- und Kühlbedarf.',
      estimatedCostRange: 'Mittlere bis hohe Investition',
      estimatedSavingsRange: 'Mittlere bis hohe qualitative Einsparung bei schwacher Gebäudehülle',
      expectedLetterImpact: 'Mögliche Verbesserung vorbehaltlich offizieller technischer Bewertung',
      rationale: 'Orientierende Route auf Basis deklarierter Daten; kein Ersatz für einen offiziellen Energieausweis.',
    },
    systems: {
      title: 'Effiziente Elektrifizierung der Systeme',
      objective: 'Abhängigkeit von fossilen Brennstoffen reduzieren und thermische Leistung verbessern.',
      description: 'Erneuerung von Heizung, Kühlung und Warmwasser mit effizienten Systemen.',
      estimatedCostRange: 'Mittlere Investition',
      estimatedSavingsRange: 'Mittlere qualitative Einsparung, höher beim Ersatz von Gas oder Direktstrom',
      expectedLetterImpact: 'Mögliche Verbesserung vorbehaltlich offizieller technischer Bewertung',
      rationale: 'Orientierende Route auf Basis deklarierter Daten; kein Ersatz für einen offiziellen Energieausweis.',
    },
    renewables: {
      title: 'Photovoltaik und Solarthermie',
      objective: 'Erneuerbare Erzeugung ergänzen, wenn Dach und Nutzung es erlauben.',
      description: 'Prüfung von Photovoltaik-Eigenverbrauch und Solarthermie-Unterstützung für Warmwasser.',
      estimatedCostRange: 'Mittlere Investition',
      estimatedSavingsRange: 'Variable qualitative Einsparung je nach Nutzung, Ausrichtung, Dach und Vergütung',
      expectedLetterImpact: 'Mögliche Verbesserung vorbehaltlich offizieller technischer Bewertung',
      rationale: 'Orientierende Route auf Basis deklarierter Daten; kein Ersatz für einen offiziellen Energieausweis.',
    },
    deep: {
      title: 'Kombinierte tiefgreifende Sanierung',
      objective: 'Gebäudehülle, Systeme und Erneuerbare koordinieren.',
      description: 'Integrierte Route für Immobilien mit schwacher Hülle, belastenden Systemen und relevantem Verkaufs-, Vermietungs- oder Sanierungshorizont.',
      estimatedCostRange: 'Hohe Investition',
      estimatedSavingsRange: 'Hohe qualitative Einsparung, abhängig von Projekt und realer Nutzung',
      expectedLetterImpact: 'Mögliche Verbesserung vorbehaltlich offizieller technischer Bewertung',
      rationale: 'Orientierende Route auf Basis deklarierter Daten; kein Ersatz für einen offiziellen Energieausweis.',
    },
  },
  fr: {
    basic: {
      title: 'Pack de base de réduction de la demande',
      objective: 'Améliorer le confort et réduire les pertes sans rénovation profonde.',
      description: 'Actions à faible impact constructif sur les ouvertures, les infiltrations et la régulation des systèmes.',
      estimatedCostRange: 'Investissement faible à moyen',
      estimatedSavingsRange: 'Économies qualitatives faibles à moyennes, selon l\'usage réel',
      expectedLetterImpact: 'Amélioration potentielle sous réserve d\'évaluation technique officielle',
      rationale: 'Piste indicative basée sur les données déclarées et non substituable au certificat énergétique officiel.',
    },
    envelope: {
      title: 'Amélioration de l\'enveloppe',
      objective: 'Réduire la demande énergétique avant de renouveler les systèmes.',
      description: 'Pack isolation et ouvertures pour réduire la demande de chauffage et de climatisation.',
      estimatedCostRange: 'Investissement moyen à élevé',
      estimatedSavingsRange: 'Économies qualitatives moyennes à élevées si l\'enveloppe actuelle est faible',
      expectedLetterImpact: 'Amélioration potentielle sous réserve d\'évaluation technique officielle',
      rationale: 'Piste indicative basée sur les données déclarées et non substituable au certificat énergétique officiel.',
    },
    systems: {
      title: 'Électrification efficace des systèmes',
      objective: 'Réduire la dépendance aux combustibles fossiles et améliorer la performance thermique.',
      description: 'Renouvellement du chauffage, de la climatisation et de l\'ECS avec des systèmes haute efficacité.',
      estimatedCostRange: 'Investissement moyen',
      estimatedSavingsRange: 'Économies qualitatives moyennes, plus élevées lors du remplacement de systèmes gaz ou électriques directs',
      expectedLetterImpact: 'Amélioration potentielle sous réserve d\'évaluation technique officielle',
      rationale: 'Piste indicative basée sur les données déclarées et non substituable au certificat énergétique officiel.',
    },
    renewables: {
      title: 'Photovoltaïque et solaire thermique',
      objective: 'Ajouter de la production renouvelable là où les conditions de toiture et d\'usage le permettent.',
      description: 'Étude de l\'autoconsommation photovoltaïque et du soutien solaire thermique pour l\'ECS.',
      estimatedCostRange: 'Investissement moyen',
      estimatedSavingsRange: 'Économies qualitatives variables selon l\'usage, l\'orientation, la toiture et la compensation',
      expectedLetterImpact: 'Amélioration potentielle sous réserve d\'évaluation technique officielle',
      rationale: 'Piste indicative basée sur les données déclarées et non substituable au certificat énergétique officiel.',
    },
    deep: {
      title: 'Rénovation profonde combinée',
      objective: 'Coordonner enveloppe, systèmes et renouvelables.',
      description: 'Piste intégrée pour les logements à enveloppe faible, systèmes pénalisants et horizon de vente, location ou rénovation pertinent.',
      estimatedCostRange: 'Investissement élevé',
      estimatedSavingsRange: 'Économies qualitatives élevées, sous réserve de conception technique et d\'usage réel',
      expectedLetterImpact: 'Amélioration potentielle sous réserve d\'évaluation technique officielle',
      rationale: 'Piste indicative basée sur les données déclarées et non substituable au certificat énergétique officiel.',
    },
  },
  it: {
    basic: {
      title: 'Pacchetto base di riduzione della domanda',
      objective: 'Migliorare il comfort e ridurre le perdite senza ristrutturazione profonda.',
      description: 'Interventi a basso impatto costruttivo su aperture, infiltrazioni e controllo dei sistemi.',
      estimatedCostRange: 'Investimento basso-medio',
      estimatedSavingsRange: 'Risparmio qualitativo basso-medio, in funzione dell\'uso reale',
      expectedLetterImpact: 'Miglioramento potenziale soggetto a valutazione tecnica ufficiale',
      rationale: 'Percorso indicativo basato sui dati dichiarati e non sostitutivo del certificato energetico ufficiale.',
    },
    envelope: {
      title: 'Miglioramento dell\'involucro',
      objective: 'Ridurre la domanda energetica prima di rinnovare i sistemi.',
      description: 'Pacchetto isolamento e aperture per ridurre la domanda di riscaldamento e raffrescamento.',
      estimatedCostRange: 'Investimento medio-alto',
      estimatedSavingsRange: 'Risparmio qualitativo medio-alto se l\'involucro attuale è debole',
      expectedLetterImpact: 'Miglioramento potenziale soggetto a valutazione tecnica ufficiale',
      rationale: 'Percorso indicativo basato sui dati dichiarati e non sostitutivo del certificato energetico ufficiale.',
    },
    systems: {
      title: 'Elettrificazione efficiente dei sistemi',
      objective: 'Ridurre la dipendenza dai combustibili fossili e migliorare le prestazioni termiche.',
      description: 'Rinnovo di riscaldamento, raffrescamento e ACS con sistemi ad alta efficienza.',
      estimatedCostRange: 'Investimento medio',
      estimatedSavingsRange: 'Risparmio qualitativo medio, maggiore quando si sostituiscono sistemi a gas o elettrici diretti',
      expectedLetterImpact: 'Miglioramento potenziale soggetto a valutazione tecnica ufficiale',
      rationale: 'Percorso indicativo basato sui dati dichiarati e non sostitutivo del certificato energetico ufficiale.',
    },
    renewables: {
      title: 'Fotovoltaico e solare termico',
      objective: 'Aggiungere generazione rinnovabile dove le condizioni di copertura e utilizzo lo permettono.',
      description: 'Valutazione dell\'autoconsumo fotovoltaico e del supporto solare termico per l\'ACS.',
      estimatedCostRange: 'Investimento medio',
      estimatedSavingsRange: 'Risparmio qualitativo variabile in base all\'uso, orientamento, copertura e compensazione',
      expectedLetterImpact: 'Miglioramento potenziale soggetto a valutazione tecnica ufficiale',
      rationale: 'Percorso indicativo basato sui dati dichiarati e non sostitutivo del certificato energetico ufficiale.',
    },
    deep: {
      title: 'Riqualificazione profonda combinata',
      objective: 'Coordinare involucro, sistemi e rinnovabili.',
      description: 'Percorso integrato per abitazioni con involucro debole, sistemi penalizzanti e orizzonte rilevante di vendita, affitto o ristrutturazione.',
      estimatedCostRange: 'Investimento alto',
      estimatedSavingsRange: 'Risparmio qualitativo alto, soggetto a progettazione tecnica e uso reale',
      expectedLetterImpact: 'Miglioramento potenziale soggetto a valutazione tecnica ufficiale',
      rationale: 'Percorso indicativo basato sui dati dichiarati e non sostitutivo del certificato energetico ufficiale.',
    },
  },
  pt: {
    basic: {
      title: 'Pacote básico de redução de procura',
      objective: 'Melhorar o conforto e reduzir as perdas sem renovação profunda.',
      description: 'Intervenções de baixo impacto construtivo em aberturas, infiltrações e controlo de sistemas.',
      estimatedCostRange: 'Investimento baixo-médio',
      estimatedSavingsRange: 'Poupança qualitativa baixa-média, dependendo do uso real',
      expectedLetterImpact: 'Melhoria potencial sujeita a avaliação técnica oficial',
      rationale: 'Percurso indicativo baseado em dados declarados e não substituto do certificado energético oficial.',
    },
    envelope: {
      title: 'Melhoria da envolvente',
      objective: 'Reduzir a procura de energia antes de renovar os sistemas.',
      description: 'Pacote de isolamento e aberturas para reduzir a procura de aquecimento e arrefecimento.',
      estimatedCostRange: 'Investimento médio-alto',
      estimatedSavingsRange: 'Poupança qualitativa média-alta se a envolvente atual for fraca',
      expectedLetterImpact: 'Melhoria potencial sujeita a avaliação técnica oficial',
      rationale: 'Percurso indicativo baseado em dados declarados e não substituto do certificado energético oficial.',
    },
    systems: {
      title: 'Eletrificação eficiente de sistemas',
      objective: 'Reduzir a dependência de combustíveis fósseis e melhorar o desempenho térmico.',
      description: 'Renovação de aquecimento, arrefecimento e AQS com sistemas de alta eficiência.',
      estimatedCostRange: 'Investimento médio',
      estimatedSavingsRange: 'Poupança qualitativa média, maior quando se substituem sistemas a gás ou elétricos diretos',
      expectedLetterImpact: 'Melhoria potencial sujeita a avaliação técnica oficial',
      rationale: 'Percurso indicativo baseado em dados declarados e não substituto do certificado energético oficial.',
    },
    renewables: {
      title: 'Fotovoltaico e solar térmico',
      objective: 'Adicionar geração renovável onde as condições de cobertura e utilização o permitam.',
      description: 'Revisão do autoconsumo fotovoltaico e do suporte solar térmico para AQS.',
      estimatedCostRange: 'Investimento médio',
      estimatedSavingsRange: 'Poupança qualitativa variável consoante o uso, orientação, cobertura e compensação',
      expectedLetterImpact: 'Melhoria potencial sujeita a avaliação técnica oficial',
      rationale: 'Percurso indicativo baseado em dados declarados e não substituto do certificado energético oficial.',
    },
    deep: {
      title: 'Renovação profunda combinada',
      objective: 'Coordenar envolvente, sistemas e renováveis.',
      description: 'Percurso integrado para habitações com envolvente fraca, sistemas penalizadores e horizonte relevante de venda, arrendamento ou renovação.',
      estimatedCostRange: 'Investimento alto',
      estimatedSavingsRange: 'Poupança qualitativa alta, sujeita a projeto técnico e uso real',
      expectedLetterImpact: 'Melhoria potencial sujeita a avaliação técnica oficial',
      rationale: 'Percurso indicativo baseado em dados declarados e não substituto do certificado energético oficial.',
    },
  },
};

const genericMeasures: Record<ExtLang, string[]> = {
  es: [],
  ca: [
    'Revisar els punts febles de l\'envolupant i prioritzar actuacions amb un tècnic qualificat.',
    'Sol·licitar pressupostos detallats per partida abans de comprometre obres.',
    'Verificar permisos, requisits comunitaris i compatibilitat tècnica.',
  ],
  en: [
    'Review envelope weak points and prioritise actions with a qualified technician.',
    'Request itemised quotes before committing to works.',
    'Check permissions, community requirements and technical compatibility.',
  ],
  de: [
    'Schwachstellen der Gebäudehülle mit Fachleuten prüfen und Maßnahmen priorisieren.',
    'Vor Beauftragung detaillierte Angebote einholen.',
    'Genehmigungen, Gemeinschaftsanforderungen und technische Kompatibilität prüfen.',
  ],
  fr: [
    'Examiner les points faibles de l\'enveloppe et prioriser les actions avec un technicien qualifié.',
    'Demander des devis détaillés par poste avant de s\'engager dans des travaux.',
    'Vérifier les autorisations, les exigences de copropriété et la compatibilité technique.',
  ],
  it: [
    'Verificare i punti deboli dell\'involucro e stabilire le priorità con un tecnico qualificato.',
    'Richiedere preventivi dettagliati per voce prima di impegnarsi nei lavori.',
    'Verificare permessi, requisiti condominiali e compatibilità tecnica.',
  ],
  pt: [
    'Rever os pontos fracos da envolvente e priorizar intervenções com um técnico qualificado.',
    'Solicitar orçamentos detalhados por rubrica antes de comprometer obras.',
    'Verificar autorizações, requisitos de condomínio e compatibilidade técnica.',
  ],
};

const subsidyCopy: Record<ExtLang, Record<string, Pick<SubsidyInfoItem, 'title' | 'description' | 'eligibilityDisclaimer'>>> = {
  es: {},
  ca: {
    'self-consumption-storage': {
      title: 'Autoconsum, emmagatzematge i renovables',
      description: 'Programes estatals o regionals vinculats a incentius d\'autoconsum i emmagatzematge, quan estiguin oberts.',
      eligibilityDisclaimer: 'La disponibilitat depèn de les convocatòries, el pressupost, la region, la data de sol·licitud i els requisits tècnics.',
    },
    'energy-renovation': {
      title: 'Renovació energètica de l\'habitatge',
      description: 'Línies d\'informació relacionades amb la millora de l\'envolupant, reducció de la demanda energètica o renovació d\'edificis.',
      eligibilityDisclaimer: 'Cada convocatòria requereix verificar l\'edifici, l\'actuació, l\'estalvi justificat, la documentació tècnica i els terminis.',
    },
    'heat-pump-electrification': {
      title: 'Bombes de calor i electrificació eficient',
      description: 'Alguns programes públics poden donar suport a la substitució de sistemes fòssils per bombes de calor o alternatives eficients.',
      eligibilityDisclaimer: 'L\'elegibilitat s\'ha de confirmar amb les condicions oficials i el pressupost professional.',
    },
    'tax-deductions-local-bonuses': {
      title: 'Deduccions fiscals i bonificacions locals',
      description: 'Pot haver deduccions fiscals o bonificacions municipals per a millores energètiques, autoconsum o renovació.',
      eligibilityDisclaimer: 'Depenen del municipi, les normes fiscals vigents, els certificats i els requisits administratius.',
    },
  },
  en: {
    'self-consumption-storage': {
      title: 'Self-consumption, storage and renewables',
      description: 'State or regional programmes linked to self-consumption and storage incentives, when open.',
      eligibilityDisclaimer: 'Availability depends on calls, budget, region, application date and technical requirements.',
    },
    'energy-renovation': {
      title: 'Home energy renovation',
      description: 'Information lines related to envelope improvement, energy demand reduction or building renovation.',
      eligibilityDisclaimer: 'Each call requires checking the building, action, justified savings, technical documentation and deadlines.',
    },
    'heat-pump-electrification': {
      title: 'Heat pumps and efficient electrification',
      description: 'Some public programmes may support replacing fossil systems with heat pumps or efficient alternatives.',
      eligibilityDisclaimer: 'Eligibility must be confirmed against official terms and professional quote.',
    },
    'tax-deductions-local-bonuses': {
      title: 'Tax deductions and local bonuses',
      description: 'Tax deductions or municipal bonuses may exist for energy improvements, self-consumption or renovation.',
      eligibilityDisclaimer: 'They depend on municipality, current tax rules, certificates and administrative requirements.',
    },
  },
  de: {
    'self-consumption-storage': {
      title: 'Eigenverbrauch, Speicher und Erneuerbare',
      description: 'Staatliche oder regionale Programme zu Eigenverbrauch und Speicheranreizen, sofern geöffnet.',
      eligibilityDisclaimer: 'Verfügbarkeit hängt von Ausschreibung, Budget, Region, Datum und technischen Anforderungen ab.',
    },
    'energy-renovation': {
      title: 'Energetische Gebäudesanierung',
      description: 'Informationslinien zur Verbesserung der Gebäudehülle, Senkung des Energiebedarfs oder Sanierung.',
      eligibilityDisclaimer: 'Jede Ausschreibung erfordert Prüfung von Gebäude, Maßnahme, Einsparung, Dokumentation und Fristen.',
    },
    'heat-pump-electrification': {
      title: 'Wärmepumpen und effiziente Elektrifizierung',
      description: 'Einige Programme können den Ersatz fossiler Systeme durch Wärmepumpen oder effiziente Alternativen fördern.',
      eligibilityDisclaimer: 'Die Förderfähigkeit muss anhand offizieller Bedingungen und Angebote bestätigt werden.',
    },
    'tax-deductions-local-bonuses': {
      title: 'Steuerabzüge und lokale Boni',
      description: 'Für energetische Verbesserungen, Eigenverbrauch oder Sanierung können steuerliche oder kommunale Vorteile bestehen.',
      eligibilityDisclaimer: 'Sie hängen von Gemeinde, Steuerregeln, Nachweisen und Verwaltungsanforderungen ab.',
    },
  },
  fr: {
    'self-consumption-storage': {
      title: 'Autoconsommation, stockage et renouvelables',
      description: 'Programmes étatiques ou régionaux liés aux aides à l\'autoconsommation et au stockage, lorsqu\'ils sont ouverts.',
      eligibilityDisclaimer: 'La disponibilité dépend des appels, du budget, de la région, de la date de demande et des exigences techniques.',
    },
    'energy-renovation': {
      title: 'Rénovation énergétique du logement',
      description: 'Lignes d\'information relatives à l\'amélioration de l\'enveloppe, à la réduction de la demande énergétique ou à la rénovation de bâtiments.',
      eligibilityDisclaimer: 'Chaque appel nécessite de vérifier le bâtiment, l\'action, les économies justifiées, la documentation technique et les délais.',
    },
    'heat-pump-electrification': {
      title: 'Pompes à chaleur et électrification efficace',
      description: 'Certains programmes publics peuvent soutenir le remplacement de systèmes fossiles par des pompes à chaleur ou des alternatives efficaces.',
      eligibilityDisclaimer: 'L\'éligibilité doit être confirmée selon les conditions officielles et le devis professionnel.',
    },
    'tax-deductions-local-bonuses': {
      title: 'Déductions fiscales et bonifications locales',
      description: 'Des déductions fiscales ou des bonifications municipales peuvent exister pour les améliorations énergétiques, l\'autoconsommation ou la rénovation.',
      eligibilityDisclaimer: 'Ils dépendent de la commune, des règles fiscales en vigueur, des certificats et des exigences administratives.',
    },
  },
  it: {
    'self-consumption-storage': {
      title: 'Autoconsumo, accumulo e rinnovabili',
      description: 'Programmi statali o regionali legati agli incentivi per l\'autoconsumo e l\'accumulo, quando aperti.',
      eligibilityDisclaimer: 'La disponibilità dipende dai bandi, dal budget, dalla regione, dalla data di domanda e dai requisiti tecnici.',
    },
    'energy-renovation': {
      title: 'Ristrutturazione energetica dell\'abitazione',
      description: 'Linee informative relative al miglioramento dell\'involucro, alla riduzione della domanda energetica o alla riqualificazione degli edifici.',
      eligibilityDisclaimer: 'Ogni bando richiede la verifica dell\'edificio, dell\'intervento, dei risparmi giustificati, della documentazione tecnica e delle scadenze.',
    },
    'heat-pump-electrification': {
      title: 'Pompe di calore ed elettrificazione efficiente',
      description: 'Alcuni programmi pubblici possono sostenere la sostituzione di sistemi fossili con pompe di calore o alternative efficienti.',
      eligibilityDisclaimer: 'L\'ammissibilità deve essere confermata in base alle condizioni ufficiali e al preventivo professionale.',
    },
    'tax-deductions-local-bonuses': {
      title: 'Detrazioni fiscali e bonus locali',
      description: 'Possono esistere detrazioni fiscali o bonus comunali per miglioramenti energetici, autoconsumo o ristrutturazione.',
      eligibilityDisclaimer: 'Dipendono dal comune, dalle norme fiscali vigenti, dai certificati e dai requisiti amministrativi.',
    },
  },
  pt: {
    'self-consumption-storage': {
      title: 'Autoconsumo, armazenamento e renováveis',
      description: 'Programas estatais ou regionais ligados a incentivos de autoconsumo e armazenamento, quando abertos.',
      eligibilityDisclaimer: 'A disponibilidade depende dos concursos, orçamento, região, data de candidatura e requisitos técnicos.',
    },
    'energy-renovation': {
      title: 'Renovação energética da habitação',
      description: 'Linhas de informação relacionadas com a melhoria da envolvente, redução da procura de energia ou renovação de edifícios.',
      eligibilityDisclaimer: 'Cada concurso requer a verificação do edifício, da intervenção, das poupanças justificadas, da documentação técnica e dos prazos.',
    },
    'heat-pump-electrification': {
      title: 'Bombas de calor e eletrificação eficiente',
      description: 'Alguns programas públicos podem apoiar a substituição de sistemas fósseis por bombas de calor ou alternativas eficientes.',
      eligibilityDisclaimer: 'A elegibilidade deve ser confirmada com base nas condições oficiais e no orçamento profissional.',
    },
    'tax-deductions-local-bonuses': {
      title: 'Deduções fiscais e bonificações locais',
      description: 'Podem existir deduções fiscais ou bonificações municipais para melhorias energéticas, autoconsumo ou renovação.',
      eligibilityDisclaimer: 'Dependem do município, das normas fiscais em vigor, dos certificados e dos requisitos administrativos.',
    },
  },
};

export function localizeScenarios(scenarios: ImprovementScenario[], language: AppLanguage | PdfLanguage): ImprovementScenario[] {
  const lang = language as ExtLang;
  if (lang === 'es') return scenarios;
  const copy = scenarioCopy[lang] ?? scenarioCopy.en;
  const measures = genericMeasures[lang] ?? genericMeasures.en;
  return scenarios.map((scenario) => ({
    ...scenario,
    ...copy[scenario.id],
    measures,
    dependencies: [],
    warnings: [],
    disclaimers: scenario.disclaimers,
  }));
}

export function localizeSubsidies(subsidies: SubsidyInfoItem[], language: AppLanguage | PdfLanguage): SubsidyInfoItem[] {
  const lang = language as ExtLang;
  if (lang === 'es') return subsidies;
  const copy = subsidyCopy[lang] ?? subsidyCopy.en;
  return subsidies.map((item) => ({
    ...item,
    ...(copy[item.id] || {}),
  }));
}
