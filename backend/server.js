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

app.listen(3000, () => {
    console.log("Servidor corriendo en puerto 3000");
});