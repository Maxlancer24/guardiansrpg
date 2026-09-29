# Lucien — base individual v1

> Actualización: personaje completo e integrado en la prueba separada de skins. Las secciones siguientes conservan el historial del diseño inicial y del idle. Estado vigente, animaciones y QA: [QA del pack](../../../guardian-duel/assets/lucien-v1/QA.md). Manifiesto: `guardian-duel/lucien.js`. No habilitado aún como apariencia persistente del bot.

- ID reservado: `lucien`. Apariencia de jugador; no protagonista ni habilidad exclusiva.
- Estado: diseño base individual para revisión. La selección del concepto 3 está aprobada; esta nueva base todavía no tiene aprobación específica.
- Referencia seleccionada: `concept-reference.png`, panel derecho. Base candidata: `base-v1.png`.
- Conserva rostro adulto sereno, piel pálida, ojos grises, cabello largo plateado parcialmente recogido, cuerpo esbelto y piernas largas proporcionadas.
- Abrigo azul petróleo con colas y forro burdeos, túnica negra de cuello alto, pantalón gris carbón, botas negras, cierres y ornamentación plateados.
- Una hombrera en el hombro anatómico DERECHO. Mano derecha enguantada; mano izquierda libre con dedos visibles como en la referencia.
- Una espada recta plateada, guarda alada y gema turquesa; siempre empuñada con la mano anatómica DERECHA. No intercambiar manos entre frames.
- Guardia baja, pies apoyados, postura moderadamente escalonada. No convertir cada acción en una nueva ilustración de distintas proporciones.
- Normalizar altura anatómica cabeza-talón y anclajes de pies contra los protagonistas; no escalar por los extremos de la espada o el cabello.
- Ataque propuesto: anticipación con giro del torso, paso corto y corte lateral controlado, seguido de recuperación. Propuesta, todavía no generada. Efecto de hoja separado del sprite.
- Idle propuesto: respiración leve, cabello/colas de abrigo y parpadeo breve; pies fijos. Respetar idle 1x y acciones 1.5x del template.
- Pendientes: attack, guard, hurt, rest, motion, activation, victory y defeat. Guard no debe incluir el contraataque. Activation solo representa la activa equipada.
- Revisión realizada 2026-09-29: imagen estática, identidad, mano armada, continuidad visible del arma, cuerpo completo y márgenes. PNG RGBA 1024×1536; alpha 0–254; 925781 píxeles transparentes; límites de contenido (31,24)-(1007,1506). Alpha original preservado sin eliminación de fondo por código.
- No se ha revisado animación, escala en combate, móvil ni transiciones. No se añadió a catálogos públicos, manifest de combate o bot. No publicado.
- Generado con la herramienta integrada ImageGen; prompt completo en `PROMPTS.md`.

## Idle v2 — orientación corregida, 2026-09-29

- Activo en la vista previa local: `../../../guardian-duel/assets/lucien-v1/idle-facing-v2.png`, seis dibujos RGBA. `idle-v1.png` se conserva como borrador rechazado por mirar al frente; no se reproduce.
- Cabeza de perfil hacia la DERECHA, mirada al enemigo, torso en tres cuartos. Mantener esta orientación en futuros sprites de combate. La referencia ilustrada frontal no impone la pose del juego.
- Mano DERECHA conserva espada y guante, izquierda libre. La hoja ahora apunta diagonalmente hacia delante en guardia baja, coherente con la nueva orientación.
- Movimiento dibujado de cabello/abrigo y respiración; un parpadeo de 110 ms por ciclo. Reproducción idle 1x, sin oscilación global programada.
- Altura fuente 502 px, objetivo 230 a cámara de referencia. Escala uniforme por dibujo entre .998 y 1.004 para compensar variaciones menores; nunca estirar ejes. Anclajes por centros de botas y planta del pie, no por extremos del arma.
- Cortes medidos: primera fila 517 px, segunda 507; ninguna bota ni punta de espada se corta. Se conserva íntegro el alpha generado, sin retoque de píxeles.
- Revisión: seis dibujos sobre fondo neutro y comparación en bosque junto a Jessie, Guardián y Viento de Jade. Capturas en `output/lucien-idle-review/` del workspace raíz.
- Chromium escritorio 1280×1000 y móvil emulado 390×844: carga, seis frames alcanzables, pausa/reproducción, ES/EN y ausencia de desbordamiento comprobados. Test de alpha, márgenes y escala correcto. No prueba en teléfono físico ni combate completo.
- `preview.html` abre la previsualización local animada. Todavía sin publicación ni alta en roster jugable.
- Prompt de corrección: `IDLE-FACING-V2-PROMPT.md`, herramienta integrada ImageGen.
