const API = 'https://suhbat.onrender.com/api';
const PASSWORD = 'Linde0311';

const loginPage  = document.getElementById('login-page');
const adminPage  = document.getElementById('admin-page');
const loginBtn   = document.getElementById('login-btn');
const loginInput = document.getElementById('login-password');
const loginError = document.getElementById('login-error');
const logoutBtn  = document.getElementById('logout-btn');

function checkSession() {
  if (sessionStorage.getItem('admin') === 'true') {
    loginPage.style.display = 'none';
    adminPage.style.display = 'flex';
    loadList();
  }
}

loginBtn.addEventListener('click', () => {
  if (loginInput.value === PASSWORD) {
    sessionStorage.setItem('admin', 'true');
    loginPage.style.display = 'none';
    adminPage.style.display = 'flex';
    loginError.style.display = 'none';
    loadList();
  } else {
    loginError.style.display = 'block';
    loginInput.value = '';
  }
});

loginInput.addEventListener('keydown', e => { if (e.key === 'Enter') loginBtn.click(); });

logoutBtn.addEventListener('click', () => {
  sessionStorage.removeItem('admin');
  adminPage.style.display = 'none';
  loginPage.style.display = 'flex';
});

/* ─── Tabs ─── */
document.querySelectorAll('.sidebar__btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.sidebar__btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab').forEach(t => t.style.display = 'none');
    btn.classList.add('active');
    const tab = document.getElementById(`tab-${btn.dataset.tab}`);
    if (tab) tab.style.display = 'block';
    if (btn.dataset.tab === 'list') loadList();
  });
});

/* ─── Auto slug ─── */
document.getElementById('fatwa-title').addEventListener('input', e => {
  document.getElementById('fatwa-slug').value = e.target.value
    .toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');
});

/* ─── Submit Fatwa ─── */
document.getElementById('fatwa-submit').addEventListener('click', async () => {
  const btn         = document.getElementById('fatwa-submit');
  const msg         = document.getElementById('fatwa-msg');
  const title       = document.getElementById('fatwa-title').value.trim();
  const slug        = document.getElementById('fatwa-slug').value.trim();
  const excerpt     = document.getElementById('fatwa-excerpt').value.trim();
  const question    = document.getElementById('fatwa-question').value.trim();
  const content     = document.getElementById('fatwa-content').value.trim();
  const author      = document.getElementById('fatwa-author').value.trim() || 'Suhbat Ahl al-Athar';
  const category_id = document.getElementById('fatwa-category').value;
  const lang        = document.getElementById('fatwa-lang').value;

  if (!title || !slug) { showMsg(msg, 'error', 'Title and slug are required.'); return; }

  btn.disabled = true; btn.textContent = 'Publishing...';
  try {
    const res = await fetch(`${API}/articles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, slug, excerpt, question, content, category_id: Number(category_id), author, lang })
    });
    const data = await res.json();
    if (res.ok) {
      showMsg(msg, 'success', '✅ Fatwa published successfully!');
      document.getElementById('fatwa-title').value = '';
      document.getElementById('fatwa-slug').value = '';
      document.getElementById('fatwa-excerpt').value = '';
      document.getElementById('fatwa-question').value = '';
      document.getElementById('fatwa-content').value = '';
    } else { showMsg(msg, 'error', `Error: ${data.error}`); }
  } catch (err) { showMsg(msg, 'error', 'Could not connect to server.'); }
  btn.disabled = false; btn.textContent = 'Publish Fatwa';
});

/* ─── Submit Video ─── */
document.getElementById('video-submit').addEventListener('click', async () => {
  const btn         = document.getElementById('video-submit');
  const msg         = document.getElementById('video-msg');
  const title       = document.getElementById('video-title').value.trim();
  const url         = document.getElementById('video-url').value.trim();
  const desc        = document.getElementById('video-desc').value.trim();
  const author      = document.getElementById('video-author').value.trim() || 'Suhbat Ahl al-Athar';
  const category_id = document.getElementById('video-category').value;
  const lang        = document.getElementById('video-lang').value;

  if (!title || !url) { showMsg(msg, 'error', 'Title and YouTube URL are required.'); return; }

  btn.disabled = true; btn.textContent = 'Publishing...';
  try {
    const res = await fetch(`${API}/videos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, youtube_url: url, description: desc, category_id: Number(category_id), author, lang })
    });
    const data = await res.json();
    if (res.ok) {
      showMsg(msg, 'success', '✅ Video published successfully!');
      document.getElementById('video-title').value = '';
      document.getElementById('video-url').value = '';
      document.getElementById('video-desc').value = '';
    } else { showMsg(msg, 'error', `Error: ${data.error}`); }
  } catch (err) { showMsg(msg, 'error', 'Could not connect to server.'); }
  btn.disabled = false; btn.textContent = 'Publish Video';
});

/* ─── Load List ─── */
async function loadList() {
  const fatwaList  = document.getElementById('fatawa-list');
  const videosList = document.getElementById('videos-list');
  try {
    const [artRes, vidRes] = await Promise.all([
      fetch(`${API}/articles?limit=50`),
      fetch(`${API}/videos?limit=50`)
    ]);
    const artData = await artRes.json();
    const vidData = await vidRes.json();

    fatwaList.innerHTML = artData.articles.length
      ? artData.articles.map(a => `
          <div class="list-item">
            <div>
              <div class="list-item__title">${a.title}</div>
              <div class="list-item__date">${a.lang === 'ar' ? '🇸🇦 Arabic' : '🇬🇧 English'} · ${a.category_name || 'Fatawa'} · ${new Date(a.created_at).toLocaleDateString('en-GB', {day:'numeric',month:'long',year:'numeric'})}</div>
            </div>
            <button class="list-item__delete" data-type="article" data-id="${a.id}">Delete</button>
          </div>`).join('')
      : '<p style="color:#999;font-size:0.9rem;">No Fatawa yet.</p>';

    videosList.innerHTML = vidData.videos.length
      ? vidData.videos.map(v => `
          <div class="list-item">
            <div>
              <div class="list-item__title">${v.title}</div>
              <div class="list-item__date">${v.lang === 'ar' ? '🇸🇦 Arabic' : '🇬🇧 English'} · ${new Date(v.created_at).toLocaleDateString('en-GB', {day:'numeric',month:'long',year:'numeric'})}</div>
            </div>
            <button class="list-item__delete" data-type="video" data-id="${v.id}">Delete</button>
          </div>`).join('')
      : '<p style="color:#999;font-size:0.9rem;">No videos yet.</p>';

    document.querySelectorAll('.list-item__delete').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!confirm('Are you sure you want to delete this?')) return;
        const endpoint = btn.dataset.type === 'article' ? 'articles' : 'videos';
        await fetch(`${API}/${endpoint}/${btn.dataset.id}`, { method: 'DELETE' });
        loadList();
      });
    });
  } catch (err) {
    fatwaList.innerHTML  = '<p style="color:#999;">Could not load content.</p>';
    videosList.innerHTML = '<p style="color:#999;">Could not load content.</p>';
  }
}

function showMsg(el, type, text) {
  el.className = `form-msg ${type}`;
  el.textContent = text;
  el.style.display = 'block';
  setTimeout(() => { el.style.display = 'none'; }, 5000);
}

checkSession();
