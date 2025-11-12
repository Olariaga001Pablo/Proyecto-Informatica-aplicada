// script.js - Funcionalidades de la vista Proyectos (lista, agregar, modificar, eliminar)


// ---------- Navegación General ----------

document.getElementById("home")?.addEventListener("click", () => {
  window.location.href = "../../index.html";
});

document.getElementById("btn-add-proyecto")?.addEventListener("click", () => {
  window.location.href = "agregarProyecto.html";
});

document.getElementById("btn-cancelar")?.addEventListener("click", () => {
  window.location.href = "proyecto.html";
});


// ---------- Funciones Backend ----------

async function getProyectos() {
  try {
    return await window.proyectoAPI.getProyectos();
  } catch (error) {
    console.error("Error al obtener proyectos:", error);
    return [];
  }
}

async function getProyectoById(id) {
  try {
    return await window.proyectoAPI.getProyectoById(id);
  } catch (error) {
    console.error("Error al obtener proyecto por ID:", error);
    return null;
  }
}

async function getClientes() {
  try {
    return await window.api.getClientes();
  } catch (error) {
    console.error("Error al obtener clientes:", error);
    return [];
  }
}


// ---------- Funciones de soporte ----------

async function cargarClientes() {
  const select = document.getElementById("cliente") || document.getElementById("mod-cliente");
  if (!select) return;

  try {
    const clientes = await getClientes();
    select.innerHTML = "<option value=''>Seleccione un cliente</option>";

    clientes.forEach(cli => {
      const opt = document.createElement("option");
      opt.value = cli.id_cliente;
      opt.textContent = `${cli.nombre} ${cli.apellido || ""}`;
      select.appendChild(opt);
    });
  } catch (error) {
    console.error("Error al cargar clientes en el select:", error);
  }
}


// ---------- PROYECTO: Listado ----------

async function cargarProyectos() {
  const contenedor = document.getElementById("contenedor");
  if (!contenedor) return;

  const proyectos = await getProyectos();
  const clientes = await getClientes();
  actualizarProyectosCount(proyectos.length);

  contenedor.innerHTML = "";

  if (proyectos.length === 0) {
    contenedor.innerHTML = "<p>No hay proyectos registrados.</p>";
    return;
  }

  let fila;
  proyectos.forEach((proyecto) => {
    const cliente = clientes.find(c => c.id_cliente === proyecto.id_cliente);
    const nombreCliente = cliente
      ? `${cliente.nombre} ${cliente.apellido || ""}`
      : "Sin asignar";

    const card = document.createElement("div");
    card.className = "proyecto-item";
    card.id = proyecto.id_proyecto;

    card.innerHTML = `
      <div class="proyecto-info">
        <h2>${proyecto.tipo || "Sin tipo"}</h2>
        <p><strong>Cliente:</strong> ${nombreCliente}</p>
        <p><strong>Dirección:</strong> ${proyecto.direccion || "-"}</p>
        <p><strong>Costo:</strong> $${proyecto.costo || 0}</p>
        <p><strong>Duración:</strong> ${proyecto.duracion || 0} días</p>
        <p><strong>Fecha:</strong> ${proyecto.fecha || "-"}</p>
        <p><strong>Código:</strong> ${proyecto.codigo || "-"}</p>
      </div>

      <button class="btn-editar" value="${proyecto.id_proyecto}">
        <img src="../../public/icons/content-modified.svg" alt="Editar">
      </button>
    `;

    contenedor.appendChild(card);
  });

  obtenerIdProyecto();
}

function actualizarProyectosCount(cantidad) {
  const contador = document.getElementById("proyectos-count");
  if (contador) contador.textContent = cantidad;
}

function obtenerIdProyecto() {
  const botones = document.querySelectorAll(".btn-editar");
  botones.forEach(boton => {
    boton.addEventListener("click", (e) => {
      const id = e.currentTarget.value;
      window.location.href = `modificarProyecto.html?id=${id}`;
    });
  });
}


// ---------- PROYECTO: Agregar ----------

