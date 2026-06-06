let productos = [
    {
        id: 1,
        nombre: "Bolso Manhattan",
        precio: 120000,
        stock: 15,
        descripcion: "Material premium con acabados de lujo."
    },
    {
        id: 2,
        nombre: "Mochila Urban",
        precio: 145000,
        stock: 8,
        descripcion: "Ideal para el día a día, impermeable."
    }
];

// 1. RENDERIZAR TABLA DE PRODUCTOS
function renderProductos(){
    const tabla = document.getElementById("tablaProductos");
    if (!tabla) return;
    
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
                    class="btn btn-warning btn-sm me-1 text-dark fw-bold"
                    onclick="editarProducto(${index})"
                >
                    <i class="fa-solid fa-pen"></i> Editar
                </button>
                <button 
                    class="btn btn-danger btn-sm fw-bold"
                    onclick="eliminarProducto(${index})"
                >
                    <i class="fa-solid fa-trash"></i> Eliminar
                </button>
            </td>
        </tr>
        `;
    });

    actualizarCards();
}

// 2. ACTUALIZAR INDICADORES SUPERIORES
function actualizarCards(){
    if(document.getElementById("totalProductos")) {
        document.getElementById("totalProductos").textContent = productos.length;
    }
    if(document.getElementById("totalUsuarios")) {
        document.getElementById("totalUsuarios").textContent = 3;
    }
    if(document.getElementById("totalVentas")) {
        document.getElementById("totalVentas").textContent = 0;
    }
    if(document.getElementById("ganancias")) {
        document.getElementById("ganancias").textContent = "$0";
    }
}

// 3. CONTROL DE APERTURA DEL MODAL PREMIUM
function abrirModal() {
    // Reseteamos el formulario limpio
    document.getElementById("formProducto").reset();
    
    // El input oculto que guarda el index lo dejamos vacío (significa que es un NUEVO producto)
    document.getElementById("productoIndex").value = ""; 
    
    // Cambiamos textos para modo "Agregar"
    document.getElementById("modalTitulo").innerHTML = '<i class="fa-solid fa-box-open"></i> Agregar Nuevo Producto';
    document.getElementById("btnGuardarTexto").textContent = "Guardar Producto";
    
    // Abrimos usando tu clase CSS cambiando el display a flex
    document.getElementById("modalProducto").style.display = "flex";
}

function cerrarModal() {
    // Cerramos el modal poniéndolo en none
    document.getElementById("modalProducto").style.display = "none";
}

// 4. FUNCION UNIFICADA PARA GUARDAR (AGREGAR / EDITAR)
function guardarProducto(event) {
    event.preventDefault(); // Evita que la página se recargue

    // Capturamos los datos del modal premium
    const index = document.getElementById("productoIndex").value;
    const nombre = document.getElementById("prodNombre").value;
    const precio = Number(document.getElementById("prodPrecio").value);
    const stock = Number(document.getElementById("prodStock").value);
    const descripcion = document.getElementById("prodDescripcion").value;

    if (index === "") {
        // MODO AGREGAR: Creamos un id nuevo basado en el id más alto existente
        const nuevoId = productos.length > 0 ? Math.max(...productos.map(p => p.id)) + 1 : 1;
        
        const nuevoProducto = {
            id: nuevoId,
            nombre: nombre,
            precio: precio,
            stock: stock,
            descripcion: descripcion
        };
        
        productos.push(nuevoProducto);
    } else {
        // MODO EDITAR: Actualizamos el producto existente usando su index
        const idx = Number(index);
        productos[idx].nombre = nombre;
        productos[idx].precio = precio;
        productos[idx].stock = stock;
        productos[idx].descripcion = descripcion;
    }

    // Actualizar interfaz y cerrar el modal
    renderProductos();
    cerrarModal();
}

// 5. CARGAR DATOS EN EL MODAL PARA EDITAR
function editarProducto(index){
    const producto = productos[index];

    // Llenamos el formulario con los datos actuales del producto
    document.getElementById("productoIndex").value = index; // Guardamos el index en el input oculto
    document.getElementById("prodNombre").value = producto.nombre;
    document.getElementById("prodPrecio").value = producto.precio;
    document.getElementById("prodStock").value = producto.stock;
    document.getElementById("prodDescripcion").value = producto.descripcion || "";

    // Cambiamos títulos del modal premium para reflejar la edición
    document.getElementById("modalTitulo").innerHTML = '<i class="fa-solid fa-pen-to-square"></i> Editar Producto';
    document.getElementById("btnGuardarTexto").textContent = "Actualizar Cambios";

    // Mostramos el modal
    document.getElementById("modalProducto").style.display = "flex";
}

// 6. ELIMINAR PRODUCTO
function eliminarProducto(index){
    const confirmar = confirm("¿Seguro que deseas eliminar este producto?");
    if(confirmar){
        productos.splice(index, 1);
        renderProductos();
    }
}

// 7. CERRAR SESIÓN
function cerrarSesion(){
    const confirmar = confirm("¿Seguro que deseas cerrar sesión?");
    if(confirmar){
        localStorage.clear();
        window.location.href = "login.html";
    }
}

// Inicializamos la tabla al cargar la vista
renderProductos();