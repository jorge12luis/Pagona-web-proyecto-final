const conexion = require("../config/database.js");

exports.obtenerCarritoPorUsuario = (req, res) => {
    const usuarioId = req.params.usuarioId;

    if (!usuarioId) {
        return res.status(400).json({ success: false, message: "Falta el id de usuario" });
    }

    const sql = `
        SELECT
            c.id,
            c.usuario_id AS usuarioId,
            c.producto_id AS productoId,
            c.color,
            c.cantidad,
            p.nombre,
            p.precio,
            p.imagen
        FROM carrito c
        LEFT JOIN productos p ON p.id = c.producto_id
        WHERE c.usuario_id = ?
    `;

    conexion.query(sql, [usuarioId], (error, resultado) => {
        if (error) {
            console.log(error);
            return res.status(500).json({ success: false, message: "Error obteniendo carrito" });
        }

        res.json(resultado || []);
    });
};

exports.agregarAlCarrito = (req, res) => {
    const { usuario_id, producto_id, color, cantidad } = req.body;

    if (!usuario_id || !producto_id || cantidad === undefined) {
        return res.status(400).json({ success: false, message: "Faltan datos para agregar al carrito" });
    }

    const sql = `
        INSERT INTO carrito (usuario_id, producto_id, color, cantidad)
        VALUES (?, ?, ?, ?)
    `;

    conexion.query(sql, [usuario_id, producto_id, color || null, cantidad], (error, resultado) => {
        if (error) {
            console.log(error);
            return res.status(500).json({ success: false, message: "Error agregando producto al carrito" });
        }

        res.json({ success: true, message: "Producto agregado al carrito", id: resultado.insertId });
    });
};

exports.eliminarDelCarrito = (req, res) => {
    const id = req.params.id;

    if (!id) {
        return res.status(400).json({ success: false, message: "Falta el id del item" });
    }

    const sql = "DELETE FROM carrito WHERE id = ?";

    conexion.query(sql, [id], (error, resultado) => {
        if (error) {
            console.log(error);
            return res.status(500).json({ success: false, message: "Error eliminando item del carrito" });
        }

        if (resultado.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Item no encontrado" });
        }

        res.json({ success: true, message: "Item eliminado del carrito" });
    });
};
