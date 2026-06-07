// URL Base de tu API
const API_URL = "http://localhost:3000";

// Array global que ahora se llenará con los datos de la Base de Datos
let productos = [];

// 1. CARGAR PRODUCTOS DESDE EL SERVIDOR (REAL)
async function cargarProductos() {
    try {
        const respuesta = await fetch(`${API_URL}/obtener-productos`);
        const data = await respuesta.json();
        
        if (data.success) {
            productos = data.productos;
            renderProductos();
        } else {
            console.error("Error al obtener productos del servidor");
        }
    } catch (error) {
        console.error("Error de conexión:", error);
    }
}

// 2. RENDERIZAR TABLA DE PRODUCTOS
function renderProductos(){
    const tabla = document.getElementById("tablaProductos");
    if (!tabla) return;
    
    tabla.innerHTML = "";

    productos.forEach((producto, index) => {
        // Validar si trae imagen, de lo contrario poner una por defecto
        const urlImagen = producto.imagen ? `${API_URL}/${producto.imagen}` : 'img/default-product.png';

        tabla.innerHTML += `
        <tr>
            <td>${producto.id}</td>
            <td>
                <div class="d-flex align-items-center gap-2">
                    <img src="${urlImagen}" alt="${producto.nombre}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 5px;">
                    <span>${producto.nombre}</span>
                </div>
            </td>
            <td>$${Number(producto.precio).toLocaleString()}</td>
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
                    onclick="eliminarProductoReal(${producto.id})"
                >
                    <i class="fa-solid fa-trash"></i> Eliminar
                </button>
            </td>
        </tr>
        `;
    });

    actualizarCards();
}

// 3. ACTUALIZAR INDICADORES SUPERIORES
function actualizarCards(){
    if(document.getElementById("totalProductos")) {
        document.getElementById("totalProductos").textContent = productos.length;
    }
    // Nota: Los indicadores de usuarios se manejan desde tu admin.js original
}

// 4. CONTROL DE APERTURA DEL MODAL
function abrirModal() {
    document.getElementById("formProducto").reset();
    document.getElementById("productoIndex").value = ""; 
    document.getElementById("modalTitulo").innerHTML = '<i class="fa-solid fa-box-open"></i> Agregar Nuevo Producto';
    document.getElementById("btnGuardarTexto").textContent = "Guardar Producto";
    document.getElementById("modalProducto").style.display = "flex";
}

function cerrarModal() {
    document.getElementById("modalProducto").style.display = "none";
}

// 5. ENVIAR DATOS AL SERVIDOR (AGREGAR PRODUCTO CON IMAGEN)
async function guardarProducto(event) {
    event.preventDefault(); 

    const idExistente = document.getElementById("productoIndex").value;
    
    // !!! DETALLE CLAVE !!!
    // Como enviamos una IMAGEN (archivo), no podemos usar JSON.stringify.
    // Debemos usar FormData de manera obligatoria para que Multer lo entienda en el backend.
    const formData = new FormData();
    formData.append("nombre", document.getElementById("prodNombre").value);
    formData.append("precio", document.getElementById("prodPrecio").value);
    formData.append("stock", document.getElementById("prodStock").value);
    formData.append("descripcion", document.getElementById("prodDescripcion").value);
    
    // Capturar el archivo de la imagen si fue seleccionado
    const inputImagen = document.getElementById("prodImagen");
    if (inputImagen.files.length > 0) {
        formData.append("imagen", inputImagen.files[0]);
    }

    try {
        let url = `${API_URL}/agregar-producto`;
        let method = "POST";

        // Si el idExistente no está vacío, significa que vas a editar
        if (idExistente !== "") {
            url = `${API_URL}/editar-producto/${idExistente}`;
            method = "PUT"; // O lo puedes manejar como gusten en su equipo
        }

        // Enviamos la petición
        const respuesta = await fetch(url, {
            method: method,
            body: formData // NOTA: No agregues 'Content-Type', el navegador lo configura solo automáticamente al ver un FormData
        });

        const data = await respuesta.json();

        if (data.success) {
            alert(data.message);
            cerrarModal();
            cargarProductos(); // Recargamos la lista actualizada desde la BD
        } else {
            alert("Error: " + data.message);
        }

    } catch (error) {
        console.error("Error al guardar:", error);
        alert("Error de conexión con el servidor");
    }
}

// 6. CARGAR DATOS EN EL MODAL PARA EDITAR
function editarProducto(index){
    const producto = productos[index];

    // Llenamos el formulario con los datos de la BD
    document.getElementById("productoIndex").value = producto.id; // Guardamos el ID real de la BD
    document.getElementById("prodNombre").value = producto.nombre;
    document.getElementById("prodPrecio").value = producto.precio;
    document.getElementById("prodStock").value = producto.stock;
    document.getElementById("prodDescripcion").value = producto.descripcion || "";

    document.getElementById("modalTitulo").innerHTML = '<i class="fa-solid fa-pen-to-square"></i> Editar Producto';
    document.getElementById("btnGuardarTexto").textContent = "Actualizar Cambios";
    document.getElementById("modalProducto").style.display = "flex";
}

// 7. ELIMINAR PRODUCTO REAL DE LA BASE DE DATOS
async function eliminarProductoReal(id) {
    const confirmar = confirm("¿Seguro que deseas eliminar definitivamente este producto de la base de datos?");
    if (!confirmar) return;

    try {
        const respuesta = await fetch(`${API_URL}/eliminar-producto/${id}`, {
            method: "DELETE"
        });

        const data = await respuesta.json();

        if (data.success) {
            alert(data.message);
            cargarProductos(); // Volver a consultar la BD para refrescar la tabla
        } else {
            alert("No se pudo eliminar: " + data.message);
        }
    } catch (error) {
        console.error("Error al eliminar:", error);
        alert("Error de comunicación con el servidor");
    }
}

// 8. CERRAR SESIÓN
function cerrarSesion(){
    const confirmar = confirm("¿Seguro que deseas cerrar sesión?");
    if(confirmar){
        localStorage.clear();
        window.location.href = "login.html";
    }
}

// Inicializamos la tabla trayendo los datos del servidor al cargar la vista
document.addEventListener("DOMContentLoaded", cargarProductos);