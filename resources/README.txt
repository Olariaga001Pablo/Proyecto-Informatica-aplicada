Coloca aquí el icono de la aplicación (Windows .ico) con el nombre `icon.ico`.

Recomendaciones:
- Formato: .ico (puedes convertir desde .png con cualquier conversor online).
- Tamaño recomendado: 256x256 y/o incluir múltiples resoluciones en el .ico.

Cuando tengas `resources/icon.ico` listo, ejecuta:

    npm install
    npm run make

para generar el instalador Windows con Squirrel (usando la configuración en `forge.config.cjs`).
