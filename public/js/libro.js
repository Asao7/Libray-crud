const params = new URLSearchParams(window.location.search);
const id = params.get("id");
const token = localStorage.getItem("token");

if (!token) window.location.href = "/html/login.html";

const authHeaders = {
  "Content-Type": "application/json",
  "Authorization": "Bearer " + token
};

let libroActual = null;

async function cargarLibro() {
  const res = await fetch("/libros/" + id, {
    headers: { "Authorization": "Bearer " + token }
  });

  

  if (!res.ok) { alert("Error cargando libro"); return; }

  libroActual = await res.json();

  document.getElementById("tituloLibro").innerText = libroActual.titulo;
  document.getElementById("autorLibro").innerText = libroActual.autor;

  // Descripcion
  const desc = document.getElementById("descripcionLibro");
  desc.innerText = libroActual.descripcion || "";
  desc.style.display = libroActual.descripcion ? "block" : "none";

  // Estado badge
  const badge = document.getElementById("estadoLibro");
  badge.innerText = libroActual.estado;
  badge.className = "estado-badge estado-" + libroActual.estado;

  // Hero color por estado
  const colores = { "Leído": "#1a3d2b, #0f2d1a", "Pendiente": "#2d1b0a, #1a1200", "En proceso": "#0a1a3d, #0a1530" };
  document.getElementById("bookHero").style.background =
    "linear-gradient(135deg, " + (colores[libroActual.estado] || "#1e2a1a, #2d1b4e") + ")";

  // Estrellas
  const starsEl = document.getElementById("starsLibro");
  starsEl.innerHTML = Array.from({length: 5}, (_, i) =>
    `<span style="color:${i < libroActual.calificacion ? '#c8a96e' : '#2a2a3a'}">★</span>`
  ).join("");

  renderResenas();
}

function renderResenas() {
  const cont = document.getElementById("listaReseñas");
  cont.innerHTML = "";

  if (!libroActual.resenas || libroActual.resenas.length === 0) {
    cont.innerHTML = "<p>No hay reseñas todavía</p>";
    return;
  }

  libroActual.resenas.forEach(r => {
    const div = document.createElement("div");
    div.innerHTML = `💬 ${r.texto}`;
    cont.appendChild(div);
  });
}

async function agregarResena() {
  const texto = document.getElementById("reseñaInput").value;
  if (!texto.trim()) { alert("Escribe una reseña"); return; }

  try {
    const res = await fetch("/libros/" + id + "/resenas", {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({ texto })
    });

    if (!res.ok) throw new Error();

    libroActual = await res.json();
    renderResenas();
    document.getElementById("reseñaInput").value = "";
  } catch {
    alert("Error agregando reseña");
  }
}

function volver() {
  window.location.href = "/html/biblioteca.html";
}

cargarLibro();