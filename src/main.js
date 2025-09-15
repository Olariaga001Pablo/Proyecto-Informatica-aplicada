// Trae la función getClientes desde el archivo consulta.js
import {getClientes, createCliente, createUsuario}  from '../backend/Querys/consulta.js';
// Módulos de Electron necesarios para ejecutar la aplicación
import { BrowserWindow, app, ipcMain }  from 'electron';
// Módulo path para manejar rutas de archivos
import path from 'path';
// Módulos para manejar rutas de archivos en ES Modules
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Función para crear la ventana principal de la aplicación
function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js') // Usa path.join aquí        
        }
    });
    win.loadFile('./src/index.html');
}

// Manejdador IPC para comunicación entre el proceso principal y el proceso de renderizado
ipcMain.handle("get-clientes", async () => {
    return await getClientes();
});

ipcMain.handle("add-cliente", async (event, cliente) => {
    return await createCliente(cliente);
});
ipcMain.handle("add-usuario", async (event, usuario) => {
    return await createUsuario(usuario);
});

// Inicializa la aplicación cuando esté lista
app.whenReady().then(createWindow).catch((error) => {
    console.error("An error occurred during app initialization:", error);
});