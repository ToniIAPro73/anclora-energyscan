# Análisis F0 — baseline y decisiones de ejecución

**Baseline inspeccionado:** `development@4870403dfd8237dfa82b2aecc9bd4270cd766bd0`; análisis estático fechado 2026-10-12.
**Estado:** referencia técnica para el desarrollo de F0, no validación de producto terminado.

## Hallazgos confirmados estáticamente

| Hecho observado | Fuente en el SHA base | Acción F0 | Límite de evidencia |
|---|---|---|---|
| GET/DELETE de adjuntos consultan y operan storage/DB sin auth visible en el handler | `src/app/api/assessment/[id]/attachments/[attachmentId]/route.ts` | ES-0.1; autorización por actor/recurso/acción | No demuestra explotación ni excluye middleware global |
| Upload tolera auth null y lo incluye en tokenPayload | `src/app/api/blob/upload/route.ts` | ES-0.1; fallar cerrado y definir draft | No demuestra que se haya subido un Blob por atacante |
| local_ serializa JSON base64url | `src/lib/stateless-assessment.ts` | Tratar como manipulable; mapear consumers | No todos los consumers se han demostrado vulnerables |
| Claim clase E residencial 2033 en landing ES/EN/DE | `src/app/page.tsx` | ES-0.3; revisar claims en superficies existentes | Inventario completo de PDF/SEO aún requiere recorrido |
| climateRules vacío | `src/lib/scoring.ts` | No afirmar calibración climática | No determina calidad total del score |
| Umbrales 25/450 y 30000 en engines | `src/lib/budget-review/service.ts`, `advanced-analysis.ts` | ES-0.3; contexto/unidades y abstención | Uso de cada umbral requiere consumers |
| Evidence Matrix y modelos de fuente/documento existen | `src/lib/evidence/evidence-matrix.ts`, `prisma/schema.prisma` | Reutilizar y probar cobertura | No demuestra cobertura completa ni calidad |
| CEE, budget, bills y Stripe tienen modelos/rutas existentes | `prisma/schema.prisma`, `src/app/api/checkout`, webhook y `src/lib/stripe.ts` | Reusar seams; diferir cambios comerciales no necesarios a F0 | Presencia estática no acredita operación/configuración |

## Decisiones de ejecución

- La auditoría y el roadmap permiten empezar directamente con F0; el piloto de 10–15 casos no es prerequisito de implementación.
- Toni es el validador inicial de producto. Las pruebas objetivas, inspección y evidencia técnica respaldan cada aceptación.
- No exigir revisores distintos por tarea. Seguridad, privacidad y exactitud se preservan mediante controles de ingeniería y gates de publicación donde se requiera especialidad externa.
- Externos: técnico antes de presentar salidas como recomendaciones profesionales; legal/privacidad antes de claims o tratamientos públicos que lo requieran; usuarios para medir encaje y uso tras existir un prototipo seguro.
- La aceptación de desarrollo no debe describirse como cumplimiento legal, certificación, validación energética ni PMF.

## Pendientes reales (no bloquean desarrollo interno salvo uso correspondiente)

1. Revisar todas las superficies de copy para cumplir el alcance F0; no publicar claims legales/profesionales dudosos.
2. Concretar retención y proveedores antes de habilitar un tratamiento que dependa de esa decisión.
3. Seleccionar tests focales al implementar tras inspeccionar el paquete y CI actuales.
4. Verificar destino efectivo antes de ejecutar QA de DB, siguiendo el contrato runtime y sin revelar secretos.
5. Definir segmento/precio en las tareas correspondientes; no inventar decisiones comerciales en F0.
6. Hacer piloto de usuarios consentido cuando el flujo seguro esté listo, si Toni lo decide.

## Evidencia y límites

Los reportes de pruebas previos en specs SDD describen sus SHAs históricos, no el baseline actual. Las comprobaciones de la implementación F0 se registrarán por SHA, comando, fixture sintético y resultado. Todo gate aún no corrido será `NOT_RUN`; un bloqueo requiere una dependencia técnica o de seguridad concreta.
