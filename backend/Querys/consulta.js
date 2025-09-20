import sqlite3 from 'sqlite3'; // Importa la librería

// Crea o abre la base de datos. El segundo argumento es el modo de apertura.

const db = new sqlite3.Database('./backend/db/Paneles.db', (err) => {
  if (err) {
    console.error("Error al conectar a la base de datos:", err.message);
  } else {
    console.log("Conexión a la base de datos 'Paneles.db' establecida exitosamente.");
  }
});

export const getClientes = () => {
  return new Promise((resolve, reject) => {
    db.all("SELECT * FROM Cliente", (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
        console.log("Clientes obtenidos:", rows);
      }
    });
  });
};

/** USUARIOS **/
 export const createUsuario = (usuario) => {
  const stmt = db.prepare('INSERT INTO Usuarios (id_usuario, username, password_hash, rol) VALUES (?,?, ?, ?)');
  const info = stmt.run(usuario.id_usuario, usuario.username, usuario.password_hash, usuario.rol);
  console.log("Usuario creado con ID:", usuario.id_usuario);
  return { ...usuario, id_usuario: info.lastInsertRowid } && getClientes();
};
 const getUsuarios = () => {
  return db.prepare('SELECT * FROM Usuarios').all();
};
 const getUsuarioById = (id) => {
  return db.prepare('SELECT * FROM Usuarios WHERE id_usuario = ?').get(id);
};
 const updateUsuario = (id, rol) => {
  const stmt = db.prepare('UPDATE Usuarios SET rol = ? WHERE id_usuario = ?');
  stmt.run(rol, id);
  return getUsuarioById(id);
};
 const deleteUsuario = (id) => {
  db.prepare('DELETE FROM Usuarios WHERE id_usuario = ?').run(id);
};


/** CLIENTES **/
 export const createCliente = (cliente) => {
  return new Promise((resolve, reject) => {
    try {
      const stmt = db.prepare('INSERT INTO Cliente (nombre, apellido, documento, email, telefono, direccion, codigo_postal) VALUES (?, ?, ?, ?, ?, ?, ?)');
      const info = stmt.run(cliente.nombre, cliente.apellido, cliente.documento, cliente.email, cliente.telefono, cliente.direccion, cliente.codigo_postal || null);
      resolve({ ...cliente, id_cliente: info.lastInsertRowid });
    } catch (err) {
      console.error("Error al agregar cliente:", err.message);
      reject(err);
    }
  });
};
// ...existing code...
 const getClienteById = (id) => {
  return db.prepare('SELECT * FROM Clientes WHERE id_cliente = ?').get(id);
};
 const updateCliente = (id, data) => {
  const fields = Object.keys(data).map(key => `${key} = ?`).join(', ');
  const values = Object.values(data);
  const stmt = db.prepare(`UPDATE Clientes SET ${fields} WHERE id_cliente = ?`);
  stmt.run(...values, id);
  return getClienteById(id);
};
 const deleteCliente = (id) => {
  db.prepare('DELETE FROM Clientes WHERE id_cliente = ?').run(id);
};



/** PROYECTOS **/
export const createProyecto = (proyecto) => {
  const stmt = db.prepare('INSERT INTO Proyectos (id_cliente, ubicacion, tipo_panel, cantidad_paneles, estado, fecha_inicio, fecha_fin) VALUES (?, ?, ?, ?, ?, ?, ?)');
  const info = stmt.run(proyecto.id_cliente, proyecto.ubicacion, proyecto.tipo_panel, proyecto.cantidad_paneles, proyecto.estado, proyecto.fecha_inicio, proyecto.fecha_fin);
  return { ...proyecto, id_proyecto: info.lastInsertRowid };
};
export const getProyectos = () => {
  return db.prepare('SELECT * FROM Proyectos').all();
};
export const getProyectosByCliente = (id_cliente) => {
  return db.prepare('SELECT * FROM Proyectos WHERE id_cliente = ?').all(id_cliente);
};
export const getProyectoById = (id) => {
  return db.prepare('SELECT * FROM Proyectos WHERE id_proyecto = ?').get(id);
};
export const updateProyectoEstado = (id, estado) => {
  const stmt = db.prepare('UPDATE Proyectos SET estado = ? WHERE id_proyecto = ?');
  stmt.run(estado, id);
  return getProyectoById(id);
};
export const deleteProyecto = (id) => {
  db.prepare('DELETE FROM Proyectos WHERE id_proyecto = ?').run(id);
};


