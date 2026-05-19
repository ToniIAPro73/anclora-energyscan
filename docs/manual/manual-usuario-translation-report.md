# Translation Report — Anclora EnergyScan User Manual

**Date:** 19 May 2026  
**Version:** 1.2  
**Branch:** `docs/translate-user-manual-en-de`

---

## 1. Source used

| Item | Value |
| --- | --- |
| Source file | `docs/manual/manual-usuario.md` (Markdown, 782 lines) |
| Source language | Spanish (ES) |
| Source version | 1.2 — 19 May 2026 |
| Format | Markdown with custom HTML cover and section breaks |
| PDF as backup | `docs/manual/manual-usuario.pdf` — not needed; Markdown was complete and up to date |

---

## 2. Files created

| File | Language | Description |
| --- | --- | --- |
| `docs/manual/manual-usuario.en.md` | English (EN) | Full user manual, professionally translated and curated |
| `docs/manual/manual-usuario.de.md` | German (DE) | Full user manual, professionally translated and curated |
| `docs/manual/manual-usuario.translation-glossary.md` | Trilingual | Operative glossary ES/EN/DE with UI terms, legal disclaimers and DE-specific notes |
| `docs/manual/manual-usuario-translation-report.md` | — | This report |

---

## 3. Files not modified

| File | Reason |
| --- | --- |
| `docs/manual/manual-usuario.md` | Source file — untouched per instructions |
| `public/locales/en/common.json` | Existing i18n — consulted as reference, not modified |
| `public/locales/de/common.json` | Existing i18n — consulted as reference, not modified |
| All other product files | No product code was touched |

---

## 4. Hermes Copy Curator as editorial reference

The editorial criteria from Hermes Copy Curator were applied as follows:

**Gate applied:** All user-facing copy in both translated manuals was reviewed against Hermes Copy Curator rules (sourced from `.antigravity/rules/hermes-copy-curator-gate.md`):
- No exaggerated commercial language (e.g. "amazing", "revolutionary", "guaranteed").
- Legal tone: every limitation in the Spanish source is preserved verbatim in spirit.
- Measured AI language: expressions like "it appears", "could correspond to", "seems to feature" (EN) and "es lässt sich erkennen", "könnte entsprechen", "scheint aus … zu bestehen" (DE) were used for AI visual analysis descriptions — never conclusive statements.
- No new features, pricing changes or commercial promises were introduced.

**Localization Contract reviewed:** `docs/standards/LOCALIZATION_CONTRACT.md` from `anclora-content-generator-ai`. `anclora-energyscan` targets ES/EN/DE — this translation covers the required language scope.

---

## 5. Key terminology decisions

| Decision | Rationale |
| --- | --- |
| "assessment" (EN) / "Analyse" (DE) for "análisis" | Aligned with `common.json` keys (`start`, `startFree`) |
| "home" vs "property" vs "dwelling" | "home" for residential context; "property" for legal/formal; "dwelling" avoided as overly formal for this tone |
| "My EnergyScan dashboard" (EN) / "Mein EnergyScan-Bereich" (DE) | Aligned with `dashboard.connected.title` in `common.json` |
| "second opinion on a renovation quote" (EN) | Full phrasing preferred in manual headings; `budgetReview.title` = "Renovation quote second opinion" uses inverted word order. Both are consistent with the same concept |
| "Zweitmeinung zu einem Sanierungsangebot" (DE) | Slightly fuller than `budgetReview.title` = "Zweite Meinung zum Sanierungsangebot" in i18n. Manual uses compound noun form; see discrepancy note in section 9 |
| "Rechtlicher Hinweis" (DE) for section 13 | Preferred over "Impressum" (which has a specific German legal meaning) for the broader legal notice section. `legal` key in i18n = "Impressum" — noted in discrepancy section |
| "qualified professional" / "qualifizierte Fachkraft" | Used consistently across all disclaimer contexts; aligned with `legalDisclaimer` key |
| "indicative" (EN) | Used for all "orientativo/orientativa" occurrences; aligned with `legalDisclaimer` and `seo.disclaimer` keys |
| "orientierende" (DE) | Standard choice for "indicative" in formal German; avoids "ungefähre" (too informal) or "grobe" (negative connotation) |
| "Energieausweis" (DE) | Correct term for EPC in German; not "Energiezertifikat" or "Energieeffizienzausweis" |

