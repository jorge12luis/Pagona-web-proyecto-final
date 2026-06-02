const productos = {

    "bolso-manhattan": {
        nombre: "Bolso Manhattan",
        imagen: "../../public/images/bolso1.webp",
        precio: "$120.000"
    },

    "mochila-urban": {
        nombre: "Mochila Urban",
        imagen: "../../public/images/bolso4.webp",
        precio: "$145.000"
    },

    "cartera-noche": {
        nombre: "Cartera Noche",
        imagen: "../../public/images/bolso2.webp",
        precio: "$150.000"
    }

};

const contenedor =
document.getElementById("contenedorFavoritos");

function mostrarFavoritos(){

    contenedor.innerHTML = "";

    const favoritos =
    JSON.parse(localStorage.getItem("favoritos")) || [];

    if(favoritos.length === 0){

        contenedor.innerHTML = `
            <h2>No tienes favoritos ❤️</h2>
        `;

        return;
    }

    favoritos.forEach(id => {

        const p = productos[id];

        if(p){

            contenedor.innerHTML += `

            <div class="cardFavorito">

                <img src="${p.imagen}">

                <h2>${p.nombre}</h2>

                <p>${p.precio}</p>

                <a href="detalle_producto.html?producto=${id}">
                    Ver producto
                </a>

                <button onclick="eliminarFavorito('${id}')">
                    Eliminar
                </button>

            </div>

            `;

        }

    });

}

function eliminarFavorito(id){

    let favoritos =
    JSON.parse(localStorage.getItem("favoritos")) || [];

    favoritos = favoritos.filter(
        favorito => favorito !== id
    );

    localStorage.setItem(
        "favoritos",
        JSON.stringify(favoritos)
    );

    mostrarFavoritos();

}

function vaciarFavoritos(){

    localStorage.removeItem("favoritos");

    mostrarFavoritos();

}

mostrarFavoritos();
