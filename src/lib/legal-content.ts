// LEGAL_REVIEW_REQUIRED: ca, fr, it, pt legal sections are translations for informational purposes.
// All legal obligations, disclaimers, and contact data are preserved verbatim from es/en/de originals.
// A qualified legal reviewer must validate these translations before any official use.

import type { AppLanguage } from './preferences';

export type LegalPageKind = 'privacy' | 'terms' | 'legal';

export type LegalSection = {
  title: string;
  paragraphs?: string[];
  items?: string[];
};

export type LegalPageContent = {
  title: string;
  description: string;
  updatedAt: string;
  sections: LegalSection[];
};

const updatedAt: Record<LegalLanguage, string> = {
  es: '10 de mayo de 2026',
  ca: '10 de maig de 2026',
  en: '10 May 2026',
  de: '10. Mai 2026',
  fr: '10 mai 2026',
  it: '10 maggio 2026',
  pt: '10 de maio de 2026',
};

// LEGAL_REVIEW_REQUIRED: The legal content below for ca/fr/it/pt is a translation of the
// es/en/de originals. No legal obligations have been softened, reinterpreted or removed.
// Contact details (hola@anclora.com), responsible entity (Anclora Group) and disclaimers
// are preserved unchanged. Requires review by a qualified legal professional before any
// official or regulatory use.

/** Extends AppLanguage to include Premium locales pending activation */
export type LegalLanguage = AppLanguage | 'ca' | 'fr' | 'it' | 'pt';

