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

const createResenasTable = `
CREATE TABLE IF NOT EXISTS resenas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    producto_id INT NOT NULL,
    usuario_nombre VARCHAR(150),
    comentario TEXT,
    calificacion INT,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (producto_id) REFERENCES productos(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
`;

conexion.query(createResenasTable, (error) => {
    if (error) {
        console.log("Error creando tabla resenas:", error);
    }
});

const fs = require('fs');
const logPath = path.join(__dirname, 'carrito.log');

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
// ==========================================
// CONFIGURACIÓN DE MULTER (PERFILES Y PRODUCTOS)
// ==========================================

// 1. Almacenamiento para Fotos de Perfil
const storagePerfiles = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/perfiles");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    }
});
const upload = multer({ storage: storagePerfiles });

// 2. Almacenamiento para Fotos de Productos 
const storageProductos = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/productos");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    }
});
const uploadProducto = multer({ storage: storageProductos });
//////////////////////////////////////////
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
    const { nombre, apellido, correo, contrasena, telefono, fechaNacimiento } = req.body;

    if (!nombre || !correo || !contrasena) {
        return res.status(400).json({ success: false, message: "Faltan datos" });
    }

    const sqlBuscar = `SELECT id FROM usuarios WHERE correo = ?`;

    conexion.query(sqlBuscar, [correo], (err, resultado) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ success: false, message: "Error registrando usuario" });
        }

        if (resultado.length > 0) {
            return res.status(400).json({ success: false, message: "Correo ya registrado" });
        }

        const sqlInsert = `
            INSERT INTO usuarios (nombre, apellido, correo, contrasena, numero_telefono, fecha_nacimiento)
            VALUES (?, ?, ?, ?, ?, ?)
        `;

        conexion.query(
            sqlInsert,
            [nombre, apellido || null, correo, contrasena, telefono || null, fechaNacimiento || null],
            (err2) => {
                if (err2) {
                    console.log(err2);
                    return res.status(500).json({ success: false, message: "Error guardando usuario" });
                }

                conexion.query(sqlBuscar, [correo], (err3, rows) => {
                    if (err3) {
                        console.log(err3);
                        return res.status(500).json({ success: false, message: "Error recuperando usuario" });
                    }

                    res.json({ success: true, message: "Usuario registrado", usuario: rows[0] });
                });
            }
        );
    });
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

