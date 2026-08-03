<!-- markdownlint-disable MD001 MD013 MD033 MD041 MD060 -->

<div align="center">

<img src="./public/brand/anclora-energyscan.png" alt="Anclora EnergyScan" width="132" />

# Anclora EnergyScan

### Orientative energy pre-diagnosis for homes

Guided residential wizard that computes a traceable energy score, with improvement scenarios, cadastral integration, and Premium reports.

[Español](./README.md) · [Català](./README.ca.md) · **English** · [Deutsch](./README.de.md) · [Français](./README.fr.md) · [Italiano](./README.it.md) · [Português](./README.pt.md)

<br />

![Anclora](https://img.shields.io/badge/Anclora-ecosystem-111827)
![Category](https://img.shields.io/badge/category-Premium-C07860)
![Languages](https://img.shields.io/badge/product%20languages-7-047857)

</div>

---

> [!IMPORTANT]
> Internal Anclora ecosystem repository. EnergyScan does not issue an official Energy Performance Certificate or administratively valid documentation — it is an orientative pre-diagnosis. Do not publish operational details, credentials, or sensitive logic outside authorized channels.

## What it is

Anclora EnergyScan guides the user through a wizard covering building envelope, systems, renewables, climate, and dwelling type, then computes an explainable energy score with a confidence level. From the diagnosis it generates comparable improvement scenarios and an unlockable Premium report.

## Category in the ecosystem

| Field | Value |
|---|---|
| Category | Premium |
| Brand accent | `#00DC82` |
| Typography | DM Sans |
| Canonical repository | `anclora-energyscan` |

## Key features

- Guided residential wizard (envelope, systems, renewables, climate, dwelling type)
- Traceable energy scoring with confidence level
- Improvement and orientative savings scenarios
- Cadastral integration and parcel visualization (MapLibre)
- OCR on submitted documentation (Tesseract)
- Generative AI assistance (Anthropic Claude)
- PDF reports, Premium unlock via Stripe
- Provider, partner, and lead network

## Technology stack

| Area | Technology |
|---|---|
| Framework | Next.js, React |
| Database | Prisma, PostgreSQL |
| Authentication | NextAuth |
| Generative AI | Anthropic Claude SDK |
| Cadastral maps | MapLibre GL |
| OCR | Tesseract.js |
| PDF | react-pdf, pdf-lib, pdfjs-dist |
| Payments | Stripe |
| Storage | Vercel Blob |

## Local setup

```bash
npm install
npm run dev
```

## Supported languages

The production product supports 7 languages: Español (default), Català, English, Deutsch, Français, Italiano, Português (`PREMIUM_LOCALES`, `src/lib/anclora-language-toggle.ts`). This documentation is maintained in all 7 product languages.

## Documentation and governance

- Brand and governance contracts: [`docs/standards/`](./docs/standards/)
- Anclora Vault (source of truth): `contracts/` and `docs/governance/`

---

<div align="center">

### Anclora Group

Internal use.

</div>
