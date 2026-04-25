const express = require("express");
const router = express.Router();
const Libro = require("../models/Libro");

// ======================
// GET TODOS LOS LIBROS
// ======================
router.get("/", async (req, res) => {
  try {
    const libros = await Libro.find();
    res.json(libros);
  } catch (error) {
    console.log(error);
    res.status(500).json({ mensaje: "Error al obtener libros" });
  }
});

// ======================
// GET LIBRO POR ID
// ======================
router.get("/:id", async (req, res) => {
  try {
    const libro = await Libro.findById(req.params.id);

    if (!libro) {
      return res.status(404).json({ mensaje: "Libro no encontrado" });
    }

    res.json(libro);
  } catch (error) {
    console.log(error);
    res.status(500).json({ mensaje: "Error al obtener libro" });
  }
});

// ======================
// CREAR LIBRO
// ======================
router.post("/", async (req, res) => {
  try {
    const libro = new Libro(req.body);
    await libro.save();

    res.status(201).json(libro);
  } catch (error) {
    console.log(error);
    res.status(500).json({ mensaje: "Error al crear libro" });
  }
});

// ======================
// ACTUALIZAR LIBRO
// ======================
router.put("/:id", async (req, res) => {
  try {
    const libro = await Libro.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!libro) {
      return res.status(404).json({ mensaje: "Libro no encontrado" });
    }

    res.json(libro);
  } catch (error) {
    console.log(error);
    res.status(500).json({ mensaje: "Error al actualizar libro" });
  }
});

// ======================
// ELIMINAR LIBRO
// ======================
router.delete("/:id", async (req, res) => {
  try {
    const libro = await Libro.findByIdAndDelete(req.params.id);

    if (!libro) {
      return res.status(404).json({ mensaje: "Libro no encontrado" });
    }

    res.json({ mensaje: "Libro eliminado" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ mensaje: "Error al eliminar libro" });
  }
});

// ======================
// AGREGAR RESEÑA
// ======================
router.post("/:id/resenas", async (req, res) => {
  try {
    const { texto } = req.body;

    if (!texto) {
      return res.status(400).json({ mensaje: "La reseña no puede estar vacía" });
    }

    const libro = await Libro.findById(req.params.id);

    if (!libro) {
      return res.status(404).json({ mensaje: "Libro no encontrado" });
    }

    libro.resenas.push({ texto });

    await libro.save();

    res.json(libro);

  } catch (error) {
    console.log(error);
    res.status(500).json({ mensaje: "Error al agregar reseña" });
  }
});

module.exports = router;