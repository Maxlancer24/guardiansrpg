# Bastión del bosque / Forest Bastion

- ID estable: forestbastion. Grupo: apariencia de jugador, no protagonista.
- Estado: demo lista para publicar en /guardian-duel/. No modifica roster de Discord, perfiles ni reglas del bot.
- Referencia aprobada: concept-approved.png; base de combate: base-v1.png. PNG originales conservados.
- Identidad invariable: hombre adulto, cabello castaño oscuro corto, ojos verdes, barba tenue, capa musgo con cuello claro, tres placas plateadas sobre cuero marrón, camisa crema, fajín granate, pantalón carbón, botas marrones y rodilleras plateadas.
- Escudo: cometa verde con árbol marfil y borde plateado; brazo izquierdo siempre. Mano derecha libre; sin espada.
- Activa: representación genérica reutilizable; esta apariencia no impone una habilidad ni altera estadísticas.

## Paquete completo

52 fotogramas: idle 6, attack 6, guard 6, hurt 4, rest 6, motion 6, activation 6, victory 6 y defeat 6.
Manifiesto: /guardian-duel/forestbastion.js.
Atlas y prompts: /guardian-duel/assets/forestbastion-v1/.
Visor: /guardian-duel/forestbastion-preview.html.
Combate: /guardian-duel/?hero=forestbastion.

Idle a 1x, blink dibujado de 110ms dentro de ciclo de 5.16s; otras acciones a 1.5x.
Altura de referencia: 480px anatómicos en idle, normalizados a 230px a escala de protagonista.
Escalas por acción y anclajes de suelo constan en el manifiesto. No se estiran los PNG.
Ataque: escudazo con anticipación y desplazamiento; contacto a 875ms del clip, 1235ms de la secuencia de ataque, un único evento visual/daño.
Parry: preparación, bloqueo y reacción; no incorpora contraataque.
Efecto procedural de presión y brillo anclado a la cara del escudo, separado del sprite. Apagable, respeta movimiento reducido.
Durante el golpe este personaje se dibuja delante de Hollow y mantiene una distancia propia para que el escudo sea visible.
Victoria recorre las seis poses antes de sostener/repetir el saludo. Derrota recorre seis poses y sostiene la rodilla en tierra.
Sonidos existentes reutilizados, desactivados por defecto.

## Versiones y revisión

- Todos los atlas v1 generados mediante ImageGen integrado.
- motion-v2 corrige el cuarto fotograma: escudo delante en el mismo brazo durante salto de regreso; v1 conservado, no activo.
- Recortes y polígonos de separación en coordenadas fuente; RGBA originales sin recolorear ni recortar físicamente.
- Medición de componentes alfa >120: 52/52 cuerpos completos, 0 píxeles opacos de cuerpos vecinos dentro de cada recorte.
- Revisión visual: nueve atlas y nueve láminas normalizadas; escena, golpe, victoria y disposición móvil.
- Chrome automatizado: escritorio 1280x1000 y móvil emulado 390x844, DPR2. 52 fuentes dibujadas, ataque/parry/rest, victoria, derrota, reinicio, ES/EN y cambio de personaje; sin errores JS ni recursos ausentes ni desborde horizontal.
- Pruebas de regresión: 144 combates simulados de los 18 packs completos, efectos cuerpo a cuerpo, inventario y paletas.
- No probado en teléfono físico. La inspección alfa valida recortes, no sustituye la revisión anatómica.
- Base de rollback: 55ea4627bb7e94ae744226dfe1ffbdb43502ed64. Ver commit de incorporación para publicación.
