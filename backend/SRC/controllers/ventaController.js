const conexion = require("../config/database.js");
exports.miscompras_usuarioId = (req, res) => {
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
}

exports.guardar_compra = (req, res) => {

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

}
