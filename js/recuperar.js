const buscarCorreoBtn = document.getElementById("buscarCorreoBtn");
const formRecuperar = document.getElementById("formRecuperar");
const mensaje = document.getElementById("mensaje");
const correoInput = document.getElementById("correo");

buscarCorreoBtn.addEventListener("click", async () => {
    const correo = correoInput.value.trim();

    if (!correo) {
        mensaje.innerText = "Ingresa un correo válido.";
        return;
    }

    try {
        const respuesta = await fetch("http://localhost:3000/recuperar/codigo", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ correo })
        });

        const data = await respuesta.json();

        if (respuesta.ok) {
            mensaje.innerText = data.message;
            correoInput.readOnly = true;
            formRecuperar.classList.remove("hidden");
        } else {
            mensaje.innerText = data.message || "No se pudo enviar el código. Revisa el correo.";
        }
    } catch (error) {
        console.error(error);
        mensaje.innerText = "Error de conexión con el servidor.";
    }
});

formRecuperar.addEventListener("submit", async (e) => {
    e.preventDefault();

    const correo = correoInput.value.trim();
    const codigo = document.getElementById("codigoRecuperacion").value.trim();
    const nuevaContrasena = document.getElementById("nuevaContrasena").value;
    const confirmarContrasena = document.getElementById("confirmarContrasena").value;

    if (!codigo) {
        mensaje.innerText = "Ingresa el código que recibiste.";
        return;
    }

    if (nuevaContrasena.length < 6) {
        mensaje.innerText = "La contraseña debe tener al menos 6 caracteres.";
        return;
    }

    if (nuevaContrasena !== confirmarContrasena) {
        mensaje.innerText = "Las contraseñas no coinciden.";
        return;
    }

    try {
        const respuesta = await fetch("http://localhost:3000/recuperar/cambiar", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ correo, codigo, nuevaContrasena, confirmarContrasena })
        });

        const data = await respuesta.json();

        if (respuesta.ok) {
            mensaje.innerText = data.message;
            formRecuperar.reset();
            correoInput.readOnly = false;
            formRecuperar.classList.add("hidden");
        } else {
            mensaje.innerText = data.message || "No se pudo cambiar la contraseña.";
        }
    } catch (error) {
        console.error(error);
        mensaje.innerText = "Error de conexión con el servidor.";
    }
});