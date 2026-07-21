// backend/db/recrear_facturacion.js
//
// Borra la tabla Facturacion (con las facturas de prueba que ya no
// sirven) y la crea de nuevo sin id_cliente, según la corrección de
// 3FN. No hace falta tocar ItemFactura ni RegistroPagos: solo
// referencian id_facturacion, que no cambia de forma.
//
// Corré esto UNA vez (desde la raíz del proyecto):
//   node backend/db/recrear_facturacion.js

import { createRequire } from 'module';
const requireC = createRequire(import.meta.url);
const sqlite3 = requireC('sqlite3').verbose();
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'Paneles.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('No se pudo abrir la base:', err.message);
    process.exit(1);
  }
  console.log('Conectado a', dbPath);
});

db.serialize(() => {
  db.run('DROP TABLE IF EXISTS Facturacion', (err) => {
    if (err) {
      console.error('Error borrando tabla vieja:', err.message);
    } else {
      console.log('Tabla Facturacion vieja eliminada (con sus facturas de prueba).');
    }
  });

  db.run(`
    CREATE TABLE Facturacion (
        id_facturacion INTEGER PRIMARY KEY AUTOINCREMENT,
        id_proyecto    INTEGER NOT NULL,
        fecha          TEXT,
        FOREIGN KEY (id_proyecto) REFERENCES Proyecto(id_proyecto) ON DELETE CASCADE
    );
  `, (err) => {
    if (err) {
      console.error('Error creando la tabla Facturacion:', err.message);
    } else {
      console.log('Tabla Facturacion creada sin id_cliente (3FN).');
    }
    db.close();
  });
});