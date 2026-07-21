const params = new URLSearchParams(window.location.search);
const idProyecto = params.get('id');

const contenedor = document.getElementById('contenedor');
const errorMsg = document.getElementById('error-msg');
const form = document.getElementById('form-asignar-producto');
const selectProducto = document.getElementById('select-producto');

function mostrarError(msg) {
  errorMsg.textContent = msg;
  errorMsg.classList.add('visible');
  setTimeout(() => errorMsg.classList.remove('visible'), 4000);
}

async function cargarSelectProductos() {
  try {
    const productos = await window.inventarioAPI.getInventario();
    selectProducto.innerHTML = '<option value="">Seleccione un producto</option>';
    productos.forEach((p) => {
      const opt = document.createElement('option');
      opt.value = p.id_producto;
      const esPanel = p.tipo === 'Panel';
      opt.textContent = `${p.nombre} (${p.tipo}${esPanel ? `, ${p.potencia_w || '?'} W` : ''})`;
      selectProducto.appendChild(opt);
    });
  } catch (error) {
    console.error(error);
    mostrarError('No se pudieron cargar los productos.');
  }
}

async function cargarAsignados() {
  try {
    const asignados = await window.productoProyectoAPI.getProductosProyecto(Number(idProyecto));
    contenedor.innerHTML = '';

    if (asignados.length === 0) {
      contenedor.innerHTML = '<p class="contador">Todavía no hay productos asignados a este proyecto.</p>';
      return;
    }

    asignados.forEach((item) => {
      const div = document.createElement('div');
      div.className = 'item-lista';
      const esPanel = item.tipo === 'Panel';
      div.innerHTML = `
        <span class="item-titulo">
          ${item.nombre}
          ${esPanel ? `<span class="badge-panel">Panel · ${item.potencia_w || '?'} W</span>` : ''}
        </span>
        <span class="item-matricula">Cantidad: ${item.cantidad}</span>
        <button class="btn-eliminar" data-id="${item.id_producto}" title="Quitar">✕</button>
      `;
      contenedor.appendChild(div);
    });

    contenedor.querySelectorAll('.btn-eliminar').forEach((btn) => {
      btn.addEventListener('click', async () => {
        try {
          await window.productoProyectoAPI.quitarProducto(Number(idProyecto), Number(btn.dataset.id));
          cargarAsignados();
        } catch (error) {
          console.error(error);
          mostrarError('No se pudo quitar el producto.');
        }
      });
    });

  } catch (error) {
    console.error(error);
    mostrarError('No se pudieron cargar los productos asignados.');
  }
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const idProducto = Number(selectProducto.value);
  const cantidad = parseInt(document.getElementById('cantidad-producto').value) || 0;

  if (!idProducto || cantidad <= 0) {
    mostrarError('Seleccioná un producto y una cantidad válida.');
    return;
  }

  try {
    await window.productoProyectoAPI.asignarProducto(Number(idProyecto), idProducto, cantidad);
    form.reset();
    document.getElementById('cantidad-producto').value = 1;
    cargarAsignados();
  } catch (error) {
    console.error(error);
    mostrarError('No se pudo asignar el producto.');
  }
});

const btnHome = document.getElementById('home');
if (btnHome) {
  btnHome.addEventListener('click', () => {
    window.location.href = `modificarProyecto.html?id=${idProyecto}`;
  });
} else {
  console.warn('No se encontró el botón #home en el DOM.');
}

if (!idProyecto) {
  mostrarError('No se especificó el proyecto.');
} else {
  cargarSelectProductos();
  cargarAsignados();
}