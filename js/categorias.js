// Esta función recibe el id del producto
function agregarFavorito(idProducto) {

    let favoritos = [];

    let favoritosGuardados = localStorage.getItem("favoritos");

    if (favoritosGuardados != null) {

        favoritos = JSON.parse(favoritosGuardados);

    } else {

        favoritos = [];
    }

    let productoExiste = false;

    // Recorrer favoritos
    for (let i = 0; i < favoritos.length; i++) {

        if (favoritos[i] == idProducto) {

            productoExiste = true;
        }
    }

    if (productoExiste == false) {

        favoritos.push(idProducto);

        let favoritosTexto = JSON.stringify(favoritos);

        localStorage.setItem("favoritos", favoritosTexto);

        alert("Producto agregado ❤️");

    } else {

        alert("Ya está en favoritos");
    }
}