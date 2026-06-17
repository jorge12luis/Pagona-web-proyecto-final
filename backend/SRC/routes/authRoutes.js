const express = require("express");
const router = express.Router();


const authController = require(
    "../controllers/authController"
);

router.post("/login", authController.login);

////router.post("/registro",authController.registro);

///router.post("/google-login", authController.googleLogin);

module.exports = router;