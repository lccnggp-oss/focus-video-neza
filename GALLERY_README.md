# 📸 Galería de Fotos - Focus Dron

Sistema profesional de galerías protegidas con autenticación para mostrar fotos de eventos.

## 🎯 Características

✅ **Login Seguro** - Usuario y contraseña para cada cliente  
✅ **Carrusel Dinámico** - Navegación fluida entre fotos  
✅ **Responsive** - Funciona en mobile, tablet y desktop  
✅ **Descargas** - Opción para descargar fotos individuales  
✅ **Sesiones** - Se recuerda la sesión por 24 horas  
✅ **Fácil de Actualizar** - Solo edita el archivo `gallery.js`

---

## 🚀 Cómo Usar

### Acceder a la Galería
1. Ve a `https://www.focus-dron.com.mx/gallery.html`
2. Usa las credenciales de tu cliente
3. Navega por las fotos del evento

### Credenciales de Demostración
- **Usuario:** `demo`
- **Contraseña:** `demo`

---

## 📝 Cómo Agregar Nuevos Eventos/Clientes

### Paso 1: Edita `assets/js/gallery.js`

En la sección **USERS**, agrega nuevos clientes:

```javascript
const USERS = {
    'cliente_nombre': {
        password: 'su_contraseña',
        eventId: 'evento_20250621'  // ID del evento
    }
};
```

### Paso 2: Agrega el Evento

En la sección **EVENTS**, agrega el evento con sus fotos:

```javascript
const EVENTS = {
    'evento_20250621': {
        name: 'Evento - Sábado 21 de Junio',
        date: '21 de Junio, 2025',
        photos: [
            'https://ejemplo.com/foto1.jpg',
            'https://ejemplo.com/foto2.jpg',
            'https://ejemplo.com/foto3.jpg'
        ]
    }
};
```

### Paso 3: Sube las Fotos

Hay varias opciones:

**Opción A: Usar una carpeta en el repositorio**
```
/assets/fotos/evento_20250621/
  ├── foto1.jpg
  ├── foto2.jpg
  └── foto3.jpg
```

Luego en `gallery.js`:
```javascript
'fotos/evento_20250621/foto1.jpg',
'fotos/evento_20250621/foto2.jpg',
```

**Opción B: Usar un servicio externo (recomendado)**
- Imgur
- Cloudinary
- AWS S3
- Google Drive (links compartidos)

---

## 📱 Estructura de Carpetas

```
/
├── gallery.html          (Página principal)
├── assets/
│   ├── css/
│   │   └── gallery.css   (Estilos)
│   ├── js/
│   │   └── gallery.js    (Lógica y datos)
│   ├── fotos/            (Carpeta de fotos)
│   │   └── evento_20250614/
│   │       ├── foto1.jpg
│   │       ├── foto2.jpg
│   │       └── ...
│   └── sample-photos/    (Ejemplos)
```

---

## 🔐 Seguridad

- Las credenciales están en el cliente (aplica para sitios estáticos)
- Las sesiones expiran en 24 horas
- Puedes cambiar contraseñas en `gallery.js`
- Para mayor seguridad, usa enlaces cortos y ocultos

---

## 🎨 Personalización

### Cambiar Colores
En `assets/css/gallery.css`, busca:
```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

### Cambiar Logo
En `gallery.html`, reemplaza:
```html
<h1>🎬 Focus Dron</h1>
```

### Ajustar Tamaño de Carrusel
En `gallery.css`:
```css
.carousel img {
    max-height: 600px;  /* Cambia este valor */
}
```

---

## 📋 Checklist para Cada Evento

- [ ] Fotos subidas a un servidor (Imgur, Cloudinary, carpeta local, etc.)
- [ ] Agregar evento en `EVENTS` en `gallery.js`
- [ ] Crear usuarios en `USERS` en `gallery.js`
- [ ] Hacer push a GitHub
- [ ] Compartir URLs y credenciales con clientes
- [ ] Probar con credenciales de demostración

---

## 🔧 Troubleshooting

**Las fotos no cargan:**
- Verifica que las URLs sean correctas
- Asegúrate de tener CORS habilitado si es un servidor externo

**Login no funciona:**
- Verifica que el usuario esté en mayúsculas/minúsculas correctas
- La contraseña es sensible a mayúsculas/minúsculas

**Sesión no se guarda:**
- Verifica que localStorage esté habilitado en el navegador
- Intenta en modo normal (no incógnito)

---

## 📚 Ejemplos de URLs de Fotos

### Imgur
```javascript
'https://i.imgur.com/XXXXXX.jpg'
```

### Cloudinary
```javascript
'https://res.cloudinary.com/tu-cuenta/image/upload/XXXXXX.jpg'
```

### GitHub (repositorio)
```javascript
'https://raw.githubusercontent.com/usuario/repo/main/fotos/foto1.jpg'
```

### Google Drive
```javascript
'https://drive.google.com/uc?export=view&id=FILE_ID'
```

---

## 💡 Tips

1. **Usa nombres de usuario fáciles**: `cliente1`, `boda_juan`, `evento_corporativo`
2. **Contraseñas seguras pero compartibles**: `Focus2025!`, `EventoSab14`
3. **Mantén un registro**: Haz copias de seguridad de `gallery.js` con los datos de eventos
4. **Comparte de forma segura**: Usa un método seguro para enviar credenciales

---

## 🤝 Soporte

¿Necesitas ayuda? Contacta a tu equipo de desarrollo.

**Última actualización:** 14 de Junio, 2025
