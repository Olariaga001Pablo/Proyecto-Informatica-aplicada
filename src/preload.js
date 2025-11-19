// preload.js

const { contextBridge, ipcRenderer } = require("electron");

// Funciones para la gestión de Clientes
contextBridge.exposeInMainWorld("api", {
  getClientes: () => ipcRenderer.invoke("get-clientes"),
  getClienteById: (id) => ipcRenderer.invoke("get-clientes-by-id", id),
  addCliente: (cliente) => ipcRenderer.invoke("add-cliente", cliente),
  updateCliente: (id, data) => ipcRenderer.invoke("update-cliente", id, data),
  deleteCliente: (id) => ipcRenderer.invoke("delete-cliente", id),
  addUsuario: (usuario) => ipcRenderer.invoke("add-usuario", usuario),
  logToMain: (msg) => ipcRenderer.send("log-message", msg)
});


// Funciones para la gestión de Proveedores (¡NUEVO!)
contextBridge.exposeInMainWorld("proveedorAPI", {
    getProveedores: () => ipcRenderer.invoke("get-proveedores"),
    getProveedorById: (id) => ipcRenderer.invoke("get-proveedor-by-id", id),
    addProveedor: (proveedor) => ipcRenderer.invoke("add-proveedor", proveedor),
    updateProveedor: (id, data) => ipcRenderer.invoke("update-proveedor", id, data),
    deleteProveedor: (id) => ipcRenderer.invoke("delete-proveedor", id)
});

// Funciones para la gestión de Inventario (¡NUEVO!)
contextBridge.exposeInMainWorld("inventarioAPI", {
    getInventario: () => ipcRenderer.invoke("get-inventario"),
    getProductoById: (id) => ipcRenderer.invoke("get-producto-by-id", id),
    guardarProducto: (producto) => ipcRenderer.invoke("guardar-producto", producto),
    updateProducto: (id, data) => ipcRenderer.invoke("update-producto", id, data),
    eliminarProducto: (id) => ipcRenderer.invoke("eliminar-producto", id)
});

// Funciones para la gestión de Proyectos 
contextBridge.exposeInMainWorld("proyectoAPI", {
  getProyectos: () => ipcRenderer.invoke("get-proyectos"),
  getProyectoById: (id) => ipcRenderer.invoke("get-proyecto-by-id", id),
  guardarProyecto: (proyecto) => ipcRenderer.invoke("guardar-proyecto", proyecto),
  updateProyecto: (id, data) => ipcRenderer.invoke("update-proyecto", id, data),
  eliminarProyecto: (id) => ipcRenderer.invoke("eliminar-proyecto", id)
});

contextBridge.exposeInMainWorld("facturacionAPI", {
    getFacturacion: () => ipcRenderer.invoke("get-facturacion")
});