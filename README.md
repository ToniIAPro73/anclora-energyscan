<!-- markdownlint-disable MD001 MD013 MD033 MD041 MD060 -->

<div align="center">

<img src="./public/brand/anclora-energyscan.png" alt="Anclora EnergyScan" width="132" />

# Anclora EnergyScan

### Prediagnóstico energético orientativo para viviendas

Wizard residencial guiado que calcula un score energético trazable, con escenarios de mejora, integración catastral e informes Premium.

**Español** · [Català](./README.ca.md) · [English](./README.en.md) · [Deutsch](./README.de.md) · [Français](./README.fr.md) · [Italiano](./README.it.md) · [Português](./README.pt.md)

<br />

![Anclora](https://img.shields.io/badge/Anclora-ecosystem-111827)
![Categoría](https://img.shields.io/badge/categoría-Premium-C07860)
![Idiomas](https://img.shields.io/badge/idiomas%20producto-7-047857)

</div>

---

> [!IMPORTANT]
> Repositorio interno del ecosistema Anclora. EnergyScan no genera un Certificado de Eficiencia Energética oficial ni documentación con validez administrativa — es un prediagnóstico orientativo. No publicar detalles operativos, credenciales ni lógica sensible fuera de canales autorizados.

## Qué es

Anclora EnergyScan guía al usuario por un wizard sobre envolvente, sistemas, renovables, clima y tipología de la vivienda, y calcula un score energético explicable con nivel de confianza. A partir del diagnóstico genera escenarios de mejora comparables y un informe desbloqueable en modalidad Premium.

## Categoría en el ecosistema

| Campo | Valor |
|---|---|
| Categoría | Premium |
| Acento de marca | `#00DC82` |
| Tipografía | DM Sans |
| Repositorio canónico | `anclora-energyscan` |

## Funcionalidades principales

- Wizard residencial guiado (envolvente, sistemas, renovables, clima, tipología)
- Scoring energético trazable con nivel de confianza
- Escenarios de mejora y ahorro orientativo
- Integración catastral y visualización de parcela (MapLibre)
- OCR sobre documentación aportada (Tesseract)
- Asistencia de IA generativa (Anthropic Claude)
- Informes en PDF, desbloqueo Premium vía Stripe
- Red de proveedores, partners y leads

## Stack tecnológico

| Área | Tecnología |
|---|---|
| Framework | Next.js, React |
| Base de datos | Prisma, PostgreSQL |
| Autenticación | NextAuth |
| IA generativa | Anthropic Claude SDK |
| Mapas catastrales | MapLibre GL |
| OCR | Tesseract.js |
| PDF | react-pdf, pdf-lib, pdfjs-dist |
| Pagos | Stripe |
| Almacenamiento | Vercel Blob |

## Arranque local

```bash
npm install
npm run dev
```

## Idiomas soportados

El producto en producción soporta 7 idiomas: Español (predeterminado), Català, English, Deutsch, Français, Italiano, Português (`PREMIUM_LOCALES`, `src/lib/anclora-language-toggle.ts`). Esta documentación se mantiene en los 7 idiomas del producto.

## Documentación y gobernanza

- Contratos de marca y gobernanza: [`docs/standards/`](./docs/standards/)
- Bóveda Anclora (fuente de verdad): `contracts/` y `docs/governance/`

---

<div align="center">

### Anclora Group

Uso interno.

</div>
