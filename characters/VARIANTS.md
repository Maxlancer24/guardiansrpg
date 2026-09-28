# Variantes cosméticas reutilizables

## Entrega inicial

Lancero Carmesí: túnica carmesí, fajín marfil, piel/pelo/cuero/metal conservados.
Se aplica a las nueve animaciones y 52 poses del Lancero, incluyendo selector,
ataque, guardia, daño, descanso, desplazamiento, activación, victoria y derrota.
No es otro personaje: sigue usando el ID `lancer` y la variante `crimson`.
Las reglas, stats, recortes, máscaras, escalas, sonidos, efectos y tiempos son los
mismos del original. Idle continúa a 1×; acciones a 1,5×.

## Añadir otra paleta a un personaje preparado

1. En `guardian-duel/palettes.js`, añadir una entrada en `profiles.lancer.variants`.
2. Darle ID estable, nombre ES/EN, dos colores de muestra y una rampa de tres
   colores por material: sombra, medio tono y luz. Ejemplo de estructura:

   ```js
   crimson: {
     es: 'Carmesí', en: 'Crimson',
     swatches: ['#842f40', '#e6d4af'],
     materials: {
       cloth: ['#160f18', '#842f40', '#d87880'],
       sash: ['#241d20', '#b5a183', '#fff0cd']
     }
   }
   ```

3. Incrementar `profile.version` y el `?v=` de `palettes.js` en el HTML publicado.
4. Revisar todas las poses y el movimiento, ejecutar las pruebas, actualizar
   inventario y publicar. No hay que editar el selector ni el renderer por variante.

El selector crea sus controles automáticamente a partir de las recetas. `Original`
siempre está disponible. Cambiar de paleta actualiza el idle sin iniciar una partida.
La elección se mantiene al repetir/cambiar de personaje durante esa visita, pero
no se guarda todavía en una cuenta, base de datos ni navegador.

## Preparar otro de los diez personajes

Añadir un perfil bajo su ID actual. Separar materiales por rango de tono,
saturación y luminosidad; ajustar las zonas permitidas cuando la piel, boca,
arma o efectos compartan colores. `region` es un rectángulo normalizado al recorte
del frame; `regions[action][frame]` permite excepciones para poses giradas o caídas.
El Lancero incluye excepciones para el salto y la derrota. No copiar sus selectores
de color ciegamente a otra apariencia.

Ese trabajo inicial requiere revisión visual de cada pose. Después, todas las
paletas de ese personaje reutilizan las zonas revisadas. Esta herramienta cambia
colores, no añade adornos, cambia armas ni redibuja ropa: esas variantes requieren
arte adicional y revisión de consistencia.

## Rendimiento y reutilización en otros modos

`GuardianPaletteEngine.createCache(profiles)` ofrece:

- `prepare(id, variant, action, sourceImage, actionPack)`: prepara una textura
  derivada una vez; procesa por bloques para ceder tiempo al navegador.
- `get(id, variant, action, sourceImage)`: devuelve esa textura en el dibujo habitual.
  No recolorea durante un fotograma. Original devuelve la imagen original.
- `stats()`: número de preparaciones, entradas y presupuesto de píxeles.

El cliente espera todas las texturas antes de entrar al combate. Si falla una
preparación, no inicia una partida con animaciones parcialmente cambiadas; se puede
reintentar o seleccionar Original. La caché LRU está limitada a 18 millones de
píxeles derivados (~69 MiB RGBA, además de los recursos originales y memoria del
navegador). Las nueve texturas Carmesí ocupan unos 54 MiB. Solo se crean cuando se
usan, no para todos los personajes ni todas las variantes. Un modo multijugador
deberá adaptar el presupuesto/preparación a los personajes simultáneos, no asumir
que esta caché de duelo basta para un 5v5.

Los PNG fuente y su transparencia no se editan. Las texturas se generan en el
navegador: no añaden sprites descargables, llamadas de recoloreado al bot ni trabajo
por turno en el servidor. En otro modo se pueden compartir `appearanceId` y
`variantId` como datos cosméticos sin modificar las reglas de combate. La demo no
implementa esa sincronización ni la persistencia de cosméticos.

## Comprobaciones

```sh
node guardian-duel/verify-palettes.cjs
node guardian-duel/verify.cjs
node guardian-duel/verify-portraits.cjs
node guardian-duel/verify-idle-speed.cjs
node guardian-duel/verify-melee-fx.cjs
node characters/audit.cjs --write
node characters/audit.cjs
```

Además revisar selector y combate ES/EN, escritorio/móvil, movimiento, todas las
poses (incluyendo victoria completa), cambio a Original, carga fallida y movimiento
reducido. El inventario registra recetas, versión y hashes del motor, sin cambiar
los hashes de los atlas. Los tests automáticos no reemplazan esta revisión visual.
