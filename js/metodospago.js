document.addEventListener('DOMContentLoaded', function() {
    let usuarioData = localStorage.getItem('usuarioData');
    let usuarioGoogle = localStorage.getItem('usuarioGoogle');
    let usuario = usuarioGoogle ? JSON.parse(usuarioGoogle) : JSON.parse(usuarioData);

    if (!usuario) {
        window.location.href = '../login.html';
        return;
    }

    // CARGA INICIAL: Traer métodos existentes de la base de datos
    obtenerTarjetas(usuario.correo);

    // =========================================================================
    // VINCULACIÓN DE FORMULARIOS CON LA BASE DE DATOS (MÉTODO ANTI-DUPLICADO)
    // =========================================================================
    // Usar .onsubmit garantiza que SOLO EXISTA un escuchador activo por formulario
    const formTarjeta = document.getElementById('formTarjeta');
    if (formTarjeta) formTarjeta.onsubmit = guardarTarjeta;

    const formBilletera = document.getElementById('formBilletera');
    if (formBilletera) formBilletera.onsubmit = guardarBilletera;

    const formTransfiya = document.getElementById('formTransfiya');
    if (formTransfiya) formTransfiya.onsubmit = guardarTransfiya;


    // =========================================================================
    // FORMATEADORES DINÁMICOS DE TARJETA (MÉTODO SEGURO .oninput)
    // =========================================================================
    const inputNumero = document.getElementById('cardNumber');
    if (inputNumero) {
        inputNumero.oninput = function(e) {
            let valor = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
            let formateado = valor.match(/.{1,4}/g);
            e.target.value = formateado ? formateado.join(' ') : valor;
            document.getElementById('previewNumero').textContent = e.target.value || '•••• •••• •••• ••••';

            const bgTarjeta = document.getElementById('tarjetaVistaPrevia');
            const iconoFranquicia = document.getElementById('cardBrandIcon');
            if (valor.startsWith('4')) {
                bgTarjeta.style.background = 'linear-gradient(135deg, #1e3a8a, #3b82f6)';
                iconoFranquicia.innerHTML = '<i class="fa-brands fa-cc-visa"></i>';
            } else if (/^5[1-5]/.test(valor)) {
                bgTarjeta.style.background = 'linear-gradient(135deg, #7c2d12, #ea580c)';
                iconoFranquicia.innerHTML = '<i class="fa-brands fa-cc-mastercard"></i>';
            } else {
                bgTarjeta.style.background = 'linear-gradient(135deg, #1e1b4b, #312e81)';
                iconoFranquicia.innerHTML = '<i class="fa-solid fa-money-check"></i>';
            }
        };
    }

    const inputNombre = document.getElementById('cardName');
    if (inputNombre) {
        inputNombre.oninput = function(e) {
            document.getElementById('previewTitular').textContent = e.target.value.toUpperCase() || 'NOMBRE DEL TITULAR';
        };
    }

    const inputExpiracion = document.getElementById('cardExpiry');
    if (inputExpiracion) {
        inputExpiracion.oninput = function(e) {
            let valor = e.target.value.replace(/\//g, '').replace(/[^0-9]/gi, '');
            e.target.value = valor.length >= 2 ? valor.substring(0, 2) + '/' + valor.substring(2, 4) : valor;
            document.getElementById('previewFecha').textContent = e.target.value || 'MM/AA';
        };
    }
});

// =========================================================================
// CAMBIAR ENTRE PESTAÑAS (TARJETA / NEQUI / TRANSFIYA / QR)
// =========================================================================
function cambiarMetodo(tipo) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.pane-contenido').forEach(pane => pane.classList.remove('active'));

    const idx = (tipo === 'tarjeta') ? 0 : (tipo === 'nequi') ? 1 : (tipo === 'transfiya') ? 2 : 3;
    document.querySelectorAll('.tab-btn')[idx].classList.add('active');

    document.getElementById(`pane-${tipo}`).classList.add('active');
}

// =========================================================================
// PETICIONES AL BACKEND (FETCH)
// =========================================================================

// 1. OBTENER MÉTODOS DEL USUARIO LOGUEADO
function obtenerTarjetas(correoUsuario) {
    const lista = document.getElementById('listaTarjetas');
    if (!lista) return;
    
    fetch(`http://localhost:3000/api/obtener-metodos?correo=${correoUsuario}`)
        .then(res => res.json())
        .then(data => {
            // Limpieza absoluta del contenedor antes de inyectar HTML nuevo
            lista.innerHTML = '';
            
            if (data.success && data.tarjetas.length > 0) {
                let htmlAcumulado = ''; // Evita manipular el DOM repetitivamente dentro del bucle
                
                data.tarjetas.forEach(metodo => {
                    let icono = 'fa-solid fa-credit-card text-primary';
                    let detalle = `•••• ${metodo.numero.slice(-4)}`;
                    
                    if (metodo.tipo === 'Nequi') {
                        icono = 'fa-solid fa-mobile-screen text-danger'; 
                        detalle = `Cel: ••• ••${metodo.numero.slice(-4)}`;
                    } else if (metodo.tipo === 'Daviplata') {
                        icono = 'fa-solid fa-wallet text-danger';
                        detalle = `Cel: ••• ••${metodo.numero.slice(-4)}`;
                    } else if (metodo.tipo === 'Transfiya') {
                        icono = 'fa-solid fa-money-bill-transfer text-success';
                        detalle = `Cel: ••• ••${metodo.numero.slice(-4)}`;
                    } else if (metodo.numero.startsWith('4')) {
                        icono = 'fa-brands fa-cc-visa text-primary';
                    } else if (metodo.numero.startsWith('5')) {
                        icono = 'fa-brands fa-cc-mastercard text-warning';
                    }

                    htmlAcumulado += `
                        <div class="tarjeta-guardada-item d-flex justify-content-between align-items-center mb-2">
                            <div class="d-flex align-items-center">
                                <i class="${icono} h2 m-0 me-3"></i>
                                <div>
                                    <div class="fw-bold" style="color: #1e293b;">${metodo.tipo}</div>
                                    <small class="text-muted">${detalle}</small>
                                </div>
                            </div>
                            <button class="btn btn-sm btn-outline-danger" onclick="eliminarTarjeta(${metodo.id})">
                                <i class="fa-solid fa-trash-can"></i>
                            </button>
                        </div>
                    `;
                });
                lista.innerHTML = htmlAcumulado;
            } else {
                lista.innerHTML = `<div class="text-muted p-4 text-center bg-white rounded-4 border">No tienes métodos asociados todavía.</div>`;
            }
        })
        .catch(error => {
            console.error("Error al cargar métodos:", error);
            lista.innerHTML = `<div class="text-danger p-4 text-center bg-white rounded-4 border">Error de conexión con el servidor.</div>`;
        });
}

