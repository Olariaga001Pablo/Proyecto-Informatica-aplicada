// main.js

import {
    // Funciones de Clientes (ya estaban)
    getClientes, 
    createCliente, 
    createUsuario, 
    getClienteById, 
    updateCliente,
    
    
    // Funciones de Inventario
    getInventario,
    guardarProducto,
    getProductoById as getProductoByIdInv,
    eliminarProducto,
    updateProducto as updateProductoInv,

    // Funciones de Proveedores 
    getProveedores,
    guardarProveedor,
    getProveedorById,
    updateProveedor,
    eliminarProveedor
} from '../backend/Querys/consulta.js';

import { BrowserWindow, app, ipcMain } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    });

    win.loadFile('./src/index.html');
}

// Manejadores IPC para la comunicación de Clientes
ipcMain.handle("get-clientes", async () => {
    return await getClientes();
});

ipcMain.handle("get-clientes-by-id", async (event, id) => {
    return await getClienteById(id);
});

ipcMain.handle("add-cliente", async (event, cliente) => {
    return await createCliente(cliente);
});

ipcMain.handle("add-usuario", async (event, usuario) => {
    return await createUsuario(usuario);
});

ipcMain.handle("update-cliente", async (event, id, data) => {
    return await updateCliente(id, data);
});

// Manejadores IPC para la comunicación de Proveedores (¡NUEVOS!)
ipcMain.handle("get-proveedores", async () => {
    return await getProveedores();
});

ipcMain.handle("get-proveedor-by-id", async (event, id) => {
    return await getProveedorById(id);
});

ipcMain.handle("add-proveedor", async (event, proveedor) => {
    return await guardarProveedor(proveedor);
});

ipcMain.handle("update-proveedor", async (event, id, data) => {
    return await updateProveedor(id, data);
});

ipcMain.handle("delete-proveedor", async (event, id) => {
    return await eliminarProveedor(id);
});

// Manejadores IPC para la comunicación de Inventario (¡AGREGADO LO FALTANTE!)
ipcMain.handle("get-inventario", async () => {
    return await getInventario();
});

ipcMain.handle("guardar-producto", async (event, producto) => {
    return await guardarProducto(producto);
});

ipcMain.handle("get-producto-by-id", async (event, id) => {
    return await getProductoByIdInv(id);
});

ipcMain.handle("eliminar-producto", async (event, id) => {
    return await eliminarProducto(id);
});

ipcMain.handle("update-producto", async (event, id, data) => {
    return await updateProductoInv(id, data);
});

// Mensajes de log para depuración
ipcMain.on("log-message", (event, msg) => {
    console.log("Log from renderer:", msg);
});

// Inicializa la aplicación cuando esté lista
app.whenReady().then(createWindow).catch((error) => {
    console.error("An error occurred during app initialization:", error);
});