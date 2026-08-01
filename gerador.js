/* ==========================================================
   GERADOR DO FUTEBOL TODO DIA
   ----------------------------------------------------------
   Gera:
   - /jogos/<slug>.html  → página própria de cada jogo (hero + player + texto SEO)
   - /sitemap.xml        → sitemap com a URL de cada jogo
   - injeta dados atualizados em index.html e player.html

   COMO USAR:
   1. Edite data/jogos.json (iframes, imagens, meta dos jogos)
   2. Rode:  node gerador.js
   3. Faça o deploy normal (Vercel)
   ========================================================== */

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const JOGOS_DIR = path.join(ROOT, 'jogos');
const DATA_FILE = path.join(ROOT, 'data', 'jogos.json');

const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
const baseUrl = (data.baseUrl || 'https://futeboltododia.vercel.app').replace(/\/$/, '');
const games = data.games || {};
const gameImages = data.gameImages || {};
const gameMeta = data.gameMeta || {};

const today = new Date();
const lastmod = today.toISOString().slice(0, 10);

/* ----------------------------------------------------------
   Helpers
   ---------------------------------------------------------- */
function normalize(s) {
  return String(s)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, 'e')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
}

function slugFor(key) {
  const meta = gameMeta[key] || {};
  const base = normalize(meta.name || key);
  const date = String(meta.date || '').replace(/\//g, '-');
  return (base + '-' + date).replace(/-+$/, '');
}

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function splitTeams(name) {
  const parts = String(name || '').split(/\s*x\s*/i);
  return { home: (parts[0] || '').trim(), away: (parts[1] || '').trim() };
}

function buildSeo(meta) {
  const name = meta.name || '';
  const comp = meta.comp || '';
  const date = meta.date || '';
  const time = meta.time || '';
  const { home, away } = splitTeams(name);

  const p1 = '<p><strong>' + esc(name) + '</strong> é um dos grandes jogos da ' + esc(comp) +
    '. A partida acontece' + (date ? ' no dia ' + date : '') + (time ? ', às ' + time + ' horas' : '') +
    ', e você pode assistir ao vivo, grátis e em HD direto pelo Futebol Todo Dia, sem cadastro e sem burocracia.</p>';

  let p2;
  if (home && away) {
    p2 = '<p>O duelo entre <strong>' + esc(home) + '</strong> e <strong>' + esc(away) + '</strong> promete fortes ' +
      'emoções. ' + esc(home) + ' joga para conquistar o resultado diante da sua torcida, enquanto ' + esc(away) +
      ' busca surpreender fora de casa. Cada lance vale pontos preciosos e a torcida acompanha tudo em tempo real.</p>';
  } else {
    p2 = '<p>Um confronto decisivo que vale pontos importantes na tabela. Acompanhe cada lance, os melhores momentos ' +
      'e o placar em tempo real, com transmissão rápida e estável.</p>';
  }

  const p3 = '<p>Como assistir ' + esc(name) + ' ao vivo e de graça: acesse o Futebol Todo Dia pelo celular ou ' +
    'computador, escolha o jogo na lista e clique em play. A transmissão abre no próprio navegador, sem precisar baixar ' +
    'nada, com ótima qualidade de imagem. Você também encontra aqui os placares e a programação completa de todos os ' +
    'campeonatos do dia.</p>';

  const p4 = '<p>Não perca nenhum minuto: ' + esc(comp) + ' ao vivo, resultados atualizados automaticamente e os ' +
    'jogos do dia sempre em destaque. Futebol todo dia, do jeito que o torcedor merece.</p>';

  return p1 + p2 + p3 + p4;
}

function buildTitle(meta) {
  return meta.name + ' ao vivo — ' + (meta.comp || 'Futebol') + ' (' + (meta.date || '') + ') | Futebol Todo Dia';
}

function buildDesc(meta) {
  const when = (meta.date ? ' no dia ' + meta.date : '') + (meta.time ? ' às ' + meta.time : '');
  return 'Assista ' + meta.name + ' ao vivo' + when + ' pela ' + (meta.comp || 'competição') +
    '. Transmissão grátis em HD, sem cadastro, no Futebol Todo Dia.';
}

function buildKeywords(meta) {
  const parts = [meta.name + ' ao vivo', 'assistir ' + meta.name, meta.name + ' hoje', 'assistir futebol ao vivo'];
  if (meta.comp) parts.push(meta.comp + ' ao vivo');
  parts.push('transmissão ao vivo grátis', 'futebol ao vivo hoje');
  return parts.join(', ');
}

/* ----------------------------------------------------------
   Render da página de cada jogo
   ---------------------------------------------------------- */
function renderGamePage(key) {
  const meta = gameMeta[key] || {};
  const name = meta.name || key;
  const comp = meta.comp || '';
  const date = meta.date || '';
  const time = meta.time || '';
  const stream = games[key] || '';
  const slug = slugFor(key);
  const imagePath = gameImages[key] || '';
  const canonical = baseUrl + '/jogos/' + slug + '.html';
  const ogImage = imagePath ? baseUrl + '/' + imagePath : baseUrl + '/hero/icon-pwa.webp';

  const title = buildTitle(meta);
  const desc = buildDesc(meta);
  const keywords = buildKeywords(meta);

  const seoHtml = buildSeo(meta);
  const heroTitle = name + ' ao vivo — assistir online grátis';
  const heroSubtitle = 'Assista ' + name + (date ? ' hoje, ' + date : '') + (time ? ' às ' + time : '') +
    (comp ? ', pela ' + comp : '') + ', com transmissão ao vivo em HD, rápida e sem travamentos.';

  const jsonld = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'SportsEvent',
    name: name,
    startDate: date + 'T' + (time || '00:00') + ':00',
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OnlineEventAttendanceMode',
    url: canonical,
    image: ogImage,
    description: desc,
    location: { '@type': 'Place', name: comp, address: 'Brasil' },
    organizer: { '@type': 'Organization', name: 'Futebol Todo Dia', url: baseUrl }
  });

  const related = Object.keys(games)
    .filter(k => k !== key)
    .map(k => {
      const m = gameMeta[k] || {};
      return '<a href="' + slugFor(k) + '.html" style="display:inline-block;padding:.5rem .9rem;border:1px solid rgba(255,255,255,.12);border-radius:.6rem;font-size:.8125rem;color:rgba(255,255,255,.65);text-decoration:none;transition:color .15s,border-color .15s;">' +
        esc(m.name || k) + (m.comp ? ' — ' + esc(m.comp) : '') + '</a>';
    })
    .join('\n          ');

  return `<!DOCTYPE html>
<html lang="pt-BR">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <meta name="description" content="${desc}" />
  <meta name="keywords" content="${keywords}" />
  <link rel="canonical" href="${canonical}" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${desc}" />
  <meta property="og:type" content="website" />
  <meta property="og:locale" content="pt_BR" />
  <meta property="og:url" content="${canonical}" />
  <meta property="og:image" content="${ogImage}" />
  <link rel="manifest" href="../manifest.json" />
  <meta name="google-site-verification" content="3uKwHA9zdvdntZ8tE2uO928Gsc3oMjpyEf05S2GKuBk" />
  <meta name="theme-color" content="#ff7a00" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
  <meta name="apple-mobile-web-app-title" content="Futebol Todo Dia" />
  <link rel="apple-touch-icon" href="../hero/icon-pwa.webp" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="../style.css" />
  <script type="application/ld+json">${jsonld}</script>
  <script src="https://pl30524113.effectivecpmnetwork.com/23/f1/99/23f199c4271ee0a7552ab677424f918e.js" async></script>
  <script>window.__BASE_PATH__ = '../';</script>

  <style>
    .player-card {
      max-width: 72rem;
      width: 100%;
      margin: 0 auto;
      background: #0e0e0e;
      border: 1px solid rgba(255, 255, 255, .08);
      border-radius: 1.25rem;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      box-shadow: 0 48px 96px rgba(0, 0, 0, .6);
      position: relative;
    }

    .player-wrap {
      position: relative;
      width: 100%;
      padding-top: 56.25%;
      background: #000;
      overflow: hidden;
    }

    .player-wrap iframe {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      border: none;
    }

    .player-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0, 0, 0, .55);
      cursor: pointer;
      transition: opacity .25s;
      z-index: 5;
    }

    .player-overlay.hidden {
      display: none;
    }

    .loading-spinner {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: none;
      align-items: center;
      justify-content: center;
      background: rgba(0, 0, 0, .7);
      z-index: 4;
      flex-direction: column;
      gap: 1rem;
    }

    .loading-spinner.active {
      display: flex;
    }

    .spinner-ring {
      width: 3rem;
      height: 3rem;
      border: 3px solid rgba(255, 255, 255, .1);
      border-top-color: #E53935;
      border-radius: 50%;
      animation: spin .8s linear infinite;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }

    .play-circle {
      width: 5rem;
      height: 5rem;
      border-radius: 50%;
      background: #E53935;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 0 40px rgba(229, 57, 53, .4);
      transition: transform .2s, box-shadow .2s;
    }

    .player-overlay:hover .play-circle {
      transform: scale(1.08);
      box-shadow: 0 0 60px rgba(229, 57, 53, .55);
    }

    .fs-btn {
      position: absolute;
      bottom: 1rem;
      right: 1rem;
      z-index: 10;
      width: 2.5rem;
      height: 2.5rem;
      border-radius: .5rem;
      background: rgba(0, 0, 0, .6);
      border: 1px solid rgba(255, 255, 255, .12);
      color: #fff;
      font-size: 1.25rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background .2s, transform .15s;
      -webkit-tap-highlight-color: transparent;
      touch-action: manipulation;
    }

    .fs-btn:hover {
      background: rgba(0, 0, 0, .8);
    }

    .fs-btn:active {
      transform: scale(.92);
    }

    .player-wrap:-webkit-full-screen {
      width: 100vw;
      height: 100vh;
      padding-top: 0;
    }

    .player-wrap:-moz-full-screen {
      width: 100vw;
      height: 100vh;
      padding-top: 0;
    }

    .player-wrap:fullscreen {
      width: 100vw;
      height: 100vh;
      padding-top: 0;
    }

    .player-wrap:-webkit-full-screen iframe,
    .player-wrap:-moz-full-screen iframe,
    .player-wrap:fullscreen iframe {
      width: 100%;
      height: 100%;
    }

    #adGate {
      display: none;
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 200;
      background: rgba(0, 0, 0, .92);
      justify-content: center;
      align-items: center;
      border-radius: 1.25rem;
    }

    #adGate.active {
      display: flex;
    }

    .ad-gate-card {
      background: #141414;
      border: 1px solid rgba(255, 255, 255, .08);
      border-radius: 1.25rem;
      padding: 2.5rem 2rem;
      max-width: 22rem;
      width: 90%;
      text-align: center;
    }

    .ad-gate-btn {
      display: inline-block;
      background: #E53935;
      color: #fff;
      border: none;
      border-radius: .75rem;
      padding: .85rem 2rem;
      font-size: .9rem;
      font-weight: 700;
      cursor: pointer;
      transition: transform .15s, box-shadow .15s;
      margin-top: 1.25rem;
    }

    .ad-gate-btn:hover {
      transform: scale(1.03);
      box-shadow: 0 0 20px rgba(229, 57, 53, .35);
    }

    .ad-gate-close {
      display: inline-block;
      margin-top: .75rem;
      font-size: .75rem;
      color: rgba(255, 255, 255, .3);
      cursor: pointer;
      background: none;
      border: none;
    }

    .ad-gate-close:hover {
      color: rgba(255, 255, 255, .6);
    }

    @media (max-width: 768px) {
      .player-card {
        border-radius: .75rem;
      }

      #adGate {
        border-radius: .75rem;
      }

      .fs-btn {
        width: 3rem;
        height: 3rem;
        font-size: 1.5rem;
        bottom: .75rem;
        right: .75rem;
      }
    }
  </style>
</head>

<body>

  <!-- ═══════════════ HERO HEADER ═══════════════ -->
  <header class="hero-header">
    <div class="hero-header-inner">
      <button class="hero-hamburger" id="menuBtn" aria-label="Menu">
        <span></span>
        <span></span>
        <span></span>
      </button>
      <a href="../index.html" class="hero-logo-link">
        <img src="../hero/Ao vivo.webp" alt="Futebol Todo Dia" class="hero-logo">
      </a>
      <button class="hero-search" id="searchBtn" aria-label="Pesquisar">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
      </button>
    </div>
  </header>

  <!-- ═══════════════ MENU LATERAL ═══════════════ -->
  <div class="menu-overlay" id="menuOverlay"></div>
  <nav class="side-menu" id="sideMenu">
    <div class="side-menu-header">
      <span class="side-menu-title">Menu</span>
      <button class="side-menu-close" id="menuClose" aria-label="Fechar menu">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
    <a href="../index.html" class="side-menu-link">Jogos ao vivo</a>
    <a href="#assistir" class="side-menu-link">Assistir</a>
    <a href="#jogo" class="side-menu-link">Sobre o jogo</a>
    <a href="../index.html#competitions" class="side-menu-link">Competições</a>
    <div class="side-menu-divider"></div>
  </nav>

  <!-- ═══════════════ BARRA DE PESQUISA ═══════════════ -->
  <div class="search-overlay" id="searchOverlay">
    <div class="search-bar">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.35)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
      </svg>
      <input type="text" id="searchInput" class="search-input" placeholder="Buscar campeonato ou jogo..." autocomplete="off">
      <button class="search-close" id="searchClose" aria-label="Fechar pesquisa">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
    <div class="search-results" id="searchResults"></div>
  </div>

  <!-- ═══════════════ HERO ═══════════════ -->
  <section class="hero">
    <div class="hero-glow hero-glow--purple"></div>
    <div class="hero-glow hero-glow--red"></div>
    <div class="hero-glow hero-glow--orange"></div>

    <div class="hero-content">
      <h1 class="hero-title">${heroTitle}</h1>
      <p class="hero-subtitle">${heroSubtitle}</p>
    </div>

    <div class="carousel">
      <div class="carousel-track" id="carouselTrack"></div>
    </div>
  </section>

  <!-- ═══════════════ PLAYER ═══════════════ -->
  <section id="assistir" class="sep" style="padding:4rem 0;background:#080808;">
    <div style="max-width:72rem;margin:0 auto;padding:0 1.5rem;">

      <div style="display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:1rem;margin-bottom:1.5rem;">
        <div>
          <div style="display:flex;align-items:center;gap:.5rem;flex-wrap:wrap;margin-bottom:.375rem;">
            <h2 style="font-size:1.25rem;font-weight:800;color:#fff;letter-spacing:-.02em;">${name} ao vivo</h2>
            <span style="font-size:.6875rem;font-weight:700;letter-spacing:.08em;color:#E53935;background:rgba(229,57,53,.12);border:1px solid rgba(229,57,53,.25);padding:.2rem .55rem;border-radius:99px;">${comp}</span>
          </div>
          <p style="font-size:.8125rem;color:rgba(255,255,255,.38);">${date} &bull; ${time} &bull; Transmissão grátis em HD</p>
        </div>
        <a href="../index.html" style="font-size:.8125rem;color:rgba(255,255,255,.55);text-decoration:none;font-weight:600;">&larr; Ver todos os jogos</a>
      </div>

      <div class="player-card">
        <div id="adGate">
          <div class="ad-gate-card">
            <div style="width:3rem;height:3rem;border-radius:50%;background:rgba(229,57,53,.12);display:flex;align-items:center;justify-content:center;margin:0 auto 1.25rem;">
              <span style="font-size:1.5rem;">&#128250;</span>
            </div>
            <h3 style="color:#fff;font-size:1.1rem;font-weight:700;margin-bottom:.5rem;">Assista um anuncio</h3>
            <p style="color:rgba(255,255,255,.4);font-size:.8rem;line-height:1.6;">Abra um anuncio e depois volte para a pagina.</p>
            <button class="ad-gate-btn" id="adGateBtn" onclick="watchAd()">Assistir anuncio</button>
            <br>
            <button class="ad-gate-close" onclick="history.back()">Voltar</button>
          </div>
        </div>

        <div class="player-wrap" id="playerWrap">
          <iframe id="playerFrame" src="" allow="autoplay; encrypted-media; fullscreen" allowfullscreen></iframe>
          <div class="loading-spinner" id="loadingSpinner">
            <div class="spinner-ring"></div>
            <span style="font-size:.75rem;color:rgba(255,255,255,.4);">Carregando transmissão...</span>
          </div>
          <div class="player-overlay" id="playerOverlay" onclick="startStream()">
            <div class="play-circle">
              <span style="color:#fff;font-size:1.75rem;margin-left:.2rem;">&#9654;</span>
            </div>
          </div>
          <button class="fs-btn" id="fsBtn" onclick="toggleFullscreen()" title="Tela cheia">⛶</button>
        </div>
      </div>

    </div>
  </section>

  <!-- ═══════════════ SOBRE O JOGO (SEO) ═══════════════ -->
  <section id="jogo" class="sep" style="padding:4rem 0;background:#0b0b0b;">
    <div style="max-width:64rem;margin:0 auto;padding:0 1.5rem;">

      <div style="margin-bottom:2rem;">
        <div style="display:flex;align-items:center;gap:.625rem;margin-bottom:.5rem;">
          <h2 style="font-size:1.5rem;font-weight:800;color:#fff;letter-spacing:-.02em;">${name}: onde assistir ao vivo</h2>
          <div style="width:.5rem;height:.5rem;border-radius:50%;background:#E53935;flex-shrink:0;margin-bottom:.25rem;"></div>
        </div>
        <p style="font-size:.8125rem;color:rgba(255,255,255,.28);">${comp} &bull; ${date} &bull; ${time}</p>
      </div>

      <div style="font-size:.9375rem;color:rgba(255,255,255,.55);line-height:1.85;display:grid;gap:1.25rem;">
        ${seoHtml}
      </div>

      <div style="margin-top:2.5rem;">
        <h3 style="font-size:1rem;font-weight:700;color:#fff;margin-bottom:1rem;">Outros jogos da semana</h3>
        <div style="display:flex;flex-wrap:wrap;gap:.5rem;">
          ${related}
        </div>
        <p style="margin-top:1.25rem;"><a href="../index.html" style="font-size:.875rem;font-weight:700;color:#E53935;text-decoration:none;">Ver todos os jogos ao vivo &rarr;</a></p>
      </div>

    </div>
  </section>

  <!-- ═══════════════ FOOTER ═══════════════ -->
  <footer class="sep" style="padding:1.75rem 0;background:#080808;">
    <div style="max-width:72rem;margin:0 auto;padding:0 1.5rem;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:1rem;">
      <div style="display:flex;align-items:center;gap:.625rem;">
        <div style="width:1.375rem;height:1.375rem;border-radius:50%;border:1px solid rgba(255,255,255,.12);display:flex;align-items:center;justify-content:center;">
          <div style="width:.375rem;height:.375rem;border-radius:50%;background:rgba(255,255,255,.35);"></div>
        </div>
        <span style="font-size:.6875rem;font-weight:700;letter-spacing:.12em;color:rgba(255,255,255,.22);">PLACAR AO VIVO</span>
      </div>
      <p style="font-size:.6875rem;color:rgba(255,255,255,.14);">&copy; 2025 Placar Ao Vivo. Todos os direitos reservados.</p>
    </div>
  </footer>

  <script src="../script.js"></script>
  <script>
    var streamSrc = ${JSON.stringify(stream)};

    var isTV = /(SMART-TV|Tizen|Web0S|NetCast|SonyTV|Opera TV|DTV|CrKey|AFT)/i.test(navigator.userAgent);
    var adWatched = false;
    document.getElementById('adGate').classList.add('active');

    function startStream() {
      if (!streamSrc) return;
      if (adWatched) {
        loadStream();
      } else {
        document.getElementById('adGate').classList.add('active');
      }
    }

    function loadStream() {
      var src = streamSrc + (streamSrc.includes('?') ? '&' : '?') + 'autoplay=1';
      if (isTV) {
        window.location.href = src;
        return;
      }
      var spinner = document.getElementById('loadingSpinner');
      var iframe = document.getElementById('playerFrame');
      var overlay = document.getElementById('playerOverlay');
      spinner.classList.add('active');
      overlay.classList.add('hidden');
      iframe.onload = function () { spinner.classList.remove('active'); };
      iframe.src = src;
    }

    function toggleFullscreen() {
      var el = document.getElementById('playerWrap');
      if (!document.fullscreenElement && !document.webkitFullscreenElement && !document.mozFullScreenElement) {
        if (el.requestFullscreen) el.requestFullscreen();
        else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
        else if (el.mozRequestFullScreen) el.mozRequestFullScreen();
        else if (el.msRequestFullscreen) el.msRequestFullscreen();
      } else {
        if (document.exitFullscreen) document.exitFullscreen();
        else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
        else if (document.mozCancelFullScreen) document.mozCancelFullScreen();
        else if (document.msExitFullscreen) document.msExitFullscreen();
      }
    }

    function watchAd() {
      var btn = document.getElementById('adGateBtn');
      btn.textContent = 'Carregando anuncio...';
      var adWindow = window.open('https://www.effectivecpmnetwork.com/gf2rkzyv6a?key=5a24611e71a9458466907f1a3998bd62', '_blank');
      var lost = false;
      function onBlur() { lost = true; }
      window.addEventListener('blur', onBlur);
      var check = setInterval(function () {
        if (lost || document.hidden) {
          clearInterval(check);
          window.removeEventListener('blur', onBlur);
          var poll = setInterval(function () {
            if (!document.hidden) {
              clearInterval(poll);
              adWatched = true;
              btn.textContent = 'Assistir anuncio';
              document.getElementById('adGate').classList.remove('active');
              loadStream();
            }
          }, 300);
        }
      }, 200);
      setTimeout(function () {
        clearInterval(check);
        window.removeEventListener('blur', onBlur);
        adWatched = true;
        btn.textContent = 'Assistir anuncio';
        document.getElementById('adGate').classList.remove('active');
        loadStream();
      }, 8000);
    }
  </script>
</body>

</html>
`;
}

