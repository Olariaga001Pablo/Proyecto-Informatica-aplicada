// script.js - Funcionalidades de la vista Clientes (lista y agregar)

// ---------- Navegación ----------

// Botón "home" -> vuelve al index
document.getElementById("home")?.addEventListener("click", () => {
  window.location.href = "../../index.html";
});

// Botón "+ Agregar" -> va a agregarCliente.html (solo si existe en la página)
document.getElementById("btn-add-cliente")?.addEventListener("click", () => {
  window.location.href = "agregarCliente.html";
});

// Botón "Cancelar" en agregarCliente.html -> vuelve a la lista
document.getElementById("btn-cancelar")?.addEventListener("click", () => {
  window.location.href = "cliente.html";
});

// ---------- Backend y UI ----------

// Trae clientes del backend
async function getClientes() {
  try {
    const clientes = await window.api.getClientes();
    return clientes;
  } catch (error) {
    console.error("Error al obtener clientes:", error);
    return [];
  }
}

// Actualiza el contador de clientes
function actualizarClientesCount(cantidad) {
  const contador = document.getElementById("clientes-count");
  if (contador) contador.textContent = cantidad;
}

// Carga clientes en cliente.html agrupados de a dos
async function cargarClientes() {
  const contenedor = document.getElementById("contenedor");
  if (!contenedor) return;

  const clientes = await getClientes();
  actualizarClientesCount(clientes.length);

  contenedor.innerHTML = ""; // Limpiar antes de agregar

  let fila; // Contenedor de la fila

  clientes.forEach((cliente, index) => {
    // Crear nueva fila cada 2 clientes
    if (index % 2 === 0) {
      fila = document.createElement("div");
      fila.className = "clientes-fila";
      contenedor.appendChild(fila);
    }

    const card = document.createElement("div");
    card.className = "cliente-item"; // mantiene estilo de tarjeta individual
    card.id = cliente.id_cliente;

    card.innerHTML = `
      <div class="cliente-info">
        <h2 class="cliente-nombre">${cliente.nombre} ${cliente.apellido || ""}</h2>
        <p class="cliente-email">${cliente.email || ""}</p>
        <p class="cliente-telefono">${cliente.telefono || ""}</p>
        <p class="cliente-direccion">${cliente.direccion || ""}</p>
      </div>
      <button class="btn-editar" data-id="${cliente.id_cliente}">
        <img src="../../public/icons/content-modified.svg" alt="Editar">
      </button>
    `;

    fila.appendChild(card); // agregar tarjeta a la fila
  });

  // Eventos para cada botón editar
  document.querySelectorAll(".btn-editar").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const id = e.currentTarget.getAttribute("data-id");
      window.location.href = `modificarCliente.html?id=${id}`;
    });
  });
}

// Crear cliente desde agregarCliente.html
async function createCliente() {
  const form = document.getElementById("form-agregar-cliente");
  if (!form) return;

  const nuevoCliente = {
    nombre: document.getElementById("nombre")?.value || '',
    apellido: document.getElementById("apellido")?.value || '',
    documento: document.getElementById("documento")?.value || '',
    direccion: document.getElementById("direccion")?.value || '',
    telefono: document.getElementById("telefono")?.value || '',
    email: document.getElementById("email")?.value || '',
    codigo_postal: document.getElementById("codigo_postal")?.value || null
  };

  try {
    await window.api.addCliente(nuevoCliente);
    // Redirigir a la lista después de guardar
    window.location.href = "cliente.html";
  } catch (error) {
    console.error("Error al crear cliente:", error);
  }
}

// Inicializa el formulario de agregar cliente
function initFormSubmit() {
  const form = document.getElementById("form-agregar-cliente");
  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    createCliente();
  });
}

// ---------------------------- INICIALIZACIÓN ----------------------------
document.addEventListener("DOMContentLoaded", async () => {
  await cargarClientes();  // Solo se ejecuta si hay contenedor
  initFormSubmit();        // Solo se ejecuta si hay formulario
});
