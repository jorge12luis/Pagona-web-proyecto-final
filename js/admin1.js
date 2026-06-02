
let productos = [

    {
        id: 1,
        nombre: "Bolso Manhattan",
        precio: 120000,
        stock: 15
    },

    {
        id: 2,
        nombre: "Mochila Urban",
        precio: 145000,
        stock: 8
    }

];

function renderProductos(){

    const tabla = document.getElementById("tablaProductos");

    tabla.innerHTML = "";

    productos.forEach((producto, index) => {

        tabla.innerHTML += `

        <tr>

            <td>${producto.id}</td>

            <td>${producto.nombre}</td>

            <td>$${producto.precio.toLocaleString()}</td>

            <td>${producto.stock}</td>

            <td>

                <button 
                    class="btn btn-warning btn-sm"
                    onclick="editarProducto(${index})"
                >
                    Editar
                </button>

                <button 
                    class="btn btn-danger btn-sm"
                    onclick="eliminarProducto(${index})"
                >
                    Eliminar
                </button>

            </td>

        </tr>

        `;
    });

    actualizarCards();
}

function actualizarCards(){

    document.getElementById("totalProductos").textContent = productos.length;

    document.getElementById("totalUsuarios").textContent = 3;

    document.getElementById("totalVentas").textContent = 0;

    document.getElementById("ganancias").textContent = "$0";
}

function agregarProducto(){

    const nombre = prompt("Nombre del producto");

    if(!nombre) return;

    const precio = prompt("Precio");

    const stock = prompt("Stock");

    const nuevoProducto = {

        id: productos.length + 1,

        nombre,

        precio: Number(precio),

        stock: Number(stock)

    };

    productos.push(nuevoProducto);

    renderProductos();
}

function editarProducto(index){

    const producto = productos[index];

    const nuevoNombre = prompt(
        "Editar nombre",
        producto.nombre
    );

    const nuevoPrecio = prompt(
        "Editar precio",
        producto.precio
    );

    const nuevoStock = prompt(
        "Editar stock",
        producto.stock
    );

    producto.nombre = nuevoNombre;
    producto.precio = Number(nuevoPrecio);
    producto.stock = Number(nuevoStock);

    renderProductos();
}

function eliminarProducto(index){

    const confirmar = confirm(
        "¿Seguro que deseas eliminar este producto?"
    );

    if(confirmar){

        productos.splice(index, 1);

        renderProductos();
    }
}

function cerrarSesion(){

    const confirmar = confirm(
        "¿Seguro que deseas cerrar sesión?"
    );

    if(confirmar){

        localStorage.clear();

        window.location.href = "login.html";
    }
}

renderProductos();

