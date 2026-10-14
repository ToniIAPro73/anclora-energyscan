# Checklist de validación — ES-0.3.b-2 (2026-10-14)

> Este fichero se sobrescribe en cada entrega.

**Commit de código:** `73477b5bd7a5b79b91321708ec3b29c195c65979` en `development`. Datos ficticios; no inicies pagos.

## Qué cambia respecto a la validación anterior

1. Alertas de presupuesto sin umbrales universales: cada partida muestra «Sin referencia comparable»; sin «Presupuesto alto».
2. Cabecera móvil corregida (sin recorte a 320/360/390/430 px).
3. PDF alemán: etiqueta «Kein Vergleichswert» (antes truncada).

## Pasos manuales

1. Móvil (320, 390, 430 px) en `/budget-review`, `/dashboard` y `/`: sin recorte horizontal de la cabecera, en ES, EN y DE.
2. Abre `/api/budget-review/demo/pdf?lang=es`, `?lang=en` y `?lang=de`: la columna de estado muestra la etiqueta completa y ninguna etiqueta de precio alto/bajo/en rango.
3. Responde `ACEPTO 0.3.b-2` o indica los defectos.
