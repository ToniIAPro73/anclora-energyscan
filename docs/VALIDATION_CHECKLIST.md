# Checklist de validación — Search Console y bootstrap global (2026-10-28)

**Repositorio:** anclora-energyscan

**Rama y base:** development @ `ba70c0dcc8a2242f6848c796ae39020965b55737` (cambio local sin commit)

**Entorno de validación:** pendiente de publicar en development

**Datos:** no se usaron ni modificaron datos de aplicación.

## 1. Qué cambia
- Se añade al `<head>` global la metaetiqueta de verificación de Google Search Console proporcionada por Toni.
- Se sustituye el enlace absoluto roto `.anclora/global` por documentos versionados que enlazan a las fuentes canónicas compartidas.

## 2. Ya comprobado por el agente
| Comprobación | Comando o método | Resultado | SHA |
| --- | --- | --- | --- |
| Integridad del diff | `git diff --check` | PASS | `ba70c0d` |
| Revisión de fuentes del bootstrap | Lectura de los dos archivos `.anclora/global/` y comprobación de sus destinos | PASS | `ba70c0d` |

## 3. Pruebas no ejecutadas (NOT_RUN)
| Prueba | Motivo concreto |
| --- | --- |
| Suite, lint y build | No ejecutados: la edición es localizada y los cambios globales son Markdown. |
| Verificación en Google Search Console | Requiere que el cambio esté publicado; Toni puede pulsar **Verificar** tras validar y publicar. |
| Revisión visual | La etiqueta no modifica la interfaz. |

## 4. Checklist para Toni
| # | Dónde | Pasos | Resultado esperado | Bloqueante |
| --- | --- | --- | --- | --- |
| 1 | `src/app/layout.tsx` | Confirmar que el valor coincide con el mostrado por Search Console. | Metaetiqueta presente en el `<head>`. | Sí |
| 2 | `.anclora/global/` | Confirmar que están disponibles los documentos de contexto y workflow y que apuntan a fuentes canónicas. | El bootstrap no depende de una ruta absoluta de otra máquina. | Sí |
| 3 | Google Search Console | Tras publicar, pulsar **Verificar** para `https://energyscan.anclora.com/`. | Google confirma la propiedad. | Sí |

## 5. Riesgos y limitaciones
- La verificación solo funcionará cuando la versión que contiene la etiqueta esté publicada en el dominio correspondiente.
- La etiqueta debe permanecer en el `<head>` para mantener la verificación.
- El mapa de arquitectura del Vault contiene directrices de Git antiguas; las fuentes actuales de workflow prevalecen.

## 6. Decisión de Toni
- [ ] Validado en development
- [ ] Se promociona: escribir `PROMOTE=FULL`
- [ ] No se promociona. Motivo: ______________________
