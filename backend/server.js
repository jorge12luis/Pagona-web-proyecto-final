const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

const conexion = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "tienda_bolso"
});

conexion.connect((error) => {

    if(error){
        console.log(error);
    }else{
        console.log("MySQL conectado");
    }

});

app.post("/registro", (req, res) => {

    console.log("DATOS RECIBIDOS:");
    console.log(req.body);

    const nombre = req.body.nombre;
    const correo = req.body.correo;
    const contrasena = req.body.contrasena;

    const sql = `
    INSERT INTO usuarios(nombre, correo, contrasena)
    VALUES (?, ?, ?)
    `;

    conexion.query(
        sql,
        [nombre, correo, contrasena],
        (error, resultado) => {

            if(error){
                console.log("ERROR MYSQL:");
                console.log(error);

                res.send("Error al registrar");
            }else{
                console.log("USUARIO REGISTRADO");

                res.send("Usuario registrado");
            }

        }
    );

});
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
                return res.status(500).json({ success: false, message: "Error interno del servidor" });
            }

            if(resultado.length > 0){
                return res.json({ success: true, message: "Login correcto", usuario: resultado[0] });
            }

            res.status(401).json({ success: false, message: "Correo o contraseña incorrectos" });
        }
    );

});

app.get("/usuario/:correo", (req, res) => {
    const correo = req.params.correo;

    const sql = `
    SELECT * FROM usuarios
    WHERE correo = ?
    `;

    conexion.query(
        sql,
        [correo],
        (error, resultado) => {
            if(error){
                console.log(error);
                return res.status(500).json({ success: false, message: "Error al obtener datos" });
            }

            if(resultado.length > 0){
                return res.json({ success: true, usuario: resultado[0] });
            }

            res.status(404).json({ success: false, message: "Usuario no encontrado" });
        }
    );
});

app.listen(3000, () => {
    console.log("Servidor corriendo en puerto 3000");
});