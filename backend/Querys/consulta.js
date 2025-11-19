import { createRequire } from 'module';
// Usar require para obtener la versión CommonJS de sqlite3 y así poder llamar a .verbose()
const requireC = createRequire(import.meta.url);
const sqlite3 = requireC('sqlite3').verbose();
import path from 'path';
import { app } from 'electron';
import fs from 'fs';

// No inicializamos la conexión a la base de datos en tiempo de import
// porque necesitamos que la app de Electron esté lista y que
// process.resourcesPath esté correctamente establecido en el empaquetado.
let db = null;
let dbPath = null;

export async function initDatabase(electronApp = app) {
  const userData = electronApp.getPath('userData');
  const dbFolder = path.join(userData, 'db');
  dbPath = path.join(dbFolder, 'Paneles.db');

  // Crear carpeta si no existe
  if (!fs.existsSync(dbFolder)) {
    fs.mkdirSync(dbFolder, { recursive: true });
  }

  // Si no existe la DB, copiar la que está en /backend/db/
  const packagedDb = path.join(process.resourcesPath || '', 'backend', 'db', 'Paneles.db');
  const devDb = path.resolve('backend', 'db', 'Paneles.db');

  // Si no existe la DB en userData, copiar la que está en /backend/db/
  const source = fs.existsSync(packagedDb) ? packagedDb : devDb;
  if (!fs.existsSync(source)) {
    throw new Error(`No se encontró la base de datos de origen en: ${source}`);
  }

  // Si no existe el destino, copiar. Si existe pero está vacío (sin tablas), reescribirlo.
  const shouldCopy = !fs.existsSync(dbPath);
  if (!shouldCopy) {
    // comprobar si la DB de destino tiene tablas
    const Database = sqlite3.Database;
    const tableCount = await new Promise((resolve) => {
      const tmpDb = new Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
        if (err) return resolve(0);
        tmpDb.get("SELECT count(*) as cnt FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'", (err, row) => {
          if (err) resolve(0);
          else resolve(row?.cnt || 0);
          tmpDb.close();
        });
      });
    });
    if (tableCount === 0) {
      // reescribir con la DB de origen
      fs.copyFileSync(source, dbPath);
      console.log('Base de datos destino estaba vacía. Copiada DB de origen a:', dbPath);
    }
  } else {
    fs.copyFileSync(source, dbPath);
    console.log('Base de datos copiada a:', dbPath);
  }

  console.log('Usando base de datos en:', dbPath);

  db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('Error al conectar a la base:', err.message);
    } else {
      console.log('Conexión exitosa a Paneles.db');
    }
  });

  return db;
}

function getDbOrThrow() {
  if (!db) throw new Error('Base de datos no inicializada. Llama a initDatabase(app) desde el proceso main antes de usar las consultas.');
  return db;
}

// ======================================
// ===  FUNCIONES DE USUARIOS  ========
// ======================================

export const createUsuario = (usuario) => {
  return new Promise((resolve, reject) => {
    const database = getDbOrThrow();
    const stmt = database.prepare('INSERT INTO Usuarios (id_usuario, username, password_hash, rol) VALUES (?, ?, ?, ?)');
    stmt.run(usuario.id_usuario, usuario.username, usuario.password_hash, usuario.rol, function(err) {
      if (err) {
        reject(err);
      } else {
        console.log("Usuario creado con ID:", this.lastID);
        resolve({ ...usuario, id_usuario: this.lastID });
      }
    });
  });
};

// ======================================
// ===  FUNCIONES DE CLIENTES  ========
// ======================================

export const getClientes = () => {
  return new Promise((resolve, reject) => {
    const database = getDbOrThrow();
    database.all("SELECT * FROM Cliente", (err, rows) => {
      if (err) {
        reject(err);
      } else {
        console.log("Clientes obtenidos:", rows);
        resolve(rows);
      }
    });
  });
};

