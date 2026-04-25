const express = require("express");
const router = express.Router();

const Usuario = require("../models/Usuario");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const SECRET = process.env.JWT_SECRET || "secret123";

// ======================
// REGISTRO
// ======================
router.post("/register", async (req, res) => {
  const { nombre, email, password } = req.body;

  try {
    if (!nombre || !email || !password) {
      return res.status(400).json({ mensaje: "Completa todos los campos" });
    }

    const existe = await Usuario.findOne({ email });

    if (existe) {
      return res.status(400).json({ mensaje: "Este usuario ya existe" });
    }

    const hash = await bcrypt.hash(password, 10);

    const nuevoUsuario = new Usuario({
      nombre,
      email,
      password: hash
    });

    await nuevoUsuario.save();

    res.status(201).json({ mensaje: "Usuario creado correctamente ✔" });

  } catch (error) {
    console.log(error);
    res.status(500).json({ mensaje: "Error del servidor" });
  }
});


// ======================
// LOGIN
// ======================
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ mensaje: "Completa todos los campos" });
    }

    const user = await Usuario.findOne({ email });

    if (!user) {
      return res.status(400).json({ mensaje: "Usuario no existe" });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(400).json({ mensaje: "Contraseña incorrecta" });
    }

    const token = jwt.sign(
      {
        id: user._id,
        nombre: user.nombre
      },
      SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      nombre: user.nombre
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ mensaje: "Error del servidor" });
  }
});

module.exports = router;