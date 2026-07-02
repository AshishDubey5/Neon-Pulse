/* --- Mobile menu --- */
function toggleMenu() {
  const m = document.getElementById('mobileMenu');
  const b = document.getElementById('menuBtn');
  m.classList.toggle('open');
  b.textContent = m.classList.contains('open') ? '✕' : '☰';
}

/* --- Rating --- */
let selectedRating = null;
function selectRating(btn, value) {
  document.querySelectorAll('.rating-btn')
    .forEach(b => b.classList.remove('selected'));

  btn.classList.add('selected');

  selectedRating = value;

  document.getElementById('ratingValue').value = value;
}

/* --- Type pills --- */
function toggleType(el) {
  document.querySelectorAll('#typeGroup .tag-pill')
    .forEach(p => p.classList.remove('active'));

  el.classList.add('active');

  document.getElementById('feedbackType').value =
    el.textContent.trim();
}

/* --- Char count --- */
function updateCount() {
  const t = document.getElementById('msgField');
  const c = document.getElementById('charCount');
  const n = t.value.length;
  c.textContent = n + ' / 1000';
  c.className = 'char-count' + (n > 900 ? ' over' : n > 700 ? ' warn' : '');
}


function resetForm() {

  // Hide success panel
  document.getElementById('successPanel')
    .classList.remove('show');

  // Show form again
  const form = document.getElementById('feedbackForm');
  form.style.display = 'block';

  // Reset all form fields
  form.reset();

  // Reset character counter
  updateCount();

  // Reset rating
  selectedRating = null;
  document.getElementById('ratingValue').value = '';

  document.querySelectorAll('.rating-btn')
    .forEach(btn => btn.classList.remove('selected'));

  // Reset feedback type
  document.getElementById('feedbackType').value = 'General';

  document.querySelectorAll('#typeGroup .tag-pill')
    .forEach((pill, index) => {
      pill.classList.toggle('active', index === 0);
    });

  // Reset submit button state
  const btn = document.getElementById('submitBtn');
  btn.disabled = false;
  btn.textContent = 'SEND FEEDBACK';
}

/* --- Toast --- */
let toastTimer;
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2400);
}


// success message
document.getElementById('feedbackForm')
.addEventListener('submit', async function(e) {

    e.preventDefault();

    const form = e.target;

    const response = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: {
            Accept: 'application/json'
        }
    });

    if(response.ok){
        form.style.display = 'none';
        document.getElementById('successPanel')
            .classList.add('show');
    }
});