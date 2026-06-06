exports.admindashboard = (req, res) => {
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
};

exports.adminventas = (req, res) => {
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
};

exports.adminganancias = (req, res) => {
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
};

exports.admintotalventas = (req, res) => {
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
};

exports.admintotalganancias = (req, res) => {
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
};