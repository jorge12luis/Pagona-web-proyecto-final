function agregarFavorito(id){

    let favoritos =
    JSON.parse(localStorage.getItem("favoritos")) || [];

    if(!favoritos.includes(id)){

        favoritos.push(id);

        localStorage.setItem(
            "favoritos",
            JSON.stringify(favoritos)
        );

        alert("Producto agregado ❤️");

    }else{

        alert("Ya está en favoritos");

    }

}