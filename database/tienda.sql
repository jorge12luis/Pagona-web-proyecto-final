CREATE DATABASE IF NOT EXISTS tienda;
USE tienda;

-- 1. TABLA CATEGORIAS
CREATE TABLE `categorias` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) DEFAULT NULL,
  `descripcion` text NOT NULL DEFAULT "No hay descripcion",
  `imagenes` varchar(250) NOT NULL DEFAULT "No ingreso imagen",
  PRIMARY KEY (`id`)
);

-- 2. TABLA USUARIOS
CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `apellido` varchar(50) NOT NULL,
  `correo` varchar(100) NOT NULL,
  `contrasena` varchar(500) NOT NULL,
  `rol` enum('admin','usuario') NOT NULL DEFAULT 'usuario',
  `numero_telefono` char(10) NOT NULL,
  `fecha_nacimiento` date DEFAULT NULL,
  `direccion` varchar(100) NOT NULL DEFAULT 'No ingreso Direccion',
  `imagen` varchar(255) NOT NULL DEFAULT "No ingreso imagen",
  PRIMARY KEY (`id`)
);

-- 3. TABLA PRODUCTOS
CREATE TABLE `productos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) DEFAULT NULL,
  `precio` decimal(10,2) DEFAULT NULL,
  `imagen` varchar(255) DEFAULT NULL,
  `descripcion` text DEFAULT NULL,
  `stock` int(11) DEFAULT 0,
  `categoria_id` int(11) DEFAULT NULL,
  `estado` varchar(200) DEFAULT NULL,
  `slug` varchar(100) DEFAULT NULL,
  `colores` varchar(255) DEFAULT 'Negro,Blanco,Beige,Marrón,Rosado',
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  CONSTRAINT `fk_categoria` FOREIGN KEY (`categoria_id`) REFERENCES `categorias` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
);

-- 4. TABLA CARRITO (Se quitaron los UNIQUE para permitir múltiples productos y colores)
CREATE TABLE `carrito` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `usuario_id` int(11) NOT NULL,
  `producto_id` int(11) NOT NULL,
  `color` varchar(50) NOT NULL,
  `cantidad` int(11) DEFAULT 1,
  `fecha` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  CONSTRAINT `carrito_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `carrito_ibfk_2` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`) ON DELETE CASCADE
);

-- 5. TABLA PEDIDOS
CREATE TABLE `pedidos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `usuario_id` int(11) DEFAULT NULL,
  `total` decimal(10,2) DEFAULT NULL,
  `estado` varchar(50) DEFAULT NULL,
  `fecha` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  CONSTRAINT `pedidos_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL
);

-- 6. TABLA DETALLE PEDIDOS (Corregida la coma faltante)
CREATE TABLE `detalle_pedidos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `pedido_id` int(11) DEFAULT NULL,
  `producto_id` int(11) DEFAULT NULL,
  `cantidad` int(11) DEFAULT NULL,
  `precio` decimal(10,2) DEFAULT NULL,
  `subtotal` decimal(10,2) DEFAULT NULL, -- <-- Aquí faltaba la coma
  PRIMARY KEY (`id`),
  CONSTRAINT `detalle_pedidos_ibfk_1` FOREIGN KEY (`pedido_id`) REFERENCES `pedidos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `detalle_pedidos_ibfk_2` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`) ON DELETE SET NULL
);

-- 7. TABLA VENTAS
CREATE TABLE `ventas` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `usuario_id` int(11) DEFAULT NULL,
  `total` decimal(10,2) DEFAULT NULL,
  `fecha` timestamp NOT NULL DEFAULT current_timestamp(),
  `estado` varchar(50) DEFAULT 'pendiente',
  PRIMARY KEY (`id`),
  CONSTRAINT `ventas_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL
);

-- 8. TABLA DETALLE VENTAS
CREATE TABLE `detalle_ventas` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `venta_id` int(11) DEFAULT NULL,
  `producto_id` int(11) DEFAULT NULL,
  `cantidad` int(11) DEFAULT NULL,
  `precio` decimal(10,2) DEFAULT NULL,
  `subtotal` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `detalle_ventas_ibfk_1` FOREIGN KEY (`venta_id`) REFERENCES `ventas` (`id`) ON DELETE CASCADE,
  CONSTRAINT `detalle_ventas_ibfk_2` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`) ON DELETE SET NULL
);

-- 9. TABLA IMAGENES PRODUCTOS
CREATE TABLE `imagenes_productos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `producto_id` int(11) NOT NULL,
  `image` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `imagenes_productos_ibfk_1` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`) ON DELETE CASCADE
);

-- 10. TABLA METODOS PAGO
CREATE TABLE `metodos_pago` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `correo_usuario` varchar(255) NOT NULL,
  `tipo` enum('Tarjeta','Nequi','Daviplata','Transfiya') NOT NULL,
  `numero` varchar(50) NOT NULL,
  `titular` varchar(150) DEFAULT NULL,
  `expiracion` varchar(10) DEFAULT NULL,
  `cvv` varchar(10) DEFAULT NULL,
  `fecha_registro` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
);

