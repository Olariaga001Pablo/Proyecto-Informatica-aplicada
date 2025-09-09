
//const db = new Database('solar.db');

// 2. Definición de tipos de datos para las entidades
type Usuario = {
  id_usuario: number;
  nombre_usuario: string;
  password_hash: string;
  rol: 'admin' | 'empleado' | 'cliente';
};

type Cliente = {
  id_cliente: number;
  nombre: string;
  dni_ruc: string;
  direccion: string;
  telefono: string;
  email: string;
};

type Proyecto = {
  id_proyecto: number;
  id_cliente: number;
  ubicacion: string;
  tipo_panel: string;
  cantidad_paneles: number;
  estado: 'planificacion' | 'en_proceso' | 'completado';
  fecha_inicio: string | null;
  fecha_fin: string | null;
};

type Inventario = {
  id_producto: number;
  nombre_producto: string;
  tipo_producto: 'panel' | 'inversor' | 'estructura';
  cantidad_disponible: number;
  stock_minimo: number;
};

type MovimientoInventario = {
  id_movimiento: number;
  id_producto: number;
  tipo_movimiento: 'entrada' | 'salida';
  cantidad: number;
  fecha: string;
};

type Factura = {
  id_factura: number;
  id_cliente: number;
  id_proyecto: number;
  fecha: string;
  monto_total: number;
};

type Pago = {
  id_pago: number;
  id_factura: number;
  fecha_pago: string;
  monto: number;
};

type Simulacion = {
  id_simulacion: number;
  id_proyecto: number;
  rendimiento_estimado: number;
  ahorro_estimado: number;
  fecha: string;
};

// 3. Funciones de queries para cada entidad

/** USUARIOS **/
export const createUsuario = (usuario: Omit<Usuario, 'id_usuario'>): Usuario => {
  const stmt = db.prepare('INSERT INTO Usuarios (nombre_usuario, password_hash, rol) VALUES (?, ?, ?)');
  const info = stmt.run(usuario.nombre_usuario, usuario.password_hash, usuario.rol);
  return { ...usuario, id_usuario: info.lastInsertRowid as number };
};
export const getUsuarios = (): Usuario[] => {
  return db.prepare('SELECT * FROM Usuarios').all() as Usuario[];
};
export const getUsuarioById = (id: number): Usuario | undefined => {
  return db.prepare('SELECT * FROM Usuarios WHERE id_usuario = ?').get(id) as Usuario | undefined;
};
export const updateUsuario = (id: number, rol: Usuario['rol']): Usuario | undefined => {
  const stmt = db.prepare('UPDATE Usuarios SET rol = ? WHERE id_usuario = ?');
  stmt.run(rol, id);
  return getUsuarioById(id);
};
export const deleteUsuario = (id: number): void => {
  db.prepare('DELETE FROM Usuarios WHERE id_usuario = ?').run(id);
};


/** CLIENTES **/
export const createCliente = (cliente: Omit<Cliente, 'id_cliente'>): Cliente => {
  const stmt = db.prepare('INSERT INTO Clientes (nombre, dni_ruc, direccion, telefono, email) VALUES (?, ?, ?, ?, ?)');
  const info = stmt.run(cliente.nombre, cliente.dni_ruc, cliente.direccion, cliente.telefono, cliente.email);
  return { ...cliente, id_cliente: info.lastInsertRowid as number };
};
export const getClientes = (): Cliente[] => {
  return db.prepare('SELECT * FROM Clientes').all() as Cliente[];
};
export const getClienteById = (id: number): Cliente | undefined => {
  return db.prepare('SELECT * FROM Clientes WHERE id_cliente = ?').get(id) as Cliente | undefined;
};
export const updateCliente = (id: number, data: Partial<Omit<Cliente, 'id_cliente'>>): Cliente | undefined => {
  const fields = Object.keys(data).map(key => `${key} = ?`).join(', ');
  const values = Object.values(data);
  const stmt = db.prepare(`UPDATE Clientes SET ${fields} WHERE id_cliente = ?`);
  stmt.run(...values, id);
  return getClienteById(id);
};
export const deleteCliente = (id: number): void => {
  db.prepare('DELETE FROM Clientes WHERE id_cliente = ?').run(id);
};


/** PROYECTOS **/
export const createProyecto = (proyecto: Omit<Proyecto, 'id_proyecto'>): Proyecto => {
  const stmt = db.prepare('INSERT INTO Proyectos (id_cliente, ubicacion, tipo_panel, cantidad_paneles, estado, fecha_inicio, fecha_fin) VALUES (?, ?, ?, ?, ?, ?, ?)');
  const info = stmt.run(proyecto.id_cliente, proyecto.ubicacion, proyecto.tipo_panel, proyecto.cantidad_paneles, proyecto.estado, proyecto.fecha_inicio, proyecto.fecha_fin);
  return { ...proyecto, id_proyecto: info.lastInsertRowid as number };
};
export const getProyectos = (): Proyecto[] => {
  return db.prepare('SELECT * FROM Proyectos').all() as Proyecto[];
};
export const getProyectosByCliente = (id_cliente: number): Proyecto[] => {
  return db.prepare('SELECT * FROM Proyectos WHERE id_cliente = ?').all(id_cliente) as Proyecto[];
};
export const getProyectoById = (id: number): Proyecto | undefined => {
  return db.prepare('SELECT * FROM Proyectos WHERE id_proyecto = ?').get(id) as Proyecto | undefined;
};
export const updateProyectoEstado = (id: number, estado: Proyecto['estado']): Proyecto | undefined => {
  const stmt = db.prepare('UPDATE Proyectos SET estado = ? WHERE id_proyecto = ?');
  stmt.run(estado, id);
  return getProyectoById(id);
};
export const deleteProyecto = (id: number): void => {
  db.prepare('DELETE FROM Proyectos WHERE id_proyecto = ?').run(id);
};


