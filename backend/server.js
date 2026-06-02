const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const nodemailer = require("nodemailer");
const path = require("path");
const axios = require("axios");
const multer = require("multer");


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

const alterTableRol = `
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS rol ENUM('usuario', 'admin') DEFAULT 'usuario';
`;

conexion.query(alterTableRol, (error) => {
    if (error) {
        console.log("Nota: Columna rol ya existe o error al crearla:", error.message);
    } else {
        console.log("Columna rol verificada/creada en tabla usuarios");
    }
});
//////////////////////////////////////////
const storage = multer.diskStorage({

    destination: (req, file, cb) => {

        cb(null, "uploads/perfiles");

    },

    filename: (req, file, cb) => {

        const nombreArchivo =
        Date.now() + "-" + file.originalname;

        cb(null, nombreArchivo);

    }

});

const upload = multer({ storage });
//////////////////////////////////////////
app.use(
    "/uploads",
    express.static("uploads")
);
///////////////////////////////////////// permite acceder a la imagenes 
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
        if (error) {
            console.log(error);
            return res.status(500).json({ success: false, message: "Error interno del servidor." });
        }

        if (resultado.length > 0) {
            return res.json({ success: true, message: "Login correcto", usuario: resultado[0] });
            
        } else{
              res.json({
                    success: false
                });
        }

        return res.status(401).json({ success: false, message: "Correo o contraseña incorrectos." });
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

// Endpoint para cambiar rol de usuario a admin (requiere verificación)
app.post("/cambiar-rol", (req, res) => {
    const { correo, nuevoRol } = req.body;

    if (!correo || !nuevoRol || !['usuario', 'admin'].includes(nuevoRol)) {
        return res.status(400).json({ success: false, message: "Datos inválidos" });
    }

    const sql = `
        UPDATE usuarios
        SET rol = ?
        WHERE correo = ?
    `;

    conexion.query(sql, [nuevoRol, correo], (error) => {
        if (error) {
            console.log(error);
            return res.status(500).json({ success: false, message: "Error actualizando rol" });
        }

        res.json({ success: true, message: `Rol actualizado a ${nuevoRol}` });
    });
});

// Endpoint para obtener info de usuario (incluyendo rol)
app.post("/obtener-usuario", (req, res) => {
    const { correo } = req.body;

    if (!correo) {
        return res.status(400).json({ success: false, message: "Correo requerido" });
    }

    const sql = `
        SELECT id, nombre, apellido, correo, rol FROM usuarios
        WHERE correo = ?
    `;

    conexion.query(sql, [correo], (error, resultado) => {
        if (error) {
            console.log(error);
            return res.status(500).json({ success: false, message: "Error obteniendo usuario" });
        }

        if (resultado.length > 0) {
            return res.json({ success: true, usuario: resultado[0] });
        } else {
            return res.status(404).json({ success: false, message: "Usuario no encontrado" });
        }
    });
});

// Endpoint para obtener todos los usuarios
app.get("/obtener-usuarios", (req, res) => {
    const sql = `
        SELECT id, nombre, apellido, correo, rol FROM usuarios
        ORDER BY nombre ASC
    `;

    conexion.query(sql, (error, resultado) => {
        if (error) {
            console.log(error);
            return res.status(500).json({ success: false, message: "Error obteniendo usuarios" });
        }

        res.json({ success: true, usuarios: resultado });
    });
});



app.post("/crear-pago", async (req, res) => {

    try {

        const { total } = req.body;

        const referencia = "DUNAKA-" + Date.now();

        const respuesta = await axios.post(

            "https://sandbox.wompi.co/v1/transactions",

            {

                amount_in_cents: total * 100,

                currency: "COP",

                customer_email: "cliente@gmail.com",

                reference: referencia,

                payment_method: {
                    type: "NEQUI"
                }

            },

            {

                headers: {

                    Authorization: "Bearer pub_test_TMtzLyFRKH2ulwbO8kRGX9ajyXvQOpAG",

                    "Content-Type": "application/json"

                }

            }

        );

        res.json({

            success: true,

            data: respuesta.data

        });

    } catch(error){

        console.log(error.response?.data || error);

        res.json({

            success: false,

            error: error.response?.data || error.message

        });

    }

});

