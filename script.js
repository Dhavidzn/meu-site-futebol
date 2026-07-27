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
  if (menuBtn) {
    menuBtn.addEventListener('click', () => {
      menuBtn.classList.toggle('active');
    });
  }

});
