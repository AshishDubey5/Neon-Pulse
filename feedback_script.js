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
      document.querySelectorAll('.rating-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedRating = value;
    }

    /* --- Type pills --- */
    function toggleType(el) {
      document.querySelectorAll('#typeGroup .tag-pill').forEach(p => p.classList.remove('active'));
      el.classList.add('active');
    }

    /* --- Char count --- */
    function updateCount() {
      const t = document.getElementById('msgField');
      const c = document.getElementById('charCount');
      const n = t.value.length;
      c.textContent = n + ' / 1000';
      c.className = 'char-count' + (n > 900 ? ' over' : n > 700 ? ' warn' : '');
    }

    /* --- Submit --- */
    function submitFeedback() {
      const msg = document.getElementById('msgField').value.trim();
      if (!msg) { showToast('✍️  Please write your feedback first'); return; }

      const btn = document.getElementById('submitBtn');
      btn.disabled = true;
      btn.textContent = 'SENDING…';

      setTimeout(() => {
        document.getElementById('formSection').style.display = 'none';
        document.getElementById('successPanel').classList.add('show');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 900);
    }

    function resetForm() {
      document.getElementById('successPanel').classList.remove('show');
      document.getElementById('formSection').style.display = '';
      document.getElementById('msgField').value = '';
      document.getElementById('nameField').value = '';
      document.getElementById('emailField').value = '';
      document.getElementById('trackField').value = '';
      document.getElementById('sourceField').value = '';
      updateCount();
      const btn = document.getElementById('submitBtn');
      btn.disabled = false;
      btn.textContent = 'SEND FEEDBACK';
      selectedRating = null;
      document.querySelectorAll('.rating-btn').forEach(b => b.classList.remove('selected'));
      document.querySelectorAll('#typeGroup .tag-pill').forEach((p,i) => {
        p.classList.toggle('active', i === 0);
      });
    }

    /* --- Toast --- */
    let toastTimer;
    function showToast(msg) {
      const t = document.getElementById('toast');
      t.textContent = msg; t.classList.add('show');
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => t.classList.remove('show'), 2400);
    }