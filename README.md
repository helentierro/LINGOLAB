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

## Cómo abrirla

```bat
iniciar-lingolab.bat
```

Levanta un servidor local en `http://localhost:8000/` y abre el navegador. **Usa
siempre esa pestaña, no el archivo con doble clic**: el micrófono no funciona en
`file://`. En la primera vez, Chrome pedirá permiso del micrófono:dale
"Permitir mientras visitas" y lo recuerda.

> **Si cambiaste el código y no se nota nada**, estás viendo la versión guardada.
> Recarga con `Ctrl+Shift+R`. Arriba a la derecha de la app hay un distintivo con
> la versión: si pone `v11 ⚠️`, hay una copia vieja en caché. El service worker
> sirve el código **red primero** (por eso ya no debería pasar), y `sw.js` borra
> las cachés viejas al cambiar su `V`.

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

## Micrófono en el celular

El reconocimiento de voz de Chrome en Android mete ruido ambiente como si fuera
frase. En Lectura y Diálogos hay dos modos, en **Tu progreso → Ajustes** o con el
chip junto al micrófono:

- **👆 Un toque** (por defecto en celular): el micro se abre, lees una frase y se
  cierra. Es el modo sin falsos positivos.
- **🎧 Corrido** (por defecto en PC): micro abierto, lees el capítulo entero.

Además hay un **filtro antiruido** (Normal / Estricto) que descarta lo que no es una
voz: vacíos, muletillas, marcadores tipo `[inaudible]` y repeticiones; y con Web
Audio disponible, mide el señal para distinguir una persona de un ventilador. Si el
navegador no da muestras, se desactiva solo y deja solo el filtro básico.

## Enter

`Enter` envía el resultado del ejercicio y, si ya estaba enviado, pasa al
siguiente. Funciona en Pronunciación, Lectura, Diálogos, Dictado, Escritura y
Lecciones. `Shift+Enter` en un cuadro de texto sigue siendo salto de línea.

## Traducciones

Por defecto **el español se ve siempre** (se cambia en Ajustes). El contenido vive
en `data/*.json`, que es la fuente de verdad: la app lleva una copia embebida en
`js/app-legacy.js` porque es single-file y PWA, y esa copia se regenera con
`node tools/build-content.mjs`. Si editas el contenido, ejecuta eso.

## Verificación

```bash
node tools/check-data.mjs    # contenido + sincronía app↔data + alineación de traducciones
node tools/test-app.mjs      # arranca la app en un DOM simulado: vistas, micrófono, enter, lecciones
node tools/check-ids.mjs     # todo $("id") del JS existe en el HTML
node tools/build-mobile.mjs  # regenera dist-hermana/lingolab.html
```

`test-app.mjs` no necesita navegador ni dependencias: ejecuta el JS real contra
un DOM simulado y un `SpeechRecognition` falso, así que caza errores de ejecución
y regresiones de los flujos (ruido, modo un toque, enter, lección guiada).

## Despliegue

GitHub Pages sirve la rama `main` desde la raíz. La rama `backup-github`
conserva la primera versión single-file publicada.

> **Ojo al publicar:** `sw.js` sirve la caché primero. Si tocas `index.html` o
> `js/`, sube la constante `V` de `sw.js` o quien tenga la app instalada seguirá
> viendo la versión anterior.


