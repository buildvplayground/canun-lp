/* ============================================================
   CANUN — LP Manutenção Preventiva Residencial
   JS vanilla, sem dependências.
   ============================================================ */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Ano no rodapé ---------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---------- Barra de progresso de scroll ---------- */
  var progress = document.getElementById('scrollProgress');
  function updateProgress() {
    var doc = document.documentElement;
    var max = doc.scrollHeight - doc.clientHeight;
    var pct = max > 0 ? (doc.scrollTop / max) * 100 : 0;
    progress.style.width = pct + '%';
  }
  if (progress) {
    updateProgress();
    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress);
  }

  /* ---------- Menu mobile ---------- */
  var burger = document.getElementById('burger');
  var mobileMenu = document.getElementById('mobileMenu');
  var backdrop = document.getElementById('menuBackdrop');

  function setMenu(open) {
    burger.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    mobileMenu.classList.toggle('is-open', open);
    backdrop.hidden = false;
    backdrop.classList.toggle('is-open', open);
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) {
      var first = mobileMenu.querySelector('a');
      if (first) first.focus();
    }
  }

  if (burger && mobileMenu && backdrop) {
    burger.addEventListener('click', function () {
      setMenu(!mobileMenu.classList.contains('is-open'));
    });
    backdrop.addEventListener('click', function () { setMenu(false); });
    mobileMenu.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false);
    });
    // trap simples de foco + ESC
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && mobileMenu.classList.contains('is-open')) {
        setMenu(false);
        burger.focus();
      }
    });
  }

  /* ---------- Scroll reveal ---------- */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var revealObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          revealObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach(function (el) { revealObs.observe(el); });
  }

  /* ---------- Contador do stat band ---------- */
  var counter = document.querySelector('[data-count]');
  if (counter && !reduceMotion && 'IntersectionObserver' in window) {
    var target = parseInt(counter.getAttribute('data-count'), 10);
    var suffix = counter.getAttribute('data-suffix') || '';
    var countObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        countObs.unobserve(entry.target);
        var start = null;
        var dur = 900;
        function tick(ts) {
          if (start === null) start = ts;
          var p = Math.min((ts - start) / dur, 1);
          counter.textContent = Math.round(p * target) + suffix;
          if (p < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      });
    }, { threshold: 0.5 });
    countObs.observe(counter);
  }

  /* ---------- Scroll-spy da navegação ---------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('#nav a[href^="#"]'));
  var sections = navLinks
    .map(function (a) { return document.querySelector(a.getAttribute('href')); })
    .filter(Boolean);

  if (sections.length && 'IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (a) {
          a.classList.toggle('is-active', a.getAttribute('href') === '#' + entry.target.id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---------- Lightbox da galeria ---------- */
  var gallery = document.getElementById('gallery');
  var lightbox = document.getElementById('lightbox');

  if (gallery && lightbox) {
    var buttons = Array.prototype.slice.call(gallery.querySelectorAll('.gal'));
    var items = buttons.map(function (btn) {
      var img = btn.querySelector('img');
      return { src: img.getAttribute('src'), alt: img.getAttribute('alt') };
    });

    var lbImg = document.getElementById('lbImg');
    var lbCounter = document.getElementById('lbCounter');
    var lbClose = document.getElementById('lbClose');
    var lbPrev = document.getElementById('lbPrev');
    var lbNext = document.getElementById('lbNext');
    var lbBackdrop = document.getElementById('lbBackdrop');
    var current = 0;
    var lastFocused = null;

    function render(i) {
      current = (i + items.length) % items.length;
      var it = items[current];
      lbImg.setAttribute('src', it.src);
      lbImg.setAttribute('alt', it.alt);
      lbCounter.textContent = (current + 1) + ' / ' + items.length;
    }

    function openLb(i) {
      lastFocused = document.activeElement;
      render(i);
      lightbox.hidden = false;
      document.body.style.overflow = 'hidden';
      lbClose.focus();
    }

    function closeLb() {
      lightbox.hidden = true;
      document.body.style.overflow = '';
      if (lastFocused) lastFocused.focus();
    }

    buttons.forEach(function (btn, i) {
      btn.addEventListener('click', function () { openLb(i); });
    });
    lbClose.addEventListener('click', closeLb);
    lbBackdrop.addEventListener('click', closeLb);
    lbPrev.addEventListener('click', function () { render(current - 1); });
    lbNext.addEventListener('click', function () { render(current + 1); });

    document.addEventListener('keydown', function (e) {
      if (lightbox.hidden) return;
      if (e.key === 'Escape') closeLb();
      else if (e.key === 'ArrowLeft') render(current - 1);
      else if (e.key === 'ArrowRight') render(current + 1);
      else if (e.key === 'Tab') {
        // mantém o foco dentro do lightbox
        var focusables = [lbClose, lbPrev, lbNext];
        var idx = focusables.indexOf(document.activeElement);
        e.preventDefault();
        var next = e.shiftKey ? idx - 1 : idx + 1;
        focusables[(next + focusables.length) % focusables.length].focus();
      }
    });

    // swipe no mobile
    var touchX = null;
    lightbox.addEventListener('touchstart', function (e) { touchX = e.changedTouches[0].clientX; }, { passive: true });
    lightbox.addEventListener('touchend', function (e) {
      if (touchX === null) return;
      var dx = e.changedTouches[0].clientX - touchX;
      if (Math.abs(dx) > 46) render(current + (dx < 0 ? 1 : -1));
      touchX = null;
    }, { passive: true });
  }

  /* ---------- Modal de política de privacidade ---------- */
  var privacyOverlay = document.getElementById('privacyOverlay');
  var privacyClose = document.getElementById('privacyClose');
  var openPrivacy = document.getElementById('openPrivacy');
  var cookiePrivacyLink = document.getElementById('cookiePrivacyLink');
  var privacyLastFocus = null;

  function setPrivacy(open) {
    privacyOverlay.classList.toggle('is-open', open);
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) {
      privacyLastFocus = document.activeElement;
      privacyClose.focus();
    } else if (privacyLastFocus) {
      privacyLastFocus.focus();
    }
  }

  if (privacyOverlay) {
    if (openPrivacy) openPrivacy.addEventListener('click', function () { setPrivacy(true); });
    if (cookiePrivacyLink) cookiePrivacyLink.addEventListener('click', function () { setPrivacy(true); });
    privacyClose.addEventListener('click', function () { setPrivacy(false); });
    privacyOverlay.addEventListener('click', function (e) {
      if (e.target === privacyOverlay) setPrivacy(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && privacyOverlay.classList.contains('is-open')) setPrivacy(false);
    });
  }

  /* ---------- Widget Merlin ----------
     1) O script de terceiro injeta um <button> só com <img> e sem rótulo, e pode
        remontar o nó — um observer garante a correção em qualquer render.
     2) Todos os CTAs de ação abrem o popup do Merlin. O href de WhatsApp continua
        no HTML como fallback: se o script do Merlin não carregar, o botão ainda
        funciona em vez de virar um link morto. */
  (function () {
    var CTAS = '[data-merlin]';

    function botaoMerlin() { return document.querySelector('.merlin-button'); }

    function rotular() {
      var btn = botaoMerlin();
      if (!btn) return false;
      if (!btn.getAttribute('aria-label')) btn.setAttribute('aria-label', 'Abrir formulário de contato da Canun');
      if (!btn.getAttribute('type')) btn.setAttribute('type', 'button');
      var ico = btn.querySelector('img');
      if (ico && !ico.hasAttribute('alt')) ico.setAttribute('alt', '');
      return true;
    }

    // Delegação: pega inclusive CTAs que entram depois (menu mobile).
    document.addEventListener('click', function (e) {
      var cta = e.target.closest && e.target.closest(CTAS);
      if (!cta) return;
      var btn = botaoMerlin();
      if (!btn) return;            // sem Merlin, segue para o WhatsApp do href
      e.preventDefault();
      btn.click();
    });

    rotular();
    if ('MutationObserver' in window) {
      new MutationObserver(rotular).observe(document.documentElement, { childList: true, subtree: true });
    }
  })();

  /* ---------- Cookie bar (LGPD) ---------- */
  var cookieBar = document.getElementById('cookieBar');
  var STORAGE_KEY = 'canun_lp_cookie_consent';

  function pushConsent(value) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: 'cookie_consent', consent_state: value });
  }

  if (cookieBar) {
    var saved = null;
    try { saved = window.localStorage.getItem(STORAGE_KEY); } catch (err) { saved = null; }

    if (!saved) {
      window.setTimeout(function () {
        cookieBar.classList.add('is-visible');
        document.body.classList.add('cookie-open');
      }, 900);
    } else {
      pushConsent(saved);
    }

    function decide(value) {
      try { window.localStorage.setItem(STORAGE_KEY, value); } catch (err) { /* modo privado */ }
      pushConsent(value);
      cookieBar.classList.remove('is-visible');
      document.body.classList.remove('cookie-open');
    }

    document.getElementById('cookieAccept').addEventListener('click', function () { decide('granted'); });
    document.getElementById('cookieDecline').addEventListener('click', function () { decide('denied'); });
  }
})();
