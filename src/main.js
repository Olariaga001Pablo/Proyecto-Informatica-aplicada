// main.js

import {
    // Funciones de Usuarios
    getUsuarios,
    createUsuario,
    loginUsuario,
    updateUsuario,
    eliminarUsuario,
    // Funciones de Empleados
    getEmpleados,
    getEmpleadoById,
    updateEmpleado,
    eliminarEmpleado,
    // Funciones de Especialidades
    getEspecialidades,
    crearEspecialidad,
    eliminarEspecialidad,
    // Funciones de Clientes
    getClientes,
    createCliente,
    getClienteById,
    updateCliente,
    eliminarCliente,

    // Funciones de Inventario
    getInventario,
    guardarProducto,
    getProductoById as getProductoByIdInv,
    getTiposProducto,
    eliminarProducto,
    updateProducto as updateProductoInv,

    // Funciones de Proveedores
    getProveedores,
    guardarProveedor,
    getProveedorById,
    updateProveedor,
    eliminarProveedor,

    // Funciones de Proyectos
    getProyectos,
    guardarProyecto,
    getProyectoById,
    updateProyecto,
    eliminarProyecto,

     // Funciones de Facturación
    getFacturas,
    crearFactura,

    // Productos del proyecto
    asignarProductoProyecto,
    getProductosDeProyecto,
    quitarProductoProyecto,
    getPanelesDeProyecto,

    // Funciones de Simulación
    crearSimulacion,
    getSimulaciones,
    getSimulacionById,
    eliminarSimulacion,
    // Auditoría
    registrarAuditoria,
    getAuditoria,

    crearItemsDesdeProyecto,
    agregarItemManual,
    getItemsDeFactura,
    eliminarItemFactura,
    agregarPago,
    getPagosDeFactura,
    eliminarPago,
    getFacturaDetalle,

    // Inicialización de la BD (debe llamarse desde app.whenReady)
    initDatabase

} from '../backend/Querys/consulta.js';

import { setCurrentUser, getCurrentUser, clearCurrentUser, requireRole, withAudit } from '../backend/db/session.js';

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

    win.loadFile('./src/pages/usuarios/login.html');
}

// ======================================================
// AUTENTICACIÓN
// ======================================================
// Login y logout no usan requireRole (todavía no hay sesión activa en el
// login, y en el logout ya no importa el rol) - por eso se audita a mano acá.

ipcMain.handle('login', async (event, { email, password }) => {
    const usuario = await loginUsuario(email, password);

    await registrarAuditoria({
        id_usuario: usuario?.id_usuario ?? null,
        rol: usuario?.rol ?? null,
        tipo_evento: 'login',
        modulo: 'Usuarios',
        resultado: usuario ? 'exito' : 'error'
    });

    if (!usuario) {
        return { ok: false, error: 'Usuario o contraseña incorrectos' };
    }
    setCurrentUser(usuario);
    return { ok: true, usuario };
});

ipcMain.handle('logout', async () => {
    const usuario = getCurrentUser();
    await registrarAuditoria({
        id_usuario: usuario?.id_usuario,
        rol: usuario?.rol,
        tipo_evento: 'logout',
        modulo: 'Usuarios',
        resultado: 'exito'
    });
    clearCurrentUser();
    return { ok: true };
});

ipcMain.handle('get-current-user', async () => {
    return getCurrentUser();
});

// ======================================================
// USUARIOS (solo administrador)
// ======================================================

ipcMain.handle("add-usuario", requireRole('administrador')(withAudit('Usuarios', 'alta')(
    async (event, usuario) => {
        return await createUsuario(usuario);
    }
)));

// Listar usuarios expone email/rol de todas las cuentas: se audita como
// "acceso a información sensible" (lo pide el enunciado explícitamente).
ipcMain.handle("get-usuarios", requireRole('administrador')(withAudit('Usuarios', 'acceso')(
    async () => {
        return await getUsuarios();
    }
)));

ipcMain.handle("update-usuario", requireRole('administrador')(withAudit('Usuarios', 'modificacion')(
    async (event, id, data) => {
        return await updateUsuario(id, data);
    }
)));

ipcMain.handle("delete-usuario", requireRole('administrador')(withAudit('Usuarios', 'baja')(
    async (event, id) => {
        return await eliminarUsuario(id);
    }
)));

// ======================================================
// CLIENTES (lectura: admin y empleado / escritura: solo admin)
// ======================================================

ipcMain.handle("get-clientes", async () => {
    return await getClientes();
});

ipcMain.handle("get-clientes-by-id", async (event, id) => {
    return await getClienteById(id);
});

