const mongoose = require("mongoose");

const ResenaSchema = new mongoose.Schema({
  texto: {
    type: String,
    required: true
  },
  fecha: {
    type: Date,
    default: Date.now
  }
});

const LibroSchema = new mongoose.Schema({
  titulo: {
    type: String,
    required: true,
    trim: true
  },

  autor: {
    type: String,
    required: true,
    trim: true
  },

  estado: {
    type: String,
    default: "Pendiente"
  },

  calificacion: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },

  descripcion: {
    type: String,
    default: ""
  },

  resenas: [ResenaSchema],

  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Usuario",
    required: true
  }

}, {
  timestamps: true
});

module.exports = mongoose.model("Libro", LibroSchema);