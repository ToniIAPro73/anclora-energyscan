# QA Report — Provider role clarity

Date: 2026-05-21  
Branch: feat/provider-role-clarity

## 1. Problem

The provider section lacked clarity: `/proveedores` was a minimal 3-card page, the register form used raw comma-separated codes, the dashboard didn't handle SUSPENDED status, billing had no fallback for unconfigured Stripe, and leads showed no unlock hint or post-unlock data-use notice.

## 2. Provider contract (final)

Provider = company or self-employed offering energy improvement services that wants to receive consented commercial leads.

Separate from: residential (personal home analysis), professional (client cases/reports), admin (internal management).

## 3. Profile separation

| Profile | Role | Key difference |
|---|---|---|
| Residential | Homeowner analysing own property | No lead management |
| Professional | Prepares cases/reports for clients | No commercial leads |
| Provider | Receives commercial leads from users who requested contact | No case management |
| Admin | Anclora team | Manages all |

## 4. Provider statuses

PENDING → VERIFIED / PREFERRED / EXCLUSIVE / SUSPENDED (no REJECTED status — admin simply keeps at PENDING or suspends).

## 5. Available now vs coming soon

See spec-v1.md.

## 6. Changes — `/proveedores`

**Before:** 3 generic info cards + single CTA.  
**After:** hero with status badge, 6 for-whom cards (with emoji icons), 7-step how-it-works, available now / coming soon grid, credits + consent cards, not-guaranteed notice, professional difference section. CTA adapts to provider status (approved → dashboard, else → register).

## 7. Changes — `/provider/register`

**Before:** raw text input for comma-separated category codes, no terms.  
**After:** pill-based category selector with human-readable labels (ES/EN/DE), consent terms checkbox, form validates both, email pre-filled from session.

## 8. Changes — `/provider/dashboard`

**Before:** single no-account gate, no SUSPENDED handling, `getProviderStatusLabel` helper (removed dependency).  
**After:** distinct states: no session (→ login/register), no provider (→ register), pending notice, suspended notice (red), approved dashboard with full KPIs. Quick actions only shown for approved status.

## 9. Changes — `/provider/leads`

No page-level changes. `ProviderLeadActions` updated:
- Added unlock hint microcopy ("Usarás 1 crédito...") shown when credits > 0 and contact not yet unlocked.
- Added contact-use notice after unlock ("Usa estos datos únicamente...").

## 10. Changes — `/provider/billing`

**Before:** no Stripe fallback, no pack includes/not-includes.  
**After:** Stripe not configured → shows amber warning instead of broken checkout button. Pack section shows includes/not-includes lists.

## 11. Admin proveedores

No changes needed. Admin routes already support PENDING/VERIFIED/PREFERRED/SUSPENDED/EXCLUSIVE. Email sent on first verification transition. Admin panel functional.

## 12. Pricing / navigation

No changes to navigation. `/proveedores` link already exists in Navbar. Provider section remains distinct from residential/professional pricing.

## 13. API / security / consent

No changes to API logic — already correct:
- Leads API hides contact data based on `contactUnlockedAt`.
- Unlock is idempotent (already unlocked → `consumed: false`, no credit deducted).
- No credits → 402 error.
- Provider can only see their own leads (by `providerId`).
- Status changes scoped to provider's own leads.
- Stripe metadata uses `productType: 'provider_lead_pack'`.

## 14. i18n

~80 new keys added to ES (base), with full translations in EN and DE. No raw Spanish visible in EN/DE pages (new keys inherited via spread).

## 15. Manual update

Section 9 of `docs/manual/manual-usuario.md` fully rewritten:
- Added provider definition section.
- Added available now / coming soon / not promised.
- Updated register instructions (categories are now pills, not codes).
- Added provider status table.
- Added consent and withdrawal section.
- Added pack includes/not-includes.
- Added data-use notice.

## 16. Tests

Existing tests not broken (build + tsc pass). Provider-role-contract test file creation deferred — API/unit tests require test setup with Prisma mocks which is out of scope for this UI clarity pass.

## 17. Commands

```bash
npx tsc --noEmit  # clean
npm run build     # clean — all pages including new provider pages compile and render
```

## 18. Limitations pending

- Provider lead matching is by `providerId` assignment (admin assigns leads to specific providers). There is no automatic category/zone matching yet — this is in "coming soon".
- `getProviderStatusLabel` helper was referenced in old dashboard; replaced with direct i18n lookup.
- EN/DE manual files not updated in this pass (out of scope for this PR; tracked as follow-up).
- PDF manual not regenerated in this pass (no visual screenshots changed).
- Tests for provider role contract deferred.

## 19. Legal / commercial risks

- No lead volume, close, or exclusivity guarantees appear anywhere in new copy.
- Data-use notice shown after unlock.
- Consent status visible per lead.
- Stripe not configured → UI shows warning, does not simulate checkout.
