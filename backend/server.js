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
        console.log("Error creando tabla de recuperaciÃ³n:", error);
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
app.use(
    "/uploads",
    express.static("uploads")
);
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
        "Advertencia: SMTP_USER y SMTP_PASS no estÃ¡n configurados."
    );
}

function formatDateTime(date) {
    return date
        .toISOString()
        .slice(0, 19)
        .replace("T", " ");
}


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

            }

            return res.status(401).json({
                success: false,
                message: "Correo o contraseña incorrectos"
            });

        }
    );

});
app.post("/registro", (req, res) => {
    const {
        nombre,
        apellido,
        correo,
        clave,
        confirmarclave,
        telefono,
        date,
        direccion
    } = req.body;

    if (
        !correo || !correo.toLowerCase().endsWith("@gmail.com")
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
            rol,
            numero_telefono,
            fecha_nacimiento,
            direccion
        )
        VALUES (?,?,?,?,"usuario",?,?,?)
    `;

    conexion.query(
        sql,
        [
            nombre,
            apellido,
            correo,
            clave,
            telefono,
            date,
            direccion,
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

// AGREGAR RESEÃ‘A
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

    const sql = `
        INSERT INTO resenas
        (
            producto_id,
            usuario_nombre,
            comentario,
            calificacion
        )
        VALUES (?, ?, ?, ?)
    `;

    conexion.query(
        sql,
        [
            producto_id,
            usuario_nombre,
            comentario,
            calificacion
        ],
        (error, resultado) => {

            if (error) {

                console.log(error);

                return res.status(500).json({
                    success: false,
                    message: "Error guardando reseÃ±a"
                });

            }

            res.json({
                success: true,
                message: "ReseÃ±a guardada correctamente"
            });

        }
    );

});

// routes para consulta de los datos del usuario //
app.post("/usuario-perfil", (req, res) => {

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
            message: "Carrito vacÃ­o"

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
                        precio,
                        cantidad,
                        subtotal
                    )

                    VALUES (?, ?, ?, ?, ?)

                `;

                conexion.query(

                    sqlDetalle,

                    [

                        ventaId,
                        producto.id,
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
);

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


// OBTENER RESEÃ‘AS
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
                            "Error obteniendo reseÃ±as"
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

// OBTENER PRODUCTOS
app.get("/obtener-productos", (req, res) => {
    const sql = "SELECT * FROM productos";

    conexion.query(sql, (error, resultado) => {
        if (error) {
            console.log(error);
            return res.status(500).json({
                success: false,
                message: "Error obteniendo productos"
            });
        }

        res.json({
            success: true,
            productos: resultado || []
        });
    });
});

// AGREGAR PRODUCTO
app.post("/agregar-producto", (req, res) => {
    const { nombre, precio, stock } = req.body;

    if (!nombre || !precio || stock === undefined) {
        return res.status(400).json({
            success: false,
            message: "Faltan datos"
        });
    }

    const sql = `
        INSERT INTO productos (nombre, precio, stock)
        VALUES (?, ?, ?)
    `;

    conexion.query(sql, [nombre, precio, stock], (error, resultado) => {
        if (error) {
            console.log(error);
            return res.status(500).json({
                success: false,
                message: "Error al agregar producto"
            });
        }

        res.json({
            success: true,
            message: "Producto agregado exitosamente",
            id: resultado.insertId
        });
    });
});

// ACTUALIZAR PRODUCTO
app.put("/actualizar-producto/:id", (req, res) => {
    const { id } = req.params;
    const { nombre, precio, stock } = req.body;

    if (!nombre || !precio || stock === undefined) {
        return res.status(400).json({
            success: false,
            message: "Faltan datos"
        });
    }

    const sql = `
        UPDATE productos 
        SET nombre = ?, precio = ?, stock = ?
        WHERE id = ?
    `;

    conexion.query(sql, [nombre, precio, stock, id], (error) => {
        if (error) {
            console.log(error);
            return res.status(500).json({
                success: false,
                message: "Error al actualizar producto"
            });
        }

        res.json({
            success: true,
            message: "Producto actualizado exitosamente"
        });
    });
});

// ELIMINAR PRODUCTO
app.delete("/eliminar-producto/:id", (req, res) => {
    const { id } = req.params;

    const sql = "DELETE FROM productos WHERE id = ?";

    conexion.query(sql, [id], (error) => {
        if (error) {
            console.log(error);
            return res.status(500).json({
                success: false,
                message: "Error al eliminar producto"
            });
        }

        res.json({
            success: true,
            message: "Producto eliminado exitosamente"
        });
    });
});

// OBTENER TOTAL GANANCIAS
app.get("/admin/total-ganancias", (req, res) => {
    const sql = "SELECT SUM(total) AS ganancias FROM ventas";

    conexion.query(sql, (error, resultado) => {
        if (error) {
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
app.get("/admin/dashboard", (req, res) => {
    const sql = `
        SELECT
            (SELECT COUNT(*) FROM productos) AS totalProductos,
            (SELECT COUNT(*) FROM usuarios) AS totalUsuarios,
            (SELECT COUNT(*) FROM ventas) AS totalPedidos,
            (SELECT SUM(total) FROM ventas) AS ingresosGenerados,
            (SELECT COUNT(*) FROM ventas WHERE fecha >= CURDATE()) AS ventasHoy,
            (SELECT COUNT(*) FROM ventas WHERE fecha >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)) AS ventasSemana,
            (SELECT COUNT(*) FROM ventas WHERE MONTH(fecha) = MONTH(CURDATE()) AND YEAR(fecha) = YEAR(CURDATE())) AS ventasMes,
            (SELECT SUM(total) FROM ventas WHERE fecha >= CURDATE()) AS ingresosHoy,
            (SELECT SUM(total) FROM ventas WHERE fecha >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)) AS ingresosSemana,
            (SELECT SUM(total) FROM ventas WHERE MONTH(fecha) = MONTH(CURDATE()) AND YEAR(fecha) = YEAR(CURDATE())) AS ingresosMes,
            (SELECT COUNT(*) FROM usuarios) AS clientesRegistrados
    `;

    const sqlTopProductos = `
        SELECT
            p.id,
            p.nombre,
            COALESCE(SUM(dv.cantidad), 0) AS cantidadVendida
        FROM productos p
        LEFT JOIN detalle_ventas dv ON dv.producto_id = p.id
        GROUP BY p.id, p.nombre
        ORDER BY cantidadVendida DESC
        LIMIT 5
    `;

    conexion.query(sql, (error, resumen) => {
        if (error) {
            console.log(error);
            return res.status(500).json({ success: false, message: "Error obteniendo métricas de dashboard" });
        }

        conexion.query(sqlTopProductos, (error2, topProductos) => {
            if (error2) {
                console.log(error2);
                return res.status(500).json({ success: false, message: "Error obteniendo productos más vendidos" });
            }

            const fila = resumen[0] || {};
            res.json({
                totalProductos: fila.totalProductos || 0,
                totalUsuarios: fila.totalUsuarios || 0,
                totalVentas: fila.totalPedidos || 0,
                ganancias: fila.ingresosGenerados || 0,
                totalVentasHoy: fila.ventasHoy || 0,
                totalVentasSemana: fila.ventasSemana || 0,
                totalVentasMes: fila.ventasMes || 0,
                ingresosHoy: fila.ingresosHoy || 0,
                ingresosSemana: fila.ingresosSemana || 0,
                ingresosMes: fila.ingresosMes || 0,
                totalPedidos: fila.totalPedidos || 0,
                clientesRegistrados: fila.clientesRegistrados || 0,
                productosMasVendidos: topProductos || []
            });
        });
    });
});

app.get("/productos", (req, res) => {
    const sql = "SELECT * FROM productos";

    conexion.query(sql, (error, resultado) => {
        if (error) {
            console.log(error);
            return res.status(500).json({
                success: false
            });
        }

        res.json(resultado);
    });
});

app.get("/admin/ventas", (req, res) => {
    const sql = `
        SELECT
            v.id,
            v.usuario_id,
            u.nombre AS usuario,
            v.total,
            v.estado,
            v.fecha
        FROM ventas v
        LEFT JOIN usuarios u ON u.id = v.usuario_id
        ORDER BY v.fecha DESC
    `;

    conexion.query(sql, (error, resultado) => {
        if (error) {
            console.log(error);
            return res.status(500).json({
                success: false,
                message: "Error obteniendo ventas"
            });
        }

        res.json({
            success: true,
            ventas: resultado || []
        });
    });
});

app.listen(3000, () => {
    console.log(
        "Servidor corriendo en puerto 3000"
    );
});