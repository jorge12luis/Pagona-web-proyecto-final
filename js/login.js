document.getElementById('formLogin').addEventListener('submit', async (e) => {
    e.preventDefault();

    const datos = {
        correo: document.getElementById('correo').value,
        contrasena: document.getElementById('contrasena').value
    };

    try {
        const respuesta = await fetch('http://localhost:3000/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(datos)
        });

        const data = await respuesta.json();

        if (respuesta.ok) {

            alert('Bienvenido ' + data.usuario.nombre);

            // 🔥 guardar usuario en sesión (opcional)
            localStorage.setItem('usuario', JSON.stringify(data.usuario));

            // 🚀 REDIRECCIÓN A LA PÁGINA PRINCIPAL
            window.location.href = "inicio.html";

        } else {
            alert(data.mensaje);
        }

    } catch (error) {
        console.log(error);
        alert('Error de conexión');
    }
});