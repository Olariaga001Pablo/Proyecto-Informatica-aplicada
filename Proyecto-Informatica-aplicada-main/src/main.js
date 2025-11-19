import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import { fileURLToPath } from 'url';

// --- Importaciones de Backend ---

// 1. Lógica de Cálculo
import { calcularPanelesYSistema } from '../backend/utils/calculadora.js'; 

// 2. Lógica de Base de Datos / Consultas
// IMPORTACIÓN SIMPLIFICADA: Usamos import * as consultaAPI para evitar el 'SyntaxError' 
// si falta un solo export en consulta.js (como el que ocurrió antes con 'createUserArio').
import * as consultaAPI from '../backend/Querys/consulta.js'; 

// ------------------------------------

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Función para crear la ventana principal
function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 1200, // Aumentado para mejor visualización de la app
        height: 800,
        webPreferences: {
            // USAR PATH.JOIN Y AGREGAR CONFIGURACIÓN DE SEGURIDAD (CRÍTICO)
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true
        }
    });

    // CORRECCIÓN CLAVE: Usar PATH.JOIN para cargar la ruta absoluta del archivo
    mainWindow.loadFile(path.join(__dirname, 'index.html')); 

    // Opcional: Abrir DevTools al inicio para depuración
    // mainWindow.webContents.openDevTools();
}

// Inicializar la aplicación y la ventana
app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// ===============================================
// === MANEJADORES DE COMUNICACIÓN IPC (ipcMain) ===
// ===============================================

// 1. MANEJADOR DE CÁLCULO (utilAPI.calcularSistema)
ipcMain.handle('calcular-sistema', async (event, potenciaDemandaWatts, potenciaPanelWatts) => {
    try {
        const resultado = calcularPanelesYSistema(potenciaDemandaWatts, potenciaPanelWatts);
        return resultado;
    } catch (error) {
        console.error("Error en el cálculo IPC:", error);
        throw new Error("Fallo en la ejecución del cálculo en el proceso principal.");
    }
});

// 2. MANEJADORES IPC PARA CLIENTES (api)
ipcMain.handle("get-clientes", async () => {
    // Llamada con el namespace: consultaAPI.<funcion>
    return await consultaAPI.getClientes(); 
});

ipcMain.handle("get-clientes-by-id", async (event, id) => {
    return await consultaAPI.getClienteById(id);
});

ipcMain.handle("add-cliente", async (event, cliente) => {
    return await consultaAPI.createCliente(cliente); 
});

ipcMain.handle("add-usuario", async (event, usuario) => {
    return await consultaAPI.createUsuario(usuario); 
});

ipcMain.handle("update-cliente", async (event, id, data) => {
    return await consultaAPI.updateCliente(id, data);
});

ipcMain.handle("delete-cliente", async (event, id) => {
    try {
        return await consultaAPI.eliminarCliente(id); 
    } catch (error) {
        console.error("Error al eliminar cliente:", error);
        throw error;
    }
});

// 3. MANEJADORES IPC PARA PROVEEDORES (proveedorAPI)
ipcMain.handle("get-proveedores", async () => {
    return await consultaAPI.getProveedores();
});

ipcMain.handle("get-proveedor-by-id", async (event, id) => {
    return await consultaAPI.getProveedorById(id);
});

ipcMain.handle("add-proveedor", async (event, proveedor) => {
    return await consultaAPI.guardarProveedor(proveedor); 
});

ipcMain.handle("update-proveedor", async (event, id, data) => {
    return await consultaAPI.updateProveedor(id, data);
});

ipcMain.handle("delete-proveedor", async (event, id) => {
    return await consultaAPI.eliminarProveedor(id);
});

// 4. MANEJADORES IPC PARA INVENTARIO (inventarioAPI)
ipcMain.handle("get-inventario", async () => {
    return await consultaAPI.getInventario();
});

ipcMain.handle("guardar-producto", async (event, producto) => {
    return await consultaAPI.guardarProducto(producto);
});

ipcMain.handle("get-producto-by-id", async (event, id) => {
    return await consultaAPI.getProductoById(id); 
});

ipcMain.handle("eliminar-producto", async (event, id) => {
    return await consultaAPI.eliminarProducto(id);
});

ipcMain.handle("update-producto", async (event, id, data) => {
    return await consultaAPI.updateProducto(id, data); 
});

// 5. MANEJADORES IPC PARA PROYECTOS (proyectoAPI)
ipcMain.handle("get-proyectos", async () => {
    return await consultaAPI.getProyectos();
});

ipcMain.handle("get-proyecto-by-id", async (event, id) => {
    return await consultaAPI.getProyectoById(id);
});

ipcMain.handle("guardar-proyecto", async (event, proyecto) => {
    return await consultaAPI.guardarProyecto(proyecto);
});

ipcMain.handle("update-proyecto", async (event, id, data) => {
    return await consultaAPI.updateProyecto(id, data);
});

ipcMain.handle("eliminar-proyecto", async (event, id) => {
    return await consultaAPI.eliminarProyecto(id);
});


// Mensajes de log para depuración
ipcMain.on("log-message", (event, msg) => {
    console.log("Log from renderer:", msg);
});

// Inicializa la aplicación cuando esté lista
app.whenReady().then(createWindow).catch((error) => {
    console.error("An error occurred during app initialization:", error);
});