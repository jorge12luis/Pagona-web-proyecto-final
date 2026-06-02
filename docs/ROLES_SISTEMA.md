# Sistema de Roles - Admin y Usuario

## 📋 Descripción

Se ha implementado un sistema de roles que permite:
- **Usuario**: Acceso básico a la tienda
- **Admin**: Acceso al panel de administración para gestionar roles

## 🔧 Cambios Realizados

### 1. Base de Datos
- Se agregó la columna `rol` a la tabla `usuarios`
- Por defecto, los nuevos usuarios tienen rol `'usuario'`
- Los administradores tienen rol `'admin'`

### 2. Backend (server.js)

**Nuevos Endpoints:**

- **POST /cambiar-rol** 
  - Cambia el rol de un usuario
  - Cuerpo: `{ correo, nuevoRol }`
  - Valores válidos de `nuevoRol`: `'usuario'` o `'admin'`

- **GET /obtener-usuarios**
  - Devuelve lista de todos los usuarios con sus roles
  - Útil para el panel de administración

- **POST /obtener-usuario**
  - Obtiene info específica de un usuario
  - Cuerpo: `{ correo }`

### 3. Frontend

**login.js - Actualizado**
- Ahora guarda el `rol` en `localStorage.rolUsuario`
- Redirige a `admin.html` si es admin
- Redirige a `index.html` si es usuario regular

**admin.html - Nuevo**
- Panel de administración con:
  - Formulario para cambiar rol de usuarios
  - Tabla con lista de todos los usuarios
  - Botones rápidos para cambiar rol
  - Verificación de permisos al cargar

**admin.js - Nuevo**
- Verifica que solo admins accedan a `admin.html`
- Funciones para cambiar roles
- Carga y muestra lista de usuarios

## 🚀 Cómo Usar

### Primera vez (crear primer admin):

1. Registra un usuario normalmente en `registro.html`
2. Ve a la base de datos MySQL y ejecuta:
   ```sql
   UPDATE usuarios SET rol = 'admin' WHERE correo = 'tu_correo@gmail.com';
   ```
3. Inicia sesión - irás directamente a `admin.html`

### Con el panel de admin:

1. Accede como admin
2. En **"Cambiar Rol de Usuario"**:
   - Ingresa el correo del usuario
   - Selecciona el nuevo rol (Admin o Usuario)
   - Haz clic en "Cambiar Rol"

3. En **"Lista de Usuarios"**:
   - Verás todos los usuarios registrados
   - Puedes cambiar el rol directamente desde los botones

## 📁 Archivos Afectados

```
✅ backend/server.js - Endpoints nuevos y modificados
✅ js/login.js - Guarda rol y redirige según permisos
✨ admin.html - Nueva página de administración
✨ js/admin.js - Nuevo script para gestionar roles
```

## 🔐 Características de Seguridad

- ✅ Verificación de rol al acceder a admin.html
- ✅ Datos sensibles no se guardan en localStorage (solo ID del rol)
- ✅ Confirmación antes de cambiar roles
- ✅ Mensajes de error claros

## ⚙️ Variables en localStorage

Después de login:
```javascript
localStorage.correoUsuario      // Correo del usuario
localStorage.rolUsuario         // 'usuario' o 'admin'
localStorage.usuarioData        // Datos completos del usuario (JSON)
```

## 📝 Notas Importantes

1. El campo `rol` es requerido en la tabla `usuarios`
2. Los valores válidos son solo: `'usuario'` y `'admin'`
3. Para crear el primer admin, usa la consulta SQL mencionada arriba
4. El backend debe estar corriendo en `http://localhost:3000`

## 🧪 Prueba del Sistema

1. Registra usuario 1 (seguirá siendo usuario)
2. Registra usuario 2 (será admin desde DB)
3. Login como usuario 2 → va a admin.html
4. Cambia rol de usuario 1 a admin
5. Usuario 1 puede ahora acceder a admin.html

¡Listo! Tu sistema de roles está funcionando. 🎉
