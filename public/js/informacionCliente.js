document.getElementById("formRegistro").addEventListener("submit", async function(e){
    e.preventDefault();
    
    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    
    let total = 0;
    
    carrito.forEach(producto => {
        total += Number(producto.precio) * Number(producto.cantidad);
    });
    
    const amountInCents = String(total * 100);
    const currency = "COP";
    const reference = "DUNAKA-" + Date.now();
    const publicKey = "pub_test_TMtzLyFRKH2ulwbO8kRGX9ajyXvQOpAG";
    const integritySecret = "test_integrity_SI1ltUwxeAkxE6lOToI0JOXXqDKVToVY";
    
    const respuesta = await fetch(`https://sandbox.wompi.co/v1/merchants/${publicKey}`);
    const data = await respuesta.json();
    const acceptanceToken = data.data.presigned_acceptance.acceptance_token;
    
    const signature = CryptoJS.SHA256(
        reference +
        amountInCents +
        currency +
        integritySecret
    ).toString();
    
    console.log(signature);
    
    const url = `https://checkout.wompi.co/p/?public-key=${publicKey}&currency=${currency}&amount-in-cents=${amountInCents}&reference=${reference}&signature:integrity=${signature}&acceptance-token=${acceptanceToken}`;
    
    const usuario = JSON.parse(localStorage.getItem("usuarioData")) || JSON.parse(localStorage.getItem("usuario"));
    
    await fetch("http://localhost:3000/guardar-compra", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            usuarioId: 1,
            carrito: carrito,
            total: total
        })
    });
    
    window.location.href = url;
});
