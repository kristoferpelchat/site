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

  /* contact form: send through the /api/contact Pages Function */
  var form = document.getElementById('contact-form');
  var status = document.getElementById('status');
  var send = form.querySelector('button[type="submit"]');
  var sendLabel = send.innerHTML;
  var address = form.getAttribute('data-email');

  function say(text, isError, withFallback) {
    status.textContent = text;
    status.classList.toggle('is-error', !!isError);
    if (withFallback) {
      var a = document.createElement('a');
      a.href = 'mailto:' + address;
      a.textContent = address;
      status.append(' You can also email me at ', a, '.');
    }
  }
  function check() {
    var f = form.elements;
    if (!f.name.value.trim()) return [f.name, 'Add your name so I know who is writing.'];
    if (!f.email.value.trim() || !f.email.checkValidity()) return [f.email, 'Add an email address I can reply to.'];
    if (!f.message.value.trim()) return [f.message, 'Add a short message.'];
    return null;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var problem = check();
    if (problem) { say(problem[1], true); problem[0].focus(); return; }
    send.disabled = true;
    send.textContent = 'Sending…';
    say('');
    fetch(form.action, { method: 'POST', body: new FormData(form) })
      .then(function (res) { return res.json().catch(function () { return {}; }).then(function (data) { return { ok: res.ok, data: data }; }); })
      .then(function (r) {
        if (r.ok) {
          form.reset();
          send.textContent = 'Message sent ✓';
          say("Thanks, your message is on its way. I'll get back to you soon.");
          return;
        }
        send.innerHTML = sendLabel;
        var field = r.data.field && form.elements[r.data.field];
        say(r.data.error || 'Something went wrong sending your message.', true, !field);
        if (field) field.focus();
      })
      .catch(function () {
        send.innerHTML = sendLabel;
        say("Your message couldn't be sent. Check your connection and try again.", true, true);
      })
      .finally(function () {
        send.disabled = false;
        if (document.activeElement === document.body) send.focus();
        if (window.turnstile) window.turnstile.reset();
      });
  });
  form.addEventListener('input', function () {
    if (send.disabled) return;
    send.innerHTML = sendLabel;
    say('');
  });
})();
