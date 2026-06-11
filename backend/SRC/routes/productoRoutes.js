const express = require("express");
const router = express.Router();
const path = require("path");
const multer = require("multer");

const productoController = require("../controllers/productoController.js");

// =========================================================================
// CONFIGURACIÓN DE MULTER UBICADA SEGÚN TU ÁRBOL DE CARPETAS REAL
// =========================================================================
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // '..' sale de 'routes' y entra directo a 'uploads/productos' dentro de SRC
        cb(null, path.join(__dirname, '../uploads/productos'));
    },
    filename: function (req, file, cb) {
        
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

console.log("Funciones", Object.keys(productoController)); 



router.get("/obtener-productos" , productoController.obtenerproductos);

router.get("/productos" , productoController.productos);


router.post("/agregarproductos" , upload.single('imagen'), productoController.agregarproductos);

router.post("/agregarproductos/:id" , upload.single('imagen'), productoController.agregarproductos_id );

router.put("/actualizar-producto/:id" , upload.single('imagen'), productoController.actualizarproducto_id);

router.delete("/eliminarproducto/:id" , productoController.eliminarproducto_id);

router.get("/producto/:slug", productoController.obtenerProductoPorSlug);

router.get("/productos-catalogo", productoController.obtenerProductosConSlug);

module.exports = router;