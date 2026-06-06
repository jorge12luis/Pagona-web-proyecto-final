// Configuración de la URL de nuestra API de productos en el Servidor
const API_URL = "http://localhost:3000/api/productos";

// Evento que se dispara automáticamente al cargar la interfaz HTML
document.addEventListener("DOMContentLoaded", () => {
    // 1. Cargar la tabla inmediatamente con los datos de MySQL
    obtenerProductos();

    // 2. Escuchar cuando el administrador le dé a "Guardar" en el formulario del modal
    document.getElementById("formProducto").addEventListener("submit", guardarProducto);

    // 3. Asignar el evento click al botón "+ Agregar producto" para abrir el Modal
    const btnAgregar = document.getElementById("btnAgregarProducto");
    if (btnAgregar) {
        btnAgregar.addEventListener("click", (e) => {
            e.preventDefault();
            abrirModalAgregar();
        });
    }
});

// ==========================================================
// 1. FUNCIÓN PARA LEER PRODUCTOS DE LA BD Y DETALLARLOS EN LA TABLA
// ==========================================================
async function obtenerProductos() {
    try {
        const res = await fetch(API_URL);
        const data = await res.json();
        
        if (data.success) {
            const tablaBody = document.querySelector("table tbody");
            tablaBody.innerHTML = ""; // Limpiar cualquier registro estático anterior

            // Iterar los productos devueltos por el servidor de Node.js
            data.productos.forEach(prod => {
                const fila = document.createElement("tr");
                fila.style.borderBottom = "1px solid #eaeaea";
                
                fila.innerHTML = `
                    <td style="padding: 15px 10px; font-weight: bold; color: #555;">${prod.id}</td>
                    <td style="padding: 15px 10px; display: flex; align-items: center; gap: 12px; font-weight: 500; color: #333;">
                        <img src="http://localhost:3000/${prod.imagen}" alt="${prod.nombre}" style="width: 45px; height: 45px; object-fit: cover; border-radius: 6px; border: 1px solid #ddd;">
                        <span>${prod.nombre}</span>
                    </td>
                    <td style="padding: 15px 10px; color: #333; font-weight: 500;">$${Number(prod.precio).toLocaleString('es-CO')}</td>
                    <td style="padding: 15px 10px; color: #666;">${prod.stock} uds</td>
                    <td style="padding: 15px 10px;">
                        <button class="btn-editar" onclick="abrirModalEditar(${prod.id}, '${prod.nombre}', ${prod.precio}, ${prod.stock}, '${prod.descripcion || ''}')" style="background: #ffc107; color: #111; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-weight: bold; font-size: 12px; margin-right: 5px;">
                            <i class="fa-solid fa-pen"></i> Editar
                        </button>
                        <button class="btn-eliminar" onclick="eliminarProducto(${prod.id})" style="background: #dc3545; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-weight: bold; font-size: 12px;">
                            <i class="fa-solid fa-trash"></i> Eliminar
                        </button>
                    </td>
                `;
                tablaBody.appendChild(fila);
            });
        }
    } catch (error) {
        console.error("Error al conectar con la API de productos:", error);
    }
}

// ==========================================================
// 2. FUNCIONES DE CONTROL VISUAL DEL MODAL FLOTANTE
// ==========================================================
function abrirModalAgregar() {
    document.getElementById("modalTitulo").textContent = "Agregar Producto";
    document.getElementById("productoId").value = ""; // Limpiar ID para indicar que es nuevo
    document.getElementById("formProducto").reset();  // Vaciar campos
    document.getElementById("modalProducto").style.display = "flex";
}

function abrirModalEditar(id, nombre, precio, stock, descripcion) {
    document.getElementById("modalTitulo").textContent = "Editar Producto";
    document.getElementById("productoId").value = id; // Almacenar ID para saber cuál actualizar
    document.getElementById("prodNombre").value = nombre;
    document.getElementById("prodPrecio").value = precio;
    document.getElementById("prodStock").value = stock;
    document.getElementById("prodDescripcion").value = descripcion;
    document.getElementById("modalProducto").style.display = "flex";
}

function cerrarModal() {
    document.getElementById("modalProducto").style.display = "none";
}

// ==========================================================
// 3. GUARDAR CAMBIOS (CREACIÓN MEDIANTE POST / EDICIÓN MEDIANTE PUT)
// ==========================================================
async function guardarProducto(e) {
    e.preventDefault();
    
    const id = document.getElementById("productoId").value;
    const nombre = document.getElementById("prodNombre").value;
    const precio = document.getElementById("prodPrecio").value;
    const stock = document.getElementById("prodStock").value;
    const descripcion = document.getElementById("prodDescripcion").value;
    const archivoImagen = document.getElementById("prodImagen").files[0];

    // FormData es CRUCIAL aquí porque Multer necesita capturar el archivo binario de la imagen
    const formData = new FormData();
    formData.append("nombre", nombre);
    formData.append("precio", precio);
    formData.append("stock", stock);
    formData.append("descripcion", descripcion);
    
    if (archivoImagen) {
        formData.append("imagen", archivoImagen);
    }

    try {
        let response;
        if (id) {
            // Si el ID existe, disparamos la actualización (PUT)
            response = await fetch(`${API_URL}/${id}`, {
                method: "PUT",
                body: formData
            });
        } else {
            // Si el ID está vacío, disparamos el registro de un nuevo bolso (POST)
            response = await fetch(API_URL, {
                method: "POST",
                body: formData
            });
        }

        const data = await response.json();
        if (data.success) {
            cerrarModal();       // Ocultar formulario flotante
            obtenerProductos();  // Recargar la tabla asíncronamente
        } else {
            alert("Error en el servidor al intentar guardar el bolso.");
        }
    } catch (error) {
        console.error("Error al procesar la solicitud de guardado:", error);
    }
}

// ==========================================================
// 4. ELIMINAR UN BOLSO DE LA BASE DE DATOS
// ==========================================================
async function eliminarProducto(id) {
    if (confirm("¿Estás seguro de que deseas eliminar este bolso permanentemente del inventario?")) {
        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: "DELETE"
            });
            const data = await response.json();
            if (data.success) {
                obtenerProductos(); // Refrescar la tabla
            }
        } catch (error) {
            console.error("Error al intentar eliminar el elemento:", error);
        }
    }
}