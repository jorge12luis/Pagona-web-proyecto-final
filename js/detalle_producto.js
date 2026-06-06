
const productos = {

    "bolso-manhattan": {
        id: 4,
        title: "Bolso Manhattan",
        image: "../img/bolso1.webp",
        description: "Bolso de mano elegante con acabado en cuero sintético y herrajes dorados.",
        price: "$120.000",
        extra: "o 3 cuotas sin interés",
        stock: 10,
        label: "Bolsos"
    },

    "mochila-urban": {
        title: "Mochila Urban",
        image: "../img/mochila.jpg",
        description: "Mochila práctica y con estilo, ideal para el día a día y viajes cortos.",
        price: "$145.000",
        extra: "Incluye garantía de calidad",
        stock: 7,
        label: "Mochilas"
    },

    "cartera-noche": {
        title: "Cartera Noche",
        image: "../img/bolso2.webp",
        description: "Cartera de noche sofisticada con diseño minimalista y cierre seguro.",
        price: "$150.000",
        extra: "Perfecta para eventos especiales",
        stock: 5,
        label: "Carteras"
    },

    "bolso-noir": {
        title: "Bolso Noir",
        image: "../img/bolso10.jpg",
        description: "Bolso exclusivo con líneas modernas y tejido premium.",
        price: "$160.000",
        extra: "Edición especial",
        stock: 2,
        label: "Edición limitada"
    },

    "bolso-aurora": {
        title: "Bolso Aurora",
        image: "../img/bolso10.jpg",
        description: "Diseño luminoso con detalles cuidados, pensado para looks frescos.",
        price: "$120.000",
        extra: "Colección Primavera 2026",
        stock: 8,
        label: "Nuevas Colecciones"
    },

    "bolso-elegance": {
        title: "Bolso Elegance",
        image: "../img/bolso2.webp",
        description: "Diseño minimalista de líneas puras y materiales suaves.",
        price: "$145.000",
        extra: "Look sofisticado",
        stock: 6,
        label: "Nuevas Colecciones"
    },

    "bolso-soft-beige": {
        title: "Bolso Soft Beige",
        image: "../img/bolso6.webp",
        description: "Bolso con tonos suaves y un estilo natural que combina con todo.",
        price: "$135.000",
        extra: "Elegancia natural",
        stock: 4,
        label: "Nuevas Colecciones"
    },

    "golden-edition": {
        title: "Golden Edition",
        image: "../img/banner1.jpg",
        description: "Edición exclusiva con detalles dorados y acabado premium.",
        price: "$210.000",
        extra: "Unidades limitadas",
        stock: 1,
        label: "Edición limitada"
    },

    "black-luxe": {
        title: "Black Luxe",
        image: "../img/bolso9.jpg",
        description: "Bolso de diseño oscuro y sofisticado para un estilo nocturno impecable.",
        price: "$250.000",
        extra: "Diseño premium",
        stock: 3,
        label: "Edición limitada"
    },

    "velvet-night": {
        title: "Velvet Night",
        image: "../img/bolso10.jpg",
        description: "Bolso con textura aterciopelada y un acabado de lujo.",
        price: "$230.000",
        extra: "Serie numerada",
        stock: 0,
        label: "Edición limitada"
    },

    "ivory-luxe": {
        title: "Ivory Luxe",
        image: "../img/bolso4.webp",
        description: "Bolso exclusivo en tonos marfil con estilo atemporal.",
        price: "$275.000",
        extra: "Últimas unidades",
        stock: 2,
        label: "Edición limitada"
    }
};

const params = new URLSearchParams(window.location.search);

const productoId = params.get("producto");

const producto = productos[productoId];

const botonComprar = document.querySelector(".btn-comprar");

