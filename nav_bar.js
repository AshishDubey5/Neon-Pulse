/**
 * nav.js — Neon Pulse shared navigation
 * Add to every page's <head>:
 *   <script src="nav.js"></script>
 */

(function () {
  const LINKS = [
    { href: "index.html",    label: "HOME"     },
    { href: "music.html",    label: "MUSIC"    },
    { href: "download.html", label: "DOWNLOAD" },
    { href: "contacts.html", label: "CONTACTS" },
    { href: "feedback.html", label: "FEEDBACK" },
  ];

  function init() {

    /* ── Detect active page ── */
    const fullPath    = window.location.href;
    const currentFile = fullPath.split("/").pop().split("?")[0].split("#")[0] || "index.html";

    console.log("[nav.js] current file detected:", currentFile); // debug line — remove later

    function navLinkClass(href, mobile) {
      const isActive = href === currentFile;
      if (mobile) {
        return "block w-full text-left px-4 py-4 uppercase font-bold "
          + (isActive
            ? "text-purple-400 bg-purple-900 bg-opacity-30"
            : "text-white hover:bg-purple-900 hover:bg-opacity-30");
      }
      return "nav-link text-lg font-bold uppercase transition-colors "
        + (isActive
          ? "text-purple-400 active-link"
          : "text-white hover:text-purple-400");
    }

    /* ── Build nav HTML ── */
    const desktopLinks = LINKS.map(({ href, label }) =>
      `<a href="${href}" class="${navLinkClass(href, false)}">${label}</a>`
    ).join("\n");

    const mobileLinks = LINKS.map(({ href, label }) =>
      `<a href="${href}" class="${navLinkClass(href, true)}">${label}</a>`
    ).join("\n");

    const navHTML = `
<nav class="fixed top-0 w-full bg-black bg-opacity-50 backdrop-blur-lg border-b border-purple-500 border-opacity-30 z-40" aria-label="Main navigation">
  <div class="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">

    <a href="index.html"
       class="text-3xl font-black text-white cursor-pointer hover:text-purple-400 transition-colors"
       style="font-family:'Orbitron',monospace; text-shadow:0 0 20px rgba(147,51,234,0.6)">
      NEON PULSE
    </a>

    <div class="hidden md:flex gap-8">
      ${desktopLinks}
    </div>

    <button id="mobileMenuToggle"
            class="md:hidden text-white text-2xl leading-none"
            aria-label="Toggle menu"
            aria-expanded="false"
            aria-controls="mobileMenu">
      <span id="menuIcon">☰</span>
    </button>

  </div>

  <div id="mobileMenu"
       class="hidden md:hidden bg-black bg-opacity-95 border-t border-purple-500 border-opacity-30">
    ${mobileLinks}
  </div>
</nav>`;

    /* ── Remove any existing hardcoded nav first ── */
    const oldNav = document.querySelector("nav");
    if (oldNav) oldNav.remove();

    /* ── Inject at top of <body> ── */
    document.body.insertAdjacentHTML("afterbegin", navHTML);

    /* ── Mobile toggle ── */
    const toggleBtn  = document.getElementById("mobileMenuToggle");
    const mobileMenu = document.getElementById("mobileMenu");
    const menuIcon   = document.getElementById("menuIcon");

    toggleBtn.addEventListener("click", function () {
      const isOpen = !mobileMenu.classList.contains("hidden");
      mobileMenu.classList.toggle("hidden", isOpen);
      menuIcon.textContent = isOpen ? "☰" : "✕";
      toggleBtn.setAttribute("aria-expanded", String(!isOpen));
    });

    mobileMenu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        mobileMenu.classList.add("hidden");
        menuIcon.textContent = "☰";
        toggleBtn.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ── Wait for DOM if not ready, otherwise run immediately ── */
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

})();