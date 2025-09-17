function cambiar() {
  const id_home = document.getElementById("home");
  if (id_home) {
    id_home.addEventListener("click", () => {
      window.location.href = "./../../index.html";
    });
  } else {
    console.log("No se encontró el elemento con id 'home'");
  }
}

function filtrarPorMes() {
  const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio"];
  const contenedor = document.getElementById("filtrar-mes");
  contenedor.innerHTML = ""; // limpiar antes
  meses.forEach((mes) => {
    const item = document.createElement("button");
    item.textContent = mes;
    contenedor.appendChild(item);
  });
}

// Función para manejar el evento de envío del formulario: FUNCIONA
function btnAgregar() {
  if (document.getElementById("form-agregar-cliente")) {
    document
      .getElementById("form-agregar-cliente")
      .addEventListener("submit", (event) => {
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
  const nuevoCliente = {
    nombre,
    documento,
    direccion,
    telefono,
    email,
    id_usuario,
  };

  try {
    const clienteCreado = await window.api.addCliente(nuevoCliente);
    console.log("Cliente creado en backend:", clienteCreado);
  } catch (error) {
    console.error("Error al crear cliente:", error);
  }
}
const data = async () => {
  const clientes = await window.api.getClientes();
  console.log("Clientes desde el render:", clientes);
  return clientes;
};

async function cargarClientes() {
  const clientes = await data();
  console.log("Clientes desde la funcion cargarClientes:");
  console.log(clientes);
  const contenedor = document.getElementById("contenedor");
  clientes.forEach((cliente) => {
    const item = document.createElement("div");
    item.className = "cliente-item";
    item.textContent = cliente.nombre;
    contenedor.appendChild(item);
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  // inicializa funciones

  cambiar();

  cargarClientes();

  btnAgregar();
});

//  document.addEventListener("DOMContentLoaded", async () => {

//         async function cargarClientes() {
//             const clientes =  await data();
//             console.log("Clientes desde la funcion cargarClientes:");
//             console.log(clientes);
//             const contenedor = document.getElementById("contenedor");
//             clientes.forEach(cliente => {
//                 const item = document.createElement("div");
//                 item.className = "cliente-item";
//                 item.textContent = cliente.nombre;
//                 contenedor.appendChild(item);
//             });
//         }
//         cargarClientes();

//     });
