/* ── AUDIO REGISTRY ── */
const audioMap = new Map(); // player el → Audio obj

function getAudio(playerEl) {
  if (!audioMap.has(playerEl)) {
    const a = new Audio(playerEl.dataset.src);
    a.addEventListener('timeupdate', () => updateProgress(playerEl, a));
    a.addEventListener('ended', () => resetPlayer(playerEl));
    audioMap.set(playerEl, a);
  }
  return audioMap.get(playerEl);
}

function fmtTime(s) {
  s = Math.floor(s);
  return Math.floor(s/60) + ':' + String(s%60).padStart(2,'0');
}

function updateProgress(playerEl, audio) {
  const fill = playerEl.querySelector('.progress-fill');
  const timeEl = playerEl.querySelector('.player-time');
  const pct = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
  fill.style.width = pct + '%';
  const dur = audio.duration ? fmtTime(audio.duration) : playerEl.querySelector('.player-time').textContent.split('/')[1].trim();
  timeEl.textContent = fmtTime(audio.currentTime) + ' / ' + (audio.duration ? fmtTime(audio.duration) : dur);
}

function resetPlayer(playerEl) {
  const btn = playerEl.querySelector('.btn-play');
  btn.innerHTML = '<svg viewBox="0 0 24 24"><polygon points="5,3 19,12 5,21"/></svg>';
  btn.setAttribute('aria-label','Play');
  playerEl.querySelector('.progress-fill').style.width = '0%';
}

function togglePlay(btn) {
  const playerEl = btn.closest('.custom-player');
  const audio = getAudio(playerEl);
  // pause all other players first
  audioMap.forEach((a, p) => {
    if (p !== playerEl && !a.paused) {
      a.pause();
      resetPlayer(p);
    }
  });
  if (audio.paused) {
    audio.play();
    btn.innerHTML = '<svg viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>';
    btn.setAttribute('aria-label','Pause');
  } else {
    audio.pause();
    btn.innerHTML = '<svg viewBox="0 0 24 24"><polygon points="5,3 19,12 5,21"/></svg>';
    btn.setAttribute('aria-label','Play');
  }
}

function seekTo(progressEl, e) {
  const playerEl = progressEl.closest('.custom-player');
  const audio = getAudio(playerEl);
  if (!audio.duration) return;
  const rect = progressEl.getBoundingClientRect();
  const pct = (e.clientX - rect.left) / rect.width;
  audio.currentTime = pct * audio.duration;
}

function toggleMute(btn) {
  const playerEl = btn.closest('.custom-player');
  const audio = getAudio(playerEl);
  audio.muted = !audio.muted;
  const svg = btn.querySelector('svg');
  if (audio.muted) {
    svg.innerHTML = '<path d="M11 5L6 9H2v6h4l5 4V5z"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/>';
    btn.style.opacity = '0.4';
  } else {
    svg.innerHTML = '<path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>';
    btn.style.opacity = '1';
  }
}

/* ── 3-DOT MENU ── */
function togglePlayerMenu(btn) {
  const menu = btn.nextElementSibling;
  const isOpen = menu.classList.contains('open');
  document.querySelectorAll('.player-menu.open').forEach(m => m.classList.remove('open'));
  document.querySelectorAll('.speed-sub.open').forEach(s => s.classList.remove('open'));
  if (!isOpen) menu.classList.add('open');
}

document.addEventListener('click', e => {
  if (!e.target.closest('.custom-player')) {
    document.querySelectorAll('.player-menu.open').forEach(m => m.classList.remove('open'));
    document.querySelectorAll('.speed-sub.open').forEach(s => s.classList.remove('open'));
  }
});

function toggleSpeedMenu(btn) {
  const sub = btn.nextElementSibling;
  sub.classList.toggle('open');
}

function setSpeed(btn, rate) {
  const playerEl = btn.closest('.custom-player');
  const audio = getAudio(playerEl);
  audio.playbackRate = rate;
  // update active highlight
  btn.closest('.speed-sub').querySelectorAll('.speed-opt').forEach(o => o.classList.remove('active-speed'));
  btn.classList.add('active-speed');
  // update label in parent menu item
  const curSpeedEl = btn.closest('.player-menu').querySelector('.cur-speed');
  curSpeedEl.textContent = rate + '×';
  showToast('⚡ Playback speed set to ' + rate + '×');
  btn.closest('.player-menu').classList.remove('open');
}

/* ── DOWNLOAD ── */
function doDownload(btn, src, title) {
  const a = document.createElement('a');
  a.href = src; a.download = title + '.mp3'; a.click();
  showToast('⬇️  Downloading "' + title + '"…');
  btn.closest('.player-menu').classList.remove('open');
}

