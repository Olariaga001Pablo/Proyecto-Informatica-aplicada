// script.js - Funcionalidades de la vista Clientes (lista, agregar, modificar, eliminar)


// ---------- Navegación General ----------

// Botón "home" -> vuelve al index
document.getElementById("home")?.addEventListener("click", () => {
  window.location.href = "../../index.html";
});

// Botón "+ Agregar" -> va a agregarCliente.html
document.getElementById("btn-add-cliente")?.addEventListener("click", () => {
  window.location.href = "agregarCliente.html";
});

// Botón "Cancelar" en agregarCliente.html -> vuelve a la lista
document.getElementById("btn-cancelar")?.addEventListener("click", () => {
  window.location.href = "cliente.html";
});

// ---------- Funciones Backend ----------

async function getClientes() {
  try {
    return await window.api.getClientes();
  } catch (error) {
    console.error("Error al obtener clientes:", error);
    return [];
  }
}

async function getClienteById(id) {
  try {
    return await window.api.getClienteById(id);
  } catch (error) {
    console.error("Error al obtener cliente por ID:", error);
    return null;
  }
}

// ---------- Funciones de Soporte ----------

function mostrarError(mensaje) {
  const errorDiv = document.getElementById("mensaje-error-duplicado");
  if (errorDiv) {
    errorDiv.textContent = mensaje;
    errorDiv.classList.add('error-notification');
    errorDiv.style.display = 'flex';
    errorDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

function limpiarError() {
  const errorDiv = document.getElementById("mensaje-error-duplicado");
  if (errorDiv) {
    errorDiv.textContent = '';
    errorDiv.style.display = 'none';
  }
}

async function validarExistenciaCliente(cliente) {
  try {
    const lista = await window.api.getClientes();

    if (lista.some(c => c.documento === cliente.documento)) return "documento";
    if (lista.some(c => c.telefono === cliente.telefono)) return "telefono";
    if (lista.some(c => c.email === cliente.email)) return "email";

    return false;
  } catch (error) {
    console.error("Error al validar existencia del cliente:", error);
    return false;
  }
}

// ---------- CLIENTE: Listado ----------

async function cargarClientes() {
  const contenedor = document.getElementById("contenedor");
  if (!contenedor) return;

  const clientes = await getClientes();
  actualizarClientesCount(clientes.length);

  contenedor.innerHTML = "";

  let fila;
  clientes.forEach((cliente, index) => {
    if (index % 2 === 0) {
      fila = document.createElement("div");
      fila.className = "clientes-fila";
      contenedor.appendChild(fila);
    }

    const card = document.createElement("div");
    card.className = "cliente-item";
    card.id = cliente.id_cliente;

    card.innerHTML = `
      <div class="cliente-info">
        <h2 class="cliente-nombre">${cliente.nombre} ${cliente.apellido || ""}</h2>
        <p class="cliente-email">${cliente.email || ""}</p>
        <p class="cliente-telefono">${cliente.telefono || ""}</p>
        <p class="cliente-direccion">${cliente.direccion || ""}</p>
      </div>
      <button class="btn-editar" value="${cliente.id_cliente}">
        <img src="../../public/icons/content-modified.svg" alt="Editar">
      </button>
    `;

    fila.appendChild(card);
  });

  obtenerIdCliente();
}

function actualizarClientesCount(cantidad) {
  const contador = document.getElementById("clientes-count");
  if (contador) contador.textContent = cantidad;
}

function obtenerIdCliente() {
  const botones = document.querySelectorAll(".btn-editar");
  botones.forEach(boton => {
    boton.addEventListener("click", (e) => {
      const id = e.currentTarget.value;
      window.api.logToMain(`Navigating to modificarCliente.html with id=${id}`);
      window.location.href = `modificarCliente.html?id=${id}`;
    });
  });
}

// ---------- CLIENTE: Agregar ----------

async function createCliente() {
  const nuevoCliente = {
    nombre: document.getElementById("nombre")?.value || '',
    apellido: document.getElementById("apellido")?.value || '',
    documento: document.getElementById("documento")?.value || '',
    direccion: document.getElementById("direccion")?.value || '',
    telefono: document.getElementById("telefono")?.value || '',
    email: document.getElementById("email")?.value || '',
    codigo_postal: document.getElementById("codigo_postal")?.value || null
  };

  const campoDuplicado = await validarExistenciaCliente(nuevoCliente);
  if (campoDuplicado) {
    let mensaje = "Ya existe un cliente con el mismo ";
    mensaje += campoDuplicado.toUpperCase() + ".";
    mostrarError(mensaje);
    return;
  }

  try {
    await window.api.addCliente(nuevoCliente);
    window.location.href = "cliente.html";
  } catch (error) {
    console.error("Error al crear cliente:", error);
  }
}

function initFormSubmit() {
  const form = document.getElementById("form-agregar-cliente");
  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    createCliente();
  });
}

