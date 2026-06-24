const API = 'https://suhbat.onrender.com/api';

/* ─── Language Data ─── */
const LANG = {
  en: {
    nav_home: 'Home', nav_fatawa: 'Fatawa', nav_videos: 'Videos',
    welcome_name_en: 'Suhbat Ahl al-Athar',
    welcome_name_ar: 'صحبة أهل الأثر',
    welcome_subtitle: 'Lectures · Reminders · Knowledge',
    welcome_quote: 'Seeking knowledge is an obligation upon every Muslim.',
    welcome_source: '— The Prophet Muhammad ﷺ · Ibn Majah',
    welcome_btn_fatawa: 'Read Fatawa',
    welcome_btn_videos: 'Watch Videos',
    fatawa_label: 'Knowledge & Rulings',
    fatawa_title: 'Fatawa',
    fatawa_subtitle: 'Islamic legal rulings and verdicts',
    fatawa_search: 'Search Fatawa…',
    fatawa_all: 'All Fatawa',
    fatawa_card_label: 'Fatwa',
    fatawa_read: 'Read',
    fatawa_back: '← Back to Fatawa',
    videos_label: 'Lectures & Reminders',
    videos_title: 'Videos',
    videos_subtitle: 'Watch our latest lectures and reminders',
    videos_search: 'Search videos…',
    videos_all: 'All Videos',
    loading: 'Loading…',
    empty_fatawa: 'No Fatawa found.',
    empty_videos: 'No videos posted yet.',
    server_error: 'Could not load content. Is the server running?',
    footer_name: 'Suhbat Ahl al-Athar — Companionship of the People of Narrations',
    footer_dua: 'May Allah accept it and make it a benefit to the Muslims. Ameen.',
    lang_btn: 'العربية',
    cat_all: 'All',
    cat_aqeedah: 'Aqeedah',
    cat_tafseer: 'Tafseer',
    cat_hadith: 'Hadith',
    cat_fiqh: 'Fiqh',
  },
  ar: {
    nav_home: 'الرئيسية', nav_fatawa: 'الفتاوى', nav_videos: 'المقاطع',
    welcome_name_en: 'صحبة أهل الأثر',
    welcome_name_ar: 'Suhbat Ahl al-Athar',
    welcome_subtitle: 'محاضرات · تذكيرات · علم',
    welcome_quote: 'طَلَبُ الْعِلْمِ فَرِيضَةٌ عَلَى كُلِّ مُسْلِمٍ',
    welcome_source: '— النبي محمد ﷺ · ابن ماجه',
    welcome_btn_fatawa: 'اقرأ الفتاوى',
    welcome_btn_videos: 'شاهد المقاطع',
    fatawa_label: 'العلم والأحكام',
    fatawa_title: 'الفتاوى',
    fatawa_subtitle: 'الأحكام الشرعية والفتاوى الإسلامية',
    fatawa_search: 'ابحث في الفتاوى…',
    fatawa_all: 'جميع الفتاوى',
    fatawa_card_label: 'فتوى',
    fatawa_read: 'اقرأ',
    fatawa_back: '← العودة إلى الفتاوى',
    videos_label: 'المحاضرات والتذكيرات',
    videos_title: 'المقاطع',
    videos_subtitle: 'شاهد أحدث محاضراتنا وتذكيراتنا',
    videos_search: 'ابحث في المقاطع…',
    videos_all: 'جميع المقاطع',
    loading: 'جارٍ التحميل…',
    empty_fatawa: 'لا توجد فتاوى بعد.',
    empty_videos: 'لا توجد مقاطع بعد.',
    server_error: 'تعذّر تحميل المحتوى.',
    footer_name: 'صحبة أهل الأثر — رفقة أهل الحديث',
    footer_dua: 'تقبّل الله منا ومنكم وجعله نفعاً للمسلمين. آمين.',
    lang_btn: 'English',
    cat_all: 'الكل',
    cat_aqeedah: 'عقيدة',
    cat_tafseer: 'تفسير',
    cat_hadith: 'حديث',
    cat_fiqh: 'فقه',
  }
};

const FATAWA_CATS = [
  { key: 'cat_all',     slug: '' },
  { key: 'cat_aqeedah', slug: 'aqeedah' },
  { key: 'cat_tafseer', slug: 'tafseer' },
  { key: 'cat_hadith',  slug: 'hadith' },
  { key: 'cat_fiqh',    slug: 'fiqh' },
];

