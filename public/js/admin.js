// Verificar que el usuario sea administrador cuando se entra en la pagina
document.addEventListener('DOMContentLoaded', () => {
    const rol = localStorage.getItem('rolUsuario');
    const usuarioData = localStorage.getItem('usuarioData');

    // Si verifica si es admninistrador, si no lo es redirige a la pagina de inicio
    if (!rol || rol !== 'admin') {
        alert('Acceso denegado. Solo administradores pueden acceder a esta página.');
        window.location.href = 'index.html';
        return;
    }

    // Mostrar información del usuario
    if (usuarioData) {
        const usuario = JSON.parse(usuarioData);
        document.getElementById('usuario-info').textContent = 
            `Bienvenido: ${usuario.nombre} ${usuario.apellido} (${usuario.correo})`;
    }

    // Cargar lista de usuarios al iniciar
    cargarUsuarios();
});

// Cerrar sesión
function cerrarSesion() {
    localStorage.removeItem('correoUsuario');
    localStorage.removeItem('usuarioData');
    localStorage.removeItem('rolUsuario');
    window.location.href = 'login.html';
}

// Mostrar mensaje
function mostrarMensaje(elementId, mensaje, tipo) {
    const elemento = document.getElementById(elementId);
    elemento.textContent = mensaje;
    elemento.className = `mensaje ${tipo}`;
    
    // Auto-ocultar después de 5 segundos
    setTimeout(() => {
        elemento.className = 'mensaje';
    }, 5000);
}

// Cambiar rol de usuario
document.getElementById('formCambiarRol').addEventListener('submit', async (e) => {
    e.preventDefault();

    const correo = document.getElementById('correo-usuario').value.trim();
    const nuevoRol = document.getElementById('nuevo-rol').value;

    if (!correo || !nuevoRol) {
        mostrarMensaje('mensaje-cambio-rol', 'Por favor completa todos los campos', 'error');
        return;
    }

    try {
        const respuesta = await fetch('http://localhost:3000/cambiar-rol', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ correo, nuevoRol })
        });

        const data = await respuesta.json();

        if (data.success) {
            mostrarMensaje('mensaje-cambio-rol', data.message, 'exito');
            document.getElementById('formCambiarRol').reset();
            // Recargar lista de usuarios después de 1 segundo
            setTimeout(() => {
                cargarUsuarios();
            }, 1000);
        } else {
            mostrarMensaje('mensaje-cambio-rol', data.message || 'Error al cambiar rol', 'error');
        }
    } catch (error) {
        console.error(error);
        mostrarMensaje('mensaje-cambio-rol', 'Error al conectar con el servidor', 'error');
    }
});

// Cargar lista de todos los usuarios
async function cargarUsuarios() {
    try {
        const respuesta = await fetch('http://localhost:3000/obtener-usuarios', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = await respuesta.json();

        if (data.success && data.usuarios) {
            mostrarUsuariosEnTabla(data.usuarios);
        } else {
            mostrarMensaje('mensaje-usuarios', 'No se pudieron cargar los usuarios', 'error');
        }
    } catch (error) {
        console.error(error);
        mostrarMensaje('mensaje-usuarios', 'Error al conectar con el servidor', 'error');
    }
}

// Mostrar usuarios en la tabla
function mostrarUsuariosEnTabla(usuarios) {
    const tbody = document.getElementById('tbody-usuarios');
    tbody.innerHTML = '';

    if (usuarios.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #999;">No hay usuarios registrados</td></tr>';
        return;
    }

    usuarios.forEach(usuario => {
        const fila = document.createElement('tr');
        const badgeClass = usuario.rol === 'admin' ? 'badge-admin' : 'badge-usuario';
        const textoBadge = usuario.rol === 'admin' ? 'ADMIN' : 'USUARIO';
        const textoBotón = usuario.rol === 'admin' ? 'Revocar Admin' : 'Hacer Admin';
        const claseBotón = usuario.rol === 'admin' ? 'btn-cambiar btn-revocar' : 'btn-cambiar';
        const nuevoRol = usuario.rol === 'admin' ? 'usuario' : 'admin';

        fila.innerHTML = `
            <td>${usuario.id || 'N/A'}</td>
            <td>${usuario.nombre || 'N/A'}</td>
            <td>${usuario.apellido || 'N/A'}</td>
            <td>${usuario.correo}</td>
            <td><span class="badge ${badgeClass}">${textoBadge}</span></td>
            <td>
                <button class="${claseBotón}" onclick="cambiarRolDirecto('${usuario.correo}', '${nuevoRol}')">
                    ${textoBotón}
                </button>
            </td>
        `;
        tbody.appendChild(fila);
    });
}

// Cambiar rol directamente desde la tabla
async function cambiarRolDirecto(correo, nuevoRol) {
    if (!confirm(`¿Estás seguro de cambiar el rol a ${nuevoRol === 'admin' ? 'ADMINISTRADOR' : 'USUARIO'}?`)) {
        return;
    }

    try {
        const respuesta = await fetch('http://localhost:3000/cambiar-rol', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ correo, nuevoRol })
        });

        const data = await respuesta.json();

        if (data.success) {
            mostrarMensaje('mensaje-usuarios', data.message, 'exito');
            cargarUsuarios();
        } else {
            mostrarMensaje('mensaje-usuarios', data.message || 'Error al cambiar rol', 'error');
        }
    } catch (error) {
        console.error(error);
        mostrarMensaje('mensaje-usuarios', 'Error al conectar con el servidor', 'error');
    }
}
