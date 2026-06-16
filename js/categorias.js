async function cargarProductos() {
    try {
        const respuesta = await fetch("http://localhost:3000/productos-catalogo");
        const data = await respuesta.json();

        if (!data.success) return;

        const contenedor = document.querySelector(".contenedor-categorias");
        contenedor.innerHTML = "";

        data.productos.forEach(producto => {
            const imagen = producto.imagen?.startsWith("../")
                ? producto.imagen
                : `../${producto.imagen}`;

            contenedor.innerHTML += `
                <div class="categoria-card">
                    <div class="favorito" onclick="agregarFavorito('${producto.slug}')">❤️</div>
                    <img src="${imagen}" alt="${producto.nombre}" onerror="this.src='../img/bolso10.jpg'">
                    <div class="categoria-info">
                        <h2>${producto.nombre}</h2>
                        <p>Stock: ${producto.stock}</p>
                        <a href="../page/detalle_producto.html?producto=${producto.slug}">
                            Ver detalle <i class="fa-solid fa-arrow-right"></i>
                        </a>
                    </div>
                </div>
            `;
        });

    } catch (error) {
        console.log("Error cargando productos:", error);
    }
}

cargarProductos();