// ---------- CLIENTE: Modificar ----------

async function updateCliente() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  if (!id) return console.error("ID de cliente no proporcionado en la URL");

  const clienteActualizado = {
    nombre: document.getElementById("mod-nombre")?.value || '',
    apellido: document.getElementById("mod-apellido")?.value || '',
    documento: document.getElementById("mod-documento")?.value || '',
    direccion: document.getElementById("mod-direccion")?.value || '',
    telefono: document.getElementById("mod-telefono")?.value || '',
    email: document.getElementById("mod-email")?.value || '',
    codigo_postal: document.getElementById("mod-codigo_postal")?.value || null
  };

  try {
    await window.api.updateCliente(id, clienteActualizado);
    window.location.href = "cliente.html";
  } catch (error) {
    console.error("Error al actualizar cliente:", error);
  }
}

async function obtenerClientePorId() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  if (!id) throw new Error("ID no proporcionado en la URL");

  return await getClienteById(id);
}

function rellenarFormulario(cliente) {
  if (!cliente) return;
  document.getElementById("mod-nombre").value = cliente.nombre || "";
  document.getElementById("mod-apellido").value = cliente.apellido || "";
  document.getElementById("mod-documento").value = cliente.documento || "";
  document.getElementById("mod-telefono").value = cliente.telefono || "";
  document.getElementById("mod-email").value = cliente.email || "";
  document.getElementById("mod-direccion").value = cliente.direccion || "";
  document.getElementById("mod-codigo_postal").value = cliente.codigo_postal || "";
}

function initFormSubmitModificar() {
  document.getElementById("btn-guardar")?.addEventListener("click", (e) => {
    e.preventDefault();
    updateCliente();
  });

  document.getElementById("btn-eliminar")?.addEventListener("click", (e) => {
    e.preventDefault();
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    if (id) {
      window.location.href = `eliminarCliente.html?id=${id}`;
    } else {
      alert("No se encontró el cliente para eliminar.");
    }
  });
}

// ---------- CLIENTE: Eliminar ----------

// ---------------------------- INICIALIZACIÓN ----------------------------

document.addEventListener("DOMContentLoaded", async () => {
  const pathname = window.location.pathname;

  if (pathname.includes("cliente.html")) {
    await cargarClientes();
    console.log("En cliente.html");
  }

  if (pathname.includes("agregarCliente.html")) {
    console.log("En agregarCliente.html");
    initFormSubmit();
  }

  if (pathname.includes("modificarCliente.html")) {
    console.log("En modificarCliente.html");
    const cliente = await obtenerClientePorId();
    if (cliente) rellenarFormulario(cliente);
    initFormSubmitModificar();
  }

  if (pathname.includes("eliminarCliente.html")) {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    document.getElementById("btn-cancelar")?.addEventListener("click", () => {
      window.history.back();
    });

    const form = document.getElementById("form-eliminar-cliente");
    form?.addEventListener("submit", async (e) => {
      e.preventDefault();
      try {
        await window.api.deleteCliente(id);
        console.log("Cliente eliminado correctamente");
        window.location.href = "cliente.html";
      } catch (error) {
        console.error("Error al eliminar cliente:", error);
        alert("No se pudo eliminar el cliente.");
      }
    });
  }
});
