require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// ======================
// MIDDLEWARE
// ======================
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// ======================
// CONEXIÓN MONGODB
// ======================
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB conectado ✔"))
  .catch(err => console.log("Error MongoDB:", err));

// ======================
// RUTAS API
// ======================
app.use("/libros", require("./routes/libros"));
app.use("/auth", require("./routes/auth"));

// ======================
// RUTAS FRONTEND (ESTO QUE PREGUNTAS)
// ======================
app.get("/biblioteca.html", (req, res) => {
  res.sendFile(__dirname + "/public/html/biblioteca.html");
});

// ======================
// RUTA BASE
// ======================
app.get("/", (req, res) => {
  res.redirect("/html/login.html");
});

// ======================
// SERVIDOR
// ======================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});