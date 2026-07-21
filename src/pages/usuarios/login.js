// src/pages/usuarios/login.js

const form = document.getElementById('login-form');
const errorMsg = document.getElementById('error-msg');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  errorMsg.style.display = 'none';

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  try {
    const resultado = await window.authAPI.login(email, password);

    if (!resultado.ok) {
      errorMsg.textContent = resultado.error || 'Usuario o contraseña incorrectos';
      errorMsg.style.display = 'flex';
      return;
    }

    window.location.href = '../../index.html';

  } catch (err) {
    errorMsg.textContent = 'Error de conexión con el sistema. Intente nuevamente.';
    errorMsg.style.display = 'flex';
    console.error(err);
  }
});