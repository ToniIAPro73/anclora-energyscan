# Visual Review Notes

Date: 2026-05-28
Branch: feat/premium-missing-locales-copy-hermes

## Copy tone check by locale

### Catalan (ca) — based on ES

- Tone: clear, technical, conservative. No anglicisms.
- Key regulatory term: CEE preserved.
- Disclaimer: identical in meaning to ES, conservative.
- Provider consent: legally equivalent to ES.

### French (fr) — based on EN

- Tone: formal, technical. "vous" register maintained throughout.
- Key regulatory term: DPE (Diagnostic de Performance Énergétique) used where appropriate.
  CEE preserved where used as brand/acronym context.
- "n'hésitez pas" not used.
- "Prestataire" used for "provider" (accurate for FR context).

### Italian (it) — based on EN

- Tone: formal, technical. "Lei" register not needed at key level.
- Key regulatory term: APE (Attestato di Prestazione Energetica) used where appropriate.
- "sentiti libero" not used.
- "Fornitore" used for "provider" (accurate for IT context).

### Portuguese (pt) — based on EN, European Portuguese

- Tone: formal European Portuguese. "você" not used (avoided).
- Key regulatory term: SCE (Sistema de Certificação Energética) used where appropriate.
- "Prestador" used for "provider" (accurate European PT).
- "Transferir" used for "download" (European PT, not "baixar" which is BR).
- "Ficheiro" used for "file" (European PT, not "arquivo").

## Potential visual issues

| Locale | Key | Note |
| --- | --- | --- |
| fr | `checkout.button` | Long string — check button truncation in UI |
| pt | `checkout.success.backToAssessment` | "Regressar à análise completa" — verify layout |
| ca | `providerHandoff.consent` | Long text — verify checkbox alignment |
| it | `landing.useCases.home.description` | Verify line-break in card layout |

## Theme Toggle

Theme Toggle remains separate from language selector. No changes to theme system.
