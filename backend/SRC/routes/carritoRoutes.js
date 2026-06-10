const express = require("express");
const router = express.Router();

const carritoController = require("../controllers/carritoController.js");

router.get("/carrito/:usuarioId", carritoController.obtenerCarritoPorUsuario);
router.post("/carrito", carritoController.agregarAlCarrito);
router.delete("/carrito/:id", carritoController.eliminarDelCarrito);

module.exports = router;
