const express = require("express");
const router = express.Router();

const ventaController = require("../controllers/ventaController.js");

router.get("/mis-compras/:usuarioId" , ventaController.miscompras_usuarioId );

router.post("/guardar-compra" , ventaController.guardar_compra );

module.exports = router;