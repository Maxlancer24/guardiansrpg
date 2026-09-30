# Balthier

- ID: duskgunner. Apariencia de jugador; no protagonista ni clase fija.
- Diseño 4 aprobado del lote de cinco. Hombre adulto, pelo corto oscuro despeinado, tez oliva, barba incipiente, abrigo arena con forro burdeos y mangas remangadas, pañuelo burdeos, chaleco índigo, camisa crema, pantalones carbón, botas marrones.
- UN revólver de cañón largo, acero y empuñadura de madera, siempre en mano DERECHA. Mano izquierda libre; una funda vacía.
- Nueve acciones: idle6, attack6, guard6, hurt4, rest6, motion6, activation6, victory6, defeat6. Total52 dibujos.
- Idle a1x, con parpadeo breve; resto a1.5x. Pies anclados, escala anatómica proporcional.
- Disparo normal a distancia, sin avance ni salto de regreso. Animación de movimiento disponible en el visor para futuros modos.
- Guard usa brazo libre para cubrirse, sin disparo anticipado. Contraataque usa el clip de ataque por separado.
- Destello, bala, estela y humo son canvas independiente en gun-fx.js, sin efectos pintados en atlas.
- Un evento de daño según reglas existentes. El aspecto no impone arma equipada, clase, activa ni pasivas.
- Victoria completa antes de sostener final; derrota con transición hasta el suelo y último dibujo sostenido.
- Fuentes PNG con alfa generado conservado. Recortes y máscaras definidos en manifiesto, sin modificación de píxeles.
- Demo: /guardian-duel/?hero=duskgunner. Visor: /guardian-duel/duskgunner-preview.html.
- Alcance: prueba sin perfil contra Hollow. Sin cambios al bot, datos, desbloqueos ni salas multijugador.
- Rollback: 4c68abd5d8fa8d1182902adf53866b8f8295a2e7.

