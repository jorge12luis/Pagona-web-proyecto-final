document.addEventListener("DOMContentLoaded", function () {

    cargarUsuarioDesdeBackend();

    mostrarOcultarPassword();

    mostrarFotoPerfil();

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
            document.getElementById("inputdate").value = u.fecha_nacimiento.split("T")[0];
            document.getElementById("inputpassword").value = u.contrasena || "";
            

        } else {
            console.log("No se encontró usuario");
        }

    })
    .catch(err => console.log(err));
}

function mostrarOcultarPassword(){

    const togglePassword = document.getElementById("togglePassword");
    const inputPassword = document.getElementById("inputpassword");

    togglePassword.addEventListener("click", () => {

        if(inputPassword.type === "password"){

            inputPassword.type = "text";

            togglePassword.classList.remove("fa-eye");
            togglePassword.classList.add("fa-eye-slash");

        }else{

            inputPassword.type = "password";

            togglePassword.classList.remove("fa-eye-slash");
            togglePassword.classList.add("fa-eye");

        }

    });

}

function mostrarFotoPerfil(){

    const btnEditarFoto =
    document.getElementById("btnEditarFoto");

    const inputFoto =
    document.getElementById("inputFoto");

    btnEditarFoto.addEventListener("click", () => {

        inputFoto.click();

    });

    inputFoto.addEventListener("change", (e) => {

        const archivo = e.target.files[0];

        if(!archivo) return;

        const reader = new FileReader();

        reader.onload = function(event){

            const imagenes =
            document.querySelectorAll(".fotoPerfil");

            const iconos =
            document.querySelectorAll(".iconoUsuario");

            imagenes.forEach(img => {

                img.src = event.target.result;
                img.style.display = "block";

            });

            iconos.forEach(icono => {

                icono.style.display = "none";

            });

        };

        reader.readAsDataURL(archivo);

    });

}