document.addEventListener("DOMContentLoaded", function () {

    cargarUsuarioDesdeBackend();

    eventos();

});


function cargarUsuarioDesdeBackend() {

    let usuario = JSON.parse(localStorage.getItem("usuarioData"));

    if (!usuario) {
        alert("Debes iniciar sesión");
        return;
    }

    fetch("http://localhost:3000/usuario-perfil", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            correo: usuario.correo
        })
    })
    .then(res => res.json())
    .then(data => {

        if (data.success) {

            let u = data.usuario;
            console.log("DATA COMPLETA:", data.usuario);

            document.getElementById("inputNombre").value = u.nombre || "";
            document.getElementById("inputApellido").value = u.apellido || "";
            document.getElementById("inputemail").value = u.correo || "";
            document.getElementById("inputcelular").value = u.numero_telefono || "";
            document.getElementById("inputdate").value = u.fecha_nacimiento || "";
            document.getElementById("inputpassword").value = u.contrasena || "";

        } else {
            console.log("No se encontró usuario");
        }

    })
    .catch(err => console.log(err));
}