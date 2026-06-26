{/* <script> */}
    // ── Animated particle grid background ──
    const canvas = document.getElementById('bgCanvas');
    const ctx = canvas.getContext('2d');
    let W, H, particles = [];

    function resize() {
        W = canvas.width = window.innerWidth;
        H = canvas.height = window.innerHeight;
    }

    function initParticles() {
        particles = [];
        const count = Math.floor((W * H) / 18000);
        for (let i = 0; i < count; i++) {
            particles.push({
                x: Math.random() * W,
                y: Math.random() * H,
                r: Math.random() * 1.5 + 0.3,
                vx: (Math.random() - 0.5) * 0.3,
                vy: (Math.random() - 0.5) * 0.3,
                alpha: Math.random() * 0.5 + 0.1
            });
        }
    }

    function drawParticles() {
        ctx.clearRect(0, 0, W, H);
        // Draw connections
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 120) {
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(147,51,234,${0.12 * (1 - dist / 120)})`;
                    ctx.lineWidth = 0.5;
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }
        // Draw dots
        particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            if (p.x < 0) p.x = W;
            if (p.x > W) p.x = 0;
            if (p.y < 0) p.y = H;
            if (p.y > H) p.y = 0;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(147,51,234,${p.alpha})`;
            ctx.fill();
        });
        requestAnimationFrame(drawParticles);
    }

    // Respect reduced motion
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        resize();
        initParticles();
        drawParticles();
        window.addEventListener('resize', () => { resize(); initParticles(); });
    } else {
        canvas.style.display = 'none';
    }

    // ── Mobile menu ──
    function toggleMobileMenu() {
        const menu = document.getElementById('mobileMenu');
        const icon = document.getElementById('menuIcon');
        const btn  = document.getElementById('menuBtn');
        const open = menu.classList.toggle('hidden');
        icon.textContent = open ? '☰' : '✕';
        btn.setAttribute('aria-expanded', String(!open));
    }

    // ── Mini player (simulated — replace with real Audio src) ──
    let isPlaying = false;
    let progress = 0;
    let interval = null;
    const DURATION = 225; // 3:45 in seconds (demo)

    function togglePlay() {
        isPlaying = !isPlaying;
        const bars = document.querySelectorAll('.waveform-bar');
        const playIcon = document.getElementById('playIcon');

        if (isPlaying) {
            bars.forEach(b => b.classList.remove('paused'));
            playIcon.innerHTML = '<rect x="6" y="4" width="4" height="16" fill="white"/><rect x="14" y="4" width="4" height="16" fill="white"/>';
            interval = setInterval(() => {
                progress = Math.min(progress + (100 / DURATION), 100);
                document.getElementById('progressFill').style.width = progress + '%';
                const elapsed = Math.floor(DURATION * progress / 100);
                const m = Math.floor(elapsed / 60);
                const s = String(elapsed % 60).padStart(2, '0');
                document.getElementById('timeDisplay').textContent = `${m}:${s} / 3:45`;
                if (progress >= 100) { clearInterval(interval); isPlaying = false; progress = 0; bars.forEach(b => b.classList.add('paused')); playIcon.innerHTML = '<path d="M8 5v14l11-7z"/>'; }
            }, 1000);
        } else {
            bars.forEach(b => b.classList.add('paused'));
            playIcon.innerHTML = '<path d="M8 5v14l11-7z"/>';
            clearInterval(interval);
        }
    }

    function seekTrack(e) {
        const bar = e.currentTarget;
        const rect = bar.getBoundingClientRect();
        const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        progress = pct * 100;
        document.getElementById('progressFill').style.width = progress + '%';
        const elapsed = Math.floor(DURATION * pct);
        const m = Math.floor(elapsed / 60);
        const s = String(elapsed % 60).padStart(2, '0');
        document.getElementById('timeDisplay').textContent = `${m}:${s} / 3:45`;
    }

    // ── Newsletter ──
    function subscribeNewsletter() {
        const email = document.getElementById('emailInput').value.trim();
        const msg   = document.getElementById('subscribeMsg');
        if (!email || !email.includes('@')) {
            document.getElementById('emailInput').style.borderColor = 'rgba(239,68,68,0.6)';
            return;
        }
        document.getElementById('emailInput').style.borderColor = '';
        msg.classList.remove('hidden');
        document.getElementById('emailInput').value = '';
        // Wire up to your backend / Mailchimp etc. here
    }

    // ── Scroll reveal ──
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); } });
    }, { threshold: 0.12 });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    // </script>