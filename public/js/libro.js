const params = new URLSearchParams(window.location.search);
const id = params.get("id");

let libroActual = null;

// ======================
// CARGAR LIBRO
// ======================
async function cargarLibro() {
  const res = await fetch("/libros/" + id);

  if (!res.ok) {
    alert("Error cargando libro");
    return;
  }

  libroActual = await res.json();

  document.getElementById("tituloLibro").innerText = libroActual.titulo;
  document.getElementById("autorLibro").innerText = "Autor: " + libroActual.autor;
  document.getElementById("calificacionLibro").innerText = "⭐ " + libroActual.calificacion;
  document.getElementById("descripcionLibro").innerText =
    libroActual.descripcion || "Sin descripción";

  renderResenas();
}

// ======================
// MOSTRAR RESEÑAS
// ======================
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

// ======================
// AGREGAR RESEÑA
// ======================
async function agregarResena() {
  const texto = document.getElementById("reseñaInput").value;

  if (!texto.trim()) {
    alert("Escribe una reseña");
    return;
  }

  try {
    const res = await fetch("/libros/" + id + "/resenas", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ texto })
    });

    if (!res.ok) {
      throw new Error("Error agregando reseña");
    }

    const data = await res.json();

    libroActual = data;

    renderResenas();

    document.getElementById("reseñaInput").value = "";

  } catch (error) {
    console.log(error);
    alert("Error agregando reseña");
  }
}

// ======================
// VOLVER
// ======================
function volver() {
  window.location.href = "/html/biblioteca.html";
}

// INICIAR
cargarLibro();