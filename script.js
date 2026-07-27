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
      const offset = half * cardW + (half - 1) * gap;
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
    { label: 'Brasileirão Série A', type: 'campeonato' },
    { label: 'Brasileirão Série B', type: 'campeonato' },
    { label: 'Premier League', type: 'campeonato' },
    { label: 'Champions League', type: 'campeonato' },
    { label: 'La Liga', type: 'campeonato' },
    { label: 'Copa Libertadores', type: 'campeonato' },
    { label: 'Copa Sul-Americana', type: 'campeonato' },
    { label: 'Copa do Brasil', type: 'campeonato' },
    { label: 'Ao vivo', type: 'seção' },
    { label: 'Competições', type: 'seção' },
    { label: 'Sobre', type: 'seção' }
  ];

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
    searchResults.innerHTML = matches.map(m =>
      '<div class="search-result-item"><span class="sr-day">' + m.type + '</span>' + m.label + '</div>'
    ).join('') || '<div class="search-result-item" style="color:rgba(255,255,255,.2)">Nenhum resultado</div>';
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

});
