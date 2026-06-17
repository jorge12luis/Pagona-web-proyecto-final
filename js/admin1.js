const API_URL = "http://localhost:3000";
let productos = [];

async function cargarProductos() {
    try {
        const respuesta = await fetch(`${API_URL}/obtener-productos`);
        const data = await respuesta.json();
        if (data.success) {
            productos = data.productos;
            renderProductos();
        }
    } catch (error) {
        console.error("Error de conexión:", error);
    }
}

function renderProductos() {
    const tabla = document.getElementById("tablaProductos");
    if (!tabla) return;
    tabla.innerHTML = "";

    productos.forEach((producto, index) => {
        const urlImagen = producto.imagen
            ? (producto.imagen.startsWith('http') ? producto.imagen : `${API_URL}/${producto.imagen}`)
            : 'img/default-product.png';

        tabla.innerHTML += `
        <tr>
            <td>${producto.id}</td>
            <td>
                <div class="d-flex align-items-center gap-2">
                    <img src="${urlImagen}" alt="${producto.nombre}" 
                         style="width:40px;height:40px;object-fit:cover;border-radius:5px;"
                         onerror="this.src='img/default-product.png'">
                    <span>${producto.nombre}</span>
                </div>
            </td>
            <td>$${Number(producto.precio).toLocaleString()}</td>
            <td>${producto.stock}</td>
            <td>
                <button class="btn btn-info btn-sm me-1 text-white fw-bold"
                    onclick="abrirModalImagenes(${producto.id}, '${producto.nombre}')">
                    <i class="fa-solid fa-images"></i> Imágenes
                </button>
                <button class="btn btn-warning btn-sm me-1 text-dark fw-bold"
                    onclick="editarProducto(${index})">
                    <i class="fa-solid fa-pen"></i> Editar
                </button>
                <button class="btn btn-danger btn-sm fw-bold"
                    onclick="eliminarProductoReal(${producto.id})">
                    <i class="fa-solid fa-trash"></i> Eliminar
                </button>
            </td>
        </tr>
        `;
    });

    actualizarCards();
}

function actualizarCards() {
    if (document.getElementById("totalProductos")) {
        document.getElementById("totalProductos").textContent = productos.length;
    }
}

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

async function guardarProducto(event) {
    event.preventDefault();

    const idExistente = document.getElementById("productoIndex").value;
    const formData = new FormData();
    formData.append("nombre", document.getElementById("prodNombre").value);
    formData.append("precio", document.getElementById("prodPrecio").value);
    formData.append("stock", document.getElementById("prodStock").value);
    formData.append("descripcion", document.getElementById("prodDescripcion").value);

    const inputImagen = document.getElementById("prodImagen");
    if (inputImagen.files.length > 0) {
        formData.append("imagen", inputImagen.files[0]);
    }

    try {
        let url = `${API_URL}/agregarproductos`;
        let method = "POST";

        if (idExistente !== "") {
            url = `${API_URL}/actualizar-producto/${idExistente}`;
            method = "PUT";
        }

        const respuesta = await fetch(url, { method, body: formData });
        const data = await respuesta.json();

        if (data.success) {
            alert(data.message || "¡Operación realizada con éxito!");
            cerrarModal();
            cargarProductos();
        } else {
            alert("Error: " + data.message);
        }
    } catch (error) {
        console.error("Error al guardar:", error);
        alert("Error de conexión con el servidor");
    }
}

function editarProducto(index) {
    const producto = productos[index];
    document.getElementById("productoIndex").value = producto.id;
    document.getElementById("prodNombre").value = producto.nombre;
    document.getElementById("prodPrecio").value = producto.precio;
    document.getElementById("prodStock").value = producto.stock;
    document.getElementById("prodDescripcion").value = producto.descripcion || "";
    document.getElementById("modalTitulo").innerHTML = '<i class="fa-solid fa-pen-to-square"></i> Editar Producto';
    document.getElementById("btnGuardarTexto").textContent = "Actualizar Cambios";
    document.getElementById("modalProducto").style.display = "flex";
}

