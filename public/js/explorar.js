const token = localStorage.getItem("token");

function volver() {
  window.location.href = "/html/biblioteca.html";
}

// =====================
// BUSCAR LIBROS API EXTERNA
// =====================
async function buscarLibrosOnline() {
  const texto = document.getElementById("buscarOnline").value;
  const cont = document.getElementById("resultados");

  if (!texto.trim()) {
    cont.innerHTML = "<p>Escribe algo para buscar</p>";
    return;
  }

  cont.innerHTML = "<p>Buscando libros...</p>";

  try {
    const url = "https://openlibrary.org/search.json?q=" + encodeURIComponent(texto);
    const res = await fetch(url);

    if (!res.ok) throw new Error("Error en la API");

    const data = await res.json();
    mostrar(data.docs);

  } catch (error) {
    console.log("ERROR:", error);
    cont.innerHTML = "<p>Error al conectar con la API</p>";
  }
}

// =====================
// MOSTRAR RESULTADOS
// =====================
function mostrar(libros) {
  const cont = document.getElementById("resultados");
  cont.innerHTML = "";

  if (!libros || libros.length === 0) {
    cont.innerHTML = "<p>No se encontraron libros</p>";
    return;
  }

  libros.slice(0, 12).forEach(libro => {
    const div = document.createElement("div");

    const titulo = libro.title || "Sin título";
    const autor = libro.author_name ? libro.author_name[0] : "Autor desconocido";

    div.innerHTML = `
      <h3>${titulo}</h3>
      <p>${autor}</p>
      <button class="btn-agregar" onclick="guardarLibro('${titulo.replace(/'/g, "")}', '${autor.replace(/'/g, "")}')">
        Guardar en mi biblioteca
      </button>
    `;

    cont.appendChild(div);
  });
}

// =====================
// GUARDAR LIBRO EN TU DB
// =====================
async function guardarLibro(titulo, autor) {
  try {
    const res = await fetch("/libros", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
      },
      body: JSON.stringify({
        titulo,
        autor,
        estado: "Pendiente",
        calificacion: 0
      })
    });

    if (!res.ok) throw new Error("Error guardando libro");

    alert("Libro guardado ✔");

  } catch (error) {
    console.log(error);
    alert("Error guardando libro");
  }
}