# EnergyScan — Registro de decisiones abiertas

Registro operativo del desarrollo de EnergyScan. Toni valida inicialmente el producto junto con el agente y decide la aceptación de cada fase. Las validaciones externas se reservan para gates de preparación pública, afirmaciones reguladas o comprobaciones que requieran competencia/corpus especializado; no son condición para desarrollar funcionalidades internas.

| ID | Pregunta | Opciones consideradas | Recomendación provisional | Owner | Estado | Efecto |
|---|---|---|---|---|---|---|
| ADR-ES-001 | Segmento inicial | Propietario / comunidad / profesional | Elegir segmento provisional con criterio de producto; contrastarlo en piloto cuando sea oportuno | Toni | ABIERTA, no bloquea prototipo | F3/onboarding |
| ADR-ES-002 | Jurisdicción piloto | CCAA/municipio por elegir | Desarrollo con fuentes primarias versionadas y scope explícito; no presentar como asesoramiento legal | Toni | ABIERTA, bloquea solo contenido territorial específico sin fuente | ES-4 |
| ADR-ES-003 | Draft anónimo/local_ | Denegar upload / permitir borrador limitado firmado | Denegar Blob anónimo; ID stateless no autoriza | Toni | DECISIÓN PROVISIONAL: denegar | ES-0.1 |
| ADR-ES-004 | Revisión técnica externa | Técnico competente/equipo | Toni acepta inicialmente la funcionalidad interna usando criterios explícitos y fixtures; obtener revisión competente antes de presentar planes/resultados como recomendación profesional | Toni | POSTERIOR para uso público que lo requiera | F3/lanzamiento |
| ADR-ES-005 | Legal y privacidad externa | Asesoría/DPO/responsable | Construir controles de minimización y transparencia durante desarrollo; revisar externamente antes de activar tratamiento/comunicación pública que dependa de dictamen legal | Toni | POSTERIOR, no bloquea desarrollo interno | Lanzamiento/claims |
| ADR-ES-006 | Retención/proveedores OCR/IA | Mantener según inventario/minimizar | Usar fixtures sintéticos durante desarrollo; no enviar documentos reales a proveedores hasta documentar finalidad, configuración y controles necesarios | Toni | PENDIENTE | ES-0.2 |
| ADR-ES-007 | CEE/score | Heurística orientativa/método validado | Etiquetar estimación y abstener hasta calibración; nunca CEE | Toni en desarrollo; especialista antes de presentar resultados como profesionales | POSTERIOR | ES-0.3 |
| ADR-ES-008 | Umbrales presupuesto | Universal/contextual y abstención/calibración | Neutral si falta unidad/referencia; evaluar F1 | Toni en desarrollo; especialista antes de presentar resultados como profesionales | POSTERIOR | ES-0.3/F1 |
| ADR-ES-009 | Precio/paquete/reembolso | Opciones por investigar | No decidir ni alterar catálogo en F0 | Toni | PENDIENTE | Bloquea F5 |
| ADR-ES-010 | Target efectivo para QA DB futura | Neon contractual/fallback temporal condicionado | Verificar sin revelar credenciales; Docker solo con indisponibilidad nueva confirmada | DevOps/Toni | PENDIENTE | Bloquea pruebas DB |
| ADR-ES-011 | Migración de schema | Reusar/no migrar hasta brecha demostrada/grants versionados | Spec separada si necesaria | Producto/arquitectura | PENDIENTE | Controla scope |
| ADR-ES-012 | Evidencia y piloto | Sintético/corpus autorizado anonimizado | Usar fixtures sintéticos para desarrollo; predefinir denominadores si se hace piloto, sin exigirlo para implementar | Toni | ACTIVO: sintético primero | ES-0.4; validación de mercado posterior |

## Operación de fases

- Toni es el validador inicial de producto y acepta/rechaza cada entrega con el agente; no se exige un panel de validadores ni entrevistas previas a implementar.
- Un gate puede quedar bloqueado solo cuando falte una decisión, permiso, dato o control técnico realmente necesario para construir/operar de forma segura. La ausencia de un usuario piloto o de un especialista externo no bloquea desarrollo interno.
- Seguridad, privacidad por diseño, control de acceso, exactitud de afirmaciones y criterios automáticos no se rebajan. Si una función no puede exponerse de forma segura o veraz, se implementa detrás de una limitación/flag o se difiere su activación pública.
- La aceptación de Toni prueba aceptación de producto, no certifica cumplimiento legal, validación de ingeniería energética ni resultados de mercado.
- Desarrollo y commits en `development`. Tras aceptación explícita de una fase, la promoción se solicita/ejecuta por la secuencia gobernada `development → staging → production → main`, con verificación independiente de cada paso.

Este registro describe decisiones y criterios de desarrollo; no afirma que las funcionalidades de la aplicación ya estén implementadas. Registrar bloqueos solo cuando falte una dependencia técnica o de seguridad concreta y continuar el trabajo independiente.
