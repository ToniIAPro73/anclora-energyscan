# F0 — Seguridad y verdad

**ID:** ES-F0 · **Versión:** 0.2 · **Estado:** ACTIVA PARA DESARROLLO EN `development`
**Baseline revisado:** development@4870403dfd8237dfa82b2aecc9bd4270cd766bd0, 2026-10-03
**Owner producto y validador inicial:** Toni · **Implementación y evidencia:** agente + herramientas del repo.
**Naturaleza:** alcance de desarrollo autorizado por Toni. Cada entrega se comprueba con gates técnicos proporcionales y Toni decide su aceptación inicial. Revisión externa de especialistas o usuarios se agenda en gates separados antes de afirmaciones profesionales/reguladas o lanzamiento público que dependa de ella.

## 1. Problema y resultados

EnergyScan contiene flujos documentales que deben autorizarse por usuario, assessment y acción; score/estimaciones que pueden confundirse con certificación o certeza; afirmaciones regulatorias; y extracción documental con datos personales. Antes de ampliar ofertas/planes, hay que limitar lectura, borrado y upload; explicar cómo se obtuvo cada campo y evitar afirmaciones no respaldadas.

Resultados esperados al ejecutar F0: (1) actor no accede, borra ni sube material para recursos fuera de su autorización; (2) cada campo presentado indica dato declarado, documento/fuente, estimación o no disponible, incluyendo incertidumbre y correcciones; (3) copy interno y superficies actuales no atribuyen obligación residencial universal de clase E en 2033 ni equiparan prediagnóstico con CEE; (4) inventario de tratamiento y un plan de piloto sintético/consentido; (5) evidencia técnica vinculada a commit y fixture. Toni acepta inicialmente el producto; ninguna aceptación se atribuye a especialista externo.

No se afirma explotación, precisión del score, cumplimiento RGPD, validez de ayudas, ingresos o situación jurídica española completa por inspección estática.

## 2. Alcance

**Dentro:** analizar rutas de documentos y puntos de acceso; autorización server-side por sesión, propietario/rol/recurso/acción, incluido draft; permisos en storage y URLs; serialización stateless; exposición/logging y retención OCR/IA; inventario de claims ES/EN/DE y PDF/manual/SEO; procedencia de score/CEE/coste/alertas; fixtures sintéticos; inventario de tests/CI con comandos propuestos; baseline y protocolo piloto.

**Fuera de F0:** implementar fases F1+ antes de cerrar sus especificaciones; usar documentos o datos personales reales sin necesidad y autorización; publicar afirmaciones de certificación, asesoramiento profesional, cumplimiento legal o resultados de mercado sin evidencia/revisión aplicable. No se excluye del alcance la implementación ni la verificación técnica de F0. No se conectará a servicios/DB externos salvo necesidad concreta de QA aprobada por el contrato runtime; se prefieren mocks y fixtures sintéticos.

## 3. Actores y recursos

| Actor | Recurso/acción | Regla propuesta |
|---|---|---|
| Usuario autenticado propietario | Leer/descargar/añadir/quitar adjuntos de su assessment; leer reporte | Backend valida sesión y ownership/grant en cada petición; paidAt solo controla entitlement, no identidad. |
| Usuario autenticado no propietario | Acceder, enumerar o borrar adjunto ajeno | Denegar con respuesta no enumerable; nunca confirmar existencia. |
| Profesional/colaborador autorizado | Acceso explícito, limitado y vigente | Denegar por defecto; rol, grant y alcance se verifican en servidor; F2 refinará modelo completo. |
| Anónimo | Crear borrador/upload | Bloqueado por defecto. Si producto requiere un flujo anónimo en una fase posterior, diseñar un alcance limitado, firmado, sin PII y con expiración/claim seguro antes de habilitarlo. |
| Administrador/soporte | Acceso operativo | Mínimo privilegio y auditado; no usar como QA. |
| Proveedor OCR/IA/Blob | Procesar/almacenar documento | Durante desarrollo, usar fixtures sintéticos y mocks. Cualquier procesamiento externo de documentos requiere controles de finalidad, retención, configuración y autorización antes de habilitarlo. |
| Visitante público | Leer landing/PDF demo | Copy exacto y claramente orientativo; demo usa fixtures controlados. |
| QA | Ejercitar casos | Identidad dedicada de QA; no cuenta personal; no borrar la cuenta QA. DB solo tras verificar Neon efectivo sin exponer credenciales. |

## 4. Historias

- Como propietario, quiero entender qué dato procede de Catastro/CEE/documento, qué declaré y qué está estimado para corregir un error antes de decidir.
- Como usuario, quiero que solo actores autorizados accedan a mis adjuntos, incluidos enlaces directos y DELETE.
- Como profesional, quiero ver huecos, conflictos y unidades antes de usar un cálculo, con opción a abstenerme.
- Como visitante, quiero saber que el prediagnóstico no es CEE ni asesoramiento certificado y que la regulación tiene territorio/fecha.
- Como operador, quiero revisar retención, logging y terceros antes de activar OCR/visión sobre documentos.