---

## 6. Non-literal adaptations

| Original (ES) | EN adaptation | DE adaptation | Reason |
| --- | --- | --- | --- |
| "Índice" | "Table of contents" | "Inhaltsverzeichnis" | Standard document conventions differ by language |
| "presupuesto de reforma" | "renovation quote" | "Sanierungsangebot" | "quote" is more natural than "budget" for a contractor estimate in EN; "Angebot" is natural German |
| "aparejador" | "quantity surveyor" | "Bausachverständiger" | Professional equivalent in EN/DE; the role is not identical but is the closest functional equivalent |
| "ayudas/subsidios" | "grants / subsidies" | "Förderungen / Zuschüsse" | Splitting into two terms is more natural and covers both concepts |
| "zona climática" | "climate zone" | "Klimazone" | Direct equivalent |
| "Mercado de proveedores" | "Provider marketplace" | "Anbieter-Marktplatz" | Compound noun required in DE |
| "expediente" | "file" / "case" | "Akte" / "Fall" | Context-dependent; professional area uses "file" consistently |
| "Pasos:" (numbered steps) | "Steps:" | "Schritte:" | Direct equivalent |
| Footer: "Manual de usuario v1.2 — 19 mayo 2026" | "User Manual v1.2 — 19 May 2026" | "Benutzerhandbuch v1.2 — 19. Mai 2026" | Date format adapted to locale conventions (German: "19. Mai 2026") |

---

## 7. QA EN — Result: PASS

All 10 criteria verified:

| # | Criterion | Result |
| --- | --- | --- |
| 1 | Reads as a user manual, not a commercial landing page | PASS |
| 2 | All legal limits maintained | PASS — cover disclaimer, section 1, sections 6.4, 7.4, 13 |
| 3 | Technical terms are consistent | PASS — glossary applied throughout |
| 4 | Tables make sense | PASS — all 20+ tables translated faithfully |
| 5 | UI buttons match EN i18n where available | PASS — "Download PDF", "Unlock Premium", "Start assessment", "Back to dashboard" aligned |
| 6 | Routes remain untranslated | PASS — `/dashboard`, `/pricing`, `/wizard` preserved |
| 7 | No invented features | PASS |
| 8 | No changed prices or statuses | PASS — €9.90/€14.90 not present in manual body; PENDING/VERIFIED/PREFERRED/SUSPENDED preserved |
| 9 | AI visual analysis described as indicative | PASS — "indicative way", "it appears", "could correspond to", "seems to feature" |
| 10 | Providers not presented as guaranteed | PASS — explicitly stated in FAQ and section 13 |

---

## 8. QA DE — Result: PASS WITH NOTES

All 10 criteria verified:

| # | Criterion | Result |
| --- | --- | --- |
| 1 | Sounds natural in German | PASS — reviewed for compound noun naturalness and sentence length |
| 2 | No artificial literal translations | PASS — "scheint aus ... zu bestehen" preferred over "scheint zu bestehen aus" |
| 3 | All legal limits maintained | PASS — cover disclaimer, section 1, sections 6.4, 7.4, 13 |
| 4 | "Energieausweis" used correctly | PASS — consistent throughout |
| 5 | No German-specific legal norms introduced | PASS — no BEG, GEG, EnEV or similar references added |
| 6 | Tables are understandable | PASS |
| 7 | UI buttons match DE i18n where available | PASS — "PDF herunterladen", "Premium freischalten", "Analyse starten", "Kontakt freischalten" aligned |
| 8 | Routes remain untranslated | PASS — `/dashboard` preserved |
| 9 | AI visual analysis described as indicative | PASS — "orientierende Weise", "es lässt sich erkennen", "könnte entsprechen", "scheint aus … zu bestehen" |
| 10 | Providers not presented as guaranteed | PASS — stated explicitly in FAQ and section 13 |

