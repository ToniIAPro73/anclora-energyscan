<!-- markdownlint-disable MD001 MD013 MD033 MD041 MD060 -->

<div align="center">

<img src="./public/brand/anclora-energyscan.png" alt="Anclora EnergyScan" width="132" />

# Anclora EnergyScan

### Orientierende Energie-Vordiagnose für Wohngebäude

Geführter Wohnungs-Assistent, der einen nachvollziehbaren Energie-Score berechnet, mit Verbesserungsszenarien, Katasterintegration und Premium-Berichten.

[Español](./README.md) · [English](./README.en.md) · **Deutsch**

<br />

![Anclora](https://img.shields.io/badge/Anclora-ecosystem-111827)
![Kategorie](https://img.shields.io/badge/kategorie-Premium-C07860)
![Sprachen](https://img.shields.io/badge/sprachen-ES%20%7C%20EN%20%7C%20DE-047857)

</div>

---

> [!IMPORTANT]
> Internes Repository des Anclora-Ökosystems. EnergyScan stellt kein offizielles Energieausweiszertifikat und keine verwaltungsrechtlich gültige Dokumentation aus — es handelt sich um eine orientierende Vordiagnose. Keine operativen Details, Zugangsdaten oder sensible Logik außerhalb autorisierter Kanäle veröffentlichen.

## Was es ist

Anclora EnergyScan führt die Nutzerin oder den Nutzer durch einen Assistenten zu Gebäudehülle, Anlagentechnik, erneuerbaren Energien, Klima und Wohnungstyp und berechnet einen erklärbaren Energie-Score mit Konfidenzniveau. Aus der Diagnose werden vergleichbare Verbesserungsszenarien und ein freischaltbarer Premium-Bericht erzeugt.

## Kategorie im Ökosystem

| Feld | Wert |
|---|---|
| Kategorie | Premium |
| Markenakzent | `#00DC82` |
| Typografie | DM Sans |
| Kanonisches Repository | `anclora-energyscan` |

## Kernfunktionen

- Geführter Wohnungs-Assistent (Gebäudehülle, Anlagentechnik, erneuerbare Energien, Klima, Wohnungstyp)
- Nachvollziehbares Energie-Scoring mit Konfidenzniveau
- Verbesserungs- und orientierende Einsparszenarien
- Katasterintegration und Parzellenvisualisierung (MapLibre)
- OCR für eingereichte Dokumente (Tesseract)
- Generative KI-Unterstützung (Anthropic Claude)
- PDF-Berichte, Premium-Freischaltung via Stripe
- Netzwerk aus Anbietern, Partnern und Leads

## Technologie-Stack

| Bereich | Technologie |
|---|---|
| Framework | Next.js, React |
| Datenbank | Prisma, PostgreSQL |
| Authentifizierung | NextAuth |
| Generative KI | Anthropic Claude SDK |
| Katasterkarten | MapLibre GL |
| OCR | Tesseract.js |
| PDF | react-pdf, pdf-lib, pdfjs-dist |
| Zahlungen | Stripe |
| Speicher | Vercel Blob |

## Lokaler Start

```bash
npm install
npm run dev
```

## Unterstützte Sprachen

- Español (Standard)
- English
- Deutsch

## Dokumentation und Governance

- Marken- und Governance-Verträge: [`docs/standards/`](./docs/standards/)
- Anclora Vault (Quelle der Wahrheit): `contracts/` und `docs/governance/`

---

<div align="center">

### Anclora Group

Interne Nutzung.

</div>
