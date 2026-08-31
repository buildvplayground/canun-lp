/* ===========================================================
   CANUN — Interações e animações da Home
   =========================================================== */
(function () {
  'use strict';

  /* ---------- Header: solidifica no scroll ---------- */
  var header = document.getElementById('header');
  function onScroll() {
    if (window.scrollY > 60) header.classList.add('is-scrolled');
    else header.classList.remove('is-scrolled');
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Menu mobile ---------- */
  var burger = document.getElementById('burger');
  var mobileMenu = document.getElementById('mobileMenu');
  if (burger && mobileMenu) {
    burger.addEventListener('click', function () {
      mobileMenu.classList.toggle('is-open');
      document.body.style.overflow = mobileMenu.classList.contains('is-open') ? 'hidden' : '';
    });
    mobileMenu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        mobileMenu.classList.remove('is-open');
        document.body.style.overflow = '';
      });
    });
  }

  /* ---------- Scroll reveal ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('is-in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---------- Contadores do hero ---------- */
  function animateCount(el) {
    var target = parseFloat(el.getAttribute('data-count'));
    var suffix = el.getAttribute('data-suffix') || '';
    var dur = 1400, start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = target + suffix;
    }
    requestAnimationFrame(step);
  }
  var counters = document.querySelectorAll('[data-count]');
  if ('IntersectionObserver' in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { animateCount(e.target); cio.unobserve(e.target); }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { cio.observe(el); });
  }

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll('.faq__item').forEach(function (item) {
    var q = item.querySelector('.faq__q');
    var a = item.querySelector('.faq__a');
    q.addEventListener('click', function () {
      var isOpen = item.classList.contains('is-open');
      document.querySelectorAll('.faq__item').forEach(function (other) {
        other.classList.remove('is-open');
        other.querySelector('.faq__a').style.maxHeight = null;
      });
      if (!isOpen) {
        item.classList.add('is-open');
        a.style.maxHeight = a.scrollHeight + 'px';
      }
    });
  });

  /* ---------- Hero slideshow + parallax ---------- */
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var heroSlidesWrap = document.querySelector('.hero__slides');
  var heroSlides = Array.prototype.slice.call(document.querySelectorAll('.hero__slide'));
  var heroDots = Array.prototype.slice.call(document.querySelectorAll('.hero__dot'));
  var heroIdx = 0, heroTimer = null;
  var SLIDE_MS = 10000;

  function showSlide(n) {
    if (!heroSlides.length) return;
    heroIdx = (n + heroSlides.length) % heroSlides.length;
    heroSlides.forEach(function (s, i) { s.classList.toggle('is-active', i === heroIdx); });
    heroDots.forEach(function (d, i) {
      d.classList.remove('is-active');
      if (i === heroIdx) { void d.offsetWidth; d.classList.add('is-active'); }
    });
  }
  function startHero() {
    if (heroSlides.length < 2 || reduceMotion) { if (heroSlides[0]) heroSlides[0].classList.add('is-active'); if (heroDots[0]) heroDots[0].classList.add('is-active'); return; }
    showSlide(0);
    heroTimer = setInterval(function () { showSlide(heroIdx + 1); }, SLIDE_MS);
  }
  heroDots.forEach(function (d, i) {
    d.addEventListener('click', function () {
      clearInterval(heroTimer);
      showSlide(i);
      if (!reduceMotion && heroSlides.length > 1) heroTimer = setInterval(function () { showSlide(heroIdx + 1); }, SLIDE_MS);
    });
  });
  startHero();

  /* ---------- Barra de progresso de scroll ---------- */
  var progress = document.getElementById('scrollProgress');

  /* ---------- Scroll horizontal pinado (Modalidades) ---------- */
  var pin = document.getElementById('modalidades');
  var track = document.getElementById('modalTrack');
  var bar = document.getElementById('modalProgress');
  var pinActive = false;

  function setupPin() {
    if (!pin || !track) return;
    var isMobile = window.matchMedia('(max-width: 860px)').matches;
    if (isMobile || reduceMotion) {
      pin.style.height = '';
      track.style.transform = '';
      pinActive = false;
      return;
    }
    var pad = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--pad')) || 40;
    var extra = track.scrollWidth - window.innerWidth + pad;
    extra = Math.max(extra, 0);
    pin.style.height = (window.innerHeight + extra) + 'px';
    pin.dataset.extra = extra;
    pinActive = true;
  }

  /* ---------- Parallax sutil no portfólio — posições cacheadas ---------- */
  var gimgData = [];
  function cacheGimgPositions() {
    if (reduceMotion) return;
    var scrollY = window.scrollY;
    gimgData = Array.prototype.slice.call(document.querySelectorAll('.gcell img')).map(function (img) {
      var r = img.getBoundingClientRect();
      return { el: img, top: r.top + scrollY, height: r.height };
    });
  }

  /* ---------- Loop de scroll unificado com rAF ---------- */
  var scrollTicking = false;
  function runScrollFrame() {
    var scrollY = window.scrollY;
    var vh = window.innerHeight;

    /* header */
    if (scrollY > 60) header.classList.add('is-scrolled');
    else header.classList.remove('is-scrolled');

    /* progress bar */
    if (progress) {
      var h = document.documentElement.scrollHeight - vh;
      progress.style.width = (h > 0 ? (scrollY / h) * 100 : 0) + '%';
    }

    /* hero parallax */
    if (heroSlidesWrap && !reduceMotion && scrollY < vh) {
      heroSlidesWrap.style.transform = 'translateY(' + (scrollY * 0.16) + 'px)';
    }

    /* pin horizontal */
    if (pinActive) {
      var extra = parseFloat(pin.dataset.extra || 0);
      var pinTop = pin.getBoundingClientRect().top;
      var prog   = Math.min(Math.max(-pinTop / (extra || 1), 0), 1);
      track.style.transform = 'translate3d(' + (-prog * extra) + 'px,0,0)';
      if (bar) bar.style.width = (prog * 100) + '%';
    }

    /* gallery parallax — usa posições cacheadas, sem getBoundingClientRect */
    if (!reduceMotion) {
      gimgData.forEach(function (d) {
        var top    = d.top - scrollY;
        var bottom = top + d.height;
        if (bottom < 0 || top > vh) return;
        var off = (top + d.height / 2 - vh / 2) / vh;
        d.el.style.transform = 'scale(1.12) translateY(' + (off * -22) + 'px)';
      });
    }

    scrollTicking = false;
  }

  window.addEventListener('scroll', function () {
    if (!scrollTicking) {
      requestAnimationFrame(runScrollFrame);
      scrollTicking = true;
    }
  }, { passive: true });

  var resizeT;
  window.addEventListener('resize', function () {
    clearTimeout(resizeT);
    resizeT = setTimeout(function () { setupPin(); cacheGimgPositions(); }, 150);
  });
  window.addEventListener('load', function () { setupPin(); cacheGimgPositions(); runScrollFrame(); });
  setTimeout(function () { setupPin(); cacheGimgPositions(); runScrollFrame(); }, 300);

  /* ---------- SVG stroke draw (linhas decorativas) ---------- */
  if ('IntersectionObserver' in window) {
    var lineObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('is-drawn');
          lineObs.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });
    document.querySelectorAll('.bg-line').forEach(function (svg) {
      lineObs.observe(svg);
    });
  } else {
    document.querySelectorAll('.bg-line').forEach(function (svg) {
      svg.classList.add('is-drawn');
    });
  }

  /* ---------- Portfólio Lightbox ---------- */
  var lb        = document.getElementById('lightbox');
  var lbImg     = document.getElementById('lbImg');
  var lbTitle   = document.getElementById('lbTitle');
  var lbTag     = document.getElementById('lbTag');
  var lbCounter = document.getElementById('lbCounter');
  var lbClose   = document.getElementById('lbClose');
  var lbBackdrop= document.getElementById('lbBackdrop');
  var lbPrev    = document.getElementById('lbPrev');
  var lbNext    = document.getElementById('lbNext');

  var lbImages = [], lbIdx = 0, lbProjectName = '', lbProjectTag = '';

  function lbOpen(images, idx, name, tag) {
    lbImages = images; lbIdx = idx;
    lbProjectName = name; lbProjectTag = tag;
    lb.removeAttribute('hidden');
    document.body.style.overflow = 'hidden';
    lbShow(lbIdx);
    lb.focus();
  }

  function lbClose_fn() {
    lb.setAttribute('hidden', '');
    document.body.style.overflow = '';
  }

  function lbShow(n) {
    lbIdx = (n + lbImages.length) % lbImages.length;
    lbImg.classList.add('is-loading');
    var newImg = new Image();
    newImg.onload = function () {
      lbImg.src = newImg.src;
      lbImg.classList.remove('is-loading');
    };
    newImg.src = lbImages[lbIdx];
    lbTitle.textContent   = lbProjectName;
    lbTag.textContent     = lbProjectTag;
    lbCounter.textContent = (lbIdx + 1) + ' / ' + lbImages.length;
    lbPrev.disabled = false;
    lbNext.disabled = false;
  }

  // Abrir ao clicar em pcard
  document.querySelectorAll('.pcard').forEach(function (card) {
    card.addEventListener('click', function () {
      var images  = JSON.parse(card.getAttribute('data-images'));
      var name    = card.getAttribute('data-project');
      var tag     = card.getAttribute('data-tag');
      lbOpen(images, 0, name, tag);
    });
  });

  if (lbClose)   lbClose.addEventListener('click', lbClose_fn);
  if (lbBackdrop)lbBackdrop.addEventListener('click', lbClose_fn);
  if (lbPrev)    lbPrev.addEventListener('click', function () { lbShow(lbIdx - 1); });
  if (lbNext)    lbNext.addEventListener('click', function () { lbShow(lbIdx + 1); });

  // Teclado
  document.addEventListener('keydown', function (e) {
    if (!lb || lb.hasAttribute('hidden')) return;
    if (e.key === 'Escape')      lbClose_fn();
    if (e.key === 'ArrowLeft')   lbShow(lbIdx - 1);
    if (e.key === 'ArrowRight')  lbShow(lbIdx + 1);
  });

  /* ---------- Formulários popup ---------- */
  function openModal(id) {
    var el = document.getElementById(id);
    if (el) { el.classList.add('open'); document.body.style.overflow = 'hidden'; }
  }
  function closeModal(id) {
    var el = document.getElementById(id);
    if (el) { el.classList.remove('open'); document.body.style.overflow = ''; }
  }

  var btnTrabalhe = document.getElementById('openTrabalhe');
  var btnFornecedores = document.getElementById('openFornecedores');
  if (btnTrabalhe) btnTrabalhe.addEventListener('click', function() { openModal('trabalheOverlay'); });
  if (btnFornecedores) btnFornecedores.addEventListener('click', function() { openModal('fornecedoresOverlay'); });

  document.querySelectorAll('.form-modal-close').forEach(function(btn) {
    btn.addEventListener('click', function() { closeModal(btn.getAttribute('data-close')); });
  });
  document.querySelectorAll('.form-overlay').forEach(function(overlay) {
    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) closeModal(overlay.id);
    });
  });

  // Nome do arquivo selecionado
  var tArquivo = document.getElementById('t-arquivo');
  var tFileName = document.getElementById('t-file-name');
  if (tArquivo) tArquivo.addEventListener('change', function() {
    tFileName.textContent = this.files[0] ? this.files[0].name : 'PDF, DOC ou DOCX · máx. 5 MB';
  });
  var fArquivo = document.getElementById('f-arquivo');
  var fFileName = document.getElementById('f-file-name');
  if (fArquivo) fArquivo.addEventListener('change', function() {
    fFileName.textContent = this.files[0] ? this.files[0].name : 'PDF, DOC ou DOCX · máx. 5 MB';
  });

  // Envio dos formulários
  function handleForm(formId, feedbackId, submitId, overlayId) {
    var form = document.getElementById(formId);
    if (!form) return;
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      var btn      = document.getElementById(submitId);
      var feedback = document.getElementById(feedbackId);
      var original = btn.textContent;
      btn.disabled = true;
      btn.textContent = 'Enviando…';
      feedback.style.display = 'none';

      fetch('/form-handler.php', { method: 'POST', body: new FormData(form) })
        .then(function(res) { return res.json(); })
        .then(function(data) {
          if (data.success) {
            feedback.className = 'form-feedback success';
            feedback.textContent = 'Enviado com sucesso! Entraremos em contato em breve.';
            feedback.style.display = 'block';
            form.reset();
            document.querySelectorAll('.file-name').forEach(function(el) {
              el.textContent = 'PDF, DOC ou DOCX · máx. 5 MB';
            });
            setTimeout(function() { closeModal(overlayId); }, 2800);
          } else {
            throw new Error(data.message || 'Erro ao enviar.');
          }
        })
        .catch(function(err) {
          feedback.className = 'form-feedback error';
          feedback.textContent = err.message;
          feedback.style.display = 'block';
        })
        .finally(function() {
          btn.disabled = false;
          btn.textContent = original;
        });
    });
  }
  handleForm('formTrabalhe',   't-feedback', 't-submit', 'trabalheOverlay');
  handleForm('formFornecedor', 'f-feedback', 'f-submit', 'fornecedoresOverlay');

  /* ---------- Política de Privacidade ---------- */
  var privacyOverlay = document.getElementById('privacyOverlay');
  var btnOpenPrivacy = document.getElementById('openPrivacy');
  var btnPrivacyClose = document.getElementById('privacyClose');

  function openPrivacy() {
    if (privacyOverlay) { privacyOverlay.classList.add('open'); document.body.style.overflow = 'hidden'; }
  }
  function closePrivacy() {
    if (privacyOverlay) { privacyOverlay.classList.remove('open'); document.body.style.overflow = ''; }
  }

  if (btnOpenPrivacy) btnOpenPrivacy.addEventListener('click', openPrivacy);
  if (btnPrivacyClose) btnPrivacyClose.addEventListener('click', closePrivacy);
  if (privacyOverlay) privacyOverlay.addEventListener('click', function(e) {
    if (e.target === privacyOverlay) closePrivacy();
  });

  // Tecla Escape fecha qualquer modal aberto
  document.addEventListener('keydown', function(e) {
    if (e.key !== 'Escape') return;
    closePrivacy();
    document.querySelectorAll('.form-overlay.open').forEach(function(o) { closeModal(o.id); });
  });

  /* ---------- Cookie bar ---------- */
  var cookieBar = document.getElementById('cookieBar');
  var COOKIE_KEY = 'canun_cookies_ok';

  function hideCookieBar() {
    if (cookieBar) {
      cookieBar.style.transition = 'transform .4s ease';
      cookieBar.classList.remove('is-visible');
    }
  }
  function acceptCookies() {
    try { localStorage.setItem(COOKIE_KEY, '1'); } catch(e) {}
    hideCookieBar();
  }
  function declineCookies() {
    try { localStorage.setItem(COOKIE_KEY, '0'); } catch(e) {}
    hideCookieBar();
  }

  var cookieAccept  = document.getElementById('cookieAccept');
  var cookieDecline = document.getElementById('cookieDecline');
  var cookiePrivacyLink = document.getElementById('cookiePrivacyLink');

  if (cookieAccept)       cookieAccept.addEventListener('click', acceptCookies);
  if (cookieDecline)      cookieDecline.addEventListener('click', declineCookies);
  if (cookiePrivacyLink)  cookiePrivacyLink.addEventListener('click', openPrivacy);

  // Mostrar barra se ainda não houve decisão
  if (cookieBar) {
    var cookieDecision = false;
    try { cookieDecision = localStorage.getItem(COOKIE_KEY) !== null; } catch(e) {}
    if (!cookieDecision) {
      setTimeout(function() { cookieBar.classList.add('is-visible'); }, 1800);
    }
  }

  // Swipe mobile
  var lbTouchX = null;
  lb && lb.addEventListener('touchstart', function (e) { lbTouchX = e.touches[0].clientX; }, { passive: true });
  lb && lb.addEventListener('touchend', function (e) {
    if (lbTouchX === null) return;
    var dx = e.changedTouches[0].clientX - lbTouchX;
    if (Math.abs(dx) > 50) dx < 0 ? lbShow(lbIdx + 1) : lbShow(lbIdx - 1);
    lbTouchX = null;
  }, { passive: true });

})();
