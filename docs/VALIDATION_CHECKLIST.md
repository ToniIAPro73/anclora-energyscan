# Checklist de validación — alertas de presupuesto (2026-10-14)

> Este fichero se sobrescribe en cada entrega. El historial queda en Git.

**Repositorio:** `anclora-energyscan` · **Rama y commit de código:** `development` @ `d509905172b9ffde3f6eb2893821e239d646ea30`
**Datos:** ficticios. Usa la identidad QA, no una cuenta personal.

## 1. Qué cambia

- Desaparecen las etiquetas «Precio alto», «Precio bajo» y «En rango» y la alerta «Presupuesto alto» (más de 30.000 €).
- Cada partida con importe muestra **«Sin referencia comparable»**. Aviso fijo: revisar mediciones, marcas, garantías e IVA.
- Las revisiones antiguas muestran también «Sin referencia comparable».

## 2. Comprobado por el agente

Lint, `tsc`, 529 tests y build: PASS. Visual QA: NOT_RUN.

## 3. Validación manual

1. Abre Budget Review con la identidad QA y sube un presupuesto de prueba con una partida de más de 450 €/ud. y otra de menos de 25 €/ud.
2. Comprueba que ninguna partida sale en rojo o ámbar como «precio alto/bajo» y que todas dicen «Sin referencia comparable».
3. Sube un presupuesto de más de 30.000 € y comprueba que no aparece «Presupuesto alto».
4. Repite en ES, EN y DE. En CA, FR, IT y PT la etiqueta cae al texto de ES o EN (límite conocido).
5. Descarga el PDF de la revisión y comprueba la misma etiqueta en la tabla.