export const createCliente = (cliente) => {
  return new Promise((resolve, reject) => {
    const database = getDbOrThrow();
    const stmt = database.prepare('INSERT INTO Cliente (nombre, apellido, documento, email, telefono, direccion, codigo_postal) VALUES (?, ?, ?, ?, ?, ?, ?)');
    stmt.run(cliente.nombre, cliente.apellido, cliente.documento, cliente.email, cliente.telefono, cliente.direccion, cliente.codigo_postal || null, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve({ ...cliente, id_cliente: this.lastID });
      }
    });
  });
};

export const getClienteById = (id) => {
  return new Promise((resolve, reject) => {
    const database = getDbOrThrow();
    database.get('SELECT * FROM Cliente WHERE id_cliente = ?', [id], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
};

export const updateCliente = (id, data) => {
  return new Promise((resolve, reject) => {
    const fields = Object.keys(data).map(key => `${key} = ?`).join(', ');
    const values = Object.values(data);
    const database = getDbOrThrow();
    database.run(`UPDATE Cliente SET ${fields} WHERE id_cliente = ?`, [...values, id], function(err) {
      if (err) {
        reject(err);
      } else {
        resolve({ changes: this.changes });
      }
    });
  });
};

export const eliminarCliente = (id) => {
  return new Promise((resolve, reject) => {
    const database = getDbOrThrow();
    database.run('DELETE FROM Cliente WHERE id_cliente = ?', id, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve({ changes: this.changes });
      }
    });
  });
};

// ======================================
// ===  FUNCIONES DE PROVEEDORES  ========
// ======================================

export const getProveedores = () => {
  return new Promise((resolve, reject) => {
    const database = getDbOrThrow();
    database.all("SELECT * FROM Proveedor", (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

export const guardarProveedor = (proveedor) => {
  return new Promise((resolve, reject) => {
    const database = getDbOrThrow();
    const stmt = database.prepare('INSERT INTO Proveedor (nombre, email, telefono, direccion, codigo_postal) VALUES (?, ?, ?, ?, ?)');
    stmt.run(proveedor.nombre, proveedor.email, proveedor.telefono, proveedor.direccion, proveedor.codigo_postal, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve({ ...proveedor, id_proveedor: this.lastID });
      }
    });
  });
};

export const getProveedorById = (id) => {
  return new Promise((resolve, reject) => {
    const database = getDbOrThrow();
    database.get('SELECT * FROM Proveedor WHERE id_proveedor = ?', [id], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
};

export const updateProveedor = (id, data) => {
  return new Promise((resolve, reject) => {
    const fields = Object.keys(data).map(key => `${key} = ?`).join(', ');
    const values = Object.values(data);
    const database = getDbOrThrow();
    database.run(`UPDATE Proveedor SET ${fields} WHERE id_proveedor = ?`, [...values, id], function(err) {
      if (err) {
        reject(err);
      } else {
        resolve({ changes: this.changes });
      }
    });
  });
};

export const eliminarProveedor = (id) => {
  return new Promise((resolve, reject) => {
    const database = getDbOrThrow();
    database.run('DELETE FROM Proveedor WHERE id_proveedor = ?', id, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve({ changes: this.changes });
      }
    });
  });
};

// ======================================
// ===  FUNCIONES DE INVENTARIO  ========
// ======================================

export const getInventario = () => {
  return new Promise((resolve, reject) => {
    const database = getDbOrThrow();
    database.all("SELECT P.*, Pr.nombre AS proveedor_nombre FROM Producto P LEFT JOIN Proveedor Pr ON P.id_proveedor = Pr.id_proveedor", (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

export const guardarProducto = (producto) => {
  return new Promise((resolve, reject) => {
    const database = getDbOrThrow();
    const stmt = database.prepare('INSERT INTO Producto (nombre, tipo, precio, stock, id_proveedor) VALUES (?, ?, ?, ?, ?)');
    stmt.run(
      producto.nombre,
      producto.tipo,
      producto.precio,
      producto.stock,
      producto.proveedor,
      function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ ...producto, id_producto: this.lastID });
        }
      }
    );
  });
};

export const getProductoById = (id) => {
  return new Promise((resolve, reject) => {
    const database = getDbOrThrow();
    database.get('SELECT P.*, Pr.nombre AS proveedor_nombre FROM Producto P LEFT JOIN Proveedor Pr ON P.id_proveedor = Pr.id_proveedor WHERE P.id_producto = ?', [id], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
};

export const updateProducto = (id, data) => {
  return new Promise((resolve, reject) => {
    const fields = Object.keys(data).map(key => `${key} = ?`).join(', ');
    const values = Object.values(data);
    const database = getDbOrThrow();
    database.run(`UPDATE Producto SET ${fields} WHERE id_producto = ?`, [...values, id], function(err) {
      if (err) {
        reject(err);
      } else {
        resolve({ changes: this.changes });
      }
    });
  });
};

export const eliminarProducto = (id) => {
  return new Promise((resolve, reject) => {
    const database = getDbOrThrow();
    database.run('DELETE FROM Producto WHERE id_producto = ?', id, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve({ changes: this.changes });
      }
    });
  });
};

// ======================================
// ===  FUNCIONES DE PROYECTOS  ========
// ======================================

export const getProyectos = () => {
  return new Promise((resolve, reject) => {
    const database = getDbOrThrow();
    database.all(
      `SELECT P.*, C.nombre AS cliente_nombre, C.apellido AS cliente_apellido
       FROM Proyecto P
       LEFT JOIN Cliente C ON P.id_cliente = C.id_cliente`,
      (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      }
    );
  });
};

export const guardarProyecto = (proyecto) => {
  return new Promise((resolve, reject) => {
    const database = getDbOrThrow();
    const stmt = database.prepare(
      `INSERT INTO Proyecto (tipo, costo, duracion, fecha, direccion, codigo, id_cliente)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    );
    stmt.run(
      proyecto.tipo,
      proyecto.costo,
      proyecto.duracion,
      proyecto.fecha,
      proyecto.direccion,
      proyecto.codigo,
      proyecto.id_cliente || null,
      function (err) {
        if (err) reject(err);
        else resolve({ ...proyecto, id_proyecto: this.lastID });
      }
    );
  });
};

export const getProyectoById = (id) => {
  return new Promise((resolve, reject) => {
    const database = getDbOrThrow();
    database.get(
      `SELECT P.*, C.nombre AS cliente_nombre, C.apellido AS cliente_apellido
       FROM Proyecto P
       LEFT JOIN Cliente C ON P.id_cliente = C.id_cliente
       WHERE P.id_proyecto = ?`,
      [id],
      (err, row) => {
        if (err) reject(err);
        else resolve(row);
      }
    );
  });
};

export const updateProyecto = (id, data) => {
  return new Promise((resolve, reject) => {
    const fields = Object.keys(data).map((key) => `${key} = ?`).join(", ");
    const values = Object.values(data);
    const database = getDbOrThrow();
    database.run(
      `UPDATE Proyecto SET ${fields} WHERE id_proyecto = ?`,
      [...values, id],
      function (err) {
        if (err) reject(err);
        else resolve({ changes: this.changes });
      }
    );
  });
};

export const eliminarProyecto = (id) => {
  return new Promise((resolve, reject) => {
    const database = getDbOrThrow();
    database.run("DELETE FROM Proyecto WHERE id_proyecto = ?", id, function (err) {
      if (err) reject(err);
      else resolve({ changes: this.changes });
    });
  });
};

// ======================================
// ===  FUNCIONES DE FACTURACION  ========
// ======================================

export const getFacturas = () => {
  return new Promise((resolve, reject) => {
    const database = getDbOrThrow();
    database.all("SELECT F.id_facturacion, F.fecha AS fecha_facturacion, P.tipo AS tipo_proyecto, P.costo AS costo_proyecto, P.duracion AS duracion_dias, P.direccion AS ubicacion_proyecto, P.codigo AS codigo_proyecto, C.nombre AS nombre_cliente, C.telefono AS telefono_cliente, C.id_cliente FROM Facturacion F INNER JOIN Proyecto P ON F.id_proyecto = P.id_proyecto INNER JOIN Cliente C ON F.id_cliente = C.id_cliente ORDER BY F.id_facturacion DESC;", (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}