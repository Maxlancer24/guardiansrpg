# Catálogo de personajes y sprites

Punto de entrada para incorporar personajes progresivamente. No cambia rutas,
sprites, partidas ni acceso de jugadores. El catálogo es de mantenimiento; el
cliente actual sigue leyendo sus manifiestos JS. Los IDs son estables y no se traducen.

## Fuentes de verdad

- `catalog.json`: identidad, nombre ES/EN, grupo y estado de incorporación.
- `inventory.generated.json`: archivo **exacto** usado por cada acción de las
  dieciocho apariencias y el protagonista Guardián, dimensiones, número de frames, secuencia, escala y SHA-256.
  Se deriva de los manifiestos ejecutados, no de nombres de carpeta ni versiones supuestas.
- `guardian-duel/<id>.js`: recortes, anclajes de pies, máscaras y tiempos activos.
- `guardian-duel/scale.js`: tamaño anatómico; `animation.js`: reproducción.
- `guardian-duel/melee-fx.js`: efectos independientes de las imágenes.
- `guardian-duel/shadow-fx.js`: hechizo de la Tejedora desde su palma, sin daño propio.
- `guardian-duel/arcane-fx.js`: carga y rayo del bastón de Arcanista, sin daño propio.
- `guardian-duel/alchemy-fx.js`: frasco parabólico y estallido cosmético de Alquimista; no añade estados ni consume objetos.
- `guardian-duel/crossbow-fx.js`: virote de Rastreadora, anclado al carril del arma.
- `guardian-duel/palettes.js`: recetas cosméticas; el selector las descubre automáticamente.
  Ver [VARIANTS.md](VARIANTS.md) para añadir paletas sin duplicar sprites ni personajes.

No editar el inventario generado a mano. Después de cambiar un pack:

```sh
node characters/audit.cjs --write
node characters/audit.cjs
node guardian-duel/verify.cjs
node guardian-duel/verify-melee-fx.cjs
node guardian-duel/verify-arcanist.cjs
node guardian-duel/verify-pugilist.cjs
node guardian-duel/verify-tracker.cjs
node guardian-duel/verify-custodian.cjs
node guardian-duel/verify-wanderer.cjs
node guardian-duel/verify-palettes.cjs
node guardian-duel/verify-guardian.cjs
node guardian-duel/verify-alchemist.cjs
node guardian-duel/verify-brisa.cjs
node guardian-duel/verify-jadewind.cjs
node guardian-duel/verify-lucien.cjs
```

La auditoría falla ante archivos ausentes, recortes fuera de imagen, secuencias
inválidas, IDs duplicados, catálogo desactualizado o cambios de imagen sin renovar
su inventario. No sustituye la revisión visual en movimiento.

## Estado actual

| Grupo | Personajes | Estado |
| --- | --- | --- |
| Apariencias de jugadores | Lancero, Exploradora, Duelista, Centinela, Vanguardia, Arcanista, Pugilista, Rastreadora, Custodio, Errante, Alquimista, Brisa, Viento de Jade, Lucien, Kaori, Viajera otoñal, Bastión del bosque, Tejedora de sombras | Nueve animaciones; disponibles en Guardian vs. Hollow; sin integración al personaje persistente |
| Conceptos pendientes del lote inicial | Ninguno | Diez apariencias del primer roster completas en la demo; Alquimista y Brisa amplían las apariencias disponibles |
| Protagonista de las quests | Guardián / Guardian (arte de Max) | No es una skin; nueve acciones, dos ataques y retrato. Especial determinada por la activa equipada del jugador |
| Protagonistas de historia | Jessie, Garrick, Zoe | Integrados en sus pruebas existentes; no son apariencias para jugadores |

Jessie, Garrick y Zoe conservan sus cargadores actuales. Sus rutas fuente están
registradas, pero **aún no tienen el inventario normalizado por acción** de los
Guardianes. Su migración es una tarea aparte; no copiar sus habilidades a las skins.
Hollow es un NPC compartido, no un personaje seleccionable del catálogo.

## Carpetas y versiones

Las dieciocho apariencias y el protagonista Guardián ya tienen manifiestos separados. Lancero es una excepción
histórica: combina `guardian-duel/assets/*.png` con `assets/lancer-refined-v1/`.
El inventario elimina la ambigüedad sin mover archivos que usa la web.
Para personajes nuevos: `guardian-duel/assets/<id>-v1/` y `guardian-duel/<id>.js`.
Cada carpeta debe conservar referencias de identidad, prompts y notas de QA.

Una corrección usa nombre nuevo (`victory-v2.png`, por ejemplo), actualiza el
manifiesto y deja el original conservado. No elegir automáticamente el archivo
con el número de versión mayor. La lista de archivos no seleccionados del
inventario NO es una lista de basura: pueden ser históricos, portadas o referencias.
No eliminarlos ni moverlos sin comprobar todos sus consumidores.

Los conceptos y renders de revisión locales están fuera del sitio, en
`../output/imagegen/player-roster-v1/` respecto de la raíz del repositorio web.
La lámina `roster-concepts-v2.png` no es un atlas utilizable en combate.

## Contrato para nuevos packs

Usar [la ficha de incorporación](CHARACTER-TEMPLATE.md). Nueve acciones:
`idle`, `attack`, `guard`, `hurt`, `rest`, `motion`, `activation`, `victory`, `defeat`.
Base actual: seis dibujos por acción salvo `hurt` (cuatro); no imponer esos números
a protagonistas ni confundir dibujos con repeticiones de la secuencia.
Rastreadora usa ocho poses de ataque para incluir la recarga. Los tiempos se definen
por acción: idle a 1× tanto en combate como en selector, demás acciones a 1,5×.

Mantener diseño, manos, arma, vestimenta y proporciones coherentes. PNG con alfa
real, sin efectos pintados sobre el sprite. Preferir celdas de 512 px para nuevas
hojas; declarar siempre sus recortes reales y máscaras si cruzan celdas.
No escalar por la caja que incluye armas/pelo/capas: usar altura anatómica y pies
anclados, sin estirar fotogramas. Referencias aproximadas a 1280 unidades:
Jessie 214 px, Garrick 230 px, Zoe 241 px (cabeza a planta, no pelo).

El arma visible describe la animación, no limita equipo ni define clase.
Daño, pasivas, consumibles y activas pertenecen al sistema de combate; las
animaciones solo representan eventos. Una apariencia nueva no se habilita en
producción por completar sus dibujos o por marcar una casilla de este catálogo.

## Incorporación progresiva

1. Asignar ID estable y aprobar identidad; registrar como `concept-only`.
2. Crear las nueve acciones en su carpeta; guardar prompts y revisión.
3. Definir recortes, anclajes, escala, tiempos y puntos del arma/proyectil.
4. Probar todas las acciones, parry sin contraataque anticipado, victoria completa,
   derrota, cambio de personaje y continuidad del arma; revisar móvil y escritorio.
5. Integrar solo en la demo, actualizar catálogo/inventario y pasar las pruebas.
   `demo-ready` significa disponible en prueba, no QA de dispositivos garantizada.
6. Para el juego real, aprobar por separado desbloqueo/asignación, persistencia,
   autorización del servidor, fallback y compatibilidad con los modos. No cambiar
   `liveGame` hasta implementar y verificar esa integración.
7. Publicar una versión acotada; conservar el manifiesto/commit anterior para rollback.
Kaori: pack de nueve acciones en `guardian-duel/kaori.js`; galería de revisión en `guardian-duel/kaori-preview.html`. Solo demo, no habilitada aún en salas del bot.
