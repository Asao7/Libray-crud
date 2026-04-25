const token = localStorage.getItem("token");
if (!token) window.location.href = "/html/login.html";

const authHeaders = {
  "Content-Type": "application/json",
  "Authorization": "Bearer " + token
};

let libros = [];
let editandoId = null;
let filtroActual = "todos";

// ── ESTRELLAS ──
const estrellas = document.querySelectorAll(".estrella");
const calificacionInput = document.getElementById("calificacion");

estrellas.forEach(e => {
  e.addEventListener("click", () => {
    calificacionInput.value = e.dataset.valor;
    actualizarEstrellas(parseInt(e.dataset.valor));
  });
  e.addEventListener("mouseover", () => actualizarEstrellas(parseInt(e.dataset.valor)));
  e.addEventListener("mouseout", () => actualizarEstrellas(parseInt(calificacionInput.value) || 0));
});

function actualizarEstrellas(val) {
  estrellas.forEach(e => e.classList.toggle("activa", parseInt(e.dataset.valor) <= val));
}

function resetEstrellas() {
  calificacionInput.value = 0;
  actualizarEstrellas(0);
}

// ── CARGAR ──
async function cargarLibros() {
  const res = await fetch("/libros", { headers: { "Authorization": "Bearer " + token } });
  if (res.status === 401) { window.location.href = "/html/login.html"; return; }
  libros = await res.json();
  actualizarStats();
  mostrarLibros();
}

// ── STATS ──
function actualizarStats() {
  document.getElementById("statTotal").textContent = libros.length;
  document.getElementById("statLeidos").textContent = libros.filter(l => l.estado === "Leído").length;
  document.getElementById("statProceso").textContent = libros.filter(l => l.estado === "En proceso").length;
  const conCal = libros.filter(l => l.calificacion > 0);
  const prom = conCal.length ? (conCal.reduce((a, l) => a + l.calificacion, 0) / conCal.length).toFixed(1) : "—";
  document.getElementById("statPromedio").textContent = prom;
}

// ── MOSTRAR ──
function mostrarLibros() {
  const lista = document.getElementById("listaLibros");
  const texto = document.getElementById("buscar").value.toLowerCase();

  let data = libros;
  if (filtroActual !== "todos") data = data.filter(l => l.estado === filtroActual);
  if (texto) data = data.filter(l => l.titulo.toLowerCase().includes(texto) || l.autor.toLowerCase().includes(texto));

  lista.innerHTML = "";

  if (data.length === 0) {
    lista.innerHTML = `
      <div class="empty-state">
        <div class="icon">📭</div>
        <h3>No hay libros aquí</h3>
        <p>Agrega tu primer libro con el botón de arriba</p>
      </div>`;
    return;
  }

  const colores = ["#1e3a5f","#2d1b4e","#1a3d2b","#4a1a1a","#1a3a4a","#3d2b0a"];

  data.forEach((libro, i) => {
    const div = document.createElement("div");
    div.className = "book-card";
    div.style.animationDelay = (i * 0.05) + "s";

    const stars = Array.from({length: 5}, (_, j) =>
      `<span style="color:${j < libro.calificacion ? '#c8a96e' : '#2a2a3a'}">★</span>`
    ).join("");

    const estadoClass = "estado-" + libro.estado;
    const color = colores[i % colores.length];

    div.innerHTML = `
      <div class="book-cover" style="background: linear-gradient(135deg, ${color}, ${color}99);">
        📖
      </div>
      <div class="book-body">
        <div class="book-title">${libro.titulo}</div>
        <div class="book-author">${libro.autor}</div>
        <div class="book-stars">${stars}</div>
        <span class="book-estado ${estadoClass}">${libro.estado}</span>
        <div class="book-actions">
          <button class="btn-ver" onclick="verLibro('${libro._id}')">Ver</button>
          <button class="btn-editar" onclick="editarLibro('${libro._id}')">Editar</button>
          <button class="eliminar" onclick="eliminarLibro('${libro._id}')">✕</button>
        </div>
      </div>
    `;
    lista.appendChild(div);
  });
}

