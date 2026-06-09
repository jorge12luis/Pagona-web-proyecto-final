document.addEventListener("DOMContentLoaded", function () {

    cargarUsuarioDesdeBackend();

    iniciarSubidaFoto();

    mostrarOcultarPassword();


   

    ActualizarDatos();
    

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
            document.getElementById("inputNombre").value = u.nombre || "";
            document.getElementById("inputApellido").value = u.apellido || "";
            document.getElementById("inputemail").value = u.correo || "";
            document.getElementById("telefono").value = u.numero_telefono || "";
            document.getElementById("inputdate").value = u.fecha_nacimiento ? u.fecha_nacimiento.split("T")[0] : "";
            document.getElementById("inputpassword").value = u.contrasena || "";
            
            // 🔥 AQUÍ CONCATENAMOS LA RUTA INTERMEDIA MANUALMENTE
            if (u.imagen) {
                const imagenes = document.querySelectorAll(".fotoPerfil");
                
                imagenes.forEach(img => {
                    // Le sumamos /uploads/perfiles/ antes del nombre del archivo
                    img.src = `http://localhost:3000/SRC/config/uploads/perfiles/${u.imagen}`;
                    img.style.display = "block"; // Nos aseguramos de que sea visible
                });

                // Ocultamos el icono gris por defecto de FontAwesome
                document.querySelectorAll(".iconoUsuario").forEach(icono => {
                    icono.style.display = "none";
                });
            }

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

        if(inputPassword.type == "password"){

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
    
}

function ActualizarDatos() {
    const usuario =
    JSON.parse(localStorage.getItem("usuarioData"));

    const btnActualizar =
    document.getElementById("BotonActualizar");

    btnActualizar.addEventListener("click", () => {

    const nombre = document.getElementById("inputNombre").value.trim();
    const apellido = document.getElementById("inputApellido").value.trim();
    const correo = document.getElementById("inputemail").value.trim();
    const celular = document.getElementById("inputcelular").value.trim();
    const clave = document.getElementById("inputpassword").value.trim();
    const fecha_nacimiento = document.getElementById("inputdate").value.trim();

    if(nombre == "" || apellido == "" || correo == "" || celular == "" || fecha_nacimiento == "" || clave == ""){
        alert("Todos los campos deben estar llenos");
        return;
    }

    const datos = {
    correo_original : usuario.correo,
    nombre,
    apellido,
    correo,
    celular,
    fecha_nacimiento,
    clave

    };
    [
   
]
    fetch("http://localhost:3000/actualizar-usuario", {

        method: "PUT",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify(datos)

    })
    .then(res => res.json())
    .then(data => {

        if(data.success){

            alert("Datos actualizados correctamente");

        }else{

            alert(data.message);

        }

    })
    .catch(err => {

        alert("ERROR MYSQL:", err);

    });
    });
}


let archivoSeleccionado = null;

function iniciarSubidaFoto() {

    const btnEditarFoto =
        document.getElementById("btnEditarFoto");

    const inputFoto =
        document.getElementById("inputFoto");

    const btnGuardarFoto =
        document.getElementById("btnGuardarFoto");

    // abrir selector
    btnEditarFoto.addEventListener("click", () => {
        inputFoto.click();
    });

    // seleccionar imagen (preview)
    inputFoto.addEventListener("change", (e) => {

    archivoSeleccionado = e.target.files[0];

    if (!archivoSeleccionado) return;

    const reader = new FileReader();

    reader.onload = function(event){

        document.querySelectorAll(".fotoPerfil").forEach(img => {
            img.src = event.target.result;
        });

    };

    reader.readAsDataURL(archivoSeleccionado);

    // 🔥 SUBE AUTOMÁTICAMENTE
    Subir_Foto_de_perfil();
});
}


// funcion para enviar imagen al backend //
function Subir_Foto_de_perfil() {

    if (!archivoSeleccionado) return;

    const usuario = JSON.parse(localStorage.getItem("usuarioData"));

    const formData = new FormData();

    formData.append("foto", archivoSeleccionado);
    formData.append("correo", usuario.correo);

    fetch("http://localhost:3000/subir-foto", {
        method: "POST",
        body: formData
    })
    .then(res => res.json())
    .then(data => {

        if (data.success) {

            alert("Foto actualizada");

            document.querySelectorAll(".fotoPerfil").forEach(img => {
                img.src = `http://localhost:3000/SRC/config/uploads/perfiles/${u.imagen}`;
                img.style.display = "block";
            });

            document.querySelectorAll(".iconoUsuario").forEach(i => {
                i.style.display = "none";
            });

        } else {
            alert("Error al subir foto");
        }

    })
    .catch(err => console.log(err));
}