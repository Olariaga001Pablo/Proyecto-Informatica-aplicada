		PRAGMA foreign_keys = ON;

		CREATE TABLE Usuarios (
			id_usuario      INTEGER PRIMARY KEY AUTOINCREMENT,
			email           TEXT NOT NULL UNIQUE,
			password_hash   TEXT NOT NULL,
			rol             TEXT NOT NULL CHECK (rol IN ('administrador', 'empleado')),
			activo          INTEGER NOT NULL DEFAULT 1 CHECK (activo IN (0,1)),
			fecha_creacion  TEXT DEFAULT (datetime('now'))
		);
		
		
		-------------------Tabla Empleados-------------------
		CREATE TABLE Empleado (
			id_empleado INTEGER PRIMARY KEY AUTOINCREMENT,
			id_usuario INTEGER NOT NULL UNIQUE,
			nombre TEXT NOT NULL,
			apellido TEXT NOT NULL,
			direccion TEXT,
			codigo_postal TEXT,
			FOREIGN KEY (id_usuario) REFERENCES Usuarios(id_usuario) ON DELETE CASCADE
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
			id_producto     INTEGER PRIMARY KEY AUTOINCREMENT,
			nombre          TEXT NOT NULL,
			precio          REAL NOT NULL CHECK(precio >= 0),
			stock           INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
			umbral_minimo   INTEGER NOT NULL DEFAULT 0 CHECK (umbral_minimo >= 0),
			id_proveedor    INTEGER,
			id_tipo         INTEGER NOT NULL,
			potencia_w      REAL CHECK (potencia_w IS NULL OR potencia_w > 0),
			FOREIGN KEY (id_tipo) REFERENCES TipoProducto(id_tipo),
			FOREIGN KEY (id_proveedor) REFERENCES Proveedor(id_proveedor) ON DELETE SET NULL
		);

		CREATE TABLE TipoProducto (
			id_tipo INTEGER PRIMARY KEY AUTOINCREMENT,
			nombre  TEXT NOT NULL UNIQUE
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

		CREATE TABLE Auditoria (
		id_auditoria    INTEGER PRIMARY KEY AUTOINCREMENT,
		id_usuario      INTEGER,
		rol             TEXT,
		tipo_evento     TEXT NOT NULL,   -- login, logout, alta, modificacion, baja, acceso
		modulo          TEXT NOT NULL,   -- Clientes, Proyectos, Usuarios, etc.
		resultado       TEXT NOT NULL,   -- exito, error
		fecha_hora      TEXT NOT NULL,   -- ISO 8601 (new Date().toISOString())
		origen          TEXT,            -- hostname de la máquina
		FOREIGN KEY (id_usuario) REFERENCES Usuarios(id_usuario) ON DELETE SET NULL
	);
	
	CREATE TABLE Simulacion (
    id_simulacion         INTEGER PRIMARY KEY AUTOINCREMENT,
    id_proyecto           INTEGER NOT NULL,
    cantidad_paneles      INTEGER NOT NULL CHECK(cantidad_paneles > 0),
    potencia_panel_w      REAL NOT NULL CHECK(potencia_panel_w > 0),
    horas_sol_dia         REAL NOT NULL CHECK(horas_sol_dia > 0),
    consumo_previo_kwh    REAL NOT NULL CHECK(consumo_previo_kwh >= 0),
    tarifa_kwh            REAL NOT NULL CHECK(tarifa_kwh >= 0),
    produccion_mensual_kwh REAL NOT NULL,
    ahorro_estimado       REAL NOT NULL,
    fecha                 TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (id_proyecto) REFERENCES Proyecto(id_proyecto) ON DELETE CASCADE
	);
