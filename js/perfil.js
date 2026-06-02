
document.addEventListener(
    'DOMContentLoaded',
    function() {

    // MYSQL
    let usuarioData =
    localStorage.getItem('usuarioData');

    // GOOGLE
    let usuarioGoogle =
    localStorage.getItem('usuarioGoogle');

    // SI NO HAY NINGUNO
    if(!usuarioData && !usuarioGoogle){

        alert(
            'Por favor inicia sesión primero'
        );

        window.location.href =
        'login.html';

        return;
    }

    try{

        let usuario;

        // SI ES GOOGLE
        if(usuarioGoogle){

            usuario =
            JSON.parse(usuarioGoogle);

        }else{

            usuario =
            JSON.parse(usuarioData);

        }

        // NOMBRE
        document.getElementById(
            'nombreUsuario'
        ).textContent =
        usuario.nombre || 'Sin nombre';

        // CORREO
        document.getElementById(
            'correoUsuario'
        ).textContent =
        usuario.correo || 'Sin correo';

        // INICIALES
        const iniciales =
        usuario.nombre
        .split(' ')
        .map(palabra => palabra[0])
        .join('')
        .toUpperCase();

        document.getElementById(
            'avatarInicial'
        ).textContent =
        iniciales;

    }catch(error){

        console.log(error);

        document.getElementById(
            'nombreUsuario'
        ).textContent =
        'Error al cargar';

    }

});


// CERRAR SESIÓN
function cerrarSesion(){

    const confirmar = confirm(
        "¿Estás seguro que deseas cerrar sesión?"
    );

    if(confirmar){

        // MYSQL
        localStorage.removeItem(
            "usuarioData"
        );

        localStorage.removeItem(
            "correoUsuario"
        );

        localStorage.removeItem(
            "rolUsuario"
        );

        // GOOGLE
        localStorage.removeItem(
            "usuarioGoogle"
        );

        alert(
            "Sesión cerrada correctamente"
        );

        window.location.href =
        "login.html";

    }

}

