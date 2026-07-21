const errorMsg = document.getElementById('error-msg');

function mostrarError(msg) {
  if (!errorMsg) return alert(msg);
  errorMsg.textContent = msg;
  errorMsg.classList.add('visible');
  setTimeout(() => errorMsg.classList.remove('visible'), 4000);
}

// ======================================================
// LISTA DE EMPLEADOS
// ======================================================

if (document.getElementById('contenedor') && document.getElementById('empleados-count')) {

  const contenedor = document.getElementById('contenedor');
  const contador = document.getElementById('empleados-count');
  const btnAdd = document.getElementById('btn-add-empleado');
  const btnHome = document.getElementById('home');

  async function cargarEmpleados() {

    try {

      const empleados = await window.empleadosAPI.getEmpleados();

      contenedor.innerHTML = '';
      contador.textContent = empleados.length;

      empleados.forEach((emp) => {

        const card = document.createElement('div');
        card.className = 'empleado-card';

        card.innerHTML = `
          <div class="empleado-info">
            <strong>${emp.nombre} ${emp.apellido}</strong>
            <span>${emp.direccion || 'Sin dirección'}</span>
            <span class="especialidades-tags">${emp.especialidades || 'Sin especialidades'}</span>
          </div>

          <div class="empleado-acciones">
            <button class="btn-editar" data-id="${emp.id_empleado}">
              Editar
            </button>

            <button class="btn-eliminar" data-id="${emp.id_empleado}">
              Desactivar
            </button>
          </div>
        `;

        contenedor.appendChild(card);

      });

      contenedor.querySelectorAll('.btn-editar').forEach((btn) => {

        btn.addEventListener('click', () => {

          window.location.href = `./modificarEmpleado.html?id=${btn.dataset.id}`;

        });

      });

      contenedor.querySelectorAll('.btn-eliminar').forEach((btn) => {

        btn.addEventListener('click', () => {

          window.location.href = `./eliminarEmpleado.html?id=${btn.dataset.id}`;

        });

      });

    } catch (err) {

      mostrarError('No se pudieron cargar los empleados.');
      console.error(err);

    }

  }

  btnAdd?.addEventListener('click', () => {

    window.location.href = '../usuarios/agregarUsuario.html';

  });

  btnHome?.addEventListener('click', () => {

    window.location.href = '../../index.html';

  });

  cargarEmpleados();

}

// ======================================================
// MODIFICAR EMPLEADO
// ======================================================

if (document.getElementById('form-modificar-empleado')) {

  const form = document.getElementById('form-modificar-empleado');
  const checkboxesContenedor = document.getElementById('mod-especialidades-checkboxes');
  const btnVolver = document.getElementById('btn-volver-lista');
  const btnEliminar = document.getElementById('btn-eliminar-empleado');

  const params = new URLSearchParams(window.location.search);
  const idEmpleado = params.get('id');

  if (!idEmpleado) {
    mostrarError('No se especificó qué empleado modificar.');
  }

  function marcarCheckboxes(especialidades, seleccionadas) {

    checkboxesContenedor.innerHTML = '';

    especialidades.forEach((esp) => {

      const marcado = seleccionadas.some(
        (s) => Number(s.id_especialidad) === esp.id_especialidad
      );

      const label = document.createElement('label');

      label.className = 'checkbox-item';

      label.innerHTML = `
        <input type="checkbox" value="${esp.id_especialidad}" ${marcado ? 'checked' : ''}>
        ${esp.titulo}
      `;

      checkboxesContenedor.appendChild(label);

    });

  }

  async function cargarDatos() {

    if (!idEmpleado) return;

    try {

      const [empleado, especialidades] = await Promise.all([
        window.empleadosAPI.getEmpleadoById(Number(idEmpleado)),
        window.especialidadesAPI.getEspecialidades()
      ]);

      if (!empleado) {
        mostrarError('No se encontró el empleado.');
        return;
      }

      document.getElementById('mod-nombre').value = empleado.nombre || '';
      document.getElementById('mod-apellido').value = empleado.apellido || '';
      document.getElementById('mod-direccion').value = empleado.direccion || '';
      document.getElementById('mod-codigo_postal').value = empleado.codigo_postal || '';

      marcarCheckboxes(especialidades, empleado.especialidades || []);

    } catch (err) {

      mostrarError('No se pudieron cargar los datos del empleado.');
      console.error(err);

    }

  }

  form.addEventListener('submit', async (e) => {

    e.preventDefault();

    const nombre = document.getElementById('mod-nombre').value.trim();
    const apellido = document.getElementById('mod-apellido').value.trim();
    const direccion = document.getElementById('mod-direccion').value.trim();
    const codigo_postal = document.getElementById('mod-codigo_postal').value.trim();

    if (!nombre || !apellido) {
      mostrarError('Nombre y apellido son obligatorios.');
      return;
    }

    const especialidades = Array.from(
      checkboxesContenedor.querySelectorAll('input[type="checkbox"]:checked')
    ).map(cb => Number(cb.value));

    try {

      await window.empleadosAPI.updateEmpleado(Number(idEmpleado), {
        nombre,
        apellido,
        direccion,
        codigo_postal,
        especialidades
      });

      window.location.href = './empleados.html';

    } catch (err) {

      mostrarError('No se pudo guardar los cambios.');
      console.error(err);

    }

  });

  if (btnEliminar) {

    btnEliminar.addEventListener('click', () => {

      window.location.href = `./eliminarEmpleado.html?id=${idEmpleado}`;

    });

  }

  if (btnVolver) {

    btnVolver.addEventListener('click', () => {

      window.location.href = './empleados.html';

    });

  }

  cargarDatos();

}

// ======================================================
// ELIMINAR EMPLEADO
// ======================================================

if (document.getElementById('btn-confirmar-eliminar')) {

  const params = new URLSearchParams(window.location.search);
  const idEmpleado = params.get('id');

  document.getElementById('btn-confirmar-eliminar').addEventListener('click', async () => {

    try {

      await window.empleadosAPI.deleteEmpleado(Number(idEmpleado));

      window.location.href = './empleados.html';

    } catch (err) {

      mostrarError('No se pudo eliminar el empleado.');
      console.error(err);

    }

  });

  document.getElementById('btn-cancelar-eliminar')?.addEventListener('click', () => {

    window.location.href = './empleados.html';

  });

}