export const legalContent: Record<LegalLanguage, Record<LegalPageKind, LegalPageContent>> = {
  es: {
    privacy: {
      title: 'Política de privacidad',
      description: 'Esta política explica cómo Anclora EnergyScan trata los datos personales usados para crear cuentas, generar prediagnósticos energéticos orientativos, gestionar adjuntos y tramitar solicitudes de contacto.',
      updatedAt: updatedAt.es,
      sections: [
        { title: 'Responsable y contacto', paragraphs: ['Responsable del tratamiento: Anclora Group, entidad propietaria y operadora de Anclora EnergyScan.', 'Contacto para privacidad: hola@anclora.com.'] },
        { title: 'Datos que podemos tratar', items: ['Datos de cuenta, autenticación y sesión.', 'Datos declarados de la vivienda y documentación aportada voluntariamente.', 'Solicitudes de contacto con proveedores o partners.', 'Datos técnicos necesarios para seguridad, operación y diagnóstico de incidencias.'] },
        { title: 'Finalidades', items: ['Crear y mantener la cuenta.', 'Generar prediagnósticos energéticos orientativos e informes PDF.', 'Conservar valoraciones, adjuntos y solicitudes asociadas.', 'Gestionar solicitudes de contacto cuando el usuario lo pida.'] },
        { title: 'Carácter orientativo', paragraphs: ['Anclora EnergyScan no genera Certificados de Eficiencia Energética oficiales. Las estimaciones, letras, costes y recomendaciones son orientativas y deben contrastarse con un técnico competente.'] },
      ],
    },
    terms: {
      title: 'Términos del servicio',
      description: 'Estas condiciones regulan el uso de Anclora EnergyScan como plataforma de prediagnóstico energético orientativo para viviendas.',
      updatedAt: updatedAt.es,
      sections: [
        { title: 'Objeto del servicio', paragraphs: ['Anclora EnergyScan permite introducir datos de una vivienda, adjuntar documentación, obtener una estimación energética orientativa, visualizar propuestas de mejora y generar informes informativos.'] },
        { title: 'No sustitución de certificado oficial', paragraphs: ['Anclora EnergyScan no emite Certificados de Eficiencia Energética oficiales, no realiza inspecciones técnicas y no sustituye el criterio de un técnico competente.'] },
        { title: 'Datos y adjuntos aportados', paragraphs: ['El usuario garantiza que tiene derecho a subir los archivos que aporta. Los adjuntos se usan como soporte documental sin validación técnica automática.'] },
        { title: 'Solicitudes de contacto', paragraphs: ['La conexión con proveedores se realiza como solicitud de información o presupuesto, sin garantía de aceptación, resultado, precio, plazo ni ejecución.'] },
      ],
    },
    legal: {
      title: 'Aviso legal',
      description: 'Información general del titular del sitio y condiciones básicas de acceso a Anclora EnergyScan.',
      updatedAt: updatedAt.es,
      sections: [
        { title: 'Titular del sitio', paragraphs: ['Titular y operador: Anclora Group.', 'Anclora EnergyScan forma parte del ecosistema tecnológico de Anclora Group.', 'Sitio web: https://anclora-energyscan.vercel.app/', 'Email de contacto: hola@anclora.com.'] },
        { title: 'Finalidad del sitio', paragraphs: ['El sitio ofrece una herramienta web de prediagnóstico energético orientativo para viviendas, generación de informes informativos y preparación de solicitudes de contacto.'] },
        { title: 'Naturaleza informativa', paragraphs: ['La información mostrada tiene carácter orientativo, comercial e informativo. No constituye certificación energética oficial, informe pericial ni asesoramiento legal.'] },
      ],
    },
  },
  en: {
    privacy: {
      title: 'Privacy policy',
      description: 'This policy explains how Anclora EnergyScan processes personal data used to create accounts, generate indicative energy pre-assessments, manage attachments and handle contact requests.',
      updatedAt: updatedAt.en,
      sections: [
        { title: 'Controller and contact', paragraphs: ['Controller: Anclora Group, owner and operator of Anclora EnergyScan.', 'Privacy contact: hola@anclora.com.'] },
        { title: 'Data we may process', items: ['Account, authentication and session data.', 'Declared property data and documentation voluntarily submitted.', 'Provider or partner contact requests.', 'Technical data required for security, operation and incident diagnosis.'] },
        { title: 'Purposes', items: ['Create and maintain the user account.', 'Generate indicative energy pre-assessments and PDF reports.', 'Store assessments, attachments and linked requests.', 'Manage contact requests when requested by the user.'] },
        { title: 'Indicative nature', paragraphs: ['Anclora EnergyScan does not generate official Energy Performance Certificates. Estimates, ratings, costs and recommendations are indicative and must be checked by a qualified technician.'] },
      ],
    },
    terms: {
      title: 'Terms of service',
      description: 'These terms govern the use of Anclora EnergyScan as an indicative energy pre-assessment platform for homes.',
      updatedAt: updatedAt.en,
      sections: [
        { title: 'Service scope', paragraphs: ['Anclora EnergyScan lets users enter property data, attach documentation, obtain an indicative energy estimate, view improvement proposals and generate informative reports.'] },
        { title: 'No replacement for official certification', paragraphs: ['Anclora EnergyScan does not issue official Energy Performance Certificates, perform technical inspections or replace a qualified technician’s judgement.'] },
        { title: 'User data and attachments', paragraphs: ['The user confirms they have the right to upload submitted files. Attachments are used as supporting documentation without automatic technical validation.'] },
        { title: 'Contact requests', paragraphs: ['Provider connection is a request for information or quotation, without guarantee of acceptance, result, price, timeline or execution.'] },
      ],
    },
    legal: {
      title: 'Legal notice',
      description: 'General information about the site owner and basic access conditions for Anclora EnergyScan.',
      updatedAt: updatedAt.en,
      sections: [
        { title: 'Site owner', paragraphs: ['Owner and operator: Anclora Group.', 'Anclora EnergyScan is part of the Anclora Group technology ecosystem.', 'Website: https://anclora-energyscan.vercel.app/', 'Contact email: hola@anclora.com.'] },
        { title: 'Site purpose', paragraphs: ['The site provides an indicative energy pre-assessment web tool for homes, informative report generation and preparation of contact requests.'] },
        { title: 'Informative nature', paragraphs: ['The displayed information is indicative, commercial and informative. It is not official energy certification, expert evidence or legal advice.'] },
      ],
    },
  },
  de: {
    privacy: {
      title: 'Datenschutzerklärung',
      description: 'Diese Erklärung beschreibt, wie Anclora EnergyScan personenbezogene Daten für Konten, orientierende Energievoreinschätzungen, Anhänge und Kontaktanfragen verarbeitet.',
      updatedAt: updatedAt.de,
      sections: [
        { title: 'Verantwortlicher und Kontakt', paragraphs: ['Verantwortlicher: Anclora Group, Eigentümerin und Betreiberin von Anclora EnergyScan.', 'Kontakt für Datenschutz: hola@anclora.com.'] },
        { title: 'Verarbeitete Daten', items: ['Konto-, Authentifizierungs- und Sitzungsdaten.', 'Angegebene Immobiliendaten und freiwillig bereitgestellte Dokumentation.', 'Kontaktanfragen an Anbieter oder Partner.', 'Technische Daten für Sicherheit, Betrieb und Fehlerdiagnose.'] },
        { title: 'Zwecke', items: ['Nutzerkonto erstellen und verwalten.', 'Orientierende Energievoreinschätzungen und PDF-Berichte erzeugen.', 'Bewertungen, Anhänge und Anfragen speichern.', 'Kontaktanfragen auf Wunsch des Nutzers verwalten.'] },
        { title: 'Orientierender Charakter', paragraphs: ['Anclora EnergyScan erstellt keine offiziellen Energieausweise. Schätzungen, Klassen, Kosten und Empfehlungen sind orientierend und müssen von qualifizierten Fachleuten geprüft werden.'] },
      ],
    },
    terms: {
      title: 'Nutzungsbedingungen',
      description: 'Diese Bedingungen regeln die Nutzung von Anclora EnergyScan als Plattform für orientierende Energievoreinschätzungen von Wohnimmobilien.',
      updatedAt: updatedAt.de,
      sections: [
        { title: 'Leistungsumfang', paragraphs: ['Anclora EnergyScan ermöglicht die Eingabe von Immobiliendaten, das Anhängen von Dokumentation, eine orientierende Energieschätzung, Verbesserungsvorschläge und informative Berichte.'] },
        { title: 'Kein Ersatz für offiziellen Energieausweis', paragraphs: ['Anclora EnergyScan stellt keine offiziellen Energieausweise aus, führt keine technischen Inspektionen durch und ersetzt nicht die Beurteilung qualifizierter Fachleute.'] },
        { title: 'Daten und Anhänge', paragraphs: ['Der Nutzer bestätigt, dass er berechtigt ist, die eingereichten Dateien hochzuladen. Anhänge dienen als Nachweis ohne automatische technische Validierung.'] },
        { title: 'Kontaktanfragen', paragraphs: ['Die Verbindung zu Anbietern ist eine Informations- oder Angebotsanfrage ohne Garantie für Annahme, Ergebnis, Preis, Frist oder Ausführung.'] },
      ],
    },
    legal: {
      title: 'Impressum',
      description: 'Allgemeine Informationen zum Betreiber der Website und grundlegende Zugangsbedingungen für Anclora EnergyScan.',
      updatedAt: updatedAt.de,
      sections: [
        { title: 'Betreiber', paragraphs: ['Eigentümerin und Betreiberin: Anclora Group.', 'Anclora EnergyScan ist Teil des Technologie-Ökosystems von Anclora Group.', 'Website: https://anclora-energyscan.vercel.app/', 'Kontakt: hola@anclora.com.'] },
        { title: 'Zweck der Website', paragraphs: ['Die Website bietet ein Webtool zur orientierenden Energievoreinschätzung von Wohnimmobilien, informative Berichte und Vorbereitung von Kontaktanfragen.'] },
        { title: 'Informative Natur', paragraphs: ['Die angezeigten Informationen sind orientierend, kommerziell und informativ. Sie sind kein offizieller Energieausweis, kein Gutachten und keine Rechtsberatung.'] },
      ],
    },
  },
  // LEGAL_REVIEW_REQUIRED: Catalan translation — preserved disclaimers, contact data and entity unchanged.
  ca: {
    privacy: {
      title: 'Política de privacitat',
      description: "Aquesta política explica com Anclora EnergyScan tracta les dades personals utilitzades per crear comptes, generar prediagnòstics energètics orientatius, gestionar adjunts i tramitar sol·licituds de contacte.",
      updatedAt: updatedAt.ca,
      sections: [
        { title: 'Responsable i contacte', paragraphs: ['Responsable del tractament: Anclora Group, entitat propietària i operadora d\'Anclora EnergyScan.', 'Contacte per a privacitat: hola@anclora.com.'] },
        { title: 'Dades que podem tractar', items: ['Dades de compte, autenticació i sessió.', 'Dades declarades de l\'habitatge i documentació aportada voluntàriament.', 'Sol·licituds de contacte amb proveïdors o partners.', 'Dades tècniques necessàries per a seguretat, operació i diagnòstic d\'incidències.'] },
        { title: 'Finalitats', items: ['Crear i mantenir el compte.', 'Generar prediagnòstics energètics orientatius i informes PDF.', 'Conservar valoracions, adjunts i sol·licituds associades.', 'Gestionar sol·licituds de contacte quan l\'usuari ho demani.'] },
        { title: 'Caràcter orientatiu', paragraphs: ['Anclora EnergyScan no genera Certificats d\'Eficiència Energètica oficials. Les estimacions, lletres, costos i recomanacions són orientatius i s\'han de contrastar amb un tècnic competent.'] },
      ],
    },
    terms: {
      title: 'Termes del servei',
      description: 'Aquestes condicions regulen l\'ús d\'Anclora EnergyScan com a plataforma de prediagnòstic energètic orientatiu per a habitatges.',
      updatedAt: updatedAt.ca,
      sections: [
        { title: 'Objecte del servei', paragraphs: ['Anclora EnergyScan permet introduir dades d\'un habitatge, adjuntar documentació, obtenir una estimació energètica orientativa, visualitzar propostes de millora i generar informes informatius.'] },
        { title: 'No substitució del certificat oficial', paragraphs: ['Anclora EnergyScan no emet Certificats d\'Eficiència Energètica oficials, no realitza inspeccions tècniques i no substitueix el criteri d\'un tècnic competent.'] },
        { title: 'Dades i adjunts aportats', paragraphs: ['L\'usuari garanteix que té dret a pujar els fitxers que aporta. Els adjunts s\'usen com a suport documental sense validació tècnica automàtica.'] },
        { title: 'Sol·licituds de contacte', paragraphs: ['La connexió amb proveïdors es realitza com a sol·licitud d\'informació o pressupost, sense garantia d\'acceptació, resultat, preu, termini ni execució.'] },
      ],
    },
    legal: {
      title: 'Avís legal',
      description: 'Informació general del titular del lloc i condicions bàsiques d\'accés a Anclora EnergyScan.',
      updatedAt: updatedAt.ca,
      sections: [
        { title: 'Titular del lloc', paragraphs: ['Titular i operador: Anclora Group.', 'Anclora EnergyScan forma part de l\'ecosistema tecnològic d\'Anclora Group.', 'Lloc web: https://anclora-energyscan.vercel.app/', 'Email de contacte: hola@anclora.com.'] },
        { title: 'Finalitat del lloc', paragraphs: ['El lloc ofereix una eina web de prediagnòstic energètic orientatiu per a habitatges, generació d\'informes informatius i preparació de sol·licituds de contacte.'] },
        { title: 'Naturalesa informativa', paragraphs: ['La informació mostrada té caràcter orientatiu, comercial i informatiu. No constitueix certificació energètica oficial, informe pericial ni assessorament legal.'] },
      ],
    },
  },
  // LEGAL_REVIEW_REQUIRED: French translation — preserved disclaimers, contact data and entity unchanged.
  fr: {
    privacy: {
      title: 'Politique de confidentialité',
      description: "Cette politique explique comment Anclora EnergyScan traite les données personnelles utilisées pour créer des comptes, générer des pré-diagnostics énergétiques indicatifs, gérer les pièces jointes et traiter les demandes de contact.",
      updatedAt: updatedAt.fr,
      sections: [
        { title: 'Responsable et contact', paragraphs: ['Responsable du traitement : Anclora Group, entité propriétaire et opératrice d\'Anclora EnergyScan.', 'Contact pour la confidentialité : hola@anclora.com.'] },
        { title: 'Données susceptibles d\'être traitées', items: ['Données de compte, d\'authentification et de session.', 'Données déclarées du logement et documentation soumise volontairement.', 'Demandes de contact avec des prestataires ou partenaires.', 'Données techniques nécessaires à la sécurité, à l\'exploitation et au diagnostic des incidents.'] },
        { title: 'Finalités', items: ['Créer et maintenir le compte utilisateur.', 'Générer des pré-diagnostics énergétiques indicatifs et des rapports PDF.', 'Conserver les évaluations, pièces jointes et demandes associées.', 'Gérer les demandes de contact à la demande de l\'utilisateur.'] },
        { title: 'Caractère indicatif', paragraphs: ['Anclora EnergyScan ne génère pas de Diagnostics de Performance Énergétique officiels. Les estimations, lettres, coûts et recommandations sont indicatifs et doivent être vérifiés par un technicien qualifié.'] },
      ],
    },
    terms: {
      title: 'Conditions d\'utilisation',
      description: "Ces conditions régissent l'utilisation d'Anclora EnergyScan en tant que plateforme de pré-diagnostic énergétique indicatif pour les logements.",
      updatedAt: updatedAt.fr,
      sections: [
        { title: 'Objet du service', paragraphs: ['Anclora EnergyScan permet de saisir les données d\'un logement, de joindre des documents, d\'obtenir une estimation énergétique indicative, de visualiser des propositions d\'amélioration et de générer des rapports informatifs.'] },
        { title: 'Non-substitution au certificat officiel', paragraphs: ['Anclora EnergyScan n\'émet pas de Diagnostics de Performance Énergétique officiels, n\'effectue pas d\'inspections techniques et ne remplace pas le jugement d\'un technicien qualifié.'] },
        { title: 'Données et pièces jointes fournies', paragraphs: ['L\'utilisateur garantit qu\'il a le droit de télécharger les fichiers qu\'il soumet. Les pièces jointes sont utilisées comme documentation de support sans validation technique automatique.'] },
        { title: 'Demandes de contact', paragraphs: ['La mise en relation avec les prestataires constitue une demande d\'information ou de devis, sans garantie d\'acceptation, de résultat, de prix, de délai ni d\'exécution.'] },
      ],
    },
    legal: {
      title: 'Mentions légales',
      description: "Informations générales sur le titulaire du site et conditions d'accès de base à Anclora EnergyScan.",
      updatedAt: updatedAt.fr,
      sections: [
        { title: 'Titulaire du site', paragraphs: ['Titulaire et opérateur : Anclora Group.', 'Anclora EnergyScan fait partie de l\'écosystème technologique d\'Anclora Group.', 'Site web : https://anclora-energyscan.vercel.app/', 'Email de contact : hola@anclora.com.'] },
        { title: 'Finalité du site', paragraphs: ['Le site propose un outil web de pré-diagnostic énergétique indicatif pour les logements, la génération de rapports informatifs et la préparation de demandes de contact.'] },
        { title: 'Nature informative', paragraphs: ['Les informations affichées ont un caractère indicatif, commercial et informatif. Elles ne constituent pas une certification énergétique officielle, un rapport d\'expertise ni un conseil juridique.'] },
      ],
    },
  },
  // LEGAL_REVIEW_REQUIRED: Italian translation — preserved disclaimers, contact data and entity unchanged.
  it: {
    privacy: {
      title: 'Informativa sulla privacy',
      description: "Questa informativa spiega come Anclora EnergyScan tratta i dati personali utilizzati per creare account, generare pre-diagnosi energetiche indicative, gestire allegati e gestire le richieste di contatto.",
      updatedAt: updatedAt.it,
      sections: [
        { title: 'Titolare e contatto', paragraphs: ['Titolare del trattamento: Anclora Group, entità proprietaria e operatrice di Anclora EnergyScan.', 'Contatto per la privacy: hola@anclora.com.'] },
        { title: 'Dati che possiamo trattare', items: ['Dati di account, autenticazione e sessione.', 'Dati dichiarati dell\'immobile e documentazione fornita volontariamente.', 'Richieste di contatto con fornitori o partner.', 'Dati tecnici necessari per sicurezza, operatività e diagnosi degli incidenti.'] },
        { title: 'Finalità', items: ['Creare e mantenere l\'account utente.', 'Generare pre-diagnosi energetiche indicative e rapporti PDF.', 'Conservare valutazioni, allegati e richieste associate.', 'Gestire le richieste di contatto su richiesta dell\'utente.'] },
        { title: 'Carattere indicativo', paragraphs: ['Anclora EnergyScan non genera Attestati di Prestazione Energetica ufficiali. Le stime, le classi, i costi e le raccomandazioni sono indicativi e devono essere verificati da un tecnico qualificato.'] },
      ],
    },
    terms: {
      title: 'Termini di servizio',
      description: "Questi termini regolano l'utilizzo di Anclora EnergyScan come piattaforma di pre-diagnosi energetica indicativa per immobili residenziali.",
      updatedAt: updatedAt.it,
      sections: [
        { title: 'Oggetto del servizio', paragraphs: ['Anclora EnergyScan consente di inserire i dati di un immobile, allegare documentazione, ottenere una stima energetica indicativa, visualizzare proposte di miglioramento e generare rapporti informativi.'] },
        { title: 'Non sostituzione del certificato ufficiale', paragraphs: ['Anclora EnergyScan non rilascia Attestati di Prestazione Energetica ufficiali, non effettua ispezioni tecniche e non sostituisce il giudizio di un tecnico qualificato.'] },
        { title: 'Dati e allegati forniti', paragraphs: ['L\'utente dichiara di avere il diritto di caricare i file che invia. Gli allegati vengono utilizzati come documentazione di supporto senza validazione tecnica automatica.'] },
        { title: 'Richieste di contatto', paragraphs: ['Il contatto con i fornitori costituisce una richiesta di informazioni o preventivo, senza garanzia di accettazione, risultato, prezzo, tempi né esecuzione.'] },
      ],
    },
    legal: {
      title: 'Note legali',
      description: "Informazioni generali sul titolare del sito e condizioni di accesso di base ad Anclora EnergyScan.",
      updatedAt: updatedAt.it,
      sections: [
        { title: 'Titolare del sito', paragraphs: ['Titolare e operatore: Anclora Group.', 'Anclora EnergyScan fa parte dell\'ecosistema tecnologico di Anclora Group.', 'Sito web: https://anclora-energyscan.vercel.app/', 'Email di contatto: hola@anclora.com.'] },
        { title: 'Finalità del sito', paragraphs: ['Il sito offre uno strumento web di pre-diagnosi energetica indicativa per immobili residenziali, la generazione di rapporti informativi e la preparazione di richieste di contatto.'] },
        { title: 'Natura informativa', paragraphs: ['Le informazioni visualizzate hanno carattere indicativo, commerciale e informativo. Non costituiscono una certificazione energetica ufficiale, una perizia né una consulenza legale.'] },
      ],
    },
  },
  // LEGAL_REVIEW_REQUIRED: Portuguese (European) translation — preserved disclaimers, contact data and entity unchanged.
  pt: {
    privacy: {
      title: 'Política de privacidade',
      description: "Esta política explica como a Anclora EnergyScan trata os dados pessoais utilizados para criar contas, gerar pré-diagnósticos energéticos indicativos, gerir anexos e tratar pedidos de contacto.",
      updatedAt: updatedAt.pt,
      sections: [
        { title: 'Responsável e contacto', paragraphs: ['Responsável pelo tratamento: Anclora Group, entidade proprietária e operadora da Anclora EnergyScan.', 'Contacto para privacidade: hola@anclora.com.'] },
        { title: 'Dados que podemos tratar', items: ['Dados de conta, autenticação e sessão.', 'Dados declarados do imóvel e documentação fornecida voluntariamente.', 'Pedidos de contacto com prestadores ou parceiros.', 'Dados técnicos necessários para segurança, operação e diagnóstico de incidentes.'] },
        { title: 'Finalidades', items: ['Criar e manter a conta do utilizador.', 'Gerar pré-diagnósticos energéticos indicativos e relatórios PDF.', 'Conservar avaliações, anexos e pedidos associados.', 'Gerir pedidos de contacto quando solicitado pelo utilizador.'] },
        { title: 'Carácter indicativo', paragraphs: ['A Anclora EnergyScan não gera Certificados de Desempenho Energético oficiais. As estimativas, classes, custos e recomendações são indicativos e devem ser verificados por um técnico competente.'] },
      ],
    },
    terms: {
      title: 'Termos de serviço',
      description: "Estas condições regulam a utilização da Anclora EnergyScan como plataforma de pré-diagnóstico energético indicativo para habitações.",
      updatedAt: updatedAt.pt,
      sections: [
        { title: 'Objecto do serviço', paragraphs: ['A Anclora EnergyScan permite introduzir dados de uma habitação, anexar documentação, obter uma estimativa energética indicativa, visualizar propostas de melhoria e gerar relatórios informativos.'] },
        { title: 'Não substituição do certificado oficial', paragraphs: ['A Anclora EnergyScan não emite Certificados de Desempenho Energético oficiais, não realiza inspecções técnicas e não substitui o critério de um técnico competente.'] },
        { title: 'Dados e anexos fornecidos', paragraphs: ['O utilizador garante que tem direito a carregar os ficheiros que fornece. Os anexos são utilizados como suporte documental sem validação técnica automática.'] },
        { title: 'Pedidos de contacto', paragraphs: ['A ligação com prestadores realiza-se como pedido de informação ou orçamento, sem garantia de aceitação, resultado, preço, prazo nem execução.'] },
      ],
    },
    legal: {
      title: 'Aviso legal',
      description: "Informação geral sobre o titular do sítio e condições básicas de acesso à Anclora EnergyScan.",
      updatedAt: updatedAt.pt,
      sections: [
        { title: 'Titular do sítio', paragraphs: ['Titular e operador: Anclora Group.', 'A Anclora EnergyScan faz parte do ecossistema tecnológico do Anclora Group.', 'Sítio web: https://anclora-energyscan.vercel.app/', 'Email de contacto: hola@anclora.com.'] },
        { title: 'Finalidade do sítio', paragraphs: ['O sítio disponibiliza uma ferramenta web de pré-diagnóstico energético indicativo para habitações, geração de relatórios informativos e preparação de pedidos de contacto.'] },
        { title: 'Natureza informativa', paragraphs: ['A informação apresentada tem carácter indicativo, comercial e informativo. Não constitui certificação energética oficial, relatório pericial nem aconselhamento jurídico.'] },
      ],
    },
  },
};

export function getLegalContent(language: AppLanguage | LegalLanguage, kind: LegalPageKind): LegalPageContent {
  const lang = language as LegalLanguage;
  // Falls back to Spanish if the language is not yet in legalContent (defensive guard)
  if (legalContent[lang]) return legalContent[lang][kind];
  return legalContent['es'][kind];
}
