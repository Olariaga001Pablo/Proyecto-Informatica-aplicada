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

// Carga clientes en cliente.html
async function cargarClientes() {
  const contenedor = document.getElementById("contenedor");
  if (!contenedor) return;

  const clientes = await getClientes();
  actualizarClientesCount(clientes.length);

  contenedor.innerHTML = ""; // Limpiar antes de agregar
  clientes.forEach(cliente => {
    const item = document.createElement("div");
    item.id = cliente.id_cliente;
    item.className = "cliente-item";
    item.textContent = `${cliente.nombre} ${cliente.apellido || ""} - ${cliente.documento}`;
    contenedor.appendChild(item);
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
    id_usuario: document.getElementById("id_usuario")?.value || ''
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
