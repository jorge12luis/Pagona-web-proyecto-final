const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..')));

// ROUTES
app.use("/", require("./routes/auth.routes"));
app.use("/", require("./routes/recovery.routes"));
app.use("/", require("./routes/users.routes"));
app.use("/", require("./routes/admin.routes"));
app.use("/", require("./routes/payments.routes"));

app.listen(3000, () => {
    console.log("Servidor corriendo en puerto 3000");
});