const token = localStorage.getItem("token");

if (!token) {
  window.location.href = "/html/login.html";
}

const form = document.getElementById("formLibro");
const lista = document.getElementById("listaLibros");
const contador = document.getElementById("contador");
const buscar = document.getElementById("buscar");

const titulo = document.getElementById("titulo");
const autor = document.getElementById("autor");
const estado = document.getElementById("estado");
const calificacionInput = document.getElementById("calificacion");
const submitBtn = form.querySelector("button[type='submit']");

let libros = [];
let editandoId = null;

const authHeaders = {
  "Content-Type": "application/json",
  "Authorization": "Bearer " + token
};

// =====================
// ESTRELLAS
// =====================
const estrellas = document.querySelectorAll(".estrella");

estrellas.forEach(estrella => {
  estrella.addEventListener("click", () => {
    const valor = parseInt(estrella.dataset.valor);
    calificacionInput.value = valor;
    actualizarEstrellas(valor);
  });

  estrella.addEventListener("mouseover", () => {
    const valor = parseInt(estrella.dataset.valor);
    actualizarEstrellas(valor);
  });

  estrella.addEventListener("mouseout", () => {
    actualizarEstrellas(parseInt(calificacionInput.value) || 0);
  });
});

function actualizarEstrellas(valor) {
  estrellas.forEach(e => {
    e.classList.toggle("activa", parseInt(e.dataset.valor) <= valor);
  });
}

function resetEstrellas() {
  calificacionInput.value = 0;
  actualizarEstrellas(0);
}

// =====================
// CARGAR LIBROS
// =====================
async function cargarLibros() {
  const res = await fetch("/libros", {
    headers: { "Authorization": "Bearer " + token }
  });

  if (res.status === 401) {
    window.location.href = "/html/login.html";
    return;
  }

  libros = await res.json();
  mostrarLibros(libros);
}

// =====================
// MOSTRAR LIBROS
// =====================
function mostrarLibros(data) {
  lista.innerHTML = "";
  contador.innerText = "Total: " + data.length;

  if (data.length === 0) {
    lista.innerHTML = "<p style='color:#888; text-align:center; grid-column:1/-1;'>No se encontraron libros.</p>";
    return;
  }

  data.forEach(libro => {
    const estrellasMostrar = generarEstrellasMostrar(libro.calificacion);
    const div = document.createElement("div");
    div.innerHTML = `
      <h3>${libro.titulo}</h3>
      <p>${libro.autor}</p>
      <p>${libro.estado}</p>
      <div class="estrellas-mostrar">${estrellasMostrar}</div>
      <button class="btn-ver" onclick="verLibro('${libro._id}')">Ver libro</button>
      <button class="btn-editar" onclick="editarLibro('${libro._id}')">Editar</button>
      <button class="eliminar" onclick="eliminarLibro('${libro._id}')">Eliminar</button>
    `;
    lista.appendChild(div);
  });
}

function generarEstrellasMostrar(cal) {
  let html = "";
  for (let i = 1; i <= 5; i++) {
    html += `<span style="color:${i <= cal ? "#f4c430" : "#ddd"}; font-size:16px;">★</span>`;
  }
  return html;
}

// =====================
// CREAR / ACTUALIZAR
// =====================
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const body = {
    titulo: titulo.value,
    autor: autor.value,
    estado: estado.value,
    calificacion: parseInt(calificacionInput.value) || 0
  };

  if (editandoId) {
    await fetch("/libros/" + editandoId, {
      method: "PUT",
      headers: authHeaders,
      body: JSON.stringify(body)
    });
    mostrarNotificacion("✔ Libro actualizado correctamente");
    cancelarEdicion();
  } else {
    await fetch("/libros", {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify(body)
    });
    mostrarNotificacion("✔ Libro agregado correctamente");
    form.reset();
    resetEstrellas();
  }

  cargarLibros();
});

// =====================
// EDITAR LIBRO
// =====================
function editarLibro(id) {
  const libro = libros.find(l => l._id === id);
  if (!libro) return;

  titulo.value = libro.titulo;
  autor.value = libro.autor;
  estado.value = libro.estado;
  calificacionInput.value = libro.calificacion;
  actualizarEstrellas(libro.calificacion);

  editandoId = id;
  submitBtn.textContent = "Actualizar libro";
  submitBtn.style.background = "linear-gradient(135deg, #3a7bd5 0%, #1a4fa0 100%)";
  document.getElementById("btnCancelar").style.display = "block";
  form.scrollIntoView({ behavior: "smooth" });
}

// =====================
// CANCELAR EDICION
// =====================
function cancelarEdicion() {
  editandoId = null;
  form.reset();
  resetEstrellas();
  submitBtn.textContent = "Agregar libro";
  submitBtn.style.background = "";
  document.getElementById("btnCancelar").style.display = "none";
}

// =====================
// ELIMINAR LIBRO
// =====================
async function eliminarLibro(id) {
  if (!confirm("¿Seguro que quieres eliminar este libro?")) return;
  await fetch("/libros/" + id, {
    method: "DELETE",
    headers: { "Authorization": "Bearer " + token }
  });
  cargarLibros();
}

// =====================
// VER LIBRO
// =====================
function verLibro(id) {
  window.location.href = "/html/libro.html?id=" + id;
}

// =====================
// LOGOUT
// =====================
function logout() {
  if (confirm("¿Seguro que quieres cerrar sesión?")) {
    localStorage.removeItem("token");
    window.location.href = "/html/login.html";
  }
}

// =====================
// BUSCAR
// =====================
buscar.addEventListener("input", () => {
  const texto = buscar.value.toLowerCase();
  const filtrados = libros.filter(l => l.titulo.toLowerCase().includes(texto));
  mostrarLibros(filtrados);
});

// =====================
// NOTIFICACION
// =====================
function mostrarNotificacion(mensaje) {
  const notif = document.getElementById("notificacion");
  notif.textContent = mensaje;
  notif.style.display = "block";
  setTimeout(() => { notif.style.display = "none"; }, 3000);
}

cargarLibros();