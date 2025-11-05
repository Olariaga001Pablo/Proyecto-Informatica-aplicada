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
async function validarExistenciaCliente(cliente) {
  try {
    const listaDeClientes = await window.api.getClientes();
    
    // 1. Verificar Duplicado por Documento
    if (listaDeClientes.some(c => c.documento === cliente.documento)) {
      console.log("Validación de existencia: Documento duplicado.");
      return "documento"; 
    }

    // 2. Verificar Duplicado por Teléfono
    if (listaDeClientes.some(c => c.telefono === cliente.telefono)) {
      console.log("Validación de existencia: Teléfono duplicado.");
      return "telefono";
    }

    // 3. Verificar Duplicado por Email
    if (listaDeClientes.some(c => c.email === cliente.email)) {
      console.log("Validación de existencia: Email duplicado.");
      return "email";
    }

    // Si no se encontró ningún duplicado
    console.log("Validación de existencia del cliente: No existe.");
    return false; // No hay duplicados

  } catch (error) {
    console.error("Error al validar existencia del cliente:", error);
    return false;
  }
}
// Crear cliente desde agregarCliente.html
async function createCliente() {
  const form = document.getElementById("form-agregar-cliente");
  if (!form) return console.error("formulario no encontrado");

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
    
    // Construir el mensaje específico
    switch (campoDuplicado) {
      case "documento":
        mensaje += "DOCUMENTO.";
        break;
      case "telefono":
        mensaje += "TELÉFONO.";
        break;
      case "email":
        mensaje += "EMAIL.";
        break;
      default:
        mensaje += "dato (desconocido)."; // Manejo de errores
    }
    mostrarError(mensaje);
    return; // Detener la creación del cliente
  }

  try {
    const clienteCreado = await window.api.addCliente(nuevoCliente);
    console.log("Cliente creado:", clienteCreado);
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
    console.log("se ejecuto el init")
    createCliente();
  });
}

function initFormSubmitModificar() {
  const form = document.getElementById("btn-guardar");
  form?.addEventListener("click", async (e) => {
    e.preventDefault();
    await updateCliente();
  }); 
  const btnEliminar = document.getElementById("btn-eliminar");
  btnEliminar?.addEventListener("click", async (e) => {
    e.preventDefault();
    await eliminarCliente();
  });
}

async function eliminarCliente() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  if (!id) return console.log("ID no proporcionado para eliminar cliente");
  try {

    await window.api.deleteCliente(id);
    console.log(`Cliente con ID ${id} eliminado`);
    window.location.href = "cliente.html"; // Volver a la lista después de eliminar
  } catch (error) {
    console.error("Error al eliminar cliente:", error);
  }

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

  const documentoExistente = await getClienteById(id);

  try {
    window.api.updateCliente(id, clienteActualizado);
    console.log("cliente actualizado")
    window.location.href = "cliente.html";

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

  } 
  if (pathname.includes("agregarCliente.html")) {
    console.log("En agregarCliente.html");
    initFormSubmit();
  }
  if (pathname.includes("modificarCliente.html")) {
    console.log("En modificarCliente.html");
    const cliente = await obtenerClientePorId();
    if ( cliente) { // <--- Verificación corregida
      rellenarFormulario(cliente);
      console.log(cliente[0]);

    } else {
      window.api.logToMain("No se encontró el cliente - posiblemente ID inválido");
    }
    initFormSubmitModificar();
  } 

});
