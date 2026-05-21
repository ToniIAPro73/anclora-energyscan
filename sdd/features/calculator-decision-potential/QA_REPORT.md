# QA Report — Calculator Decision Potential

## Resumen

- Se sustituye la tercera card visible de la calculadora: deja de estar centrada en el retorno económico simple y pasa a mostrar `Potencial de decisión`.
- El retorno en años se mantiene como dato técnico interno y queda disponible en un bloque plegable discreto.
- El cambio evita que un payback muy largo cierre la decisión de forma fría, sin maquillar que el ahorro directo puede no justificar la inversión por sí solo.

## Archivos modificados

- `src/lib/calculator/savings.ts`
- `src/components/monetization/SavingsCalculator.tsx`
- `src/components/monetization/CalculatorHeader.tsx`
- `src/lib/monetization/i18n.ts`
- `tests/savings-calculator.test.ts`
- `tests/calculator-i18n.test.ts`
- `sdd/features/calculator-decision-potential/QA_REPORT.md`

## Decisión de producto

- El retorno económico simple se mantiene como `paybackYearsRange`.
- La card visible usa `decisionPotential`.
- Reglas:
  - `favorable`: `paybackMaxYears <= 15`
  - `review`: `paybackMinYears <= 30` y `paybackMaxYears > 15`
  - `full_analysis`: `paybackMinYears > 30`
  - `not_enough_data`: payback no disponible o datos insuficientes explícitos

## Cambios UI

- Card 1: mantiene ahorro anual estimado.
- Card 2: mantiene inversión orientativa.
- Card 3: muestra `Potencial de decisión` con badge y descripción.
- El aviso contextual se basa en el nivel de decisión, no en un mensaje de error por payback largo.
- La lectura rápida añade puente honesto hacia el análisis completo y PDF Premium.
- Se añade detalle técnico opcional: `Ver cálculo económico simple`.
- Se mantiene CTA real a `/wizard?source=calculator`, además de CTAs existentes a pricing y Budget Review.
- Se ajusta el H1 para evitar overflow en alemán móvil.

## Cambios i18n

- ES: añadido copy de potencial de decisión, avisos, lectura rápida, puente Premium y detalle técnico.
- EN: añadido copy equivalente sin mezcla de idiomas.
- DE: añadido copy equivalente sin mezcla de idiomas.
- No se añade nuevo copy visible hardcodeado en TSX.

## Tests

- `tests/savings-calculator.test.ts` cubre:
  - `favorable`
  - `review`
  - `full_analysis`
  - `not_enough_data`
  - conservación del payback interno
- `tests/calculator-i18n.test.ts` cubre claves nuevas ES/EN/DE.

## Resultado de comandos

- `npm run lint`: passed.
- `npm test -- calculator`: passed, 3 suites / 23 tests.
- `npm test -- savings`: passed, 1 suite / 16 tests.
- `npm test -- i18n`: passed, 2 suites / 5 tests.
- `npm test -- seo-calculator`: passed.
- `npm test`: passed, 59 suites / 394 tests.
- `npx tsc --noEmit`: passed. No existe script dedicado `typecheck`.
- `npm run build`: passed.

## QA visual manual

- Desktop/local: `http://localhost:3000/calculadora-ahorro`.
- Caso payback largo: 45 m2, reforma energética profunda, 66 EUR/mes.
  - Card 3 muestra `Potencial de decisión`.
  - Estado visible: `Requiere análisis completo`.
  - No se muestran años como valor principal.
  - El payback aparece solo en `Ver cálculo económico simple`.
- Caso favorable: 20 m2, ventanas, 500 EUR/mes.
  - Card 3 muestra `Potencial favorable`.
  - Mensaje prudente, sin prometer ahorro garantizado.
- Datos insuficientes:
  - El formulario validado evita resultados incoherentes.
  - La función centralizada cubre `not_enough_data` para payback no disponible.
- Mobile 390x844:
  - Cards apiladas.
  - CTA visible.
  - Sin scroll horizontal en ES/EN/DE tras ajuste del H1.
- Idiomas:
  - ES muestra `Potencial de decisión`.
  - EN muestra `Decision potential`.
  - DE muestra `Entscheidungspotenzial`.
  - No se detecta `NaN`, `Infinity` ni `undefined` en el resultado.

## Limitaciones

- No hay infraestructura existente de tests React para este componente; la UI se valida con QA manual Playwright y tests unitarios del motor/i18n.
- `not_enough_data` no suele aparecer desde el formulario porque la validación Zod exige inputs mínimos válidos; queda disponible en la función centralizada para casos sin payback usable.

## Riesgos

- Riesgo de interpretación económica: mitigado manteniendo el payback en detalle técnico y evitando claims de rentabilidad garantizada.
- Riesgo legal/comercial: mitigado con disclaimers existentes y copy que no sustituye CEE ni validación técnica.
- Riesgo de captación agresiva: mitigado con CTA hacia análisis completo, no promesa directa de ahorro.
- Riesgo mobile/i18n: mitigado con QA en ES/EN/DE y corrección de overflow del H1 alemán.
