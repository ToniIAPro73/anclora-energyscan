# Matriz de gates F0

**Commit de referencia del análisis:** `4870403dfd8237dfa82b2aecc9bd4270cd766bd0`. Cada gate se actualizará con el SHA realmente implementado.

El agente ejecuta los gates técnicos internos. Toni es el validador inicial del producto y acepta o pide cambios en cada fase. La validación externa no bloquea desarrollo; puede ser requisito antes de exponer públicamente una capacidad o afirmación que dependa de ella.

Las filas describen comprobaciones que deben ejecutarse, no resultados actuales. Los resultados del análisis previo son `NOT_RUN`; ningún `PASS` se hereda de reportes históricos.

| Req → tarea | Comprobación | Fixture/dataset | Método | Criterio de aceptación | Evidencia mínima | Aceptación producto | Estado |
|---|---|---|---|---|---|---|---|
| R01–04 → ES-0.1 | CRUD owner A/B, anon, profesional sin/con grant y revocado; demo/stateless manipulado; rutas de adjuntos | Usuarios, assessments, adjuntos sintéticos; Blob mock | Tests focales e inspección de rutas/storage | 0 accesos cruzados permitidos en N casos; publicar N/población; authz antes de I/O | SHA, casos, resultado redactado, fixture hash | Toni | NOT_RUN |
| R02–03 → ES-0.1 | GET/DELETE válido/ausente, Auth error, IDOR, demo, Blob failure, MIME/tamaño/replay/callback | Archivos falsos y storage mock | Tests focales | Denegación antes de I/O no autorizado; éxito válido; fallo sin metadatos engañosos | Aserciones/estados categóricos sin URL, token ni path | Toni | NOT_RUN |
| R05 → ES-0.2 | Data-flow entrada→Blob→OCR/visión→DB→PDF/logs→retención; proveedores | Código, esquema y fixtures sintéticos | Revisión manual | 100% rutas/proveedores inventariados o brecha registrada; minimización y límites definidos | Mapa con fecha y salida sanitizada | Toni | NOT_RUN |
| R05/R11 → ES-0.2 | Redacción de centinelas sintéticos en logs de error | JSON sintético con valores falsos | Test focal futuro | 0 centinelas sensibles en salida; publicar campos/casos evaluados | Fixture hash y salida sanitizada | Toni | NOT_RUN |
| R06–07 → ES-0.3 | Assessment/Evidence Matrix/CEE/budget/score/PDF con fuentes, conflictos, vacíos y baja confianza | Assessment sintético | Test focal de evidencia/scoring/report | Campos críticos muestran fuente/estado/ausencia; desconocido no es cero; EnergyScan no se presenta como CEE oficial | Aserciones/snapshot y PDF sintético si aplica | Toni | NOT_RUN |
| R08/R10 → ES-0.3 | Claims de web/PDF/manual/SEO/locales con fuente, territorio y fecha | Matriz de copy sin PII | Inspección y comprobación automatizada disponible | Todas las superficies encontradas cubiertas; sin afirmación residencial E/2033 ni equivalencia prediagnóstico=CEE | Matriz ruta/locale y diff | Toni; revisión externa antes de lanzar claims regulados | NOT_RUN |
| R09 → ES-0.3 | Casos sin precio, unidad incompatible, IVA/exclusiones desconocidos | Casos límite sintéticos | Test focal de budget review | Sin etiqueta universal caro/barato sin referencia comparable; faltantes visibles/abstención | Tabla de casos y salida | Toni | NOT_RUN |
| R11 → ES-0.4 | Requisito→test→comando e inspección de CI | Tests/workflows del SHA actual | Inspección manual | Cada requisito con prueba propuesta o limitación/bloqueo concreto; ningún gate histórico presentado como actual | Matriz versionada y SHA | Toni | NOT_RUN |
| R11 → ES-0.4 | Preparar protocolo del piloto y métricas | Plantilla vacía; sin corpus real | Revisión documental | Variables, denominadores y autorización definidos antes de ejecutar un piloto; el piloto no bloquea desarrollo | Protocolo y fecha | Toni | NOT_RUN |
| Gate padre → ES-F0 | Revisar lote, resultados y riesgos | Fixtures sintéticos | Verificación documental/técnica | PASS si checks críticos pertinentes pasan y riesgo crítico/alto está corregido o contenido; FAIL con fallo reproducible; BLOCKED solo por dependencia técnica/seguridad concreta | SHA, comandos/salidas sanitizadas y decisión | Toni | NOT_RUN |

## Estados

- `PASS`: criterio comprobado sobre el SHA y evidencia reproducible; Toni acepta el resultado de producto. Su aceptación no es dictamen legal/profesional ni validación de mercado.
- `FAIL`: fallo demostrado y reproducible; corregir antes de aceptar la capacidad afectada.
- `BLOCKED`: dependencia concreta que impide construir o comprobar de forma segura. La ausencia de DPO, corpus piloto, especialista o usuarios externos no bloquea desarrollo con fixtures sintéticos.
- `NOT_RUN`: comprobación no ejecutada; no es evidencia favorable ni desfavorable.
- Para QA con DB, seguir `.anclora/PRODUCTION_RUNTIME.md`: verificar destino efectivo sin revelar credenciales y usar identidad QA dedicada persistente. No conectar a DB para esta edición documental.

## Ciclo de aceptación y promoción

1. Implementar el lote en `development`.
2. El agente ejecuta QA proporcional y comparte resumen, limitaciones y evidencia con Toni.
3. Toni acepta o solicita correcciones. Registrar aceptación de producto separada de los resultados automatizados.
4. Tras aceptación y verificación, crear commit y push a `origin/development`.
5. Una promoción posterior requiere autorización de Toni y gates de release; avanzar `development → staging → production → main`, verificando cada transición. No se requiere validación externa de usuarios para commits de desarrollo.
