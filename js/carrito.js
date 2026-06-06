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
// CARGAR DATOS (LOCALSTORAGE O SERVIDOR)
// ===============================

// Variable principal del carrito
let carrito = [];

// Si el usuario está logueado, preferir cargar el carrito desde el servidor
const usuarioData = JSON.parse(localStorage.getItem("usuarioData"));

if (usuarioData && usuarioData.id) {
    // Cargar desde backend
    fetch(`http://localhost:3000/carrito/${usuarioData.id}`)
        .then(res => res.json())
        .then(data => {
            console.log('GET /carrito response:', data);
            // data debería ser un arreglo de items con propiedades: nombre, precio, imagen, cantidad
            if (Array.isArray(data)) {
                carrito = data.map(item => {
                    // Resolver ruta de imagen usando nombre + color cuando sea posible
                    let imagenUrl = '../img/bolso1.jpg';
                    const nombre = item.nombre ? String(item.nombre).trim() : '';
                    const nombreNorm = nombre.toLowerCase();
                    const color = item.color ? String(item.color).trim() : '';

                    // normalizar color para formar nombres de archivo
                    function normColor(c) {
                        if (!c) return '';
                        const m = c.toLowerCase();
                        if (m.includes('marr')) return 'marron';
                        if (m.includes('ros')) return 'rosado';
                        if (m.includes('neg')) return 'negro';
                        if (m.includes('blan')) return 'blanco';
                        if (m.includes('beig')) return 'beige';
                        return m.replace(/[^a-z0-9]/g, '');
                    }

                    const colorNorm = normColor(color);

                    if (colorNorm) {
                        if (nombreNorm.includes('manhattan')) {
                            imagenUrl = `../img/manhattan-${colorNorm}.jpg`;
                        } else if (nombreNorm.includes('mochila') || nombreNorm.includes('urban')) {
                            imagenUrl = `../img/urban-${colorNorm}.jpg`;
                        } else if (nombreNorm.includes('noche') || nombreNorm.includes('cartera')) {
                            imagenUrl = `../img/noche-${colorNorm}.jpg`;
                        } else {
                            // si no coincide con reglas, intentar usar la ruta que viene en DB
                            if (item.imagen) {
                                const img = String(item.imagen || '').trim();
                                if (img.startsWith('http') || img.startsWith('/')) {
                                    imagenUrl = img;
                                } else if (img.includes('img/')) {
                                    imagenUrl = '../' + img;
                                } else {
                                    imagenUrl = '../img/' + img;
                                }
                            }
                        }
                    } else if (item.imagen) {
                        const img = String(item.imagen || '').trim();
                        if (img.startsWith('http') || img.startsWith('/')) {
                            imagenUrl = img;
                        } else if (img.includes('img/')) {
                            imagenUrl = '../' + img;
                        } else {
                            imagenUrl = '../img/' + img;
                        }
                    }

                    return {
                        id: item.id,
                        nombre: item.nombre,
                        precio: Number(item.precio) || 0,
                        imagen: imagenUrl,
                        cantidad: item.cantidad || 1,
                        color: item.color || null
                    };
                });
            } else {
                carrito = [];
            }

            renderizarCarrito();
        })
        .catch(err => {
            console.log('Error cargando carrito desde servidor:', err);
            // fallback a localStorage
            const carritoGuardado = localStorage.getItem("carrito");
            carrito = carritoGuardado ? JSON.parse(carritoGuardado) : [];
            renderizarCarrito();
        });

} else {
    // Obtener información guardada en localStorage (usuarios no logueados)
    let carritoGuardado = localStorage.getItem("carrito");

    // Verificar si existe información guardada
    if (carritoGuardado != null) {
        // Convertir el texto JSON a arreglo
        carrito = JSON.parse(carritoGuardado);
    } else {
        // Si no hay datos, crear arreglo vacío
        carrito = [];
    }

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

async function eliminarProducto(indiceProducto){

    const item = carrito[indiceProducto];

    await fetch(
        `http://localhost:3000/carrito/${item.id}`,
        {
            method:"DELETE"
        }
    );

    carrito.splice(indiceProducto,1);

    renderizarCarrito();
}

function agregarCarrito(){

    const producto = {

        nombre: document.getElementById("productoTitulo").textContent,

        precio: parseInt(
            document.getElementById("productoPrecio")
            .textContent
            .replace("$","")
            .replace(/\./g,"")
        ),

        imagen: document.getElementById("productoImagen").src,

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

