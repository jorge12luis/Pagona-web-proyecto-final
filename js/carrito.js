const contenedorCarrito = document.querySelector(".carrito-items");
const subtotalHTML = document.querySelector(".fila span");
const totalHTML = document.querySelector(".total h4");

let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

function guardarCarrito() {
    localStorage.setItem("carrito", JSON.stringify(carrito));
}

function formatearPrecio(precio) {
    return "$" + precio.toLocaleString();
}

function renderizarCarrito() {

    contenedorCarrito.innerHTML = "";

    if(carrito.length === 0){

        contenedorCarrito.innerHTML = `
            <h2 class="carrito-vacio">
                Tu carrito está vacío
            </h2>
        `;

        subtotalHTML.textContent = "$0";
        totalHTML.textContent = "$0";

        return;
    }

    let subtotal = 0;

    carrito.forEach((producto, index) => {

        subtotal += producto.precio * producto.cantidad;

        contenedorCarrito.innerHTML += `
        
        <div class="item">

            <img src="${producto.imagen}">

            <div class="info">

                <h3>${producto.nombre}</h3>

                <p>${formatearPrecio(producto.precio)}</p>

                <div class="cantidad">

                    <button onclick="disminuirCantidad(${index})">-</button>

                    <span>${producto.cantidad}</span>

                    <button onclick="aumentarCantidad(${index})">+</button>

                </div>

                <a href="#" class="eliminar"
                   onclick="eliminarProducto(${index})">
                   Eliminar
                </a>

            </div>

        </div>
        
        `;
    });

    subtotalHTML.textContent = formatearPrecio(subtotal);
    totalHTML.textContent = formatearPrecio(subtotal);
}

function aumentarCantidad(index){

    carrito[index].cantidad++;

    guardarCarrito();

    renderizarCarrito();
}

function disminuirCantidad(index){

    if(carrito[index].cantidad > 1){

        carrito[index].cantidad--;

    }else{

        carrito.splice(index, 1);
    }

    guardarCarrito();

    renderizarCarrito();
}

function eliminarProducto(index){

    carrito.splice(index, 1);

    guardarCarrito();

    renderizarCarrito();
}

renderizarCarrito();