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

app.get("/obtener-resenas/:productoId",
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