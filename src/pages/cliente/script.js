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

async function getClienteById(id) {
  try {
    const cliente = await window.api.getClienteById(id);
    return cliente;
  } catch (error) {
    console.error("Error al obtener cliente por ID:", error);
    return null;
  }
}

function obtenerIdCliente(){
  const btn = document.querySelectorAll(".btn-editar");
  btn.forEach(boton => {
    boton.addEventListener("click", (e) => {
      const id  = e.currentTarget.value;
      console.log(id);
      window.api.logToMain(`Navigating to modificarCliente.html with id=${id}`);
      window.location.href = `modificarCliente.html?id=${id}`;
      window.api.logToMain(`modificarCliente.html?id=${id}`);
    });
  });
}

async function obtenerClientePorId() {
  try {
    // const id = id_test;
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    window.api.logToMain(`Extracted id from URL: ${id}`);
    if (!id) throw new Error("ID de cliente no proporcionado en la URL - me encuentro en obtenerClientePorId");
    const cliente = await getClienteById(id);
    return cliente;
  } catch (error) {
    window.api.logToMain(`Error al obtener cliente por ID: ${error.message}`);
    return console.error("Error al obtener cliente por ID:", error);
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
      <button class="btn-editar" id="btn-editar" value="${cliente.id_cliente}">
        <img src="../../public/icons/content-modified.svg" alt="Editar">
      </button>
    `;

    fila.appendChild(card); // agregar tarjeta a la fila
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

function initFormSubmitModificar() {
  const form = document.getElementById("btn-guardar");
  form?.addEventListener("click", async (e) => {
    e.preventDefault();
    await updateCliente();
    console.log("Formulario de modificar cliente enviado");
  }); 
}

async function updateCliente() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  if (!id) {console.error("ID de cliente no proporcionado en la URL"); return; }
  const form = document.getElementById("form-modificar-cliente");
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
    // Volver a la página anterior
  } catch (error) {
    console.error("Error al actualizar cliente:", error);
  }
}

function rellenarFormulario(cliente) {
  console.log("Rellenando formulario con cliente");
    if (cliente) {
        document.getElementById("mod-nombre").value = cliente.nombre || "";
        document.getElementById("mod-apellido").value = cliente.apellido || "";
        document.getElementById("mod-documento").value = cliente.documento || "";
        document.getElementById("mod-telefono").value = cliente.telefono || "";
        document.getElementById("mod-email").value = cliente.email || "";
        document.getElementById("mod-direccion").value = cliente.direccion || "";
        document.getElementById("mod-codigo_postal").value = cliente.codigo_postal || "";
        // ...y así con todos los campos de tu formulario
    }
    else {
      window.api.logToMain("No se encontró el cliente - posiblemente ID inválido");
    }
}

// Autocompletar campos en modificarCliente.html

// ---------------------------- INICIALIZACIÓN ----------------------------
document.addEventListener("DOMContentLoaded", async () => {
  const pathname = window.location.pathname;
  if (pathname.includes("cliente.html")) {
    await cargarClientes(); 
    obtenerIdCliente();
    console.log("En cliente.html");

  } // Solo se ejecuta si hay contenedor
  // Solo se ejecuta si hay formulario
  // Solo se ejecuta si hay formulario de modificar
  if (pathname.includes("modificarCliente.html")) {
    console.log("En modificarCliente.html");
    const cliente = await obtenerClientePorId();
    if ( cliente.length > 0) { // <--- Verificación corregida
      rellenarFormulario(cliente[0]);
      console.log(cliente[0]);

    } else {
      window.api.logToMain("No se encontró el cliente - posiblemente ID inválido");
    }
    initFormSubmitModificar();
  } 

});
