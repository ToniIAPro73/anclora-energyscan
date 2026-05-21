# Feature spec: Provider role clarity — v1

## Purpose

Clarify the provider profile across the entire UI and manual. Separate provider from residential and professional. Establish the functional contract, consent model, credit mechanics, and what is/isn't promised.

## Provider definition

A **provider** in Anclora EnergyScan is a company, self-employed professional or technical/commercial team that offers services related to energy improvement, renovation, installations or certification, and wants to receive consented commercial opportunities from EnergyScan analyses.

Examples: window companies, insulation specialists, HVAC/heat pump installers, solar PV installers, energy certifiers, technical firms, integral renovation companies.

## Profile separation

| Profile | For whom | Core capability | Not promised |
|---|---|---|---|
| Residential | Owner, buyer, seller, tenant | Home analysis, Premium PDF, Budget Review | Not an official EPC |
| Professional | Certifier, technical architect, energy adviser, real estate | Client cases, reports, prediagnoses | Not official EPC software |
| Provider | Installer, technical firm, renovation company | Receive consented leads, credit-based contact unlock | No lead volume, close or exclusivity guarantee |
| Admin | Anclora team | Review requests, approve/reject, link users | N/A |

## Provider access states

| Status | Meaning | Can see leads | Can unlock |
|---|---|---|---|
| No provider | Not registered | No | No |
| PENDING | Under review | No | No |
| VERIFIED | Approved | Yes | Yes |
| PREFERRED | Elevated trust | Yes | Yes |
| EXCLUSIVE | Exclusive access | Yes | Yes |
| SUSPENDED | Temporarily limited | No | No |

Note: there is no REJECTED status for providers. Admin can change between PENDING/VERIFIED/PREFERRED/EXCLUSIVE/SUSPENDED.

## Credit mechanics

- 1 credit = unlock the authorized contact data of one consented lead.
- Unlock is **idempotent**: same lead unlocked twice by same provider does not consume a second credit.
- No credits → cannot unlock (API returns 402).
- Consent withdrawn → cannot unlock (lead status reflects withdrawal).
- Pack: 10 credits for €300 via Stripe (`STRIPE_PRICE_PROVIDER_LEAD_PACK` env var).
- Fallback: if env var not set, Stripe checkout uses `price_data` with `NEXT_PUBLIC_PROVIDER_LEAD_PACK_PRICE_EUR` (default 300).
- All credit operations ledgered in `ProviderLeadCreditLedger`.

## Data visibility before/after unlock

| Field | Before unlock | After unlock |
|---|---|---|
| Property type | Visible | Visible |
| Estimated letter | Visible | Visible |
| Zone / postcode | Visible | Visible |
| Requested service | Visible | Visible |
| Urgency | Visible | Visible |
| Name | Hidden | Shown if available |
| Email | Hidden | Shown if available |
| Phone | Hidden | Shown if available |

## Consent rules

- Personal contact data only shown after: (1) user requested contact + (2) provider unlocked with credit.
- EnergyScan does not sell generic databases or allow contact without consent.
- If consent withdrawn, lead shows as withdrawn and cannot be unlocked.

## Not guaranteed

- Minimum lead volume.
- Commercial win or contract closure.
- Territorial exclusivity.
- Technical qualification or certification of each provider as official.
- Data without consent.

## MVP scope (available now)

- Provider registration and Anclora review.
- Protected provider dashboard with KPIs and status.
- View compatible opportunities (by providerId assignment).
- Credit system for unlocking leads (idempotent).
- Credit pack via Stripe.
- Basic lead status management (PENDING/CONTACTED/QUOTED/WON/LOST/CANCELLED).
- Contact data protected until unlock.
- User consent before handoff.
- Auto-link: if provider was registered with same email as user account, link on first dashboard visit.
- Admin can approve/reject provider via `/admin/providers`.
- Email sent on first verification transition.

## Coming soon

- Advanced matching by scoring and availability.
- Full public provider profile.
- Automatic new-lead notifications.
- More granular segmentation by area and category.
- Advanced billing and detailed history.
- Deep Synergi integration.

## Key APIs

| Route | Purpose |
|---|---|
| POST `/api/provider/register` | Register provider (anonymous or linked) |
| GET `/api/provider/me` | Get current provider for logged-in user |
| GET `/api/provider/leads` | Get leads for provider (contact hidden if not unlocked) |
| POST `/api/provider/leads/[id]/unlock` | Unlock contact (idempotent, costs 1 credit) |
| POST `/api/provider/leads/[id]/status` | Update lead status |
| POST `/api/provider/credits/checkout` | Start Stripe checkout for credit pack |
| GET `/api/provider/credits/status` | Get current credit balance |
| PATCH `/api/admin/providers/[id]/status` | Admin: change provider status |
| POST `/api/admin/providers/[id]/link-user` | Admin: link provider to user by email |

## Stripe metadata for provider checkout

```ts
{
  productType: 'provider_lead_pack',
  providerId: string,
  credits: string,
  userId: string,
  amountCents: string,
  currency: 'eur',
}
```

## i18n

All new copy added to `src/lib/monetization/i18n.ts` under `provider` key in ES/EN/DE. New keys: `howItWorksTitle`, `howItWorksSteps`, `forWhomTitle`, `forWhomCards`, `forWhomCardCopy`, `consentTitle`, `consentText`, `creditsTitle`, `creditsText`, `notGuaranteedTitle`, `notGuaranteedText`, `professionalDiffTitle`, `professionalDiffText`, `availableNowTitle`, `availableNow`, `comingSoonTitle`, `comingSoon`, `registerIntro`, `categoryOptions`, `categoriesLabel`, `zonesLabel`, `descriptionLabel`, `termsProviderLabel`, `termsRequired`, `dashboardDescription`, `noProviderTitle`, `noProviderText`, `suspendedTitle`, `suspendedText`, `unlockHint`, `contactUseNotice`, `stripeNotConfigured`, `packIncludes`, `packNotIncludes`, `providerStatusLabel`.

## Files changed

- `src/lib/monetization/i18n.ts` — new provider copy keys (ES/EN/DE)
- `src/app/proveedores/page.tsx` — full landing rewrite
- `src/app/provider/register/page.tsx` — category pills, terms checkbox, better copy
- `src/app/provider/dashboard/page.tsx` — state handling for SUSPENDED + no-provider
- `src/app/provider/billing/page.tsx` — pack includes/not includes, Stripe fallback notice
- `src/components/ProviderLeadActions.tsx` — unlock hint + contact use notice
- `docs/manual/manual-usuario.md` — section 9 provider area full rewrite
- `sdd/features/provider-role-clarity/` — this spec and execution report

## Constraints respected

- No new Prisma migrations.
- No changes to API schemas.
- No changes to lead validation or consent logic (already correct).
- No hardcoded copy outside i18n.
- No promise of lead volume, close or exclusivity in UI copy.
- Stripe not configured → billing shows warning, not broken button.
- Provider does not auto-activate professional.
- Professional does not auto-activate provider.
