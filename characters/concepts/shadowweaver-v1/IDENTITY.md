# Tejedora de sombras / Shadow Weaver

- ID: shadowweaver. Apariencia de jugador, no protagonista ni clase fija.
- Diseño 5 aprobado: cabello violeta corto con broche plateado, ojos gris/lila, blusa marfil, chaleco y capa asimétrica ciruela, pantalones oscuros, botas negras con hebillas plateadas. Humana, sin armas.
- Lanza con palma izquierda hacia la derecha; mano derecha cerca del torso. Guardar esta continuidad en variantes.
- 52 dibujos: idle6, attack6, guard6, hurt4, rest6, motion6, activation6, victory6, defeat6.
- Idle a1x y acciones a1.5x. Parpadeo110ms por ciclo5.16s. Victoria recorre todas las poses antes de reposar; derrota sostiene última pose.
- Atlas RGBA originales preservados. Recortes y clips de filas en manifiesto; escala proporcional, nunca deformación.
- Fuente anatómica501px, objetivo224px en referencia1280. Escalas por acción conservan tamaño corporal; postura agachada no se reescala a altura completa.
- Normal a distancia, sin traslación ni salto de regreso. Salida1300ms e impacto1440ms del timeline; efecto de sombra y sockets separados del arte.
- Animación de activación genérica preparada. La activa real depende del equipo, no de esta apariencia.
- Demo: /guardian-duel/?hero=shadowweaver. Visor: /guardian-duel/shadowweaver-preview.html.
- Manifiesto: /guardian-duel/shadowweaver.js. Atlas/prompts/QA: /guardian-duel/assets/shadowweaver-v1/.
- QA: Chrome escritorio y móvil emulado, nueve acciones dibujadas completas, ataque/parry/descanso, resultados, ES/EN y cambio de personaje. No probado en teléfono físico.
- No modifica bot, perfiles, desbloqueos ni salas multijugador. Integración persistente pendiente por separado.
- Base de rollback de sitio:37aad33d1af8c98e58e2b4b7302eac6ad7140cc4.
