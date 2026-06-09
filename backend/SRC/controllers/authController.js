const conexion = require("../config/database.js");

exports.login = (req, res) => {
    const { correo, contrasena } = req.body;

    const sql = `
        SELECT *
        FROM usuarios
        WHERE correo = ?
        AND contrasena = ?
    `;

    conexion.query(
        sql,
        [correo, contrasena],
        (error, resultado) => {
            if (error) {
                return res.status(500).json({
                    success: false
                });
            }

            if (resultado.length > 0) {
                return res.json({
                    success: true,
                    usuario: resultado[0]
                });
            }

            return res.status(401).json({
                success: false
            });
        }
    );
};