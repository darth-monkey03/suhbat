/* ─── Config ─── */
const API = 'https://suhbat.onrender.com/api';

/* ─── Helpers ─── */
const $ = id => document.getElementById(id);
const main = document.getElementById('main-content');

function formatDate(str) {
  return new Date(str).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

async function apiFetch(endpoint) {
  const res = await fetch(`${API}${endpoint}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

function youtubeId(url) {
  const match = url.match(/(?:v=|youtu\.be\/|embed\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

/* ─── Navigation ─── */
function setActiveNav(page) {
  document.querySelectorAll('.nav-link').forEach(a => {
    a.classList.toggle('active', a.dataset.page === page);
  });
}

function navigate(page, extra = null) {
  window.scrollTo(0, 0);
  setActiveNav(page);
  if (page === 'welcome') renderWelcome();
  else if (page === 'fatawa' && extra) renderFatwaArticle(extra);
  else if (page === 'fatawa') renderFatawa();
  else if (page === 'videos') renderVideos();
}

/* ─── Welcome Page ─── */
function renderWelcome() {
  document.title = 'Suhbat Ahl al-Athar';
  main.innerHTML = `
    <section class="welcome-page">
      <div class="welcome__logo" aria-label="صحبة أهل الأثر">صحبة أهل الأثر</div>
      <h1 class="welcome__name-en">Suhbat Ahl al-Athar</h1>
      <p class="welcome__name-ar">صحبة أهل الأثر</p>
      <div class="welcome__divider">
        <span class="welcome__divider-line"></span>
        <span class="welcome__divider-diamond"></span>
        <span class="welcome__divider-line"></span>
      </div>
      <blockquote class="welcome__quote" dir="rtl">
        طَلَبُ الْعِلْمِ فَرِيضَةٌ عَلَى كُلِّ مُسْلِمٍ
      </blockquote>
      <p class="welcome__quote-source">— The Prophet Muhammad ﷺ &nbsp;·&nbsp; Ibn Majah</p>
      <div class="welcome__nav-buttons">
        <button class="welcome__btn welcome__btn--primary" data-goto="fatawa">Read Fatawa</button>
        <button class="welcome__btn welcome__btn--ghost" data-goto="videos">Watch Videos</button>
      </div>
    </section>`;

  main.querySelectorAll('[data-goto]').forEach(btn => {
    btn.addEventListener('click', () => navigate(btn.dataset.goto));
  });
}

/* ─── Fatawa Page ─── */
let fatawa_search = '';
let fatawa_page   = 1;

async function renderFatawa() {
  document.title = 'Fatawa — Suhbat Ahl al-Athar';
  main.innerHTML = `
    <div class="page-header">
      <div class="container">
        <p class="page-header__label">Knowledge &amp; Rulings</p>
        <h1 class="page-header__title">Fatawa</h1>
        <p class="page-header__subtitle">Islamic legal rulings and verdicts</p>
      </div>
    </div>
    <div class="page-body">
      <div class="container">
        <div class="search-bar">
          <input class="search-bar__input" id="fatawa-search" type="search"
            placeholder="Search Fatawa…" value="${fatawa_search}" aria-label="Search Fatawa" />
        </div>
        <div class="section-label">
          <span class="section-label__text">All Fatawa</span>
          <span class="section-label__line"></span>
        </div>
        <div id="fatawa-grid" class="fatawa-grid">${loadingHTML()}</div>
        <div id="fatawa-pagination" class="pagination"></div>
      </div>
    </div>`;

  await loadFatawa();

  let timer;
  $('fatawa-search').addEventListener('input', e => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      fatawa_search = e.target.value.trim();
      fatawa_page = 1;
      loadFatawa();
    }, 380);
  });
}

async function loadFatawa() {
  const grid = $('fatawa-grid');
  if (!grid) return;
  grid.innerHTML = loadingHTML();

  try {
    const params = new URLSearchParams({ category: 'fatawa', page: fatawa_page, limit: 9 });
    if (fatawa_search) params.set('search', fatawa_search);
    const { articles, pagination } = await apiFetch(`/articles?${params}`);

    if (!articles.length) {
      grid.innerHTML = emptyHTML('No Fatawa found.');
      $('fatawa-pagination').innerHTML = '';
      return;
    }

    grid.innerHTML = articles.map(a => `
      <article class="fatwa-card" data-slug="${a.slug}">
        <p class="fatwa-card__label">Fatwa</p>
        <h2 class="fatwa-card__title">${a.title}</h2>
        <p class="fatwa-card__excerpt">${a.excerpt || ''}</p>
        <div class="fatwa-card__footer">
          <span class="fatwa-card__date">${formatDate(a.created_at)}</span>
          <span class="fatwa-card__read">Read <span class="fatwa-card__arrow">→</span></span>
        </div>
      </article>`).join('');

    grid.querySelectorAll('.fatwa-card').forEach(card => {
      card.addEventListener('click', () => navigate('fatawa', card.dataset.slug));
    });

    renderPagination('fatawa-pagination', pagination, p => { fatawa_page = p; loadFatawa(); });
  } catch (err) {
    grid.innerHTML = emptyHTML('Could not load Fatawa. Is the server running?');
  }
}

/* ─── Single Fatwa Article ─── */
async function renderFatwaArticle(slug) {
  document.title = 'Loading… — Suhbat Ahl al-Athar';
  main.innerHTML = `
    <div class="article-view">
      <div class="container--text">${loadingHTML()}</div>
    </div>`;

  try {
    const a = await apiFetch(`/articles/${slug}`);
    document.title = `${a.title} — Suhbat Ahl al-Athar`;
    main.innerHTML = `
      <div class="article-view">
        <div class="container--text">
          <button class="back-btn" id="back-btn">
            <span class="back-btn__arrow">←</span> Back to Fatawa
          </button>
          <header class="article-header">
            <p class="article-header__label">Fatwa</p>
            <h1 class="article-header__title">${a.title}</h1>
            <p class="article-header__meta">${a.author} &nbsp;·&nbsp; ${formatDate(a.created_at)}</p>
          </header>
          <div class="article-body">${a.content}</div>
        </div>
      </div>`;
    $('back-btn').addEventListener('click', () => navigate('fatawa'));
  } catch (err) {
    main.innerHTML = `
      <div class="article-view">
        <div class="container--text">
          <button class="back-btn" id="back-btn"><span class="back-btn__arrow">←</span> Back</button>
          <p>Article not found.</p>
        </div>
      </div>`;
    $('back-btn').addEventListener('click', () => navigate('fatawa'));
  }
}

/* ─── Videos Page ─── */
let videos_search = '';
let videos_page   = 1;

async function renderVideos() {
  document.title = 'Videos — Suhbat Ahl al-Athar';
  main.innerHTML = `
    <div class="page-header">
      <div class="container">
        <p class="page-header__label">Lectures &amp; Reminders</p>
        <h1 class="page-header__title">Videos</h1>
        <p class="page-header__subtitle">Watch our latest lectures and reminders</p>
      </div>
    </div>
    <div class="page-body">
      <div class="container">
        <div class="search-bar">
          <input class="search-bar__input" id="videos-search" type="search"
            placeholder="Search videos…" value="${videos_search}" aria-label="Search videos" />
        </div>
        <div class="section-label">
          <span class="section-label__text">All Videos</span>
          <span class="section-label__line"></span>
        </div>
        <div id="videos-grid" class="videos-grid">${loadingHTML()}</div>
        <div id="videos-pagination" class="pagination"></div>
      </div>
    </div>`;

  await loadVideos();

  let timer;
  $('videos-search').addEventListener('input', e => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      videos_search = e.target.value.trim();
      videos_page = 1;
      loadVideos();
    }, 380);
  });
}

async function loadVideos() {
  const grid = $('videos-grid');
  if (!grid) return;
  grid.innerHTML = loadingHTML();

  try {
    const params = new URLSearchParams({ page: videos_page, limit: 9 });
    if (videos_search) params.set('search', videos_search);
    const { videos, pagination } = await apiFetch(`/videos?${params}`);

    if (!videos.length) {
      grid.innerHTML = emptyHTML('No videos posted yet.');
      $('videos-pagination').innerHTML = '';
      return;
    }

    grid.innerHTML = videos.map(v => {
      const vid = youtubeId(v.youtube_url);
      const embedSrc = vid ? `https://www.youtube.com/embed/${vid}` : null;
      return `
        <div class="video-card">
          <div class="video-card__embed">
            ${embedSrc
              ? `<iframe src="${embedSrc}" title="${v.title}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe>`
              : `<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#fff;font-size:0.85rem;">Invalid YouTube URL</div>`
            }
          </div>
          <div class="video-card__body">
            <h2 class="video-card__title">${v.title}</h2>
            ${v.description ? `<p class="video-card__desc">${v.description}</p>` : ''}
            <div class="video-card__meta">${v.author} &nbsp;·&nbsp; ${formatDate(v.created_at)}</div>
          </div>
        </div>`;
    }).join('');

    renderPagination('videos-pagination', pagination, p => { videos_page = p; loadVideos(); window.scrollTo({top:0,behavior:'smooth'}); });
  } catch (err) {
    grid.innerHTML = emptyHTML('Could not load videos. Is the server running?');
  }
}

/* ─── Shared UI ─── */
function loadingHTML() {
  return `<div class="loading" style="grid-column:1/-1"><div class="loading__spinner"></div><p>Loading…</p></div>`;
}
function emptyHTML(msg) {
  return `<div class="empty-state" style="grid-column:1/-1"><div class="empty-state__icon">🌙</div><p>${msg}</p></div>`;
}
function renderPagination(containerId, pagination, onPage) {
  const el = $(containerId);
  if (!el) return;
  el.innerHTML = '';
  if (pagination.pages <= 1) return;
  for (let p = 1; p <= pagination.pages; p++) {
    const btn = document.createElement('button');
    btn.className = `page-btn ${p === pagination.page ? 'active' : ''}`;
    btn.textContent = p;
    btn.addEventListener('click', () => onPage(p));
    el.appendChild(btn);
  }
}

/* ─── Init ─── */
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-page]').forEach(el => {
    el.addEventListener('click', e => {
      e.preventDefault();
      navigate(el.dataset.page);
    });
  });

  const toggle = $('nav-toggle');
  const navLinks = $('nav-links');
  if (toggle && navLinks) {
    toggle.addEventListener('click', () => navLinks.classList.toggle('open'));
  }

  navigate('welcome');
});
