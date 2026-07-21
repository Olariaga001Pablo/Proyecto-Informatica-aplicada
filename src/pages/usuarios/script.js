  // src/pages/usuarios/script.js
  //
  // Un solo script para las 3 pantallas del módulo, mismo patrón que
  // usa Clientes en su script.js (branching por pathname).

  // ---------- Guarda de acceso: solo Administrador entra a este módulo ----------
  async function protegerAccesoAdministrador() {
    try {
      const usuario = await window.authAPI.getCurrentUser();
      if (!usuario || usuario.rol !== 'administrador') {
        alert('Esta sección es solo para administradores.');
        window.location.href = '../../index.html';
      }
    } catch (error) {
      console.error('Error verificando sesión:', error);
      window.location.href = '../usuarios/login.html';
    }
  }

  // ---------- Navegación general ----------
  document.getElementById('home')?.addEventListener('click', () => {
    window.location.href = '../../index.html';
  });

  document.getElementById('btn-add-usuario')?.addEventListener('click', () => {
    window.location.href = 'agregarUsuario.html';
  });

  document.getElementById('btn-volver-lista')?.addEventListener('click', () => {
    window.location.href = 'usuarios.html';
  });

  document.getElementById('btn-cancelar')?.addEventListener('click', () => {
    window.location.href = 'usuarios.html';
  });

  document.getElementById('btn-cancelar-eliminar')?.addEventListener('click', () => {
    window.history.back();
  });

  // ---------- Soporte de errores (mismo patrón que Clientes) ----------
  function mostrarError(mensaje) {
    const errorDiv = document.getElementById('error-msg');
    if (errorDiv) {
      errorDiv.textContent = mensaje;
      errorDiv.style.display = 'flex';
      errorDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      alert(mensaje);
    }
  }

  // ---------- Listado ----------
  async function cargarUsuarios() {
    const contenedor = document.getElementById('contenedor');
    if (!contenedor) return;

    let usuarios = [];
    try {
      usuarios = await window.usuariosAPI.getUsuarios();
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      mostrarError(error.message || 'No se pudieron cargar los usuarios.');
      return;
    }

    const contador = document.getElementById('usuarios-count');
    if (contador) contador.textContent = usuarios.length;

    contenedor.innerHTML = '';

    let fila;
    usuarios.forEach((usuario, index) => {
      if (index % 2 === 0) {
        fila = document.createElement('div');
        fila.className = 'usuarios-fila';
        contenedor.appendChild(fila);
      }

      const card = document.createElement('div');
      card.className = 'usuario-item';
      card.id = usuario.id_usuario;

      card.innerHTML = `
        <div class="usuario-info">
          <h2 class="usuario-nombre">${usuario.email}</h2>
          <p class="usuario-rol">${usuario.rol}</p>
          ${usuario.activo ? '' : '<p class="usuario-inactivo">Desactivado</p>'}
        </div>
        <div class="usuario-actions">
          <button class="btn-cancelar btn-desactivar" value="${usuario.id_usuario}" ${usuario.activo ? '' : 'disabled'}>
            Desactivar
          </button>
        </div>
      `;

      fila.appendChild(card);
    });

    document.querySelectorAll('.btn-desactivar').forEach((boton) => {
      boton.addEventListener('click', (e) => {
        const id = e.currentTarget.value;
        window.location.href = `eliminarUsuario.html?id=${id}`;
      });
    });
  }

  // ---------- Alta ----------
  async function createUsuario() {
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const rol = document.getElementById('rol').value;

    if (!email || !password || !rol) {
      mostrarError("Todos los campos son obligatorios.");
      return;
    }

    const usuario = {
      email,
      password,
      rol
    };

    // Si es empleado agregamos los datos adicionales
    if (rol === "empleado") {

      usuario.nombre = document.getElementById("nombre").value.trim();
      usuario.apellido = document.getElementById("apellido").value.trim();
      usuario.direccion = document.getElementById("direccion").value.trim();
      usuario.codigo_postal = document.getElementById("codigo_postal").value.trim();

      if (!usuario.nombre || !usuario.apellido) {
        mostrarError("Nombre y apellido son obligatorios.");
        return;
      }

      usuario.especialidades = Array.from(
        document.querySelectorAll(
          "#especialidades-checkboxes input[type='checkbox']:checked"
        )
      ).map(cb => Number(cb.value));
    }

    try {
      await window.usuariosAPI.addUsuario(usuario);
      window.location.href = "usuarios.html";
    } catch (error) {
      console.error(error);
      mostrarError(error.message || "No se pudo crear el usuario.");
    }
  }

  async function cargarEspecialidades() {

  const contenedor = document.getElementById("especialidades-checkboxes");

  if (!contenedor) return;

  try {

    const especialidades = await window.especialidadesAPI.getEspecialidades();

    contenedor.innerHTML = "";

    especialidades.forEach((esp) => {

      const label = document.createElement("label");
      label.className = "checkbox-item";

      label.innerHTML = `
        <input type="checkbox" value="${esp.id_especialidad}">
        <span>${esp.titulo}</span>
      `;

      contenedor.appendChild(label);

    });

  } catch (error) {
    console.error(error);
    mostrarError("No se pudieron cargar las especialidades.");
  }

}

  function initFormAgregar() {

  const form = document.getElementById("form-agregar-usuario");
  const rol = document.getElementById("rol");
  const datosEmpleado = document.getElementById("datos-empleado");

  if (!form || !rol || !datosEmpleado) return;

  rol.addEventListener("change", async () => {

    if (rol.value === "empleado") {

      datosEmpleado.classList.add("activo");
      await cargarEspecialidades();

    } else {

      datosEmpleado.classList.remove("activo");

    }

  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    await createUsuario();
  });
}
  // ---------- Baja (lógica: activo = 0) ----------
  function initFormEliminar() {
    const form = document.getElementById('form-eliminar-usuario');
    if (!form) return;

    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!id) {
        alert('No se encontró el usuario a desactivar.');
        return;
      }
      try {
        await window.usuariosAPI.deleteUsuario(id);
        window.location.href = 'usuarios.html';
      } catch (error) {
        console.error('Error al desactivar usuario:', error);
        alert(error.message || 'No se pudo desactivar el usuario.');
      }
    });
    
  }

  // ---------- Inicialización ----------
  document.addEventListener('DOMContentLoaded', async () => {
    await protegerAccesoAdministrador();

    const pathname = window.location.pathname;

    if (pathname.includes('usuarios.html')) {
      await cargarUsuarios();
    }

    if (pathname.includes('agregarUsuario.html')) {
      initFormAgregar();
    }

    if (pathname.includes('eliminarUsuario.html')) {
      initFormEliminar();
    }
  });