/* ----------------------------------------------------------
   Sitemap (XML padrão + Atom 1.0)
   ---------------------------------------------------------- */
function renderSitemap() {
  const urls = ['<url>\n    <loc>' + baseUrl + '</loc>\n    <lastmod>' + lastmod + '</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>'];
  Object.keys(games).forEach(key => {
    urls.push('<url>\n    <loc>' + baseUrl + '/jogos/' + slugFor(key) + '.html</loc>\n    <lastmod>' + lastmod + '</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.8</priority>\n  </url>');
  });
  return '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  ' +
    urls.join('\n  ') + '\n</urlset>\n';
}

function renderAtomSitemap() {
  const now = today.toISOString();
  let body = '';
  Object.keys(games).forEach(key => {
    const meta = gameMeta[key] || {};
    const url = baseUrl + '/jogos/' + slugFor(key) + '.html';
    body += '  <entry>\n    <title>' + esc(meta.name || key) + ' ao vivo</title>\n' +
      '    <link href="' + url + '"/>\n    <id>' + url + '</id>\n    <updated>' + now + '</updated>\n  </entry>\n';
  });
  return '<?xml version="1.0" encoding="UTF-8"?>\n<feed xmlns="http://www.w3.org/2005/Atom">\n' +
    '  <title>Futebol Todo Dia - Jogos</title>\n  <updated>' + now + '</updated>\n' +
    body + '</feed>\n';
}

