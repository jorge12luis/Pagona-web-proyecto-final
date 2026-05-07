console.log("JS CONECTADO");


const formulario = document.getElementById("formRegistro");

formulario.addEventListener("submit", async (e) => {

    e.preventDefault();

    const nombre = document.getElementById("nombre").value;
    const correo = document.getElementById("correo").value;
    const contrasena = document.getElementById("contrasena").value;

    console.log(nombre, correo, contrasena);

    const respuesta = await fetch("http://localhost:3000/registro", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            nombre,
            correo,
            contrasena
        })

    });

    const data = await respuesta.text();

    alert(data);

});