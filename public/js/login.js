async function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  if (!email || !password) {
    alert("Completa los campos");
    return;
  }

  try {
    const res = await fetch("/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.mensaje || "Login incorrecto");
      return;
    }

    if (data.token) {
      localStorage.setItem("token", data.token);

      alert("Bienvenido " + data.nombre);

      // 🔥 AJUSTADO A TU ESTRUCTURA NUEVA
      window.location.href = "/html/biblioteca.html";

    } else {
      alert("No se recibió token del servidor");
    }

  } catch (error) {
    console.log(error);
    alert("Error de servidor");
  }
}