// OBTENER TODOS LOS USUARIOS (Para el panel de administración)
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

        return res.json({
            success: true,
            usuarios: resultado || []
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
                    message: "Error guardando resena"
                });

            }

            res.json({
                success: true,
                message: "Resena guardada correctamente"
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
            message: "Carrito vaci­o"

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
                        producto.producto_id || null,
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


// AGREGAR PRODUCTO (Actualizada para recibir imagen y descripción)
app.post("/agregar-producto", uploadProducto.single("imagen"), (req, res) => {
    // Los textos llegan en req.body
    const { nombre, precio, stock, descripcion, categoria_id, estado } = req.body;
    
    // Multer guarda el archivo en req.file si el usuario subió una foto
    const imagen = req.file ? `uploads/productos/${req.file.filename}` : null;

    if (!nombre || !precio || stock === undefined) {
        return res.status(400).json({
            success: false,
            message: "Faltan datos obligatorios"
        });
    }

    const sql = `
        INSERT INTO productos (nombre, precio, stock, imagen, descripcion, categoria_id, estado)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    conexion.query(
        sql, 
        [nombre, precio, stock, imagen, descripcion || null, categoria_id || null, estado || null], 
        (error, resultado) => {
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
        }
    );
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

// ELIMINAR PRODUCTO POR ID
app.delete("/eliminar-producto/:id", (req, res) => {
    const { id } = req.params;

    const sql = "DELETE FROM productos WHERE id = ?";

    conexion.query(sql, [id], (error, resultado) => {
        if (error) {
            console.log(error);
            return res.status(500).json({
                success: false,
                message: "Error al eliminar el producto"
            });
        }

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Producto no encontrado"
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
app.post("/carrito", (req, res) => {

    const { usuario_id, producto_id, color, cantidad } = req.body;

    console.log("POST /carrito recibido desde", req.ip, "body:", req.body);

    if (!usuario_id || !producto_id) {
        return res.status(400).json({ success: false, message: "Faltan datos: usuario_id o producto_id" });
    }

    // verificar usuario
    conexion.query("SELECT id FROM usuarios WHERE id = ?", [usuario_id], (errUser, userResult) => {
        if (errUser) {
            console.log(errUser);
            return res.status(500).json({ success: false, message: "Error verificando usuario" });
        }

        console.log('userResult:', userResult && userResult.length);
        if (!userResult || userResult.length === 0) {
            console.log('Usuario no encontrado:', usuario_id);
            return res.status(400).json({ success: false, message: "Usuario no encontrado" });
        }

        // verificar producto
        conexion.query("SELECT id FROM productos WHERE id = ?", [producto_id], (errProd, prodResult) => {
            if (errProd) {
                console.log('Error en SELECT producto:', errProd);
                return res.status(500).json({ success: false, message: "Error verificando producto" });
            }

            console.log('prodResult length:', prodResult && prodResult.length);
            if (!prodResult || prodResult.length === 0) {
                console.log('Producto no encontrado:', producto_id);
                return res.status(400).json({ success: false, message: "Producto no encontrado" });
            }

            const sqlInsert = `INSERT INTO carrito (usuario_id, producto_id, color, cantidad) VALUES (?, ?, ?, ?)`;
                const insertInfo = `Insertando en carrito: ${JSON.stringify({ usuario_id, producto_id, color, cantidad })}`;
                console.log(insertInfo);
                try{ fs.appendFileSync(logPath, new Date().toISOString() + ' ' + insertInfo + '\n'); }catch(e){console.log('Log write error', e.message);}            

            conexion.query(sqlInsert, [usuario_id, producto_id, color, cantidad || 1], (error, resultado) => {
                if (error) {
                        const errMsg = 'Error insert carrito: ' + (error && error.message);
                        console.log(errMsg, error);
                        try{ fs.appendFileSync(logPath, new Date().toISOString() + ' ' + errMsg + '\n' + JSON.stringify(error) + '\n'); }catch(e){console.log('Log write error', e.message);}            
                        return res.status(500).json({ success: false, message: "Error guardando carrito" });
                }

                    const okMsg = 'Carrito insertado id: ' + (resultado && resultado.insertId);
                    console.log(okMsg);
                    try{ fs.appendFileSync(logPath, new Date().toISOString() + ' ' + okMsg + '\n'); }catch(e){console.log('Log write error', e.message);}            
                res.json({ success: true });
            });

        });

    });

});
app.get("/carrito/:usuarioId", (req,res)=>{

    const usuarioId = req.params.usuarioId;

    const sql = `
        SELECT
            c.id,
            c.color,
            c.cantidad,
            p.nombre,
            p.precio,
            p.imagen
        FROM carrito c
        INNER JOIN productos p
        ON c.producto_id = p.id
        WHERE c.usuario_id = ?
    `;

    conexion.query(
        sql,
        [usuarioId],
        (error, resultado)=>{

            if(error){

                return res.status(500).json(error);

            }

            res.json(resultado);

        }
    );

});
app.delete("/carrito/:id", (req,res)=>{

    conexion.query(
        "DELETE FROM carrito WHERE id=?",
        [req.params.id],
        (error)=>{

            if(error){

                return res.status(500).json(error);

            }

            res.json({
                success:true
            });

        }
    );

});

// =========================================================================
// MÉTODOS DE PAGO (TARJETAS Y BILLETERAS DIGITALES)
// =========================================================================

// 1. Obtener métodos de pago vinculados a un correo
app.get("/api/obtener-metodos", (req, res) => {
    const { correo } = req.query;

    if (!correo) {
        return res.status(400).json({ success: false, message: "Correo requerido" });
    }

    const sql = "SELECT id, tipo, numero, expiracion FROM metodos_pago WHERE correo_usuario = ? ORDER BY id DESC";
    conexion.query(sql, [correo], (error, resultados) => {
        if (error) {
            console.log("Error al obtener métodos de pago:", error);
            return res.status(500).json({ success: false, message: "Error en el servidor" });
        }
        res.json({ success: true, tarjetas: resultados });
    });
});

// 2. Insertar un nuevo método de pago (¡BLINDADO CONTRA DUPLICADOS Y TRIPLICADOS!)
app.post("/api/guardar-metodo", (req, res) => {
    const { correo, tipo, numero, titular, expiracion, cvv } = req.body;

    console.log(`\n[Petición Recibida] Intentando guardar método para: ${correo} - Número: ${numero}`);

    // Validación básica de campos vacíos
    if (!correo || !tipo || !numero) {
        console.log("❌ Rechazado: Faltan datos obligatorios");
        return res.status(400).json({ success: false, message: "Datos obligatorios incompletos" });
    }

    // Limpiar espacios en blanco por si el frontend los envía con espacios
    const numeroLimpio = String(numero).replace(/\s+/g, '');
    const correoLimpio = String(correo).trim();

    // Normalizar campos opcionales
    const titularFinal = titular ? titular.trim() : "Billetera Digital";
    const expiracionFinal = expiracion ? expiracion.trim() : "N/A";
    const cvvFinal = cvv ? cvv.trim() : "000";

    // PASO 1: Verificar en la BD si YA EXISTE ese número de tarjeta para ese correo
    const sqlVerificar = "SELECT id FROM metodos_pago WHERE correo_usuario = ? AND numero = ?";
    
    conexion.query(sqlVerificar, [correoLimpio, numeroLimpio], (errorVerificar, filas) => {
        if (errorVerificar) {
            console.log("❌ Error en la verificación de duplicados:", errorVerificar);
            return res.status(500).json({ success: false, message: "Error interno del servidor" });
        }

        // Si la consulta arroja resultados, significa que la ráfaga intentó meter la misma tarjeta
        if (filas.length > 0) {
            console.log(`⚠️ Clonación bloqueada: El método ${numeroLimpio} ya existía para ${correoLimpio}.`);
            // Retornamos un 200 o 400 pero frenamos el proceso para que el frontend no rompa
            return res.status(400).json({ 
                success: false, 
                message: "Este método de pago ya se encuentra registrado." 
            });
        }

        // PASO 2: Si está limpio, procedemos con la inserción segura
        const sqlInsertar = `
            INSERT INTO metodos_pago (correo_usuario, tipo, numero, titular, expiracion, cvv) 
            VALUES (?, ?, ?, ?, ?, ?)
        `;

        conexion.query(
            sqlInsertar, 
            [correoLimpio, tipo, numeroLimpio, titularFinal, expiracionFinal, cvvFinal], 
            (errorInsertar, resultado) => {
                if (errorInsertar) {
                    console.log("❌ Error al insertar en la base de datos:", errorInsertar);
                    return res.status(500).json({ success: false, message: "No se pudo registrar en la base de datos" });
                }
                
                console.log(`✅ Éxito: Método guardado correctamente con ID: ${resultado.insertId}`);
                return res.json({ 
                    success: true, 
                    message: "Método de pago guardado exitosamente", 
                    id: resultado.insertId 
                });
            }
        );
    });
});

// 3. Eliminar un método de pago por su ID
app.delete("/api/eliminar-metodo/:id", (req, res) => {
    const { id } = req.params;

    const sql = "DELETE FROM metodos_pago WHERE id = ?";
    conexion.query(sql, [id], (error) => {
        if (error) {
            console.log("Error al eliminar método de pago:", error);
            return res.status(500).json({ success: false, message: "Error al eliminar de la base de datos" });
        }
        res.json({ success: true, message: "Método de pago eliminado de forma correcta" });
    });
});


// AL FINAL DE TU ARCHIVO ASEGÚRATE DE QUE ESTÉ EL ESCUCHADOR DEL PUERTO
app.listen(3000, () => {
    console.log("Servidor corriendo en el puerto 3000");
});

// ==========================================
// CRUD REAL DE PRODUCTOS (MAPEADO A TU TABLA)
// ==========================================

// 1. OBTENER TODOS LOS PRODUCTOS
app.get("/api/obtener-productos", (req, res) => {
    const sql = "SELECT * FROM productos ORDER BY id DESC";
    conexion.query(sql, (error, resultado) => {
        if (error) {
            console.error("Error al traer productos:", error);
            return res.status(500).json({ success: false, message: "Error al traer productos" });
        }
        res.json({ success: true, productos: resultado });
    });
});

// 2. CREAR UN PRODUCTO NUEVO (CON TU ESTRUCTURA)
app.post("/api/guardar-producto", uploadProducto.single("imagen"), (req, res) => {
    const { nombre, precio, stock, descripcion } = req.body;
    // Si subieron foto guardamos la ruta, si no, dejamos null o una por defecto
    const imagenRuta = req.file ? `/uploads/productos/${req.file.filename}` : null;
    
    // Asignamos valores por defecto para los campos que tiene tu tabla pero no el formulario
    const categoria_id = 1; 
    const estado = 'Activo';

    const sql = `
        INSERT INTO productos (nombre, precio, imagen, descripcion, stock, categoria_id, estado) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    conexion.query(sql, [nombre, precio, imagenRuta, descripcion, stock, categoria_id, estado], (error, resultado) => {
        if (error) {
            console.error("Error al insertar en la BD:", error);
            return res.status(500).json({ success: false, message: "Error al guardar en la base de datos" });
        }
        res.json({ success: true, message: "¡Producto creado con éxito!", id: resultado.insertId });
    });
});

// 3. EDITAR UN PRODUCTO EXISTENTE
app.put("/api/actualizar-producto/:id", uploadProducto.single("imagen"), (req, res) => {
    const { id } = req.params;
    const { nombre, precio, stock, descripcion } = req.body;
    
    let sql = "UPDATE productos SET nombre = ?, precio = ?, stock = ?, descripcion = ? WHERE id = ?";
    let parametros = [nombre, precio, stock, descripcion, id];

    // Si el administrador subió una foto nueva al editar, cambiamos el campo 'imagen'
    if (req.file) {
        sql = "UPDATE productos SET nombre = ?, precio = ?, stock = ?, descripcion = ?, imagen = ? WHERE id = ?";
        parametros = [nombre, precio, stock, descripcion, `/uploads/productos/${req.file.filename}`, id];
    }

    conexion.query(sql, parametros, (error) => {
        if (error) {
            console.error("Error al actualizar la BD:", error);
            return res.status(500).json({ success: false, message: "Error al actualizar el producto" });
        }
        res.json({ success: true, message: "¡Producto actualizado con éxito!" });
    });
});

// 4. ELIMINAR UN PRODUCTO
app.delete("/api/eliminar-producto/:id", (req, res) => {
    const { id } = req.params;
    const sql = "DELETE FROM productos WHERE id = ?";
    conexion.query(sql, [id], (error) => {
        if (error) {
            console.error("Error al eliminar de la BD:", error);
            return res.status(500).json({ success: false, message: "Error al eliminar el producto" });
        }
        res.json({ success: true, message: "Producto eliminado correctamente" });
    });
});
// ==========================================