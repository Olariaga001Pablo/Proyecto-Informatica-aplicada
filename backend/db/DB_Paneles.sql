PRAGMA foreign_keys = ON;

-- ==========================
-- TABLA USUARIOS (central)
-- ==========================
CREATE TABLE Usuarios (
    id_usuario     INTEGER PRIMARY KEY AUTOINCREMENT,
    username       TEXT NOT NULL UNIQUE,
    password_hash  TEXT NOT NULL,
    rol            TEXT NOT NULL CHECK(rol IN ('admin', 'cliente', 'empleado'))
);

-- ==========================
-- CLIENTES Y EMPLEADOS (extienden Usuarios)
-- ==========================
CREATE TABLE Clientes (
    id_cliente     INTEGER PRIMARY KEY,
    nombre         TEXT NOT NULL,
    documento      TEXT NOT NULL UNIQUE,
    direccion      TEXT,
    telefono       TEXT,
    email          TEXT UNIQUE,
    FOREIGN KEY (id_cliente) REFERENCES Usuarios(id_usuario) ON DELETE CASCADE
);

CREATE TABLE Empleados (
    id_empleado    INTEGER PRIMARY KEY,
    nombre         TEXT NOT NULL,
    especialidad   TEXT,
    telefono       TEXT,
    FOREIGN KEY (id_empleado) REFERENCES Usuarios(id_usuario) ON DELETE CASCADE
);

-- ==========================
-- PROVEEDORES
-- ==========================
CREATE TABLE Proveedores (
    id_proveedor   INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre         TEXT NOT NULL,
    contacto       TEXT,
    telefono       TEXT,
    email          TEXT UNIQUE
);

-- ==========================
-- INVENTARIO Y MOVIMIENTOS
-- ==========================
CREATE TABLE Inventario (
    id_producto    INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre         TEXT NOT NULL,
    tipo           TEXT NOT NULL,
    stock_actual   INTEGER NOT NULL DEFAULT 0,
    stock_minimo   INTEGER NOT NULL DEFAULT 0,
    id_proveedor   INTEGER,
    FOREIGN KEY (id_proveedor) REFERENCES Proveedores(id_proveedor) ON DELETE SET NULL
);

CREATE TABLE MovimientosInventario (
    id_movimiento  INTEGER PRIMARY KEY AUTOINCREMENT,
    id_producto    INTEGER NOT NULL,
    fecha          DATE NOT NULL,
    tipo_movimiento TEXT NOT NULL CHECK(tipo_movimiento IN ('entrada', 'salida')),
    cantidad       INTEGER NOT NULL CHECK(cantidad > 0),
    FOREIGN KEY (id_producto) REFERENCES Inventario(id_producto) ON DELETE CASCADE
);

-- ==========================
-- PROYECTOS Y SIMULACIONES
-- ==========================
CREATE TABLE Proyectos (
    id_proyecto    INTEGER PRIMARY KEY AUTOINCREMENT,
    id_cliente     INTEGER NOT NULL,
    ubicacion      TEXT NOT NULL,
    tipo_panel     TEXT,
    cantidad_paneles INTEGER,
    estado         TEXT CHECK(estado IN ('planificacion','en_proceso','completado')),
    fecha_inicio   DATE,
    fecha_fin      DATE,
    FOREIGN KEY (id_cliente) REFERENCES Clientes(id_cliente) ON DELETE CASCADE
);

CREATE TABLE Simulaciones (
    id_simulacion  INTEGER PRIMARY KEY AUTOINCREMENT,
    id_proyecto    INTEGER NOT NULL,
    rendimiento_estimado REAL,
    ahorro_estimado REAL,
    FOREIGN KEY (id_proyecto) REFERENCES Proyectos(id_proyecto) ON DELETE CASCADE
);

-- ==========================
-- FACTURAS, DETALLES Y PAGOS
-- ==========================
CREATE TABLE Facturas (
    id_factura     INTEGER PRIMARY KEY AUTOINCREMENT,
    id_cliente     INTEGER NOT NULL,
    id_proyecto    INTEGER NOT NULL,
    fecha          DATE NOT NULL,
    monto_total    REAL NOT NULL,
    FOREIGN KEY (id_cliente) REFERENCES Clientes(id_cliente) ON DELETE CASCADE,
    FOREIGN KEY (id_proyecto) REFERENCES Proyectos(id_proyecto) ON DELETE CASCADE
);

CREATE TABLE DetalleFactura (
    id_detalle     INTEGER PRIMARY KEY AUTOINCREMENT,
    id_factura     INTEGER NOT NULL,
    id_producto    INTEGER NOT NULL,
    cantidad       INTEGER NOT NULL CHECK(cantidad > 0),
    precio_unitario REAL NOT NULL CHECK(precio_unitario >= 0),
    FOREIGN KEY (id_factura) REFERENCES Facturas(id_factura) ON DELETE CASCADE,
    FOREIGN KEY (id_producto) REFERENCES Inventario(id_producto) ON DELETE RESTRICT
);

CREATE TABLE Pagos (
    id_pago        INTEGER PRIMARY KEY AUTOINCREMENT,
    id_factura     INTEGER NOT NULL,
    fecha_pago     DATE NOT NULL,
    monto          REAL NOT NULL CHECK(monto > 0),
    FOREIGN KEY (id_factura) REFERENCES Facturas(id_factura) ON DELETE CASCADE
);

-- ==========================
-- RELACIÓN N:M EMPLEADOS <-> PROYECTOS
-- ==========================
CREATE TABLE EmpleadoProyecto (
    id_empleado    INTEGER NOT NULL,
    id_proyecto    INTEGER NOT NULL,
    PRIMARY KEY (id_empleado, id_proyecto),
    FOREIGN KEY (id_empleado) REFERENCES Empleados(id_empleado) ON DELETE CASCADE,
    FOREIGN KEY (id_proyecto) REFERENCES Proyectos(id_proyecto) ON DELETE CASCADE
);

-- =========================================
-- VISTA: HistorialCliente
-- =========================================
CREATE VIEW HistorialCliente AS
SELECT 
    c.id_cliente,
    c.nombre AS cliente_nombre,
    c.documento,
    c.email,
    p.id_proyecto,
    p.ubicacion,
    p.tipo_panel,
    p.estado,
    f.id_factura,
    f.fecha AS fecha_factura,
    f.monto_total
FROM Clientes c
LEFT JOIN Proyectos p ON c.id_cliente = p.id_cliente
LEFT JOIN Facturas f ON p.id_proyecto = f.id_proyecto;
