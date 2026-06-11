const conexion = require("../config/database.js");

exports.obtenerproductos = (req, res) => {
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
};

exports.productos = (req, res) => {
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
};

exports.agregarproductos = (req, res) => {
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
};

exports.agregarproductos_id = (req, res) => {
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
};

exports.actualizarproducto_id = (req, res) => {
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
};

exports.eliminarproducto_id = (req, res) => {
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
};

exports.obtenerProductoPorSlug = (req, res) => {
    const { slug } = req.params;

    conexion.query(
        "SELECT * FROM productos WHERE slug = ?",
        [slug],
        (error, resultado) => {
            if (error) return res.status(500).json({ success: false });
            if (resultado.length === 0) return res.status(404).json({ success: false, message: "Producto no encontrado" });
            res.json({ success: true, producto: resultado[0] });
        }
    );
};

exports.obtenerProductosConSlug = (req, res) => {
    conexion.query(
        "SELECT id, nombre, precio, imagen, descripcion, stock, slug, estado FROM productos",
        (error, resultado) => {
            if (error) return res.status(500).json({ success: false });
            res.json({ success: true, productos: resultado });
        }
    );
};