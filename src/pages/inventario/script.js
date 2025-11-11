// script.js - Funcionalidades de la vista Inventario

// ---------- Navegación ----------

// Botón "home" -> vuelve al index
document.getElementById("home")?.addEventListener("click", () => {
  window.location.href = "../../index.html";
});

// Botón "+ Agregar" -> va a agregarProducto.html
document.getElementById("btn-add-producto")?.addEventListener("click", () => {
  window.location.href = "agregarProducto.html";
});

// Botón "Cancelar" en agregarProducto.html -> vuelve a la lista
document.getElementById("btn-cancelar")?.addEventListener("click", () => {
  window.location.href = "inventario.html";
});

// ---------- Backend y UI ----------

// Obtener productos del backend
async function getProductos() {
  try {
    const productos = await window.inventarioAPI.getInventario();
    return productos;
  } catch (error) {
    console.error("Error al obtener productos:", error);
    return [];
  }
}

async function getProductoById(id) {
  try {
    const producto = await window.inventarioAPI.getProductoById(id);
    return producto;
  } catch (error) {
    console.error("Error al obtener producto por ID:", error);
    return null;
  }
}

function obtenerIdProducto() {
  const btn = document.querySelectorAll(".btn-editar");
  btn.forEach(boton => {
    boton.addEventListener("click", (e) => {
      const id = e.currentTarget.value;
      window.location.href = `modificarProducto.html?id=${id}`;
    });
  });
}

async function obtenerProductoPorId() {
  try {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    if (!id) throw new Error("ID de producto no proporcionado en la URL");
    const producto = await getProductoById(id);
    return producto;
  } catch (error) {
    console.error("Error al obtener producto por ID:", error);
    return null;
  }
}

// Actualiza el contador de productos
function actualizarProductosCount(cantidad) {
  const contador = document.getElementById("productos-count");
  if (contador) contador.textContent = cantidad;
}
// Función reescrita usando async/await
async function validarDuplicadosProducto(nombre, proveedor, tipo) {
  try {
    // Usamos await para esperar el resultado de la promesa
    const productos = await getProductos(); 
    const proveedorNombre = proveedor ? (await window.proveedorAPI.getProveedorById(proveedor))?.nombre : null;
    
    // Si obtenemos la lista, realizamos la validación
    const validacion = productos.some(producto => 
      producto.nombre === nombre && 
      producto.proveedor_nombre === proveedorNombre &&
      producto.tipo === tipo
    );
    return validacion ; // true si es duplicado, false si no lo es
  } catch (error) {
    // Si hay un error al obtener los productos (ej: error de API/DB)
    console.error("Error al obtener la lista de productos para validación:", error);
  
  }
}

function mostrarError(mensaje) {
    const errorDiv = document.getElementById("mensaje-error-duplicado");
    if (errorDiv) {
        // Establecer el contenido
        errorDiv.textContent = mensaje;
        
        // Agregar la clase CSS y mostrar el elemento
        errorDiv.classList.add('error-notification'); 
        errorDiv.style.display = 'flex'; // Usamos 'flex' si el CSS usa display: flex
        // Desplazarse al mensaje de error
        errorDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

function limpiarError() {
    const errorDiv = document.getElementById("mensaje-error-duplicado");
    if (errorDiv) {
        errorDiv.textContent = '';
        errorDiv.style.display = 'none'; // Ocultar el elemento
    }
}

// Carga productos en inventario.html
async function cargarProductos() {
  const contenedor = document.getElementById("contenedor");
  if (!contenedor) return;

  const productos = await getProductos();
  actualizarProductosCount(productos.length);

  contenedor.innerHTML = ""; // Limpiar antes de agregar

  let fila;

  productos.forEach((producto, index) => {
    if (index % 2 === 0) {
      fila = document.createElement("div");
      fila.className = "clientes-fila";
      contenedor.appendChild(fila);
    }

    const card = document.createElement("div");
    card.className = "cliente-item";
    card.id = producto.id_producto;

    card.innerHTML = `
      <div class="cliente-info">
        <h2 class="cliente-nombre">${producto.nombre || ""}</h2>
        <p class="cliente-email">Tipo: ${producto.tipo || ""}</p>
        <p class="cliente-telefono">Stock: ${producto.stock || 0}</p>
        <p class="cliente-direccion">Precio: $${producto.precio || 0}</p>
        <p class="cliente-proveedor">Proveedor: ${producto.proveedor_nombre || ""}</p>
      </div>
      <button class="btn-editar" id="btn-editar" value="${producto.id_producto}">
        <img src="../../public/icons/content-modified.svg" alt="Editar">
      </button>
    `;

    fila.appendChild(card);
  });
  obtenerIdProducto();
}

// Crear producto desde agregarProducto.html
async function createProducto() {
  const form = document.getElementById("form-agregar-producto");
  if (!form) return;
  limpiarError();

  const nuevoProducto = {
    nombre: document.getElementById("nombre-producto")?.value || '',
    tipo: document.getElementById("tipo-producto")?.value || '',
    precio: parseFloat(document.getElementById("precio-producto")?.value) || 0,
    stock: parseInt(document.getElementById("stock-producto")?.value) || 0,
    proveedor: parseInt(document.getElementById("proveedor-producto")?.value) || null,
    umbral: parseInt(document.getElementById("umbral-minimo")?.value) || 0
  };
  // Validar duplicados antes de guardar
  const esDuplicado = await validarDuplicadosProducto(nuevoProducto.nombre, nuevoProducto.proveedor, nuevoProducto.tipo);
  if (esDuplicado) {
    mostrarError("Error: Ya existe un producto con el mismo NOMBRE, TIPO y PROVEEDOR.");
    return; // Detener la creación si es duplicado
  }
  try {
    await window.inventarioAPI.guardarProducto(nuevoProducto);
    window.location.href = "inventario.html";
  } catch (error) {
    console.error("Error al crear producto:", error);
  }
}

function initFormSubmit() {
  const form = document.getElementById("form-agregar-producto");
  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    createProducto();
  });
}

