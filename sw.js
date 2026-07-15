const CACHE = 'rf-v4';
const FILES = [
  './', './index.html', './style.css', './js/audio.js', './js/sprites.js', './js/game.js', './manifest.json',
  './Imagenes/icon-192.png', './Imagenes/icon-512.png',
  './Imagenes/buses/bus_lamatanza.png', './Imagenes/buses/bus_liniers.png', './Imagenes/buses/bus_caballito.png',
  './Imagenes/buses/bus_palermo.png', './Imagenes/buses/bus_retiro.png', './Imagenes/buses/bus_extra1.png', './Imagenes/buses/bus_extra2.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)));
});
self.addEventListener('fetch', e => {
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
