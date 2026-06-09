const express = require("express");
const router = express.Router();

const usuarioController = require("../controllers/usuarioController.js");
const upload = require("../config/multer.js");

router.post("/obtener-usuario",  usuarioController.obtenerusuario);

router.get("/obtener-usuarios",  usuarioController.obtenerusuarios);

router.post("/usuario-perfil",  usuarioController.usuarioperfil);

router.put("/actualizar-usuario", usuarioController.actualizarusuario);

router.post("/cambiar-rol", usuarioController.cambiarrol);

// SUBIR FOTO
router.post("/subir-foto", upload.single("foto"),  usuarioController.subirfoto
);

module.exports = router;