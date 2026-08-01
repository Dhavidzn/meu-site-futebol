document.addEventListener('DOMContentLoaded', () => {

  /* ========================================
     CAROUSEL — imagens da pasta /hero/
     ======================================== */
  const BASE = window.__BASE_PATH__ || '';
  const carouselImages = [
    { src: BASE + 'hero/Libertadores.webp',       alt: 'Copa Libertadores' },
    { src: BASE + 'hero/Champions.webp',          alt: 'Champions League' },
    { src: BASE + 'hero/Premier league.webp',     alt: 'Premier League' },
    { src: BASE + 'hero/Brasileirão série a.webp', alt: 'Brasileirão Série A' },
    { src: BASE + 'hero/Laliga.webp',             alt: 'La Liga' },
    { src: BASE + 'hero/Brasileirão série b.webp', alt: 'Brasileirão Série B' },
    { src: BASE + 'hero/Sulamericana.webp',       alt: 'Copa Sul-Americana' },
    { src: BASE + 'hero/Copa do brasil.webp',     alt: 'Copa do Brasil' }
  ];

  const track = document.getElementById('carouselTrack');
  if (track) {
    function buildCards() {
      carouselImages.forEach(img => {
        const card = document.createElement('div');
        card.className = 'carousel-card';
        card.innerHTML = '<img src="' + img.src + '" alt="' + img.alt + '" loading="lazy">';
        track.appendChild(card);
      });
    }

    buildCards();
    buildCards();

    function setCarouselOffset() {
      const cards = track.querySelectorAll('.carousel-card');
      if (cards.length === 0) return;
      const half = cards.length / 2;
      const cardW = cards[0].offsetWidth;
      const gap = parseInt(getComputedStyle(track).gap) || 24;
      const offset = half * cardW + half * gap;
      track.style.setProperty('--carousel-offset', '-' + offset + 'px');
    }

    setCarouselOffset();
    window.addEventListener('resize', setCarouselOffset);
  }

  /* ========================================
     SCROLL REVEAL
     ======================================== */
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });
  document.querySelectorAll('.anim').forEach(el => observer.observe(el));

  /* ========================================
     SMOOTH NAV
     ======================================== */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      const t = document.querySelector(a.getAttribute('href'));
      if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  /* ========================================
     HAMBURGER TOGGLE
     ======================================== */
  const menuBtn = document.getElementById('menuBtn');
  const sideMenu = document.getElementById('sideMenu');
  const menuOverlay = document.getElementById('menuOverlay');
  const menuClose = document.getElementById('menuClose');

  function openMenu() {
    menuBtn.classList.add('active');
    sideMenu.classList.add('active');
    menuOverlay.classList.add('active');
  }

  function closeMenu() {
    menuBtn.classList.remove('active');
    sideMenu.classList.remove('active');
    menuOverlay.classList.remove('active');
  }

  if (menuBtn) menuBtn.addEventListener('click', () => {
    sideMenu.classList.contains('active') ? closeMenu() : openMenu();
  });
  if (menuOverlay) menuOverlay.addEventListener('click', closeMenu);
  if (menuClose) menuClose.addEventListener('click', closeMenu);

  document.querySelectorAll('.side-menu-link').forEach(link => {
    link.addEventListener('click', () => {
      closeMenu();
      const target = document.querySelector(link.getAttribute('href'));
      if (target) setTimeout(() => target.scrollIntoView({ behavior: 'smooth', block: 'start' }), 300);
    });
  });

  /* ========================================
     SEARCH
     ======================================== */
  const searchBtn = document.getElementById('searchBtn');
  const searchOverlay = document.getElementById('searchOverlay');
  const searchInput = document.getElementById('searchInput');
  const searchClose = document.getElementById('searchClose');
  const searchResults = document.getElementById('searchResults');

  const searchables = [
    { label: 'Brasileirão Série A', type: 'campeonato', action: () => document.getElementById('competitions')?.scrollIntoView({ behavior: 'smooth' }) },
    { label: 'Brasileirão Série B', type: 'campeonato', action: () => document.getElementById('competitions')?.scrollIntoView({ behavior: 'smooth' }) },
    { label: 'Premier League', type: 'campeonato', action: () => document.getElementById('competitions')?.scrollIntoView({ behavior: 'smooth' }) },
    { label: 'Champions League', type: 'campeonato', action: () => document.getElementById('competitions')?.scrollIntoView({ behavior: 'smooth' }) },
    { label: 'La Liga', type: 'campeonato', action: () => document.getElementById('competitions')?.scrollIntoView({ behavior: 'smooth' }) },
    { label: 'Copa Libertadores', type: 'campeonato', action: () => document.getElementById('competitions')?.scrollIntoView({ behavior: 'smooth' }) },
    { label: 'Copa Sul-Americana', type: 'campeonato', action: () => document.getElementById('competitions')?.scrollIntoView({ behavior: 'smooth' }) },
    { label: 'Copa do Brasil', type: 'campeonato', action: () => document.getElementById('competitions')?.scrollIntoView({ behavior: 'smooth' }) },
    { label: 'Ao vivo', type: 'seção', action: () => document.getElementById('live')?.scrollIntoView({ behavior: 'smooth' }) },
    { label: 'Competições', type: 'seção', action: () => document.getElementById('competitions')?.scrollIntoView({ behavior: 'smooth' }) },
    { label: 'Sobre', type: 'seção', action: () => document.getElementById('sobre')?.scrollIntoView({ behavior: 'smooth' }) }
  ];

  if (typeof gameMeta !== 'undefined') {
    Object.keys(gameMeta).forEach(key => {
      const g = gameMeta[key];
      if (g && g.name) {
        searchables.push({
          label: g.name + (g.time ? ' — ' + g.date + ' ' + g.time : ''),
          type: 'jogo',
          action: () => {
            if (typeof games !== 'undefined' && games[key]) openPlayer(key);
            else document.getElementById('live')?.scrollIntoView({ behavior: 'smooth' });
          }
        });
      }
    });
  }

  function openSearch() {
    searchOverlay.classList.add('active');
    setTimeout(() => searchInput.focus(), 350);
  }

  function closeSearch() {
    searchOverlay.classList.remove('active');
    searchInput.value = '';
    searchResults.innerHTML = '';
  }

  function doSearch(query) {
    const q = query.toLowerCase().trim();
    if (!q) { searchResults.innerHTML = ''; return; }
    const matches = searchables.filter(s => s.label.toLowerCase().includes(q));
    searchResults.innerHTML = matches.map((m, i) =>
      '<div class="search-result-item" data-idx="' + i + '"><span class="sr-day">' + m.type + '</span>' + m.label + '</div>'
    ).join('') || '<div class="search-result-item" style="color:rgba(255,255,255,.2)">Nenhum resultado</div>';

    searchResults.querySelectorAll('.search-result-item[data-idx]').forEach(el => {
      el.addEventListener('click', () => {
        const idx = parseInt(el.getAttribute('data-idx'));
        if (matches[idx] && matches[idx].action) {
          closeSearch();
          matches[idx].action();
        }
      });
    });
  }

  if (searchBtn) searchBtn.addEventListener('click', openSearch);
  if (searchClose) searchClose.addEventListener('click', closeSearch);
  if (searchInput) searchInput.addEventListener('input', e => doSearch(e.target.value));

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      closeSearch();
      closeMenu();
    }
  });

  /* ========================================
     PWA — SERVICE WORKER + INSTALL
     ======================================== */
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  }

  let deferredPrompt = null;
  const installBtn = document.getElementById('installBtn');
  const btnInstall = document.getElementById('btnInstall');
  const installBanner = document.getElementById('installBanner');

  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    deferredPrompt = e;
    if (installBtn) installBtn.classList.remove('hidden');
  });

  function runInstall() {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(() => {
        deferredPrompt = null;
        if (installBtn) installBtn.classList.add('hidden');
        if (installBanner) installBanner.classList.add('hidden');
      });
      return;
    }
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);
    let msg = 'Para instalar:\n\n';
    if (isIOS) {
      msg += '1. Toque no botão Compartilhar (ícone de caixa com seta)\n2. Role para baixo e toque em "Adicionar à Tela de Início"\n3. Toque em "Adicionar"';
    } else if (isAndroid) {
      msg += '1. Toque nos 3 pontinhos do Chrome (canto superior)\n2. Toque em "Instalar app" ou "Adicionar à tela inicial"\n3. Confirme';
    } else {
      msg += '1. Clique nos 3 pontinhos do navegador (canto superior direito)\n2. Clique em "Instalar Futebol Todo Dia" ou "Adicionar à barra de ferramentas"';
    }
    alert(msg);
  }

  if (installBtn) installBtn.addEventListener('click', runInstall);
  if (btnInstall) btnInstall.addEventListener('click', runInstall);

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    if (installBtn) installBtn.classList.add('hidden');
    if (installBanner) installBanner.classList.add('hidden');
  });

});
