document.getElementById('formRegistro').addEventListener('submit', async (e) => {
    e.preventDefault();

    const datos = {
        nombre: document.getElementById('nombre').value,
        correo: document.getElementById('correo').value,
        contrasena: document.getElementById('contrasena').value,
        numero_telefono: document.getElementById('numero').value
    };

    try {
        const respuesta = await fetch('http://localhost:3000/registro', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(datos)
        });

        const data = await respuesta.json();

        alert(data.mensaje);

        // limpiar formulario
        document.getElementById('formRegistro').reset();

    } catch (error) {
        console.log('Error:', error);
    }
});