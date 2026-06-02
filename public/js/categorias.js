function agregarFavorito(idProducto) {
    const favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];

    if (!favoritos.includes(idProducto)) {
        favoritos.push(idProducto);
        localStorage.setItem("favoritos", JSON.stringify(favoritos));
        alert("Producto agregado a favoritos");
    } else {
        alert("Ya esta en favoritos");
    }
}
