const express = require("express");
const router = express.Router();

const productoController = require("../controllers/productoController.js");

router.get("/obtener-productos" , productoController.obtenerproductos);

router.get("/productos" , productoController.productos);

router.post("/agregarproductos/:id" , productoController.agregarproductos_id );

router.delete("/eliminarproducto/:id" , productoController.eliminarproducto);

module.exports = router;