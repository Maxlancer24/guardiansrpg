# Pugilista v1 — incorporación a la demo

- ID: pugilist. ES: Pugilista / EN: Pugilist. Apariencia de jugador, no protagonista.
- Concepto: número 08 de la colección de diez. Piel morena, cabello negro corto,
  chaleco cruzado rojo sin mangas, vendas crema y nudilleras discretas, pantalón
  oscuro, faja roja y calzado de cuero. Referencia y prompts en [PROMPTS.md](PROMPTS.md).
- Nueve atlas, 52 dibujos: seis por acción excepto hurt (cuatro).
- Manifiesto: guardian-duel/pugilist.js. Misma plantilla y reglas que el resto.

## Calibración y animación

Idle: 489px de cabeza a planta, escala .67, altura final 232 unidades a escena
de 1280px. Referencias existentes: Jessie ~214, Garrick ~230, Zoe ~241.
No estiramiento horizontal; escalas uniformes por acción. Pies registrados en
idle y victoria; parpadeo breve, no repetido en cada vuelta de respiración.

Ataque: acercamiento 0–360ms; preparación 360–1235; contacto del puño derecho
a 1235; sostén y recogida hasta 1780; regreso hasta 2250. Velocidad global 1.5x.
El torso gira y sigue siendo el brazo derecho; la otra mano cubre el mentón.
Alcance medido en los nudillos (252px desde el anclaje), no una distancia genérica
que dejaría el golpe en el aire. Un único evento de daño.

Guardia: sube ambos antebrazos, respira protegido y absorbe el contacto;
no hay puñetazo en los frames de guardia. El contraataque utiliza su propia
secuencia de ataque, respetando los resultados del motor.
Rest y activación representan respiración, concentración y vuelta a guardia;
no añaden una habilidad especial ni cambios de estadísticas.

Victoria: saludo con el puño derecho, sostén y descenso pasando por la pose
intermedia, luego parpadeo; se reproduce toda la celebración en cada ciclo.
Derrota: seis fases de colapso, de pie, agachado, rodilla, sentado y de costado.
Último frame sostenido. El atlas usa frontera de filas y=625 para no cortar
las piernas de las poses superiores. En motion, la celda inferior izquierda
llega hasta x=528 para contener el pie completo sin tomar el siguiente dibujo.

## Efectos y alcance

Destello cálido corto y partículas en los nudillos, implementados en canvas,
no pintados en los sprites. El golpe sobre Hollow usa un impacto compacto en
vez de la curva de corte de una espada. Efectos desactivables y movimiento reducido.
Audio y música existentes reutilizados; no se han creado sonidos nuevos.
No cambios en bot, base de datos, equipo, pasivas, estadísticas ni daño.

## Verificación

Hoja de contacto de las nueve acciones y comparación con los otros seis Guardianes.
Chrome headless: escritorio 1280x1000 y móvil emulado 390x844/DPR2; selección,
ataque, parry, rest, cambio de personaje, español/inglés, recursos sin 404 ni
errores JavaScript. Capturas de preparación/contacto/recuperación, guardia,
activación, victoria y derrota. No prueba en teléfono físico ni validación auditiva.

Pruebas: verify.cjs (63 atlas, 59 combates de reglas y 56 simulaciones del cliente,
victorias completas/repetidas de siete personajes); verify-pugilist.cjs;
verify-melee-fx.cjs; verify-arcanist.cjs; characters/audit.cjs.
QA local: output/imagegen/player-roster-v1/pugilist-contact-qa.png y pugilist-browser-qa/.
Los controles de inspección se inyectan únicamente en el servidor local de QA.

Estado: solo demo Guardian vs. Hollow. Asignación al personaje persistente,
desbloqueos y uso en modos reales se integrarán por separado. El arma visual no
restringe las armas/activas que pueda equipar el jugador.