const VIDEO_CATS = [
  { key: 'cat_all',     slug: '' },
  { key: 'cat_aqeedah', slug: 'aqeedah' },
  { key: 'cat_tafseer', slug: 'tafseer' },
  { key: 'cat_hadith',  slug: 'hadith' },
  { key: 'cat_fiqh',    slug: 'fiqh' },
];

/* ─── State ─── */
let currentLang = localStorage.getItem('lang') || 'en';
let currentView = 'welcome';
let fatawa_search = '', fatawa_page = 1, fatawa_cat = '';
let videos_search = '', videos_page = 1, videos_cat = '';

/* ─── Helpers ─── */
const $ = id => document.getElementById(id);
const main = document.getElementById('main-content');
const t = key => LANG[currentLang][key];

function formatDate(str) {
  const loc = currentLang === 'ar' ? 'ar-SA' : 'en-GB';
  return new Date(str).toLocaleDateString(loc, { day: 'numeric', month: 'long', year: 'numeric' });
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

/* ─── Update static UI ─── */
function updateUI() {
  document.querySelectorAll('.nav-link').forEach(a => {
    const map = { welcome: 'nav_home', fatawa: 'nav_fatawa', videos: 'nav_videos' };
    if (map[a.dataset.page]) a.textContent = t(map[a.dataset.page]);
  });
  const langBtn = $('lang-btn');
  if (langBtn) langBtn.textContent = t('lang_btn');
  const footerName = $('footer-name');
  const footerDua  = $('footer-dua');
  if (footerName) footerName.textContent = t('footer_name');
  if (footerDua)  footerDua.textContent  = t('footer_dua');
}

/* ─── Language toggle ─── */
function toggleLang() {
  currentLang = currentLang === 'en' ? 'ar' : 'en';
  localStorage.setItem('lang', currentLang);
  updateUI();
  if (currentView === 'welcome') renderWelcome();
  else if (currentView === 'fatawa') renderFatawa();
  else if (currentView === 'videos') renderVideos();
}

/* ─── Navigation ─── */
function setActiveNav(page) {
  document.querySelectorAll('.nav-link').forEach(a => a.classList.toggle('active', a.dataset.page === page));
}

function navigate(page, extra = null) {
  window.scrollTo(0, 0);
  currentView = page;
  setActiveNav(page);
  if (page === 'welcome') renderWelcome();
  else if (page === 'fatawa' && extra) renderFatwaArticle(extra);
  else if (page === 'fatawa') renderFatawa();
  else if (page === 'videos') renderVideos();
}

/* ─── Category bar HTML ─── */
function catBarHTML(cats, activeCat) {
  return cats.map(c => `
    <button class="cat-btn ${activeCat === c.slug ? 'active' : ''}" data-slug="${c.slug}">
      ${t(c.key)}
    </button>`).join('');
}

/* ══════════════════════════════
   WELCOME PAGE
══════════════════════════════ */
function renderWelcome() {
  document.title = 'Suhbat Ahl al-Athar';
  main.innerHTML = `
    <section class="welcome-page">
      <div class="welcome__logo">
        <img src="images/logo.png" alt="Suhbat Ahl al-Athar" style="width:clamp(120px,20vw,200px);height:clamp(120px,20vw,200px);object-fit:contain;border-radius:50%;" />
      </div>
      <h1 class="welcome__name-en">${t('welcome_name_en')}</h1>
      <p class="welcome__name-ar">${t('welcome_name_ar')}</p>
      <p style="color:rgba(255,255,255,0.5);font-size:0.85rem;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:2rem;">${t('welcome_subtitle')}</p>
      <div class="welcome__divider">
        <span class="welcome__divider-line"></span>
        <span class="welcome__divider-diamond"></span>
        <span class="welcome__divider-line"></span>
      </div>
      <blockquote class="welcome__quote" dir="${currentLang === 'ar' ? 'rtl' : 'ltr'}" style="font-family:${currentLang === 'ar' ? "'Amiri',serif" : 'inherit'}">
        ${t('welcome_quote')}
      </blockquote>
      <p class="welcome__quote-source">${t('welcome_source')}</p>
      <div class="welcome__nav-buttons">
        <button class="welcome__btn welcome__btn--primary" data-goto="fatawa">${t('welcome_btn_fatawa')}</button>
        <button class="welcome__btn welcome__btn--ghost"   data-goto="videos">${t('welcome_btn_videos')}</button>
      </div>
    </section>`;

  main.querySelectorAll('[data-goto]').forEach(btn => {
    btn.addEventListener('click', () => navigate(btn.dataset.goto));
  });
}

/* ══════════════════════════════
   FATAWA PAGE
══════════════════════════════ */
async function renderFatawa() {
  document.title = `${t('fatawa_title')} — Suhbat Ahl al-Athar`;
  main.innerHTML = `
    <div class="page-header">
      <div class="container">
        <p class="page-header__label">${t('fatawa_label')}</p>
        <h1 class="page-header__title">${t('fatawa_title')}</h1>
        <p class="page-header__subtitle">${t('fatawa_subtitle')}</p>
      </div>
    </div>
    <div class="category-bar">
      <div class="container">
        <div class="category-bar__inner" id="fatawa-cats">
          ${catBarHTML(FATAWA_CATS, fatawa_cat)}
        </div>
      </div>
    </div>
    <div class="page-body">
      <div class="container">
        <div class="search-bar">
          <input class="search-bar__input" id="fatawa-search" type="search"
            placeholder="${t('fatawa_search')}" value="${fatawa_search}" />
        </div>
        <div class="section-label">
          <span class="section-label__text">${t('fatawa_all')}</span>
          <span class="section-label__line"></span>
        </div>
        <div id="fatawa-grid" class="fatawa-grid">${loadingHTML()}</div>
        <div id="fatawa-pagination" class="pagination"></div>
      </div>
    </div>`;

  await loadFatawa();

  $('fatawa-cats').addEventListener('click', e => {
    if (!e.target.matches('.cat-btn')) return;
    fatawa_cat = e.target.dataset.slug;
    fatawa_page = 1;
    $('fatawa-cats').querySelectorAll('.cat-btn').forEach(b => b.classList.toggle('active', b.dataset.slug === fatawa_cat));
    loadFatawa();
  });

  let timer;
  $('fatawa-search').addEventListener('input', e => {
    clearTimeout(timer);
    timer = setTimeout(() => { fatawa_search = e.target.value.trim(); fatawa_page = 1; loadFatawa(); }, 380);
  });
}

async function loadFatawa() {
  const grid = $('fatawa-grid');
  if (!grid) return;
  grid.innerHTML = loadingHTML();
  try {
    const params = new URLSearchParams({ page: fatawa_page, limit: 9 });
    if (fatawa_cat) params.set('category', fatawa_cat);
    else params.set('category', 'fatawa');
    params.set('lang', currentLang);
    if (fatawa_search) params.set('search', fatawa_search);
    const { articles, pagination } = await apiFetch(`/articles?${params}`);

    if (!articles.length) { grid.innerHTML = emptyHTML(t('empty_fatawa')); $('fatawa-pagination').innerHTML = ''; return; }

    grid.innerHTML = articles.map(a => `
      <article class="fatwa-card" data-slug="${a.slug}">
        <p class="fatwa-card__label">${a.category_name || t('fatawa_card_label')}</p>
        <h2 class="fatwa-card__title">${a.title}</h2>
        <p class="fatwa-card__excerpt">${a.excerpt || ''}</p>
        <div class="fatwa-card__footer">
          <span class="fatwa-card__date">${formatDate(a.created_at)}</span>
          <span class="fatwa-card__read">${t('fatawa_read')} <span class="fatwa-card__arrow">→</span></span>
        </div>
      </article>`).join('');

    grid.querySelectorAll('.fatwa-card').forEach(card => {
      card.addEventListener('click', () => navigate('fatawa', card.dataset.slug));
    });

    renderPagination('fatawa-pagination', pagination, p => { fatawa_page = p; loadFatawa(); });
  } catch (err) {
    grid.innerHTML = emptyHTML(t('server_error'));
  }
}

async function renderFatwaArticle(slug) {
  main.innerHTML = `<div class="article-view"><div class="container--text">${loadingHTML()}</div></div>`;
  try {
    const a = await apiFetch(`/articles/${slug}`);
    document.title = `${a.title} — Suhbat Ahl al-Athar`;
    main.innerHTML = `
      <div class="article-view">
        <div class="container--text">
          <button class="back-btn" id="back-btn">
            <span class="back-btn__arrow">←</span> ${t('fatawa_back')}
          </button>
          <header class="article-header">
            <p class="article-header__label">${a.category_name || t('fatawa_card_label')}</p>
            <h1 class="article-header__title">${a.title}</h1>
            <p class="article-header__meta">${a.author} · ${formatDate(a.created_at)}</p>
          </header>
          <div class="article-body">${a.content}</div>
        </div>
      </div>`;
    $('back-btn').addEventListener('click', () => navigate('fatawa'));
  } catch (err) {
    main.innerHTML = `<div class="article-view"><div class="container--text">
      <button class="back-btn" id="back-btn"><span class="back-btn__arrow">←</span> ${t('fatawa_back')}</button>
      <p>Article not found.</p></div></div>`;
    $('back-btn').addEventListener('click', () => navigate('fatawa'));
  }
}

/* ══════════════════════════════
   VIDEOS PAGE
══════════════════════════════ */
async function renderVideos() {
  document.title = `${t('videos_title')} — Suhbat Ahl al-Athar`;
  main.innerHTML = `
    <div class="page-header">
      <div class="container">
        <p class="page-header__label">${t('videos_label')}</p>
        <h1 class="page-header__title">${t('videos_title')}</h1>
        <p class="page-header__subtitle">${t('videos_subtitle')}</p>
      </div>
    </div>
    <div class="category-bar">
      <div class="container">
        <div class="category-bar__inner" id="videos-cats">
          ${catBarHTML(VIDEO_CATS, videos_cat)}
        </div>
      </div>
    </div>
    <div class="page-body">
      <div class="container">
        <div class="search-bar">
          <input class="search-bar__input" id="videos-search" type="search"
            placeholder="${t('videos_search')}" value="${videos_search}" />
        </div>
        <div class="section-label">
          <span class="section-label__text">${t('videos_all')}</span>
          <span class="section-label__line"></span>
        </div>
        <div id="videos-grid" class="videos-grid">${loadingHTML()}</div>
        <div id="videos-pagination" class="pagination"></div>
      </div>
    </div>`;

  await loadVideos();

  $('videos-cats').addEventListener('click', e => {
    if (!e.target.matches('.cat-btn')) return;
    videos_cat = e.target.dataset.slug;
    videos_page = 1;
    $('videos-cats').querySelectorAll('.cat-btn').forEach(b => b.classList.toggle('active', b.dataset.slug === videos_cat));
    loadVideos();
  });

  let timer;
  $('videos-search').addEventListener('input', e => {
    clearTimeout(timer);
    timer = setTimeout(() => { videos_search = e.target.value.trim(); videos_page = 1; loadVideos(); }, 380);
  });
}

async function loadVideos() {
  const grid = $('videos-grid');
  if (!grid) return;
  grid.innerHTML = loadingHTML();
  try {
    const params = new URLSearchParams({ page: videos_page, limit: 9 });
    if (videos_cat) params.set('category', videos_cat);
    params.set('lang', currentLang);
    if (videos_search) params.set('search', videos_search);
    const { videos, pagination } = await apiFetch(`/videos?${params}`);

    if (!videos.length) { grid.innerHTML = emptyHTML(t('empty_videos')); $('videos-pagination').innerHTML = ''; return; }

    grid.innerHTML = videos.map(v => {
      const vid = youtubeId(v.youtube_url);
      const embedSrc = vid ? `https://www.youtube.com/embed/${vid}` : null;
      return `
        <div class="video-card">
          <div class="video-card__embed">
            ${embedSrc
              ? `<iframe src="${embedSrc}" title="${v.title}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe>`
              : `<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#fff;font-size:0.85rem;">Invalid URL</div>`}
          </div>
          <div class="video-card__body">
            <h2 class="video-card__title">${v.title}</h2>
            ${v.description ? `<p class="video-card__desc">${v.description}</p>` : ''}
            <div class="video-card__meta">${v.author} · ${formatDate(v.created_at)}</div>
          </div>
        </div>`;
    }).join('');

    renderPagination('videos-pagination', pagination, p => { videos_page = p; loadVideos(); window.scrollTo({top:0,behavior:'smooth'}); });
  } catch (err) {
    grid.innerHTML = emptyHTML(t('server_error'));
  }
}

/* ─── Shared UI ─── */
function loadingHTML() {
  return `<div class="loading" style="grid-column:1/-1"><div class="loading__spinner"></div><p>${t('loading')}</p></div>`;
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
    el.addEventListener('click', e => { e.preventDefault(); navigate(el.dataset.page); });
  });
  const toggle = $('nav-toggle');
  const navLinks = $('nav-links');
  if (toggle && navLinks) toggle.addEventListener('click', () => navLinks.classList.toggle('open'));
  const langBtn = $('lang-btn');
  if (langBtn) langBtn.addEventListener('click', toggleLang);
  updateUI();
  navigate('welcome');
});