function renderTextSitemap() {
  const urls = [baseUrl];
  Object.keys(games).forEach(key => { urls.push(baseUrl + '/jogos/' + slugFor(key) + '.html'); });
  return urls.join('\n') + '\n';
}

/* ----------------------------------------------------------
   Injeção de dados em index.html e player.html
   ---------------------------------------------------------- */
function jsonBlock(keyword, varName, obj) {
  return '    ' + keyword + ' ' + varName + ' = ' + JSON.stringify(obj, null, 2) + ';';
}

function injectBetween(filePath, startMarker, endMarker, replacement) {
  const src = fs.readFileSync(filePath, 'utf8');
  const re = new RegExp('(\\/\\* ' + startMarker + ' \\*\\/)[\\s\\S]*?(\\/\\* ' + endMarker + ' \\*\\/)');
  if (!re.test(src)) {
    throw new Error('Marcadores ' + startMarker + ' nao encontrados em ' + filePath);
  }
  const out = src.replace(re, '$1\n' + replacement + '\n    $2');
  fs.writeFileSync(filePath, out, 'utf8');
}

function run() {
  /* 1. Paginas dos jogos */
  if (!fs.existsSync(JOGOS_DIR)) fs.mkdirSync(JOGOS_DIR, { recursive: true });
  const slugs = {};
  Object.keys(games).forEach(key => {
    slugs[key] = slugFor(key);
    const html = renderGamePage(key);
    fs.writeFileSync(path.join(JOGOS_DIR, slugs[key] + '.html'), html, 'utf8');
    console.log('Gerada: jogos/' + slugs[key] + '.html');
  });

  /* 2. Sitemap */
  const sitemapXml = renderSitemap();
  fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), sitemapXml, 'utf8');
  fs.writeFileSync(path.join(ROOT, 'sitemap-principal.xml'), sitemapXml, 'utf8');
  fs.writeFileSync(path.join(ROOT, 'sitemap-atom.xml'), renderAtomSitemap(), 'utf8');
  fs.writeFileSync(path.join(ROOT, 'sitemap.txt'), renderTextSitemap(), 'utf8');
  console.log('Gerado: sitemap.xml (+ sitemap-principal.xml + sitemap-atom.xml + sitemap.txt)');

  /* 3. index.html */
  const pageMap = {};
  Object.keys(games).forEach(key => { pageMap[key] = 'jogos/' + slugs[key] + '.html'; });
  injectBetween(path.join(ROOT, 'index.html'), 'GERADOR:DATA_START', 'GERADOR:DATA_END', jsonBlock('const', 'games', games));
  injectBetween(path.join(ROOT, 'index.html'), 'GERADOR:IMAGES_START', 'GERADOR:IMAGES_END', jsonBlock('const', 'gameImages', gameImages));
  injectBetween(path.join(ROOT, 'index.html'), 'GERADOR:META_START', 'GERADOR:META_END', jsonBlock('const', 'gameMeta', gameMeta));
  injectBetween(path.join(ROOT, 'index.html'), 'GERADOR:PAGES_START', 'GERADOR:PAGES_END', jsonBlock('const', 'gamePages', pageMap));
  console.log('Atualizado: index.html');

  /* 4. player.html */
  injectBetween(path.join(ROOT, 'player.html'), 'GERADOR:DATA_START', 'GERADOR:DATA_END', jsonBlock('var', 'games', games));
  console.log('Atualizado: player.html');

  console.log('\nPronto! Nao esqueca de enviar ao Vercel.');
}

run();
