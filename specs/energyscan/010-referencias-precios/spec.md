# ES-1.2.R — Referencias de precios anónimas

**ID:** ES-1.2.R · **Versión:** 0.1 · **Estado:** PROPUESTA (redactada a petición de Toni el 2026-10-14; sin implementación)
**Fase:** F1 (prerrequisito de ES-1.2 «Comparabilidad y costes») · **Dependencias:** ES-0.2 (retención y privacidad), ES-0.3 (abstención y procedencia)
**Owner de producto:** Toni · **Implementación y evidencia:** agente + herramientas del repo.

## 1. Problema y objetivo

Hoy EnergyScan no puede juzgar un precio: las alertas de presupuesto usaban umbrales fijos (450 €, 25 €, 30.000 €) que ignoraban unidad, categoría y territorio, y se retiraron en ES-0.3.b-2. Cada partida muestra «Sin referencia comparable».

**Objetivo:** construir, a partir de presupuestos que los usuarios acepten aportar, un conjunto de datos de precios **anónimo y agregable** que permita hablar de precios con una base concreta. Cuando haya referencia comparable suficiente se muestra; si no, se mantiene la abstención.

**No es** un sistema RAG ni un corpus de documentos. Es una tabla de hechos de precio normalizados.

## 2. Decisiones de Toni recogidas

1. Se guardan datos relevantes de los presupuestos, **sin datos personales**: importes, cantidades y precios para construir una base.
2. El uso previsto es poder hablar de precios con una base concreta.

## 3. Alcance

**Dentro:** consentimiento de contribución, extracción y normalización de campos no personales, almacén separado, umbral mínimo de muestras, reglas de calidad, integración con la etiqueta `NO_REFERENCE`, retirada de consentimiento.

**Fuera:** mostrar precios de proveedores concretos, ranking de empresas, publicar el conjunto de datos, precios de mercado como afirmación comercial, uso de presupuestos sin consentimiento.

## 4. Requisitos

- **R01 Consentimiento explícito y separado.** Casilla opcional, desmarcada por defecto, al subir un presupuesto: «Contribuir con datos anonimizados de precios». Registrar versión del texto, fecha y revisión de presupuesto. Sin consentimiento no se guarda ninguna fila de precios. El análisis y el informe funcionan igual con o sin consentimiento.
- **R02 Solo campos no personales.** Se conservan: categoría normalizada, unidad (€/m², €/ud., €/kW, €/ml, otra), cantidad, precio unitario, importe de la partida, IVA incluido o no (y tipo), provincia, mes y año, e idioma de origen. **Se descartan:** nombres, NIF/CIF, direcciones, teléfonos, correos, nombre del proveedor, texto libre de la descripción y nombre de archivo.
- **R03 Normalización de la partida.** La descripción libre se mapea a una categoría de un catálogo cerrado (ventanas, aislamiento, aerotermia, fotovoltaica, otras…). Si no hay mapeo seguro, la partida no entra en el conjunto.
- **R04 Unidad obligatoria.** Una partida sin unidad reconocible o sin cantidad no genera fila de precio unitario.
- **R05 Umbral mínimo de muestras (N).** Solo se muestra una referencia si hay N o más contribuciones comparables (misma categoría, unidad, IVA normalizado y territorio) de **al menos M presupuestos distintos**. Con menos, se mantiene `NO_REFERENCE`. N y M los fija Toni (ver §9).
- **R06 Calidad.** Descartar valores imposibles; marcar atípicos (p. ej. fuera de un rango intercuartílico) y excluirlos del cálculo hasta revisión; guardar si el usuario corrigió el campo extraído. Una extracción de baja confianza no entra.
- **R07 Almacén separado de la retención.** Los presupuestos originales siguen sujetos a la retención de 30 días de ES-0.2. El conjunto de precios es otro almacén, con solo datos derivados y anónimos, **sin clave que lo vincule al presupuesto, usuario o valoración** una vez creado.
- **R08 Retirada de consentimiento.** Antes de agregar, se puede retirar y se borran sus filas. Tras agregar, las filas no son atribuibles; documentar este límite en el texto de consentimiento.
- **R09 Salida honesta.** Una referencia se presenta como «rango observado en N presupuestos aportados, territorio, periodo», nunca como «precio de mercado», «caro» o «barato». Mostrar fecha de corte y tamaño de muestra.
- **R10 Acceso.** Solo lectura agregada para el producto; el detalle por fila no se expone en la interfaz ni en la API pública. Acceso administrativo mínimo y auditado.
- **R11 Logging.** Sin importes, descripciones ni identificadores en los registros; solo códigos y recuentos.