/** INVENTARIO **/
export const createProducto = (producto: Omit<Inventario, 'id_producto'>): Inventario => {
  const stmt = db.prepare('INSERT INTO Inventario (nombre_producto, tipo_producto, cantidad_disponible, stock_minimo) VALUES (?, ?, ?, ?)');
  const info = stmt.run(producto.nombre_producto, producto.tipo_producto, producto.cantidad_disponible, producto.stock_minimo);
  return { ...producto, id_producto: info.lastInsertRowid as number };
};
export const getInventario = (): Inventario[] => {
  return db.prepare('SELECT * FROM Inventario').all() as Inventario[];
};
export const getProductoById = (id: number): Inventario | undefined => {
  return db.prepare('SELECT * FROM Inventario WHERE id_producto = ?').get(id) as Inventario | undefined;
};
export const updateCantidadProducto = (id: number, cantidad: number): Inventario | undefined => {
  const stmt = db.prepare('UPDATE Inventario SET cantidad_disponible = ? WHERE id_producto = ?');
  stmt.run(cantidad, id);
  return getProductoById(id);
};
export const deleteProducto = (id: number): void => {
  db.prepare('DELETE FROM Inventario WHERE id_producto = ?').run(id);
};


/** MOVIMIENTOS DE INVENTARIO **/
export const createMovimiento = (movimiento: Omit<MovimientoInventario, 'id_movimiento'>): MovimientoInventario => {
  const stmt = db.prepare('INSERT INTO MovimientosInventario (id_producto, tipo_movimiento, cantidad, fecha) VALUES (?, ?, ?, ?)');
  const info = stmt.run(movimiento.id_producto, movimiento.tipo_movimiento, movimiento.cantidad, movimiento.fecha);
  return { ...movimiento, id_movimiento: info.lastInsertRowid as number };
};
export const getMovimientos = (): MovimientoInventario[] => {
  return db.prepare('SELECT * FROM MovimientosInventario').all() as MovimientoInventario[];
};
export const getMovimientosByProducto = (id_producto: number): MovimientoInventario[] => {
  return db.prepare('SELECT * FROM MovimientosInventario WHERE id_producto = ?').all(id_producto) as MovimientoInventario[];
};


/** FACTURAS **/
export const createFactura = (factura: Omit<Factura, 'id_factura'>): Factura => {
  const stmt = db.prepare('INSERT INTO Facturas (id_cliente, id_proyecto, fecha, monto_total) VALUES (?, ?, ?, ?)');
  const info = stmt.run(factura.id_cliente, factura.id_proyecto, factura.fecha, factura.monto_total);
  return { ...factura, id_factura: info.lastInsertRowid as number };
};
export const getFacturas = (): Factura[] => {
  return db.prepare('SELECT * FROM Facturas').all() as Factura[];
};
export const getFacturasByCliente = (id_cliente: number): Factura[] => {
  return db.prepare('SELECT * FROM Facturas WHERE id_cliente = ?').all(id_cliente) as Factura[];
};
export const updateFactura = (id: number, data: Partial<Omit<Factura, 'id_factura'>>): Factura | undefined => {
  const fields = Object.keys(data).map(key => `${key} = ?`).join(', ');
  const values = Object.values(data);
  const stmt = db.prepare(`UPDATE Facturas SET ${fields} WHERE id_factura = ?`);
  stmt.run(...values, id);
  return getFacturaById(id);
};
export const deleteFactura = (id: number): void => {
  db.prepare('DELETE FROM Facturas WHERE id_factura = ?').run(id);
};


/** PAGOS **/
export const createPago = (pago: Omit<Pago, 'id_pago'>): Pago => {
  const stmt = db.prepare('INSERT INTO Pagos (id_factura, fecha_pago, monto) VALUES (?, ?, ?)');
  const info = stmt.run(pago.id_factura, pago.fecha_pago, pago.monto);
  return { ...pago, id_pago: info.lastInsertRowid as number };
};
export const getPagos = (): Pago[] => {
  return db.prepare('SELECT * FROM Pagos').all() as Pago[];
};
export const getPagosByFactura = (id_factura: number): Pago[] => {
  return db.prepare('SELECT * FROM Pagos WHERE id_factura = ?').all(id_factura) as Pago[];
};


/** SIMULACIONES **/
export const createSimulacion = (simulacion: Omit<Simulacion, 'id_simulacion'>): Simulacion => {
  const stmt = db.prepare('INSERT INTO Simulaciones (id_proyecto, rendimiento_estimado, ahorro_estimado, fecha) VALUES (?, ?, ?, ?)');
  const info = stmt.run(simulacion.id_proyecto, simulacion.rendimiento_estimado, simulacion.ahorro_estimado, simulacion.fecha);
  return { ...simulacion, id_simulacion: info.lastInsertRowid as number };
};
export const getSimulaciones = (): Simulacion[] => {
  return db.prepare('SELECT * FROM Simulaciones').all() as Simulacion[];
};
export const getSimulacionesByProyecto = (id_proyecto: number): Simulacion[] => {
  return db.prepare('SELECT * FROM Simulaciones WHERE id_proyecto = ?').all(id_proyecto) as Simulacion[];
};