const express = require("express");
const router = express.Router();

const productoController = require("../controllers/productoController.js");

router.get("/obtener-productos" , productoController.obtenerproductos);

router.get("/productos" , productoController.productos);

router.post("/agregarproductos" , productoController.agregarproductos);

router.post("/agregarproductos/:id" , productoController.agregarproductos_id );

router.put("/actualizar-producto/:id" , productoController.actualizarproducto_id);

router.delete("/eliminarproducto/:id" , productoController.eliminarproducto_id);

router.get("/producto/:slug", productoController.obtenerProductoPorSlug);

router.get("/productos-catalogo", productoController.obtenerProductosConSlug);

module.exports = router;