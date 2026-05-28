const router = require("express").Router();
const axios = require("axios");

router.post("/crear-pago", async (req, res) => {

    try {

        const { total } = req.body;

        const referencia = "DUNAKA-" + Date.now();

        const respuesta = await axios.post(
            "https://sandbox.wompi.co/v1/transactions",
            {
                amount_in_cents: total * 100,
                currency: "COP",
                customer_email: "cliente@gmail.com",
                reference: referencia,
                payment_method: { type: "NEQUI" }
            },
            {
                headers: {
                    Authorization: "Bearer pub_test_TMtzLyFRKH2ulwbO8kRGX9ajyXvQOpAG",
                    "Content-Type": "application/json"
                }
            }
        );

        res.json({
            success: true,
            data: respuesta.data
        });

    } catch (error) {

        res.json({
            success: false,
            error: error.response?.data || error.message
        });

    }

});

module.exports = router;