function initFormSubmitModificar() {
  const btnGuardar = document.getElementById("btn-guardar");
  const btnEliminar = document.getElementById("btn-eliminar");

  btnGuardar?.addEventListener("click", async (e) => {
    e.preventDefault();
    await updateProducto();
  });

  btnEliminar?.addEventListener("click", (e) => {
  e.preventDefault();
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  if (id) {
    window.location.href = `eliminarProducto.html?id=${id}`;
  } else {
    alert("No se encontró el producto para eliminar.");
  }
});
}

async function updateProducto() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  if (!id) {
    console.error("ID de producto no proporcionado en la URL");
    return;
  }
  const productoActualizado = {
    nombre: document.getElementById("mod-nombre")?.value || '',
    tipo: document.getElementById("mod-tipo")?.value || '',
    precio: parseFloat(document.getElementById("mod-precio")?.value) || 0,
    stock: parseInt(document.getElementById("mod-stock")?.value) || 0,
    proveedor: parseInt(document.getElementById("mod-proveedor")?.value) || null,
    umbral: parseInt(document.getElementById("mod-umbral-minimo")?.value) || 0
  };

  try {
    await window.inventarioAPI.updateProducto(id, productoActualizado);
    window.history.back();
  } catch (error) {
    console.error("Error al actualizar producto:", error);
  }
}

async function deleteProducto() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  if (!id) {
    console.error("ID de producto no proporcionado en la URL");
    return;
  }
  if (confirm("¿Estás seguro de que quieres eliminar este producto?")) {
    try {
      await window.inventarioAPI.eliminarProducto(id);
      window.location.href = "inventario.html";
    } catch (error) {
      console.error("Error al eliminar producto:", error);
    }
  }
}

function rellenarFormulario(producto) {
  if (producto) {
    document.getElementById("mod-nombre").value = producto.nombre || "";
    document.getElementById("mod-tipo").value = producto.tipo || "";
    document.getElementById("mod-precio").value = producto.precio || 0;
    document.getElementById("mod-stock").value = producto.stock || 0;
    document.getElementById("mod-proveedor").value = producto.id_proveedor || "";
    document.getElementById("mod-umbral-minimo").value = producto.umbral || 0;
  }
}

// Carga los proveedores en el menú desplegable del formulario
async function cargarProveedoresEnSelect(selectElement, idSeleccionado = null) {
  try {
    const proveedores = await window.proveedorAPI.getProveedores();
    selectElement.innerHTML = '<option value="">Seleccione un Proveedor</option>';
    proveedores.forEach(proveedor => {
      const option = document.createElement('option');
      option.value = proveedor.id_proveedor;
      option.textContent = proveedor.nombre;
      if (idSeleccionado && proveedor.id_proveedor == idSeleccionado) {
        option.selected = true;
      }
      selectElement.appendChild(option);
    });
  } catch (error) {
    console.error('Error al cargar proveedores:', error);
  }
}

// ---------------------------- INICIALIZACIÓN ----------------------------
document.addEventListener("DOMContentLoaded", async () => {
  const pathname = window.location.pathname;

  if (pathname.includes("inventario.html")) {
    await cargarProductos();
  }
  if (pathname.includes("agregarProducto.html")) {
    await cargarProveedoresEnSelect(document.getElementById("proveedor-producto"));
    initFormSubmit();
  }
  if (pathname.includes("modificarProducto.html")) {
    const producto = await obtenerProductoPorId();
    if (producto) {
      await cargarProveedoresEnSelect(document.getElementById("mod-proveedor"), producto.id_proveedor);
      rellenarFormulario(producto);
    } else {
      console.error("No se encontró el producto - ID inválido");
    }
    initFormSubmitModificar();
  }
  if (pathname.includes("eliminarProducto.html")) {
  console.log("En eliminarProducto.html");
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  document.getElementById("btn-cancelar")?.addEventListener("click", () => {
    window.history.back();
  });

  const form = document.getElementById("form-eliminar-producto");
  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
      await window.inventarioAPI.eliminarProducto(id);
      alert("Producto eliminado correctamente.");
      window.location.href = "inventario.html";
    } catch (error) {
      console.error("Error al eliminar producto:", error);
      alert("No se pudo eliminar el producto.");
    }
  });
}
});