// ── FILTRO SIDEBAR ──
function filtrarEstado(estado) {
  filtroActual = estado;
  document.querySelectorAll(".nav-item").forEach(b => b.classList.remove("active"));
  event.currentTarget.classList.add("active");
  const titulos = { todos: "Mi Biblioteca", "Leído": "Leídos", "En proceso": "En proceso", "Pendiente": "Pendientes" };
  document.getElementById("seccionTitulo").textContent = titulos[estado] || "Mi Biblioteca";
  mostrarLibros();
}

// ── BUSCAR ──
document.getElementById("buscar").addEventListener("input", mostrarLibros);

// ── MODAL ──
function abrirModal(id = null) {
  editandoId = id;
  document.getElementById("modalTitulo").textContent = id ? "Editar libro" : "Agregar libro";
  document.getElementById("btnGuardar").textContent = id ? "Actualizar" : "Guardar libro";

  if (id) {
    const libro = libros.find(l => l._id === id);
    document.getElementById("titulo").value = libro.titulo;
    document.getElementById("autor").value = libro.autor;
    document.getElementById("descripcion").value = libro.descripcion || "";
    document.getElementById("estado").value = libro.estado;
    calificacionInput.value = libro.calificacion;
    actualizarEstrellas(libro.calificacion);
  } else {
    document.getElementById("formLibro").reset();
    resetEstrellas();
  }

  document.getElementById("modalOverlay").classList.add("open");
}

function cerrarModal() {
  document.getElementById("modalOverlay").classList.remove("open");
  editandoId = null;
}

function editarLibro(id) { abrirModal(id); }

// ── SUBMIT ──
async function submitLibro(e) {
  e.preventDefault();

  const body = {
    titulo: document.getElementById("titulo").value,
    autor: document.getElementById("autor").value,
    descripcion: document.getElementById("descripcion").value,
    estado: document.getElementById("estado").value,
    calificacion: parseInt(calificacionInput.value) || 0
  };

  if (editandoId) {
    await fetch("/libros/" + editandoId, { method: "PUT", headers: authHeaders, body: JSON.stringify(body) });
    mostrarNotificacion("✔ Libro actualizado");
  } else {
    await fetch("/libros", { method: "POST", headers: authHeaders, body: JSON.stringify(body) });
    mostrarNotificacion("✔ Libro agregado");
  }

  cerrarModal();
  cargarLibros();
}

// ── ELIMINAR ──
async function eliminarLibro(id) {
  if (!confirm("¿Eliminar este libro?")) return;
  await fetch("/libros/" + id, { method: "DELETE", headers: { "Authorization": "Bearer " + token } });
  mostrarNotificacion("🗑 Libro eliminado");
  cargarLibros();
}

// ── VER LIBRO ──
function verLibro(id) {
  window.location.href = "/html/libro.html?id=" + id;
}

// ── LOGOUT ──
function logout() {
  if (confirm("¿Cerrar sesión?")) {
    localStorage.removeItem("token");
    window.location.href = "/html/login.html";
  }
}

// ── NOTIFICACION ──
function mostrarNotificacion(msg) {
  const n = document.getElementById("notificacion");
  n.textContent = msg;
  n.style.display = "block";
  setTimeout(() => n.style.display = "none", 3000);
}

// ── SIDEBAR MOBILE ──
function toggleSidebar() {
  document.getElementById("sidebar").classList.toggle("open");
}

// Cerrar sidebar al hacer click afuera en móvil
document.addEventListener("click", e => {
  const sidebar = document.getElementById("sidebar");
  if (window.innerWidth <= 768 && !sidebar.contains(e.target) && !e.target.closest(".menu-toggle")) {
    sidebar.classList.remove("open");
  }
});

// Cerrar modal con Escape
document.addEventListener("keydown", e => { if (e.key === "Escape") cerrarModal(); });

cargarLibros();