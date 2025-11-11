// Botón volver
document.getElementById("btn-volver")?.addEventListener("click", () => {
  window.location.href = "proyecto.html";
});

// Botón "+ Agregar" -> va a agregarProyecto.html
document.getElementById("btn-add-proyecto")?.addEventListener("click", () => {
  window.location.href = "agregarProyecto.html";
});

// Botón cancelar
document.getElementById("btn-cancelar")?.addEventListener("click", () => {
  window.location.href = "proyecto.html";
});

// Mostrar errores
function mostrarError(mensaje) {
  const errorDiv = document.getElementById("mensaje-error");
  if (errorDiv) {
    errorDiv.textContent = mensaje;
    errorDiv.style.display = "flex";
  }
}

// Cargar clientes en el select
async function cargarClientes() {
  const select = document.getElementById("cliente");
  try {
    const clientes = await window.api.getClientes();
    clientes.forEach(cli => {
      const opt = document.createElement("option");
      opt.value = cli.id_cliente;
      opt.textContent = `${cli.nombre} ${cli.apellido || ""}`;
      select.appendChild(opt);
    });
  } catch (error) {
    console.error("Error al cargar clientes:", error);
  }
}

// Crear proyecto
async function createProyecto() {
  const proyecto = {
    id_cliente: document.getElementById("cliente").value,
    ubicacion: document.getElementById("ubicacion").value,
    fecha_inicio: document.getElementById("fecha_inicio").value,
    estado: document.getElementById("estado").value,
    costo_mano_obra: parseFloat(document.getElementById("mano_obra").value) || 0,
    costo_estructura: parseFloat(document.getElementById("estructura").value) || 0,
    costo_inversor: parseFloat(document.getElementById("inversor").value) || 0,
    costo_panel_solar: parseFloat(document.getElementById("panel_solar").value) || 0
  };

  if (!proyecto.id_cliente || !proyecto.ubicacion) {
    mostrarError("Por favor, completa todos los campos obligatorios.");
    return;
  }

  try {
    await window.proyectoAPI.guardarProyecto(proyecto);
    window.location.href = "proyecto.html";
  } catch (error) {
    console.error("Error al guardar proyecto:", error);
    mostrarError("No se pudo guardar el proyecto.");
  }
}

// Evento submit
document.getElementById("form-agregar-proyecto")?.addEventListener("submit", (e) => {
  e.preventDefault();
  createProyecto();
});

// Inicializar
document.addEventListener("DOMContentLoaded", async () => {
  await cargarClientes();
});
