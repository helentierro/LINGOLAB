# LINGOLAB · Laboratorio de Inglés

App web estática para estudiar inglés: vocabulario, lecciones, lectura, diálogos,
pronunciación, dictado, escritura, quiz y juegos. Todo el progreso se guarda en el
navegador (localStorage / IndexedDB).

🌐 Demo en vivo: https://helentierro.github.io/LINGOLAB/

## Usar en tu PC

No abras el archivo con doble clic si vas a usar el micrófono (Chrome lo bloquea en `file://`).
Usa el servidor local:

```bat
iniciar-lingolab.bat
```

o manual:

```bash
python -m http.server 8000
# abrir http://localhost:8000/index.html
```

## Estructura

| Ruta | Qué es |
|---|---|
| `index.html` | App multi-archivo (usa `css/`, `js/`, `data/`) |
| `dist-hermana/lingolab.html` | Versión single-file generada con `tools/build-mobile.mjs` |
| `css/` | Estilos |
| `js/` | Lógica (`app-legacy.js`, `db.js`, juegos, mascota…) |
| `data/` | Contenido (`vocab.json`, `dialogs.json`, `stories.json`…) |
| `pwa/` + `sw.js` | Instalable y offline |
| `tools/` | Scripts de generación / verificación (no se publican como parte de la app) |

## Despliegue

GitHub Pages sirve la rama `main` desde la raíz. La rama `backup-github`
conserva la primera versión single-file publicada.
