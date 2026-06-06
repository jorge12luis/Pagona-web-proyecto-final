const express = require("express");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/adminRoutes.js");
const usuarioRoutes = require("./routes/authRoutes.js");
const productoRoutes = require("./routes/pagoRoutes.js");
const ventaRoutes = require("./routes/productoRoutes.js");
const adminRoutes = require("./routes/resenaRoutes.js");
const resenaRoutes = require("./routes/usuarioRoutes.js");
const pagoRoutes = require("./routes/ventaRoutes.js");

const app = express();

app.use(cors());
app.use(express.json());

app.use(
    express.static(
        path.join(__dirname, "..")
    )
);

app.use(
    "/uploads",
    express.static("uploads")
);

app.use(authRoutes);
app.use(usuarioRoutes);
app.use(productoRoutes);
app.use(ventaRoutes);
app.use(adminRoutes);
app.use(resenaRoutes);
app.use(pagoRoutes);

module.exports = app;