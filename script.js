document.addEventListener('DOMContentLoaded', () => {

  /* ========================================
     CAROUSEL — imagens da pasta /hero/
     ======================================== */
  const carouselImages = [
    { src: 'hero/Libertadores.png',       alt: 'Copa Libertadores' },
    { src: 'hero/Champions.png',          alt: 'Champions League' },
    { src: 'hero/Premier league.png',     alt: 'Premier League' },
    { src: 'hero/Brasileirão série a.png', alt: 'Brasileirão Série A' },
    { src: 'hero/Laliga.png',             alt: 'La Liga' },
    { src: 'hero/Brasileirão série b.png', alt: 'Brasileirão Série B' },
    { src: 'hero/Sulamericana.png',       alt: 'Copa Sul-Americana' },
    { src: 'hero/Copa do brasil.png',     alt: 'Copa do Brasil' }
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
    navigator.serviceWorker.getRegistrations().then(regs => {
      regs.forEach(r => r.unregister());
    });
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  }

  let deferredPrompt = null;
  const installBtn = document.getElementById('installBtn');

  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    deferredPrompt = e;
    if (installBtn) installBtn.classList.remove('hidden');
  });

  if (installBtn) {
    installBtn.addEventListener('click', () => {
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(r => {
        deferredPrompt = null;
        installBtn.classList.add('hidden');
      });
    });
  }

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    if (installBtn) installBtn.classList.add('hidden');
  });

});
