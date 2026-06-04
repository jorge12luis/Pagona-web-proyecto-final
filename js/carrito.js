// ===============================
// VARIABLES GLOBALES
// ===============================

// Contenedor donde aparecerán los productos del carrito
const contenedorCarrito = document.querySelector(".carrito-items");

// Elemento HTML donde se mostrará el subtotal
const subtotalHTML = document.querySelector(".fila span");

// Elemento HTML donde se mostrará el total
const totalHTML = document.querySelector(".total h4");


// ===============================
// CARGAR DATOS DEL LOCALSTORAGE
// ===============================

// Variable principal del carrito
let carrito = [];

// Obtener información guardada
let carritoGuardado = localStorage.getItem("carrito");

// Verificar si existe información guardada
if (carritoGuardado != null) {

    // Convertir el texto JSON a arreglo
    carrito = JSON.parse(carritoGuardado);

} else {

    // Si no hay datos, crear arreglo vacío
    carrito = [];
}


// ===============================
// FUNCIÓN GUARDAR CARRITO
// ===============================

// Esta función guarda el carrito en localStorage
function guardarCarrito() {

    // Convertir arreglo a texto JSON
    let carritoTexto = JSON.stringify(carrito);

    // Guardar información
    localStorage.setItem("carrito", carritoTexto);
}


// ===============================
// FUNCIÓN FORMATEAR PRECIO
// ===============================

// Esta función recibe un número
// y devuelve el precio con formato
function formatearPrecio(precio) {

    let precioFormateado = "$" + precio.toLocaleString();

    return precioFormateado;
}


// ===============================
// FUNCIÓN MOSTRAR CARRITO
// ===============================

// Esta función pinta todos los productos
function renderizarCarrito() {

    // Limpiar contenido anterior
    contenedorCarrito.innerHTML = "";

    // ===============================
    // VALIDAR SI EL CARRITO ESTÁ VACÍO
    // ===============================

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

        // Salir de la función
        return;
    }

    // ===============================
    // VARIABLE PARA EL SUBTOTAL
    // ===============================

    let subtotal = 0;

    // ===============================
    // RECORRER PRODUCTOS
    // ===============================

    // Ciclo for tradicional
    for (let i = 0; i < carrito.length; i++) {

        // Obtener producto actual
        let producto = carrito[i];

        // Obtener precio total del producto
        let totalProducto = producto.precio * producto.cantidad;

        // Sumar al subtotal general
        subtotal = subtotal + totalProducto;

        // Crear HTML del producto
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

    // ===============================
    // MOSTRAR TOTALES
    // ===============================

    subtotalHTML.textContent = formatearPrecio(subtotal);

    totalHTML.textContent = formatearPrecio(subtotal);
}


// ===============================
// FUNCIÓN AUMENTAR CANTIDAD
// ===============================

function aumentarCantidad(indiceProducto) {

    // Obtener cantidad actual
    let cantidadActual = carrito[indiceProducto].cantidad;

    // Sumar 1
    cantidadActual = cantidadActual + 1;

    // Actualizar cantidad
    carrito[indiceProducto].cantidad = cantidadActual;

    // Guardar cambios
    guardarCarrito();

    // Actualizar pantalla
    renderizarCarrito();
}


// ===============================
// FUNCIÓN DISMINUIR CANTIDAD
// ===============================

function disminuirCantidad(indiceProducto) {

    // Obtener cantidad actual
    let cantidadActual = carrito[indiceProducto].cantidad;

    // Verificar si es mayor a 1
    if (cantidadActual > 1) {

        // Restar 1
        cantidadActual = cantidadActual - 1;

        // Actualizar cantidad
        carrito[indiceProducto].cantidad = cantidadActual;

    } else {

        // Eliminar producto del arreglo
        carrito.splice(indiceProducto, 1);
    }

    // Guardar cambios
    guardarCarrito();

    // Actualizar pantalla
    renderizarCarrito();
}


// ===============================
// FUNCIÓN ELIMINAR PRODUCTO
// ===============================

function eliminarProducto(indiceProducto) {

    // Eliminar producto
    carrito.splice(indiceProducto, 1);

    // Guardar cambios
    guardarCarrito();

    // Volver a mostrar carrito
    renderizarCarrito();
}

renderizarCarrito();

function agregarCarrito(){
    
    const producto = {
    id: producto.id,
    nombre: producto.title,
    precio: parseInt(
        producto.price
            .replace("$", "")
            .replace(/\./g, "")
    ),
    imagen: producto.image,
    cantidad: 1
};

    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

    const existe = carrito.find(item => item.nombre === producto.nombre);

    if(existe){

        existe.cantidad++;

    }else{

        carrito.push(producto);
    }

    localStorage.setItem("carrito", JSON.stringify(carrito));

    alert("Producto agregado al carrito");
}

