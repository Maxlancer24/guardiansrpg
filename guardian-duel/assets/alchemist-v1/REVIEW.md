# Alquimista — revisión de incorporación

28/09/2026. Apariencia de jugador del segundo roster, no protagonista. Demo
independiente Guardian vs. Hollow. No nuevas clases, fórmulas, estados ni objetos.

## Arte y contrato

- Nueve acciones, seis poses cada una: 54 dibujos. PNG 1536×1024 RGBA.
- Idle: respiración/sway leve, frame 5 parpadeo breve. 1× en combate y selector.
- Ataque: preparación, lanzamiento derecho, seguimiento, toma otro frasco, reposo.
  Salida a 1180 ms e impacto a 1580 ms del reloj base; resto de acciones a 1,5×.
- Guardia: izquierda protege, derecha resguarda frasco; contraataque separado.
- Hurt completo en 650 ms. Rest no bebe ni consume pociones.
- Motion se conserva para otros modos pero no se usa al atacar a distancia.
- Activation-v2 y defeat-v2 corrigen cambios de mano en los borradores.
- Victory recorre las seis poses y conserva celebración completa; derrota sostiene
  la pose final. Anclajes por frame y recortes propios para motion/defeat.
- Escala anatómica: 495 px fuente, 228 unidades en escena de 1280; nunca estirada.
- Frasco, brillo, parábola y estallido son efectos de canvas separados del sprite.
  Audio y música reutilizan la biblioteca del modo. Efectos respetan toggle y
  reduced-motion; la trayectoria visible sigue comunicando el ataque sin adornos.

## Validación

- Revisión visual individual de las nueve hojas y 54 poses renderizadas con alfa
  sobre fondo verde, además de capturas del combate y lanzamiento en el bosque.
- Chrome headless desktop 1280×1000 y móvil simulado 390×844, DPR 2: selección,
  acceso directo, idle, attack/parry/rest, cambio de personaje y ES/EN.
- verify-alchemist.cjs: poses, tiempos, socket, llegada al objetivo, escala, toggles.
- verify.cjs: 96 combates simulados entre 12 packs, todos los frames de victoria.
- audit.cjs: inventario, hashes, recortes, archivos y catálogo.
- Capturas locales: output/alchemist-v1-qa/. No equivale a probar en iPhone físico.

## Alcance

Solo demo pública y catálogo de assets reutilizables. No habilita automáticamente
Alquimista en salas persistentes del bot. No se modifica DB ni se reinicia Discloud.
Pendiente siguiente personaje: Hachero.
