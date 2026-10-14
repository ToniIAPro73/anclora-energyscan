# Índice de specs EnergyScan

Estado global: ES-0.1–ES-0.4 aceptadas por Toni y promovidas hasta `main` en `73b83dce7c528375a2a51a3aa615480c8b0b7e70`. El flujo local `local_` se mantiene editable y muestra el aviso de estimación no verificada; la limitación de integridad sigue documentada en F0-R04. ES-1.1 está en implementación en `development` (`13a19448a3ca754bab85d4e924c543651a56c08b`). Se trabaja directamente en `development`; el piloto de usuarios es opcional y no es prerrequisito de implementación ni aceptación funcional.

| ID | Fase | Prioridad | Dependencia | Estado | Spec/tarea | Gate |
|---|---:|---|---|---|---|---|
| ES-0.1 | 0 | P0 | Ninguna | VALIDADA POR TONI · PROMOCIONADA A MAIN | [000-seguridad-verdad/spec.md](000-seguridad-verdad/spec.md), [tasks.md](000-seguridad-verdad/tasks.md) | AuthZ completa y matriz sin acceso cruzado |
| ES-0.2 | 0 | P0 | Inventario F0 | ACEPTADA POR TONI · PROMOCIONADA A `main` | [`000-seguridad-verdad/es-0.2-data-flow-inventory.md`](000-seguridad-verdad/es-0.2-data-flow-inventory.md) | Retención, borrado, logs y purga de huérfanos registrados en gates; límites restantes no alteran la aceptación de fase |
| ES-0.3 | 0 | P0 | ES-0.1 inventario | CERRADA · PROMOCIONADA | [`es-0.3-claims-inventory.md`](000-seguridad-verdad/es-0.3-claims-inventory.md) | Claims/procedencia trazables; revisión externa previa a exposición pública cuando aplique |
| ES-0.4 | 0 | P1 | ES-0.1–0.3 | ACEPTADA POR TONI · PROMOCIONADA A `main` | [`es-0.4-baseline.md`](000-seguridad-verdad/es-0.4-baseline.md), [`es-0.4-pilot-protocol-template.md`](000-seguridad-verdad/es-0.4-pilot-protocol-template.md) | Baseline ligado a SHA; aviso local implementado; R04 conserva su limitación técnica; piloto opcional |
| ES-1.1 | 1 | P1 | F0 | EN IMPLEMENTACIÓN · PENDIENTE DE REVISIÓN DE TONI | [SDD ES-1.1](../../sdd/features/energyscan-budget-extraction-localization/feature-energyscan-budget-extraction-localization-spec-v1.md) | Extracción y localización medida con fixtures sintéticos; no implica exactitud en documentos reales |
| ES-1.2 | 1 | P1 | ES-1.1 | PROPUESTA | idem | Comparabilidad explicable, unidades/IVA compatibles |
| ES-1.2.R | 1 | P1 | ES-0.2, ES-0.3 | PROPUESTA (spec redactada) | [`010-referencias-precios/spec.md`](010-referencias-precios/spec.md) | Conjunto de precios anónimo con umbral N/M; sin datos personales; abstención por debajo del umbral |
| ES-1.3 | 1 | P1 | ES-1.1–1.2 | PROPUESTA | idem | Revisión accionable y corregible |
| ES-2.1 | 2 | P1 | F0 | PROPUESTA | idem | Procedencia/versiones completas en campos críticos |
| ES-2.2 | 2 | P0 | ES-0.1 | PROPUESTA | idem | Permiso y revocación en todas las rutas |
| ES-2.3 | 2 | P2 | ES-2.1–2.2 | PROPUESTA | idem | Exportación y consentimiento controlados |
| ES-3.1 | 3 | P1 | F0–F1 | PROPUESTA | idem | Incertidumbre calibrada o abstención |
| ES-3.2 | 3 | P1 | ES-3.1 | PROPUESTA | idem | Plan revisable por técnico |
| ES-3.3 | 3 | P0 | ES-3.2 | PROPUESTA | idem | Piloto con población/denominador predefinidos |
| ES-4.1 | 4 | P1 | F0.3 | PROPUESTA | idem | Fuente/territorio/vigencia visibles |
| ES-4.2 | 4 | P1 | ES-4.1 | PROPUESTA | idem | Cero concesiones/obligaciones afirmadas sin base |
| ES-4.3 | 4 | P2 | ES-4.1–4.2 | PROPUESTA | idem | Bruto/ayuda potencial/neto separados |
| ES-5.1 | 5 | P0 | F3 | PROPUESTA | idem | Precio/términos/reembolso decididos por Toni |
| ES-5.2 | 5 | P0 | ES-5.1 | PROPUESTA | idem | Entrega/idempotencia/recovery en test mode |
| ES-5.3 | 5 | P1 | ES-5.1 | PROPUESTA | idem | Métrica de canal con privacidad aprobada |
| ES-6.1 | 6 | P1 | F3 | PROPUESTA | idem | Serie consentida y contextualizada |
| ES-6.2 | 6 | P1 | ES-6.1 | PROPUESTA | idem | Normalización revisada y reproducible |
| ES-6.3 | 6 | P2 | ES-6.1–6.2 | PROPUESTA | idem | Seguimiento se abstiene ante baseline insuficiente |

El detalle de F0 guía la ejecución actual; el resto se refina al cerrar cada fase. Los gates y su evidencia se actualizan según comprobaciones realmente ejecutadas; ver [gates F0](000-seguridad-verdad/gates.md). Al cerrar un lote, commit y push a `development`; promociones solo después de aceptación de fase y por la secuencia gobernada `development → staging → production → main`.
