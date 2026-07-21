
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
  db.run('DROP TABLE IF EXISTS Usuarios', (err) => {
    if (err) {
      console.error('Error borrando tabla vieja:', err.message);
    } else {
      console.log('Tabla Usuarios vieja eliminada (si existía).');
    }
  });
 
  db.run(`
    CREATE TABLE Usuarios (
        id_usuario      INTEGER PRIMARY KEY AUTOINCREMENT,
        email           TEXT NOT NULL UNIQUE,
        password_hash   TEXT NOT NULL,
        rol             TEXT NOT NULL CHECK (rol IN ('administrador', 'empleado')),
        activo          INTEGER NOT NULL DEFAULT 1 CHECK (activo IN (0,1)),
        fecha_creacion  TEXT DEFAULT (datetime('now'))
    );
  `, (err) => {
    if (err) {
      console.error('Error creando la tabla Usuarios:', err.message);
    } else {
      console.log('Tabla Usuarios creada con la columna email.');
    }
    db.close();
  });
});