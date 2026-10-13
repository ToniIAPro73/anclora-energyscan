# F0 — Plan de desarrollo

**Estado:** activo para desarrollo en `development`. ES-0.1 fue validada por Toni y promocionada a `main`; ES-0.2 es el siguiente lote. Toni valida inicialmente cada entrega junto con el agente. Revisiones externas y piloto de usuarios quedan para gates de publicación, afirmaciones profesionales/reguladas o validación de mercado.

## Arquitectura actual confirmada y propuesta

- Next.js 14 API routes; Auth.js/NextAuth, Prisma/Postgres Neon por contrato; Blob para adjuntos. Assessment.userId nullable; Attachment.assessmentId y storage path relacionan documento. Los handlers actuales deben comprobar autorización en servidor; upload no debe tratar auth fallida como identidad.
- Modelos reutilizables: AssessmentAttachment, AttachmentAnalysis, EnergyCertificate, RehabBudget, DataFieldSource. Reusar sin migrar hasta demostrar una brecha.
- OCR/document parsing, análisis visual, PDF, Budget Review, scoring y local_ stateless existen. No se inventa ruta API nueva. Todo endpoint/modelo/flag futuro se marca PROPUESTA.
- Autorización propuesta: resolver sesión, recuperar recurso mediante relación autorizada, validar sujeto×recurso×acción antes de operar en Blob. Upload anónimo denegado por defecto; cualquier draft futuro requiere token de un solo propósito, alcance y expiración.
- Copy versionado por locale y fuente. Prediagnóstico distinto de CEE. Claims que necesiten asesoramiento legal/profesional no se publican hasta revisión aplicable.
- No se propone migración inicial. Si una fase posterior demuestra una brecha de esquema, documentar migración forward-only, compatibilidad y rollback. Respetar Neon como DB contractual.

## Decisiones iniciales de producto

| Decisión | Valor inicial | Cuándo reabrir |
|---|---|---|
| Upload anónimo | Denegar hasta que haya necesidad y control seguro demostrable | Si un flujo real lo requiere |
| Acceso profesional | Denegar sin grant explícito y verificable | F2, al construir roles |
| ID local_ | Tratamiento manipulable; nunca es identidad ni ACL | Si se rediseña el flujo stateless |
| Budget thresholds | Etiqueta neutral/abstención si faltan contexto/unidades | F1, con método y corpus autorizado |
| DB y servicios | Contrato PRODUCTION_BACKED del repo; no cambiar por defecto | Solo ante cambio explícito en contratos/runtime |
| Feature flags | No añadir para documentación; flag fail-closed solo si se justifica por rollout seguro | Al diseñar activación pública |

## Secuencia de trabajo F0

| Tarea | Trabajo | Salida revisable | Criterio técnico de salida |
|---|---|---|---|
| ES-0.1 | Proteger lectura, borrado y upload; probar casos owner/no-owner/anon | Guardas, pruebas y mapa de rutas | Cero acceso cruzado en casos ejecutados; autorización antes de I/O; comportamiento de fallo seguro |
| ES-0.2 | Trazar datos y minimizar logs/retención | Mapa de flujo, cambios focales y pruebas sintéticas | Sin centinelas sensibles en logs; flujo/proveedores identificados o brechas documentadas |
| ES-0.3 | Corregir copy, estados de fuente y abstención | Cambios de producto/locales/salidas | Sin falsa obligación E/2033 ni CEE oficial; ausencia e incertidumbre visibles |
| ES-0.4 | Fijar SHA, matriz de pruebas y riesgos pendientes | Baseline y evidencia | Requisitos enlazados a pruebas o limitación concreta; ninguna evidencia histórica atribuida al SHA actual |

La secuencia puede ajustarse si una dependencia técnica lo requiere; documentar la razón. Un hallazgo no corregible de inmediato se contiene con denegación/ocultación de la ruta afectada y un seguimiento concreto, nunca se presenta como resuelto.

## QA proporcional

- Para documentación: comprobar diff y referencias; no ejecutar pruebas de aplicación sin necesidad.
- Para cambios de lógica: inspeccionar tests existentes, ejecutar pruebas focales y el nivel de QA requerido por los contratos Anclora. No ejecutar suites completas por defecto.
- Para auth/storage: pruebas negativas con mocks/fixtures sintéticos; no usar datos personales ni servicios live salvo que el contrato y la necesidad lo exijan.
- Para UI: seguir el runtime compartido `agent-browser`/`anclora-visual-qa` según el nivel QA aplicable.
- No usar cuenta personal para QA. Si se necesita DB, verificar el destino efectivo sin mostrar credenciales y usar identidad QA dedicada persistente.
- El agente presenta evidencia y límites; Toni acepta el resultado de producto. Esa aceptación no declara cumplimiento legal, exactitud técnica profesional ni adecuación de mercado.

## Rollback, observabilidad y límites

Logs categóricos, sin nombre, dirección, OCR, URL firmada, cookie, token, email o payload. Métricas agregadas de allow/deny, fallos y estado de documentos. Rollback por código y flag fail-closed si existe. No tocar datos históricos destructivamente.

## Flujo Git y promoción

1. Trabajar en `development`, sin crear rama por fase/carpeta.
2. Al cerrar lote, ejecutar QA proporcional y revisar el diff.
3. Compartir resultados con Toni para aceptación inicial; hacer las correcciones solicitadas.
4. Crear commit y push a `origin/development`.
5. Promocionar solo una fase comprobada y con autorización explícita: `development → staging → production → main`. Ejecutar y verificar cada gate de release antes del siguiente paso. El push de desarrollo no activa promoción.

## Validaciones posteriores

- Piloto con usuarios: útil para ajuste de mercado, usabilidad y métricas reales; se programa tras contar con un flujo seguro y utilizable, no antes de construir.
- Técnico energético: antes de presentar un plan/score como recomendación profesional o validada.
- Legal/privacidad: antes de afirmaciones jurídicas, tratamientos o lanzamiento público que requieran esa revisión.
- Una tarea puede seguir desarrollándose internamente mientras espera esos gates, siempre que la capacidad esté etiquetada como borrador/estimación y no se active públicamente.
