const productos = [
    { nombre: "Bolso tejido", precio: 120000, imagen: "img/bolso1.jpg" },
    { nombre: "Bolso elegante", precio: 90000, imagen: "img/bolso2.jpg" },
    { nombre: "Mochila", precio: 150000, imagen: "img/bolso3.jpg" },

    { nombre: "Bolso artesanal", precio: 80000, imagen: "img/bolso4.jpg" },
    { nombre: "Bolso premium", precio: 200000, imagen: "img/bolso5.jpg" }
];

const contenedor = document.getElementById("productos");

// MOSTRAR PRODUCTOS
productos.forEach(p => {
    contenedor.innerHTML += `
        <div class="cards">
            <img src="${p.imagen}" width="100%" onclick="verProducto('${p.nombre}', ${p.precio}, '${p.imagen}')">
            <h3 onclick="verProducto('${p.nombre}', ${p.precio}, '${p.imagen}')">${p.nombre}</h3>
            <p>$${p.precio}</p>

            <button onclick="agregarCarrito('${p.nombre}', ${p.precio}, '${p.imagen}')">
                Agregar
            </button>
        </div>
    `;
});

// IR A DETALLE
function verProducto(nombre, precio, imagen) {

    const producto = { nombre, precio, imagen };

    localStorage.setItem("productoSeleccionado", JSON.stringify(producto));

    window.location.href = "page/producto.html";
}

// AGREGAR AL CARRITO
function agregarCarrito(nombre, precio, imagen) {

    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

    carrito.push({ nombre, precio, imagen });

    localStorage.setItem("carrito", JSON.stringify(carrito));

    actualizarContador();
}

// ACTUALIZAR CONTADOR
function actualizarContador() {
    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    document.getElementById("contador").textContent = carrito.length;
}

actualizarContador();

const video = document.getElementById("videoDunaka");

// más lento
video.playbackRate = 1.10;