const express = require("express");
const router = express.Router();
const Libro = require("../models/Libro");
const jwt = require("jsonwebtoken");

const SECRET = process.env.JWT_SECRET || "secret123";

function authMiddleware(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ mensaje: "Token requerido" });
  try {
    const decoded = jwt.verify(token, SECRET);
    req.usuarioId = decoded.id;
    next();
  } catch {
    return res.status(401).json({ mensaje: "Token inválido" });
  }
}

router.get("/", authMiddleware, async (req, res) => {
  try {
    const libros = await Libro.find({ usuario: req.usuarioId });
    res.json(libros);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener libros" });
  }
});

router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const libro = await Libro.findOne({ _id: req.params.id, usuario: req.usuarioId });
    if (!libro) return res.status(404).json({ mensaje: "Libro no encontrado" });
    res.json(libro);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener libro" });
  }
});

router.post("/", authMiddleware, async (req, res) => {
  try {
    const libro = new Libro({ ...req.body, usuario: req.usuarioId });
    await libro.save();
    res.status(201).json(libro);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al crear libro" });
  }
});

router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const libro = await Libro.findOneAndUpdate(
      { _id: req.params.id, usuario: req.usuarioId },
      req.body,
      { new: true }
    );
    if (!libro) return res.status(404).json({ mensaje: "Libro no encontrado" });
    res.json(libro);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al actualizar libro" });
  }
});

router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const libro = await Libro.findOneAndDelete({ _id: req.params.id, usuario: req.usuarioId });
    if (!libro) return res.status(404).json({ mensaje: "Libro no encontrado" });
    res.json({ mensaje: "Libro eliminado" });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al eliminar libro" });
  }
});

router.post("/:id/resenas", authMiddleware, async (req, res) => {
  try {
    const { texto } = req.body;
    if (!texto) return res.status(400).json({ mensaje: "La reseña no puede estar vacía" });
    const libro = await Libro.findOne({ _id: req.params.id, usuario: req.usuarioId });
    if (!libro) return res.status(404).json({ mensaje: "Libro no encontrado" });
    libro.resenas.push({ texto });
    await libro.save();
    res.json(libro);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al agregar reseña" });
  }
});

// =====================
// ELIMINAR RESEÑA
// =====================
router.delete("/:id/resenas/:resenaId", authMiddleware, async (req, res) => {
  try {
    const libro = await Libro.findOne({ _id: req.params.id, usuario: req.usuarioId });
    if (!libro) return res.status(404).json({ mensaje: "Libro no encontrado" });

    libro.resenas = libro.resenas.filter(r => r._id.toString() !== req.params.resenaId);
    await libro.save();

    res.json(libro);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al eliminar reseña" });
  }
});

module.exports = router;