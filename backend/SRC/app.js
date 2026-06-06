const express = require("express");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/authRoutes.js");
const usuarioRoutes = require("./routes/usuarioRoutes.js");
const productoRoutes = require("./routes/productoRoutes.js");
const ventaRoutes = require("./routes/ventaRoutes.js");
const adminRoutes = require("./routes/adminRoutes.js");
const resenaRoutes = require("./routes/resenaRoutes.js");
const pagoRoutes = require("./routes/pagoRoutes.js");

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