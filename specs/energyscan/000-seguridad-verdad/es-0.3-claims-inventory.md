# ES-0.3.a — Inventario de claims, pantallas y locales

**Fecha:** 2026-10-14 · **Base del inventario:** `development@93784e0` · **Actualización C-01–C-03:** `development@8c38cf1f2bd37f1c6a075eff54660f6ad297fb3b` · **Alcance original:** solo lectura del código. Cada hallazgo nombra el requisito F0 que lo cubre (spec.md §5).

## 1. Hallazgos confirmados

Los estados de la última columna reflejan únicamente la etapa de landing C-01–C-03; los hallazgos restantes conservan su estado pendiente.

| ID | Superficie (ruta) | Locale | Texto o regla actual | Problema | Requisito | Corrección propuesta (0.3.b) | Estado |
|---|---|---|---|---|---|---|---|
| C-01 | `src/app/page.tsx` (línea de tiempo de la landing) | ES | «2033 · Clase E · Objetivo residencial obligatorio.» | Afirma una obligación residencial universal de clase E en 2033. Es el hallazgo más grave | F0-R08 | Sustituido por meta media residencial según Directiva (UE) 2024/1275, con ámbito y aclaración de que no obliga a una vivienda concreta | Corregido en `8c38cf1` |
| C-02 | `src/app/page.tsx` (línea de tiempo de la landing) | EN, DE | «Class E / Klasse E · objetivo residencial en desarrollo regulatorio» | Mantiene el titular «2033 Clase E» aunque suaviza la descripción; sigue sugiriendo un umbral individual | F0-R08 | Sustituido por traducciones de la meta media residencial y aclaración de que no obliga a una vivienda concreta | Corregido en `8c38cf1` |
| C-03 | `src/app/page.tsx` + `src/lib/i18n.ts` (`statsTarget`) | ES, EN, DE | Estadística «Objetivo clase E · 2033» | Presenta 2033/clase E como dato de producto | F0-R08 | Etiqueta «Horizonte europeo» traducida y valor «2030–2035» | Corregido en `8c38cf1` |
| C-04 | `src/lib/budget-review/service.ts:17-18, :34` | ES (fijo) | Umbral fijo: precio unitario > 450 → «precio unitario elevado»; < 25 → «bajo»; total > 30.000 → «Presupuesto alto» | Umbrales universales sin unidad (€/m², €/ud., €/kW), categoría ni territorio. Etiqueta «elevado/bajo» sin comparación compatible | F0-R09 | Alerta contextual o abstención: sin referencia comparable no se califica la partida | Pendiente |
| C-05 | `src/lib/budget-review/advanced-analysis.ts:286-287, :368` | ES, EN, DE | Mismos umbrales (`UNIT_PRICE_HIGH_THRESHOLD=450`, `LOW=25`, `isHighTotal` > 30.000) | Duplicado de C-04 con otra ruta | F0-R09 | Unificar la regla y eliminar el umbral universal | Pendiente |
| C-06 | `service.ts:19-26` | ES (fijo) | Mensajes de partida solo en castellano | Un usuario EN/DE/CA/FR/IT/PT ve texto en español | F0-R10 | Pasar a claves i18n | Pendiente |
| C-07 | `advanced-analysis.ts:282-283` | CA, FR, IT, PT | Preguntas sugeridas con respaldo: CA→ES, FR/IT/PT→EN | Cobertura parcial de locales declarada en el código | F0-R10 | Documentar la cobertura o traducir | Pendiente |
| C-08 | `src/lib/i18n.ts:1318` | DE | «…orientierenden Voreinschätzung **puede** EnergyScan helfen…» | Palabra española dentro de un texto alemán | F0-R10 | Corregir la traducción | Pendiente |

## 2. Controles que ya cumplen

| Superficie | Estado |
|---|---|
| `src/lib/i18n.ts:4-10` (aviso legal, 7 locales) | Correcto: «prediagnóstico orientativo», «no sustituye al Certificado oficial», estimaciones |
| `src/lib/regulatory.ts` — entrada `eu-2030-2033-residential` | Correcta: habla de objetivos de consumo medio del parque; el aviso aclara que no define una obligación individual |
| PDF `src/lib/pdf/EnerScanReport.tsx:1307` | Reutiliza el texto correcto en CA/EN/DE/FR/IT/PT |

## 2 bis. Corrección de cobertura de locales

C-01–C-03 se corrigieron primero en ES, EN y DE. Los locales CA, FR, IT y PT mantenían la estadística «Objetivo classe E» y heredaban la línea de tiempo de ES o EN. Corregidos en una segunda entrega (ver `gates.md`).

## 3. Superficies sin inventariar todavía

Se registran como pendientes, no como correctas:

1. Manual PDF (`public/manuals/anclora-energyscan-user-manual-en.pdf`): contiene «2033». Requiere lectura y, si procede, regeneración.
2. Metadatos SEO de `calculadora-ahorro`, `ciudad/[slug]`, `legal`, `privacy`, `terms` y `layout.tsx`.
3. Páginas `pricing`, `proveedores` y `profesional`; plantillas de email.
4. Cadenas de resultado del score y de ahorro (`scoring.ts`, `costs/`): falta revisar si distinguen estimado, declarado y no disponible (F0-R06).

## 4. Orden propuesto para 0.3.b

1. C-01, C-02, C-03: corrección visible en la landing (mayor riesgo y menor esfuerzo).
2. C-04, C-05, C-06: regla de alerta de presupuesto con abstención e i18n.
3. C-07, C-08: cobertura de locales.
4. Tras cerrar los puntos 1-3, inventariar la sección 3.

El texto definitivo de C-01–C-03 requiere fuente y fecha de revisión (`docs/energyscan-sources.md`); Toni decide el copy. La revisión jurídica externa se agenda antes de publicar afirmaciones normativas, no antes de implementarlas.
