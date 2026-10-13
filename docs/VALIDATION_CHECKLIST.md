# Checklist de validación — histogramas de formas Blob

> Este fichero se sobrescribe en cada entrega. El historial queda en Git.

**Rama:** `development`

**SHA del código validado:** `30c44e9fcd24893bc96321fa75c1e6ea643c3d55`

**Datos/entorno:** pruebas focales con dobles y fixtures sintéticos. No se consultó Blob real, no se usó `--apply` y no se modificó la base de datos.

## 1. Qué cambió

- Las rutas bajo `assessment-drafts/` y `assessments/` que no coinciden con las formas reconocidas se cuentan como clase `d`; no abortan la purga y nunca son candidatas a borrado.
- El reporte incluye recuentos y bytes por franja de edad y clase `a`–`d`.
- Se añade un histograma anonimizado por forma: raíz permitida, tipo de cada segmento, cantidad de segmentos, recuento, bytes y franja de edad. Nombres, extensiones, IDs y rutas no aparecen.
- Objetos que no pertenecen al prefijo de EnergyScan solicitado se ignoran. Solo candidatos huérfanos reconocidos con más de 30 días pueden borrarse.

## 2. Gates finales ejecutados secuencialmente

| Gate | Comando | Resultado | SHA |
|---|---|---|---|
| Lint | `npm run lint` | PASS | `30c44e9fcd24893bc96321fa75c1e6ea643c3d55` |
| Typecheck | `npx tsc --noEmit` | PASS | `30c44e9fcd24893bc96321fa75c1e6ea643c3d55` |
| Suite completa | `npm test -- --runInBand` | PASS; 79 suites / 522 tests | `30c44e9fcd24893bc96321fa75c1e6ea643c3d55` |
| Build | `npm run build` | PASS | `30c44e9fcd24893bc96321fa75c1e6ea643c3d55` |
| Diff documental | `git diff --check` | PASS antes del commit documental | SHA del código `30c44e9fcd24893bc96321fa75c1e6ea643c3d55` |

No existe script npm `typecheck`; se ejecutó `npx tsc --noEmit`. El paquete completo se ejecutó una vez y en secuencia. Tests focales previos: 2 suites / 12 tests PASS.

## 3. Casos comprobados

| Caso | Resultado |
|---|---|
| Forma antigua desconocida en `assessment-drafts/` | PASS; contada como `d`, incluida en histograma y no borrada con `--apply` |
| Forma reconocida antigua en el mismo lote sintético | PASS; única candidata borrada en el doble |
| Tipos de segmento UUID v4, otro UUID, CUID, numérico, texto corto/largo y archivo | PASS; salida normalizada sin valores reales |
| Ruta devuelta fuera del prefijo solicitado | PASS; ignorada y no borrada |
| Histograma y reporte | PASS; no incluyen rutas, identificadores, nombres de archivo ni extensiones |
| Simulación con Blob real / `--apply` | NOT_RUN; Toni revisará primero los recuentos reales |

## 4. Acciones manuales para Toni

1. Ejecutar la simulación real sin `--apply` y revisar clases, histogramas y tamaños por franja.
2. Confirmar si las formas antiguas de clase `d` deben seguir conservándose o si propone ampliar explícitamente la regla en una tarea posterior.

No se amplió la regla de borrado para formas desconocidas ni se programó o promovió la purga.
