#  Road Fighter - Versión La Matanza (EN PRODUCCIÓN )
<img width="1122" height="1402" alt="Road fighter-LM" src="https://github.com/user-attachments/assets/f77782e8-c82c-41c7-a693-0a46a44510d6" />

# 🏎️ Road Fighter — Versión La Matanza

Un homenaje arcade al clásico **Road Fighter** (Konami, 1984), reversionado con identidad propia: Isis, una gata gris con anteojos de sol, corre en un Fórmula 1 rosa a través de cinco barrios del partido de La Matanza, Buenos Aires.

Jugalo directo desde el navegador, sin instalar nada:
**[👉 Jugar en GitHub Pages](https://coderhouse2025-droid.github.io/Road-FIghter-LM/)**

---

## 📖 Historia y motivación

Este proyecto nació como un ejercicio personal para combinar dos cosas que me gustan: los juegos arcade de los '80/'90 y la programación con JavaScript puro, sin frameworks ni dependencias externas.

Elegí **Road Fighter** como base porque es un juego simple de entender (esquivar tráfico, no quedarse sin combustible, llegar a la meta) pero con mucho margen para agregarle capas de complejidad: niveles con dificultad progresiva, curvas de camino, daño acumulado en la carrocería, un sistema de power-ups y una estética propia.

La decisión de ambientarlo en **La Matanza** —recorriendo Ramos Mejía, San Justo, Lomas del Mirador, Isidro Casanova y Gregorio de Laferrere— surgió para darle identidad local al proyecto en lugar de una pista genérica, y la protagonista (Isis, la gata piloto) es un guiño personal que le da carácter al juego más allá de la mecánica.

Más que un clon, la idea fue usar el formato del juego original como excusa para practicar:
- Programación de un game loop completo (estado, física simple, colisiones, HUD).
- Generación procedural de escenografía y tráfico.
- Sonido sintetizado en tiempo real, sin archivos de audio.
- Diseño responsive para que funcione tanto en PC como en el celular.

## 🕹️ De qué se trata el juego

Isis maneja un Fórmula 1 rosa (con el número **31**) y tiene que atravesar 5 barrios de La Matanza esquivando autos, motos, colectivos, ambulancias e incluso un carro tirado a caballo, sin quedarse sin combustible ni acumular demasiado daño en la carrocería.

### Objetivo
- Llegar viva al final de cada barrio antes de que se acabe el reloj.
- Esquivar el tráfico y las manchas de aceite.
- Recolectar bidones de combustible (además de recargar nafta, reparan un poco la carrocería).

### Barrios / niveles
| # | Barrio                     | Dificultad          |
|---|-----------------------------|----------------------|
| 1 | Ramos Mejía                | Introductorio |
| 2 | San Justo                   | Fácil |
| 3 | Lomas del Mirador            | Media |
| 4 | Isidro Casanova                    | Alta |
| 5 | Gregorio de Laferrere        | Máxima |

### Tráfico y eventos especiales
- **Autos y motos**: tráfico genérico que aumenta de velocidad y densidad en cada barrio.
- **Colectivos**: llevan un número de línea real pintado en el techo, visible desde arriba.
- **Ambulancias**: aparecen dos veces en los dos primeros barrios, con sirena sonora (sintetizada) y luces rojas/azules que destellan en tiempo real.
- **Carro a caballo**: aparece dos veces en el último barrio (Gregorio de Laferrere), como guiño a los caminos menos pavimentados de la zona.
- **Manchas de aceite**: provocan un derrape temporal.

### Controles
| Acción | Teclado | Táctil (celular) |
|---|---|---|
| Girar izquierda / derecha | ← / → | Botones ◀ ▶ |
| Acelerar (turbo) | ↑ | Botón ▲ |
| Frenar | ↓ | Botón ▼ |

El juego detecta automáticamente si el dispositivo es táctil y muestra los controles en pantalla; en celular, además, pide pantalla completa al primer toque para ocultar la barra de direcciones del navegador.

## 🛠️ Tecnología utilizada

El juego está desarrollado **100% con tecnologías web nativas**, sin librerías ni frameworks:

- **HTML5** — estructura y marcado semántico de la interfaz (HUD, menús, overlays).
- **CSS3** — diseño responsive (`clamp`, `dvh`, media queries) para adaptarse a PC, tablet y celular, incluyendo soporte para pantalla completa (`viewport-fit=cover`, Fullscreen API).
- **JavaScript (ES6+)** — toda la lógica del juego:
  - **Canvas 2D API** para el renderizado en tiempo real (auto del jugador, tráfico, escenografía, HUD dibujado a mano en cada frame).
  - **Web Audio API** para generar todos los efectos de sonido y la música del juego de forma sintética (sin archivos `.mp3`/`.wav`), incluyendo el motor, la sirena de la ambulancia y el jingle de cada barrio.
  - Máquina de estados propia para manejar niveles, vidas, combustible, daño, colisiones y transiciones entre barrios.
  - Sistema de "eventos programados" por nivel (apariciones garantizadas de ambulancias y carros a caballo en momentos específicos del recorrido).
- **GitHub Pages** — hosting estático y despliegue continuo del proyecto.

No requiere build, ni `npm install`, ni servidor: es un único archivo `index.html` autocontenido que corre en cualquier navegador moderno.

## 🚀 Cómo correrlo localmente

```bash
git clone https://github.com/coderhouse2025-droid/Portafolio-JM.git
cd Portafolio-JM
# abrí index.html directamente en el navegador, o serví la carpeta con cualquier servidor estático:
python3 -m http.server 8080
```

Luego entrá a `http://localhost:8080` desde el navegador.

## 📂 Estructura del proyecto

```
index.html   → juego completo (HTML + CSS + JS en un solo archivo)
README.md    → este documento
```

## ✨ Créditos

- **Idea, diseño y desarrollo**: Juan Manuel Orellana ([LinkedIn](https://linkedin.com/in/juan-manuel-orellana)).
- **Inspiración**: *Road Fighter* (Konami, 1984).
- Todos los gráficos (autos, escenografía, íconos) y sonidos son generados por código, sin assets externos.

## 📄 Licencia

Proyecto personal con fines educativos y de portafolio. Podés usar el código como referencia para tus propios proyectos.
