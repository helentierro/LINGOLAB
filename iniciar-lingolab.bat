@echo off
title LINGOLAB - servidor local
cd /d "%~dp0"

set PORT=8000
set PAGE=index.html

REM ===============================================
REM Aqui NO se escribe el numero de version. Antes este archivo decia "v10"
REM mientras la app ya iba por v11, y porEso el numero mentia. El unico sitio
REM que tiene la version correcta es el distintivo de la app, arriba a la
REM derecha, que se actualiza con el codigo. Asi no hay dos verdades.
echo  LINGOLAB - Laboratorio de Ingles
echo  Servidor local para que Chrome/Edge
echo  RECUERDE el permiso del microfono.
echo ===============================================
echo.

REM --- 1) Intentar con Python (viene sin instalar nada extra) ---
where python >nul 2>nul
if %errorlevel%==0 (
  echo [OK] Python encontrado. Iniciando servidor en puerto %PORT%...
  start "LINGOLAB servidor" /min python -m http.server %PORT%
  goto :abrir
)

REM --- 2) Plan B: Node/npx serve ---
where npx >nul 2>nul
if %errorlevel%==0 (
  echo [OK] Node encontrado. Iniciando servidor en puerto %PORT%...
  start "LINGOLAB servidor" /min npx --yes serve -l %PORT% .
  goto :abrir
)

echo [ERROR] No encontre ni Python ni Node en el PATH.
echo Instala Python de https://www.python.org/downloads/ ^(marca "Add to PATH"^) y vuelve a intentarlo.
pause
exit /b 1

:abrir
echo Esperando 2 segundos a que arranque el servidor...
timeout /t 2 /nobreak >nul

set URL=http://localhost:%PORT%/%PAGE%
echo Abriendo %URL% ...
start "" "%URL%"

echo.
echo -----------------------------------------------
echo  LISTO. Usa esa pestana, NO el archivo directo.
echo  En el microfono dale "Permitir mientras visitas".
echo  Chrome lo recordara y ya no preguntara cada vez.
echo.
echo  Si acabas de cambiar el codigo y NO se nota:
echo    1) recarga con  Ctrl+Shift+R  (fuerza, ignora la cache)
echo    2) si sigue igual, abre  F12  -^ Console  -^ borra el
echo       "Service Worker" y recarga otra vez.
echo    El distintivo de arriba a la derecha dice que version estas viendo:
echo    si no coincide con la que tocaste, hay una copia vieja en cache.
echo.
echo  Para detener: cierra la ventana "LINGOLAB servidor".
echo -----------------------------------------------
pause
