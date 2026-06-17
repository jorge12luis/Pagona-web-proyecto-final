const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadPath = path.join(__dirname, "../uploads/productos");

if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, uploadPath);
    },
    filename(req, file, cb) {
        const nombre = Date.now() + "-" + file.originalname.replace(/\s/g, "-");
        cb(null, nombre);
    }
});

module.exports = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const tipos = /jpeg|jpg|png|webp|gif/;
        const valido = tipos.test(path.extname(file.originalname).toLowerCase());
        valido ? cb(null, true) : cb(new Error("Solo se permiten imágenes"));
    }
});