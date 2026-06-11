const db = require('../config/database');

// 1. OBTENER MÉTODOS DE PAGO
exports.obtenerMetodos = (req, res) => {
    try {
        const { correo } = req.query;

        if (!correo) {
            return res.status(400).json({ success: false, message: 'El correo es requerido.' });
        }

        const query = 'SELECT id, tipo, numero, titular, expiracion FROM metodos_pago WHERE correo_usuario = ?';
        
        db.query(query, [correo], (err, results) => {
            if (err) {
                console.error('❌ Error al obtener métodos de pago en MySQL:', err.message);
                return res.status(500).json({ success: false, message: 'Error interno de la base de datos.' });
            }
            return res.json({ success: true, tarjetas: results });
        });
    } catch (error) {
        console.error('❌ Error crítico en obtenerMetodos:', error.message);
        return res.status(500).json({ success: false, message: 'Error crítico en el servidor.' });
    }
};

// 2. GUARDAR UN NUEVO MÉTODO DE PAGO (CORREGIDO CONTRA REQ.BODY UNDEFINED)
exports.guardarMetodo = (req, res) => {
    try {
        // Validación de emergencia por si el middleware fallara en desempaquetar
        if (!req.body || Object.keys(req.body).length === 0) {
            console.error('❌ Alerta: Llegó una petición POST pero req.body está vacío.');
            return res.status(400).json({ success: false, message: 'El cuerpo de la petición llegó vacío al servidor.' });
        }

        const { correo, tipo, numero, titular, expiracion, cvv } = req.body;
        console.log("📥 Datos procesados correctamente en el backend:", req.body);

        if (!correo || !tipo || !numero) {
            return res.status(400).json({ success: false, message: 'Faltan campos obligatorios (correo, tipo o numero).' });
        }

        const query = 'INSERT INTO metodos_pago (correo_usuario, tipo, numero, titular, expiracion, cvv) VALUES (?, ?, ?, ?, ?, ?)';
        
        db.query(query, [correo, tipo, numero, titular, expiracion, cvv], (err, result) => {
            if (err) {
                console.error('❌ Error de inserción en base de datos tienda_bolso:', err.message);
                return res.status(500).json({ success: false, message: 'Error al registrar en la base de datos.', error: err.message });
            }
            
            console.log('✅ Registro salvado con éxito. ID asignado:', result.insertId);
            return res.json({ success: true, message: 'Método guardado con éxito.', id: result.insertId });
        });

    } catch (catchError) {
        console.error('❌ Error crítico en el controlador guardarMetodo:', catchError.message);
        return res.status(500).json({ success: false, message: 'Error crítico interno en el servidor Express.' });
    }
};

// 3. ELIMINAR MÉTODO DE PAGO
exports.eliminarMetodo = (req, res) => {
    try {
        const { id } = req.params;

        const query = 'DELETE FROM metodos_pago WHERE id = ?';

        db.query(query, [id], (err, result) => {
            if (err) {
                console.error('❌ Error al eliminar método en MySQL:', err.message);
                return res.status(500).json({ success: false, message: 'Error al eliminar de la base de datos.' });
            }
            return res.json({ success: true, message: 'Método eliminado con éxito.' });
        });
    } catch (error) {
        console.error('❌ Error crítico en eliminarMetodo:', error.message);
        return res.status(500).json({ success: false, message: 'Error crítico en el servidor.' });
    }
};