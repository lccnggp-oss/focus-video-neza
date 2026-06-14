// ============ CONFIGURACIÓN DE USUARIOS Y EVENTOS ============
// ESTRUCTURA: usuario -> contraseña, evento_id
// evento_id -> nombre, fecha, fotos[]

const USERS = {
    'cliente1': {
        password: 'pass123',
        eventId: 'evento_20250614'
    },
    'cliente2': {
        password: 'pass123',
        eventId: 'evento_20250614'
    },
    'demo': {
        password: 'demo',
        eventId: 'evento_demo'
    }
};

const EVENTS = {
    'evento_20250614': {
        name: 'Evento - Sábado 14 de Junio',
        date: '14 de Junio, 2025',
        photos: [
            'assets/demo-photos/demo-1.svg',
            'assets/demo-photos/demo-2.svg',
            'assets/demo-photos/demo-3.svg',
            'assets/demo-photos/demo-4.svg',
            'assets/demo-photos/demo-5.svg'
        ]
    },
    'evento_demo': {
        name: 'Galería de Demostración',
        date: 'Galería de prueba',
        photos: [
            'assets/demo-photos/demo-1.svg',
            'assets/demo-photos/demo-2.svg',
            'assets/demo-photos/demo-3.svg',
            'assets/demo-photos/demo-4.svg',
            'assets/demo-photos/demo-5.svg'
        ]
    }
};

// ============ VARIABLES GLOBALES ============
let currentUser = null;
let currentEventId = null;
let currentPhotoIndex = 0;
let photos = [];

// ============ INICIALIZACIÓN ============
document.addEventListener('DOMContentLoaded', () => {
    // Verificar si hay sesión activa
    const savedSession = localStorage.getItem('focusGallerySession');
    if (savedSession) {
        try {
            const session = JSON.parse(savedSession);
            // Verificar si la sesión no ha expirado (24 horas)
            if (Date.now() - session.timestamp < 24 * 60 * 60 * 1000) {
                currentUser = session.user;
                loadGallery(session.eventId);
                return;
            }
        } catch (e) {
            console.log('Sesión inválida');
        }
    }
    
    // Mostrar pantalla de login
    showLoginScreen();
});

// ============ MANEJO DE LOGIN ============
function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value.trim().toLowerCase();
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('loginError');
    
    // Limpiar error previo
    errorDiv.classList.remove('show');
    
    // Validar credenciales
    if (!USERS[username]) {
        showError('Usuario no encontrado', errorDiv);
        return;
    }
    
    if (USERS[username].password !== password) {
        showError('Contraseña incorrecta', errorDiv);
        return;
    }
    
    // Login exitoso
    currentUser = username;
    const eventId = USERS[username].eventId;
    
    // Guardar sesión
    const session = {
        user: username,
        eventId: eventId,
        timestamp: Date.now()
    };
    localStorage.setItem('focusGallerySession', JSON.stringify(session));
    
    // Cargar galería
    loadGallery(eventId);
}

function showError(message, errorDiv) {
    errorDiv.textContent = message;
    errorDiv.classList.add('show');
    
    // Auto-ocultar error después de 5 segundos
    setTimeout(() => {
        errorDiv.classList.remove('show');
    }, 5000);
}

function showLoginScreen() {
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('galleryScreen').style.display = 'none';
}

// ============ MANEJO DE LOGOUT ============
function handleLogout() {
    if (confirm('¿Deseas cerrar sesión?')) {
        localStorage.removeItem('focusGallerySession');
        currentUser = null;
        currentEventId = null;
        currentPhotoIndex = 0;
        photos = [];
        document.getElementById('username').value = '';
        document.getElementById('password').value = '';
        showLoginScreen();
    }
}

// ============ CARGAR GALERÍA ============
function loadGallery(eventId) {
    if (!EVENTS[eventId]) {
        showError('Evento no encontrado', document.getElementById('loginError'));
        return;
    }
    
    currentEventId = eventId;
    const event = EVENTS[eventId];
    photos = event.photos;
    currentPhotoIndex = 0;
    
    // Actualizar información del evento
    document.getElementById('eventName').textContent = event.name;
    document.getElementById('eventDate').textContent = event.date;
    document.getElementById('clientName').textContent = `Bienvenido, ${currentUser}!`;
    
    // Cargar fotos en el carrusel
    const carousel = document.getElementById('carousel');
    carousel.innerHTML = '';
    
    photos.forEach((photo, index) => {
        const img = document.createElement('img');
        img.src = photo;
        img.alt = `Foto ${index + 1}`;
        img.onerror = () => {
            img.src = `https://via.placeholder.com/900x600?text=Foto+${index + 1}`;
        };
        carousel.appendChild(img);
    });
    
    // Crear indicadores
    createIndicators();
    
    // Actualizar información
    updatePhotoInfo();
    
    // Mostrar galería
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('galleryScreen').style.display = 'block';
}

// ============ CARRUSEL ============
function updateCarouselPosition() {
    const carousel = document.getElementById('carousel');
    const offset = -currentPhotoIndex * 100;
    carousel.style.transform = `translateX(${offset}%)`;
    
    // Actualizar indicadores
    document.querySelectorAll('.indicator').forEach((indicator, index) => {
        indicator.classList.toggle('active', index === currentPhotoIndex);
    });
    
    // Actualizar información
    updatePhotoInfo();
}

function nextPhoto() {
    if (currentPhotoIndex < photos.length - 1) {
        currentPhotoIndex++;
    } else {
        currentPhotoIndex = 0; // Volver al inicio
    }
    updateCarouselPosition();
}

function prevPhoto() {
    if (currentPhotoIndex > 0) {
        currentPhotoIndex--;
    } else {
        currentPhotoIndex = photos.length - 1; // Ir al final
    }
    updateCarouselPosition();
}

function goToPhoto(index) {
    currentPhotoIndex = index;
    updateCarouselPosition();
}

function createIndicators() {
    const indicatorsDiv = document.getElementById('indicators');
    indicatorsDiv.innerHTML = '';
    
    photos.forEach((_, index) => {
        const indicator = document.createElement('div');
        indicator.className = 'indicator';
        if (index === 0) indicator.classList.add('active');
        indicator.onclick = () => goToPhoto(index);
        indicatorsDiv.appendChild(indicator);
    });
}

function updatePhotoInfo() {
    document.getElementById('photoCounter').textContent = 
        `Foto ${currentPhotoIndex + 1} de ${photos.length}`;
    document.getElementById('photoDescription').textContent = 
        'Haz click en descargar para guardar esta foto en tu dispositivo';
}

// ============ DESCARGAS ============
function downloadPhoto() {
    if (!photos[currentPhotoIndex]) return;
    
    const link = document.createElement('a');
    link.href = photos[currentPhotoIndex];
    link.download = `focus-dron-foto-${currentPhotoIndex + 1}.jpg`;
    
    // Para la galería de demostración, mostrar mensaje
    if (currentEventId === 'evento_demo') {
        alert('Esta es una foto de demostración. En tu galería real con fotos, podrás descargar directamente.');
        return;
    }
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function downloadAll() {
    alert('Función de descarga en lote en desarrollo.\n\nEn la galería real, se comprimirán todas las fotos en un ZIP.');
    // En un sistema real, aquí irían las fotos en un archivo ZIP
}

// ============ CONTROLES DEL TECLADO ============
document.addEventListener('keydown', (event) => {
    if (document.getElementById('galleryScreen').style.display !== 'none') {
        if (event.key === 'ArrowRight') nextPhoto();
        if (event.key === 'ArrowLeft') prevPhoto();
    }
});
