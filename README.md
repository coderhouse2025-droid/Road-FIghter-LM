# La Matanza Road Fighter (EN PRODUCCIÓN )
<img width="1122" height="1402" alt="Banner del Juego" src="https://github.com/user-attachments/assets/c109b1a0-c3c9-446d-bf8b-1b6e40adfebd" />

Arcade completo estilo Konami 1984 — versión mejorada.

## Novedades v2

- **Sprites profesionales** dibujados pixel a pixel vía Canvas API (jugador, autos enemigos, camión, bidón de combustible, manchas de aceite)
- **Explosiones animadas** — 6 frames con sparks y humo
- **Pantalla de inicio** — logo animado estilo arcade, selector de dificultad
- **Selector de dificultad** — EASY / NORMAL / HARD
- **High Score local** — guardado en localStorage
- **Música 8-bit** — melodía chiptune con Web Audio API, silenciable
- **SFX** — motor, explosión, crash, recogida de combustible, game over
- **Motor de audio** — drone de motor reactivo a la velocidad
- **5 Zonas** — La Matanza → Liniers → Caballito → Palermo → Retiro
- **Camiones** con manchas de aceite
- **Bidones de combustible** coleccionables
- **Curvas dinámicas** — perspectiva arcade
- **Vidas** — 3 vidas con respawn y parpadeo de invencibilidad
- **Estética 100% Konami** — fuente Press Start 2P, paleta clásica
- **Optimización mobile** — botones táctiles, layout responsive, PWA instalable

## Controles

- **← →** Flechas del teclado
- **Botones táctiles** en pantalla (móvil)

## Estructura

```
/index.html
/style.css
/js/
  audio.js    — motor de audio 8-bit
  sprites.js  — todos los sprites (Canvas API, sin imágenes externas)
  game.js     — motor del juego
/sw.js
/manifest.json
```

## Deploy en GitHub Pages

1. Crear repositorio
2. Subir todos los archivos manteniendo la estructura de carpetas
3. Settings → Pages → Deploy from branch → main / root
4. Listo — funciona como PWA instalable

## Notas técnicas

- Sin dependencias externas (solo fuente Google Fonts)
- Todo renderizado en Canvas 2D
- Sprites procedurales — no requiere imágenes
- Audio generado con Web Audio API
- Escala automática al viewport (pixel-perfect)
