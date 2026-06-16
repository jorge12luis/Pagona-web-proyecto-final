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

// =========================================================================
// CORREGIDO: AGREGAR PRODUCTO CON SOPORTE PARA IMÁGENES Y TODAS LAS COLUMNAS
// =========================================================================
exports.agregarproductos = (req, res) => {
    // Los campos de texto vienen en req.body
    const { nombre, precio, stock, descripcion, categoria_id, estado } = req.body;

    // Validación básica original respetada
    if (!nombre || !precio || stock === undefined) {
        return res.status(400).json({
            success: false,
            message: "Faltan datos"
        });
    }

    // Capturamos el archivo procesado por Multer desde req.file
    let imagenPath = null;
    if (req.file) {
        // Guarda la ruta pública relativa de la imagen para que el frontend la lea
        imagenPath = `/uploads/productos/${req.file.filename}`;
    }

    // SQL completo con todas las columnas presentes en tu base de datos
    const sql = `
        INSERT INTO productos (nombre, precio, stock, imagen, descripcion, categoria_id, estado)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const valores = [
        nombre, 
        precio, 
        stock, 
        imagenPath, 
        descripcion || '', 
        categoria_id || null, 
        estado || 'activo'
    ];

    conexion.query(sql, valores, (error, resultado) => {
        if (error) {
            console.log("Error SQL al insertar producto:", error);
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

// =========================================================================
// CORREGIDO: ACTUALIZAR PRODUCTOS CON SOPORTE PARA NUEVAS IMÁGENES
// =========================================================================
exports.agregarproductos_id = (req, res) => {
    const { id } = req.params;
    const { nombre, precio, stock, descripcion, categoria_id, estado } = req.body;

    if (!nombre || !precio || stock === undefined) {
        return res.status(400).json({
            success: false,
            message: "Faltan datos"
        });
    }

    // Construimos la actualización dinámica para respetar si suben o no una nueva foto
    let sql = `
        UPDATE productos 
        SET nombre = ?, precio = ?, stock = ?, descripcion = ?, categoria_id = ?, estado = ?
    `;
    let valores = [nombre, precio, stock, descripcion || '', categoria_id || null, estado || 'activo'];

    if (req.file) {
        sql += `, imagen = ?`;
        valores.push(`/uploads/productos/${req.file.filename}`);
    }

    sql += ` WHERE id = ?`;
    valores.push(id);

    conexion.query(sql, valores, (error) => {
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
    const { nombre, precio, stock, descripcion, categoria_id, estado } = req.body;

    if (!nombre || !precio || stock === undefined) {
        return res.status(400).json({
            success: false,
            message: "Faltan datos"
        });
    }

    let sql = `
        UPDATE productos 
        SET nombre = ?, precio = ?, stock = ?, descripcion = ?, categoria_id = ?, estado = ?
    `;
    let valores = [nombre, precio, stock, descripcion || '', categoria_id || null, estado || 'activo'];

    if (req.file) {
        sql += `, imagen = ?`;
        valores.push(`/uploads/productos/${req.file.filename}`);
    }

    sql += ` WHERE id = ?`;
    valores.push(id);

    conexion.query(sql, valores, (error) => {
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