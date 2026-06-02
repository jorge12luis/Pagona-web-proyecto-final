
function comprarAhora() {

    console.log("Botón comprar funcionando");

    // verificar login
    const usuario = localStorage.getItem("usuarioData");

    if (!usuario) {

        alert("Debes iniciar sesión");

        window.location.href = "../login.html";

        return;
    }

    // obtener producto actual
    const producto = {

        nombre: document.getElementById("productoTitulo").textContent,

        precio: document.getElementById("productoPrecio")
            .textContent
            .replace("$", "")
            .replace(/\./g, ""),

        imagen: document.getElementById("productoImagen").src
    };

    // guardar producto temporal
    localStorage.setItem(
        "productoComprar",
        JSON.stringify(producto)
    );

    // redirigir
    window.location.href = "../informacionCliente.html";
}

