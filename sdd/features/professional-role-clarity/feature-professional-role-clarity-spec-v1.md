# Feature Spec: Professional Role Clarity v1

**Feature ID:** professional-role-clarity  
**Date:** 2026-05-21  
**Branch:** feat/professional-role-clarity  
**Status:** Implemented

---

## Objective

Clarify the functional and commercial contract of the professional profile across landing, request flow, dashboard and user manual. Separate professional from residential and provider roles. Improve beta onboarding and access-state messaging.

---

## Role definitions

| Profile | For whom | Can do | Must not promise |
|---|---|---|---|
| Residential | Owner, buyer, seller, tenant | Analyse own property, PDF Premium, Budget Review | No official EPC, no full technical advice |
| Professional | Certifier, technical architect, energy adviser, real estate | Manage client cases, pre-assessments, PDFs, Budget Review, prepare proposals | Does not replace official software or technical signature |
| Provider | Installer, energy company | Receive consented leads, manage credits | No commercial guarantee |
| Admin | Anclora team | Review requests, approve/reject | N/A |

---

## Professional access states contract

### No session
- Can see landing, understand the role, view use cases and available/upcoming features.
- Cannot access dashboard, cases or professional features.
- CTA redirects to auth with callback to `/profesional/solicitar`.

### Logged in, no request
- Can request beta access.
- Can see status explanation.
- Can return to residential dashboard.
- Cannot enter professional dashboard.

### Pending request
- Can see pending status.
- Gets explanation of next steps and can use residential features while waiting.
- Cannot use professional-restricted features.

### Rejected request
- Can see prudent rejection message.
- Can continue using residential features.
- Cannot access professional dashboard.

### Approved
- Can access `/profesional/dashboard`.
- Can create new client assessments (via wizard).
- Can view own cases/assessments.
- Can unlock/download PDF Premium per case.
- Can initiate Budget Review for a client quote.
- Can register client marketplace interest with consent.
- Can express interest in white-label/branding addon.
- Cannot see other users' cases.
- Cannot act as admin.
- Cannot issue official EPCs.

---

## MVP scope

### Available now
- Beta access request and approval flow.
- Professional dashboard protected by approval status.
- Cases = assessments created by the professional user (MVP: own assessments).
- PDF Premium access per case.
- Budget Review as professional tool (orientative second opinion).
- White-label interest capture (not activated automatically).
- Provider marketplace client registration (with consent).

### Upcoming / prepared
- Client alias / internal reference.
- PDF with professional branding.
- Volume-based professional plans.
- Advanced export.
- API / white-label integration.

### Out of scope / not promised
- Official EPC issuance.
- Technical signature.
- CRM.
- Professional billing (Stripe subscriptions not active).
- Guarantee of savings or grants.

---

## Pages changed

### `/profesional`
- Added: "Para quién es" block (4 personas).
- Added: "Qué puedes hacer ahora" block.
- Added: "Qué no incluye" block.
- Added: Beta notice block.
- Added: "Profesional no es proveedor" block.
- CTA logic: approved → dashboard, logged-in → solicitar, no session → auth with callbackUrl.
- Preserved: feature cards, access status badge.

### `/profesional/solicitar`
- Added: profileType dropdown (7 options).
- Added: useCase and volume text fields.
- Added: terms checkbox (required).
- Added: login context notice for unauthenticated users.
- Pre-fills email from session if available.
- Combines role fields into the message field for backward compatibility (no migration needed).

### `/profesional/dashboard`
- Added: KPI row (cases, PDF unlocked, Budget Reviews).
- Added: Budget Review CTA (quick actions + dedicated section).
- Added: "Cómo usarlo con clientes" step guide.
- Added: Budget Review professional section with description and disclaimer.
- Added: Provider CTA block.
- Added: Legal notice block.
- Improved: pending state shows extended explanation.
- Improved: rejected state shows extended explanation.
- Improved: login gate shows both "Entrar" and "Solicitar acceso" CTAs.
- Used `getPropertyTypeLabel` instead of raw enum for property display.

---

## i18n changes

New keys added to ES, EN, DE `professional` section:

- `forWhomTitle`, `forCertifiers`, `forCertifiersText`, `forAdvisors`, `forAdvisorsText`, `forRealEstate`, `forRealEstateText`, `forAssetManagers`, `forAssetManagersText`
- `availableNowTitle`, `availableNow` (array)
- `notIncludedTitle`, `notIncluded`
- `betaNotice`
- `providerDifferenceTitle`, `providerDifferenceText`
- `profileTypePlaceholder`, `profileTypes` (array)
- `useCasePlaceholder`, `volumePlaceholder`
- `termsLabel`, `termsRequired`
- `loginContextTitle`, `loginContextText`, `loginContextCta`
- `pendingCopyExtended`, `rejectedCopyExtended`
- `budgetReviewTitle`, `budgetReviewDescription`, `budgetReviewDisclaimer`
- `reviewClientBudget`
- `howToUseTitle`, `howToUse` (array)
- `noCeeOfficial`, `betaBadge`, `accessApproved`
- `providerCtaTitle`, `providerCtaText`, `providerCtaLink`

---

## Tests

- `tests/professional-role-contract.test.ts` — 23 tests covering:
  - Role separation (no CEE promise, beta mention, provider difference)
  - i18n completeness for ES, EN, DE
  - Status states contract
  - Budget Review professional contract
- `tests/professional-access.test.ts` — unchanged, 5 tests passing
- `tests/professional-leads.test.ts` — unchanged, 11 tests passing

---

## Constraints respected

- No migration needed (existing `ProfessionalAccessRequest` fields reused).
- No automatic conversion of professional to provider.
- No official EPC claims introduced.
- No hardcoded copy without i18n.
- No billing charged (plans shown as beta/informative).
- Existing residential and provider flows not modified.
