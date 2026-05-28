# Copy Risk Classification

Date: 2026-05-28
Branch: feat/premium-missing-locales-copy-hermes

## Risk levels

| Level | Criteria |
| --- | --- |
| HIGH | Legal obligations, disclaimers, consent text, contact data |
| MEDIUM | Pricing, product names, regulatory references (CEE, EPBD, SCE, APE, DPE) |
| LOW | UI labels, navigation, CTAs, generic copy |

## HIGH risk keys — LEGAL_REVIEW_REQUIRED

All copies of the following keys in ca/fr/it/pt are translations of the es/en/de originals.
No legal obligations have been softened, removed or reinterpreted.
Contact data (hola@anclora.com) and responsible entity (Anclora Group) are preserved verbatim.

| Key | Locales | Notes |
| --- | --- | --- |
| `legalDisclaimer` | all 7 | Core disclaimer: indicative pre-assessment, no CEE replacement |
| `paywall.legalNotice` | all 7 | "Indicative report, not official EPC/CEE/SCE/APE/DPE" |
| `seo.disclaimer` | all 7 | SEO-facing disclaimer |
| `providerHandoff.consent` | all 7 | Explicit user consent text — data sharing with providers |
| `partnerLanding.disclaimer` | all 7 | Partner landing disclaimer |
| All `legal-content.ts` sections | ca, fr, it, pt | Privacy policy, Terms of service, Legal notice |

## MEDIUM risk keys

| Key | Notes |
| --- | --- |
| `pricing.premium.launchPrice` / `standardPrice` | Prices preserved verbatim (9,90 / 14,90 €) |
| `pricing.premium.cta` | Price included in CTA |
| `checkout.button` | Price included |
| Regulatory acronyms: CEE, EPBD, SCE (PT), APE (IT), DPE (FR) | Correct local acronym used per locale |

## LOW risk keys

All UI labels, navigation items, generic CTAs, dashboard labels.

## Copy rules compliance check

| Rule | Status |
| --- | --- |
| No "siéntete libre de" | PASS |
| No "no dudes en" | PASS |
| No "propiedades únicas" | PASS |
| No "Wir begrüßen Ihre Fragen" | PASS |
| No guarantee language | PASS |
| EnergyScan preserved | PASS |
| CEE/EPBD/Catastro/Budget Review/Premium preserved | PASS |
| PT: Portuguese European | PASS |
| DE: formal Sie (inherited from de/common.json) | PASS |
| NOT presented as official certificate | PASS |
| NOT guaranteeing savings or ratings | PASS |
