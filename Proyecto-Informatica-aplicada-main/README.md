# Proyecto Informática Aplicada

Este proyecto es una aplicación de escritorio desarrollada con Electron y Node.js para la gestión de clientes, usuarios, inventario y facturación, utilizando una base de datos SQLite.

## Estructura del Proyecto

```
├── backend/
│   └── Querys/
│       ├── consulta.js         # Funciones para interactuar con la base de datos
│       └── db/
│           └── DB_Paneles.sql # Script y archivo de la base de datos SQLite
├── docs/
│   ├── DER Paneles.png        # Diagrama de entidad-relación
│   └── README.md              # Documentación técnica
├── Querys/
│   └── main.ts                # Script principal de consultas (pruebas)
├── src/
│   ├── cliente/
│   │   ├── script.js          # Lógica de la interfaz de cliente
│   │   └── readme.txt         # Explicación de la carpeta cliente
│   ├── pages/
│   │   ├── cliente.html       # Vista de clientes (prueba)
│   │   └── readme.txt         # Explicación de la carpeta pages
│   ├── public/
│   │   └── icons/             # Iconos SVG usados en la interfaz
│   ├── main.js                # Proceso principal de Electron
│   ├── preload.js             # Exposición de API segura al render
│   └── index.html             # Página principal de la aplicación
├── package.json               # Configuración de dependencias y scripts
├── .gitignore                 # Exclusión de archivos para git
└── README.md                  # Este archivo
```

## Funcionalidades

- **Gestión de clientes:** Alta, consulta y listado de clientes desde la base de datos.
- **Gestión de usuarios:** Alta y administración de usuarios con roles.
- **Inventario:** Registro y consulta de productos y movimientos de inventario.
- **Facturación:** Generación y consulta de facturas y pagos.
- **Interfaz moderna:** Navegación vertical y horizontal, búsqueda con iconos SVG, tarjetas de cliente con diseño responsivo.
- **Integración con Electron:** Comunicación segura entre el render y el backend usando preload y IPC.

## Instalación y ejecución

1. Instala las dependencias:
   ```bash
   npm install
   ```
2. Ejecuta la aplicación:
   ```bash
   npm start
   ```

## Base de datos

- El proyecto utiliza SQLite. El archivo de la base de datos se encuentra en `backend/db/DB_Paneles.db`.
- El script de creación de tablas está en `DB_Paneles.sql`.

## Documentación

- Consulta los archivos `readme.txt` en las carpetas `cliente` y `pages` para detalles específicos de cada módulo.
- El diagrama de entidad-relación está en `docs/DER Paneles.png`.

## Notas y recomendaciones

- El módulo `pages` es solo una prueba y será modificado próximamente.
- El código está preparado para ser extendido con nuevas funcionalidades.
- Asegúrate de que los iconos SVG estén en la ruta correcta para que se muestren en la interfaz.
- Si tienes dudas sobre la estructura o el funcionamiento, revisa los comentarios en los archivos `readme.txt` y el código fuente.