// script.js - Funcionalidades de la vista Simulación

// ---------- Navegación ----------

document.getElementById("home")?.addEventListener("click", () => {
  window.location.href = "../../index.html";
});

document.getElementById("btn-add-simulacion")?.addEventListener("click", () => {
  window.location.href = "agregarSimulacion.html";
});

document.getElementById("btn-cancelar")?.addEventListener("click", () => {
  // En agregarSimulacion.html y eliminarSimulacion.html vuelve atrás/a la lista
  if (window.location.pathname.includes("agregarSimulacion.html")) {
    window.location.href = "simulacion.html";
  } else {
    window.history.back();
  }
});

// ---------- Helpers de formato ----------

function formatearNumero(valor, decimales = 2) {
  const n = Number(valor);
  if (Number.isNaN(n)) return "-";
  return n.toLocaleString("es-AR", {
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales
  });
}

function mostrarError(mensaje) {
  const errorDiv = document.getElementById("mensaje-error");
  if (errorDiv) {
    errorDiv.textContent = mensaje;
    errorDiv.classList.add("visible");
    errorDiv.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}

function limpiarError() {
  const errorDiv = document.getElementById("mensaje-error");
  if (errorDiv) {
    errorDiv.textContent = "";
    errorDiv.classList.remove("visible");
  }
}

// ---------- Backend ----------

async function getSimulaciones() {
  try {
    return await window.simulacionAPI.getSimulaciones();
  } catch (error) {
    console.error("Error al obtener simulaciones:", error);
    return [];
  }
}

async function getSimulacionById(id) {
  try {
    return await window.simulacionAPI.getSimulacionById(id);
  } catch (error) {
    console.error("Error al obtener simulación por ID:", error);
    return null;
  }
}

async function getProyectosParaSelect() {
  try {
    return await window.proyectoAPI.getProyectos();
  } catch (error) {
    console.error("Error al obtener proyectos:", error);
    return [];
  }
}

// ---------- Lista (simulacion.html) ----------

function actualizarContador(cantidad) {
  const contador = document.getElementById("simulaciones-count");
  if (contador) contador.textContent = cantidad;
}

async function cargarSimulaciones() {
  const contenedor = document.getElementById("contenedor");
  if (!contenedor) return;

  const simulaciones = await getSimulaciones();
  actualizarContador(simulaciones.length);

  contenedor.innerHTML = "";

  if (simulaciones.length === 0) {
    contenedor.innerHTML = `<p class="contador">Todavía no hay simulaciones cargadas.</p>`;
    return;
  }

  simulaciones.forEach((sim) => {
    const card = document.createElement("div");
    card.className = "simulacion-card";

    const clienteNombre = [sim.cliente_nombre, sim.cliente_apellido].filter(Boolean).join(" ");

    card.innerHTML = `
      <div class="simulacion-info">
        <strong>${sim.codigo_proyecto || sim.tipo_proyecto || "Proyecto sin código"}</strong>
        <span>Cliente: ${clienteNombre || "-"}</span>
        <span>${sim.cantidad_paneles} panel(es) de ${sim.potencia_panel_w} W</span>
      </div>
      <div class="simulacion-resultado">
        <div class="resultado-chip">
          <span class="valor">${formatearNumero(sim.produccion_mensual_kwh, 1)}</span>
          <span class="etiqueta">kWh / mes</span>
        </div>
        <div class="resultado-chip ahorro">
          <span class="valor">$${formatearNumero(sim.ahorro_estimado, 2)}</span>
          <span class="etiqueta">Ahorro / mes</span>
        </div>
      </div>
      <div class="simulacion-acciones">
        <button class="btn-ver" data-id="${sim.id_simulacion}">Ver detalle</button>
        <button class="btn-eliminar" data-id="${sim.id_simulacion}">Eliminar</button>
      </div>
    `;

    contenedor.appendChild(card);
  });

  contenedor.querySelectorAll(".btn-ver").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const id = e.currentTarget.dataset.id;
      window.location.href = `verSimulacion.html?id=${id}`;
    });
  });

  contenedor.querySelectorAll(".btn-eliminar").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const id = e.currentTarget.dataset.id;
      window.location.href = `eliminarSimulacion.html?id=${id}`;
    });
  });
}

// ---------- Crear (agregarSimulacion.html) ----------

async function cargarProyectosEnSelect(selectElement) {
  try {
    const proyectos = await getProyectosParaSelect();
    selectElement.innerHTML = '<option value="">Seleccione un Proyecto</option>';
    proyectos.forEach((p) => {
      const option = document.createElement("option");
      option.value = p.id_proyecto;
      const cliente = [p.cliente_nombre, p.cliente_apellido].filter(Boolean).join(" ");
      option.textContent = `${p.codigo || p.tipo} ${cliente ? "- " + cliente : ""}`;
      selectElement.appendChild(option);
    });
  } catch (error) {
    console.error("Error al cargar proyectos:", error);
  }
}