**Notes:**
- `garantiert` appears 6 times in the DE manual — all in legally correct negating contexts ("garantiert keine Einsparungen…", "nicht garantiert"). None are commercial promises. PASS.
- Sentence length: two paragraphs in section 9.5 (contact unlocking) were kept as structured lists rather than long prose to avoid unwieldy German compound sentences.

---

## 9. i18n consistency with `common.json`

### Aligned terms (EN and DE manuals match product i18n)

| Key | EN manual | DE manual | common.json EN | common.json DE |
| --- | --- | --- | --- | --- |
| `start` | "Start assessment" | "Analyse starten" | "Start assessment" | "Analyse starten" |
| `downloadPdf` | "Download PDF" | "PDF herunterladen" | "Download PDF" | "PDF herunterladen" |
| `checkout.button` | "Unlock Premium" | "Premium freischalten" | "Unlock Premium report — €9.90" | "Premium-Bericht freischalten — 9,90 €" |
| `dashboard.connected.title` | "My EnergyScan dashboard" | "Mein EnergyScan-Bereich" | "My EnergyScan dashboard" | "Mein EnergyScan-Bereich" |
| `provider.leads.unlockContact` | "Unlock contact" | "Kontakt freischalten" | "Unlock contact" | "Kontakt freischalten" |
| `legalDisclaimer` | "indicative pre-assessment", "qualified technician" | "orientierende Voreinschätzung", "qualifizierte Fachleute" | (same) | (same) |
| `paywall.featureSubsidies` | "grants" | "Förderungen" | "Applicable grants" | "Anwendbare Förderungen" |
| `budgetReview.title` | "second opinion on a renovation quote" | "Zweitmeinung zu einem Sanierungsangebot" | "Renovation quote second opinion" | "Zweite Meinung zum Sanierungsangebot" |

### Discrepancies noted

| Term | Manual (EN/DE) | i18n `common.json` | Recommendation |
| --- | --- | --- | --- |
| Budget Review section heading | "Second opinion on a renovation quote" / "Zweitmeinung zu einem Sanierungsangebot" | "Renovation quote second opinion" / "Zweite Meinung zum Sanierungsangebot" | Manual uses fuller, more natural phrasing. i18n version is shorter for UI. Both are correct for their context. No change needed. |
| Legal section (DE) | "Rechtlicher Hinweis" | `legal` key = "Impressum" | "Impressum" in the i18n is appropriate for the footer link. "Rechtlicher Hinweis" is appropriate for the manual section title, which has broader scope. No conflict. |
| "assessment" vs "Analyse" in section headings | "Pre-assessment wizard", "assessment history" | `start` = "Start assessment" / "Analyse starten" | The manual uses "assessment" (EN) and "Analyse" (DE) consistently with i18n keys. |

**Conclusion:** No changes to product i18n files are required. The manual and UI translations are compatible; slight phrasing differences between the two are expected and contextually appropriate.

---

## 10. PDF pipeline

**Status:** Pipeline exists but not used for translated manuals.

The script `scripts/generate-manual-pdf.mjs` generates the PDF from `docs/manual/manual-usuario.md` with hardcoded input/output paths. It requires Chrome/Chromium and poppler tools (`pdfinfo`, `pdftotext`).

**To generate PDFs for EN and DE in the future:**

