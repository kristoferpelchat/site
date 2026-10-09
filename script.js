(function () {
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* header: hide on scroll-down, show on scroll-up */
  var header = document.getElementById('header');
  var burger = header.querySelector('.burger');
  var menu = document.getElementById('menu');
  var menuOpen = false;
  var lastY = window.scrollY;
  window.addEventListener('scroll', function () {
    var y = window.scrollY;
    if (menuOpen || header.contains(document.activeElement) || y <= 140 || y < lastY - 4) header.classList.remove('is-hidden');
    else if (y > lastY + 4) header.classList.add('is-hidden');
    lastY = y;
  }, { passive: true });
  header.addEventListener('focusin', function () { header.classList.remove('is-hidden'); });

  /* mobile menu */
  function setMenu(open) {
    menuOpen = open;
    menu.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Menu');
    document.documentElement.classList.toggle('menu-open', open);
  }
  burger.addEventListener('click', function () { setMenu(!menuOpen); });
  menu.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && menuOpen) { setMenu(false); burger.focus(); }
  });
  window.matchMedia('(min-width: 761px)').addEventListener('change', function (e) { if (e.matches) setMenu(false); });

  /* scroll-spy: mark the nav link for the section in view */
  var links = document.querySelectorAll('nav.primary a, .menu a');
  var spy = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      links.forEach(function (a) {
        if (a.getAttribute('href') === '#' + entry.target.id) a.setAttribute('aria-current', 'location');
        else a.removeAttribute('aria-current');
      });
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  document.querySelectorAll('main > section').forEach(function (s) { spy.observe(s); });

  /* reveal on scroll, staggered by data-reveal-delay */
  var reveals = document.querySelectorAll('[data-reveal]');
  if (reduced || !('IntersectionObserver' in window)) {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var ro = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.style.setProperty('--rd', (entry.target.getAttribute('data-reveal-delay') || 0) + 'ms');
        entry.target.classList.add('is-in');
        ro.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(function (el) { ro.observe(el); });
  }

  /* hero: slow parallax on the background trace */
  var heroBg = document.querySelector('.hero-bg');
  if (!reduced) {
    var hero = heroBg.parentElement, raf = null;
    var parallax = function () {
      raf = null;
      var r = hero.getBoundingClientRect();
      var p = Math.max(-1, Math.min(1, -r.top / (r.height || 1)));
      heroBg.style.transform = 'translate3d(0,' + (p * 70).toFixed(1) + 'px,0)';
    };
    window.addEventListener('scroll', function () { if (!raf) raf = requestAnimationFrame(parallax); }, { passive: true });
  }

  /* stat count-ups */
  if (!reduced) {
    document.querySelectorAll('[data-countup]').forEach(function (el) {
      var original = el.textContent;
      var io = new IntersectionObserver(function (entries) {
        if (!entries[0].isIntersecting) return;
        io.disconnect();
        var dur = 2200, start = performance.now() + 450;
        var frame = function (now) {
          var p = Math.max(0, Math.min(1, (now - start) / dur)), k = 1 - Math.pow(1 - p, 3);
          el.textContent = original.replace(/\d+/g, function (m) { return Math.round(parseInt(m, 10) * k); });
          if (p < 1) requestAnimationFrame(frame); else el.textContent = original;
        };
        requestAnimationFrame(frame);
      }, { threshold: 0.75 });
      io.observe(el);
    });
  }

  /* work index: hovered row drives the preview panel */
  var rows = document.querySelectorAll('[data-work-row]');
  var panels = document.querySelectorAll('[data-work-panel]');
  rows.forEach(function (row) {
    row.addEventListener('mouseenter', function () {
      var i = row.getAttribute('data-work-row');
      rows.forEach(function (r) { r.classList.toggle('is-active', r === row); });
      panels.forEach(function (p) { p.classList.toggle('is-active', p.getAttribute('data-work-panel') === i); });
    });
  });

  /* contact form: assemble a mailto: draft */
  var form = document.getElementById('contact-form');
  var status = document.getElementById('status');
  var send = form.querySelector('button[type="submit"]');
  var sendLabel = send.innerHTML;
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var name = form.elements.name.value.trim();
    var company = form.elements.company.value.trim();
    var message = form.elements.message.value.trim();
    var topic = form.elements.type.selectedOptions[0];
    if (!name) { status.textContent = 'Add your name so I know who is writing.'; form.elements.name.focus(); return; }
    var subject = topic.textContent + ' — ' + name + (company ? ', ' + company : '');
    var body = 'Hi Kristofer,\n\n' +
      "I'd like to talk about " + topic.getAttribute('data-phrase') + '.' +
      (message ? '\n\n' + message : '') +
      '\n\nThanks,\n' + name + (company ? '\n' + company : '') + '\n';
    window.location.href = 'mailto:' + form.getAttribute('data-email') +
      '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    send.textContent = 'Draft ready ✓';
    status.textContent = "Your email app should open with the draft. If it doesn't, write to " + form.getAttribute('data-email') + '.';
  });
  form.addEventListener('input', function () {
    send.innerHTML = sendLabel;
    status.textContent = '';
  });
})();
