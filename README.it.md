<!-- markdownlint-disable MD001 MD013 MD033 MD041 MD060 -->

<div align="center">

<img src="./public/brand/anclora-energyscan.png" alt="Anclora EnergyScan" width="132" />

# Anclora EnergyScan

### Prediagnosi energetica indicativa per le abitazioni

Wizard residenziale guidato che calcola un punteggio energetico tracciabile, con scenari di miglioramento, integrazione catastale e report Premium.

[Español](./README.md) · [Català](./README.ca.md) · [English](./README.en.md) · [Deutsch](./README.de.md) · [Français](./README.fr.md) · **Italiano** · [Português](./README.pt.md)

<br />

![Anclora](https://img.shields.io/badge/Anclora-ecosystem-111827)
![Categoria](https://img.shields.io/badge/categoria-Premium-C07860)
![Lingue](https://img.shields.io/badge/lingue%20prodotto-7-047857)

</div>

---

> [!IMPORTANT]
> Repository interno dell'ecosistema Anclora. EnergyScan non genera un Attestato di Prestazione Energetica ufficiale né documentazione con validità amministrativa — è una prediagnosi indicativa. Non pubblicare dettagli operativi, credenziali o logica sensibile al di fuori dei canali autorizzati.

## Cos'è

Anclora EnergyScan guida l'utente attraverso un wizard su involucro edilizio, impianti, rinnovabili, clima e tipologia abitativa, e calcola un punteggio energetico spiegabile con livello di confidenza. Dalla diagnosi genera scenari di miglioramento comparabili e un report sbloccabile in modalità Premium.

## Categoria nell'ecosistema

| Campo | Valore |
|---|---|
| Categoria | Premium |
| Accento del marchio | `#00DC82` |
| Tipografia | DM Sans |
| Repository canonico | `anclora-energyscan` |

## Funzionalità principali

- Wizard residenziale guidato (involucro, impianti, rinnovabili, clima, tipologia)
- Punteggio energetico tracciabile con livello di confidenza
- Scenari di miglioramento e risparmio indicativo
- Integrazione catastale e visualizzazione della particella (MapLibre)
- OCR sulla documentazione fornita (Tesseract)
- Assistenza IA generativa (Anthropic Claude)
- Report in PDF, sblocco Premium via Stripe
- Rete di fornitori, partner e lead

## Stack tecnologico

| Area | Tecnologia |
|---|---|
| Framework | Next.js, React |
| Database | Prisma, PostgreSQL |
| Autenticazione | NextAuth |
| IA generativa | Anthropic Claude SDK |
| Mappe catastali | MapLibre GL |
| OCR | Tesseract.js |
| PDF | react-pdf, pdf-lib, pdfjs-dist |
| Pagamenti | Stripe |
| Archiviazione | Vercel Blob |

## Avvio locale

```bash
npm install
npm run dev
```

## Lingue supportate

Il prodotto in produzione supporta 7 lingue: Español (predefinita), Català, English, Deutsch, Français, Italiano, Português (`PREMIUM_LOCALES`, `src/lib/anclora-language-toggle.ts`). Questa documentazione è mantenuta in tutte le 7 lingue del prodotto.

## Documentazione e governance

- Contratti di marchio e governance: [`docs/standards/`](./docs/standards/)
- Anclora Vault (fonte di verità): `contracts/` e `docs/governance/`

---

<div align="center">

### Anclora Group

Uso interno.

</div>
