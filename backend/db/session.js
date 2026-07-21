import { registrarAuditoria } from '../Querys/consulta.js';

// Guarda quién está logueado AHORA en el proceso main (memoria del proceso, no en el renderer).

let currentUser = null;
 
export function setCurrentUser(user) {
  currentUser = user;
}
 
export function getCurrentUser() {
  return currentUser;
}
 
export function clearCurrentUser() {
  currentUser = null;
}
 
// Uso: ipcMain.handle('canal', requireRole('administrador')(async (event, ...) => {...}))
// Podés pasar uno o varios roles permitidos.
export function requireRole(...rolesPermitidos) {
  return function (handler) {
    return async (event, ...args) => {
      if (!currentUser) {
        throw new Error('No autenticado. Debe iniciar sesión.');
      }
      if (!rolesPermitidos.includes(currentUser.rol)) {
        throw new Error(
          `Acceso denegado: esta acción requiere rol ${rolesPermitidos.join(' o ')}.`
        );
      }
      return handler(event, ...args);
    };
  };
}


export function withAudit(modulo, tipoEvento) {
  return (handler) => async (...args) => {
    const usuario = getCurrentUser();
    try {
      const resultado = await handler(...args);
      await registrarAuditoria({
        id_usuario: usuario?.id_usuario,
        rol: usuario?.rol,
        tipo_evento: tipoEvento,
        modulo,
        resultado: 'exito'
      });
      return resultado;
    } catch (err) {
      await registrarAuditoria({
        id_usuario: usuario?.id_usuario,
        rol: usuario?.rol,
        tipo_evento: tipoEvento,
        modulo,
        resultado: 'error'
      });
      throw err;
    }
  };
}