Option A — Duplicate the script:
```bash
cp scripts/generate-manual-pdf.mjs scripts/generate-manual-pdf-en.mjs
# Edit inputPath → manual-usuario.en.md
# Edit outputPath → manual-usuario.en.pdf
# Edit lang attribute → lang="en"
# Edit toc kicker text
node scripts/generate-manual-pdf-en.mjs
```

Option B — Parameterise the existing script:
```bash
node scripts/generate-manual-pdf.mjs --lang en
```
This would require adding CLI argument parsing to the script.

**Target output paths (when generated):**
```
docs/manual/manual-usuario.en.pdf
docs/manual/manual-usuario.de.pdf
```
Or optionally:
```
public/manuals/anclora-energyscan-user-manual-en.pdf
public/manuals/anclora-energyscan-benutzerhandbuch-de.pdf
```

No new dependencies are required. Chrome and poppler are already needed by the existing script.

---

## 11. Limitations

- **PDF not generated:** The EN and DE PDFs were not generated in this task. The Markdown files are complete and ready for PDF rendering once the script is adapted.
- **Screenshot filenames:** All screenshot file references remain in their original form (`screenshots/auth-dark.png` etc.) as these are file paths, not user-facing text. The images themselves are not language-specific.
- **Pricing values:** Pricing (€9.90 / €14.90) does not appear in the manual body text, only in UI strings managed by `common.json`. No action needed.
- **Provider status codes (PENDING, VERIFIED, etc.):** Preserved as-is per instructions.
- **"Kicker" text in PDF ToC:** The `generate-manual-pdf.mjs` script has a hardcoded kicker "Manual de Usuario" in the ToC page. This would need updating in an adapted EN/DE script.

---

## 12. Recommendations

1. **Generate PDFs:** Adapt `generate-manual-pdf.mjs` to accept a `--lang` parameter and generate EN/DE PDFs. Estimated effort: 30–60 minutes.
2. **Update kicker text in PDF script:** Replace the hardcoded "Manual de Usuario" with a language-aware variable.
3. **Add `lang` attribute to PDF HTML:** The current script outputs `<html lang="es">`. Adapt to "en" or "de" for EN/DE PDFs.
4. **Review i18n for `Zweitmeinung`:** Consider aligning the DE `budgetReview.title` key from "Zweite Meinung zum Sanierungsangebot" to "Zweitmeinung zu einem Sanierungsangebot" for naturalness, if the UI has enough space.
5. **Future reviews:** Any changes to `manual-usuario.md` (ES) should be propagated to EN and DE versions. Consider adding a note to the PR template or CLAUDE.md.

---

## 13. Confirmation: Hermes repo not modified

```
Repo: /home/toni/projects/anclora-content-generator-ai
git status: clean (## main...origin/main — no changes)
```

The `anclora-content-generator-ai` repository was read in read-only mode only. Files consulted:
- `.antigravity/rules/hermes-copy-curator-gate.md` — editorial gate rules
- `docs/standards/LOCALIZATION_CONTRACT.md` — localization scope and rules

No files in `anclora-content-generator-ai` were created, modified or deleted.

---

## Checklist confirmation

```
[x] Exists docs/manual/manual-usuario.en.md
[x] Exists docs/manual/manual-usuario.de.md
[x] Exists docs/manual/manual-usuario.translation-glossary.md
[x] Exists docs/manual/manual-usuario-translation-report.md
[x] Structure matches ES manual (all 13 sections)
[x] Table of contents translated in both languages
[x] All tables translated
[x] Image captions translated
[x] Legal disclaimers present (cover, section 1, 6.4, 7.4, 13)
[x] No new commercial promises added
[x] No limitations removed
[x] No unjustified language mixing
[x] Glossary applied consistently
[x] QA EN performed — PASS
[x] QA DE performed — PASS WITH NOTES
[x] Consistency with common.json reviewed
[ ] PDFs not generated — see limitations and recommendations
[x] German reviewed for artificial literalism
[x] anclora-content-generator-ai not modified
[x] Commit will only affect anclora-energyscan
```
