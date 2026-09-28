# Errante / Wanderer — pack v1
Fecha: 2026-09-27. ID estable `wanderer`, concepto 09, apariencia de jugador.
Completa el lote inicial de diez apariencias en Guardian vs. Hollow.

## Identidad
Referencia: `characters/concepts/wanderer-v1/base-v1.png`.
Cabello negro hasta la mandíbula, piel oliva clara, bufanda turquesa,
túnica marfil, cuero marrón y guantes completos carbón. Sable curvo de acero,
guardamano dorado, siempre en mano derecha. Mano izquierda libre.
No es protagonista, clase ni habilidad nueva.

## Acciones
52 poses en nueve atlas: idle, attack, guard, rest, motion, activation,
victory y defeat (seis cada una); hurt (cuatro).
Idle respira y parpadea; ataque anticipa, corta y recupera; guardia bloquea
sin contraataque anticipado; movimiento incluye dash, retirada y salto corto.
Victoria ajusta la bufanda y vuelve por la pose intermedia antes del parpadeo.
Derrota completa hasta la caída sostenida. `defeat-v2.png` corrige el sable
recortado en la caída final; original conservado, no activo.

## Escala y registro
Altura anatómica idle 491px; escala de pack .67 y objetivo228 unidades en escena1280,
dentro de la banda de protagonistas y otros Guardianes. Escalas uniformes por atlas,
sin deformar ni estirar personajes. PNG1536×1024, hurt1254×1254.
Recortes personalizados en ataque, desplazamiento y derrota para evitar vecinos.
Anclajes de pies individualizados en idle, victoria y demás acciones.
Idle1× en selector y combate; otras acciones1,5×. Reloj/reglas sin cambios.

Ataque: entrada0–360ms, seis poses360–1780, regreso1780–2250.
Impacto a1235ms (pose2), seguimiento a1380ms (pose3); alcance296px en fuente.
Estela turquesa independiente en `melee-fx.js`, anclada al filo medido en ambas
poses. Audio, música, aura de focus, parry y efectos compartidos reutilizados.
No agrega ataques extra ni modifica daño, IA o estadísticas.

## Comprobaciones
- Revisión visual del modelo y nueve atlas; hoja de contacto52 poses.
- Comparación de altura con los diez Guardianes; revisión de guantes, sable/mano.
- Chrome headless: escritorio1280×1000, móvil emulado390×844/DPR2.
  Selección de Errante, atacar/parry/rest, idiomaES/EN y cambio de apariencia.
  Capturas del golpe/estela, guardia, victoria y otras poses; sin erroresJS/HTTP.
- Selector: diez idle animados, pausa al salir de vista/entrar en batalla,
  regreso y movimiento reducido.
- `verify-wanderer.cjs`: poses, recortes, derrota, secuencia de victoria,
  contacto y registro de efecto en móvil/escritorio.
- `verify.cjs`: 90 atlas, 59 combates de reglas y80 combates del cliente,
  victoria completa y ciclos repetidos de los diez personajes.
- Tests de efectos, idle, portraits y auditoría del catálogo aprobados.
- No prueba física iOS/Android ni nueva evaluación auditiva.

Generación/edición con herramienta integrada. Prompts completos en `PROMPTS.md`.
Fuentes sin retoque por código; geometría ajustada únicamente en el manifiesto.
Alcance: demo pública, sin persistencia/asignación al jugador, servidor, salas
multijugador ni cambios al bot/protagonistas. Rollback anterior: `9e13b84`.
