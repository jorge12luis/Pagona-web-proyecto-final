CREATE DATABASE IF NOT EXISTS tienda_bolso;

USE tienda_bolso;

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

CREATE TABLE IF NOT EXISTS categorias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) DEFAULT NULL,
    descripcion TEXT DEFAULT NULL,
    imagenes VARCHAR(250) DEFAULT NULL
);
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) DEFAULT NULL,
    apellido VARCHAR(50) DEFAULT NULL,
    tipo_documento VARCHAR(50) DEFAULT "Sin Expecificacion",
    numero_documento VARCHAR(30) DEFAULT "Nro De Documento",
    correo VARCHAR(100) DEFAULT NULL,
    contrasena VARCHAR(100) DEFAULT NULL,
    rol ENUM('admin','usuario') DEFAULT 'usuario',
    numero_telefono CHAR(10) DEFAULT NULL,
    fecha_nacimiento DATE NULL,
    direccion VARCHAR(100) DEFAULT NULL,
    imagen VARCHAR(255) 
);
CREATE TABLE IF NOT EXISTS metodos_pago (
  id int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  correo_usuario varchar(255) NOT NULL,
  tipo enum('Tarjeta','Nequi','Daviplata','Transfiya') NOT NULL,
  numero varchar(50) NOT NULL,
  titular varchar(150) DEFAULT NULL,
  expiracion varchar(10) DEFAULT NULL,
  cvv varchar(10) DEFAULT NULL,
  fecha_registro timestamp NOT NULL DEFAULT current_timestamp()
);
CREATE TABLE IF NOT EXISTS productos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) DEFAULT NULL,
    precio DECIMAL(10,2) DEFAULT NULL,
    imagen VARCHAR(255) DEFAULT NULL,
    descripcion TEXT DEFAULT NULL,
    stock INT DEFAULT 0,
    categoria_id INT DEFAULT NULL,
    estado VARCHAR(200) DEFAULT NULL,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id)
);
CREATE TABLE IF NOT EXISTS pedidos (
  id int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT DEFAULT NULL,
  total decimal(10,2) DEFAULT NULL,
  estado varchar(50) DEFAULT NULL,
  fecha timestamp NOT NULL DEFAULT current_timestamp(),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);
CREATE TABLE IF NOT EXISTS detalle_pedidos (
  id int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  pedido_id int(11) DEFAULT NULL,
  producto_id int(11) DEFAULT NULL,
  cantidad int(11) DEFAULT NULL,
  subtotal decimal(10,2) DEFAULT NULL,
  precio decimal(10,2) DEFAULT NULL,
  FOREIGN KEY (pedido_id) REFERENCES pedidos(id),
  FOREIGN KEY (producto_id) REFERENCES productos(id)
);
CREATE TABLE IF NOT EXISTS ventas (
    id int AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    total DECIMAL(10,2) DEFAULT NULL,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);
CREATE TABLE IF NOT EXISTS detalle_ventas (
  id int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  venta_id int DEFAULT NULL,
  producto_id int(11) DEFAULT NULL,
  cantidad int(11) DEFAULT NULL,
  precio decimal(10,2) DEFAULT NULL,
  subtotal decimal(10,2) DEFAULT NULL,
  FOREIGN KEY (venta_id) REFERENCES ventas (id),
  FOREIGN KEY (producto_id) REFERENCES productos(id)
);

CREATE TABLE IF NOT EXISTS imagenes_productos (
  id int(11) AUTO_INCREMENT PRIMARY KEY NOT NULL,
  producto_id int(11) NOT NULL,
  imagen varchar(255) NOT NULL,
  FOREIGN KEY (producto_id) REFERENCES productos(id)
);

