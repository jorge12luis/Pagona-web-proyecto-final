
// Contenedor donde aparecerán los productos del carrito
const contenedorCarrito = document.querySelector(".carrito-items");

// Elemento HTML donde se mostrará el subtotal
const subtotalHTML = document.querySelector(".fila span");

const totalHTML = document.querySelector(".total h4");


// Arreglo para almacenar los productos del carrito
let carrito = [];

let carritoGuardado = localStorage.getItem("carrito");

// Verificar si hay un carrito guardado en localStorage
if (carritoGuardado != null) {

    carrito = JSON.parse(carritoGuardado);

} else {
    carrito = [];
}


function guardarCarrito() {

    // Convertir arreglo a texto JSON
    let carritoTexto = JSON.stringify(carrito);

    localStorage.setItem("carrito", carritoTexto);
}

function formatearPrecio(precio) {

    let precioFormateado = "$" + precio.toLocaleString();

    return precioFormateado;
}

function renderizarCarrito() {

    contenedorCarrito.innerHTML = "";

    
    if (carrito.length == 0) {

        // Mostrar mensaje
        contenedorCarrito.innerHTML = `
            <h2 class="carrito-vacio">
                Tu carrito está vacío
            </h2>
        `;

        // Mostrar valores en 0
        subtotalHTML.textContent = "$0";
        totalHTML.textContent = "$0";

        return;
    }

    let subtotal = 0;

//recorrer producto 1 porr 1
    for (let i = 0; i < carrito.length; i++) {

        

        let totalProducto = producto.precio * producto.cantidad;

        subtotal = subtotal + totalProducto;

        let productoHTML = `
        
            <div class="item">

                <!-- Imagen -->
                <img src="${producto.imagen}">

                <div class="info">

                    <!-- Nombre -->
                    <h3>${producto.nombre}</h3>

                    <!-- Precio -->
                    <p>${formatearPrecio(producto.precio)}</p>

                    <!-- Cantidad -->
                    <div class="cantidad">

                        <!-- Botón disminuir -->
                        <button onclick="disminuirCantidad(${i})">
                            -
                        </button>

                        <!-- Cantidad actual -->
                        <span>${producto.cantidad}</span>

                        <!-- Botón aumentar -->
                        <button onclick="aumentarCantidad(${i})">
                            +
                        </button>

                    </div>

                    <!-- Eliminar producto -->
                    <a href="#"
                       class="eliminar"
                       onclick="eliminarProducto(${i})">

                       Eliminar

                    </a>

                </div>

            </div>

        `;

        // Agregar HTML al contenedor
        contenedorCarrito.innerHTML =
            contenedorCarrito.innerHTML + productoHTML;
    }
    subtotalHTML.textContent = formatearPrecio(subtotal);

    totalHTML.textContent = formatearPrecio(subtotal);
}

function aumentarCantidad(indiceProducto) {

    let cantidadActual = carrito[indiceProducto].cantidad;

    cantidadActual = cantidadActual + 1;

    carrito[indiceProducto].cantidad = cantidadActual;

    guardarCarrito();

    renderizarCarrito();
}

function disminuirCantidad(indiceProducto) {

    let cantidadActual = carrito[indiceProducto].cantidad;
    if (cantidadActual > 1) {

        cantidadActual = cantidadActual - 1;

        carrito[indiceProducto].cantidad = cantidadActual;

    } else {

        carrito.splice(indiceProducto, 1);
    }

    guardarCarrito();

    renderizarCarrito();
}
function eliminarProducto(indiceProducto) {

    carrito.splice(indiceProducto, 1);

    guardarCarrito();

    renderizarCarrito();
}


renderizarCarrito();