# Arcanista — ataque con bastón dirigido, v2

Modo: herramienta integrada image_gen (edición identity-preserve); fondo transparente.
Asset activo: [attack-v2.png](attack-v2.png). El original attack.png se conserva.
Referencias: attack.png (estilo/secuencia anterior) y characters/concepts/arcanist-v1/base-v1.png (identidad).

## Prompt final

Use case: identity-preserve. Asset: replacement 2D RPG attack animation atlas for Arcanist. Input 1 is the existing attack sheet to redesign; input 2 is the exact character/model reference. Keep her dark brown skin, wavy silver-lavender bob hair, face, mature tall long-legged proportions, indigo gold-trim coat and short cape, charcoal vest, cream collar, grey pants, brown gloves, belt pouches, boots, and single long wooden staff with twisted bronze crown and blue crystal. Change the attack choreography: she physically aims the STAFF at the enemy on screen RIGHT, not an outstretched empty hand. Six full-body frames on a strict 3 columns by 2 rows grid, reading order. Transparent background, NO glow, NO beam, NO effects, NO shadows, NO text/grid lines. Equal-size cells and consistent body size and fixed boot positions, generous empty gutters, nothing crosses cells. Frame 1: from relaxed stance she brings free right hand toward shaft, left hand retains its grip, staff tilts a little right. Frame 2: anticipatory pose with staff diagonally aimed upper-right, both hands gripping shaft naturally, preparing to lower it. Frame 3: FIRING POSE, staff horizontal aimed directly screen-right at enemy chest height, blue crystal clearly at far right and butt at left behind hip, two hands naturally gripping the same continuous shaft, knees slightly flexed, focused face. Frame 4: sustained firing, same horizontal staff angle and same crystal position, tiny recoil in shoulders, cloth responds. Frame 5: recover, smoothly lift staff to diagonal like frame 2, relax shoulders. Frame 6: near original idle with staff upright in left hand and right hand relaxing. All six are the SAME woman, same clothing, same weapon length/shape, no swapped hands. Boots stay planted, no step or jump. The horizontal staff should fit completely inside each cell, no cropping. Clean polished anime cel shading matching reference. Output wide 1536x1024 RGBA with genuine fully transparent empty pixels, not a dark backdrop or painted checkerboard.

## Integración y revisión

Seis poses: preparación, inclinación, apuntado/disparo, sostén, recuperación diagonal y regreso a reposo. La mano izquierda conserva el agarre delantero; la derecha sostiene la parte trasera al apuntar. Sin salto ni desplazamiento del actor. El rayo es un efecto de canvas independiente.

Recortes explícitos: fila superior hasta y=500; la tercera celda comienza en x=992 para incluir toda la capa. Fila inferior desde y=500; primera celda hasta x=544 para incluir el cristal. No edición de píxeles, ni escalado no uniforme. Escala de acción .69 para conservar la altura anatómica del idle; el descenso del torso en disparo es la flexión de rodillas.

Cristales registrados por fotograma. Disparo a 1300ms, impacto a 1440ms y fin del rayo a 1670ms; poses 2 y 3 mantienen el bastón dirigido al enemigo durante todo el rayo. Punto de impacto elevado al torso superior para continuar la dirección del bastón. Daño, reglas y sonidos sin cambios.

Revisión: hoja de contacto con todos los recortes, capturas de preparación, disparo, sostén y recuperación en Chrome de escritorio y móvil emulado. Pruebas de coordenadas, temporización, combates y catálogo. No prueba física de teléfono ni nueva validación auditiva.
