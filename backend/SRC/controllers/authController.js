const conexion = require("../config/database.js");

exports.login = (req, res) => {
    const { correo, contrasena } = req.body;

    const sql = `
        SELECT * FROM usuarios
        WHERE correo = ? AND contrasena = ?
    `;

    conexion.query(sql, [correo, contrasena], (error, resultado) => {
        if (error) return res.status(500).json({ success: false });

        if (resultado.length > 0) {
            return res.json({ success: true, usuario: resultado[0] });
        }

        return res.status(401).json({ success: false });
    });
};

exports.registro = (req, res) => {

    console.log("CONTROLADOR NUEVO EJECUTANDO");
    console.log(req.body);
    const {
        nombre,
        apellido,
        tipo_documento,
        numero_documento,
        correo,
        contrasena,
        numero_telefono,
        fecha_nacimiento,
        direccion
    } = req.body;

    if (!nombre || !apellido || !tipo_documento || !numero_documento || !correo || !contrasena) {
        return res.status(400).json({
            success: false,
            message: "Faltan datos obligatorios"
        });
    }

    // Verificar si el correo o documento ya existe
    const sqlVerificar = `
        SELECT id FROM usuarios 
        WHERE correo = ? OR numero_documento = ?
    `;

    conexion.query(sqlVerificar, [correo, numero_documento], (error, resultado) => {
        if (error) {
            return res.status(500).json({ success: false, message: "Error en el servidor" });
        }

        if (resultado.length > 0) {
            return res.status(409).json({
                success: false,
                message: "El correo o documento ya está registrado"
            });
        }

        const sqlInsertar = `
            INSERT INTO usuarios 
                (nombre, apellido, tipo_documento, numero_documento, correo, contrasena, numero_telefono, fecha_nacimiento, direccion)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const valores = [
            nombre,
            apellido,
            tipo_documento,
            numero_documento,
            correo,
            contrasena,
            numero_telefono || '',
            fecha_nacimiento || null,
            direccion || 'No ingreso Direccion'
        ];

        conexion.query(sqlInsertar, valores, (error, resultado) => {
            if (error) {
                console.log(error);
                return res.status(500).json({ success: false, message: "Error al registrar usuario" });
            }

            res.json({
                success: true,
                message: "Usuario registrado exitosamente",
                id: resultado.insertId
            });
        });
    });
};