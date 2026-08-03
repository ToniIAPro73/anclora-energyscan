<!-- markdownlint-disable MD001 MD013 MD033 MD041 MD060 -->

<div align="center">

<img src="./public/brand/anclora-energyscan.png" alt="Anclora EnergyScan" width="132" />

# Anclora EnergyScan

### Prédiagnostic énergétique indicatif pour les logements

Assistant résidentiel guidé qui calcule un score énergétique traçable, avec des scénarios d'amélioration, une intégration cadastrale et des rapports Premium.

[Español](./README.md) · [Català](./README.ca.md) · [English](./README.en.md) · [Deutsch](./README.de.md) · **Français** · [Italiano](./README.it.md) · [Português](./README.pt.md)

<br />

![Anclora](https://img.shields.io/badge/Anclora-ecosystem-111827)
![Catégorie](https://img.shields.io/badge/catégorie-Premium-C07860)
![Langues](https://img.shields.io/badge/langues%20produit-7-047857)

</div>

---

> [!IMPORTANT]
> Dépôt interne de l'écosystème Anclora. EnergyScan ne délivre pas de Certificat de Performance Énergétique officiel ni de documentation à valeur administrative — il s'agit d'un prédiagnostic indicatif. Ne publiez pas de détails opérationnels, d'identifiants ni de logique sensible en dehors des canaux autorisés.

## Ce que c'est

Anclora EnergyScan guide l'utilisateur à travers un assistant sur l'enveloppe du bâtiment, les systèmes, les énergies renouvelables, le climat et le type de logement, et calcule un score énergétique explicable avec un niveau de confiance. À partir du diagnostic, il génère des scénarios d'amélioration comparables et un rapport déverrouillable en mode Premium.

## Catégorie dans l'écosystème

| Champ | Valeur |
|---|---|
| Catégorie | Premium |
| Accent de marque | `#00DC82` |
| Typographie | DM Sans |
| Dépôt canonique | `anclora-energyscan` |

## Fonctionnalités principales

- Assistant résidentiel guidé (enveloppe, systèmes, renouvelables, climat, typologie)
- Score énergétique traçable avec niveau de confiance
- Scénarios d'amélioration et d'économies indicatives
- Intégration cadastrale et visualisation de parcelle (MapLibre)
- OCR sur la documentation fournie (Tesseract)
- Assistance IA générative (Anthropic Claude)
- Rapports PDF, déverrouillage Premium via Stripe
- Réseau de fournisseurs, partenaires et leads

## Stack technologique

| Domaine | Technologie |
|---|---|
| Framework | Next.js, React |
| Base de données | Prisma, PostgreSQL |
| Authentification | NextAuth |
| IA générative | Anthropic Claude SDK |
| Cartes cadastrales | MapLibre GL |
| OCR | Tesseract.js |
| PDF | react-pdf, pdf-lib, pdfjs-dist |
| Paiements | Stripe |
| Stockage | Vercel Blob |

## Démarrage local

```bash
npm install
npm run dev
```

## Langues prises en charge

Le produit en production prend en charge 7 langues : Español (par défaut), Català, English, Deutsch, Français, Italiano, Português (`PREMIUM_LOCALES`, `src/lib/anclora-language-toggle.ts`). Cette documentation est maintenue dans les 7 langues du produit.

## Documentation et gouvernance

- Contrats de marque et de gouvernance : [`docs/standards/`](./docs/standards/)
- Anclora Vault (source de vérité) : `contracts/` et `docs/governance/`

---

<div align="center">

### Anclora Group

Usage interne.

</div>
