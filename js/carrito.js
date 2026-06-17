const contenedorCarrito = document.querySelector(".carrito-items");
const subtotalHTML = document.querySelector(".fila span");
const totalHTML = document.querySelector(".total h4");

let carrito = [];

const usuarioData = JSON.parse(localStorage.getItem("usuarioData"));

if (usuarioData && usuarioData.id) {
    fetch(`http://localhost:3000/carrito/${usuarioData.id}`)
        .then(res => res.json())
        .then(data => {
            if (Array.isArray(data)) {
                carrito = data.map(item => {
                    let imagenUrl = '../img/bolso10.jpg';
                    const nombre = item.nombre ? String(item.nombre).trim() : '';
                    const nombreNorm = nombre.toLowerCase();
                    const color = item.color ? String(item.color).trim() : '';

                    function normColor(c) {
                        if (!c) return '';
                        const m = c.toLowerCase();
                        if (m.includes('marr')) return 'marron';
                        if (m.includes('ros')) return 'rosado';
                        if (m.includes('neg')) return 'negro';
                        if (m.includes('blan')) return 'blanco';
                        if (m.includes('beig')) return 'beige';
                        return m.replace(/[^a-z0-9]/g, '');
                    }

                    const colorNorm = normColor(color);

                    if (colorNorm) {
                        if (nombreNorm.includes('manhattan')) {
                            imagenUrl = `../img/manhattan-${colorNorm}.jpg`;
                        } else if (nombreNorm.includes('mochila') || nombreNorm.includes('urban')) {
                            imagenUrl = `../img/urban-${colorNorm}.jpg`;
                        } else if (nombreNorm.includes('noche') || nombreNorm.includes('cartera')) {
                            imagenUrl = `../img/noche-${colorNorm}.jpg`;
                        } else if (nombreNorm.includes('noir')) {
                            imagenUrl = `../img/noir-${colorNorm}.jpg`;
                        } else if (nombreNorm.includes('aurora')) {
                            imagenUrl = `../img/aurora-${colorNorm}.jpg`;
                        } else if (nombreNorm.includes('elegance')) {
                            imagenUrl = `../img/elegance-${colorNorm}.jpg`;
                        } else if (nombreNorm.includes('soft')) {
                            imagenUrl = `../img/softbeige-${colorNorm}.jpg`;
                        } else if (nombreNorm.includes('golden')) {
                            imagenUrl = `../img/golden-${colorNorm}.jpg`;
                        } else if (nombreNorm.includes('black')) {
                            imagenUrl = `../img/blackluxe-${colorNorm}.jpg`;
                        } else if (nombreNorm.includes('velvet')) {
                            imagenUrl = `../img/velvet-${colorNorm}.jpg`;
                        } else if (nombreNorm.includes('ivory')) {
                            imagenUrl = `../img/ivory-${colorNorm}.jpg`;
                        } else {
                            if (item.imagen) {
                                const img = String(item.imagen || '').trim();
                                imagenUrl = img.includes('img/') ? '../' + img : '../img/' + img;
                            }
                        }
                    } else if (item.imagen) {
                        const img = String(item.imagen || '').trim();
                        if (img.startsWith('http') || img.startsWith('/')) {
                            imagenUrl = img;
                        } else if (img.includes('img/')) {
                            imagenUrl = '../' + img;
                        } else {
                            imagenUrl = '../img/' + img;
                        }
                    }

                    return {
                        id: item.id,
                        nombre: item.nombre,
                        precio: Number(item.precio) || 0,
                        imagen: imagenUrl,
                        cantidad: item.cantidad || 1,
                        color: item.color || null
                    };
                });
            } else {
                carrito = [];
            }

            try { localStorage.setItem('carritoOwner', usuarioData.id); } catch(e) {}
            renderizarCarrito();
        })
        .catch(err => {
            console.log('Error cargando carrito desde servidor:', err);
            carrito = [];
            renderizarCarrito();
        });

} else {
    localStorage.removeItem('carrito');
    localStorage.removeItem('carritoOwner');
    localStorage.removeItem('totalCarrito');
    carrito = [];
    renderizarCarrito();
}

function guardarCarrito() {
    localStorage.setItem("carrito", JSON.stringify(carrito));
}

function formatearPrecio(precio) {
    return "$" + precio.toLocaleString();
}

function renderizarCarrito() {
    contenedorCarrito.innerHTML = "";

    if (carrito.length == 0) {
        contenedorCarrito.innerHTML = `<h2 class="carrito-vacio">Tu carrito está vacío</h2>`;
        subtotalHTML.textContent = "$0";
        totalHTML.textContent = "$0";
        localStorage.setItem("totalCarrito", "0");
        return;
    }

    let subtotal = 0;

    for (let i = 0; i < carrito.length; i++) {
        let producto = carrito[i];
        let totalProducto = producto.precio * producto.cantidad;
        subtotal = subtotal + totalProducto;

        let productoHTML = `
            <div class="item">
                <img src="${producto.imagen}" onerror="this.src='../img/bolso10.jpg'">
                <div class="info">
                    <h3>${producto.nombre}</h3>
                    ${producto.color ? `<p style="color:#888;font-size:0.9em;">Color: ${producto.color}</p>` : ''}
                    <p>${formatearPrecio(producto.precio)}</p>
                    <div class="cantidad">
                        <button onclick="disminuirCantidad(${i})">-</button>
                        <span>${producto.cantidad}</span>
                        <button onclick="aumentarCantidad(${i})">+</button>
                    </div>
                    <a href="#" class="eliminar" onclick="eliminarProducto(${i})">Eliminar</a>
                </div>
            </div>
        `;

        contenedorCarrito.innerHTML += productoHTML;
    }

    subtotalHTML.textContent = formatearPrecio(subtotal);
    totalHTML.textContent = formatearPrecio(subtotal);

    // Guardar total y carrito en localStorage para la pasarela de pago
    localStorage.setItem("carrito", JSON.stringify(carrito));
    localStorage.setItem("totalCarrito", subtotal);
}

function aumentarCantidad(indiceProducto) {
    carrito[indiceProducto].cantidad++;
    guardarCarrito();
    renderizarCarrito();
}

function disminuirCantidad(indiceProducto) {
    if (carrito[indiceProducto].cantidad > 1) {
        carrito[indiceProducto].cantidad--;
    } else {
        carrito.splice(indiceProducto, 1);
    }
    guardarCarrito();
    renderizarCarrito();
}

async function eliminarProducto(indiceProducto) {
    const item = carrito[indiceProducto];
    await fetch(`http://localhost:3000/carrito/${item.id}`, { method: "DELETE" });
    carrito.splice(indiceProducto, 1);
    renderizarCarrito();
}