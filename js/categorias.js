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

            // Convierte el nombre de categoría a slug para el data-categoria
            const categoriaSlug = producto.categoria_nombre
                ? producto.categoria_nombre.toLowerCase()
                    .normalize("NFD")
                    .replace(/[\u0300-\u036f]/g, "")  // quita tildes
                    .replace(/\s+/g, "-")
                : "sin-categoria";

            contenedor.innerHTML += `
                <div class="categoria-card" data-categoria="${categoriaSlug}">
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

function filtrar(categoria, btn) {
    document.querySelectorAll('.filtros-categorias button')
        .forEach(b => b.classList.remove('activo'));
    btn.classList.add('activo');

    document.querySelectorAll('.categoria-card').forEach(card => {
        const mostrar = categoria === 'todas' || card.dataset.categoria === categoria;
        card.style.display = mostrar ? 'block' : 'none';
    });
}

cargarProductos();