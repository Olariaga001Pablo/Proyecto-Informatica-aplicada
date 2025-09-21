// 
const { contextBridge, ipcRenderer } = require("electron");


contextBridge.exposeInMainWorld("api", {
  getClientes: () => ipcRenderer.invoke("get-clientes"),
  getClienteById: (id) => ipcRenderer.invoke("get-clientes-by-id", id),
  addCliente: (cliente) => ipcRenderer.invoke("add-cliente", cliente),
  updateCliente: (id, data) => ipcRenderer.invoke("update-cliente", id, data),
  addUsuario: (usuario) => ipcRenderer.invoke("add-usuario", usuario),
  logToMain: (msg) => ipcRenderer.send("log-message", msg)
});