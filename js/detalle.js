const productos = {
        "bolso-manhattan": {
            title: "Bolso Manhattan",
            image: "../img/bolso1.webp",
            description: "Bolso de mano elegante con acabado en cuero sintético y herrajes dorados.",
            price: "$120.000",
            extra: "o 3 cuotas sin interés",
            stock: "Stock disponible",
            label: "Bolsos"
        },
        "mochila-urban": {
            title: "Mochila Urban",
            image: "../img/bolso4.webp",
            description: "Mochila práctica y con estilo, ideal para el día a día y viajes cortos.",
            price: "$145.000",
            extra: "Incluye garantía de calidad",
            stock: "Stock disponible",
            label: "Mochilas"
        },
        "cartera-noche": {
            title: "Cartera Noche",
            image: "../img/bolso2.webp",
            description: "Cartera de noche sofisticada con diseño minimalista y cierre seguro.",
            price: "$150.000",
            extra: "Perfecta para eventos especiales",
            stock: "Stock disponible",
            label: "Carteras"
        },
        "bolso-noir": {
            title: "Bolso Noir",
            image: "../img/bolso10.jpg",
            description: "Bolso exclusivo con líneas modernas y tejido premium.",
            price: "$160.000",
            extra: "Edición especial",
            stock: "Stock limitado",
            label: "Edición limitada"
        },
        "bolso-aurora": {
            title: "Bolso Aurora",
            image: "../img/bolso10.jpg",
            description: "Diseño luminoso con detalles cuidados, pensado para looks frescos.",
            price: "$120.000",
            extra: "Colección Primavera 2026",
            stock: "Stock disponible",
            label: "Nuevas Colecciones"
        },
        "bolso-elegance": {
            title: "Bolso Elegance",
            image: "../img/bolso2.webp",
            description: "Diseño minimalista de líneas puras y materiales suaves.",
            price: "$145.000",
            extra: "Look sofisticado",
            stock: "Stock disponible",
            label: "Nuevas Colecciones"
        },
        "bolso-soft-beige": {
            title: "Bolso Soft Beige",
            image: "../img/bolso6.webp",
            description: "Bolso con tonos suaves y un estilo natural que combina con todo.",
            price: "$135.000",
            extra: "Elegancia natural",
            stock: "Stock disponible",
            label: "Nuevas Colecciones"
        },
        "golden-edition": {
            title: "Golden Edition",
            image: "../img/banner1.jpg",
            description: "Edición exclusiva con detalles dorados y acabado premium.",
            price: "$210.000",
            extra: "Unidades limitadas",
            stock: "Stock limitado",
            label: "Edición limitada"
        },
        "black-luxe": {
            title: "Black Luxe",
            image: "../img/bolso9.jpg",
            description: "Bolso de diseño oscuro y sofisticado para un estilo nocturno impecable.",
            price: "$250.000",
            extra: "Diseño premium",
            stock: "Stock limitado",
            label: "Edición limitada"
        },
        "velvet-night": {
            title: "Velvet Night",
            image: "../img/bolso10.jpg",
            description: "Bolso con textura aterciopelada y un acabado de lujo.",
            price: "$230.000",
            extra: "Serie numerada",
            stock: "Stock limitado",
            label: "Edición limitada"
        },
        "ivory-luxe": {
            title: "Ivory Luxe",
            image: "../img/bolso4.webp",
            description: "Bolso exclusivo en tonos marfil con estilo atemporal.",
            price: "$275.000",
            extra: "Últimas unidades",
            stock: "Stock limitado",
            label: "Edición limitada"
        }
    };

    const params = new URLSearchParams(window.location.search);
    const productoId = params.get('producto');
    const producto = productos[productoId];

    if (!producto) {
        document.getElementById('productoTitulo').textContent = 'Producto no encontrado';
        document.getElementById('productoDescripcion').textContent = 'No se encontró la información de este producto. Regresa a la colección y selecciona otro.';
        document.getElementById('productoImagen').src = '../img/bolso10.jpg';
        document.getElementById('productoStock').textContent = 'No disponible';
        document.getElementById('productoEstado').textContent = 'No encontrado';
        document.getElementById('productoPrecio').textContent = '-';
        document.getElementById('productoExtra').textContent = '';
    } else {
        document.getElementById('productoImagen').src = producto.image;
        document.getElementById('productoImagen').alt = producto.title;
        document.getElementById('productoEstado').textContent = producto.label;
        document.getElementById('productoTitulo').textContent = producto.title;
        document.getElementById('productoDescripcion').textContent = producto.description;
        document.getElementById('productoPrecio').textContent = producto.price;
        document.getElementById('productoExtra').textContent = producto.extra;
        document.getElementById('productoStock').textContent = producto.stock;
    }