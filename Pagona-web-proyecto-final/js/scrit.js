// CARRUSEL
let index = 0;

function mover(direccion){
    const slides = document.getElementById("carruselFoto");
    const total = slides.children.length;

    index += direccion;

    if(index < 0) index = total - 1;
    if(index >= total) index = 0;

    slides.style.transform = `translateX(-${index * 100}%)`;
}


const productos = [
    {
        nombre:"Bolso artesanal",
        precio:120000,
        imagen:"img/bolso1.jpg"
    },
    {
        nombre:"Bolso elegante",
        precio:95000,
        imagen:"img/bolso2.jpg"
    },
    {
        nombre:"Mochila tejida",
        precio:150000,
        imagen:"img/bolso3.jpg"
    }
];

const contenedor = document.getElementById("productos");

productos.forEach(p => {
    contenedor.innerHTML += `
        <div class="cards">
            <img src="${p.imagen}">
            <h3>${p.nombre}</h3>
            <p>$${p.precio}</p>
            <button>Agregar</button>
            <button class="comprar">Comprar</button>
        </div>
    `;
});