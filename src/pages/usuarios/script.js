// Función para crear un nuevo usuario: FUNCIONA
async function createUsuario() {
    const username = document.getElementById("username").value;
    const password_hash = document.getElementById("password_hash").value;
    const rol = document.getElementById("rol").value;
    const id_usuario = document.getElementById("id_usuario").value;
    const nuevoUsuario = { id_usuario, username, password_hash, rol };
    console.log("Nuevo usuario creado:", nuevoUsuario);
    if (!id_usuario || !username || !password_hash || !rol) {
        console.error("Todos los campos son obligatorios.");
    } else {
        console.log("Enviando nuevo usuario al backend");
        try {
            const usuarioCreado = await window.api.addUsuario(nuevoUsuario);
            console.log("Usuario creado en backend:", usuarioCreado);
        } catch (error) {
            console.error("Error al crear usuario:", error);
        }
    }
   
}

// Función para agregar evento al botón de agregar: FUNCIONA
function btnAgregar() {
    if (document.getElementById("form-agregar-usuario")) {
    const form = document.getElementById("form-agregar-usuario");
    form.addEventListener("submit", (event) => {
        event.preventDefault();
        console.log("Formulario de usuario enviado");
        createUsuario();
    });
    }
}

document.addEventListener("DOMContentLoaded",  async () => {
    btnAgregar();
});