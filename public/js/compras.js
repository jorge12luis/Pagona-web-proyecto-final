async function cargarCompras(){
    const usuario = JSON.parse(localStorage.getItem("usuarioData")) || JSON.parse(localStorage.getItem("usuario"));
    
    if(!usuario){
        window.location.href = "login.html";
        return;
    }
    
    const usuarioId = usuario.id || usuario.usuarioId || 1;
    const contenedor = document.getElementById("contenedorCompras");
    
    contenedor.innerHTML = `
        <div class="alert alert-secondary">
            Cargando compras...
        </div>
    `;
    
    try {
        const respuesta = await fetch(`http://localhost:3000/mis-compras/${usuarioId}`);
        
        if (!respuesta.ok) {
            throw new Error("No fue posible obtener los pedidos.");
        }
        
        const data = await respuesta.json();
        
        if(!data.ventas || data.ventas.length === 0){
            contenedor.innerHTML = `
                <div class="alert alert-info">
                    No tienes pedidos todavía 😢
                </div>
            `;
            return;
        }
        
        const ventasAgrupadas = {};
        
        data.ventas.forEach(item => {
            if(!ventasAgrupadas[item.id]){
                ventasAgrupadas[item.id] = {
                    fecha: item.fecha,
                    total: item.total,
                    estado: item.estado || "Pendiente",
                    productos: []
                };
            }
            ventasAgrupadas[item.id].productos.push(item);
        });
        
        contenedor.innerHTML = "";
        
        Object.entries(ventasAgrupadas).forEach(([id, venta]) => {
            let productosHTML = "";
            
            venta.productos.forEach(producto => {
                productosHTML += `
                    <div class="producto">
                        <h5>${producto.nombre}</h5>
                        <p class="pedido-resumen">
                            Cantidad: <strong>${producto.cantidad}</strong>
                        </p>
                        <p class="pedido-resumen">
                            Subtotal: <strong>$${Number(producto.subtotal).toFixed(2)}</strong>
                        </p>
                    </div>
                `;
            });
            
            contenedor.innerHTML += `
                <div class="compra pedido">
                    <div class="pedido-header">
                        <div>
                            <h4>Pedido #${id}</h4>
                            <div class="pedido-info">
                                <p class="pedido-resumen">Fecha: <strong>${new Date(venta.fecha).toLocaleDateString()}</strong></p>
                                <p class="pedido-resumen">Total: <strong>$${Number(venta.total).toFixed(2)}</strong></p>
                            </div>
                        </div>
                        <button class="btn btn-dark btn-detalle" onclick="verDetalles(${id})">
                            Ver detalles
                        </button>
                    </div>
                    <span class="estado ${getEstadoClase(venta.estado)}">
                        ${venta.estado}
                    </span>
                    <div id="detalle-${id}" class="detalle-pedido" style="display:none;">
                        ${productosHTML}
                    </div>
                </div>
            `;
        });
        
    } catch (error) {
        contenedor.innerHTML = `
            <div class="alert alert-danger">
                Error cargando pedidos: ${error.message}
            </div>
        `;
    }
}

function getEstadoClase(estado){
    const valor = String(estado || "").toLowerCase();
    if(valor.includes("pend")) return "pendiente";
    if(valor.includes("entreg")) return "entregado";
    if(valor.includes("envi") || valor.includes("ship")) return "enviado";
    if(valor.includes("cancel")) return "cancelado";
    return "estado-generico";
}

function verDetalles(id){
    const detalle = document.getElementById(`detalle-${id}`);
    if (!detalle) return;
    detalle.style.display = detalle.style.display === "none" ? "block" : "none";
}

cargarCompras();
