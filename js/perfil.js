document.addEventListener('DOMContentLoaded', function() {
    // Intentar obtener sesión desde MySQL o Google
    let usuarioData = localStorage.getItem('usuarioData');
    let usuarioGoogle = localStorage.getItem('usuarioGoogle');

    // SI NO HAY NINGUNA SESIÓN ACTIVA, MANDAR AL LOGIN
    if (!usuarioData && !usuarioGoogle) {
        alert('Por favor inicia sesión primero');
        window.location.href = 'login.html';
        return;
    }

    try {
        let usuario;

        // Validar qué tipo de sesión está activa
        if (usuarioGoogle) {
            usuario = JSON.parse(usuarioGoogle);
        } else {
            usuario = JSON.parse(usuarioData);
        }

        // Pintar Nombre y Correo en la interfaz
        document.getElementById('nombreUsuario').textContent = usuario.nombre || 'Sin nombre';
        document.getElementById('correoUsuario').textContent = usuario.correo || 'Sin correo';

        // Generar Iniciales del Avatar de manera dinámica
        if (usuario.nombre) {
            const iniciales = usuario.nombre
                .trim()
                .split(' ')
                .map(palabra => palabra[0])
                .join('')
                .toUpperCase()
                .substring(0, 2); // Tomar máximo 2 letras
            
            document.getElementById('avatarInicial').textContent = iniciales;
        } else {
            document.getElementById('avatarInicial').textContent = 'UN';
        }

    } catch (error) {
        console.error("Error al procesar los datos de sesión:", error);
        document.getElementById('nombreUsuario').textContent = 'Error al cargar';
    }
});

// FUNCIÓN PARA CERRAR SESIÓN
function cerrarSesion() {
    const confirmar = confirm("¿Estás seguro que deseas cerrar sesión?");
    if (confirmar) {
        // Limpiar llaves de MySQL
        localStorage.removeItem("usuarioData");
        localStorage.removeItem("correoUsuario");
        localStorage.removeItem("rolUsuario");
        
        // Limpiar llaves de Google
        localStorage.removeItem("usuarioGoogle");

        alert("Sesión cerrada correctamente");
        window.location.href = "login.html";
    }
}