if (!producto) {

    document.getElementById("productoTitulo").textContent =
        "Producto no encontrado";

    document.getElementById("productoDescripcion").textContent =
        "No se encontró la información de este producto. Regresa a la colección y selecciona otro.";

    document.getElementById("productoImagen").src =
        "../img/bolso10.jpg";

    document.getElementById("productoImagen").alt =
        "Producto no encontrado";

    document.getElementById("productoStock").textContent =
        "No disponible";

    document.getElementById("productoEstado").textContent =
        "No encontrado";

    document.getElementById("productoPrecio").textContent =
        "-";

    document.getElementById("productoExtra").textContent =
        "";

} else {

    document.getElementById("productoImagen").src =
        producto.image;

    document.getElementById("productoImagen").alt =
        producto.title;

    document.getElementById("productoEstado").textContent =
        producto.label;

    document.getElementById("productoTitulo").textContent =
        producto.title;

    document.getElementById("productoDescripcion").textContent =
        producto.description;

    document.getElementById("productoPrecio").textContent =
        producto.price;

    document.getElementById("productoExtra").textContent =
        producto.extra;

    document.getElementById("productoStock").textContent =
        producto.stock > 0
            ? `Stock disponible (${producto.stock})`
            : "Agotado";

    if (producto.stock <= 0 && botonComprar) {

        botonComprar.disabled = true;

        botonComprar.textContent = "Agotado";

        botonComprar.style.opacity = "0.6";

        botonComprar.style.cursor = "not-allowed";
    }
}

// ====================
// SISTEMA DE RESEÑAS
// ====================

let calificacionSeleccionada = 0;

window.seleccionarEstrella = function(valor){

    calificacionSeleccionada = valor;

    const estrellas =
    document.querySelectorAll(".estrellas span");

    estrellas.forEach((estrella,index)=>{

        estrella.style.opacity =
        index < valor ? "1" : "0.3";

    });

}

window.agregarResena = async function(){

    const comentario =
    document.getElementById("comentario").value;

    if(calificacionSeleccionada === 0){

        alert("Selecciona una calificación");

        return;
    }

    if(comentario.trim() === ""){

        alert("Escribe una reseña");

        return;
    }

    const usuario =
    JSON.parse(localStorage.getItem("usuarioData"))
    ||
    JSON.parse(localStorage.getItem("usuario"));

    if(!usuario){

        alert("Debes iniciar sesión");

        return;
    }

    try{

        const respuesta = await fetch(
            "http://localhost:3000/agregar-resena",
            {
                method:"POST",

                headers:{
                    "Content-Type":"application/json"
                },

                body:JSON.stringify({

                    producto_id: productoId,

                    usuario_correo: usuario.correo,

                    usuario_nombre: usuario.nombre,

                    comentario: comentario,

                    calificacion: calificacionSeleccionada

                })
            }
        );

        const data =
        await respuesta.json();

        alert(data.message);

        document.getElementById(
            "comentario"
        ).value = "";

        calificacionSeleccionada = 0;

        document
        .querySelectorAll(".estrellas span")
        .forEach(estrella => {

            estrella.style.opacity = "1";

        });

        cargarResenas();

    }catch(error){

        console.log(error);

        alert("Error guardando reseña");

    }

}

async function cargarResenas(){

    try{

        const respuesta = await fetch(
            `http://localhost:3000/obtener-resenas/${productoId}`
        );

        const data =
        await respuesta.json();

        const lista =
        document.getElementById("listaResenas");

        lista.innerHTML = "";

        if(!data.resenas) return;

        data.resenas.forEach(resena=>{

            lista.innerHTML += `

                <div class="resena-item">

                    <strong>
                        ${resena.usuario_nombre}
                    </strong>

                    <p>
                        ${"⭐".repeat(
                            resena.calificacion
                        )}
                    </p>

                    <p>
                        ${resena.comentario}
                    </p>

                    <hr>

                </div>

            `;

        });

    }catch(error){

        console.log(error);

    }

}

cargarResenas();

// Exponer variables al ámbito global para que scripts inline las puedan usar
window.producto = producto;
window.productoId = productoId;