ipcMain.handle("add-cliente", requireRole('administrador')(withAudit('Clientes', 'alta')(
    async (event, cliente) => {
        return await createCliente(cliente);
    }
)));

ipcMain.handle("update-cliente", requireRole('administrador')(withAudit('Clientes', 'modificacion')(
    async (event, id, data) => {
        return await updateCliente(id, data);
    }
)));

ipcMain.handle("delete-cliente", requireRole('administrador')(withAudit('Clientes', 'baja')(
    async (event, id) => {
        try {
            const result = await eliminarCliente(id);
            return result;
        } catch (error) {
            console.error("Error al eliminar cliente:", error);
            throw error;
        }
    }
)));

// ======================================================
// PROVEEDORES (todo: solo administrador, ni lectura para empleado)
// ======================================================

ipcMain.handle("get-proveedores", requireRole('administrador')(async () => {
    return await getProveedores();
}));

ipcMain.handle("get-proveedor-by-id", requireRole('administrador')(async (event, id) => {
    return await getProveedorById(id);
}));

ipcMain.handle("add-proveedor", requireRole('administrador')(withAudit('Proveedores', 'alta')(
    async (event, proveedor) => {
        return await guardarProveedor(proveedor);
    }
)));

ipcMain.handle("update-proveedor", requireRole('administrador')(withAudit('Proveedores', 'modificacion')(
    async (event, id, data) => {
        return await updateProveedor(id, data);
    }
)));

ipcMain.handle("delete-proveedor", requireRole('administrador')(withAudit('Proveedores', 'baja')(
    async (event, id) => {
        return await eliminarProveedor(id);
    }
)));

// ======================================================
// INVENTARIO (lectura: admin y empleado / escritura: solo admin)
// ======================================================

ipcMain.handle("get-inventario", async () => {
    return await getInventario();
});

ipcMain.handle("get-producto-by-id", async (event, id) => {
    return await getProductoByIdInv(id);
});

ipcMain.handle("get-tipos-producto", async () => {
    return await getTiposProducto();
});

ipcMain.handle("guardar-producto", requireRole('administrador')(withAudit('Inventario', 'alta')(
    async (event, producto) => {
        return await guardarProducto(producto);
    }
)));

ipcMain.handle("eliminar-producto", requireRole('administrador')(withAudit('Inventario', 'baja')(
    async (event, id) => {
        return await eliminarProducto(id);
    }
)));

ipcMain.handle("update-producto", requireRole('administrador')(withAudit('Inventario', 'modificacion')(
    async (event, id, data) => {
        return await updateProductoInv(id, data);
    }
)));

// ======================================================
// PROYECTOS (lectura: admin y empleado / escritura: solo admin)
// ======================================================

ipcMain.handle("get-proyectos", async () => {
  return await getProyectos();
});

ipcMain.handle("get-proyecto-by-id", async (event, id) => {
  return await getProyectoById(id);
});

ipcMain.handle("guardar-proyecto", requireRole('administrador')(withAudit('Proyectos', 'alta')(
    async (event, proyecto) => {
        return await guardarProyecto(proyecto);
    }
)));

ipcMain.handle("update-proyecto", requireRole('administrador')(withAudit('Proyectos', 'modificacion')(
    async (event, id, data) => {
        return await updateProyecto(id, data);
    }
)));

ipcMain.handle("eliminar-proyecto", requireRole('administrador')(withAudit('Proyectos', 'baja')(
    async (event, id) => {
        return await eliminarProyecto(id);
    }
)));

// ======================================================
// ESPECIALIDADES (solo administrador, ni lectura para empleado)
// ======================================================

ipcMain.handle("get-especialidades", requireRole('administrador')(async () => {
    return await getEspecialidades();
}));

ipcMain.handle("add-especialidad", requireRole('administrador')(withAudit('Especialidades', 'alta')(
    async (event, especialidad) => {
        return await crearEspecialidad(especialidad);
    }
)));

ipcMain.handle("delete-especialidad", requireRole('administrador')(withAudit('Especialidades', 'baja')(
    async (event, id) => {
        return await eliminarEspecialidad(id);
    }
)));

// ======================================================
// EMPLEADOS (solo administrador, ni lectura para empleado)
// ======================================================

ipcMain.handle("get-empleados", requireRole('administrador')(async () => {
    return await getEmpleados();
}));

ipcMain.handle("get-empleado-by-id", requireRole('administrador')(async (event, id) => {
    return await getEmpleadoById(id);
}));

ipcMain.handle("update-empleado", requireRole('administrador')(withAudit('Empleados', 'modificacion')(
    async (event, id, data) => {
        return await updateEmpleado(id, data);
    }
)));

ipcMain.handle("delete-empleado", requireRole('administrador')(withAudit('Empleados', 'baja')(
    async (event, id) => {
        return await eliminarEmpleado(id);
    }
)));