// /** INVENTARIO **/
// export const createProducto = (producto: Omit<Inventario, 'id_producto'>): Inventario => {
//   const stmt = db.prepare('INSERT INTO Inventario (nombre_producto, tipo_producto, cantidad_disponible, stock_minimo) VALUES (?, ?, ?, ?)');
//   const info = stmt.run(producto.nombre_producto, producto.tipo_producto, producto.cantidad_disponible, producto.stock_minimo);
//   return { ...producto, id_producto: info.lastInsertRowid as number };
// };
// export const getInventario = (): Inventario[] => {
//   return db.prepare('SELECT * FROM Inventario').all() as Inventario[];
// };
// export const getProductoById = (id: number): Inventario | undefined => {
//   return db.prepare('SELECT * FROM Inventario WHERE id_producto = ?').get(id) as Inventario | undefined;
// };
// export const updateCantidadProducto = (id: number, cantidad: number): Inventario | undefined => {
//   const stmt = db.prepare('UPDATE Inventario SET cantidad_disponible = ? WHERE id_producto = ?');
//   stmt.run(cantidad, id);
//   return getProductoById(id);
// };
// export const deleteProducto = (id: number): void => {
//   db.prepare('DELETE FROM Inventario WHERE id_producto = ?').run(id);
// };


// /** MOVIMIENTOS DE INVENTARIO **/
// export const createMovimiento = (movimiento: Omit<MovimientoInventario, 'id_movimiento'>): MovimientoInventario => {
//   const stmt = db.prepare('INSERT INTO MovimientosInventario (id_producto, tipo_movimiento, cantidad, fecha) VALUES (?, ?, ?, ?)');
//   const info = stmt.run(movimiento.id_producto, movimiento.tipo_movimiento, movimiento.cantidad, movimiento.fecha);
//   return { ...movimiento, id_movimiento: info.lastInsertRowid as number };
// };
// export const getMovimientos = (): MovimientoInventario[] => {
//   return db.prepare('SELECT * FROM MovimientosInventario').all() as MovimientoInventario[];
// };
// export const getMovimientosByProducto = (id_producto: number): MovimientoInventario[] => {
//   return db.prepare('SELECT * FROM MovimientosInventario WHERE id_producto = ?').all(id_producto) as MovimientoInventario[];
// };


// /** FACTURAS **/
// export const createFactura = (factura: Omit<Factura, 'id_factura'>): Factura => {
//   const stmt = db.prepare('INSERT INTO Facturas (id_cliente, id_proyecto, fecha, monto_total) VALUES (?, ?, ?, ?)');
//   const info = stmt.run(factura.id_cliente, factura.id_proyecto, factura.fecha, factura.monto_total);
//   return { ...factura, id_factura: info.lastInsertRowid as number };
// };
// export const getFacturas = (): Factura[] => {
//   return db.prepare('SELECT * FROM Facturas').all() as Factura[];
// };
// export const getFacturasByCliente = (id_cliente: number): Factura[] => {
//   return db.prepare('SELECT * FROM Facturas WHERE id_cliente = ?').all(id_cliente) as Factura[];
// };
// export const updateFactura = (id: number, data: Partial<Omit<Factura, 'id_factura'>>): Factura | undefined => {
//   const fields = Object.keys(data).map(key => `${key} = ?`).join(', ');
//   const values = Object.values(data);
//   const stmt = db.prepare(`UPDATE Facturas SET ${fields} WHERE id_factura = ?`);
//   stmt.run(...values, id);
//   return getFacturaById(id);
// };
// export const deleteFactura = (id: number): void => {
//   db.prepare('DELETE FROM Facturas WHERE id_factura = ?').run(id);
// };


// /** PAGOS **/
// export const createPago = (pago: Omit<Pago, 'id_pago'>): Pago => {
//   const stmt = db.prepare('INSERT INTO Pagos (id_factura, fecha_pago, monto) VALUES (?, ?, ?)');
//   const info = stmt.run(pago.id_factura, pago.fecha_pago, pago.monto);
//   return { ...pago, id_pago: info.lastInsertRowid as number };
// };
// export const getPagos = (): Pago[] => {
//   return db.prepare('SELECT * FROM Pagos').all() as Pago[];
// };
// export const getPagosByFactura = (id_factura: number): Pago[] => {
//   return db.prepare('SELECT * FROM Pagos WHERE id_factura = ?').all(id_factura) as Pago[];
// };


// /** SIMULACIONES **/
// export const createSimulacion = (simulacion: Omit<Simulacion, 'id_simulacion'>): Simulacion => {
//   const stmt = db.prepare('INSERT INTO Simulaciones (id_proyecto, rendimiento_estimado, ahorro_estimado, fecha) VALUES (?, ?, ?, ?)');
//   const info = stmt.run(simulacion.id_proyecto, simulacion.rendimiento_estimado, simulacion.ahorro_estimado, simulacion.fecha);
//   return { ...simulacion, id_simulacion: info.lastInsertRowid as number };
// };
// export const getSimulaciones = (): Simulacion[] => {
//   return db.prepare('SELECT * FROM Simulaciones').all() as Simulacion[];
// };
// export const getSimulacionesByProyecto = (id_proyecto: number): Simulacion[] => {
//   return db.prepare('SELECT * FROM Simulaciones WHERE id_proyecto = ?').all(id_proyecto) as Simulacion[];
// };