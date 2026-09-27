# Arcanista v1 — revisión e integración

Nueve atlas, 52 dibujos: seis por acción y cuatro en `hurt.png`.
Estilo/identidad: misma piel, cabello, ropa índigo/dorada y bastón que la base.
Bastón en mano izquierda, lanzamiento y defensa con la derecha. No efectos
pintados en los sprites; `arcane-fx.js` dibuja el rayo y el brillo aparte.

Se descartó la primera guardia (palma hacia atrás) y se generó la versión actual
cruzando la mano frente al pecho hacia el enemigo. Se revisaron todas las poses
en un contact sheet renderizado con los recortes y escalas del cliente.
Altura base: 470px de anatomía en idle, calibrada a 230 unidades de escena.
Las diferencias de tamaño de dibujo entre atlas se compensan uniformemente por
acción, nunca estirando cada frame. El atlas de movimiento se conserva para otros
usos, pero el ataque a distancia ya no utiliza avance ni salto de regreso.

Revisión de presentación v2: rayo anclado al cristal, no a la palma. Se extiende
entre 1300 y 1440ms, coincide con el daño y se desvanece hasta 1670ms. La mano libre
dirige el hechizo; el arma permanece en la izquierda. Ataque y recuperación desde
el sitio original, sin traslación de mundo ni elevación del sprite.

Recortes: motion separa filas en y=520; defeat separa en y=552, con máscara de
esquina para el cristal inferior en y=540. No se modificaron píxeles originales.
Todos los atlas PNG tienen alfa; los renders de revisión no muestran fondos opacos.

Pruebas: `verify.cjs`, `verify-melee-fx.cjs`, `verify-arcanist.cjs`, `characters/audit.cjs`.
Además, Chrome headless local con escritorio 1280x1000 y móvil emulado 390x844/DPR2:
selección de seis personajes, ataque/parry/rest, idioma y cambio de apariencia;
sin errores de JS ni recursos HTTP faltantes. Capturas inspeccionadas de reposo,
lanzamiento, victoria, derrota y guardia; hoja de revisión de todas las poses.
No prueba física de teléfono ni validación auditiva.

Archivos de QA locales (fuera de la web):
`output/imagegen/player-roster-v1/arcanist-contact-qa.png`,
`arcanist-browser-qa/`, `review-arcanist-browser.cjs`.
El script de revisión inyecta controles solo en respuestas de su servidor local;
ningún control de QA se publica en el cliente.