// ======================================================
// FACTURACIÓN (solo administrador, ni lectura para empleado)
// ======================================================

ipcMain.handle("get-facturacion", requireRole('administrador')(withAudit('Facturación', 'acceso')(
    async () => {
        return await getFacturas();
    }
)));

// Crea la factura y, en el mismo paso, precarga los ítems desde los
// productos ya asignados al proyecto (Producto_Proyecto). Si crearFactura
// falla (p. ej. proyecto sin cliente), nunca llega a crear items.
ipcMain.handle(
    "add-facturacion",
    requireRole("administrador")(
        withAudit("Facturación", "alta")(
            async (event, id_proyecto, fecha) => {
                const factura = await crearFactura(id_proyecto, fecha);
                await crearItemsDesdeProyecto(factura.id_facturacion, id_proyecto);
                return factura;
            }
        )
    )
);

ipcMain.handle("get-factura-detalle", requireRole('administrador')(withAudit('Facturación', 'acceso')(
    async (event, id_facturacion) => {
        return await getFacturaDetalle(id_facturacion);
    }
)));

ipcMain.handle("get-items-factura", requireRole('administrador')(async (event, id_facturacion) => {
    return await getItemsDeFactura(id_facturacion);
}));

ipcMain.handle("agregar-item-manual", requireRole('administrador')(withAudit('Facturación', 'modificacion')(
    async (event, id_facturacion, item) => {
        return await agregarItemManual(id_facturacion, item);
    }
)));

ipcMain.handle("eliminar-item-factura", requireRole('administrador')(withAudit('Facturación', 'modificacion')(
    async (event, id_item) => {
        return await eliminarItemFactura(id_item);
    }
)));

ipcMain.handle("get-pagos-factura", requireRole('administrador')(async (event, id_facturacion) => {
    return await getPagosDeFactura(id_facturacion);
}));

ipcMain.handle("agregar-pago", requireRole('administrador')(withAudit('Facturación', 'modificacion')(
    async (event, id_facturacion, pago) => {
        return await agregarPago(id_facturacion, pago);
    }
)));

ipcMain.handle("eliminar-pago", requireRole('administrador')(withAudit('Facturación', 'modificacion')(
    async (event, id_pago) => {
        return await eliminarPago(id_pago);
    }
)));

// ======================================================
// PRODUCTOS ASIGNADOS A PROYECTO (lectura: admin y empleado / escritura: admin)
// ======================================================
 
ipcMain.handle("get-productos-proyecto", async (event, id_proyecto) => {
    return await getProductosDeProyecto(id_proyecto);
});
 
ipcMain.handle("get-paneles-proyecto", async (event, id_proyecto) => {
    return await getPanelesDeProyecto(id_proyecto);
});
 
ipcMain.handle("asignar-producto-proyecto", requireRole('administrador')(withAudit('Proyectos', 'modificacion')(
    async (event, id_proyecto, id_producto, cantidad) => {
        return await asignarProductoProyecto(id_proyecto, id_producto, cantidad);
    }
)));
 
ipcMain.handle("quitar-producto-proyecto", requireRole('administrador')(withAudit('Proyectos', 'modificacion')(
    async (event, id_proyecto, id_producto) => {
        return await quitarProductoProyecto(id_proyecto, id_producto);
    }
)));
 
// ======================================================
// SIMULACIÓN (solo administrador)
// ======================================================

ipcMain.handle("add-simulacion", requireRole('administrador')(async (event, datos) => {
    return await crearSimulacion(datos);
}));
 
ipcMain.handle("get-simulaciones", requireRole('administrador')(async () => {
    return await getSimulaciones();
}));
 
ipcMain.handle("get-simulacion-by-id", requireRole('administrador')(async (event, id) => {
    return await getSimulacionById(id);
}));
 
ipcMain.handle("delete-simulacion", requireRole('administrador')(async (event, id) => {
    return await eliminarSimulacion(id);
}));

// ======================================================
// AUDITORÍA (solo administrador)
// ======================================================

ipcMain.handle("get-auditoria", requireRole('administrador')(async (event, limite) => {
    return await getAuditoria(limite);
}));

// ======================================================
// LOG / DEBUG
// ======================================================

ipcMain.on("log-message", (event, msg) => {
    console.log("Log from renderer:", msg);
});

// ======================================================
// INICIALIZACIÓN
// ======================================================

app.whenReady().then(async () => {
    try {
        await initDatabase(app);
    } catch (error) {
        console.error('Error inicializando la base de datos:', error);
    }
    createWindow();
}).catch((error) => {
    console.error("An error occurred during app initialization:", error);
});