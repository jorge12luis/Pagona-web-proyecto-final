const formulario = document.getElementById("formLogin");

formulario.addEventListener("submit", async (e) => {
    e.preventDefault();

    const correo = document.getElementById("correo").value.trim();
    const contrasena = document.getElementById("contrasena").value.trim();

    try {
        const respuesta = await fetch("http://localhost:3000/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ correo, contrasena })
        });

        const data = await respuesta.json();

        if (data.success) {
            localStorage.setItem("correoUsuario", correo);
            localStorage.setItem("usuarioData", JSON.stringify(data.usuario));
            window.location.href = "index.html";
            return;
        }

        alert(data.message || "Error al iniciar sesión");
    } catch (error) {
        console.error(error);
        alert("No se pudo conectar con el servidor. Asegúrate de que el backend esté corriendo en localhost:3000.");
    }
});