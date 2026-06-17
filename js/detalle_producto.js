const params = new URLSearchParams(window.location.search);
const productoSlug = params.get("producto");
const botonComprar = document.querySelector(".btn-comprar");

let producto = null;

async function cargarProducto() {
    try {
        const respuesta = await fetch(`http://localhost:3000/producto/${productoSlug}`);
        const data = await respuesta.json();

        if (!data.success) {
            mostrarProductoNoEncontrado();
            return;
        }

        producto = data.producto;
        window.producto = producto;

       let rutaImagen = "../img/bolso10.jpg";

        if (producto.imagen) {

            if (producto.imagen.startsWith("/uploads")) {
                rutaImagen = `http://localhost:3000${producto.imagen}`;
            } else {
                rutaImagen = `../${producto.imagen}`;
            }

        }
        document.getElementById("productoImagen").src = rutaImagen || "../img/bolso10.jpg";
        document.getElementById("productoImagen").alt = producto.nombre;
        document.getElementById("productoTitulo").textContent = producto.nombre;
        document.getElementById("productoDescripcion").textContent = producto.descripcion || "";
        document.getElementById("productoPrecio").textContent = `$${Number(producto.precio).toLocaleString("es-CO")}`;
        document.getElementById("productoExtra").textContent = producto.estado || "";
        document.getElementById("productoEstado").textContent = producto.estado || "";
        document.getElementById("productoStock").textContent =
            producto.stock > 0 ? `Stock disponible (${producto.stock})` : "Agotado";

        if (producto.stock <= 0 && botonComprar) {
            botonComprar.disabled = true;
            botonComprar.textContent = "Agotado";
            botonComprar.style.opacity = "0.6";
            botonComprar.style.cursor = "not-allowed";
        }

        // Manejo de colores
        const selectorColor = document.querySelector(".selector-color");
        if (!producto.colores) {
            selectorColor.style.display = "none";
        } else {
            selectorColor.style.display = "block";
            const coloresDisponibles = producto.colores.split(",").map(c => c.trim());
            document.querySelectorAll(".color").forEach(span => {
                span.style.display = coloresDisponibles.includes(span.dataset.color) ? "inline-block" : "none";
            });
        }

        cargarResenas();

    } catch (error) {
        console.log(error);
        mostrarProductoNoEncontrado();
    }
}

function mostrarProductoNoEncontrado() {
    document.getElementById("productoTitulo").textContent = "Producto no encontrado";
    document.getElementById("productoDescripcion").textContent = "Regresa a la colección y selecciona otro.";
    document.getElementById("productoImagen").src = "../img/bolso10.jpg";
    document.getElementById("productoStock").textContent = "No disponible";
    document.getElementById("productoEstado").textContent = "No encontrado";
    document.getElementById("productoPrecio").textContent = "-";
    document.getElementById("productoExtra").textContent = "";
}

cargarProducto();

let calificacionSeleccionada = 0;

window.seleccionarEstrella = function(valor) {
    calificacionSeleccionada = valor;
    document.querySelectorAll(".estrellas span").forEach((estrella, index) => {
        estrella.style.opacity = index < valor ? "1" : "0.3";
    });
};

window.agregarResena = async function() {
    const comentario = document.getElementById("comentario").value;

    if (calificacionSeleccionada === 0) {
        alert("Selecciona una calificación");
        return;
    }

    if (comentario.trim() === "") {
        alert("Escribe una reseña");
        return;
    }

    const usuario = JSON.parse(localStorage.getItem("usuarioData")) || JSON.parse(localStorage.getItem("usuario"));

    if (!usuario) {
        alert("Debes iniciar sesión");
        return;
    }

    try {
        const respuesta = await fetch("http://localhost:3000/agregar-resena", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                producto_id: producto.id,
                usuario_correo: usuario.correo,
                usuario_nombre: usuario.nombre,
                comentario: comentario,
                calificacion: calificacionSeleccionada
            })
        });

        const data = await respuesta.json();
        alert(data.message);

        document.getElementById("comentario").value = "";
        calificacionSeleccionada = 0;
        document.querySelectorAll(".estrellas span").forEach(estrella => {
            estrella.style.opacity = "1";
        });

        cargarResenas();

    } catch (error) {
        console.log(error);
        alert("Error guardando reseña");
    }
};

async function cargarResenas() {
    try {
        const respuesta = await fetch(`http://localhost:3000/obtener-resenas/${producto.id}`);
        const data = await respuesta.json();
        const lista = document.getElementById("listaResenas");
        lista.innerHTML = "";

        if (!data.resenas) return;

        data.resenas.forEach(resena => {
            lista.innerHTML += `
                <div class="resena-item">
                    <strong>${resena.usuario_nombre}</strong>
                    <p>${"⭐".repeat(resena.calificacion)}</p>
                    <p>${resena.comentario}</p>
                    <hr>
                </div>
            `;
        });

    } catch (error) {
        console.log(error);
    }
}

window.producto = producto;
window.productoId = productoSlug;