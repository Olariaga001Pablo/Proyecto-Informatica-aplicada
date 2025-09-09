-- Proyecto: Gestión de Paneles Solares

-- =====================================
-- TABLA USUARIOS
-- =====================================
CREATE TABLE Usuarios (
    id_usuario INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre_usuario TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    rol TEXT CHECK(rol IN ('admin','empleado','cliente')) NOT NULL
);

-- =====================================
-- TABLA CLIENTES
-- =====================================
CREATE TABLE Clientes (
    id_cliente INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    dni_ruc TEXT NOT NULL UNIQUE,           
    direccion TEXT NOT NULL,
    telefono TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE
);

-- =====================================
-- TABLA PROYECTOS
-- =====================================
CREATE TABLE Proyectos (
    id_proyecto INTEGER PRIMARY KEY AUTOINCREMENT,
    id_cliente INTEGER NOT NULL,
    ubicacion TEXT NOT NULL,
    tipo_panel TEXT NOT NULL,
    cantidad_paneles INTEGER NOT NULL,
    estado TEXT CHECK(estado IN ('planificacion','en_proceso','completado')) NOT NULL,
    fecha_inicio TEXT,
    fecha_fin TEXT,
    FOREIGN KEY (id_cliente) REFERENCES Clientes(id_cliente) ON DELETE CASCADE
);

-- =====================================
-- TABLA INVENTARIO
-- =====================================
CREATE TABLE Inventario (
    id_producto INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre_producto TEXT NOT NULL,
    tipo_producto TEXT CHECK(tipo_producto IN ('panel','inversor','estructura')) NOT NULL,
    cantidad_disponible INTEGER NOT NULL DEFAULT 0,
    stock_minimo INTEGER NOT NULL DEFAULT 5
);

-- =====================================
-- TABLA MOVIMIENTOS DE INVENTARIO
-- =====================================
CREATE TABLE MovimientosInventario (
    id_movimiento INTEGER PRIMARY KEY AUTOINCREMENT,
    id_producto INTEGER NOT NULL,
    tipo_movimiento TEXT CHECK(tipo_movimiento IN ('entrada','salida')) NOT NULL,
    cantidad INTEGER NOT NULL,
    fecha TEXT NOT NULL,
    FOREIGN KEY (id_producto) REFERENCES Inventario(id_producto) ON DELETE CASCADE
);

-- =====================================
-- TABLA FACTURAS
-- =====================================
CREATE TABLE Facturas (
    id_factura INTEGER PRIMARY KEY AUTOINCREMENT,
    id_cliente INTEGER NOT NULL,
    id_proyecto INTEGER NOT NULL,
    fecha TEXT NOT NULL,
    monto_total REAL NOT NULL,
    FOREIGN KEY (id_cliente) REFERENCES Clientes(id_cliente) ON DELETE CASCADE,
    FOREIGN KEY (id_proyecto) REFERENCES Proyectos(id_proyecto) ON DELETE CASCADE
);

-- =====================================
-- TABLA PAGOS
-- =====================================
CREATE TABLE Pagos (
    id_pago INTEGER PRIMARY KEY AUTOINCREMENT,
    id_factura INTEGER NOT NULL,
    fecha_pago TEXT NOT NULL,
    monto REAL NOT NULL,
    FOREIGN KEY (id_factura) REFERENCES Facturas(id_factura) ON DELETE CASCADE
);

-- =====================================
-- TABLA SIMULACIONES
-- =====================================
CREATE TABLE Simulaciones (
    id_simulacion INTEGER PRIMARY KEY AUTOINCREMENT,
    id_proyecto INTEGER NOT NULL,
    rendimiento_estimado REAL NOT NULL,
    ahorro_estimado REAL NOT NULL,
    fecha TEXT NOT NULL,
    FOREIGN KEY (id_proyecto) REFERENCES Proyectos(id_proyecto) ON DELETE CASCADE
);

-- =====================================
-- VISTA HISTORIAL DE CLIENTES
-- =====================================
CREATE VIEW HistorialCliente AS
SELECT c.id_cliente,
       c.nombre,
       f.id_factura,
       f.fecha AS fecha_factura,
       f.monto_total,
       p.id_proyecto,
       p.ubicacion,
       p.tipo_panel,
       p.cantidad_paneles,
       p.estado
FROM Clientes c
LEFT JOIN Facturas f ON f.id_cliente = c.id_cliente
LEFT JOIN Proyectos p ON p.id_cliente = c.id_cliente;
