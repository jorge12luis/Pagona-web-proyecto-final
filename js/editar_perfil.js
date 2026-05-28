document.addEventListener(
    'DOMContentLoaded',
    function(){

    Mostrar_datos_personales();

    eventos();

});


function Mostrar_datos_personales() {
    // OBTENER USUARIO
    let datos_usuario = localStorage.getItem('usuarioData');

    // VALIDAR
    if(!datos_usuario){

        alert(
            'Debes iniciar sesión'
        );

        return;
    }

    // CONVERTIR A OBJETO
    let usuario =
    JSON.parse(datos_usuario);

    // LLENAR INPUTS
    document.getElementById(
        'inputNombre'
    ).value =
    usuario.nombre || '';

    document.getElementById(
        'inputCorreo'
    ).value =
    usuario.correo || '';  
}