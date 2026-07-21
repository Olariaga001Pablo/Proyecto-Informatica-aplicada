import { createRequire } from 'module';
// Usar require para obtener la versión CommonJS de sqlite3 y así poder llamar a .verbose()
const requireC = createRequire(import.meta.url);
const sqlite3 = requireC('sqlite3').verbose();
import path from 'path';
import { app } from 'electron';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import os from 'os';

const SALT_ROUNDS = 10;

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
      db.run('PRAGMA foreign_keys = ON')
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
  return new Promise(async (resolve, reject) => {
    const database = getDbOrThrow();

    let hash;
    try {
      hash = await bcrypt.hash(usuario.password, SALT_ROUNDS);
    } catch (err) {
      return reject(err);
    }

    database.serialize(() => {
      database.run("BEGIN TRANSACTION");

      database.run(
        "INSERT INTO Usuarios (email, password_hash, rol) VALUES (?, ?, ?)",
        [usuario.email, hash, usuario.rol],
        function (err) {
          if (err) {
            database.run("ROLLBACK");
            return reject(err);
          }

          const idUsuario = this.lastID;

          // Si es administrador termina acá
          if (usuario.rol === "administrador") {
            database.run("COMMIT");
            return resolve({
              id_usuario: idUsuario,
              email: usuario.email,
              rol: usuario.rol
            });
          }

          // Si es empleado crea también la ficha del empleado
          database.run(
            `INSERT INTO Empleado
            (id_usuario, nombre, apellido, direccion, codigo_postal)
            VALUES (?, ?, ?, ?, ?)`,
            [
              idUsuario,
              usuario.nombre,
              usuario.apellido,
              usuario.direccion || null,
              usuario.codigo_postal || null
            ],
            function (err) {
              if (err) {
                database.run("ROLLBACK");
                return reject(err);
              }

              const idEmpleado = this.lastID;
              const especialidades = usuario.especialidades || [];

              if (especialidades.length === 0) {
                database.run("COMMIT");
                return resolve({
                  id_usuario: idUsuario,
                  id_empleado: idEmpleado
                });
              }

              const stmt = database.prepare(
                `INSERT INTO Empleado_Especialidad
                (id_empleado,id_especialidad)
                VALUES (?,?)`
              );

              let pendientes = especialidades.length;
              let huboError = false;

              especialidades.forEach((idEsp) => {
                stmt.run(idEmpleado, idEsp, (err) => {
                  if (err && !huboError) {
                    huboError = true;
                    database.run("ROLLBACK");
                    return reject(err);
                  }

                  pendientes--;

                  if (pendientes === 0 && !huboError) {
                    stmt.finalize();
                    database.run("COMMIT");
                    resolve({
                      id_usuario: idUsuario,
                      id_empleado: idEmpleado
                    });
                  }
                });
              });
            }
          );
        }
      );
    });
  });
};

// Verifica usuario y contraseña. Devuelve el usuario (sin el hash)
// si es válido, o null si el usuario no existe o la contraseña
// no coincide.
export const loginUsuario = (email, password) => {
  return new Promise((resolve, reject) => {
    const database = getDbOrThrow();
    database.get(
      'SELECT * FROM Usuarios WHERE email = ? AND activo = 1',
      [email],
      (err, row) => {
        if (err) return reject(err);
        if (!row) return resolve(null);
        bcrypt.compare(password, row.password_hash, (err, match) => {
          if (err) return reject(err);
          if (!match) return resolve(null);
          const { password_hash, ...usuarioSinPassword } = row;
          resolve(usuarioSinPassword);
        });
      }
    );
  });
};

export const getUsuarios = () => {
  return new Promise((resolve, reject) => {
    const database = getDbOrThrow();
    database.all(
      'SELECT id_usuario, email, rol, activo, fecha_creacion FROM Usuarios',
      (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      }
    );
  });
};

