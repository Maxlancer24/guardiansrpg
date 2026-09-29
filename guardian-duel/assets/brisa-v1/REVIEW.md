# Brisa v1 — integración de la apariencia

## Alcance

Doce apariencias de jugador en Guardian vs. Hollow, además del protagonista Guardián por separado. Brisa usa las mismas reglas de la demo, efectos de golpe/parry/focus, audio y música. No cambia el bot, la base de datos, personajes persistentes o salas multijugador.

Nueve atlas / 52 dibujos: idle 6, ataque 6, guardia 6, daño 4, descanso 6, desplazamiento 6, activación 6, victoria 6, derrota 6. Solo se publican los PNG seleccionados; no se recalcula ni modifica su alfa.

## Reproducción

- Idle aprobado a 1× en selector y combate; usa su propio parpadeo, sin el parpadeo adicional del reproductor genérico.
- Las demás acciones usan el reloj de combate a 1.5×. 492 px de altura anatómica fuente → 228 unidades a ancho 1280; escala uniforme y pies registrados.
- Ataque: avance compartido de 360 ms y contacto de espada a 875 ms de su clip, es decir 1235 ms del evento. Recuperación completa antes de regresar. El daño se resuelve únicamente en el motor existente.
- Estela de espada verde claro mediante el sistema procedural compartido, con anclajes medidos en la hoja. Sin sprites de efectos nuevos ni sonidos duplicados.
- Guardia mantiene preparación y bloqueo. El contraataque sigue siendo una acción separada del resultado de las reglas.
- Victoria seleccionada: `victory-v2-clean.png`, sonrisa, saludo de mano izquierda y espada en la derecha; se reproducen los seis dibujos antes de la pausa/repetición.
- Recortes y máscaras especiales de activación preservados. No sustituir por divisiones automáticas de cuadrícula.
- Activación es representación cosmética. Esta demo sin perfil no ofrece una habilidad de protagonista ni inventa una activa para Brisa.

## Comprobaciones

`verify-brisa.cjs`: 52 dibujos, archivos RGBA, recortes, reloj de impacto, victoria completa, final de derrota, altura responsive y anclajes del efecto.

`verify.cjs`: 104 combates simulados con el cliente de producción en 13 packs, incluida Brisa; victoria completa, cambio de personaje, idiomas y tamaños de canvas. `verify-melee-fx.cjs`: nueve perfiles de efectos.

Revisión Chrome con viewport desktop 1280×1000 y móvil emulado 390×844: galería de nueve acciones, combate real de demo con ataque/parry/descanso, final de partida, selector, ES/EN y cambio al Lancero. No equivale a una prueba en un móvil físico. Los sonidos existentes se reutilizan; no se diseñó ni evaluó un audio nuevo.

## Fuentes

Arte generado con image_gen integrado. `prompts.json` conserva los prompts originales; `attack-correction-prompt.md` y `victory-v2-*-prompt.md` documentan los refinamientos. Los PNG de trabajo y versiones descartadas se conservan en el proyecto local, no en este pack publicado.

El manifiesto de producción adapta tiempos al motor existente, manteniendo los dibujos aprobados. Para revertir esta publicación, usar el commit web anterior `ea34bab`; no tocar el bot ni su base de datos.
