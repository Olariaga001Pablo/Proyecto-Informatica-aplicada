const contenedor = document.getElementById('contenedor');
const contador = document.getElementById('auditoria-count');
const errorMsg = document.getElementById('error-msg');
const btnHome = document.getElementById('home');

function mostrarError(msg) {
  errorMsg.textContent = msg;
  errorMsg.classList.add('visible');
  setTimeout(() => errorMsg.classList.remove('visible'), 4000);
}

function formatearFecha(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleString('es-AR');
  } catch {
    return iso;
  }
}

async function cargarAuditoria() {
  try {
    const eventos = await window.auditoriaAPI.getAuditoria(200);

    contador.textContent = eventos.length;
    contenedor.innerHTML = '';

    eventos.forEach((ev) => {
      const fila = document.createElement('tr');
      fila.className = ev.resultado === 'error' ? 'fila-error' : '';

      fila.innerHTML = `
        <td>${formatearFecha(ev.fecha_hora)}</td>
        <td>${ev.usuario_email || '—'}</td>
        <td>${ev.rol || '—'}</td>
        <td>${ev.tipo_evento}</td>
        <td>${ev.modulo}</td>
        <td><span class="badge-resultado badge-${ev.resultado}">${ev.resultado}</span></td>
        <td>${ev.origen || '—'}</td>
      `;

      contenedor.appendChild(fila);
    });

  } catch (error) {
    console.error(error);
    mostrarError('No se pudo cargar el historial de auditoría.');
  }
}

btnHome.addEventListener('click', () => {
  window.location.href = '../../index.html';
});

cargarAuditoria();