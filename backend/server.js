const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const nodemailer = require("nodemailer");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..')));

const conexion = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "tienda_bolso"
});

conexion.connect((error) => {
    if (error) {
        console.log(error);
    } else {
        console.log("MySQL conectado");
    }
});

const createRecoveryTable = `
CREATE TABLE IF NOT EXISTS recuperacion_codes (
    correo VARCHAR(255) PRIMARY KEY,
    codigo VARCHAR(10),
    expiracion DATETIME
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
`;

conexion.query(createRecoveryTable, (error) => {
    if (error) {
        console.log("Error creando tabla de recuperación:", error);
    }
});

// Agregar columna 'rol' a la tabla usuarios si no existe


const smtpUser = process.env.SMTP_USER || "";
const smtpPass = process.env.SMTP_PASS || "";

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587,
    secure: false,
    auth: smtpUser && smtpPass ? { user: smtpUser, pass: smtpPass } : undefined
});

if (!smtpUser || !smtpPass) {
    console.log("Advertencia: SMTP_USER y SMTP_PASS no están configurados. El código se registrará en consola.");
}

function formatDateTime(date) {
    return date.toISOString().slice(0, 19).replace("T", " ");
}

function enviarCodigoEmail(correo, codigo) {
    if (!smtpUser || !smtpPass) {
        console.log(`Código de recuperación para ${correo}: ${codigo}`);
        return Promise.resolve();
    }

    const mailOptions = {
        from: smtpUser,
        to: correo,
        subject: "Código de recuperación",
        text: `Tu código de recuperación es: ${codigo}. Usa este código para restaurar tu contraseña.`
    };

    return transporter.sendMail(mailOptions);
}

function enviarCodigoSms(telefono, codigo) {
    console.log(`SMS simulado para ${telefono}: Tu código de recuperación es ${codigo}`);
}

app.post("/recuperar/codigo", (req, res) => {
    const { correo } = req.body;

    if (!correo) {
        return res.status(400).json({ success: false, message: "Debes enviar un correo válido." });
    }

    const sqlBuscar = `
        SELECT * FROM usuarios
        WHERE correo = ?
    `;

    conexion.query(sqlBuscar, [correo], (error, resultado) => {
        if (error) {
            console.log(error);
            return res.status(500).json({ success: false, message: "Error interno del servidor." });
        }

        if (resultado.length === 0) {
            return res.status(404).json({ success: false, message: "Ese correo no existe." });
        }

        const usuario = resultado[0];
        const codigo = Math.floor(100000 + Math.random() * 900000).toString();
        const expiracion = formatDateTime(new Date(Date.now() + 15 * 60 * 1000));

        const sqlInsert = `
            INSERT INTO recuperacion_codes(correo, codigo, expiracion)
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE codigo = ?, expiracion = ?
        `;

        conexion.query(sqlInsert, [correo, codigo, expiracion, codigo, expiracion], (error) => {
            if (error) {
                console.log(error);
                return res.status(500).json({ success: false, message: "No se pudo guardar el código." });
            }

            enviarCodigoEmail(correo, codigo).catch((error) => {
                console.log("Error enviando correo:", error);
            });

            let mensaje = `Se envió el código al correo ${correo}.`;
            if (usuario.telefono) {
                enviarCodigoSms(usuario.telefono, codigo);
                mensaje += ` También se envió al número ${usuario.telefono}.`;
            }

            return res.json({ success: true, message: mensaje });
        });
    });
});

app.post("/recuperar/cambiar", (req, res) => {
    const { correo, codigo, nuevaContrasena, confirmarContrasena } = req.body;

    if (!correo || !codigo || !nuevaContrasena || !confirmarContrasena) {
        return res.status(400).json({ success: false, message: "Faltan datos para cambiar la contraseña." });
    }

    if (nuevaContrasena !== confirmarContrasena) {
        return res.status(400).json({ success: false, message: "Las contraseñas no coinciden." });
    }

    const sqlCodigo = `
        SELECT * FROM recuperacion_codes
        WHERE correo = ?
    `;

    conexion.query(sqlCodigo, [correo], (error, resultado) => {
        if (error) {
            console.log(error);
            return res.status(500).json({ success: false, message: "Error interno del servidor." });
        }

        if (resultado.length === 0) {
            return res.status(400).json({ success: false, message: "No hay un código activo para ese correo." });
        }

        const registro = resultado[0];
        const expiracion = new Date(registro.expiracion);

        if (Date.now() > expiracion.getTime()) {
            return res.status(400).json({ success: false, message: "El código ha expirado. Solicita uno nuevo." });
        }

        if (registro.codigo !== codigo) {
            return res.status(400).json({ success: false, message: "Código incorrecto." });
        }

        const sqlActualizar = `
            UPDATE usuarios
            SET contrasena = ?
            WHERE correo = ?
        `;

        conexion.query(sqlActualizar, [nuevaContrasena, correo], (error) => {
            if (error) {
                console.log(error);
                return res.status(500).json({ success: false, message: "Error actualizando la contraseña." });
            }

            const sqlEliminarCodigo = `
                DELETE FROM recuperacion_codes
                WHERE correo = ?
            `;

            conexion.query(sqlEliminarCodigo, [correo], (error) => {
                if (error) {
                    console.log("Error eliminando código de recuperación:", error);
                }
            });

            return res.json({ success: true, message: "Contraseña actualizada correctamente." });
        });
    });
});

