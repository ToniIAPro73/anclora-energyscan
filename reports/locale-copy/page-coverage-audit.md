# Page Coverage Audit

Date: 2026-05-28
Branch: feat/premium-missing-locales-copy-hermes

## Coverage status

All translations in `public/locales/<lang>/common.json` share the same 101-key schema.
Pages use keys from that schema. Any page that renders i18n keys is covered in all locales
where the key exists.

| Route | Key namespace used | Coverage es/en/de | Coverage ca/fr/it/pt |
| --- | --- | --- | --- |
| `/` | landing.useCases.*, pricing.*, start, startFree | FULL | FULL (added) |
| `/auth` | userMenu.* | FULL | FULL (added) |
| `/dashboard` | dashboard.connected.*, userMenu.* | FULL | FULL (added) |
| `/wizard` | wizard.budgetContext.notice, start | FULL | FULL (added) |
| `/pricing` | pricing.*, paywall.* | FULL | FULL (added) |
| `/settings` | language, currency, measurement, theme | FULL | FULL (added) |
| `/profile` | userMenu.profile | FULL | FULL (added) |
| `/legal` | legal, legalDisclaimer | FULL | FULL (added) |
| `/privacy` | privacy | FULL | FULL (added) |
| `/terms` | terms | FULL | FULL (added) |
| `/profesional` | professional.title | FULL | FULL (added) |
| `/profesional/solicitar` | professional.title, professional.dashboard.title | FULL | FULL (added) |
| `/provider/register` | providers.heroCtaRegister, providers.heroCtaHowItWorks | FULL | FULL (added) |
| `/provider/dashboard` | providers.heroCtaPanel, provider.title | FULL | FULL (added) |
| `/provider/leads` | provider.leads.* | FULL | FULL (added) |
| `/provider/billing` | provider.title | FULL | FULL (added) |
| `/budget-review` | budgetReview.* | FULL | FULL (added) |
| `/checkout/success` | checkout.success.* | FULL | FULL (added) |
| `/calculadora-ahorro` | calculator.title | FULL | FULL (added) |

## Notes

- Legal page content (privacy/terms/legal) rendered via `src/lib/legal-content.ts`, not i18n JSON.
  Extended to ca/fr/it/pt via new `LegalLanguage` type. All LEGAL_REVIEW_REQUIRED.
- Admin routes (`/admin/*`) use admin.* keys — covered in all 7 locales.
