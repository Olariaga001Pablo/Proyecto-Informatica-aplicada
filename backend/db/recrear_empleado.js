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
  db.run('PRAGMA foreign_keys = OFF');

  db.run('DROP TABLE IF EXISTS Empleado', (err) => {
    if (err) {
      console.error('Error borrando tabla vieja:', err.message);
    } else {
      console.log('Tabla Empleado vieja eliminada (si existía).');
    }
  });

  db.run(`
    CREATE TABLE Empleado (
        id_empleado INTEGER PRIMARY KEY AUTOINCREMENT,
        id_usuario INTEGER NOT NULL UNIQUE,
        nombre TEXT NOT NULL,
        apellido TEXT NOT NULL,
        direccion TEXT,
        codigo_postal TEXT,
        FOREIGN KEY (id_usuario) REFERENCES Usuarios(id_usuario) ON DELETE CASCADE
    );
  `, (err) => {
    if (err) {
      console.error('Error creando la tabla Empleado:', err.message);
    } else {
      console.log('Tabla Empleado creada con la columna id_usuario.');
    }
    db.run('PRAGMA foreign_keys = ON', () => {
      db.close();
    });
  });
});