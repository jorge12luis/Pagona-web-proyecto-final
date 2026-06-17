document.addEventListener("DOMContentLoaded", function () {
    Mostrarcontrasena();
    Mostrarconfirmarcontrasena();
});

const formulario = document.getElementById("formRegistro");

formulario.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nombre         = document.getElementById("nombre").value;
    const apellido       = document.getElementById("apellido").value;
    const tipo_documento = document.getElementById("tipoDocumento").value;
    const numero_documento = document.getElementById("numeroDocumento").value;
    const correo         = document.getElementById("correo").value;
    const clave          = document.getElementById("clave").value;
    const confirmarclave = document.getElementById("confirmarclave").value;
    const telefono       = document.getElementById("numero").value;
    const date           = document.getElementById("diaNacimiento").value;
    const direccion      = document.getElementById("direccion").value;

    // Validar que las contraseñas coincidan
    if (clave !== confirmarclave) {
        alert("Las contraseñas no coinciden");
        return;
    }

    // Validar que eligió tipo de documento
    if (!tipo_documento) {
        alert("Selecciona un tipo de documento");
        return;
    }

    // Validar que el documento solo tenga números
    if (!/^\d+$/.test(numero_documento)) {
        alert("El número de documento solo debe contener números");
        return;
    }

    const respuesta = await fetch("http://localhost:3000/registro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            nombre,
            apellido,
            tipo_documento,
            numero_documento,
            correo,
            contrasena: clave,
            numero_telefono: telefono,
            fecha_nacimiento: date,
            direccion
        })
    });

    const data = await respuesta.json();

    if (respuesta.ok && data.success) {
        alert("Registro exitoso. Bienvenido a Dunaka!");
        formulario.reset();
        window.location.href = "login.html";
    } else {
        alert(data.message || "Error al registrarse");
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