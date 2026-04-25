const token = localStorage.getItem("token");

function volver() {
  window.location.href = "/html/biblioteca.html";
}

// Enter para buscar
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("buscarOnline").addEventListener("keydown", e => {
    if (e.key === "Enter") buscarLibrosOnline();
  });
});

// =====================
// BUSCAR LIBROS
// =====================
async function buscarLibrosOnline() {
  const texto = document.getElementById("buscarOnline").value;
  const cont = document.getElementById("resultados");

  if (!texto.trim()) {
    cont.innerHTML = `<div class="estado-busqueda"><span class="icon">💡</span>Escribe algo para buscar</div>`;
    return;
  }

  cont.innerHTML = `<div class="estado-busqueda"><span class="icon">⏳</span>Buscando libros...</div>`;

  try {
    const url = "https://openlibrary.org/search.json?q=" + encodeURIComponent(texto);
    const res = await fetch(url);
    if (!res.ok) throw new Error();
    const data = await res.json();
    mostrar(data.docs);
  } catch {
    cont.innerHTML = `<div class="estado-busqueda"><span class="icon">❌</span>Error al conectar con la API</div>`;
  }
}

// =====================
// MOSTRAR RESULTADOS
// =====================
const colores = ["#1e3a5f","#2d1b4e","#1a3d2b","#4a1a1a","#1a3a4a","#3d2b0a"];

function mostrar(libros) {
  const cont = document.getElementById("resultados");
  cont.innerHTML = "";

  if (!libros || libros.length === 0) {
    cont.innerHTML = `<div class="estado-busqueda"><span class="icon">📭</span>No se encontraron libros</div>`;
    return;
  }

  libros.slice(0, 12).forEach((libro, i) => {
    const titulo = libro.title || "Sin título";
    const autor = libro.author_name ? libro.author_name[0] : "Autor desconocido";
    const color = colores[i % colores.length];

    const div = document.createElement("div");
    div.className = "result-card";
    div.style.animationDelay = (i * 0.04) + "s";
    div.innerHTML = `
      <div class="result-cover" style="background: linear-gradient(135deg, ${color}, ${color}99);">
        📖
      </div>
      <div class="result-body">
        <div class="result-title">${titulo}</div>
        <div class="result-author">${autor}</div>
        <button class="btn-agregar" id="btn-${i}" onclick="guardarLibro('${titulo.replace(/'/g, "")}', '${autor.replace(/'/g, "")}', ${i})">
          + Agregar a biblioteca
        </button>
      </div>
    `;
    cont.appendChild(div);
  });
}

// =====================
// GUARDAR LIBRO
// =====================
async function guardarLibro(titulo, autor, idx) {
  const btn = document.getElementById("btn-" + idx);
  btn.textContent = "Guardando...";
  btn.disabled = true;

  try {
    const res = await fetch("/libros", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
      },
      body: JSON.stringify({ titulo, autor, estado: "Pendiente", calificacion: 0 })
    });

    if (!res.ok) throw new Error();

    btn.textContent = "✔ Guardado";
    btn.classList.add("guardado");

  } catch {
    btn.textContent = "+ Agregar a biblioteca";
    btn.disabled = false;
    alert("Error guardando libro");
  }
}