// data puede incluir: email, rol, activo, password (opcional).
// Si viene password, se re-hashea. Si no viene, no se toca el hash actual.
export const updateUsuario = (id, data) => {
  return new Promise(async (resolve, reject) => {
    try {
      const database = getDbOrThrow();
      const campos = { ...data };
      if (campos.password) {
        campos.password_hash = await bcrypt.hash(campos.password, SALT_ROUNDS);
        delete campos.password;
      }
      const fields = Object.keys(campos).map((key) => `${key} = ?`).join(', ');
      const values = Object.values(campos);
      database.run(
        `UPDATE Usuarios SET ${fields} WHERE id_usuario = ?`,
        [...values, id],
        function (err) {
          if (err) reject(err);
          else resolve({ changes: this.changes });
        }
      );
    } catch (err) {
      reject(err);
    }
  });
};

// Baja lógica en lugar de DELETE, para no perder trazabilidad
// de quién creó/modificó registros históricos (facturas, proyectos, etc.)
export const eliminarUsuario = (id) => {
  return new Promise((resolve, reject) => {
    const database = getDbOrThrow();
    database.run(
      'UPDATE Usuarios SET activo = 0 WHERE id_usuario = ?',
      id,
      function (err) {
        if (err) reject(err);
        else resolve({ changes: this.changes });
      }
    );
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
    database.all(
      `SELECT
      P.*,
      TP.nombre AS tipo,
          Pr.nombre AS proveedor_nombre
      FROM Producto P
      JOIN TipoProducto TP
          ON P.id_tipo = TP.id_tipo
      LEFT JOIN Proveedor Pr
          ON P.id_proveedor = Pr.id_proveedor`,
       (err, rows) => {
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
    const stmt = database.prepare('INSERT INTO Producto (nombre, id_tipo, potencia_w, precio, stock, id_proveedor, umbral_minimo) VALUES (?, ?, ?, ?, ?, ?, ? )');
    stmt.run(
      producto.nombre,
      producto.id_tipo,
      producto.potencia_w || null,
      producto.precio,
      producto.stock,
      producto.id_proveedor,
      producto.umbral_minimo || 0,
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
    database.get(
      `SELECT P.*, TP.nombre AS tipo, Pr.nombre AS proveedor_nombre
       FROM Producto P
       JOIN TipoProducto TP ON P.id_tipo = TP.id_tipo
       LEFT JOIN Proveedor Pr ON P.id_proveedor = Pr.id_proveedor
       WHERE P.id_producto = ?`,
      [id],
      (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      }
    );
  });
};

export const getTiposProducto = () => {
  return new Promise((resolve, reject) => {
    const database = getDbOrThrow();
    database.all("SELECT * FROM TipoProducto", (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
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


const asignarEmpleadosAProyecto = (database, idProyecto, empleados = []) => {
  return new Promise((resolve, reject) => {
    database.run('DELETE FROM Empleado_Proyecto WHERE id_proyecto = ?', idProyecto, (err) => {
      if (err) return reject(err);
      if (!empleados || empleados.length === 0) return resolve();
 
      const stmt = database.prepare(
        'INSERT INTO Empleado_Proyecto (id_proyecto, id_empleado) VALUES (?, ?)'
      );
      let pendientes = empleados.length;
      let huboError = false;
 
      empleados.forEach((idEmpleado) => {
        stmt.run(idProyecto, idEmpleado, (err) => {
          if (err && !huboError) {
            huboError = true;
            return reject(err);
          }
          pendientes -= 1;
          if (pendientes === 0 && !huboError) resolve();
        });
      });
    });
  });
};

export const guardarProyecto = (proyecto) => {
  return new Promise((resolve, reject) => {
    const database = getDbOrThrow();

    const stmt = database.prepare(
      `INSERT INTO Proyecto
      (tipo, costo, duracion, fecha, direccion, codigo, id_cliente)
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
      async function (err) {
        if (err) return reject(err);

        const idProyecto = this.lastID;

        try {
          await asignarEmpleadosAProyecto(
            database,
            idProyecto,
            proyecto.empleados
          );

          resolve({
            ...proyecto,
            id_proyecto: idProyecto
          });
        } catch (e) {
          reject(e);
        }
      }
    );
  });
};

export const getProyectos = () => {
  return new Promise((resolve, reject) => {
    const database = getDbOrThrow();
    database.all(
      `SELECT P.*, C.nombre AS cliente_nombre, C.apellido AS cliente_apellido,
              GROUP_CONCAT(E.nombre || ' ' || E.apellido, ', ') AS empleados_nombres
       FROM Proyecto P
       LEFT JOIN Cliente C ON P.id_cliente = C.id_cliente
       LEFT JOIN Empleado_Proyecto EP ON P.id_proyecto = EP.id_proyecto
       LEFT JOIN Empleado E ON EP.id_empleado = E.id_empleado
       GROUP BY P.id_proyecto`,
      (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
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
      (err, proyecto) => {
        if (err) return reject(err);
        if (!proyecto) return resolve(null);
 
        database.all(
          `SELECT E.id_empleado, E.nombre, E.apellido
           FROM Empleado_Proyecto EP
           JOIN Empleado E ON EP.id_empleado = E.id_empleado
           WHERE EP.id_proyecto = ?`,
          [id],
          (err, empleados) => {
            if (err) return reject(err);
            resolve({ ...proyecto, empleados });
          }
        );
      }
    );
  });
};

export const updateProyecto = (id, data) => {
  return new Promise((resolve, reject) => {
    const database = getDbOrThrow();
    const { empleados, ...camposProyecto } = data;
 
    const aplicarDatosBasicos = () => {
      return new Promise((res, rej) => {
        if (Object.keys(camposProyecto).length === 0) return res();
        const fields = Object.keys(camposProyecto).map((key) => `${key} = ?`).join(', ');
        const values = Object.values(camposProyecto);
        database.run(
          `UPDATE Proyecto SET ${fields} WHERE id_proyecto = ?`,
          [...values, id],
          (err) => (err ? rej(err) : res())
        );
      });
    };
 
    const aplicarEmpleados = () => {
      if (empleados === undefined) return Promise.resolve(); // no vino el campo, no tocar
      return asignarEmpleadosAProyecto(database, id, empleados);
    };
 
    aplicarDatosBasicos()
      .then(aplicarEmpleados)
      .then(() => resolve({ changes: 1 }))
      .catch(reject);
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
// ===  PRODUCTOS ASIGNADOS A PROYECTO  =
// ======================================

// Asigna un producto a un proyecto con una cantidad y descuenta del stock
// solo la diferencia respecto a la cantidad previamente asignada (si el
// producto ya estaba asignado, esto es un upsert). Rechaza si no hay
// stock suficiente. Todo dentro de una transacción para no dejar el
// stock desincronizado si algo falla a mitad de camino.
export const asignarProductoProyecto = (id_proyecto, id_producto, cantidad) => {
  return new Promise((resolve, reject) => {
    const database = getDbOrThrow();
    database.serialize(() => {
      database.run("BEGIN TRANSACTION");

      database.get(
        'SELECT cantidad FROM Producto_Proyecto WHERE id_proyecto = ? AND id_producto = ?',
        [id_proyecto, id_producto],
        (err, row) => {
          if (err) {
            database.run("ROLLBACK");
            return reject(err);
          }

          const cantidadPrevia = row ? row.cantidad : 0;
          const diferencia = cantidad - cantidadPrevia; // lo que hay que descontar del stock

          database.get(
            'SELECT stock FROM Producto WHERE id_producto = ?',
            [id_producto],
            (err, prod) => {
              if (err) {
                database.run("ROLLBACK");
                return reject(err);
              }
              if (!prod) {
                database.run("ROLLBACK");
                return reject(new Error('Producto inexistente'));
              }
              if (diferencia > prod.stock) {
                database.run("ROLLBACK");
                return reject(new Error('Stock insuficiente'));
              }

              database.run(
                `INSERT INTO Producto_Proyecto (id_proyecto, id_producto, cantidad)
                 VALUES (?, ?, ?)
                 ON CONFLICT(id_proyecto, id_producto) DO UPDATE SET cantidad = excluded.cantidad`,
                [id_proyecto, id_producto, cantidad],
                function (err) {
                  if (err) {
                    database.run("ROLLBACK");
                    return reject(err);
                  }

                  database.run(
                    'UPDATE Producto SET stock = stock - ? WHERE id_producto = ?',
                    [diferencia, id_producto],
                    (err) => {
                      if (err) {
                        database.run("ROLLBACK");
                        return reject(err);
                      }
                      database.run("COMMIT");
                      resolve({ changes: this.changes });
                    }
                  );
                }
              );
            }
          );
        }
      );
    });
  });
};

export const getProductosDeProyecto = (id_proyecto) => {
  return new Promise((resolve, reject) => {
    const database = getDbOrThrow();
    database.all(
      `SELECT
          PP.id_proyecto,
          PP.id_producto,
          PP.cantidad,
          P.nombre,
          TP.nombre AS tipo,
          P.potencia_w
       FROM Producto_Proyecto PP
       INNER JOIN Producto P
           ON PP.id_producto = P.id_producto
       INNER JOIN TipoProducto TP
           ON P.id_tipo = TP.id_tipo
       WHERE PP.id_proyecto = ?`,
      [id_proyecto],
      (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      }
    );
  });
};

// Quita un producto de un proyecto y devuelve al stock la cantidad que
// tenía asignada.
export const quitarProductoProyecto = (id_proyecto, id_producto) => {
  return new Promise((resolve, reject) => {
    const database = getDbOrThrow();
    database.serialize(() => {
      database.run("BEGIN TRANSACTION");

      database.get(
        'SELECT cantidad FROM Producto_Proyecto WHERE id_proyecto = ? AND id_producto = ?',
        [id_proyecto, id_producto],
        (err, row) => {
          if (err) {
            database.run("ROLLBACK");
            return reject(err);
          }
          if (!row) {
            database.run("ROLLBACK");
            return resolve({ changes: 0 }); // no había nada asignado
          }

          database.run(
            'DELETE FROM Producto_Proyecto WHERE id_proyecto = ? AND id_producto = ?',
            [id_proyecto, id_producto],
            function (err) {
              if (err) {
                database.run("ROLLBACK");
                return reject(err);
              }

              database.run(
                'UPDATE Producto SET stock = stock + ? WHERE id_producto = ?',
                [row.cantidad, id_producto],
                (err) => {
                  if (err) {
                    database.run("ROLLBACK");
                    return reject(err);
                  }
                  database.run("COMMIT");
                  resolve({ changes: this.changes });
                }
              );
            }
          );
        }
      );
    });
  });
};

// Agrega la cantidad total de paneles y la potencia PONDERADA (por si el
// proyecto mezcla paneles de distinta potencia) de un proyecto, leyendo
// directamente de Producto_Proyecto + Producto. Esto es lo que va a usar
// crearSimulacion en vez de recibir esos números a mano.
export const getPanelesDeProyecto = (id_proyecto) => {
  return new Promise((resolve, reject) => {
    const database = getDbOrThrow();
    database.get(
      `SELECT
          COALESCE(SUM(PP.cantidad), 0) AS cantidad_paneles,
          CASE WHEN SUM(PP.cantidad) > 0
               THEN SUM(PP.cantidad * P.potencia_w) * 1.0 / SUM(PP.cantidad)
               ELSE 0
          END AS potencia_panel_w
       FROM Producto_Proyecto PP
       INNER JOIN Producto P ON PP.id_producto = P.id_producto
       WHERE PP.id_proyecto = ? AND P.id_tipo = 1`,
      [id_proyecto],
      (err, row) => {
        if (err) reject(err);
        else resolve(row); // { cantidad_paneles, potencia_panel_w }
      }
    );
  });
};
 
// ======================================
// ===  FUNCIONES DE ESPECIALIDADES  ===
// ======================================
 
export const getEspecialidades = () => {
  return new Promise((resolve, reject) => {
    const database = getDbOrThrow();
    database.all("SELECT * FROM Especialidad", (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};
 
export const crearEspecialidad = (especialidad) => {
  return new Promise((resolve, reject) => {
    const database = getDbOrThrow();
    const stmt = database.prepare(
      'INSERT INTO Especialidad (titulo, matricula) VALUES (?, ?)'
    );
    stmt.run(especialidad.titulo, especialidad.matricula || null, function (err) {
      if (err) reject(err);
      else resolve({ ...especialidad, id_especialidad: this.lastID });
    });
  });
};
 
export const eliminarEspecialidad = (id) => {
  return new Promise((resolve, reject) => {
    const database = getDbOrThrow();
    // ON DELETE CASCADE en Empleado_Especialidad se encarga de limpiar
    // las asignaciones a empleados automáticamente.
    database.run('DELETE FROM Especialidad WHERE id_especialidad = ?', id, function (err) {
      if (err) reject(err);
      else resolve({ changes: this.changes });
    });
  });
};
 
// ======================================
// ===  FUNCIONES DE EMPLEADOS  ========
// ======================================
 
export const getEmpleados = () => {
  return new Promise((resolve, reject) => {
    const database = getDbOrThrow();
    // GROUP_CONCAT arma una lista de especialidades por empleado en
    // una sola consulta, en vez de hacer N+1 queries.
    // JOIN con Usuarios + filtro activo=1 para no listar empleados dados de baja.
    database.all(
      `SELECT E.*, GROUP_CONCAT(Es.titulo, ', ') AS especialidades
       FROM Empleado E
       INNER JOIN Usuarios U ON E.id_usuario = U.id_usuario
       LEFT JOIN Empleado_Especialidad EE ON E.id_empleado = EE.id_empleado
       LEFT JOIN Especialidad Es ON EE.id_especialidad = Es.id_especialidad
       WHERE U.activo = 1
       GROUP BY E.id_empleado`,
      (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      }
    );
  });
};
 
export const getEmpleadoById = (id) => {
  return new Promise((resolve, reject) => {
    const database = getDbOrThrow();
    database.get('SELECT * FROM Empleado WHERE id_empleado = ?', [id], (err, empleado) => {
      if (err) return reject(err);
      if (!empleado) return resolve(null);
 
      database.all(
        `SELECT Es.id_especialidad, Es.titulo
         FROM Empleado_Especialidad EE
         JOIN Especialidad Es ON EE.id_especialidad = Es.id_especialidad
         WHERE EE.id_empleado = ?`,
        [id],
        (err, especialidades) => {
          if (err) return reject(err);
          resolve({ ...empleado, especialidades });
        }
      );
    });
  });
};
 
 
export const updateEmpleado = (id, data) => {
  return new Promise((resolve, reject) => {
    const database = getDbOrThrow();
    const { especialidades, ...camposEmpleado } = data;
 
    const aplicarDatosBasicos = () => {
      return new Promise((res, rej) => {
        if (Object.keys(camposEmpleado).length === 0) return res();
        const fields = Object.keys(camposEmpleado).map((key) => `${key} = ?`).join(', ');
        const values = Object.values(camposEmpleado);
        database.run(
          `UPDATE Empleado SET ${fields} WHERE id_empleado = ?`,
          [...values, id],
          (err) => (err ? rej(err) : res())
        );
      });
    };
 
    const aplicarEspecialidades = () => {
      return new Promise((res, rej) => {
        if (!especialidades) return res(); // no vino el campo, no tocar relaciones
        database.run('DELETE FROM Empleado_Especialidad WHERE id_empleado = ?', id, (err) => {
          if (err) return rej(err);
          if (especialidades.length === 0) return res();
 
          const stmtRel = database.prepare(
            'INSERT INTO Empleado_Especialidad (id_empleado, id_especialidad) VALUES (?, ?)'
          );
          let pendientes = especialidades.length;
          especialidades.forEach((idEsp) => {
            stmtRel.run(id, idEsp, (err) => {
              if (err) return rej(err);
              pendientes -= 1;
              if (pendientes === 0) res();
            });
          });
        });
      });
    };
 
    aplicarDatosBasicos()
      .then(aplicarEspecialidades)
      .then(() => resolve({ changes: 1 }))
      .catch(reject);
  });
};

export const eliminarEmpleado = (id) => {
  return new Promise((resolve, reject) => {
    const database = getDbOrThrow();

    database.get(
      "SELECT id_usuario FROM Empleado WHERE id_empleado = ?",
      [id],
      (err, empleado) => {
        if (err) return reject(err);
        if (!empleado) return reject(new Error("Empleado inexistente"));

        // Baja lógica (igual que eliminarUsuario), no DELETE físico:
        // preserva la trazabilidad si el empleado está vinculado a
        // proyectos o facturas históricas.
        database.run(
          "UPDATE Usuarios SET activo = 0 WHERE id_usuario = ?",
          [empleado.id_usuario],
          function (err) {
            if (err) return reject(err);
            resolve({ changes: this.changes });
          }
        );
      }
    );
  });
};
// ======================================
// ===  FUNCIONES DE FACTURACION  ========
// ======================================

export const crearFactura = (id_proyecto, fecha) => {
  return new Promise((resolve, reject) => {
    const database = getDbOrThrow();
 
    database.get(
      'SELECT id_cliente FROM Proyecto WHERE id_proyecto = ?',
      [id_proyecto],
      (err, proyecto) => {
        if (err) return reject(err);
        if (!proyecto) return reject(new Error('Proyecto inexistente'));
        if (!proyecto.id_cliente) {
          return reject(new Error('El proyecto no tiene un cliente asociado'));
        }
 
        database.run(
          'INSERT INTO Facturacion (id_proyecto, fecha) VALUES (?, ?)',
          [id_proyecto, fecha],
          function (err) {
            if (err) reject(err);
            else resolve({ id_facturacion: this.lastID, id_proyecto, fecha });
          }
        );
      }
    );
  });
};
 
export const getFacturas = () => {
  return new Promise((resolve, reject) => {
    const database = getDbOrThrow();
    database.all(
      `SELECT F.id_facturacion, F.fecha AS fecha_facturacion,
              P.tipo AS tipo_proyecto, P.costo AS costo_proyecto,
              P.duracion AS duracion_dias, P.direccion AS ubicacion_proyecto,
              P.codigo AS codigo_proyecto,
              C.nombre AS nombre_cliente, C.telefono AS telefono_cliente, C.id_cliente
       FROM Facturacion F
       INNER JOIN Proyecto P ON F.id_proyecto = P.id_proyecto
       INNER JOIN Cliente C ON P.id_cliente = C.id_cliente
       ORDER BY F.id_facturacion DESC`,
      (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      }
    );
  });
};
 
// ======================================
// ===  ITEMS DE FACTURA  ==============
// ======================================
 
// Trae los productos ya asignados al proyecto de la factura y los
// inserta como ítems, tomando el precio ACTUAL de cada producto como
// snapshot (si el precio cambia después en Inventario, esta factura
// no se altera). Se llama justo después de crearFactura.
export const crearItemsDesdeProyecto = (id_facturacion, id_proyecto) => {
  return new Promise((resolve, reject) => {
    const database = getDbOrThrow();
 
    database.all(
      `SELECT PP.id_producto, PP.cantidad, P.nombre, P.precio
       FROM Producto_Proyecto PP
       INNER JOIN Producto P ON PP.id_producto = P.id_producto
       WHERE PP.id_proyecto = ?`,
      [id_proyecto],
      (err, productos) => {
        if (err) return reject(err);
        if (productos.length === 0) return resolve([]);
 
        const stmt = database.prepare(
          `INSERT INTO ItemFactura (id_facturacion, descripcion, id_producto, cantidad, precio_unitario)
           VALUES (?, ?, ?, ?, ?)`
        );
        let pendientes = productos.length;
        const itemsCreados = [];
        let huboError = false;
 
        productos.forEach((p) => {
          stmt.run(
            id_facturacion,
            p.nombre,
            p.id_producto,
            p.cantidad,
            p.precio,
            function (err) {
              if (err && !huboError) {
                huboError = true;
                return reject(err);
              }
              itemsCreados.push({ id_item: this.lastID, ...p });
              pendientes -= 1;
              if (pendientes === 0 && !huboError) resolve(itemsCreados);
            }
          );
        });
      }
    );
  });
};
 
// Ítem manual (sin producto): mano de obra, cableado, etc.
export const agregarItemManual = (id_facturacion, item) => {
  return new Promise((resolve, reject) => {
    const database = getDbOrThrow();
    const stmt = database.prepare(
      `INSERT INTO ItemFactura (id_facturacion, descripcion, id_producto, cantidad, precio_unitario)
       VALUES (?, ?, NULL, ?, ?)`
    );
    stmt.run(
      id_facturacion,
      item.descripcion,
      item.cantidad || 1,
      item.precio_unitario,
      function (err) {
        if (err) reject(err);
        else resolve({ id_item: this.lastID, ...item });
      }
    );
  });
};
 
export const getItemsDeFactura = (id_facturacion) => {
  return new Promise((resolve, reject) => {
    const database = getDbOrThrow();
    database.all(
      'SELECT * FROM ItemFactura WHERE id_facturacion = ? ORDER BY id_item',
      [id_facturacion],
      (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      }
    );
  });
};
 
export const eliminarItemFactura = (id_item) => {
  return new Promise((resolve, reject) => {
    const database = getDbOrThrow();
    database.run('DELETE FROM ItemFactura WHERE id_item = ?', id_item, function (err) {
      if (err) reject(err);
      else resolve({ changes: this.changes });
    });
  });
};
 
// ======================================
// ===  REGISTRO DE PAGOS  =============
// ======================================
 
export const agregarPago = (id_facturacion, pago) => {
  return new Promise((resolve, reject) => {
    const database = getDbOrThrow();
    const stmt = database.prepare(
      `INSERT INTO RegistroPagos (fecha, metodo_pago, monto_pago, estado, id_facturacion)
       VALUES (?, ?, ?, ?, ?)`
    );
    stmt.run(
      pago.fecha,
      pago.metodo_pago,
      pago.monto_pago,
      pago.estado || 'confirmado',
      id_facturacion,
      function (err) {
        if (err) reject(err);
        else resolve({ id_pago: this.lastID, ...pago });
      }
    );
  });
};
 
export const getPagosDeFactura = (id_facturacion) => {
  return new Promise((resolve, reject) => {
    const database = getDbOrThrow();
    database.all(
      'SELECT * FROM RegistroPagos WHERE id_facturacion = ? ORDER BY fecha',
      [id_facturacion],
      (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      }
    );
  });
};
 
export const eliminarPago = (id_pago) => {
  return new Promise((resolve, reject) => {
    const database = getDbOrThrow();
    database.run('DELETE FROM RegistroPagos WHERE id_pago = ?', id_pago, function (err) {
      if (err) reject(err);
      else resolve({ changes: this.changes });
    });
  });
};
 
// ======================================
// ===  DETALLE COMPLETO DE FACTURA  ===
// ======================================
 
// Trae la factura + sus ítems + sus pagos + los totales calculados
// (total facturado, total pagado, saldo pendiente). Esto es lo que
// resuelve el punto 3 que charlamos: acá SÍ se calcula el total real,
// en vez de asumir Proyecto.costo.
export const getFacturaDetalle = (id_facturacion) => {
  return new Promise((resolve, reject) => {
    const database = getDbOrThrow();
 
    database.get(
      `SELECT F.id_facturacion, F.fecha, F.id_proyecto,
              P.tipo AS tipo_proyecto, P.codigo AS codigo_proyecto, P.costo AS costo_presupuestado,
              C.nombre AS cliente_nombre, C.apellido AS cliente_apellido
       FROM Facturacion F
       INNER JOIN Proyecto P ON F.id_proyecto = P.id_proyecto
       INNER JOIN Cliente C ON P.id_cliente = C.id_cliente
       WHERE F.id_facturacion = ?`,
      [id_facturacion],
      (err, factura) => {
        if (err) return reject(err);
        if (!factura) return resolve(null);
 
        database.all(
          'SELECT * FROM ItemFactura WHERE id_facturacion = ?',
          [id_facturacion],
          (err, items) => {
            if (err) return reject(err);
 
            database.all(
              'SELECT * FROM RegistroPagos WHERE id_facturacion = ?',
              [id_facturacion],
              (err, pagos) => {
                if (err) return reject(err);
 
                const totalFacturado = items.reduce(
                  (acc, i) => acc + i.cantidad * i.precio_unitario, 0
                );
                const totalPagado = pagos.reduce((acc, p) => acc + p.monto_pago, 0);
 
                resolve({
                  ...factura,
                  items,
                  pagos,
                  total_facturado: totalFacturado,
                  total_pagado: totalPagado,
                  saldo_pendiente: totalFacturado - totalPagado
                });
              }
            );
          }
        );
      }
    );
  });
};
 
// ======================================
// ===  FUNCIONES DE AUDITORÍA  ========
// ======================================
 
// Registra un evento de auditoría. Nunca debe romper la operación principal:
// si falla el insert de auditoría, solo se loguea en consola y se sigue.
export const registrarAuditoria = ({ id_usuario = null, rol = null, tipo_evento, modulo, resultado }) => {
  return new Promise((resolve) => {
    try {
      const database = getDbOrThrow();
      database.run(
        `INSERT INTO Auditoria (id_usuario, rol, tipo_evento, modulo, resultado, fecha_hora, origen)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [id_usuario, rol, tipo_evento, modulo, resultado, new Date().toISOString(), os.hostname()],
        (err) => {
          if (err) console.error('No se pudo registrar auditoría:', err.message);
          resolve();
        }
      );
    } catch (err) {
      console.error('No se pudo registrar auditoría:', err.message);
      resolve();
    }
  });
};
 
export const getAuditoria = (limite = 200) => {
  return new Promise((resolve, reject) => {
    const database = getDbOrThrow();
    database.all(
      `SELECT A.*, U.email AS usuario_email
       FROM Auditoria A
       LEFT JOIN Usuarios U ON A.id_usuario = U.id_usuario
       ORDER BY A.fecha_hora DESC
       LIMIT ?`,
      [limite],
      (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      }
    );
  });
};

// ======================================
// ===  FUNCIONES DE SIMULACIÓN  =======
// ===  (RF11: rendimiento energético,  =
// ===   RF12: ahorro estimado)         =
// ======================================
 
export const crearSimulacion = (datos) => {
  return new Promise((resolve, reject) => {
    const database = getDbOrThrow();
 
    const {
      id_proyecto,
      cantidad_paneles,
      potencia_panel_w,
      horas_sol_dia,
      consumo_previo_kwh,
      tarifa_kwh
    } = datos;
 
    // RF11: producción mensual estimada (kWh)
    const produccion_mensual_kwh =
      (cantidad_paneles * potencia_panel_w * horas_sol_dia * 30) / 1000;
 
    // RF12: ahorro estimado. No se acredita excedente por encima del
    // consumo previo (no contempla inyección a red).
    const kwhAprovechados = Math.min(produccion_mensual_kwh, consumo_previo_kwh);
    const ahorro_estimado = kwhAprovechados * tarifa_kwh;
 
    const stmt = database.prepare(
      `INSERT INTO Simulacion
        (id_proyecto, cantidad_paneles, potencia_panel_w, horas_sol_dia,
         consumo_previo_kwh, tarifa_kwh, produccion_mensual_kwh, ahorro_estimado)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    );
 
    stmt.run(
      id_proyecto,
      cantidad_paneles,
      potencia_panel_w,
      horas_sol_dia,
      consumo_previo_kwh,
      tarifa_kwh,
      produccion_mensual_kwh,
      ahorro_estimado,
      function (err) {
        if (err) {
          reject(err);
        } else {
          resolve({
            id_simulacion: this.lastID,
            produccion_mensual_kwh,
            ahorro_estimado
          });
        }
      }
    );
  });
};
 
export const getSimulaciones = () => {
  return new Promise((resolve, reject) => {
    const database = getDbOrThrow();
    database.all(
      `SELECT S.*, P.tipo AS tipo_proyecto, P.codigo AS codigo_proyecto,
              C.nombre AS cliente_nombre, C.apellido AS cliente_apellido
       FROM Simulacion S
       INNER JOIN Proyecto P ON S.id_proyecto = P.id_proyecto
       LEFT JOIN Cliente C ON P.id_cliente = C.id_cliente
       ORDER BY S.id_simulacion DESC`,
      (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      }
    );
  });
};
 
export const getSimulacionById = (id) => {
  return new Promise((resolve, reject) => {
    const database = getDbOrThrow();
    database.get(
      `SELECT S.*, p.codigo AS codigo_proyecto, P.tipo AS tipo_proyecto, C.nombre AS cliente_nombre
       FROM Simulacion S
       INNER JOIN Proyecto P ON S.id_proyecto = P.id_proyecto
       LEFT JOIN Cliente C ON P.id_cliente = C.id_cliente
       WHERE S.id_simulacion = ?`,
      [id],
      (err, row) => {
        if (err) reject(err);
        else resolve(row);
      }
    );
  });
};
 
export const eliminarSimulacion = (id) => {
  return new Promise((resolve, reject) => {
    const database = getDbOrThrow();
    database.run('DELETE FROM Simulacion WHERE id_simulacion = ?', id, function (err) {
      if (err) reject(err);
      else resolve({ changes: this.changes });
    });
  });
};
 