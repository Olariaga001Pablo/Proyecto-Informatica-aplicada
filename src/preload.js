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
    eliminarProducto: (id) => ipcRenderer.invoke("eliminar-producto", id),
    getTiposProducto: () => ipcRenderer.invoke("get-tipos-producto")
});

// Funciones para la gestión de Proyectos 
contextBridge.exposeInMainWorld("proyectoAPI", {
  getProyectos: () => ipcRenderer.invoke("get-proyectos"),
  getProyectoById: (id) => ipcRenderer.invoke("get-proyecto-by-id", id),
  guardarProyecto: (proyecto) => ipcRenderer.invoke("guardar-proyecto", proyecto),
  updateProyecto: (id, data) => ipcRenderer.invoke("update-proyecto", id, data),
  eliminarProyecto: (id) => ipcRenderer.invoke("eliminar-proyecto", id)
});

contextBridge.exposeInMainWorld("especialidadesAPI", {
  getEspecialidades: () => ipcRenderer.invoke("get-especialidades"),
  addEspecialidad: (especialidad) => ipcRenderer.invoke("add-especialidad", especialidad),
  deleteEspecialidad: (id) => ipcRenderer.invoke("delete-especialidad", id)
});

contextBridge.exposeInMainWorld("empleadosAPI", {
  getEmpleados: () => ipcRenderer.invoke("get-empleados"),
  getEmpleadoById: (id) => ipcRenderer.invoke("get-empleado-by-id", id),
  updateEmpleado: (id, data) => ipcRenderer.invoke("update-empleado", id, data),
  deleteEmpleado: (id) => ipcRenderer.invoke("delete-empleado", id)
});

contextBridge.exposeInMainWorld("auditoriaAPI", {
  getAuditoria: (limite) => ipcRenderer.invoke("get-auditoria", limite)
});

contextBridge.exposeInMainWorld("productoProyectoAPI", {
  getProductosProyecto: (id_proyecto) => ipcRenderer.invoke("get-productos-proyecto", id_proyecto),
  getPanelesProyecto: (id_proyecto) => ipcRenderer.invoke("get-paneles-proyecto", id_proyecto),
  asignarProducto: (id_proyecto, id_producto, cantidad) =>
    ipcRenderer.invoke("asignar-producto-proyecto", id_proyecto, id_producto, cantidad),
  quitarProducto: (id_proyecto, id_producto) =>
    ipcRenderer.invoke("quitar-producto-proyecto", id_proyecto, id_producto)
});

contextBridge.exposeInMainWorld("simulacionAPI", {
  addSimulacion: (datos) => ipcRenderer.invoke("add-simulacion", datos),
  getSimulaciones: () => ipcRenderer.invoke("get-simulaciones"),
  getSimulacionById: (id) => ipcRenderer.invoke("get-simulacion-by-id", id),
  deleteSimulacion: (id) => ipcRenderer.invoke("delete-simulacion", id)
});

contextBridge.exposeInMainWorld("facturacionAPI", {
  getFacturacion: () => ipcRenderer.invoke("get-facturacion"),
  addFacturacion: (id_proyecto, fecha) => ipcRenderer.invoke("add-facturacion", id_proyecto, fecha),
  getFacturaDetalle: (id_facturacion) => ipcRenderer.invoke("get-factura-detalle", id_facturacion),
  agregarItemManual: (id_facturacion, item) => ipcRenderer.invoke("agregar-item-manual", id_facturacion, item),
  eliminarItemFactura: (id_item) => ipcRenderer.invoke("eliminar-item-factura", id_item),
  agregarPago: (id_facturacion, pago) => ipcRenderer.invoke("agregar-pago", id_facturacion, pago),
  eliminarPago: (id_pago) => ipcRenderer.invoke("eliminar-pago", id_pago)
});

contextBridge.exposeInMainWorld("authAPI", {
  login: (email, password) => ipcRenderer.invoke("login", { email, password }),
  logout: () => ipcRenderer.invoke("logout"),
  getCurrentUser: () => ipcRenderer.invoke("get-current-user")
});
 
contextBridge.exposeInMainWorld("usuariosAPI", {
  getUsuarios: () => ipcRenderer.invoke("get-usuarios"),
  addUsuario: (usuario) => ipcRenderer.invoke("add-usuario", usuario),
  updateUsuario: (id, data) => ipcRenderer.invoke("update-usuario", id, data),
  deleteUsuario: (id) => ipcRenderer.invoke("delete-usuario", id)
});
 