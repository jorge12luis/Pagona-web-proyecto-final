const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// CONEXIÓN A MYSQL
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'tienda_virtual'
});

// PROBAR CONEXIÓN
db.connect((err) => {
    if (err) {
        console.log('❌ Error conectando a MySQL:', err);
    } else {
        console.log('✅ Conectado a MySQL');
    }
});

// RUTA REGISTRO
app.post('/registro', (req, res) => {

    const { nombre, correo, numero_telefono, contrasena } = req.body;

    const sql = `
        INSERT INTO usuarios (nombre, email, telefono, password)
        VALUES (?, ?, ?, ?)
    `;

    db.query(sql, [nombre, correo, numero_telefono, contrasena], (err, result) => {

        if (err) {
            return res.status(500).json({ error: err });
        }

        res.json({ mensaje: 'Usuario registrado correctamente' });

    });
});

// RUTA PRUEBA
app.get('/', (req, res) => {
    res.send('API funcionando 🚀');
});

// INICIAR SERVIDOR
app.listen(3000, () => {
    console.log('🚀 Servidor en puerto 3000');
});

app.post('/login', (req, res) => {

    const { correo, contrasena } = req.body;

    const sql = `
        SELECT * FROM usuarios 
        WHERE email = ? AND password = ?
    `;

    db.query(sql, [correo, contrasena], (err, results) => {

        if (err) {
            return res.status(500).json({ error: err });
        }

        if (results.length > 0) {
            res.json({
                mensaje: 'Login exitoso',
                usuario: results[0]
            });
        } else {
            res.status(401).json({ mensaje: 'Datos incorrectos' });
        }

    });
});