-- 11. TABLA PAGOS
CREATE TABLE `pagos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `pedido_id` int(11) DEFAULT NULL,
  `metodo_pago` varchar(50) DEFAULT NULL,
  `estado_pago` varchar(50) DEFAULT NULL,
  `fecha` timestamp NOT NULL DEFAULT current_timestamp(),
  `valor` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `pagos_ibfk_1` FOREIGN KEY (`pedido_id`) REFERENCES `pedidos` (`id`) ON DELETE SET NULL
);

-- 12. TABLA RECUPERACION CODES
CREATE TABLE `recuperacion_codes` (
  `correo` varchar(255) NOT NULL,
  `codigo` varchar(10) DEFAULT NULL,
  `expiracion` datetime DEFAULT NULL,
  PRIMARY KEY (`correo`)
);


-- =========================================================
-- SECCIÓN DE INSERCIÓN DE DATOS (INSERTS)
-- =========================================================

INSERT INTO `productos` (`id`, `nombre`, `precio`, `imagen`, `descripcion`, `stock`, `categoria_id`, `estado`, `slug`, `colores`) VALUES
(1, 'Mochila Urban', 150000.00, 'img/mochila.jpg', 'Mochila moderna y resistente, perfecta para uso diario y viajes.', 15, NULL, NULL, 'mochila-urban', 'Negro,Blanco,Beige,Marrón,Rosado'),
(2, 'Bolso Manhattan', 120000.00, '../img/bolso1.webp', 'Bolso elegante premium', 10, NULL, NULL, 'bolso-manhattan', 'Negro,Blanco,Beige,Marrón,Rosado'),
(3, 'Cartera Noche', 150000.00, 'img/bolso2.webp', NULL, 5, NULL, NULL, 'cartera-noche', 'Negro,Blanco,Beige,Marrón,Rosado'),
(4, 'Bolso Noir', 160000.00, 'img/bolso11.jpg', 'Bolso exclusivo con líneas modernas y tejido premium.', 2, NULL, NULL, 'bolso-noir', 'Negro,Blanco,Beige,Marrón,Rosado'),
(5, 'Bolso Aurora', 120000.00, 'img/bolso12.jpg', 'Diseño luminoso con detalles cuidados, pensado para looks frescos.', 8, NULL, NULL, 'bolso-aurora', 'Negro,Blanco,Beige,Marrón,Rosado,Dorado'),
(6, 'Bolso Elegance', 145000.00, 'img/bolso13.jpg', 'Diseño minimalista de líneas puras y materiales suaves.', 6, NULL, NULL, 'bolso-elegance', 'Negro,Blanco,Beige,Marrón,Rosado'),
(7, 'Bolso Soft Beige', 135000.00, 'img/bolso14.jpg', 'Bolso con tonos suaves y un estilo natural que combina con todo.', 4, NULL, NULL, 'bolso-soft-beige', NULL),
(8, 'Golden Edition', 210000.00, 'img/bolso15.jpg', 'Edición exclusiva con detalles dorados y acabado premium.', 1, NULL, NULL, 'golden-edition', 'Negro,Blanco,Beige,Marrón,Rosado'),
(9, 'Black Luxe', 250000.00, 'img/bolso16.jpg', 'Bolso de diseño oscuro y sofisticado para un estilo nocturno impecable.', 3, NULL, NULL, 'black-luxe', 'Negro,Blanco,Beige,Marrón,Rosado'),
(10, 'Velvet Night', 230000.00, 'img/bolso17.jpg', 'Bolso con textura aterciopelada y un acabado de lujo.', 0, NULL, NULL, 'velvet-night', 'Negro,Blanco,Beige,Marrón,Rosado'),
(11, 'Ivory Luxe', 275000.00, 'img/bolso18.jpg', 'Bolso exclusivo en tonos marfil con estilo atemporal.', 2, NULL, NULL, 'ivory-luxe', 'Negro,Blanco,Beige,Marrón,Rosado');

INSERT INTO `usuarios` (`id`, `nombre`, `apellido`, `correo`, `contrasena`, `rol`, `numero_telefono`, `fecha_nacimiento`, `direccion`, `imagen`) VALUES
(1, 'jorge', 'Apellido', 'jorge@gmail.com', '123456', 'admin', '0000000000', NULL, 'CALLE 30', "No ingreso imagen"),
(2, 'julio', 'Martinez', 'julio763284@gmail.com', '12345', 'admin', '3017794660', NULL, 'CALLE 30', "No ingreso imagen"),
(3, 'julio', 'Martinez', 'snack@gmail.com', '12345', 'usuario', '1234567890', NULL, 'CALLE 30', "No ingreso imagen");

INSERT INTO `carrito` (`id`, `usuario_id`, `producto_id`, `color`, `cantidad`, `fecha`) VALUES
(49, 3, 4, 'Rosado', 1, '2026-06-11 18:28:36'),
(50, 3, 4, 'Negro', 1, '2026-06-11 18:28:50'),
(52, 3, 6, 'Rosado', 1, '2026-06-11 18:32:47'),
(54, 3, 4, 'Marrón', 1, '2026-06-11 18:34:11'),
(55, 3, 6, 'Blanco', 1, '2026-06-11 18:39:18'),
(57, 3, 6, 'Negro', 1, '2026-06-11 18:39:26'),
(59, 3, 6, 'Marrón', 1, '2026-06-11 18:41:19');