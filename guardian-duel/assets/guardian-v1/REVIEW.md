# Guardián / Guardian — revisión e integración

Identidad: Max, el avatar del usuario en las ilustraciones de quests. Referencia
canónica `assets/story_narrative/story_45_what_we_carry.png` del repositorio del bot.
ID estable `guardian`; no cambiar nombres de cuentas de Discord ni diálogos de quests.

## Entrega

- Nueve atlas RGBA originales, 54 poses: idle, ataque, guardia/parry, recibir daño,
  descanso, desplazamiento/retorno, activación, victoria y derrota.
- Retrato propio para la portada de habilidades; modelo base e invariantes en
  `characters/concepts/guardian-v1/`.
- Idle a 1× con parpadeo; acciones a 1,5× mediante el reproductor compartido.
- Victoria reproduce las seis poses antes del reposo; entrada de 2960 ms a velocidad
  base. Espada siempre en la mano derecha, parry separado de contraataque.
- Slash anclado a la hoja en frames de contacto; utiliza audio, efectos, cámara,
  habilidades y pasivas existentes. No hay habilidad innata inventada.

## Correcciones visuales

Se eliminaron mediante la herramienta de imágenes la empuñadura extra en la vaina,
una hoja duplicada en el desplazamiento y el fondo residual de motion. Se corrigió
la espada acortada de activación. `motion-v2.png` es el atlas activo; borradores
permanecen en el proyecto pero no en el paquete web.

Recortes medidos individualmente en ataque y desplazamiento; la división vertical
de derrota es y=575 para no cortar la espada al arrodillarse. Anclajes de idle y
victoria registrados por los pies. Escalado uniforme, sin deformar ancho/alto.

## Comprobación local

- Inspección visual de las 54 poses sobre fondo contrastante y suelo de referencia.
- Validación de dimensiones, transparencia RGBA, recortes, anclajes, duración,
  fin de victoria y derrota, alcance y momento de contacto de espada.
- Chrome aislado sin red: selector, ataque, parry, descanso y cambio ES/EN en
  1280×1000 y 390×844; sin recursos ausentes ni errores JavaScript.
- Salas sincronizadas simuladas en escritorio, móvil y horizontal, 1v1 y 2v2.
  No sustituye una prueba con jugadores reales ni una revisión en iPhone físico.
- Capturas: `output/guardian-character-qa/` en el repositorio del bot.

## Publicación pendiente

Publicar el parche web primero; después instalar el parche del bot sin salas
activas, conservando DB y variables. No se ha modificado la DB ni desplegado.
Prueba independiente: `/guardian-duel/`. Galería: `/guardian-duel/guardian-preview.html`.
En salas Guardian/Perfil, elegir el botón Guardián; actor de combate y apariencia
siguen siendo IDs separados. Jessie, Garrick y Zoe no cambian.
## Revisión 2 — protagonista y ataques alternados

Guardián es un protagonista, NO una skin. Su especial procede de la habilidad
activa equipada por el jugador. Catálogo y registro del bot separan los diez
GUARDIANS cosméticos de STORY_PROTAGONISTS; COMBAT_VISUALS es solo el conjunto
que puede representar el renderizador compartido, no una clasificación narrativa.

- idle-v2.png limpia el residuo de alfa en las axilas. El fotograma físico 4
  contiene el parpadeo y se remapea al índice lógico 5, conservando el contrato.
- Guardia reducida de escala .67 a .64 (4,48%), sin cambiar anclajes de pies.
- attack-b.png agrega seis poses para un corte ascendente. Sesenta poses totales.
- Ataques normales A/B/A por personaje; parry/rest/counter no consumen la variante.
  Cada ataque sigue generando un solo impacto, a 1235 ms en el reloj base.
- El segundo slash usa sus propios puntos de hoja, alcance y sentido ascendente.
  Recortes de atlas evitan la hoja vecina encima de la fila inferior.
- Entrada del protagonista desde /duel/ y /es/duel/ a
  /guardian-duel/?hero=guardian. Prueba gráfica sin perfil: no inventa una especial.
- Validación local: transparencia, clasificación, escala, ambas secuencias,
  contacto de hoja, replay de red A/B, 75 pruebas Python del combate y dos de arte;
  revisión de 60 poses y Chrome desktop/móvil con ataque/parry/rest y entrada desde
  el selector de protagonistas. Capturas en output/guardian-character-v2-qa/.

La publicación web no actualiza el Site de Discloud. El parche del adaptador de
red se instala aparte; no contiene DB, no cambia stats ni fórmulas de combate.
