let productos = [];
let usuarios = [];
let ventas = [];

window.addEventListener("DOMContentLoaded", () => {
    cargarProductos();
    cargarUsuarios();
    cargarVentas();
    mostrarDashboard();
    actualizarCards();
});

function ocultarSecciones() {
    document.getElementById("dashboardSection").style.display = "none";
    document.getElementById("productosSection").style.display = "none";
    document.getElementById("usuariosSection").style.display = "none";
    document.getElementById("ventasSection").style.display = "none";
    document.getElementById("estadisticasSection").style.display = "none";
}

function mostrarDashboard() {
    ocultarSecciones();
    document.getElementById("dashboardSection").style.display = "block";
}

function mostrarProductos() {
    ocultarSecciones();
    document.getElementById("productosSection").style.display = "block";
}

function mostrarUsuarios() {
    ocultarSecciones();
    document.getElementById("usuariosSection").style.display = "block";
}

function mostrarVentas() {
    ocultarSecciones();
    document.getElementById("ventasSection").style.display = "block";
}

function mostrarEstadisticas() {
    ocultarSecciones();
    document.getElementById("estadisticasSection").style.display = "block";
    cargarEstadisticas();
}

async function cargarProductos() {
    try {
        const respuesta = await fetch("http://localhost:3000/productos");
        if (!respuesta.ok) throw new Error("Error cargando productos");
        productos = await respuesta.json();
        renderProductos();
    } catch (error) {
        console.error("Error cargando productos:", error);
    }
}

async function cargarUsuarios() {
    try {
        const respuesta = await fetch("http://localhost:3000/obtener-usuarios");
        if (!respuesta.ok) throw new Error("Error cargando usuarios");
        const data = await respuesta.json();
        usuarios = data.usuarios || [];
        renderUsuarios();
    } catch (error) {
        console.error("Error cargando usuarios:", error);
    }
}

async function cargarVentas() {
    try {
        const respuesta = await fetch("http://localhost:3000/admin/ventas");
        if (!respuesta.ok) throw new Error("Error cargando ventas");
        const data = await respuesta.json();
        ventas = data.ventas || [];
        renderVentas();
    } catch (error) {
        console.error("Error cargando ventas:", error);
    }
}

async function actualizarCards() {
    try {
        const [dashboardResp, gananciasResp] = await Promise.all([
            fetch("http://localhost:3000/admin/dashboard"),
            fetch("http://localhost:3000/admin/total-ganancias")
        ]);

        if (!dashboardResp.ok) throw new Error("Error cargando dashboard");
        if (!gananciasResp.ok) throw new Error("Error cargando ganancias");

        const dashboard = await dashboardResp.json();
        const gananciasData = await gananciasResp.json();

        document.getElementById("totalProductos").textContent = dashboard.totalProductos || 0;
        document.getElementById("totalUsuarios").textContent = dashboard.totalUsuarios || 0;
        document.getElementById("totalVentas").textContent = dashboard.totalVentas || 0;

        const ganancias = gananciasData.ganancias ?? dashboard.ganancias ?? 0;
        document.getElementById("ganancias").textContent = "$" + Number(ganancias).toLocaleString();
    } catch (error) {
        console.error("Error actualizando cards:", error);
    }
}

function renderProductos() {
    const tabla = document.getElementById("tablaProductos");
    tabla.innerHTML = "";

    productos.forEach((producto, index) => {
        tabla.innerHTML += `
            <tr>
                <td>${producto.id}</td>
                <td>${producto.nombre}</td>
                <td>$${Number(producto.precio).toLocaleString()}</td>
                <td>${producto.stock}</td>
                <td>
                    <button class="btn btn-warning btn-sm" onclick="editarProducto(${index})">Editar</button>
                    <button class="btn btn-danger btn-sm" onclick="eliminarProducto(${index})">Eliminar</button>
                </td>
            </tr>
        `;
    });
}

function renderUsuarios() {
    const tabla = document.getElementById("tablaUsuarios");
    tabla.innerHTML = "";

    usuarios.forEach((usuario) => {
        tabla.innerHTML += `
            <tr>
                <td>${usuario.id}</td>
                <td>${usuario.nombre} ${usuario.apellido || ""}</td>
                <td>${usuario.correo}</td>
                <td>${usuario.rol}</td>
            </tr>
        `;
    });
}

function renderVentas() {
    const tabla = document.getElementById("tablaVentas");
    tabla.innerHTML = "";

    ventas.forEach((venta) => {
        tabla.innerHTML += `
            <tr>
                <td>${venta.id}</td>
                <td>${venta.usuario || "Sin usuario"}</td>
                <td>$${Number(venta.total).toLocaleString()}</td>
                <td>${venta.estado}</td>
                <td>${venta.fecha}</td>
            </tr>
        `;
    });
}

async function cargarEstadisticas() {
    try {
        const gananciasResp = await fetch("http://localhost:3000/admin/total-ganancias");
        if (!gananciasResp.ok) throw new Error("Error cargando ganancias");
        const gananciasData = await gananciasResp.json();

        document.getElementById("estadisticasProductos").textContent = productos.length;
        document.getElementById("estadisticasUsuarios").textContent = usuarios.length;
        document.getElementById("estadisticasVentas").textContent = ventas.length;
        document.getElementById("estadisticasGanancias").textContent = "$" + Number(gananciasData.ganancias || 0).toLocaleString();
    } catch (error) {
        console.error("Error cargando estadísticas:", error);
    }
}

async function agregarProducto() {
    const nombre = prompt("Nombre del producto");
    if (!nombre) return;

    const precio = Number(prompt("Precio"));
    const stock = Number(prompt("Stock"));
    if (!nombre || Number.isNaN(precio) || Number.isNaN(stock)) return;

    try {
        const respuesta = await fetch("http://localhost:3000/agregar-producto", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ nombre, precio, stock })
        });

        if (!respuesta.ok) throw new Error("Error creando producto");

        await cargarProductos();
        await actualizarCards();
    } catch (error) {
        console.error("Error agregando producto:", error);
    }
}

async function editarProducto(index) {
    const producto = productos[index];
    if (!producto) return;

    const nombre = prompt("Editar nombre", producto.nombre);
    const precio = Number(prompt("Editar precio", producto.precio));
    const stock = Number(prompt("Editar stock", producto.stock));

    if (!nombre || Number.isNaN(precio) || Number.isNaN(stock)) return;

    try {
        const respuesta = await fetch(`http://localhost:3000/actualizar-producto/${producto.id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ nombre, precio, stock })
        });

        if (!respuesta.ok) throw new Error("Error actualizando producto");

        await cargarProductos();
        await actualizarCards();
    } catch (error) {
        console.error("Error editando producto:", error);
    }
}

async function eliminarProducto(index) {
    const producto = productos[index];
    if (!producto) return;

    const confirmar = confirm("¿Seguro que deseas eliminar este producto?");
    if (!confirmar) return;

    try {
        const respuesta = await fetch(`http://localhost:3000/eliminar-producto/${producto.id}`, {
            method: "DELETE"
        });

        if (!respuesta.ok) throw new Error("Error eliminando producto");

        await cargarProductos();
        await actualizarCards();
    } catch (error) {
        console.error("Error eliminando producto:", error);
    }
}

function cerrarSesion() {
    const confirmar = confirm("¿Seguro que deseas cerrar sesión?");
    if (!confirmar) return;

    localStorage.clear();
    window.location.href = "login.html";
}


