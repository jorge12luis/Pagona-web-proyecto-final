const contenedor = document.getElementById("detalleProducto");

const producto = JSON.parse(localStorage.getItem("productoSeleccionado"));

contenedor.innerHTML = `
    <img src="../${producto.imagen}" width="300">
    <h2>${producto.nombre}</h2>
    <p>$${producto.precio}</p>
`;

// AGREGAR DESDE DETALLE
function agregarCarrito() {

    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

    carrito.push(producto);

    localStorage.setItem("carrito", JSON.stringify(carrito));

    alert("Producto agregado al carrito 🛒");
}