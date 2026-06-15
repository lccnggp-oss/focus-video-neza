document.addEventListener('DOMContentLoaded', () => {
  let galleryData = null;
  let currentSession = null;
  let currentPage = 0;
  const itemsPerPage = 50;
  const selectedImages = new Set();
  let observer = null;
  let logoImage = null;

  const tabsNav = document.getElementById('tabs-nav');
  const grid = document.getElementById('gallery-grid');
  const sentinel = document.getElementById('scroll-sentinel');
  const selectionBar = document.getElementById('selection-bar');
  const selectionCount = document.getElementById('selection-count');
  const selectionActions = document.getElementById('selection-actions');
  const selectionList = document.getElementById('selection-list');
  const copyListBtn = document.getElementById('copy-list-btn');
  const whatsappBtn = document.getElementById('whatsapp-btn');
  const downloadSelectedBtn = document.getElementById('download-selected-btn');
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxClose = document.getElementById('lightbox-close');
  const watermarkCanvas = document.getElementById('watermark-canvas');
  const authModal = document.getElementById('auth-modal');
  const passwordInput = document.getElementById('password-input');
  const submitPassword = document.getElementById('submit-password');
  const authError = document.getElementById('auth-error');

  async function sha256(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  if (sessionStorage.getItem('auth') === 'true') {
    authModal.classList.add('hidden');
    initGallery();
  }

  submitPassword.addEventListener('click', async () => {
    const code = passwordInput.value.trim();
    if (!code) return;
    try {
      const hashed = await sha256(code);
      if (galleryData?.codigo_hash && hashed === galleryData.codigo_hash) {
        sessionStorage.setItem('auth', 'true');
        authModal.classList.add('hidden');
        initGallery();
      } else {
        authError.textContent = 'Código incorrecto';
        authError.classList.remove('hidden');
      }
    } catch (err) {
      authError.textContent = 'Error al verificar';
      authError.classList.remove('hidden');
    }
  });

  fetch('./gallery.json')
    .then(res => res.json())
    .then(data => {
      galleryData = data;
      if (sessionStorage.getItem('auth') === 'true') initGallery();
    })
    .catch(err => {
      console.error('Error cargando gallery.json', err);
      authError.textContent = 'Error al cargar la galería';
      authError.classList.remove('hidden');
    });

  function initGallery() {
    if (!galleryData || !galleryData.sesiones) return;
    renderTabs();
    const firstSession = Object.keys(galleryData.sesiones)[0];
    switchSession(firstSession);
    setupInfiniteScroll();
    setupLightbox();
    setupSelectionBar();
    preloadLogo();
  }

  function renderTabs() {
    tabsNav.innerHTML = '';
    Object.keys(galleryData.sesiones).forEach(sesion => {
      const btn = document.createElement('button');
      btn.className = 'tab-btn';
      btn.textContent = sesion.charAt(0).toUpperCase() + sesion.slice(1);
      btn.dataset.session = sesion;
      btn.addEventListener('click', () => switchSession(sesion));
      tabsNav.appendChild(btn);
    });
  }

  function switchSession(sesion) {
    if (currentSession === sesion) return;
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    const activeBtn = document.querySelector(`.tab-btn[data-session="${sesion}"]`);
    if (activeBtn) activeBtn.classList.add('active');
    currentSession = sesion;
    currentPage = 0;
    grid.innerHTML = '';
    loadMoreImages();
  }

  function loadMoreImages() {
    if (!currentSession || !galleryData.sesiones[currentSession]) return;
    const images = galleryData.sesiones[currentSession];
    const start = currentPage * itemsPerPage;
    const end = Math.min(start + itemsPerPage, images.length);
    if (start >= images.length) return;
    for (let i = start; i < end; i++) {
      const filename = images[i];
      const fullPath = `${currentSession}/${filename}`;
      const thumbPath = `${currentSession}/thumb_${filename}`;
      const item = createThumbnailItem(fullPath, thumbPath);
      grid.appendChild(item);
    }
    currentPage++;
  }

  function createThumbnailItem(fullPath, thumbPath) {
    const div = document.createElement('div');
    div.className = 'thumbnail-item';
    if (selectedImages.has(fullPath)) div.classList.add('selected');
    div.dataset.path = fullPath;
    const img = document.createElement('img');
    img.src = thumbPath;
    img.alt = fullPath;
    img.loading = 'lazy';
    div.appendChild(img);
    const checkBtn = document.createElement('div');
    checkBtn.className = 'select-check';
    checkBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleSelection(fullPath, div);
    });
    div.appendChild(checkBtn);
    img.addEventListener('click', (e) => {
      e.stopPropagation();
      openLightbox(fullPath);
    });
    div.addEventListener('click', (e) => {
      if (e.target === checkBtn) return;
      openLightbox(fullPath);
    });
    return div;
  }

  function toggleSelection(path, element) {
    if (selectedImages.has(path)) {
      selectedImages.delete(path);
      element.classList.remove('selected');
    } else {
      selectedImages.add(path);
      element.classList.add('selected');
    }
    updateSelectionBar();
  }

  function updateSelectionBar() {
    const count = selectedImages.size;
    if (count === 0) {
      selectionBar.classList.add('hidden');
    } else {
      selectionBar.classList.remove('hidden');
      selectionCount.textContent = `${count} foto${count !== 1 ? 's' : ''} seleccionada${count !== 1 ? 's' : ''} para Book`;
      const files = Array.from(selectedImages).map(p => p.split('/').pop());
      selectionList.value = files.join(', ');
      whatsappBtn.href = `https://wa.me/?text=${encodeURIComponent('Lista de fotos seleccionadas:\n' + files.join('\n'))}`;
    }
  }

  function setupSelectionBar() {
    selectionBar.addEventListener('click', () => {
      selectionActions.classList.toggle('hidden');
    });
    copyListBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      navigator.clipboard.writeText(selectionList.value).then(() => alert('Lista copiada al portapapeles'));
    });
    downloadSelectedBtn.addEventListener('click', async (e) => {
      e.stopPropagation();
      if (selectedImages.size === 0) return;
      const zip = new JSZip();
      const promises = [];
      for (const path of selectedImages) {
        promises.push(
          fetch(path).then(res => res.blob()).then(blob => zip.file(path, blob))
        );
      }
      await Promise.all(promises);
      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'fotos_seleccionadas.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  }

  function setupInfiniteScroll() {
    observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && currentSession) loadMoreImages();
    }, { rootMargin: '100px' });
    observer.observe(sentinel);
  }

  function openLightbox(imagePath) {
    lightboxImg.src = imagePath;
    lightbox.classList.remove('hidden');
    lightboxImg.onload = () => drawWatermark();
  }

  lightboxClose.addEventListener('click', () => {
    lightbox.classList.add('hidden');
    lightboxImg.src = '';
  });

  function preloadLogo() {
    logoImage = new Image();
    logoImage.crossOrigin = 'anonymous';
    logoImage.src = '../../logo.png';
  }

  function drawWatermark() {
    if (!logoImage || !logoImage.complete) {
      setTimeout(drawWatermark, 50);
      return;
    }
    const canvas = watermarkCanvas;
    const img = lightboxImg;
    const ctx = canvas.getContext('2d');
    const rect = img.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
    canvas.style.left = '0px';
    canvas.style.top = '0px';
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const logoWidth = Math.min(100, canvas.width * 0.2);
    const aspect = logoImage.naturalHeight / logoImage.naturalWidth;
    const logoHeight = logoWidth * aspect;
    ctx.globalAlpha = 0.2;
    ctx.drawImage(logoImage, canvas.width - logoWidth - 20, canvas.height - logoHeight - 20, logoWidth, logoHeight);
    ctx.globalAlpha = 1.0;
  }

  window.addEventListener('resize', () => {
    if (!lightbox.classList.contains('hidden')) drawWatermark();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !lightbox.classList.contains('hidden')) {
      lightbox.classList.add('hidden');
      lightboxImg.src = '';
    }
  });
});
