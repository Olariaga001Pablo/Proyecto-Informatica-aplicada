// Botón "home" -> vuelve al index
document.getElementById("home")?.addEventListener("click", () => {
  window.location.href = "../../index.html";
});
// Botón "+ Agregar" -> va a agregarProducto.html
document.getElementById("btn-add-producto")?.addEventListener("click", () => {
  window.location.href = "agregarFacturacion.html";
});

// Botón "Cancelar" en agregarProducto.html -> vuelve a la lista
document.getElementById("btn-cancelar")?.addEventListener("click", () => {
  window.location.href = "facturacion.html";
});

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
    console.log("Facturación obtenida:", facturacion);
    
    actualizarFacturacionCount(facturacion.length);
    facturacion.forEach(factura => {
        const facturaDiv = document.createElement("div");
        facturaDiv.classList.add("factura-item");
        facturaDiv.innerHTML = `
            <h3>Factura #${factura.id_facturacion}</h3>
            <p>Cliente ID: ${factura.id_cliente}</p>
            <p>Nombre del Proyecto: ${factura.tipo_proyecto}</p>
            <p>Nombre del Cliente: ${factura.nombre_cliente}</p>
            <p>Fecha: ${factura.fecha_facturacion}</p>
            <p>Total: $${factura.costo_proyecto}</p>
        `;
        contenedor.appendChild(facturaDiv);
    });
}

document.addEventListener("DOMContentLoaded", async () => {
  const pathname = window.location.pathname;

  if (pathname.includes("facturacion.html")) {
    await cargarFacturacion();
  }
  
});
