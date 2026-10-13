# Evidencia futura F0

ES-0.1 fue validada por Toni y promocionada a `main`. Los informes históricos de ejecución y sus límites constan en `../gates.md`; la decisión de fase no sustituye los resultados técnicos, y las comprobaciones pendientes siguen identificadas allí. ES-0.2–ES-0.4 aún no tienen evidencia de ejecución.

Cuando se ejecute una fase:

1. Registrar branch, SHA, fecha/hora UTC, comando, versión del runner, entorno, fixture y resultado.
2. Para datasets sintéticos/anonimizados, registrar procedencia, población/unidad, exclusiones y transformaciones. Guardar SHA-256 del dataset final y un manifiesto no sensible; no conservar originales protegidos.
3. Publicar métricas con numerador/denominador, definición previa, cobertura por campo/formato, errores materiales y abstenciones.
4. Logs solo con categorías/IDs efímeros; no guardar payload, filename, dirección, texto OCR, token, cookie, email ni URL Blob.
5. Capturas solo de fixtures sintéticos; difuminar identificadores y registrar viewport/locale/SHA.
6. Registrar ID, pregunta, estado PASS/FAIL/BLOCKED/NOT_RUN, fuente, fecha, responsable y evidencia. Toni registra aceptación inicial del producto. Esa aceptación no sustituye una revisión externa requerida antes de un uso público concreto.
7. Para QA DB, seguir el contrato runtime y usar cuenta QA dedicada persistente. No revelar secretos.

Manifiesto sugerido: `commit`, `fecha_utc`, `gate_id`, `test_id`, `fixture_hash`, `poblacion_n`, `denominador`, `resultado`, `decision_toni`. Este template no implica comando ejecutado ni aprobación.