// Trae del proyecto la cantidad total de paneles y la potencia promedio
// ponderada (Σ cantidad×potencia / Σ cantidad), y completa los campos
// de solo lectura del formulario. Si el proyecto no tiene paneles
// asignados, avisa y deja los campos en 0.
async function autocompletarPanelesDesdeProyecto(idProyecto) {
  const inputCantidad = document.getElementById("cantidad-paneles");
  const inputPotencia = document.getElementById("potencia-panel");

  if (!idProyecto) {
    inputCantidad.value = "";
    inputPotencia.value = "";
    return;
  }

  try {
    const datos = await window.productoProyectoAPI.getPanelesProyecto(Number(idProyecto));
    inputCantidad.value = datos?.cantidad_paneles || 0;
    inputPotencia.value = datos?.potencia_panel_w
      ? Number(datos.potencia_panel_w).toFixed(2)
      : 0;

    if (!datos?.cantidad_paneles) {
      mostrarError("Este proyecto no tiene paneles solares asignados todavía. Asignalos antes de simular.");
    } else {
      limpiarError();
    }
  } catch (error) {
    console.error("Error al obtener paneles del proyecto:", error);
    mostrarError("No se pudieron obtener los paneles del proyecto.");
  }
}

function initSelectorProyectoSimulacion(selectElement) {
  selectElement?.addEventListener("change", () => {
    autocompletarPanelesDesdeProyecto(selectElement.value);
  });
}

async function crearSimulacion() {
  limpiarError();

  const idProyecto = parseInt(document.getElementById("proyecto-simulacion")?.value) || null;
  const cantidadPaneles = parseInt(document.getElementById("cantidad-paneles")?.value) || 0;
  const potenciaPanel = parseFloat(document.getElementById("potencia-panel")?.value) || 0;
  const horasSol = parseFloat(document.getElementById("horas-sol")?.value) || 0;
  const consumoPrevio = parseFloat(document.getElementById("consumo-previo")?.value) || 0;
  const tarifa = parseFloat(document.getElementById("tarifa-kwh")?.value) || 0;

  if (!idProyecto) {
    mostrarError("Seleccioná un proyecto para la simulación.");
    return;
  }
  if (cantidadPaneles <= 0 || potenciaPanel <= 0) {
    mostrarError("El proyecto seleccionado no tiene paneles asignados. Asignalos antes de simular.");
    return;
  }

  const datos = {
    id_proyecto: idProyecto,
    cantidad_paneles: cantidadPaneles,
    potencia_panel_w: potenciaPanel,
    horas_sol_dia: horasSol,
    consumo_previo_kwh: consumoPrevio,
    tarifa_kwh: tarifa
  };

  try {
    const resultado = await window.simulacionAPI.addSimulacion(datos);
    window.location.href = `verSimulacion.html?id=${resultado.id_simulacion}`;
  } catch (error) {
    console.error("Error al crear simulación:", error);
    mostrarError("No se pudo crear la simulación. Intentá de nuevo.");
  }
}

function initFormAgregar() {
  const form = document.getElementById("form-agregar-simulacion");
  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    crearSimulacion();
  });
}

// ---------- Detalle (verSimulacion.html) ----------

function setTexto(id, valor) {
  const el = document.getElementById(id);
  if (el) el.textContent = valor;
}

async function cargarDetalle() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  if (!id) {
    console.error("ID de simulación no proporcionado en la URL");
    return;
  }

  const sim = await getSimulacionById(id);
  if (!sim) {
    console.error("No se encontró la simulación - ID inválido");
    return;
  }

  setTexto("det-produccion", formatearNumero(sim.produccion_mensual_kwh, 1));
  setTexto("det-ahorro", `$${formatearNumero(sim.ahorro_estimado, 2)}`);

  setTexto("det-codigo-proyecto", sim.codigo_proyecto || "-");
  setTexto("det-tipo-proyecto", sim.tipo_proyecto || "-");
  const cliente = [sim.cliente_nombre, sim.cliente_apellido].filter(Boolean).join(" ");
  setTexto("det-cliente", cliente || "-");

  setTexto("det-cantidad-paneles", sim.cantidad_paneles);
  setTexto("det-potencia-panel", `${sim.potencia_panel_w} W`);
  setTexto("det-horas-sol", sim.horas_sol_dia);
  setTexto("det-consumo-previo", `${formatearNumero(sim.consumo_previo_kwh, 2)} kWh`);
  setTexto("det-tarifa", `$${formatearNumero(sim.tarifa_kwh, 2)}`);

  // Botón Eliminar en el header del detalle
  document.getElementById("btn-eliminar")?.addEventListener("click", () => {
    window.location.href = `eliminarSimulacion.html?id=${id}`;
  });
}

// ---------- Eliminar (eliminarSimulacion.html) ----------

function initFormEliminar() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  const form = document.getElementById("form-eliminar-simulacion");
  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!id) {
      alert("No se encontró la simulación a eliminar.");
      return;
    }
    try {
      await window.simulacionAPI.deleteSimulacion(id);
      window.location.href = "simulacion.html";
    } catch (error) {
      console.error("Error al eliminar simulación:", error);
      alert("No se pudo eliminar la simulación.");
    }
  });
}

// ---------------------------- INICIALIZACIÓN ----------------------------
document.addEventListener("DOMContentLoaded", async () => {
  const pathname = window.location.pathname;

  if (pathname.includes("simulacion.html")) {
    await cargarSimulaciones();
  }
  if (pathname.includes("agregarSimulacion.html")) {
    const selectProyecto = document.getElementById("proyecto-simulacion");
    await cargarProyectosEnSelect(selectProyecto);
    initSelectorProyectoSimulacion(selectProyecto);
    initFormAgregar();
  }
  if (pathname.includes("verSimulacion.html")) {
    await cargarDetalle();
  }
  if (pathname.includes("eliminarSimulacion.html")) {
    initFormEliminar();
  }
});