async function createProyecto() {
  const nuevoProyecto = {
    tipo: document.getElementById("tipo")?.value || "",
    direccion: document.getElementById("direccion")?.value || "",
    costo: parseFloat(document.getElementById("costo")?.value) || 0,
    duracion: parseInt(document.getElementById("duracion")?.value) || 0,
    fecha: document.getElementById("fecha")?.value || "",
    codigo: document.getElementById("codigo")?.value || "",
    id_cliente: parseInt(document.getElementById("cliente")?.value) || null
  };

  try {
    await window.proyectoAPI.guardarProyecto(nuevoProyecto);
    window.location.href = "proyecto.html";
  } catch (error) {
    console.error("Error al crear proyecto:", error);
  }
}

function initFormSubmitProyecto() {
  const form = document.getElementById("form-agregar-proyecto");
  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    createProyecto();
  });
}


// ---------- PROYECTO: Modificar ----------

async function updateProyecto() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  if (!id) return console.error("ID de proyecto no proporcionado en la URL");

  const proyectoActualizado = {
    tipo: document.getElementById("mod-tipo")?.value || "",
    direccion: document.getElementById("mod-direccion")?.value || "",
    costo: parseFloat(document.getElementById("mod-costo")?.value) || 0,
    duracion: parseInt(document.getElementById("mod-duracion")?.value) || 0,
    fecha: document.getElementById("mod-fecha")?.value || "",
    codigo: document.getElementById("mod-codigo")?.value || "",
    id_cliente: parseInt(document.getElementById("mod-cliente")?.value) || null
  };

  try {
    await window.proyectoAPI.updateProyecto(id, proyectoActualizado);
    window.location.href = "proyecto.html";
  } catch (error) {
    console.error("Error al actualizar proyecto:", error);
  }
}

async function obtenerProyectoPorId() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  if (!id) throw new Error("ID no proporcionado en la URL");

  return await getProyectoById(id);
}

function rellenarFormularioProyecto(proyecto) {
  if (!proyecto) return;
  document.getElementById("mod-tipo").value = proyecto.tipo || "";
  document.getElementById("mod-direccion").value = proyecto.direccion || "";
  document.getElementById("mod-costo").value = proyecto.costo || "";
  document.getElementById("mod-duracion").value = proyecto.duracion || "";
  document.getElementById("mod-fecha").value = proyecto.fecha || "";
  document.getElementById("mod-codigo").value = proyecto.codigo || "";
  document.getElementById("mod-cliente").value = proyecto.id_cliente || "";
}

function initFormSubmitModificarProyecto() {
  document.getElementById("btn-guardar")?.addEventListener("click", (e) => {
    e.preventDefault();
    updateProyecto();
  });

  document.getElementById("btn-eliminar")?.addEventListener("click", (e) => {
    e.preventDefault();
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    if (id) {
      window.location.href = `eliminarProyecto.html?id=${id}`;
    } else {
      alert("No se encontró el proyecto para eliminar.");
    }
  });
}


// ---------- PROYECTO: Eliminar ----------


// ---------------------------- INICIALIZACIÓN ----------------------------

document.addEventListener("DOMContentLoaded", async () => {
  const pathname = window.location.pathname;

  if (pathname.includes("proyecto.html")) {
    await cargarProyectos();
  }

  if (pathname.includes("agregarProyecto.html")) {
    await cargarClientes();
    initFormSubmitProyecto();
  }

  if (pathname.includes("modificarProyecto.html")) {
    await cargarClientes();
    const proyecto = await obtenerProyectoPorId();
    if (proyecto) rellenarFormularioProyecto(proyecto);
    initFormSubmitModificarProyecto();
  }

  if (pathname.includes("eliminarProyecto.html")) {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    document.getElementById("btn-cancelar")?.addEventListener("click", () => {
      window.history.back();
    });

    document.getElementById("btn-confirmar")?.addEventListener("click", async () => {
      try {
        await window.proyectoAPI.eliminarProyecto(id);
        console.log("Proyecto eliminado correctamente");
        window.location.href = "proyecto.html";
      } catch (error) {
        console.error("Error al eliminar proyecto:", error);
      }
    });
  }
});
