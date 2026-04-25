const lista = document.getElementById("listaCarrito");
const totalTexto = document.getElementById("total");

let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

let total = 0;

// MOSTRAR PRODUCTOS
carrito.forEach(p => {
    lista.innerHTML += `
        <div style="border:1px solid #ddd; margin:10px; padding:10px;">
            <img src="../${p.imagen}" width="100">
            <h4>${p.nombre}</h4>
            <p>$${p.precio}</p>
        </div>
    `;
    total += p.precio;
});

// TOTAL
totalTexto.textContent = "Total: $" + total;

// VACIAR
function vaciarCarrito() {
    localStorage.removeItem("carrito");
    location.reload();
}