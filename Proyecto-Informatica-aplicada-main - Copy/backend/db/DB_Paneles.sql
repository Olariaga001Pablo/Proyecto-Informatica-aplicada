PRAGMA foreign_keys = ON;
 
 -------------------Tabla Empleados-------------------
CREATE TABLE Empleado (
	id_empleado INTEGER PRIMARY KEY AUTOINCREMENT,
	nombre TEXT NOT NULL, 
	apellido TEXT NOT NULL,
	direccion TEXT,
	codigo_postal TEXT
);

----Tabla Especialidad y Relacion N:M con Empleado----
CREATE TABLE Especialidad (
	id_especialidad INTEGER PRIMARY KEY AUTOINCREMENT,
	titulo TEXT NOT NULL,
	matricula TEXT
);

CREATE TABLE Empleado_Especialidad (
	id_empleado INTEGER NOT NULL,
	id_especialidad INTEGER NOT NULL,
	PRIMARY KEY (id_empleado, id_especialidad),
	FOREIGN KEY (id_empleado) REFERENCES Empleado(id_empleado) ON DELETE CASCADE,
	FOREIGN KEY (id_especialidad) REFERENCES Especialidad(id_especialidad) ON DELETE CASCADE
);

---------------------Tabla Cliente--------------------
CREATE TABLE Cliente (
	id_cliente INTEGER PRIMARY KEY AUTOINCREMENT,
	nombre TEXT NOT NULL, 
	apellido TEXT NOT NULL,
	documento TEXT NOT NULL UNIQUE, ----Asegura que no haya duplicados
	email TEXT NOT NULL UNIQUE,
	telefono TEXT,
	direccion TEXT,
	codigo_postal TEXT
);

------------Tabla de Proveedores y Producto------------
CREATE TABLE Proveedor (
	id_proveedor INTEGER PRIMARY KEY AUTOINCREMENT,
	nombre TEXT NOT NULL, 
	email TEXT,
	telefono TEXT,
	direccion TEXT,
	codigo_postal TEXT
);

CREATE TABLE Producto (
	id_producto INTEGER PRIMARY KEY AUTOINCREMENT,
	nombre TEXT NOT NULL,
	tipo TEXT,
	precio REAL NOT NULL CHECK(precio >= 0),
	stock INTEGER NOT NULL DEFAULT  0 CHECK (stock >= 0),
	id_proveedor INTEGER,
	FOREIGN KEY (id_proveedor) REFERENCES Proveedor(id_proveedor) ON DELETE SET NULL
);

-------------------Tabla de Proyecto-------------------
CREATE TABLE Proyecto (
	id_proyecto INTEGER PRIMARY KEY AUTOINCREMENT,
	tipo TEXT,
	costo REAL CHECK(costo >= 0),
	duracion INTEGER CHECK(duracion >= 0),
	fecha TEXT,
    direccion TEXT,
    codigo TEXT,
	id_cliente INTEGER,
	FOREIGN KEY (id_cliente) REFERENCES Cliente(id_cliente) ON DELETE SET NULL
);

----Relacion N:M de Proyecto con empleado y de Proyecto con Producto----
CREATE TABLE Empleado_Proyecto (
	id_proyecto INTEGER,
	id_empleado INTEGER,
	PRIMARY KEY (id_proyecto, id_empleado),
	FOREIGN KEY (id_proyecto) REFERENCES Proyecto(id_proyecto) ON DELETE CASCADE,
	FOREIGN KEY (id_empleado) REFERENCES Empleado(id_empleado) ON DELETE CASCADE
);

CREATE TABLE Producto_Proyecto (
	id_proyecto INTEGER,
	id_producto INTEGER,
	cantidad INTEGER DEFAULT 1 CHECK(cantidad > 0),
	PRIMARY KEY (id_proyecto, id_producto),
	FOREIGN KEY (id_proyecto) REFERENCES Proyecto(id_proyecto) ON DELETE CASCADE,
	FOREIGN KEY (id_producto) REFERENCES Producto(id_producto) ON DELETE CASCADE
);

--------Tabla de Facturacion, Items y Pagos---------
CREATE TABLE Facturacion (
	id_facturacion INTEGER PRIMARY KEY AUTOINCREMENT,
    id_cliente INTEGER,
    id_proyecto INTEGER,
    fecha TEXT,
    FOREIGN KEY (id_cliente) REFERENCES Cliente(id_cliente) ON DELETE SET NULL,
    FOREIGN KEY (id_proyecto) REFERENCES Proyecto(id_proyecto) ON DELETE SET NULL
);

CREATE TABLE ItemFactura (
    id_item INTEGER PRIMARY KEY AUTOINCREMENT,
    id_facturacion INTEGER NOT NULL,
    descripcion TEXT,
    id_producto INTEGER,
    cantidad INTEGER DEFAULT 1 CHECK(cantidad > 0),
    precio_unitario REAL NOT NULL CHECK(precio_unitario >= 0),
    FOREIGN KEY (id_facturacion) REFERENCES Facturacion(id_facturacion) ON DELETE CASCADE,
    FOREIGN KEY (id_producto) REFERENCES Producto(id_producto) ON DELETE SET NULL
);

CREATE TABLE RegistroPagos (
    id_pago INTEGER PRIMARY KEY AUTOINCREMENT,
    fecha TEXT,
    metodo_pago TEXT,
    monto_pago REAL NOT NULL CHECK(monto_pago >= 0),
    estado TEXT,
    id_facturacion INTEGER,
    FOREIGN KEY (id_facturacion) REFERENCES Facturacion(id_facturacion) ON DELETE CASCADE
);
