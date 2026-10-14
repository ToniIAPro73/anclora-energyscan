# Checklist de validación — claims regulatorios de la landing (2026-10-14)

> Este fichero se sobrescribe en cada entrega. El historial queda en Git.

**Repositorio:** `anclora-energyscan`
**Rama y commit:** `development` @ `8c38cf1f2bd37f1c6a075eff54660f6ad297fb3b` (SHA de código validado)
**Entorno de validación:** runtime local `http://localhost:3000`, variables del entorno development cargadas por `vc env run`
**Datos:** ficticios. Cuenta persistente QA: `qa-es01`; no se crearon valoraciones ni adjuntos.

## 1. Qué cambia

- C-01/C-02: la timeline ES/EN/DE expresa metas europeas de consumo medio para 2030–2035, con el ámbito del parque residencial y sin obligación para una vivienda concreta.
- C-03: la estadística de landing muestra `Horizonte europeo` / `European horizon` / `Europäischer Horizont` y `2030–2035`.
- Se añadió una regresión automatizada para impedir que landing o i18n vuelvan a combinar clase E y 2033 como obligación.
- Solo se actualizaron las superficies de C-01–C-03. C-04–C-08, el PDF, SEO y `src/lib/regulatory.ts` no cambiaron.

## 2. Ya comprobado por el agente

| Comprobación | Comando o método | Resultado | SHA |
| --- | --- | --- | --- |
| Fuente Directiva, art. 9 | `rg -n '2030|2035|2024/1275' docs/energyscan-sources.md`; revisión de SRC-01 | PASS; recoge objetivos residenciales 2030 y 2035; fuente consultada 2026-10-12 | `8c38cf1f2bd37f1c6a075eff54660f6ad297fb3b` |
| Test focal de claim | `npx jest --runInBand tests/landing-regulatory-claims.test.ts` | PASS; 1 suite / 1 test | `8c38cf1f2bd37f1c6a075eff54660f6ad297fb3b` |
| Lint | `npm run lint` | PASS | `8c38cf1f2bd37f1c6a075eff54660f6ad297fb3b` |
| Typecheck | `npx tsc --noEmit` | PASS | `8c38cf1f2bd37f1c6a075eff54660f6ad297fb3b` |
| Suite completa | `npm test -- --runInBand` | PASS; 80 suites / 531 tests | `8c38cf1f2bd37f1c6a075eff54660f6ad297fb3b` |
| Build | `npm run build` | PASS | `8c38cf1f2bd37f1c6a075eff54660f6ad297fb3b` |
| Visual QA ES/EN/DE escritorio y móvil | `docs/qa/visual-qa-runbook.md`; agent-browser, identidad `qa-es01`, 1440×900 y 390×844 | PASS; copy, estado, estadística y ausencia del claim anterior comprobados en las tres lenguas. Capturas sintéticas revisadas bajo `/tmp` y retiradas según runbook | `8c38cf1f2bd37f1c6a075eff54660f6ad297fb3b` |
| Diff de documentación | `git diff --check` | PASS; ejecutado después de editar `docs/` y `specs/` | `8c38cf1f2bd37f1c6a075eff54660f6ad297fb3b` |

## 3. Pruebas no ejecutadas (NOT_RUN)

| Prueba | Motivo concreto |
| --- | --- |
| Validación manual de producto por Toni | Pendiente de esta entrega; la aceptación corresponde a Toni |
| QA visual en Preview desplegado | No necesario para esta comprobación local de landing; el runbook permite el runtime local |

## 4. Checklist para validar en la aplicación

Landing pública: revisar sin autenticación o con la identidad QA persistente `qa-es01`; no usar una cuenta personal. En cada idioma, comprobar escritorio y móvil.

| # | Dónde | Pasos | Resultado esperado | Cuenta o configuración | Bloqueante |
| --- | --- | --- | --- | --- | --- |
| 1 | Landing ES — escritorio | Abrir `/`, elegir Español en Preferencias globales y revisar timeline y estadística a 1440×900 | Título `Metas europeas de consumo medio`; `2030–2035`; descripción ES acordada; estado `Regulación`; estadística `Horizonte europeo` / `2030–2035`; sin obligación individual clase E/2033 | Landing pública; datos ficticios | Sí |
| 2 | Landing ES — móvil | Repetir a 390×844 y desplazarse hasta la entrada regulatoria | Mismo contenido legible, sin recortes ni superposiciones que impidan leer la aclaración | Landing pública; datos ficticios | Sí |
| 3 | Landing EN — escritorio | Elegir English y revisar timeline y estadística a 1440×900 | Título `EU average-consumption targets`; año `2030–2035`; traducción acordada; estado `Regulation`; `European horizon`; sin claim anterior | Landing pública; datos ficticios | Sí |
| 4 | Landing EN — móvil | Repetir a 390×844 y revisar toda la entrada regulatoria | Copy completo legible, sin recorte ni superposición | Landing pública; datos ficticios | Sí |
| 5 | Landing DE — escritorio | Elegir Deutsch y revisar timeline y estadística a 1440×900 | Título `EU-Ziele für den durchschnittlichen Verbrauch`; año `2030–2035`; traducción acordada; estado `Regulierung`; `Europäischer Horizont`; sin claim anterior | Landing pública; datos ficticios | Sí |
| 6 | Landing DE — móvil | Repetir a 390×844 y revisar toda la entrada regulatoria | Copy completo legible, sin recorte ni superposición | Landing pública; datos ficticios | Sí |

### Casos negativos y de borde

| # | Caso | Resultado esperado |
| --- | --- | --- |
| 1 | Buscar en timeline y estadística la combinación clase E + 2033 como obligación | No aparece en ES, EN ni DE |
| 2 | Revisar la aclaración sobre una vivienda concreta | La traducción deja claro que la Directiva no establece una obligación para una vivienda específica |
| 3 | Cambiar entre escritorio y móvil y entre los tres idiomas | Se conserva el texto y la estadística `2030–2035`; no se corta el copy |

### Estados de interfaz afectados

- [x] Vacío · [ ] Cargando · [ ] Error · [x] Éxito · [x] Móvil · [x] Escritorio · [x] Modo oscuro

## 5. Riesgos y limitaciones

- La cita vigente en `docs/energyscan-sources.md` es SRC-01, Directiva (UE) 2024/1275, art. 9(1)–(2), consultada el 2026-10-12. No se revisaron claims fuera de C-01–C-03.
- La evidencia visual temporal se eliminó tras revisarla siguiendo el runbook; no se guardan capturas con datos de usuario en el repositorio.
- C-04–C-08 siguen pendientes en el inventario y no forman parte de este cambio.

## 6. Decisión de Toni

- [ ] Todos los puntos bloqueantes pasan
- [ ] Se promociona: escribir `PROMOTE=FULL` (staging → production → main)
- [x] No se promociona en esta entrega. Motivo: la promoción requiere una orden posterior de Toni.
