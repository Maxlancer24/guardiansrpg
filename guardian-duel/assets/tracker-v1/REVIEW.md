# Rastreadora / Tracker — incorporación a demo

Fecha: 2026-09-27. ID estable: `tracker`, concepto 07; apariencia de jugador,
no protagonista. Nueve acciones, 54 poses. Tras incorporarla quedan Errante y
Custodio: ocho de las diez apariencias están disponibles en Guardian vs. Hollow.

## Identidad y versiones

Referencia: `characters/concepts/tracker-v1/base-v1.png`. Trenza cobriza, capa
azul grisácea, chaleco de cuero, túnica oliva, guantes y botas marrones, ballesta.
Mano derecha en disparador/culata; izquierda bajo el carril al apuntar, libre al
recargar, cubrirse o saludar. Sin intercambio de manos. Estilo anime cel-shaded.

Generación integrada de imágenes; prompts completos en `PROMPTS.md`. Se conservan
los PNG RGBA sin modificar píxeles por código. Guardia inicial descartada por mano
extra bajo el arma: `guard-v2.png` corrige ese defecto. `idle-v2.png` hace explícito
el parpadeo del frame 5; `idle.png` queda conservado como versión anterior.

## Animaciones y sincronización

| Acción | Poses | Revisión |
| --- | --- | --- |
| idle | 6 | Respiración, capa/trenza sutil, blink breve; 1× |
| attack | 8 | Apuntar, disparar, retroceso, tensar/recargar, volver |
| guard | 6 | Preparación y bloqueo, sin contraataque prematuro |
| hurt | 4 | Flinch, retroceso, recuperar equilibrio |
| rest | 6 | Respiración corta, ojos cerrados, retorno |
| motion | 6 | Aproximación/regreso disponibles para reutilización; no usados al disparar |
| activation | 6 | Concentración y arma lista; aura independiente |
| victory | 6 | Saludo con izquierda, retorno completo y repetición |
| defeat | 6 | Rodillas, caída lateral, cuerpo y ballesta apoyados |

Ataque de 2600 ms en reloj de animación: preparación 0–360, ocho poses 360–2180,
retorno idle 2180–2600. Salida del virote 1300; único evento de daño 1440.
`crossbow-fx.js` usa el punto de salida [1290,79] del frame 2 en coordenadas del
atlas. Proyectil y estela son efectos separados, no nuevos golpes ni reglas.
Sonidos/música reutilizados del combate existente; no se crean pistas nuevas.
Idle 1× en selector/combate; resto 1,5×. Los tiempos indicados son del reloj 1,5×.

## Registro y escala

Altura anatómica de referencia 500 px; target 228 unidades a escena de 1280,
dentro del rango Jessie/Garrick/Zoe. Factores uniformes por atlas compensan sus
resoluciones distintas; no se estira cada pose. Ataque 1774×887: cortes enteros
explícitos para cuatro columnas. Resto 1536×1024 salvo hurt 1254×1254.
Idle corta filas en y=515, derrota en y=575; hurt usa límites independientes por
columna para no incluir pelo/pies de otro sprite. Pies y posición del arma medidos.

## QA

- Inspección visual de las nueve hojas, manos/arma/ropa y contacto a escala real.
- Comparación de altura con las otras siete apariencias.
- `verify.cjs`: 72 atlas, 59 combates de reglas con semillas, 64 combates completos
  de cliente; todas las poses de victoria de los ocho personajes se reproducen.
- `verify-tracker.cjs`: 54 poses, anclajes, recarga completa, socket y timing del
  virote, accesibilidad, efectos desactivados y escala móvil/escritorio.
- `verify-idle-speed.cjs`, `verify-portraits.cjs`: idle 1×, otras acciones 1,5×,
  pausa de selector fuera de pantalla y movimiento reducido.
- Regresiones de Arcanista, Pugilista y efectos cuerpo a cuerpo conservadas.
- Chrome headless: escritorio 1280×1000 y móvil emulado 390×844/DPR2. Selección,
  ataque/parry/rest, ES/EN y cambio de personaje; sin errores JS/HTTP ni overflow.
- Capturas de idle, disparo/recarga, guardia/contacto, descanso, focus, victoria y
  derrota revisadas. Selector probado con los ocho idle y pausa/reanudación.

Pruebas de móvil emulado, no dispositivo físico iOS/Android. Audio reutilizado,
sin prueba auditiva nueva. No integración persistente, equipamiento, desbloqueos,
habilidades nuevas ni cambios al bot. Publicación limitada a la demo separada.
Rollback: commit anterior `7d50c70`; manifiesto/archivos versionados preservados.
