const express = require("express");
const router = express.Router();
const productoController = require("../controllers/productoController.js");
const upload = require("../config/multerProductos.js");

router.get("/obtener-productos", productoController.obtenerproductos);
router.get("/productos", productoController.productos);
router.post("/agregarproductos", upload.single("imagen"), productoController.agregarproductos);
router.post("/agregarproductos/:id", upload.single("imagen"), productoController.agregarproductos_id);
router.put("/actualizar-producto/:id", upload.single("imagen"), productoController.actualizarproducto_id);
router.delete("/eliminarproducto/:id", productoController.eliminarproducto_id);
router.get("/producto/:slug", productoController.obtenerProductoPorSlug);
router.get("/productos-catalogo", productoController.obtenerProductosConSlug);
router.get("/producto/:slug/imagenes", productoController.obtenerImagenesProducto);
router.get("/imagenes-producto/:id", productoController.obtenerImagenesPorId);
router.post("/agregar-imagen-producto", upload.single("imagen"), productoController.agregarImagenProducto);
router.delete("/eliminar-imagen/:id", productoController.eliminarImagenProducto);

module.exports = router;