## 5. Requisitos

- **F0-R01 Autorización:** toda operación resuelve sesión y decide en servidor sujeto+recurso+acción; IDs opacos, UI, paidAt, userId declarativo o slug no son autorización. Denegar sin filtrar existencia.
- **F0-R02 Adjuntos:** GET y DELETE comprueban ownership/grant antes de acceder a BD/storage; DELETE deja estado coherente y no silencia fallo de Blob.
- **F0-R03 Upload:** definir draft ownership, expiración, MIME/tamaño, replay, callback y vínculo; no emitir credencial con userId=null como autorización. Bloquear anónimo por defecto hasta decisión.
- **F0-R04 Stateless:** contenido base64url se trata como legible/modificable; no contiene secretos/PII; demostrar que no puede seleccionar expediente, simular demo o eludir entitlement/ACL. Decidir reemplazo solo tras mapear consumidores.
- **F0-R05 Privacidad:** diagrama recepción→Blob→parser/OCR/visión→DB→PDF/logs→retención/borrado; finalidad, categorías PII, proveedores/región, controles de acceso y retención; minimizar y no loggear contenido/nombres personales. La conformidad legal de uso público se revisa antes de activar el tratamiento correspondiente.
- **F0-R06 Procedencia:** campo distingue declarado, fuente acreditativa, extracción/inferencia, derivado/estimado y no disponible; fecha/confianza cuando existan; falta nunca equivale a 0. Reusar DataFieldSource/Evidence Matrix donde cubran el campo; inferencia no sobrescribe sin revisión.
- **F0-R07 CEE y score:** no llamar CEE/certificado oficial/calificación oficial a EnergyScan; comunicar límites, fuente, método, unidad y falta de calibración. Solo técnico competente emite CEE en supuesto aplicable.
- **F0-R08 Regulación:** corregir traducciones/exportaciones con fuente, artículo, ámbito/territorio, fecha de revisión y vigencia. No decir que vivienda individual debe alcanzar E en 2033. Diferenciar metas medias residenciales 2030/2035 de umbrales no residenciales 2030/2033.
- **F0-R09 Coste/alertas:** 25/450 €/unidad y 30.000 € no se presentan como universales/estándar. Hasta calibración por campo/territorio/unidad/referencia, alerta contextual o abstención; sin precio comparable no decir caro/barato.
- **F0-R10 Salidas:** PDF, pantalla, landing, manual, SEO y locales cubiertos por matriz; mostrar orientación, incertidumbre y falta de profesional cuando aplique.
- **F0-R11 Evidencia:** gate PASS vinculado a SHA, comandos, fixture sintético hash, resultado, evidencia anonimizada y revisor. Ejecución en esta tarea: NOT_RUN.
- **F0-R12 Transferencias externas y sharing:** nada se envía a proveedor/profesional ni se comparte por defecto; consentimiento granular antes de transferencia. Revocar permiso no borra copia descargada por destinatario.

## 6. Amenazas y privacidad

| Amenaza | Activo/abuso | Control propuesto | Evidencia futura |
|---|---|---|---|
| IDOR/BOLA | Lectura/borrado cross-owner con IDs | AuthZ server-side en cada handler; owner/other/anon/admin | Matriz auth y log sin PII |
| Upload anónimo/replay | Crear Blob/asociar contenido a user null | Deny por defecto; token ligado a sesión+draft+scope+expiración y callback verificado | Status categórico y fixture sintético |
| Manipulación local_ | Alterar JSON en URL | Nunca ACL; mapear consumers y limitar a presentación | Casos alterados + entitlement |
| Exposición indirecta | PDF/CDN/Blob/log/provider leakage | ACL, expiración, no logs de payload/nombre, minimización | Revisión manual synthetic-only |
| Error extracción | OCR confunde importe/unidad/categoría | revisión humana, procedencia/confianza, no disponible; métricas F1 | Corpus futuro autorizado |
| Claim engañoso | usuario entiende CEE/2033/ahorro como obligación/garantía | copy revisado, idioma/tipo/territorio y abstención | Inventario completo |
| Fuga en piloto | PII en QA/evidencia | synthetic-first; corpus anonimizado/consentido y acceso mínimo | hash/manifiesto sin contenido |

## 7. Invariantes y Given/When/Then

1. Ninguna lectura/borrado/upload se autoriza solo por ID o URL.
2. Cada acceso se valida backend contra sujeto y recurso en esa petición.
3. Dato incompleto/desconocido nunca es cero ni garantía.
4. Fuente legal/energética visible indica alcance, fecha y estado o se omite/etiqueta pendiente.
5. Sin consentimiento explícito no se comparte documento ni lead; una descarga ajena limita retractación.

