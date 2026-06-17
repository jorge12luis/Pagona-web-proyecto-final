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
INSERT INTO usuarios (nombre, apellido, correo, contrasena, rol, numero_telefono, fecha_nacimiento, direccion) VALUES
('jorge','Apellido','jorge@gmail.com','123456','admin','0000000000',NULL,'CALLE 30'),
('julio','Martinez','julio763284@gmail.com','12345','admin','3017794660',NULL,'CALLE 30'),
('julio','Martinez','snack@gmail.com','12345','usuario','1234567890',NULL,'CALLE 30');
