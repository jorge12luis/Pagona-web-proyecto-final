const router = require("express").Router();
const conexion = require("../db/conexion");

// CAMBIAR ROL
router.post("/cambiar-rol", (req, res) => {

    const { correo, nuevoRol } = req.body;

    const sql = `
        UPDATE usuarios
        SET rol = ?
        WHERE correo = ?
    `;

    conexion.query(sql, [nuevoRol, correo], (error) => {

        if (error) return res.status(500).json({ success: false });

        res.json({ success: true });
    });
});

module.exports = router;