app.post("/login", (req, res) => {

    const { correo, contrasena } = req.body;

    const sql = `
        SELECT * FROM usuarios
        WHERE correo = ? AND contrasena = ?
    `;

    conexion.query(sql, [correo, contrasena], (error, resultado) => {

        if(error){

            console.log(error);

            return res.status(500).json({
                success: false,
                message: "Error interno del servidor"
            });

        }

        if(resultado.length > 0){

            return res.json({
                success: true,
                message: "Login correcto",
                usuario: resultado[0]
            });

        } else {

            return res.status(401).json({
                success: false,
                message: "Correo o contraseña incorrectos"
            });

        }

    });

});

app.post("/registro", (req, res) => {

    const {
        nombre,
        apellido,
        correo,
        contrasena,
        telefono,
        fechaNacimiento
    } = req.body;

    if (!correo || !correo.toLowerCase().endsWith("@gmail.com")) {
        return res.status(400).send("El correo debe terminar en @gmail.com");
    }

    const sql = `

        INSERT INTO usuarios
        (
            nombre,
            apellido,
            correo,
            contrasena,
            numero_telefono,
            fecha_nacimiento,
            rol
        )

        VALUES (?, ?, ?, ?, ?, ?, 'usuario')

    `;

    conexion.query(

        sql,

        [
            nombre,
            apellido,
            correo,
            contrasena,
            telefono,
            fechaNacimiento
        ],

        (error) => {

            if(error){

                console.log(error);

                res.status(500).send("Error registrando usuario");

            }else{

                res.send("Usuario registrado");

            }

        }

    );

});
app.post("/comprar", (req, res) => {

    const { idProducto, cantidad } = req.body;

    const sqlBuscar = `
        SELECT stock
        FROM productos
        WHERE id = ?
    `;

    conexion.query(sqlBuscar, [idProducto], (error, resultado) => {

        if(error){
            return res.send("Error");
        }

        const stockActual = resultado[0].stock;

        if(stockActual < cantidad){

            return res.send("No hay suficiente stock");
        }

        const nuevoStock = stockActual - cantidad;

        const sqlActualizar = `
            UPDATE productos
            SET stock = ?
            WHERE id = ?
        `;

        conexion.query(
            sqlActualizar,
            [nuevoStock, idProducto],
            (error) => {

                if(error){
                    return res.send("Error actualizando stock");
                }

                res.send("Compra realizada");
            }
        );

    });

});
// =======================
// DASHBOARD ADMIN
// =======================

// TOTAL USUARIOS
app.get("/admin/total-usuarios", (req, res) => {

    const sql = "SELECT COUNT(*) AS total FROM usuarios";

    conexion.query(sql, (error, resultado) => {

        if(error){

            console.log(error);

            return res.status(500).json({
                success: false
            });

        }

        res.json({
            success: true,
            total: resultado[0].total
        });

    });

});


// TOTAL PRODUCTOS
app.get("/admin/total-productos", (req, res) => {

    const sql = "SELECT COUNT(*) AS total FROM productos";

    conexion.query(sql, (error, resultado) => {

        if(error){

            console.log(error);

            return res.status(500).json({
                success: false
            });

        }

        res.json({
            success: true,
            total: resultado[0].total
        });

    });

});


// TOTAL VENTAS
app.get("/admin/total-ventas", (req, res) => {

    const sql = "SELECT COUNT(*) AS total FROM ventas";

    conexion.query(sql, (error, resultado) => {

        if(error){

            console.log(error);

            return res.status(500).json({
                success: false
            });

        }

        res.json({
            success: true,
            total: resultado[0].total
        });

    });

});


// GANANCIAS
app.get("/admin/ganancias", (req, res) => {

    const sql = "SELECT SUM(total) AS ganancias FROM ventas";

    conexion.query(sql, (error, resultado) => {

        if(error){

            console.log(error);

            return res.status(500).json({
                success: false
            });

        }

        res.json({
            success: true,
            ganancias: resultado[0].ganancias || 0
        });

    });

});

app.listen(3000, () => {
    console.log("Servidor corriendo");
});