## 5. Esquema de datos propuesto

`PriceObservation` (almacén separado): `id`, `category`, `unit`, `quantity`, `unitPrice`, `lineTotal`, `vatIncluded`, `vatRate`, `province`, `periodMonth`, `sourceLocale`, `extractionConfidence`, `userCorrected`, `outlier`, `consentVersion`, `createdAt`.
Sin `userId`, `assessmentId`, `budgetReviewId`, descripción, proveedor ni nombre de archivo. Un identificador de lote **no reversible** puede servir solo para contar presupuestos distintos (R05, M).

## 6. Flujo

1. El usuario sube un presupuesto y marca (o no) la casilla.
2. El análisis genera partidas como hoy.
3. Solo con consentimiento: se normalizan, se descartan campos personales y se escribe en el almacén separado.
4. Un proceso periódico calcula agregados por categoría, unidad, IVA y territorio; los grupos con menos de N/M no se publican.
5. La pantalla de revisión consulta el agregado: si existe, muestra el rango; si no, `NO_REFERENCE`.

## 7. Amenazas y controles

| Amenaza | Control |
|---|---|
| Reidentificación por combinación de campos (provincia + mes + importe) | Umbral N/M; provincia (no municipio); sin proveedor ni descripción; revisar rarezas antes de publicar |
| Datos personales en descripción libre | La descripción no se guarda; solo categoría normalizada |
| Datos erróneos del OCR convertidos en «referencia» | R06; confianza mínima; marcado de atípicos |
| Envenenamiento (subir presupuestos falsos para sesgar) | Un lote cuenta una vez (M); límite por usuario y periodo; revisión de atípicos |
| Percepción de precio de mercado | R09; fecha, muestra y territorio visibles; aviso orientativo |
| Retención incumplida por copia indirecta | R07; verificar en pruebas que no hay claves de vínculo |
| Consentimiento ambiguo | R01; versión del texto; revisión legal antes de activarlo |

## 8. Aceptación y rechazo

**Aceptar:** consentimiento opcional y registrado; ninguna fila sin consentimiento; esquema sin campos personales ni claves de vínculo (test de esquema); umbral N/M aplicado (test de abstención); agregación reproducible con fixtures sintéticos; retención de 30 días intacta; salida sin «caro/barato».

**Rechazar:** cualquier dato personal en el almacén; referencia mostrada con menos de N/M; fila creada sin consentimiento; presentar el rango como precio de mercado.

## 9. Decisiones de Toni (2026-10-14)

Toni aceptó las propuestas de esta sección. El punto 3 se registra con el valor por defecto indicado.

1. **N y M:** N ≥ 30 observaciones y M ≥ 10 presupuestos distintos (ACEPTADO).
2. **Territorio:** provincia (ACEPTADO).
3. **Contrapartida por contribuir:** ninguna en la primera versión (valor por defecto; Toni puede cambiarlo).
4. **Revisión legal** del texto de consentimiento y del uso comercial antes de activar la captura en Producción (ACEPTADO).

Pendiente de decidir: catálogo cerrado de categorías de la primera versión. Mientras no haya datos suficientes, el producto mantiene `NO_REFERENCE`.
