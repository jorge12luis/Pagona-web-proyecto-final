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
