const router = require("express").Router();
const conexion = require("../db/conexion");
const nodemailer = require("nodemailer");

// ===============================
// CREAR TABLA (se ejecuta al iniciar)
// ===============================
const createRecoveryTable = `
CREATE TABLE IF NOT EXISTS recuperacion_codes (
    correo VARCHAR(255) PRIMARY KEY,
    codigo VARCHAR(10),
    expiracion DATETIME
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
`;

conexion.query(createRecoveryTable, (error) => {
    if (error) {
        console.log("Error creando tabla recuperación:", error);
    }
});


// ===============================
// SMTP CONFIG
// ===============================
const smtpUser = process.env.SMTP_USER || "";
const smtpPass = process.env.SMTP_PASS || "";

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587,
    secure: false,
    auth: smtpUser && smtpPass ? { user: smtpUser, pass: smtpPass } : undefined
});


// ===============================
// HELPERS
// ===============================
function formatDateTime(date) {
    return date.toISOString().slice(0, 19).replace("T", " ");
}

function enviarCodigoEmail(correo, codigo) {

    if (!smtpUser || !smtpPass) {
        console.log(`Código recuperación para ${correo}: ${codigo}`);
        return Promise.resolve();
    }

    const mailOptions = {
        from: smtpUser,
        to: correo,
        subject: "Código de recuperación",
        text: `Tu código es: ${codigo}`
    };

    return transporter.sendMail(mailOptions);
}

function enviarCodigoSms(telefono, codigo) {
    console.log(`SMS a ${telefono}: Código ${codigo}`);
}


// ===============================
// 1. ENVIAR CÓDIGO
// ===============================
router.post("/recuperar/codigo", (req, res) => {

    const { correo } = req.body;

    if (!correo) {
        return res.status(400).json({
            success: false,
            message: "Correo requerido"
        });
    }

    const sqlBuscar = `
        SELECT * FROM usuarios WHERE correo = ?
    `;

    conexion.query(sqlBuscar, [correo], (error, resultado) => {

        if (error) {
            return res.status(500).json({ success: false });
        }

        if (resultado.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Correo no existe"
            });
        }

        const usuario = resultado[0];

        const codigo = Math.floor(100000 + Math.random() * 900000).toString();
        const expiracion = formatDateTime(new Date(Date.now() + 15 * 60 * 1000));

        const sqlInsert = `
            INSERT INTO recuperacion_codes(correo, codigo, expiracion)
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE codigo = ?, expiracion = ?
        `;

        conexion.query(sqlInsert,
            [correo, codigo, expiracion, codigo, expiracion],
            (error) => {

                if (error) {
                    return res.status(500).json({ success: false });
                }

                enviarCodigoEmail(correo, codigo).catch(err => {
                    console.log("Error email:", err);
                });

                let mensaje = `Código enviado a ${correo}`;

                if (usuario.telefono) {
                    enviarCodigoSms(usuario.telefono, codigo);
                    mensaje += " y SMS enviado";
                }

                res.json({
                    success: true,
                    message: mensaje
                });
            }
        );
    });
});


// ===============================
// 2. CAMBIAR CONTRASEÑA
// ===============================
router.post("/recuperar/cambiar", (req, res) => {

    const {
        correo,
        codigo,
        nuevaContrasena,
        confirmarContrasena
    } = req.body;

    if (!correo || !codigo || !nuevaContrasena || !confirmarContrasena) {
        return res.status(400).json({
            success: false,
            message: "Faltan datos"
        });
    }

    if (nuevaContrasena !== confirmarContrasena) {
        return res.status(400).json({
            success: false,
            message: "No coinciden las contraseñas"
        });
    }

    const sqlCodigo = `
        SELECT * FROM recuperacion_codes WHERE correo = ?
    `;

    conexion.query(sqlCodigo, [correo], (error, resultado) => {

        if (error) {
            return res.status(500).json({ success: false });
        }

        if (resultado.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No hay código activo"
            });
        }

        const registro = resultado[0];
        const expiracion = new Date(registro.expiracion);

        if (Date.now() > expiracion.getTime()) {
            return res.status(400).json({
                success: false,
                message: "Código expirado"
            });
        }

        if (registro.codigo !== codigo) {
            return res.status(400).json({
                success: false,
                message: "Código incorrecto"
            });
        }

        const sqlUpdate = `
            UPDATE usuarios SET contrasena = ? WHERE correo = ?
        `;

        conexion.query(sqlUpdate, [nuevaContrasena, correo], (error) => {

            if (error) {
                return res.status(500).json({ success: false });
            }

            const sqlDelete = `
                DELETE FROM recuperacion_codes WHERE correo = ?
            `;

            conexion.query(sqlDelete, [correo]);

            res.json({
                success: true,
                message: "Contraseña actualizada"
            });
        });
    });
});


// ===============================
module.exports = router;