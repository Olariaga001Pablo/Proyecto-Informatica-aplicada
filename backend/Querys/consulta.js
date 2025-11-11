import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('./backend/db/Paneles.db', (err) => {
  if (err) {
    console.error("Error al conectar a la base de datos:", err.message);
  } else {
    console.log("Conexión a la base de datos 'Paneles.db' establecida exitosamente.");
  }
});

// ======================================
// ===  FUNCIONES DE USUARIOS  ========
// ======================================

export const createUsuario = (usuario) => {
  return new Promise((resolve, reject) => {
    const stmt = db.prepare('INSERT INTO Usuarios (id_usuario, username, password_hash, rol) VALUES (?, ?, ?, ?)');
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
    db.all("SELECT * FROM Cliente", (err, rows) => {
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
    const stmt = db.prepare('INSERT INTO Cliente (nombre, apellido, documento, email, telefono, direccion, codigo_postal) VALUES (?, ?, ?, ?, ?, ?, ?)');
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
    db.get('SELECT * FROM Cliente WHERE id_cliente = ?', [id], (err, row) => {
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
    db.run(`UPDATE Cliente SET ${fields} WHERE id_cliente = ?`, [...values, id], function(err) {
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
    db.run('DELETE FROM Cliente WHERE id_cliente = ?', id, function(err) {
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
    db.all("SELECT * FROM Proveedor", (err, rows) => {
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
    const stmt = db.prepare('INSERT INTO Proveedor (nombre, email, telefono, direccion, codigo_postal) VALUES (?, ?, ?, ?, ?)');
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
    db.get('SELECT * FROM Proveedor WHERE id_proveedor = ?', [id], (err, row) => {
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
    db.run(`UPDATE Proveedor SET ${fields} WHERE id_proveedor = ?`, [...values, id], function(err) {
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
    db.run('DELETE FROM Proveedor WHERE id_proveedor = ?', id, function(err) {
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
    db.all("SELECT P.*, Pr.nombre AS proveedor_nombre FROM Producto P LEFT JOIN Proveedor Pr ON P.id_proveedor = Pr.id_proveedor", (err, rows) => {
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
    const stmt = db.prepare('INSERT INTO Producto (nombre, tipo, precio, stock, id_proveedor) VALUES (?, ?, ?, ?, ?)');
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
    db.get('SELECT P.*, Pr.nombre AS proveedor_nombre FROM Producto P LEFT JOIN Proveedor Pr ON P.id_proveedor = Pr.id_proveedor WHERE P.id_producto = ?', [id], (err, row) => {
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
    db.run(`UPDATE Producto SET ${fields} WHERE id_producto = ?`, [...values, id], function(err) {
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
    db.run('DELETE FROM Producto WHERE id_producto = ?', id, function(err) {
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
    db.all(
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
    const stmt = db.prepare(
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
    db.get(
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
    db.run(
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
    db.run("DELETE FROM Proyecto WHERE id_proyecto = ?", id, function (err) {
      if (err) reject(err);
      else resolve({ changes: this.changes });
    });
  });
};