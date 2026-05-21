# QA Report: Professional Role Clarity

**Date:** 2026-05-21  
**Branch:** feat/professional-role-clarity

---

## 1. Problem statement

The professional role existed in the codebase but lacked:
- A clear explanation of who it is for.
- Explicit separation from residential and provider roles.
- A defined list of what is available now vs upcoming.
- A proper budget review professional entry point.
- Improved state messaging for pending/rejected/no-session.
- Terms acceptance in the request form.
- Profile type selector in the request form.

---

## 2. Professional role contract (final)

**Profesional:** técnico, certificador, arquitecto técnico, asesor energético, inmobiliaria o equipo que usa EnergyScan para preevaluar viviendas de terceros, preparar conversaciones con clientes y generar informes orientativos antes de una revisión técnica oficial o una decisión comercial.

**Not to be confused with:**
- Residencial: analyses own property.
- Proveedor: receives commercial leads.
- Admin: internal Anclora team.

---

## 3. Role separation

| Perfil | Para quién | Qué puede hacer | Qué no debe prometer |
|---|---|---|---|
| Residencial | Propietario, comprador, vendedor, inquilino | Análisis vivienda propia, PDF Premium, Budget Review | No es CEE oficial |
| Profesional | Certificador, asesor, inmobiliaria | Casos de clientes, prediagnósticos, PDFs, Budget Review | No sustituye software oficial ni firma técnica |
| Proveedor | Instalador, empresa técnica | Leads consentidos, créditos, contacto | No garantía comercial |
| Admin | Anclora | Gestión interna | N/A |

---

## 4. Available now

- Solicitud de acceso profesional beta.
- Panel protegido por aprobación.
- Expedientes = assessments propios del usuario profesional (MVP).
- PDF Premium por expediente.
- Budget Review como segunda opinión orientativa.
- Interés en marketplace (con consentimiento del cliente).
- Interés en white-label (captura, no activación).

## 5. Upcoming

- Alias de cliente / referencia interna.
- PDF con marca profesional.
- Planes por volumen.
- Exportación.
- White-label.

## 6. Out of scope

- CEE oficial.
- Firma técnica.
- CRM completo.
- Billing activo (planes mostrados como informativos/beta).

---

## 7. Changes by area

### `/profesional`
- Hero con badges beta / acceso aprobado.
- 4 cards "para quién es" con iconos.
- 2 bloques: qué puedes hacer ahora / qué no incluye.
- Beta notice con icono de información.
- Bloque "profesional no es proveedor".
- CTA lógico: aprobado → dashboard, logado → solicitar, no sesión → auth con callbackUrl.

### `/profesional/solicitar`
- profileType dropdown (7 opciones).
- useCasePlaceholder y volumePlaceholder.
- Terms checkbox requerido.
- Login context notice para usuarios no autenticados.
- Email pre-rellenado desde sesión si disponible.

### `/profesional/dashboard`
- KPI row: expedientes, PDF desbloqueados, Budget Reviews, badge beta.
- Quick actions: nuevo análisis, revisar presupuesto de cliente, panel residencial.
- Estado pendiente con explicación extendida.
- Estado rechazado con texto prudente + texto extendido.
- Login gate con 2 CTAs: Entrar + Solicitar acceso.
- "Cómo usarlo con clientes" guía paso a paso.
- Sección Budget Review profesional con descripción + disclaimer + CTA.
- Provider CTA block.
- Legal notice.
- Property type normalizado con `getPropertyTypeLabel`.

### i18n
- ~55 nuevas claves añadidas a ES, EN, DE.
- Ninguna clave existente eliminada.

### Manual
- Sección 8 reescrita completamente.
- 8 subsecciones: para quién, qué incluye MVP, solicitar acceso, estados, panel, budget review, planes, FAQ.
- Tabla de perfiles en sección 1 actualizada.

### Tests
- `professional-role-contract.test.ts`: 23 tests — PASS.
- `professional-access.test.ts`: 5 tests — PASS.
- `professional-leads.test.ts`: 11 tests — PASS.
- `monetization-packaging.test.ts`: passing.
- `residential-product-contract.test.ts`: passing.

---

## 8. Commands executed and results

```
npx tsc --noEmit            → 0 errors
npm run lint                → no warnings or errors
npm test -- professional    → 39 tests PASS (23 new + 16 existing)
npm test (full suite)       → 417 tests PASS
npm run build               → successful, 0 errors
```

## 9. Visual / manual QA — Playwright (2026-05-21)

Playwright 1.60.0. Next.js dev server port 3099.

| Caso | Check | Result |
|---|---|---|
| A anon ES | `/profesional` carga bloques "Para quién es", "Qué puedes hacer ahora", "Qué no incluye", beta notice, proveedor diferencia | ✅ |
| A anon ES | CTA primario anón → `/auth?callbackUrl=/profesional/solicitar` | ✅ |
| A anon ES | Mobile 390px — sin scroll horizontal | ✅ |
| B solicitar ES | Login context notice, dropdown profileType (8 opts), useCase, volume, terms checkbox | ✅ |
| B solicitar ES | Submit sin terms → error "Debes aceptar el uso orientativo" | ✅ |
| B solicitar ES | Submit sin email → HTML5 nativo bloquea | ✅ |
| C dashboard | Sin sesión: lock icon + "Inicia sesión" + CTAs Entrar + Solicitar | ✅ |
| G EN landing | "Who it is for", "Energy certifiers...", "What you can do now", no Spanish/German mix | ✅ |
| G EN solicitar | Dropdown EN, login notice EN, terms label EN, error terms EN | ✅ |
| G DE landing | "Für wen ist es gedacht", "Energiezertifizierer", beta notice DE, no Spanish/English mix | ✅ |
| G DE solicitar | Dropdown DE, login notice DE | ✅ |
| H mobile dark | Páginas profesional/solicitar/dashboard cargadas en 390px dark mode | ✅ |

**Nota arquitectura i18n — cliente:** `/profesional/solicitar` es `'use client'` y lee el idioma de `localStorage` (via `AppPreferencesProvider`). Los server components leen de la cookie. Ambos se sincronizan cuando el usuario cambia idioma en settings. Para usuarios reales el comportamiento es coherente. Es la arquitectura existente del sistema de preferencias, no una regresión.

---

## 10. Remaining limitations

- Manual EN/DE not updated (marked as pending; ES is canonical).
- Manual PDF not regenerated (requires `npm run manual:pdf:es` with Puppeteer in environment).
- Plans show EUR prices but no Stripe billing active — marked as beta/orientative in UI and copy.
- Client alias / internal reference not implemented (noted as upcoming).
- Dashboard KPI for "cases with marketplace request" not shown (data requires join on Lead table — deferred to avoid complexity).

---

## 11. Legal and commercial risks

- No official EPC claims introduced. Copy consistently says "orientativo / indicativo / orientierend".
- Plans shown as beta — no payment initiated without explicit Stripe billing implementation.
- White-label is interest-only; no activation logic triggered.
- Professional data scoped to own user (userId filter on assessments).
