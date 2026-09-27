@echo off
title LINGOLAB - servidor local
cd /d "%~dp0"

set PORT=8000
set PAGE=index.html

echo ===============================================
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
echo  Para detener: cierra la ventana "LINGOLAB servidor".
echo -----------------------------------------------
pause
