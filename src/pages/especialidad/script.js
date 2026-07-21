const contenedor = document.getElementById('contenedor');
const contador = document.getElementById('especialidades-count');
const errorMsg = document.getElementById('error-msg');
const formAgregar = document.getElementById('form-agregar-especialidad');
const btnHome = document.getElementById('home');

function mostrarError(msg) {
  errorMsg.textContent = msg;
  errorMsg.classList.add('visible');
  setTimeout(() => errorMsg.classList.remove('visible'), 4000);
}

async function cargarEspecialidades() {
  try {
    const especialidades = await window.especialidadesAPI.getEspecialidades();

    contenedor.innerHTML = '';
    contador.textContent = especialidades.length;

    especialidades.forEach((esp) => {
      const item = document.createElement('div');
      item.className = 'item-lista';

      item.innerHTML = `
        <span class="item-titulo">${esp.titulo}</span>
        ${
          esp.matricula
            ? `<span class="item-matricula">Matrícula: ${esp.matricula}</span>`
            : ''
        }
        <button class="btn-eliminar" data-id="${esp.id_especialidad}" title="Eliminar">
          ✕
        </button>
      `;

      contenedor.appendChild(item);
    });

    contenedor.querySelectorAll('.btn-eliminar').forEach((btn) => {
      btn.addEventListener('click', () => {
        window.location.href = `./eliminarEspecialidad.html?id=${btn.dataset.id}`;
      });
    });

  } catch (err) {
    mostrarError('No se pudieron cargar las especialidades.');
    console.error(err);
  }
}

async function eliminarEspecialidad(id) {
  try {
    await window.especialidadesAPI.deleteEspecialidad(Number(id));
    window.location.href = './especialidades.html';
  } catch (err) {
    mostrarError('No se pudo eliminar la especialidad.');
    console.error(err);
  }
}

if (document.getElementById('form-eliminar-especialidad')) {

  const formEliminar = document.getElementById('form-eliminar-especialidad');
  const btnCancelar = document.getElementById('btn-cancelar-eliminar');

  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');

  btnCancelar.addEventListener('click', () => {
    window.location.href = './especialidades.html';
  });

  formEliminar.addEventListener('submit', async (e) => {
    e.preventDefault();
    await eliminarEspecialidad(id);
  });
}

formAgregar?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const titulo = document.getElementById('titulo').value.trim();
  const matricula = document.getElementById('matricula').value.trim();

  if (!titulo) {
    mostrarError('El título es obligatorio.');
    return;
  }

  try {
    await window.especialidadesAPI.addEspecialidad({
      titulo,
      matricula: matricula || null
    });

    formAgregar.reset();
    cargarEspecialidades();

  } catch (err) {
    mostrarError('No se pudo agregar la especialidad.');
    console.error(err);
  }
});

btnHome?.addEventListener('click', () => {
  window.location.href = '../../index.html';
});

if (contenedor) {
  cargarEspecialidades();
}