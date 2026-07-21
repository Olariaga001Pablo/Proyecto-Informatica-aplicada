
import { createRequire } from 'module';
const requireC = createRequire(import.meta.url);
const sqlite3 = requireC('sqlite3').verbose();
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
 
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
 
const EMAIL = 'admin@paneles.com';
const PASSWORD = 'admin1234';
// -----------------------------------
 
const dbPath = path.join(__dirname, 'Paneles.db');
 
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('No se pudo abrir la base:', err.message);
    process.exit(1);
  }
  console.log('Conectado a', dbPath);
});
 
bcrypt.hash(PASSWORD, 10, (err, hash) => {
  if (err) {
    console.error('Error generando el hash:', err.message);
    db.close();
    return;
  }
 
  const stmt = db.prepare(
    'INSERT INTO Usuarios (email, password_hash, rol) VALUES (?, ?, ?)'
  );
  stmt.run(EMAIL, hash, 'administrador', function (err) {
    if (err) {
      console.error('Error creando el usuario:', err.message);
    } else {
      console.log(`Administrador creado con id ${this.lastID}: ${EMAIL}`);
      console.log('Ya podés loguearte con ese email y la contraseña que pusiste.');
    }
    db.close();
  });
});