async function eliminarProductoReal(id) {
    if (!confirm("¿Seguro que deseas eliminar este producto?")) return;

    try {
        const respuesta = await fetch(`${API_URL}/eliminarproducto/${id}`, { method: "DELETE" });
        const data = await respuesta.json();

        if (data.success) {
            alert(data.message || "Producto eliminado correctamente");
            cargarProductos();
        } else {
            alert("No se pudo eliminar: " + data.message);
        }
    } catch (error) {
        console.error("Error al eliminar:", error);
        alert("Error de comunicación con el servidor");
    }
}

function cerrarSesion() {
    if (confirm("¿Seguro que deseas cerrar sesión?")) {
        localStorage.clear();
        window.location.href = "login.html";
    }
}

// ===== GESTIÓN DE IMÁGENES =====

let productoIdImagenes = null;

async function abrirModalImagenes(productoId, nombreProducto) {
    productoIdImagenes = productoId;
    document.querySelector("#modalImagenes .modal-header h3").innerHTML =
        `<i class="fa-solid fa-images"></i> Imágenes: ${nombreProducto}`;
    await cargarImagenesProducto(productoId);
    document.getElementById("modalImagenes").style.display = "flex";
}

function cerrarModalImagenes() {
    document.getElementById("modalImagenes").style.display = "none";
    productoIdImagenes = null;
}

async function cargarImagenesProducto(productoId) {
    try {
        const respuesta = await fetch(`${API_URL}/imagenes-producto/${productoId}`);
        const data = await respuesta.json();
        const lista = document.getElementById("listaImagenes");

        if (!data.success || data.imagenes.length === 0) {
            lista.innerHTML = "<p style='color:#888'>Sin imágenes registradas</p>";
            return;
        }

        lista.innerHTML = data.imagenes.map(img => `
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;padding:8px;border:1px solid #eee;border-radius:8px;">
                <img src="${img.imagen.startsWith('http') ? img.imagen : API_URL + '/' + img.imagen}"
                     style="width:60px;height:60px;object-fit:cover;border-radius:5px;"
                     onerror="this.src='img/default-product.png'">
                <div style="flex:1">
                    <strong>${img.color || 'Imagen principal'}</strong><br>
                    <small style="color:#888">${img.imagen}</small>
                </div>
                <button class="btn btn-danger btn-sm" onclick="eliminarImagen(${img.id})">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        `).join('');

    } catch (error) {
        console.error("Error cargando imágenes:", error);
    }
}

async function subirImagenProducto() {
    if (!productoIdImagenes) return;

    const archivo = document.getElementById("imgArchivo").files[0];
    const color = document.getElementById("imgColor").value;

    if (!archivo) {
        alert("Selecciona una imagen");
        return;
    }

    const formData = new FormData();
    formData.append("imagen", archivo);
    formData.append("producto_id", productoIdImagenes);
    formData.append("color", color || "");

    try {
        const respuesta = await fetch(`${API_URL}/agregar-imagen-producto`, {
            method: "POST",
            body: formData
        });
        const data = await respuesta.json();

        if (data.success) {
            alert("Imagen subida correctamente");
            document.getElementById("imgArchivo").value = "";
            document.getElementById("imgColor").value = "";
            await cargarImagenesProducto(productoIdImagenes);
        } else {
            alert("Error: " + data.message);
        }
    } catch (error) {
        console.error("Error subiendo imagen:", error);
        alert("Error de conexión");
    }
}

async function eliminarImagen(imagenId) {
    if (!confirm("¿Eliminar esta imagen?")) return;

    try {
        const respuesta = await fetch(`${API_URL}/eliminar-imagen/${imagenId}`, { method: "DELETE" });
        const data = await respuesta.json();

        if (data.success) {
            await cargarImagenesProducto(productoIdImagenes);
        } else {
            alert("Error eliminando imagen");
        }
    } catch (error) {
        console.error(error);
    }
}

document.addEventListener("DOMContentLoaded", cargarProductos);