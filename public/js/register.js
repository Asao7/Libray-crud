async function register() {
  const nombre = document.getElementById("nombre").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  if (!nombre || !email || !password) {
    alert("Completa todos los campos");
    return;
  }

  try {
    const res = await fetch("/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        nombre,
        email,
        password
      })
    });

    const data = await res.json();

    console.log("REGISTER:", data);

    if (!res.ok) {
      alert(data.mensaje || "Error en registro");
      return;
    }

    alert("Usuario creado ✔ ahora inicia sesión");

    //
    window.location.href = "/html/login.html";

  } catch (error) {
    console.log(error);
    alert("Error de servidor");
  }
}