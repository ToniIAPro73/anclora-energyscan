# AI Document Ingestion With MinerU

## Objetivo

EnergyScan mantiene su parser nativo para PDFs con texto seleccionable y usa MinerU como motor avanzado para:

- PDFs escaneados o con OCR debil
- tablas complejas
- presupuestos con layout irregular
- certificados energeticos con lectura parcial

## Motores disponibles

- `native`: `pdfjs-dist` + parsers internos
- `mineru`: wrapper local hacia `~/projects/agent-tooling/mineru/bin/mineru-agent-ingest.sh`
- `auto`: usa nativo primero y escala a MinerU si la calidad es baja
- `fallback`: intenta MinerU y, si falla, vuelve al parser nativo

## Variables de entorno

```env
MINERU_AGENT_INGEST_PATH=/home/toni/projects/agent-tooling/mineru/bin/mineru-agent-ingest.sh
MINERU_DEFAULT_BACKEND=pipeline
MINERU_OUTPUT_BASE=/home/toni/projects/agent-tooling/mineru/output
MINERU_PARSE_TIMEOUT_MS=180000
```

## Politica de seleccion

- Si el PDF tiene texto nativo util, EnergyScan mantiene el parser actual.
- Si el texto es debil, vacio o el layout parece complejo, `auto` intenta MinerU.
- Si MinerU falla, la app no se bloquea: devuelve resultado nativo con warnings.

## Rutas afectadas

- `POST /api/ingestion/budget/analyze`
- `POST /api/ingestion/cee/analyze`
- `POST /api/assessment/[id]/budget/import`
- `POST /api/assessment/[id]/cee/import`

Estas rutas aceptan `engine=auto|native|mineru|fallback`.

## Privacidad

- No subir documentos sensibles a servicios externos.
- No commitear PDFs ni salidas parseadas.
- Presupuestos y certificados pueden incluir direccion, titular, referencias y otros datos sensibles.

## Validacion local

```bash
npm test -- --runInBand document-parser-service energy-document-classifier
```

## Limitaciones

- MinerU depende de instalacion local previa.
- El parseo avanzado puede ser lento en la primera ejecucion.
- El resultado sigue siendo orientativo y requiere revision humana si el documento es borroso o ambiguo.