/* ── SAVE ── */
const savedSet = new Set();
function doSave(btn, title) {
  const item = btn.closest('.menu-item');
  if (savedSet.has(title)) {
    savedSet.delete(title);
    item.classList.remove('is-saved');
    item.querySelector('.lbl-save').textContent = 'Save';
    showToast('🔖  Removed "' + title + '" from saved');
  } else {
    savedSet.add(title);
    item.classList.add('is-saved');
    item.querySelector('.lbl-save').textContent = 'Saved ✓';
    showToast('🔖  Saved "' + title + '" to your library');
  }
  btn.closest('.player-menu').classList.remove('open');
}

/* ── LIKE ── */
const likeMap = {};
function doLike(btn, title) {
  const item = btn.closest('.menu-item');
  if (!likeMap[title]) likeMap[title] = 0;
  const isLiked = item.classList.contains('is-liked');
  if (isLiked) {
    likeMap[title] = Math.max(0, likeMap[title]-1);
    item.classList.remove('is-liked');
    item.querySelector('.menu-icon').textContent = '🤍';
    item.querySelector('.lbl-like').textContent = 'Like';
    showToast('💔  Unliked "' + title + '"');
  } else {
    likeMap[title]++;
    item.classList.add('is-liked');
    item.querySelector('.menu-icon').textContent = '❤️';
    item.querySelector('.lbl-like').textContent = 'Liked!';
    showToast('❤️  You liked "' + title + '"');
  }
  item.querySelector('.like-count').textContent = likeMap[title];
  btn.closest('.player-menu').classList.remove('open');
}

/* ── TOAST ── */
let toastTimer;
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2400);
}

/* ── FILTER & SEARCH ── */
let activeTag = null;
function toggleTag(el, tag) {
  if (activeTag === tag) { activeTag = null; el.classList.remove('active-tag'); }
  else { document.querySelectorAll('.tag').forEach(t => t.classList.remove('active-tag')); el.classList.add('active-tag'); activeTag = tag; }
  filterTracks();
}
function clearFilters() {
  ['searchInput','genreFilter','moodFilter','durationFilter','vibeFilter','sortFilter'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.tagName === 'INPUT' ? el.value = '' : el.value = '';
  });
  activeTag = null;
  document.querySelectorAll('.tag').forEach(t => t.classList.remove('active-tag'));
  filterTracks();
}
function filterTracks() {
  const q     = document.getElementById('searchInput').value.toLowerCase().trim();
  const genre = document.getElementById('genreFilter').value.toLowerCase();
  const mood  = document.getElementById('moodFilter').value.toLowerCase();
  const dur   = document.getElementById('durationFilter').value.toLowerCase();
  const vibe  = document.getElementById('vibeFilter').value.toLowerCase();
  const sort  = document.getElementById('sortFilter').value;
  const tracks = Array.from(document.querySelectorAll('#trackList .track-box'));
  let visible = [];
  tracks.forEach(t => {
    const ti = t.dataset.title.toLowerCase(), tg = t.dataset.genre.toLowerCase(),
          tm = t.dataset.mood.toLowerCase(),  td = t.dataset.duration.toLowerCase(),
          tv = t.dataset.vibe.toLowerCase();
    const ms = !q     || [ti,tg,tm,tv].some(x => x.includes(q));
    const mg = !genre || tg === genre;
    const mm = !mood  || tm === mood;
    const md = !dur   || td === dur;
    const mv = !vibe  || tv === vibe;
    let mt = true;
    if (activeTag) mt = (ti+' '+tg+' '+tm+' '+tv).includes(activeTag);
    const show = ms && mg && mm && md && mv && mt;
    t.style.display = show ? '' : 'none';
    if (show) visible.push(t);
  });
  if (sort && visible.length > 1) {
    const list = document.getElementById('trackList');
    if (sort==='A – Z') visible.sort((a,b)=>a.dataset.title.localeCompare(b.dataset.title));
    if (sort==='Z – A') visible.sort((a,b)=>b.dataset.title.localeCompare(a.dataset.title));
    if (sort==='Shortest first') visible.sort((a,b)=>+a.dataset.seconds-+b.dataset.seconds);
    if (sort==='Longest first')  visible.sort((a,b)=>+b.dataset.seconds-+a.dataset.seconds);
    visible.forEach(t => list.appendChild(t));
  }
  const n = visible.length;
  document.getElementById('resultHeading').textContent = n + (n===1?' Track':' Tracks') + ' on Neon Pulse';
  document.getElementById('noResults').style.display = n===0 ? '' : 'none';
}