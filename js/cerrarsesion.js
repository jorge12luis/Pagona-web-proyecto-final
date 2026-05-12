function cerrarSesion() {
    const confirmacion = confirm("¿Estás seguro de que deseas cerrar sesión?");
    if (confirmacion) {
        localStorage.removeItem("usuarioData");
        localStorage.removeItem("correoUsuario ");
                window.location.href = "login.html";

        
        alert("Has cerrado sesión exitosamente.");
    }   
}   