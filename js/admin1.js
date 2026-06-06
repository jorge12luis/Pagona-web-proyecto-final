const API_URL = "http://localhost:3000/api/productos";

document.addEventListener("DOMContentLoaded", () => {
    obtenerProductos();

    // Enlace al envío de tu formulario oscuro
    document.getElementById("formProducto").addEventListener("submit", guardarProducto);

    // Activar botón morado de agregar para desplegar el modal premium
    const btnAgregar = document.getElementById("btnAgregarProducto");
    if (btnAgregar) {
        btnAgregar.addEventListener("click", (e) => {
            e.preventDefault();
            abrirModalAgregar();
        });
    }
});

// 1. CARGAR Y RENDERIZAR TABLA CON IMÁGENES
async function obtenerProductos() {
    try {
        const res = await fetch(API_URL);
        const data = await res.json();
        
        if (data.success) {
            const tablaBody = document.querySelector("table tbody");
            tablaBody.innerHTML = "";

            data.productos.forEach(prod => {
                const fila = document.createElement("tr");
                fila.style.borderBottom = "1px solid #edf2f7";
                
                fila.innerHTML = `
                    <td style="padding: 14px 12px; color: #4a5568;">${prod.id}</td>
                    <td style="padding: 14px 12px; display: flex; align-items: center; gap: 12px; color: #2d3748; font-weight: 500;">
                        <img src="http://localhost:3000/${prod.imagen}" alt="${prod.nombre}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 6px; border: 1px solid #e2e8f0;">
                        <span>${prod.nombre}</span>
                    </td>
                    <td style="padding: 14px 12px; color: #2d3748; font-weight: 600;">$${Number(prod.precio).toLocaleString('es-CO')}</td>
                    <td style="padding: 14px 12px; color: #4a5568;">${prod.stock} uds</td>
                    <td style="padding: 14px 12px;">
                        <button onclick="abrirModalEditar(${prod.id}, '${prod.nombre}', ${prod.precio}, ${prod.stock}, '${prod.descripcion || ''}')" style="background-color: #ffc107; color: black; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-weight: bold; font-size: 12px; margin-right: 6px;">Editar</button>
                        <button onclick="eliminarProducto(${prod.id})" style="background-color: #dc3545; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-weight: bold; font-size: 12px;">Eliminar</button>
                    </td>
                `;
                tablaBody.appendChild(fila);
            });
        }
    } catch (error) {
        console.error("Error al renderizar los productos:", error);
    }
}

// 2. INTERRUPTORES VISUALES DEL MODAL OSCURO
function abrirModalAgregar() {
    document.getElementById("modalTitulo").textContent = "Agregar Nuevo Producto";
    document.getElementById("productoId").value = "";
    document.getElementById("formProducto").reset();
    document.getElementById("modalProducto").style.display = "flex";
}

function abrirModalEditar(id, nombre, precio, stock, descripcion) {
    document.getElementById("modalTitulo").textContent = "Editar Producto";
    document.getElementById("productoId").value = id;
    document.getElementById("prodNombre").value = nombre;
    document.getElementById("prodPrecio").value = precio;
    document.getElementById("prodStock").value = stock;
    document.getElementById("prodDescripcion").value = descripcion;
    document.getElementById("modalProducto").style.display = "flex";
}

function cerrarModal() {
    document.getElementById("modalProducto").style.display = "none";
}

// 3. CONEXIÓN DIRECTA CON BACKEND MULTER
async function guardarProducto(e) {
    e.preventDefault();
    
    const id = document.getElementById("productoId").value;
    const nombre = document.getElementById("prodNombre").value;
    const precio = document.getElementById("prodPrecio").value;
    const stock = document.getElementById("prodStock").value;
    const descripcion = document.getElementById("prodDescripcion").value;
    const archivoImagen = document.getElementById("prodImagen").files[0];

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
            response = await fetch(`${API_URL}/${id}`, {
                method: "PUT",
                body: formData
            });
        } else {
            response = await fetch(API_URL, {
                method: "POST",
                body: formData
            });
        }

        const data = await response.json();
        if (data.success) {
            cerrarModal();
            obtenerProductos();
        } else {
            alert("Error en base de datos al guardar.");
        }
    } catch (error) {
        console.error("Error al procesar la operación:", error);
    }
}

// 4. ELIMINAR REGISTRO
async function eliminarProducto(id) {
    if (confirm("¿Seguro que deseas remover este producto de forma definitiva?")) {
        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: "DELETE"
            });
            const data = await response.json();
            if (data.success) {
                obtenerProductos();
            }
        } catch (error) {
            console.error("Error al borrar:", error);
        }
    }
}