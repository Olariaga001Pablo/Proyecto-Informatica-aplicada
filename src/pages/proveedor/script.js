// script.js - Funcionalidades de la vista Proveedores

// ---------- Navegación ----------

// Botón "home" -> vuelve al index
document.getElementById("home")?.addEventListener("click", () => {
  window.location.href = "../../index.html";
});

// Botón "+ Agregar" -> va a agregarProveedor.html
document.getElementById("btn-add-proveedor")?.addEventListener("click", () => {
  window.location.href = "agregarProveedor.html";
});

// Botón "Cancelar" en agregarProveedor.html -> vuelve a la lista
document.getElementById("btn-cancelar")?.addEventListener("click", () => {
  window.location.href = "proveedor.html";
});

// ---------- Backend y UI ----------

async function getProveedores() {
  try {
    const proveedores = await window.proveedorAPI.getProveedores();
    return proveedores;
  } catch (error) {
    console.error("Error al obtener proveedores:", error);
    return [];
  }
}

async function getProveedorById(id) {
  try {
    const proveedor = await window.proveedorAPI.getProveedorById(id);
    return proveedor;
  } catch (error) {
    console.error("Error al obtener proveedor por ID:", error);
    return null;
  }
}

function obtenerIdProveedor() {
  const btn = document.querySelectorAll(".btn-editar");
  btn.forEach(boton => {
    boton.addEventListener("click", (e) => {
      const id = e.currentTarget.value;
      window.location.href = `modificarProveedor.html?id=${id}`;
    });
  });
}

async function obtenerProveedorPorId() {
  try {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    if (!id) throw new Error("ID de proveedor no proporcionado en la URL");
    const proveedor = await getProveedorById(id);
    return proveedor;
  } catch (error) {
    console.error("Error al obtener proveedor por ID:", error);
    return null;
  }
}

function actualizarProveedoresCount(cantidad) {
  const contador = document.getElementById("proveedores-count");
  if (contador) contador.textContent = cantidad;
}

async function cargarProveedores() {
  const contenedor = document.getElementById("contenedor");
  if (!contenedor) return;

  const proveedores = await getProveedores();
  actualizarProveedoresCount(proveedores.length);

  contenedor.innerHTML = ""; // Limpiar antes de agregar

  let fila;

  proveedores.forEach((proveedor, index) => {
    if (index % 2 === 0) {
      fila = document.createElement("div");
      fila.className = "clientes-fila";
      contenedor.appendChild(fila);
    }

    const card = document.createElement("div");
    card.className = "cliente-item";
    card.id = proveedor.id_proveedor;

    card.innerHTML = `
      <div class="cliente-info">
        <h2 class="cliente-nombre">${proveedor.nombre || ""}</h2>
        <p class="cliente-email">${proveedor.email || ""}</p>
        <p class="cliente-telefono">${proveedor.telefono || ""}</p>
        <p class="cliente-direccion">${proveedor.direccion || ""}</p>
      </div>
      <button class="btn-editar" id="btn-editar" value="${proveedor.id_proveedor}">
        <img src="../../public/icons/content-modified.svg" alt="Editar">
      </button>
    `;

    fila.appendChild(card);
  });
  obtenerIdProveedor();
}

async function createProveedor() {
  const form = document.getElementById("form-agregar-proveedor");
  if (!form) return;

  const nuevoProveedor = {
    nombre: document.getElementById("nombre")?.value || '',
    direccion: document.getElementById("direccion")?.value || '',
    telefono: document.getElementById("telefono")?.value || '',
    email: document.getElementById("email")?.value || '',
    codigo_postal: document.getElementById("codigo_postal")?.value || null
  };

  try {
    await window.proveedorAPI.addProveedor(nuevoProveedor);
    window.location.href = "proveedor.html";
  } catch (error) {
    console.error("Error al crear proveedor:", error);
  }
}

function initFormSubmit() {
  const form = document.getElementById("form-agregar-proveedor");
  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    createProveedor();
  });
}

function initFormSubmitModificar() {
  const btnGuardar = document.getElementById("btn-guardar");
  const btnEliminar = document.getElementById("btn-eliminar");
  const form = document.querySelector(".form-cliente");

  btnGuardar?.addEventListener("click", async (e) => {
    e.preventDefault();
    await updateProveedor();
  });

  btnEliminar?.addEventListener("click", async (e) => {
    e.preventDefault();
    await deleteProveedor();
  });
}

async function updateProveedor() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  if (!id) {
    console.error("ID de proveedor no proporcionado en la URL");
    return;
  }
  const proveedorActualizado = {
    nombre: document.getElementById("mod-nombre")?.value || '',
    direccion: document.getElementById("mod-direccion")?.value || '',
    telefono: document.getElementById("mod-telefono")?.value || '',
    email: document.getElementById("mod-email")?.value || '',
    codigo_postal: document.getElementById("mod-codigo_postal")?.value || null
  };

  try {
    await window.proveedorAPI.updateProveedor(id, proveedorActualizado);
    window.history.back();
  } catch (error) {
    console.error("Error al actualizar proveedor:", error);
  }
}

async function deleteProveedor() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  if (!id) {
    console.error("ID de proveedor no proporcionado en la URL");
    return;
  }
  if (confirm("¿Estás seguro de que quieres eliminar este proveedor?")) {
    try {
      await window.proveedorAPI.deleteProveedor(id);
      window.location.href = "proveedor.html";
    } catch (error) {
      console.error("Error al eliminar proveedor:", error);
    }
  }
}

function rellenarFormulario(proveedor) {
  if (proveedor) {
    document.getElementById("mod-nombre").value = proveedor.nombre || "";
    document.getElementById("mod-telefono").value = proveedor.telefono || "";
    document.getElementById("mod-email").value = proveedor.email || "";
    document.getElementById("mod-direccion").value = proveedor.direccion || "";
    document.getElementById("mod-codigo_postal").value = proveedor.codigo_postal || "";
  }
}

// ---------------------------- INICIALIZACIÓN ----------------------------
document.addEventListener("DOMContentLoaded", async () => {
  const pathname = window.location.pathname;

  if (pathname.includes("proveedor.html")) {
    await cargarProveedores();
  }
  if (pathname.includes("agregarProveedor.html")) {
    initFormSubmit();
  }
  if (pathname.includes("modificarProveedor.html")) {
    const proveedor = await obtenerProveedorPorId();
    if (proveedor) {
      rellenarFormulario(proveedor);
    } else {
      console.error("No se encontró el proveedor - ID inválido");
    }
    initFormSubmitModificar();
  }
});
