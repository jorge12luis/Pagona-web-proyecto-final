const express = require("express");
const router = express.Router();

const adminController = require(
    "../controllers/adminController.js"
);

router.get("/admindashboard" , adminController.admindashboard);

router.get("/adminventas" , adminController.adminventas);

router.get("/adminganancias" , adminController.adminganancias);

router.get("/admintotalventas" , adminController.admintotalventas);

router.get("/admintotalganacias" , adminController.admintotalganancias);

module.exports = router;