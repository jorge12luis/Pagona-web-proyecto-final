const conexion = require("../config/database.js");
const upload = require("../config/multer.js");

exports.obtenerusuario = (req, res) => {
    const { correo } = req.body;

    if (!correo) {
        return res.status(400).json({
            success: false,
            message: "Correo requerido"
        });
    }

    const sql = `
        SELECT id, nombre, apellido, correo, rol
        FROM usuarios
        WHERE correo = ?
    `;

    conexion.query(sql, [correo], (error, resultado) => {
        if (error) {
            console.log(error);

            return res.status(500).json({
                success: false,
                message: "Error obteniendo usuario"
            });
        }

        if (resultado.length > 0) {
            return res.json({
                success: true,
                usuario: resultado[0]
            });
        }

        return res.status(404).json({
            success: false,
            message: "Usuario no encontrado"
        });
    });
};

exports.obtenerusuarios = (req, res) => {
    const sql = `
        SELECT id, nombre, apellido, correo, rol
        FROM usuarios
        ORDER BY nombre ASC
    `;

    conexion.query(sql, (error, resultado) => {
        if (error) {
            console.log(error);

            return res.status(500).json({
                success: false,
                message: "Error obteniendo usuarios"
            });
        }

        res.json({
            success: true,
            usuarios: resultado
        });
    });
};

exports.usuarioperfil = (req, res) => {

    console.log("ðŸ”¥ PETICIÃ“N RECIBIDA /usuario-perfil");

    const { correo } = req.body;

    if (!correo) {
        return res.status(400).json({
            success: false,
            message: "Correo requerido"
        });
    }
    const sql = `
        SELECT nombre, apellido, correo, numero_telefono, fecha_nacimiento, contrasena, imagen
        FROM usuarios
        WHERE correo = ?
    `;

    conexion.query(sql, [correo], (error, resultado) => {

        console.log("Error:", error);
        console.log("Resultado:", resultado);

        if (error) {
            return res.status(500).json({
                success: false,
                message: "Error en la consulta"
            });
        }

        if (resultado.length > 0) {

            console.log("Usuario encontrado:", resultado[0]);

            return res.json({
                success: true,
                usuario: resultado[0]
            });
        }

        return res.status(404).json({
            success: false,
            message: "Usuario no encontrado"
        });
    })
    
};

exports.actualizarusuario = (req, res) => {

    const {
        correo_original,
        nombre,
        apellido,
        correo,
        celular,
        fecha_nacimiento,
        clave
    } = req.body;

    const sql = `
        UPDATE usuarios
        SET
            nombre = ?,
            apellido = ?,
            correo = ?,
            numero_telefono = ?,
            fecha_nacimiento = ?,
            contrasena = ?
        WHERE correo = ?
    `;
    console.log(req.body);

    conexion.query(
        sql,
        [
            nombre,
            apellido,
            correo,
            celular,
            fecha_nacimiento,
            clave,
            correo_original
        ],
        (error, resultado) => {

            if (error) {

                console.log(error);

                return res.status(500).json({
                    success: false,
                    message: "Error al actualizar usuario"
                });

            }

            return res.json({
                success: true,
                message: "Usuario actualizado correctamente"
            });

        }
    );

};

exports.cambiarrol = (req, res) => {
    const { correo, nuevoRol } = req.body;

    if (
        !correo ||
        !nuevoRol ||
        !["usuario", "admin"].includes(nuevoRol)
    ) {
        return res.status(400).json({
            success: false,
            message: "Datos invÃ¡lidos"
        });
    }

    const sql = `
        UPDATE usuarios
        SET rol = ?
        WHERE correo = ?
    `;

    conexion.query(
        sql,
        [nuevoRol, correo],
        (error) => {
            if (error) {
                console.log(error);

                return res.status(500).json({
                    success: false,
                    message: "Error actualizando rol"
                });
            }

            res.json({
                success: true,
                message: `Rol actualizado a ${nuevoRol}`
            });
        }
    );
};

exports.subirfoto = (req, res) => {

    const { correo } = req.body;

    const nombreArchivo = req.file.filename;

    const sql = `
        UPDATE usuarios
        SET imagenes = ?
        WHERE correo = ?
    `;

    conexion.query(
        sql,
        [nombreArchivo, correo],
        (error) => {

            if (error) {

                console.log(error);

                return res.json({
                    success: false
                });

            }

            res.json({
                success: true,
                foto: nombreArchivo
            });

        }
    );

};