| Given | When | Then |
|---|---|---|
| Usuario A y adjunto suyo | A descarga | Permitir solo tras comprobar sesión/ownership/grant. |
| Usuario B conoce IDs de A | B invoca GET y DELETE | Denegar sin leer/eliminar ni revelar existencia. |
| Sesión ausente o falla Auth.js | POST upload | Rechazar sin token ni Blob path. |
| Payload local_ alterado contiene demo/adjuntos/pago | Se consulta/descarga | No concede ACL/demo/entitlement; salida segura o rechazo. |
| Campo falta en CEE/entrada | Se calcula score/ahorro | Informar ausente/incertidumbre; no cero ni clase CEE. |
| Visitante ES/EN/DE lee timeline | Ve 2030/2033 | No clase E residencial universal; distinguir stock y fuente/fecha. |
| Precio sin unidad/territorio/composición comparable | Budget Review alerta | No caro/barato; pedir datos o abstenerse. |

## 8. Aceptación, rechazo y DoR/DoD

**Aceptar F0 para desarrollo:** requisitos trazados; revisión de rutas attachment/upload/storage/report dentro del alcance; matriz actor×acción×objeto cubierta por pruebas pertinentes; cero acceso cruzado permitido en los casos ejecutados; hallazgos críticos/altos corregidos o mitigados antes de habilitar la ruta afectada; copy y procedencia son trazables y no inducen a creer que el producto emite CEE; privacidad/threat inventory documentados; evidencia técnica reproducible. Toni es el validador inicial de producto. Registrar N y población en casos. No se necesita piloto de usuarios ni firma de panel externo para aceptar la fase de desarrollo.

**Rechazar:** bypass de acceso, token anónimo no autorizado, PII en logs/evidencia, claim falso/no trazado, desconocido mostrado cero, PASS sin artefacto reproducible o fallo técnico relevante. Una prueba no ejecutada se registra `NOT_RUN`; una dependencia concreta que impide construir o probar de forma segura se registra `BLOCKED`. La falta de validadores externos o usuarios piloto no convierte trabajo interno en bloqueado.

**DoR:** objetivo, alcance, dependencias, fixtures y criterios de aceptación definidos; Toni resuelve decisiones de producto que afecten el comportamiento. **DoD de desarrollo:** traceability requisito→tarea→gate→evidencia, casos negativos/límite/ACL, privacidad/retención/logging y rollback evaluados, comprobaciones apropiadas ejecutadas y resultado aceptado por Toni. Revisión especializada, privacidad/legal y validación de mercado son gates de preparación pública/comercial cuando correspondan, no autorización previa de implementación.

## 9. Flujo de trabajo y decisiones operativas

- Desarrollar y hacer commits en `development`; no crear una rama independiente por fase o carpeta.
- Agrupar cambios coherentes, ejecutar el nivel mínimo seguro de QA conforme a los contratos Anclora, presentar resumen/evidencia a Toni y aceptar o corregir con él.
- Tras aceptación y verificación del lote, push a `origin/development`. Esta operación no promueve a producción.
- Cuando Toni autorice la promoción de una fase comprobada, avanzar paso a paso `development → staging → production → main`; verificar cada SHA/gate en el paso anterior antes del siguiente.
- No degradar salvaguardas técnicas. Si una capacidad no tiene base suficiente para mostrarse al público, mantenerla como borrador, estimación claramente etiquetada o feature desactivada mientras sigue el desarrollo interno.
- Las pruebas automáticas, revisión de código y evidencia reproducible cuentan como gates técnicos. Toni realiza la validación inicial de producto; no se requiere un validador humano distinto por tarea.

## 10. Decisiones abiertas

Pendientes que no bloquean desarrollo salvo donde se indica: (1) segmento y jurisdicción para piloto/contenido territorial; (2) designación de especialistas externos antes de revisión pública que requiera su competencia; (3) conservar denegación de upload anónimo como valor por defecto; (4) documentar retención/proveedores antes de habilitar tratamiento externo; (5) calibración antes de lenguaje de precisión, score sigue siendo estimativo y no CEE; (6) verificar destino DB efectivo antes de cualquier QA DB; (7) precio/paquete/reembolso se decide en F5. Toni resuelve decisiones de producto en el ciclo ordinario de desarrollo.

## 11. Fuentes

Registro con fecha de consulta en docs/energyscan-sources.md. Revisión web: 2026-10-12. Directiva (UE) 2024/1275 art. 9; Comisión EPBD/transposición y aviso 15-07-2026; RD 390/2021 consolidado y RD 659/2025 vigente desde 23-07-2026. iBRoad2EPC, PAS-E y CGATE son referencias funcionales; no demuestran exclusividad, equivalencia comercial ni precio de competidor.
