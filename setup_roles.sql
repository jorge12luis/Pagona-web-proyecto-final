-- Script SQL para configurar el sistema de roles
-- Ejecuta esto en tu base de datos 'tienda_bolso'

-- 1. Agregar columna de rol a la tabla usuarios (si no existe)
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS rol ENUM('usuario', 'admin') DEFAULT 'usuario';

-- 2. Actualizar usuarios existentes a 'usuario' (si es NULL)
UPDATE usuarios SET rol = 'usuario' WHERE rol IS NULL;

-- 3. (OPCIONAL) Hacer admin al primer usuario registrado
-- Reemplaza 'tu_correo@gmail.com' con el correo que quieras que sea admin
-- UPDATE usuarios SET rol = 'admin' WHERE correo = 'tu_correo@gmail.com' LIMIT 1;

-- 4. Verificar que se completó correctamente
SELECT id, nombre, correo, rol FROM usuarios;

-- Listo! El sistema de roles está configurado.
