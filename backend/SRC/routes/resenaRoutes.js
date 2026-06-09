const express = require("express");
const router = express.Router();

const resenaController = require("../controllers/resenaController.js");

router.post("/agregar-resena" , resenaController.agregar_resena);

router.get("/obtener-resenas/:productoId" , resenaController.obtener_resena_producto_id);

module.exports = router;

