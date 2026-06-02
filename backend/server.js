const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const nodemailer = require("nodemailer");
const path = require("path");
const axios = require("axios");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "..")));

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
ALTER TABLE usuarios 
ADD COLUMN IF NOT EXISTS rol ENUM('usuario', 'admin') DEFAULT 'usuario';
`;

conexion.query(alterTableRol, (error) => {
    if (error) {
        console.log(
            "Nota: Columna rol ya existe o error al crearla:",
            error.message
        );
    } else {
        console.log("Columna rol verificada/creada en tabla usuarios");
    }
});

const smtpUser = process.env.SMTP_USER || "";
const smtpPass = process.env.SMTP_PASS || "";

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: process.env.SMTP_PORT
        ? Number(process.env.SMTP_PORT)
        : 587,
    secure: false,
    auth:
        smtpUser && smtpPass
            ? {
                  user: smtpUser,
                  pass: smtpPass
              }
            : undefined
});

if (!smtpUser || !smtpPass) {
    console.log(
        "Advertencia: SMTP_USER y SMTP_PASS no están configurados."
    );
}

function formatDateTime(date) {
    return date
        .toISOString()
        .slice(0, 19)
        .replace("T", " ");
}

function enviarCodigoEmail(correo, codigo) {
    if (!smtpUser || !smtpPass) {
        console.log(
            `Código de recuperación para ${correo}: ${codigo}`
        );
        return Promise.resolve();
    }

    const mailOptions = {
        from: smtpUser,
        to: correo,
        subject: "Código de recuperación",
        text: `Tu código de recuperación es: ${codigo}.`
    };

    return transporter.sendMail(mailOptions);
}

function enviarCodigoSms(telefono, codigo) {
    console.log(
        `SMS simulado para ${telefono}: Tu código de recuperación es ${codigo}`
    );
}

app.post("/recuperar/codigo", (req, res) => {
    const { correo } = req.body;

    if (!correo) {
        return res.status(400).json({
            success: false,
            message: "Debes enviar un correo válido."
        });
    }

    const sqlBuscar = `
        SELECT * FROM usuarios
        WHERE correo = ?
    `;

    conexion.query(sqlBuscar, [correo], (error, resultado) => {
        if (error) {
            console.log(error);

            return res.status(500).json({
                success: false,
                message: "Error interno del servidor."
            });
        }

        if (resultado.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Ese correo no existe."
            });
        }

        const usuario = resultado[0];

        const codigo = Math.floor(
            100000 + Math.random() * 900000
        ).toString();

        const expiracion = formatDateTime(
            new Date(Date.now() + 15 * 60 * 1000)
        );

        const sqlInsert = `
            INSERT INTO recuperacion_codes
            (
                correo,
                codigo,
                expiracion
            )
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE
                codigo = ?,
                expiracion = ?
        `;

        conexion.query(
            sqlInsert,
            [
                correo,
                codigo,
                expiracion,
                codigo,
                expiracion
            ],
            (error) => {
                if (error) {
                    console.log(error);

                    return res.status(500).json({
                        success: false,
                        message: "No se pudo guardar el código."
                    });
                }

                enviarCodigoEmail(correo, codigo).catch((error) => {
                    console.log(
                        "Error enviando correo:",
                        error
                    );
                });

                let mensaje = `Se envió el código al correo ${correo}.`;

                if (usuario.numero_telefono) {
                    enviarCodigoSms(
                        usuario.numero_telefono,
                        codigo
                    );

                    mensaje += ` También se envió al número ${usuario.numero_telefono}.`;
                }

                return res.json({
                    success: true,
                    message: mensaje
                });
            }
        );
    });
});

app.post("/recuperar/cambiar", (req, res) => {
    const {
        correo,
        codigo,
        nuevaContrasena,
        confirmarContrasena
    } = req.body;

    if (
        !correo ||
        !codigo ||
        !nuevaContrasena ||
        !confirmarContrasena
    ) {
        return res.status(400).json({
            success: false,
            message:
                "Faltan datos para cambiar la contraseña."
        });
    }

    if (nuevaContrasena !== confirmarContrasena) {
        return res.status(400).json({
            success: false,
            message: "Las contraseñas no coinciden."
        });
    }

    const sqlCodigo = `
        SELECT * FROM recuperacion_codes
        WHERE correo = ?
    `;

    conexion.query(sqlCodigo, [correo], (error, resultado) => {
        if (error) {
            console.log(error);

            return res.status(500).json({
                success: false,
                message: "Error interno del servidor."
            });
        }

        if (resultado.length === 0) {
            return res.status(400).json({
                success: false,
                message:
                    "No hay un código activo para ese correo."
            });
        }

        const registro = resultado[0];

        const expiracion = new Date(
            registro.expiracion
        );

        if (Date.now() > expiracion.getTime()) {
            return res.status(400).json({
                success: false,
                message:
                    "El código ha expirado. Solicita uno nuevo."
            });
        }

        if (registro.codigo !== codigo) {
            return res.status(400).json({
                success: false,
                message: "Código incorrecto."
            });
        }

        const sqlActualizar = `
            UPDATE usuarios
            SET contrasena = ?
            WHERE correo = ?
        `;

        conexion.query(
            sqlActualizar,
            [nuevaContrasena, correo],
            (error) => {
                if (error) {
                    console.log(error);

                    return res.status(500).json({
                        success: false,
                        message:
                            "Error actualizando la contraseña."
                    });
                }

                const sqlEliminarCodigo = `
                    DELETE FROM recuperacion_codes
                    WHERE correo = ?
                `;

                conexion.query(
                    sqlEliminarCodigo,
                    [correo],
                    (error) => {
                        if (error) {
                            console.log(
                                "Error eliminando código:",
                                error
                            );
                        }
                    }
                );

                return res.json({
                    success: true,
                    message:
                        "Contraseña actualizada correctamente."
                });
            }
        );
    });
});

app.post("/login", (req, res) => {
    const { correo, contrasena } = req.body;

    const sql = `
        SELECT * FROM usuarios
        WHERE correo = ? AND contrasena = ?
    `;

    conexion.query(
        sql,
        [correo, contrasena],
        (error, resultado) => {
            if (error) {
                console.log(error);

                return res.status(500).json({
                    success: false,
                    message:
                        "Error interno del servidor."
                });
            }

            if (resultado.length > 0) {
                return res.json({
                    success: true,
                    message: "Login correcto",
                    usuario: resultado[0]
                });
            }

            return res.status(401).json({
                success: false,
                message:
                    "Correo o contraseña incorrectos."
            });
        }
    );
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

    if (
        !correo ||
        !correo.toLowerCase().endsWith("@gmail.com")
    ) {
        return res
            .status(400)
            .send("El correo debe terminar en @gmail.com");
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
            if (error) {
                console.log(error);

                return res
                    .status(500)
                    .send("Error registrando usuario");
            }

            res.send("Usuario registrado");
        }
    );
});

app.post("/cambiar-rol", (req, res) => {
    const { correo, nuevoRol } = req.body;

    if (
        !correo ||
        !nuevoRol ||
        !["usuario", "admin"].includes(nuevoRol)
    ) {
        return res.status(400).json({
            success: false,
            message: "Datos inválidos"
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
});

app.post("/obtener-usuario", (req, res) => {
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
});

app.get("/obtener-usuarios", (req, res) => {
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
                    Authorization:
                        "Bearer pub_test_TMtzLyFRKH2ulwbO8kRGX9ajyXvQOpAG",
                    "Content-Type":
                        "application/json"
                }
            }
        );

        res.json({
            success: true,
            data: respuesta.data
        });
    } catch (error) {
        console.log(error.response?.data || error);

        res.json({
            success: false,
            error:
                error.response?.data ||
                error.message
        });
    }
});

// TOTAL VENTAS
app.get("/admin/total-ventas", (req, res) => {
    const sql =
        "SELECT COUNT(*) AS total FROM ventas";

    conexion.query(sql, (error, resultado) => {
        if (error) {
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
    const sql =
        "SELECT SUM(total) AS ganancias FROM ventas";

    conexion.query(sql, (error, resultado) => {
        if (error) {
            console.log(error);

            return res.status(500).json({
                success: false
            });
        }

        res.json({
            success: true,
            ganancias:
                resultado[0].ganancias || 0
        });
    });
});

// AGREGAR RESEÑA
app.post("/agregar-resena", (req, res) => {
    const {
        producto_id,
        usuario_correo,
        usuario_nombre,
        comentario,
        calificacion
    } = req.body;

    if (
        !producto_id ||
        !usuario_correo ||
        !usuario_nombre ||
        !comentario ||
        !calificacion
    ) {
        return res.status(400).json({
            success: false,
            message: "Faltan datos"
        });
    }


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
});

// OBTENER RESEÑAS
app.get(
    "/obtener-resenas/:productoId",
    (req, res) => {
        const productoId =
            req.params.productoId;

        const sql = `
        SELECT *
        FROM resenas
        WHERE producto_id = ?
        ORDER BY fecha DESC
    `;

        conexion.query(
            sql,
            [productoId],
            (error, resultado) => {
                if (error) {
                    console.log(error);

                    return res.status(500).json({
                        success: false,
                        message:
                            "Error obteniendo reseñas"
                    });
                }

                res.json({
                    success: true,
                    resenas: resultado
                });
            }
        );
    }
);

app.listen(3000, () => {
    console.log(
        "Servidor corriendo en puerto 3000"
    );
});