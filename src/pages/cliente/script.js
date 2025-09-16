





// Función para manejar el evento de envío del formulario: FUNCIONA
function btnAgregar() {
    if (document.getElementById("form-agregar-cliente")) {
        document.getElementById("form-agregar-cliente").addEventListener("submit", (event) => {
            event.preventDefault();
            console.log("Formulario de cliente enviado");
            createCliente();
        });
    }
    
}

// Función para crear un nuevo cliente: FUNCIONA
async function createCliente() {
    
    const nombre = document.getElementById("nombre").value;
    const documento = document.getElementById("documento").value;
    const direccion = document.getElementById("direccion").value;
    const telefono = document.getElementById("telefono").value;
    const email = document.getElementById("email").value;
    const id_usuario = document.getElementById("id_usuario").value;
    const nuevoCliente = { nombre, documento, direccion, telefono, email, id_usuario };
    
    try {
        const clienteCreado = await window.api.addCliente(nuevoCliente);
        console.log("Cliente creado en backend:", clienteCreado);
    } catch (error) {
        console.error("Error al crear cliente:", error);
    }
}

document.addEventListener("DOMContentLoaded",  async () => {
    const cliente = await data();
    async function updateList(clientes) {
        const lista = document.getElementById("clientes");
        clientes.forEach(cliente => {
            const li = document.createElement("li");
            li.textContent = `${cliente.nombre} - ${cliente.dni_ruc} - ${cliente.direccion} - ${cliente.telefono} - ${cliente.email}`;
            lista.appendChild(li);
            });
    }
    await updateList(cliente);

    btnAgregar();
});
    