// routes para consulta de los datos del usuario //
app.post("/usuario-perfil", (req, res) => {

    console.log("🔥 PETICIÓN RECIBIDA /usuario-perfil");

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
    
});
//endpoint para editar los datos del usuario en la base de datos
app.put("/actualizar-usuario", (req, res) => {

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

});
// GUARDAR COMPRA
app.post("/guardar-compra", (req, res) => {

    const { usuarioId, carrito, total } = req.body;

    if(!carrito || carrito.length === 0){

        return res.json({

            success: false,
            message: "Carrito vacío"

        });

    }

    const sqlVenta = `
    
        INSERT INTO ventas
        (usuario_id, total, estado)

        VALUES (?, ?, ?)

    `;

    conexion.query(

        sqlVenta,

        [usuarioId, total, "Pendiente"],

        (error, resultado) => {

            if(error){

                console.log(error);

                return res.json({

                    success: false

                });

            }

            const ventaId = resultado.insertId;

            carrito.forEach(producto => {

                const subtotal =
                producto.precio *
                producto.cantidad;

                const sqlDetalle = `

                    INSERT INTO detalle_ventas
                    (
                        venta_id,
                        producto_id,
                        nombre_producto,
                        precio,
                        cantidad,
                        subtotal
                    )

                    VALUES (?, ?, ?, ?, ?, ?)

                `;

                conexion.query(

                    sqlDetalle,

                    [

                        ventaId,
                        producto.id,
                        producto.nombre,
                        producto.precio,
                        producto.cantidad,
                        subtotal

                    ]

                );

            });

            res.json({

                success: true

            });

        }

    );

});
app.get("/mis-compras/:usuarioId", (req, res) => {
    const usuarioId = req.params.usuarioId;

   const sql = `
    SELECT
        v.id AS id,
        v.usuario_id AS usuarioId,
        v.total,
        v.estado,
        v.fecha,

        dv.producto_id,
        p.nombre AS nombre,
        dv.precio,
        dv.cantidad,
        dv.subtotal

    FROM ventas v

    LEFT JOIN detalle_ventas dv
    ON dv.venta_id = v.id

    LEFT JOIN productos p
    ON p.id = dv.producto_id

    WHERE v.usuario_id = ?

    ORDER BY v.id DESC, dv.id ASC
`;

    conexion.query(sql, [usuarioId], (error, resultado) => {
        if (error) {
            console.log(error);
            return res.status(500).json({ success: false, message: "Error obteniendo pedidos" });
        }

        res.json({ success: true, ventas: resultado || [] });
    });
},

// endpoint para subir foto
app.post(
    "/subir-foto",
    upload.single("foto"),
    (req, res) => {

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

                if(error){

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

    }
),
);
// GUARDAR COMPRA
app.post("/guardar-compra", (req, res) => {

    const { usuarioId, carrito, total } = req.body;

    if(!carrito || carrito.length === 0){

        return res.json({

            success: false,
            message: "Carrito vacío"

        });

    }

    const sqlVenta = `
    
        INSERT INTO ventas
        (usuario_id, total, estado)

        VALUES (?, ?, ?)

    `;

    conexion.query(

        sqlVenta,

        [usuarioId, total, "Pendiente"],

        (error, resultado) => {

            if(error){

                console.log(error);

                return res.json({

                    success: false

                });

            }

            const ventaId = resultado.insertId;

            carrito.forEach(producto => {

                const subtotal =
                producto.precio *
                producto.cantidad;

                const sqlDetalle = `

                    INSERT INTO detalle_ventas
                    (
                        venta_id,
                        producto_id,
                        nombre_producto,
                        precio,
                        cantidad,
                        subtotal
                    )

                    VALUES (?, ?, ?, ?, ?, ?)

                `;

                conexion.query(

                    sqlDetalle,

                    [

                        ventaId,
                        producto.id,
                        producto.nombre,
                        producto.precio,
                        producto.cantidad,
                        subtotal

                    ]

                );

            });

            res.json({

                success: true

            });

        }

    );

});
app.get("/mis-compras/:usuarioId", (req, res) => {
    const usuarioId = req.params.usuarioId;

   const sql = `
    SELECT
        v.id AS id,
        v.usuario_id AS usuarioId,
        v.total,
        v.estado,
        v.fecha,

        dv.producto_id,
        p.nombre AS nombre,
        dv.precio,
        dv.cantidad,
        dv.subtotal

    FROM ventas v

    LEFT JOIN detalle_ventas dv
    ON dv.venta_id = v.id

    LEFT JOIN productos p
    ON p.id = dv.producto_id

    WHERE v.usuario_id = ?

    ORDER BY v.id DESC, dv.id ASC
`;

    conexion.query(sql, [usuarioId], (error, resultado) => {
        if (error) {
            console.log(error);
            return res.status(500).json({ success: false, message: "Error obteniendo pedidos" });
        }

        res.json({ success: true, ventas: resultado || [] });
    });
});

app.post("/google-login", (req, res) => {

    const { nombre, correo } = req.body;

    const sqlBuscar = `
        SELECT * FROM usuarios
        WHERE correo = ?
    `;

    conexion.query(sqlBuscar, [correo], (error, resultado) => {

        if(error){
            console.log(error);
            return res.status(500).json({
                success: false
            });
        }

        if(resultado.length > 0){

            return res.json({
                success: true,
                usuario: resultado[0]
            });

        }

        const sqlInsert = `
            INSERT INTO usuarios
            (nombre, correo, rol)
            VALUES (?, ?, 'usuario')
        `;

        conexion.query(
            sqlInsert,
            [nombre, correo],
            (error2) => {

                if(error2){
                    console.log(error2);
                    return res.status(500).json({
                        success: false
                    });
                }

                conexion.query(
                    sqlBuscar,
                    [correo],
                    (error3, usuarioNuevo) => {

                        res.json({
                            success: true,
                            usuario: usuarioNuevo[0]
                        });

                    }
                );

            }
        );

    });

});
console.log("RUTA GOOGLE CARGADA");

app.listen(3000, () => {
    console.log("Servidor corriendo en puerto 3000");
});

