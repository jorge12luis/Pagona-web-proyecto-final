require("dotenv").config();

const app = require("./SRC/app.js");

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(
        `Servidor corriendo en puerto ${PORT}`
    );
});