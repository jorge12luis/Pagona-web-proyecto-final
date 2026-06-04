document.addEventListener("DOMContentLoaded", function () {
    Mostrarcontrasena();
    Mostrarconfirmarcontrasena();

});

const formulario = document.getElementById("formRegistro");

formulario.addEventListener(
"submit",
async (e)=>{

    e.preventDefault();

    console.log("Se hizo submit");

    const nombre =
    document.getElementById("nombre").value;

    const apellido =
    document.getElementById("apellido").value;

    const correo =
    document.getElementById("correo").value;

    const clave =
    document.getElementById("clave").value;

    const confirmarclave =
    document.getElementById("confirmarclave").value;

    const telefono =
    document.getElementById("numero").value;

    const date = 
    document.getElementById("diaNacimiento").value;

    const direccion =
    document.getElementById("direccion").value;
 
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
            clave,
            confirmarclave,
            telefono,
            date,
            direccion

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

function Mostrarcontrasena() {
    const toggleClave = document.getElementById("toggleClave");
    const claveInput = document.getElementById("clave");

    toggleClave.addEventListener("click", () => {

    if (claveInput.type === "password") {
        claveInput.type = "text";
        toggleClave.classList.remove("fa-eye");
        toggleClave.classList.add("fa-eye-slash");
    } else {
        claveInput.type = "password";
        toggleClave.classList.remove("fa-eye-slash");
        toggleClave.classList.add("fa-eye");
    }

});
    
}
function Mostrarconfirmarcontrasena() {
    const toggleConfirmar = document.getElementById("toggleConfirmar");
    const confirmarInput = document.getElementById("confirmarclave");

    toggleConfirmar.addEventListener("click", () => {

    if (confirmarInput.type === "password") {
        confirmarInput.type = "text";
        toggleConfirmar.classList.remove("fa-eye");
        toggleConfirmar.classList.add("fa-eye-slash");
    } else {
        confirmarInput.type = "password";
        toggleConfirmar.classList.remove("fa-eye-slash");
        toggleConfirmar.classList.add("fa-eye");
    }

});
}