# ES-1.1 — Extracción y localización de partidas

## Contexto

EnergyScan ya tiene un parser de texto de presupuestos y categorías internas para medidas. La cobertura actual se apoya en muestras inline y la interfaz muestra códigos de categoría en algunos resúmenes. ES-1.1 convierte esos comportamientos existentes en una línea base sintética reproducible y presenta las categorías en el idioma seleccionado.

## Objetivo

Medir, con fixtures sintéticos versionados, la extracción exacta de campos de partidas y localizar sus categorías visibles en los siete idiomas soportados. El resultado mide comportamiento ante estos fixtures; no representa exactitud en presupuestos reales.

## Alcance

- Fixtures sintéticos de texto de presupuesto con formatos de línea distintos y unidades diferentes.
- Métrica reproducible de exactitud por campo y cobertura de campos aplicables: descripción, cantidad, unidad, precio unitario, total de partida y categoría canónica.
- Mantener las partidas no clasificadas como `UNKNOWN`, sin asignarles una categoría energética.
- Etiquetas de categorías en ES, CA, EN, DE, FR, IT y PT en importación del wizard y resultados guardados.
- Pruebas de regresión focalizadas para el parser y las etiquetas localizadas.
- Registro de SHA-256 de cada fixture y denominadores/resultados en el informe de ejecución.

## Fuera de alcance

- No cambiar el algoritmo de extracción ni afirmar precisión general sobre documentos reales sin corpus autorizado.
- No añadir OCR, extracción PDF en navegador, proveedores, servicios externos ni nuevas dependencias.
- No comparar precios, normalizar IVA/alcances, recomendar ofertas ni cambiar estimaciones económicas (ES-1.2/ES-1.2.R).
- No persistir texto bruto ni cambiar el esquema de base de datos.
- No añadir datos personales ni documentos reales a fixtures.

## Criterios de aceptación

1. Cada fixture contiene solo datos ficticios y tiene hash SHA-256 registrado.
2. La prueba evalúa cada campo aplicable contra el valor esperado normalizado y publica numerador/denominador por campo; ausencias o valores incorrectos cuentan como fallo.
3. Los casos de unidad ausente se registran como no aplicables para cantidad/unidad/precio unitario y no inflan cobertura.
4. El parser conserva las partidas desconocidas y reporta categoría `UNKNOWN` cuando no hay evidencia suficiente.
5. Todas las categorías canónicas y `UNKNOWN` tienen etiqueta para los siete locales; wizard y resultados usan el mismo helper.
6. Casos de categoría sin traducción válida no exponen el identificador técnico (`ENVELOPE_FACADE`) al usuario.
7. No hay cambios de comportamiento fuera de extracción de partidas sintéticas y presentación localizada de categorías.
8. La evidencia se registra para el SHA final; aceptación de producto corresponde a Toni.

## Dependencias y riesgos

- Reutiliza `src/lib/ocr/budget-parser.ts`, `src/lib/ingestion/budget-classifier.ts` y el modelo `BudgetLineItem` existente.
- Las etiquetas visibles son copy de producto y requieren revisión de tono/traducción antes de promoción.
- Los fixtures cubren formatos diseñados y no prueban PDFs escaneados, OCR, distribución real ni documentos de terceros.

## Decisión de alcance

En esta tarea, “localización de partidas” significa localizar al idioma seleccionado las categorías canónicas mostradas en UI. No significa geocodificar partidas ni decidir comparabilidad o precios.
