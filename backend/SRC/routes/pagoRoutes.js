const express = require('express');
const router = express.Router();
const pagoController = require('../controllers/PagoController');

// =========================================================================
// MIDDLEWARES DE INTERCEPTACIÓN (SOLUCIÓN AL REQ.BODY UNDEFINED)
// =========================================================================
// Forzamos a este enrutador específico a parsear el cuerpo JSON de la petición
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

// =========================================================================
// DEFINICIÓN DE ENDPOINTS
// =========================================================================
router.get('/obtener-metodos', pagoController.obtenerMetodos);
router.post('/guardar-metodo', pagoController.guardarMetodo);
router.delete('/eliminar-metodo/:id', pagoController.eliminarMetodo);

module.exports = router;