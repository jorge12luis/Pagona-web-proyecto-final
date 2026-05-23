const formulario =
document.getElementById("formRegistro");

formulario.addEventListener(
"submit",
async (e)=>{

    e.preventDefault();

    const nombre =
    document.getElementById("nombre").value;

    const apellido =
    document.getElementById("apellido").value;

    const correo =
    document.getElementById("correo").value;

    const contrasena =
    document.getElementById("contrasena").value;

    const confirmarContrasena =
    document.getElementById("confirmarContrasena").value;

    const telefono =
    document.getElementById("numero").value;

    const fechaNacimiento =
    document.getElementById(
    "diaNacimiento"
    ).value;

    if (contrasena !== confirmarContrasena) {
        alert("Las contraseñas no coinciden.");
        return;
    }

    if (!correo.toLowerCase().endsWith("@gmail.com")) {
        alert("Debes registrar un correo con @gmail.com.");
        return;
    }

    const respuesta = await fetch(
    "http://localhost:3000/registro",{

        method:"POST",

        headers:{
            "Content-Type":"application/json"
        },

        body: JSON.stringify({

            nombre,
            apellido,
            correo,
            contrasena,
            telefono,
            fechaNacimiento

        })

    });

    if (respuesta.ok) {
        const data =
        await respuesta.text();

        alert(data);

        formulario.reset();

        window.location.href = "login.html";
    } else {
        alert("Error al registrarse");
    }
});