CREATE TABLE IF NOT EXISTS pagos (
  id int(11) NOT NULL AUTO_INCREMENT Primary KEY,
  pedido_id int(11) DEFAULT NULL,
  metodo_pago varchar(50) DEFAULT NULL,
  estado_pago varchar(50) DEFAULT NULL,
  fecha timestamp NOT NULL DEFAULT current_timestamp(),
  valor decimal(10,2) DEFAULT NULL,
  FOREIGN KEY (pedido_id) REFERENCES pedidos(id)
);
CREATE TABLE IF NOT EXISTS recuperacion_codes (
  correo varchar(255) NOT NULL Primary KEY,
  codigo varchar(10) DEFAULT NULL,
  expiracion datetime DEFAULT NULL
);
CREATE TABLE IF NOT EXISTS carrito (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    producto_id INT NOT NULL,
    color VARCHAR(50) NOT NULL,
    cantidad INT DEFAULT 1,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE
);
CREATE TABLE resenas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  producto_id int NOT NULL,
  usuario_id int NOT NULL,
  comentario TEXT NOT NULL,
  calificacion INT NOT NULL,
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (producto_id) REFERENCES productos(id),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);
INSERT INTO `productos` (`id`, `nombre`, `precio`, `imagen`, `descripcion`, `stock`, `categoria_id`, `estado`) VALUES
(3, 'Mochila urbana', 150000.00, 'img/mochila.jpg', 'Mochila moderna y resistente, perfecta para uso diario y viajes.', 15, NULL, NULL),
(4, 'Bolso Manhattan', 120000.00, '../img/bolso1.webp', 'Bolso elegante premium', 10, NULL, NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `recuperacion_codes`
--

CREATE TABLE `recuperacion_codes` (
  `correo` varchar(255) NOT NULL,
  `codigo` varchar(10) DEFAULT NULL,
  `expiracion` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) DEFAULT NULL,
  `apellido` varchar(50) DEFAULT NULL,
  `correo` varchar(100) DEFAULT NULL,
  `contrasena` varchar(100) DEFAULT NULL,
  `rol` enum('admin','usuario') DEFAULT 'usuario',
  `numero_telefono` char(10) DEFAULT NULL,
  `fecha_nacimiento` date DEFAULT NULL,
  `direccion` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` ( `nombre` , `apellido`, `correo`, `contrasena`, `rol`, `numero_telefono`, `fecha_nacimiento`, `direccion`) VALUES
('jorge', "Apellido", 'jorge@gmail', '123456', 'admin', '0000000000', '0000-00-00', "CALLE 30"),
('julio', 'Martinez', 'julio763284@gmail', '12345', 'admin', '3017794660', '0000-00-00', "CALLE 30"),
('julio', 'Martinez', 'snack@gmail.com', '12345', 'usuario', '1234567890', '0000-00-00', "CALLE 30");


CREATE TABLE `ventas` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) DEFAULT NULL,
  `total` decimal(10,2) DEFAULT NULL,
  `fecha` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `carrito`
--
ALTER TABLE `carrito`
  ADD PRIMARY KEY (`id`),
  ADD KEY `usuario_id` (`usuario_id`);

--
-- Indices de la tabla `categorias`
--
ALTER TABLE `categorias`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `detalle_pedidos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `pedido_id` (`pedido_id`),
  ADD KEY `producto_id` (`producto_id`);

--
-- Indices de la tabla `detalle_ventas`
--
ALTER TABLE `detalle_ventas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `venta_id` (`venta_id`),
  ADD KEY `producto_id` (`producto_id`);

--
-- Indices de la tabla `imagenes_productos`
--
ALTER TABLE `imagenes_productos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `producto_id` (`producto_id`);

--
-- Indices de la tabla `pagos`
--
ALTER TABLE `pagos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `pedido_id` (`pedido_id`);

--
-- Indices de la tabla `pedidos`
--
ALTER TABLE `pedidos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `usuario_id` (`usuario_id`);

--
-- Indices de la tabla `productos`
--
ALTER TABLE `productos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_categoria` (`categoria_id`);

--
-- Indices de la tabla `recuperacion_codes`
--
ALTER TABLE `recuperacion_codes`
  ADD PRIMARY KEY (`correo`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `ventas`
--
ALTER TABLE `ventas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `usuario_id` (`usuario_id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `carrito`
--
--
-- AUTO_INCREMENT de la tabla `categorias`
--
ALTER TABLE `categorias`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `detalle_pedidos`
--
ALTER TABLE `detalle_pedidos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `detalle_ventas`
--
ALTER TABLE `detalle_ventas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `imagenes_productos`
--
ALTER TABLE `imagenes_productos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `pagos`
--
ALTER TABLE `pagos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `pedidos`
--
ALTER TABLE `pedidos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `productos`
--
ALTER TABLE `productos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `ventas`
--
ALTER TABLE `ventas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `carrito`
--


--
-- Filtros para la tabla `detalle_pedidos`
--
ALTER TABLE `detalle_pedidos`
  ADD CONSTRAINT `detalle_pedidos_ibfk_1` FOREIGN KEY (`pedido_id`) REFERENCES `pedidos` (`id`),
  ADD CONSTRAINT `detalle_pedidos_ibfk_2` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`);

--
-- Filtros para la tabla `detalle_ventas`
--
ALTER TABLE `detalle_ventas`
  ADD CONSTRAINT `detalle_ventas_ibfk_1` FOREIGN KEY (`venta_id`) REFERENCES `ventas` (`id`),
  ADD CONSTRAINT `detalle_ventas_ibfk_2` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`);

--
-- Filtros para la tabla `imagenes_productos`
--
ALTER TABLE `imagenes_productos`
  ADD CONSTRAINT `imagenes_productos_ibfk_1` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `pagos`
--
ALTER TABLE `pagos`
  ADD CONSTRAINT `pagos_ibfk_1` FOREIGN KEY (`pedido_id`) REFERENCES `pedidos` (`id`);

--
-- Filtros para la tabla `pedidos`
--
ALTER TABLE `pedidos`
  ADD CONSTRAINT `pedidos_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`);

--
-- Filtros para la tabla `productos`
--
ALTER TABLE `productos`
  ADD CONSTRAINT `fk_categoria` FOREIGN KEY (`categoria_id`) REFERENCES `categorias` (`id`);

--
-- Filtros para la tabla `ventas`
--
ALTER TABLE `ventas`
  ADD CONSTRAINT `ventas_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`);
COMMIT;

ALTER TABLE usuarios
ADD COLUMN imagen VARCHAR(255);

ALTER TABLE usuarios
ADD COLUMN tipo_documento VARCHAR(50) AFTER apellido,
ADD COLUMN numero_documento VARCHAR(30) AFTER tipo_documento;


/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
