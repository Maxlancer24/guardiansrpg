# Custodio / Custodian v1 — incorporación a demo

Actualización de consistencia: los atlas activos fueron sustituidos por versiones
de guantes uniformes y mangos corregidos. Véase `CONSISTENCY-V2.md`; las notas
de incorporación siguientes describen la revisión original y se conservan como historial.

Fecha: 2026-09-27. ID `custodian`, concepto 10, apariencia de jugador.
Nueve atlas y 52 poses. Con Custodio hay nueve de diez diseños jugables;
Errante queda pendiente. No es un protagonista ni una nueva clase/habilidad.

## Identidad y archivos

Referencia: `characters/concepts/custodian-v1/base-v1.png`. Hombre maduro,
cabello/barba grises, piel clara cálida, abrigo acolchado oliva con bordes dorados,
hombreras de bronce, correas/cinturones marrones, pantalón oscuro, botas y guantes.
Un martillo de guerra: cabeza rectangular de acero con motivos dorados, mango
recto de madera y remates de latón. La mano derecha mantiene el arma; la izquierda
asiste el golpe/bloqueo o realiza los gestos. Revisión visual de todos los atlas.

Imágenes generadas con la herramienta integrada; prompts en `PROMPTS.md`.
Se conservan PNG RGBA originales; ningún recorte/retoque destructivo de píxeles.
`guard-v2.png` corrige el martillo invertido al iniciar guardia. `defeat-v2.png`
corrige la orientación del cuerpo en la pose de caída penúltima. No se publican
las variantes descartadas, que permanecen en el historial de generación.

| Acción | Poses | Contenido |
| --- | --- | --- |
| idle | 6 | Respiración discreta y blink; pies/martillo apoyados |
| attack | 6 | Preparación, alzada, golpe diagonal, continuación y recuperación |
| guard | 6 | Cubrirse con el mango, absorber impacto y sostener guardia |
| hurt | 4 | Flinch, retroceso, equilibrio y retorno |
| rest | 6 | Respiración y mano al pecho, sin efectos pintados |
| motion | 6 | Aproximación, paso, apoyo, retirada, salto corto y aterrizaje |
| activation | 6 | Concentración; aura independiente del personaje |
| victory | 6 | Saludo al pecho, bajar brazo y blink; martillo siempre apoyado |
| defeat | 6 | Fatiga, rodillas, caída lateral y pose final sostenida |

## Registro y tiempos

Altura anatómica idle: 494 px; escala .67; objetivo 235 unidades en escena de
1280, comparable a Vanguardia y dentro del rango de protagonistas. Cada atlas
tiene escala uniforme; no se estira cada fotograma. Todos 1536×1024 salvo hurt
1254×1254. Pies medidos individualmente para idle y victoria.
Ataque usa rectángulos/máscaras explícitos: el martillo alzado de recuperación
entra en el hueco entre botas de la fila superior. Ninguna pose adyacente se
incluye en el recorte renderizado. Derrota separa filas en y=575.

Ataque: aproximación 0–360 ms, seis poses 360–1780, regreso 1780–2250.
Impacto único a 1235 ms, pose 2; alcance medido 321 píxeles de fuente desde anclaje
hasta cara del martillo. Estela ámbar y destello siguen la cabeza del martillo en
poses 2/3; el golpe usa destello compacto en lugar del corte de espada del resto.
No añade daño, ataques, stats ni especiales. Audio/música reutilizados.
Idle 1× en combate y selector; demás acciones y reloj de daño 1,5×. Tiempos
anteriores expresados en el reloj de animación, no en segundos reales.

## Comprobaciones

- Hoja de contacto con las 52 poses y comparación de altura de nueve personajes.
- `verify-custodian.cjs`: poses, anclajes, victoria, derrota, alcance y contacto
  exacto del martillo, coordenadas de efecto en escritorio/móvil.
- `verify.cjs`: 81 atlas activos, 59 combates de reglas con semillas y 72 combates
  completos del cliente; victoria completa/repetida para las nueve apariencias.
- `verify-melee-fx.cjs`: seis efectos de arma, registro, accesibilidad y aislamiento.
- `verify-idle-speed.cjs` y `verify-portraits.cjs`: velocidades y selector.
- Regresión de Rastreadora, Arcanista y Pugilista sin cambios en reglas.
- Chrome headless 1280×1000 y móvil emulado 390×844/DPR2: selección, atacar,
  parry/rest, cambio de apariencia, ES/EN; sin errores JS/HTTP ni overflow.
- Capturas de ataque, guardia/contacto, victoria, derrota y resto de acciones;
  selector con nueve idle, pausa fuera de pantalla y movimiento reducido.

No prueba física en iOS/Android ni nueva prueba auditiva. No persistencia,
desbloqueos, equipo, cambios al bot ni integración con salas multijugador.
Rollback: commit anterior `3230349`; implementación limitada a Guardian vs. Hollow.