// 2. ENVIAR NUEVO MÉTODO AL BACKEND (CON CONTROL ANTI-RÁFAGA)
function enviarAlBackend(payload, botonSubmit) {
    let textoOriginal = "";
    
    // Bloquear físicamente el botón en pantalla mientras responde el servidor
    if (botonSubmit) {
        textoOriginal = botonSubmit.innerHTML;
        botonSubmit.disabled = true;
        botonSubmit.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Guardando...`;
    }

    fetch('http://localhost:3000/api/guardar-metodo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            alert('¡Método de pago vinculado con éxito!');
            
            // Limpiar formularios de inmediato
            document.getElementById('formTarjeta')?.reset();
            document.getElementById('formBilletera')?.reset();
            document.getElementById('formTransfiya')?.reset();
            
            // Reestablecer los valores de la tarjeta plástica visual
            const previewNum = document.getElementById('previewNumero');
            const previewTit = document.getElementById('previewTitular');
            const previewFec = document.getElementById('previewFecha');
            if (previewNum) previewNum.textContent = '•••• •••• •••• ••••';
            if (previewTit) previewTit.textContent = 'NOMBRE DEL TITULAR';
            if (previewFec) previewFec.textContent = 'MM/AA';

            // Consultar nuevamente al servidor los datos actualizados
            obtenerTarjetas(payload.correo);
        } else {
            alert('Error: ' + data.message);
        }
    })
    .catch(error => {
        console.error("Error al guardar:", error);
        alert('Hubo un problema al conectar con el servidor.');
    })
    .finally(() => {
        // Habilitar de nuevo el botón cuando termine el ciclo completo
        if (botonSubmit) {
            botonSubmit.disabled = false;
            botonSubmit.innerHTML = textoOriginal;
        }
    });
}

// 3. MANDAR EVENTO DE BORRADO
function eliminarTarjeta(id) {
    if (confirm('¿Seguro que deseas eliminar este método de pago?')) {
        let user = JSON.parse(localStorage.getItem('usuarioGoogle') || localStorage.getItem('usuarioData'));
        
        fetch(`http://localhost:3000/api/eliminar-metodo/${id}`, { method: 'DELETE' })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    obtenerTarjetas(user.correo); 
                } else {
                    alert("No se pudo eliminar: " + data.message);
                }
            })
            .catch(err => console.error("Error al eliminar:", err));
    }
}

// =========================================================================
// INTERCEPTACIÓN Y CAPTURA SEGURA DE FORMULARIOS HTML
// =========================================================================
function guardarTarjeta(event) {
    event.preventDefault();
    event.stopImmediatePropagation(); // Frena llamadas fantasmas concurrentes
    
    let user = JSON.parse(localStorage.getItem('usuarioGoogle') || localStorage.getItem('usuarioData'));
    const boton = event.target.querySelector('button[type="submit"]');
    
    enviarAlBackend({
        correo: user.correo, 
        tipo: 'Tarjeta',
        numero: document.getElementById('cardNumber').value.replace(/\s+/g, ''),
        titular: document.getElementById('cardName').value.trim().toUpperCase(), 
        expiracion: document.getElementById('cardExpiry').value.trim(), 
        cvv: document.getElementById('cardCvv').value.trim()
    }, boton);
}

function guardarBilletera(event) {
    event.preventDefault();
    event.stopImmediatePropagation();
    
    let user = JSON.parse(localStorage.getItem('usuarioGoogle') || localStorage.getItem('usuarioData'));
    const boton = event.target.querySelector('button[type="submit"]');

    enviarAlBackend({
        correo: user.correo, 
        tipo: document.getElementById('billeteraTipo').value,
        numero: document.getElementById('billeteraCelular').value.trim(), 
        titular: 'Billetera Digital', 
        expiracion: 'N/A', 
        cvv: '000'
    }, boton);
}

function guardarTransfiya(event) {
    event.preventDefault();
    event.stopImmediatePropagation();
    
    let user = JSON.parse(localStorage.getItem('usuarioGoogle') || localStorage.getItem('usuarioData'));
    const boton = event.target.querySelector('button[type="submit"]');

    enviarAlBackend({
        correo: user.correo, 
        tipo: 'Transfiya',
        numero: document.getElementById('transfiyaCelular').value.trim(), 
        titular: 'Transfiya', 
        expiracion: 'N/A', 
        cvv: '000'
    }, boton);
}