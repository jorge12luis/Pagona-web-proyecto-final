const formulario =
document.getElementById("formRegistro");

formulario.addEventListener(
"submit",
async (e)=>{

    e.preventDefault();

    const nombre =
    document.getElementById("nombre").value;

    const apellido =
    document.getElementById("apellido").value;

    const correo =
    document.getElementById("correo").value;


    const telefono =
    document.getElementById("numero").value;

    const direccion =
    document.getElementById("direccion").value;
    
 
    const respuesta = await fetch(
    "http://localhost:3000/registro",{

        method:"POST",

        headers:{
            "Content-Type":"application/json"
        },

        body: JSON.stringify({

            nombre,
            apellido,
            correo,
            contrasena,
            telefono,
            fechaNacimiento

        })

    });

    const data =
    await respuesta.text();

    alert(data);

});