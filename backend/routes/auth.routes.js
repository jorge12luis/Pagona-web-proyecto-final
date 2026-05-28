const router = require("express").Router();
const conexion = require("../db/conexion");

// LOGIN
router.post("/login", (req, res) => {

    const { correo, contrasena } = req.body;

    const sql = `
        SELECT * FROM usuarios
        WHERE correo = ? AND contrasena = ?
    `;

    conexion.query(sql, [correo, contrasena], (error, resultado) => {

        if (error) return res.status(500).json({ success: false });

        if (resultado.length > 0) {
            return res.json({
                success: true,
                usuario: resultado[0]
            });
        }

        res.json({ success: false });
    });
});


// REGISTRO
router.post("/registro", (req, res) => {

    const {
        nombre,
        apellido,
        correo,
        contrasena,
        telefono,
        fechaNacimiento
    } = req.body;

    if (!correo.toLowerCase().endsWith("@gmail.com")) {
        return res.status(400).send("El correo debe ser @gmail.com");
    }

    const sql = `
        INSERT INTO usuarios
        (nombre, apellido, correo, contrasena, numero_telefono, fecha_nacimiento, rol)
        VALUES (?, ?, ?, ?, ?, ?, 'usuario')
    `;

    conexion.query(sql, [
        nombre,
        apellido,
        correo,
        contrasena,
        telefono,
        fechaNacimiento
    ], (error) => {

        if (error) return res.status(500).send("Error registrando usuario");

        res.send("Usuario registrado");
    });
});

module.exports = router;