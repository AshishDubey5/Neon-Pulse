
    function toggleMenu() {
      const m = document.getElementById('mobileMenu');
      const b = document.getElementById('menuBtn');
      m.classList.toggle('open');
      b.textContent = m.classList.contains('open') ? '✕' : '☰';
    }

    function copyHandle(text, e) {
      e.preventDefault();
      navigator.clipboard.writeText(text).then(() => showToast('📋 Copied: ' + text));
    }

    let toastTimer;
    function showToast(msg) {
      const t = document.getElementById('toast');
      t.textContent = msg; t.classList.add('show');
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => t.classList.remove('show'), 2400);
    }
  