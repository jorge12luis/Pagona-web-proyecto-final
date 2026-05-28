const router = require("express").Router();
const conexion = require("../db/conexion");

// UN USUARIO
router.post("/obtener-usuario", (req, res) => {

    const { correo } = req.body;

    const sql = `
        SELECT id, nombre, apellido, correo, rol
        FROM usuarios
        WHERE correo = ?
    `;

    conexion.query(sql, [correo], (error, resultado) => {

        if (error) return res.status(500).json({ success: false });

        if (resultado.length > 0) {
            return res.json({ success: true, usuario: resultado[0] });
        }

        res.status(404).json({ success: false });
    });
});


// TODOS LOS USUARIOS
router.get("/obtener-usuarios", (req, res) => {

    const sql = `
        SELECT id, nombre, apellido, correo, rol
        FROM usuarios
        ORDER BY nombre ASC
    `;

    conexion.query(sql, (error, resultado) => {

        if (error) return res.status(500).json({ success: false });

        res.json({ success: true, usuarios: resultado });
    });
});

module.exports = router;