# Proyecto Informática Aplicada

Una aplicación de escritorio desarrollada con **Electron** para gestionar tarjetas (cards) con un backend basado en **Node.js** y **SQLite**.

## 📋 Descripción

Esta aplicación permite:
- ✅ Crear nuevas tarjetas con título y contenido
- ✅ Visualizar todas las tarjetas guardadas
- ✅ Gestionar tarjetas mediante una interfaz gráfica intuitiva
- ✅ Almacenamiento persistente en base de datos SQLite

## 🛠️ Tecnologías Utilizadas

- **Frontend**: HTML, CSS, JavaScript
- **Framework de escritorio**: Electron
- **Backend**: Node.js con Express
- **Base de datos**: SQLite3
- **Comunicación**: API REST

## 📦 Prerequisitos

Antes de ejecutar el proyecto, asegúrate de tener instalado:

- [Node.js](https://nodejs.org/) (versión 14 o superior)
- npm (incluido con Node.js)

## 🚀 Instalación y Configuración

### 1. Clonar el repositorio
```bash
git clone <url-del-repositorio>
cd Proyecto-Informatica-aplicada
```

### 2. Instalar dependencias
```bash
npm install
```

## ▶️ Cómo Ejecutar el Proyecto

### Método 1: Ejecución Completa (Recomendado)

**Paso 1: Iniciar el servidor backend**
```bash
# Abrir una terminal y navegar a la carpeta del servidor
cd server
node server.js
```
Deberías ver el mensaje: `Server is running on http://localhost:3000/`

**Paso 2: Ejecutar la aplicación Electron**
```bash
# En otra terminal (desde la raíz del proyecto)
npm start
```

### Método 2: Usando scripts separados

Si prefieres usar scripts automatizados, puedes ejecutar:

**Terminal 1 - Backend:**
```bash
cd server && node server.js
```

**Terminal 2 - Frontend:**
```bash
npm start
```

## 📁 Estructura del Proyecto

```
Proyecto-Informatica-aplicada/
├── src/
│   ├── main.js          # Proceso principal de Electron
│   └── preload.js       # Script de preload para seguridad
├── lib/
│   ├── index.html       # Página principal
│   ├── add.html         # Página para agregar tarjetas
│   └── showcards.html   # Página para mostrar tarjetas
├── server/
│   ├── server.js        # Servidor Express
│   └── database.db      # Base de datos SQLite
├── data/
│   └── database.db      # Base de datos principal
└── package.json         # Configuración y dependencias
```

## 🔧 Configuración de la Base de Datos

La base de datos se crea automáticamente al ejecutar el servidor. La tabla `cards` tiene la siguiente estructura:

```sql
CREATE TABLE cards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL
);
```

## 🌐 API Endpoints

El servidor backend expone los siguientes endpoints:

- `GET /` - Obtener todas las tarjetas
- `POST /` - Crear una nueva tarjeta

## 🐛 Solución de Problemas

### Problema: "Error fetching card data"
**Solución**: Verifica que el servidor esté corriendo en `http://localhost:3000`

### Problema: La aplicación no inicia
**Solución**: 
1. Asegúrate de haber instalado las dependencias: `npm install`
2. Verifica que Node.js esté instalado correctamente

### Problema: No se pueden crear tarjetas
**Solución**: 
1. Confirma que el servidor backend esté ejecutándose
2. Revisa la consola del navegador (F12) para errores

## 📝 Uso de la Aplicación

1. **Página Principal**: Navega entre las diferentes secciones
2. **Add Card**: Crea nuevas tarjetas ingresando título y contenido
3. **Show Cards**: Visualiza todas las tarjetas guardadas
4. **Navegación**: Usa los botones de navegación para moverte entre páginas

## 👨‍💻 Desarrollo

Para desarrollo, el proyecto incluye **electron-reload** que recarga automáticamente la aplicación cuando detecta cambios en los archivos.


---

**¿Necesitas ayuda?** Revisa la sección de solución de problemas o contacta al desarrollador.