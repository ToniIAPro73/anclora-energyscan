# Plan v1 — ES-1.1 extracción y localización de partidas

1. Auditar el parser, su suite focal y los puntos donde las categorías se presentan en importación y resultados.
2. Crear fixtures sintéticos con formatos y unidades diferentes, anotados por campo y categoría esperada; calcular sus SHA-256.
3. Añadir pruebas de exactitud/cobertura por campo y pruebas de etiquetas en los siete locales, primero como pruebas de regresión.
4. Ajustar únicamente los campos/labels que fallen en la prueba focal; conservar abstención `UNKNOWN` ante texto sin evidencia.
5. Registrar numeradores, denominadores, límites y fixtures en el informe de ejecución.
6. Ejecutar los gates proporcionales de repositorio en secuencia, completar `docs/VALIDATION_CHECKLIST.md`, commit y push a `development`.

No se llama a proveedores, no se usan documentos reales, no se modifica Neon/Blob ni se cambia el esquema.
