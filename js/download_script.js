
/* ── Mobile menu ── */
function toggleMenu() {
  const m = document.getElementById('mobileMenu');
  const b = document.getElementById('menuBtn');
  m.classList.toggle('open');
  b.textContent = m.classList.contains('open') ? '✕' : '☰';
}

/* ── Audio pool ── */
const audioMap = new WeakMap();
function getAudio(playerEl) {
  if (!audioMap.has(playerEl)) audioMap.set(playerEl, new Audio(playerEl.dataset.src));
  return audioMap.get(playerEl);
}

let currentPlayer = null;

/* ── Play / Pause ── */
function togglePlay(btn) {
  const playerEl = btn.closest('.mini-player');
  const audio = getAudio(playerEl);

  if (currentPlayer && currentPlayer !== playerEl) {
    const prev = audioMap.get(currentPlayer);
    if (prev) { prev.pause(); prev.currentTime = 0; }
    resetPlayerUI(currentPlayer);
  }

  if (audio.paused) {
    audio.play().catch(() => showToast('⚠️ Attach a real audio file to hear preview'));
    currentPlayer = playerEl;
    btn.innerHTML = '<svg viewBox="0 0 24 24" style="fill:#1a0033"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>';

    audio.ontimeupdate = () => {
      const fill = playerEl.querySelector('.progress-fill');
      const time = playerEl.querySelector('.player-time');
      const pct = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
      fill.style.width = pct + '%';
      time.textContent = fmt(audio.currentTime) + ' / ' + fmt(audio.duration || 0);
    };
    audio.onended = () => resetPlayerUI(playerEl);
  } else {
    audio.pause();
    btn.innerHTML = '<svg viewBox="0 0 24 24" style="fill:#1a0033"><polygon points="5,3 19,12 5,21"/></svg>';
  }
}

function resetPlayerUI(playerEl) {
  const btn = playerEl.querySelector('.btn-play');
  if (btn) btn.innerHTML = '<svg viewBox="0 0 24 24" style="fill:#1a0033"><polygon points="5,3 19,12 5,21"/></svg>';
  const fill = playerEl.querySelector('.progress-fill');
  if (fill) fill.style.width = '0%';
}

function fmt(s) {
  if (!s || isNaN(s)) return '0:00';
  const m = Math.floor(s / 60), sec = Math.floor(s % 60);
  return m + ':' + (sec < 10 ? '0' : '') + sec;
}

function seekTo(wrap, e) {
  const playerEl = wrap.closest('.mini-player');
  const audio = getAudio(playerEl);
  if (audio.duration) {
    const r = wrap.getBoundingClientRect();
    audio.currentTime = ((e.clientX - r.left) / r.width) * audio.duration;
  }
}

function toggleMute(btn) {
  const audio = getAudio(btn.closest('.mini-player'));
  audio.muted = !audio.muted;
  const svg = btn.querySelector('svg');
  if (audio.muted) {
    svg.innerHTML = '<path d="M11 5L6 9H2v6h4l5 4V5z"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/>';
    btn.style.opacity = '0.35';
  } else {
    svg.innerHTML = '<path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>';
    btn.style.opacity = '1';
  }
}

/* ── Download ── */
function doDownload(btn, src, title) {
  const a = document.createElement('a');
  a.href = src; a.download = src.split('/').pop(); a.click();
  btn.textContent = '✓ Saved';
  btn.classList.add('done');
  showToast('⬇️  Downloading "' + title + '"…');
  setTimeout(() => { btn.textContent = '⬇ Download'; btn.classList.remove('done'); }, 3000);
}

/* ── Category tabs ── */
let activeCat = 'all';
function switchCat(el, cat) {
  document.querySelectorAll('.cat-tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  activeCat = cat;
  runFilter();
}

/* ── Filter & Search ── */
function runFilter() {
  const q    = document.getElementById('searchInput').value.toLowerCase().trim();
  const type = document.getElementById('typeFilter').value.toLowerCase();
  const mood = document.getElementById('moodFilter').value.toLowerCase();
  const dur  = document.getElementById('durFilter').value.toLowerCase();
  const fmt  = document.getElementById('fmtFilter').value.toLowerCase();
  const sort = document.getElementById('sortFilter').value;

  const cards = Array.from(document.querySelectorAll('#trackList .dl-card'));
  let visible = [];

  cards.forEach(c => {
    const ct  = c.dataset.type.toLowerCase();
    const cm  = c.dataset.mood.toLowerCase();
    const cd  = c.dataset.dur.toLowerCase();
    const cf  = c.dataset.fmt.toLowerCase();
    const tag = c.dataset.tag.toLowerCase();
    const ti  = c.dataset.title.toLowerCase();

    const mq   = !q    || [ti, ct, cm, tag].some(x => x.includes(q));
    const mtype= !type || ct === type;
    const mmood= !mood || cm === mood;
    const mdur = !dur  || cd === dur;
    const mfmt = !fmt  || cf === fmt;
    const mcat = activeCat === 'all' || ct === activeCat.toLowerCase();

    const show = mq && mtype && mmood && mdur && mfmt && mcat;
    c.style.display = show ? '' : 'none';
    if (show) visible.push(c);
  });

  if (sort) {
    const list = document.getElementById('trackList');
    if (sort === 'A – Z') visible.sort((a,b) => a.dataset.title.localeCompare(b.dataset.title));
    if (sort === 'Z – A') visible.sort((a,b) => b.dataset.title.localeCompare(a.dataset.title));
    if (sort === 'Most Downloaded') visible.sort(() => Math.random() - 0.5); // demo
    visible.forEach(c => list.appendChild(c));
  }

  // hide/show section labels
  const secMap = {
    'bgm':   ['Background Music'],
    'sfx':   ['Sound Effect'],
    'lofi':  ['Lo-Fi'],
    'dark':  ['Dark / Cinematic'],
    'epic':  ['Epic / Trailer'],
    'chill': ['Chill / Ambient'],
  };
  Object.entries(secMap).forEach(([key, types]) => {
    const label = document.getElementById('sec-' + key);
    if (!label) return;
    const anyVisible = visible.some(c => types.includes(c.dataset.type));
    label.style.display = anyVisible ? '' : 'none';
  });

  const n = visible.length;
  document.getElementById('resultHeading').textContent = n + ' File' + (n !== 1 ? 's' : '') + ' Ready to Download';
  document.getElementById('noResults').style.display = n === 0 ? '' : 'none';
}

function clearAll() {
  ['searchInput','typeFilter','moodFilter','durFilter','fmtFilter','sortFilter'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.tagName === 'INPUT' ? el.value = '' : el.value = '';
  });
  activeCat = 'all';
  document.querySelectorAll('.cat-tab').forEach((t, i) => t.classList.toggle('active', i === 0));
  runFilter();
}

/* ── Toast ── */
let toastTimer;
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2500);
}