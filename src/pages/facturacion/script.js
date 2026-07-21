// Botón "home" -> vuelve al index
document.getElementById("home")?.addEventListener("click", () => {
  window.location.href = "../../index.html";
});
// Botón "+ Agregar" -> va a agregarFacturacion.html
document.getElementById("btn-add-factura")?.addEventListener("click", () => {
  window.location.href = "agregarFacturacion.html";
});

// Botón "Cancelar" en agregarFacturacion.html -> vuelve a la lista
document.getElementById("btn-cancelar")?.addEventListener("click", () => {
  window.location.href = "facturacion.html";
});

// ---------- Helpers de formato ----------

function formatearMoneda(valor) {
  const n = Number(valor) || 0;
  return n.toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function formatearFecha(valor) {
  if (!valor) return "-";
  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) return valor;
  return fecha.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
}

// ---------- Funciones Backend ----------

async function getFacturacion() {
    try {
        const facturacion = await window.facturacionAPI.getFacturacion();
        return facturacion;
    } catch (error) {
        console.error("Error al obtener facturación:", error);
        return [];
    }   
}

function actualizarFacturacionCount(cantidad) {
  const contador = document.getElementById("facturacion-count");
  if (contador) contador.textContent = cantidad;
}

async function cargarFacturacion() {
    const contenedor = document.getElementById("contenedor");
    contenedor.innerHTML = ""; // Limpia el contenedor antes de cargar los datos
    const facturacion = await getFacturacion();

    actualizarFacturacionCount(facturacion.length);

    if (facturacion.length === 0) {
      contenedor.innerHTML = '<p class="contador">Todavía no hay facturas cargadas.</p>';
      return;
    }

    facturacion.forEach(factura => {
        const facturaDiv = document.createElement("div");
        facturaDiv.classList.add("factura-item");
        facturaDiv.innerHTML = `
            <div class="factura-info">
              <p class="factura-titulo">Factura #${factura.id_facturacion}</p>
              <p class="factura-meta">${factura.tipo_proyecto || "Proyecto sin tipo"} · Código: ${factura.codigo_proyecto || "-"}</p>
              <p class="factura-meta">Cliente: ${factura.nombre_cliente || "-"}</p>
              <p class="factura-meta">Fecha: ${formatearFecha(factura.fecha_facturacion)}</p>
            </div>
            <div class="factura-monto">${formatearMoneda(factura.costo_proyecto)}</div>
        `;
        contenedor.appendChild(facturaDiv);
    });
}

// ---------- Crear (agregarFacturacion.html) ----------

function mostrarErrorFactura(mensaje) {
  const errorDiv = document.getElementById("mensaje-error");
  if (errorDiv) {
    errorDiv.textContent = mensaje;
    errorDiv.classList.add("visible");
  }
}

function limpiarErrorFactura() {
  const errorDiv = document.getElementById("mensaje-error");
  if (errorDiv) {
    errorDiv.textContent = "";
    errorDiv.classList.remove("visible");
  }
}

async function cargarProyectosEnSelectFactura(selectElement) {
  try {
    const proyectos = await window.proyectoAPI.getProyectos();
    selectElement.innerHTML = '<option value="">Seleccione un Proyecto</option>';
    proyectos.forEach((p) => {
      const option = document.createElement("option");
      option.value = p.id_proyecto;
      const cliente = [p.cliente_nombre, p.cliente_apellido].filter(Boolean).join(" ");
      option.dataset.cliente = cliente || "-";
      option.dataset.costo = p.costo || 0;
      option.textContent = `${p.codigo || p.tipo} ${cliente ? "- " + cliente : ""}`;
      selectElement.appendChild(option);
    });
  } catch (error) {
    console.error("Error al cargar proyectos:", error);
    mostrarErrorFactura("No se pudieron cargar los proyectos.");
  }
}

function initSelectorProyectoFactura(selectElement) {
  const inputCliente = document.getElementById("cliente-factura");
  const inputCosto = document.getElementById("costo-factura");

  selectElement?.addEventListener("change", () => {
    const opcion = selectElement.selectedOptions[0];
    if (!opcion || !opcion.value) {
      inputCliente.value = "";
      inputCosto.value = "";
      return;
    }
    inputCliente.value = opcion.dataset.cliente || "-";
    inputCosto.value = formatearMoneda(opcion.dataset.costo);
  });
}

async function crearFactura() {
  limpiarErrorFactura();

  const idProyecto = parseInt(document.getElementById("proyecto-factura")?.value) || null;
  const fecha = document.getElementById("fecha-factura")?.value;

  if (!idProyecto) {
    mostrarErrorFactura("Seleccioná un proyecto para facturar.");
    return;
  }
  if (!fecha) {
    mostrarErrorFactura("Seleccioná una fecha para la factura.");
    return;
  }

  try {
    await window.facturacionAPI.addFacturacion(idProyecto, fecha);
    window.location.href = "facturacion.html";
  } catch (error) {
    console.error("Error al crear factura:", error);
    mostrarErrorFactura(error?.message || "No se pudo crear la factura. Intentá de nuevo.");
  }
}

function initFormAgregarFactura() {
  const form = document.getElementById("form-agregar-factura");
  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    crearFactura();
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  const pathname = window.location.pathname;

  if (pathname.includes("facturacion.html")) {
    await cargarFacturacion();
  }

  if (pathname.includes("agregarFacturacion.html")) {
    const selectProyecto = document.getElementById("proyecto-factura");
    await cargarProyectosEnSelectFactura(selectProyecto);
    initSelectorProyectoFactura(selectProyecto);
    initFormAgregarFactura();
  }
});