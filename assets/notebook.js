/* Arbiter Machinae notebook script. Shared by the hub and every note site.
   No dependencies. Everything here is an enhancement: with this file missing,
   blocked, or reduced motion switched on, pages are complete and readable.

   What it does:
     1. Lamp: light / chalkboard theme toggle, remembered across the whole site.
     2. Reveal: highlighter swipes, red-pen strikes and margin notes animate
        once as they scroll into view.
     3. Sketch: a tiny hand-drawn SVG renderer used by the playable figures.
     4. Figures: any <figure data-fig="name"> is upgraded if a renderer exists.
     5. Small paper touches: card tilt, title hand-off for page turns, back to top. */
(function () {
  'use strict';
  var doc = document, root = doc.documentElement;
  var reduced = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var KEY = 'am-theme';

  /* ---------- 1. Lamp ---------- */
  function stored() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function current() {
    var t = root.getAttribute('data-theme');
    if (t === 'dark' || t === 'light') return t;
    return window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  function apply(theme) {
    root.setAttribute('data-theme', theme);
    try { localStorage.setItem(KEY, theme); } catch (e) { /* private mode: theme lasts for this page only */ }
    var lamp = doc.querySelector('.nb-lamp');
    if (lamp) lamp.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
  }
  var saved = stored();
  if (saved === 'dark' || saved === 'light') root.setAttribute('data-theme', saved);

  var LAMP_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">' +
    '<g class="rays"><path d="M12 1.5v2M3.6 5.1l1.4 1.4M20.4 5.1L19 6.5M1.5 12.5h2M20.5 12.5h2"/></g>' +
    '<path class="bulb" d="M8.2 15.2a5.6 5.6 0 1 1 7.6 0c-.7.7-1 1.4-1 2.3H9.2c0-.9-.3-1.6-1-2.3z"/>' +
    '<path d="M9.6 20h4.8M10.4 22.3h3.2"/></svg>';

  function switchTheme(btn) {
    var next = current() === 'dark' ? 'light' : 'dark';
    if (reduced || !doc.startViewTransition) { apply(next); return; }
    var r = btn.getBoundingClientRect();
    var x = r.left + r.width / 2, y = r.top + r.height / 2;
    var far = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    root.classList.add('nb-theme-switch');
    var vt = doc.startViewTransition(function () { apply(next); });
    vt.ready.then(function () {
      root.animate(
        { clipPath: ['circle(0px at ' + x + 'px ' + y + 'px)', 'circle(' + far + 'px at ' + x + 'px ' + y + 'px)'] },
        { duration: 620, easing: 'cubic-bezier(.4,0,.2,1)', pseudoElement: '::view-transition-new(root)' }
      );
    }).catch(function () { /* transition skipped: the theme has still been applied */ });
    vt.finished.then(function () { root.classList.remove('nb-theme-switch'); },
                     function () { root.classList.remove('nb-theme-switch'); });
  }

  function mountLamp() {
    var nav = doc.querySelector('nav.top');
    if (!nav) return;
    var lamp = nav.querySelector('.nb-lamp');
    if (!lamp) {
      lamp = doc.createElement('button');
      lamp.type = 'button';
      lamp.className = 'nb-lamp';
      lamp.innerHTML = LAMP_SVG;
      var before = nav.querySelector('.nav-toggle') || nav.querySelector('.links');
      nav.insertBefore(lamp, before);
    }
    lamp.hidden = false;
    lamp.setAttribute('aria-label', 'Chalkboard theme');
    lamp.setAttribute('title', 'Lamp: switch theme');
    lamp.setAttribute('aria-pressed', current() === 'dark' ? 'true' : 'false');
    lamp.addEventListener('click', function () { switchTheme(lamp); });
  }

  /* ---------- 2. Reveal on scroll ---------- */
  function mountReveal() {
    var sel = 'mark, .nb-hl, del.nb-strike, .nb-margin, .nb-scrawl[data-nb], [data-nb-reveal]';
    var items = doc.querySelectorAll(sel);
    if (reduced || !('IntersectionObserver' in window)) return;   // stay in the finished state
    root.classList.add('nb-js');
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('nb-in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.2 });
    items.forEach(function (el) { io.observe(el); });
  }

  /* ---------- 3. Sketch renderer ---------- */
  var NS = 'http://www.w3.org/2000/svg';
  function rng(seed) {            // small deterministic generator so a figure looks the same on every load
    var s = seed >>> 0 || 1;
    return function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  }
  function el(name, attrs, parent) {
    var n = doc.createElementNS(NS, name);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }
  function f(n) { return Math.round(n * 10) / 10; }
  var Sketch = {
    el: el,
    rng: rng,
    /* A line that wanders slightly, like one drawn without a ruler. */
    line: function (x1, y1, x2, y2, rand, wob) {
      wob = wob == null ? 1.6 : wob;
      var mx = (x1 + x2) / 2 + (rand() - 0.5) * wob * 2, my = (y1 + y2) / 2 + (rand() - 0.5) * wob * 2;
      return 'M' + f(x1 + (rand() - 0.5) * wob) + ' ' + f(y1 + (rand() - 0.5) * wob) +
             'Q' + f(mx) + ' ' + f(my) + ' ' + f(x2 + (rand() - 0.5) * wob) + ' ' + f(y2 + (rand() - 0.5) * wob);
    },
    /* A circle drawn in one pass that slightly overshoots where it started. */
    circle: function (cx, cy, r, rand) {
      var pts = [], n = 9, start = rand() * Math.PI * 2;
      for (var i = 0; i <= n + 1; i++) {
        var a = start + (i / n) * Math.PI * 2, rr = r + (rand() - 0.5) * r * 0.16;
        pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]);
      }
      var d = 'M' + f(pts[0][0]) + ' ' + f(pts[0][1]);
      for (var j = 1; j < pts.length; j++) {
        var p = pts[j - 1], q = pts[j];
        d += 'Q' + f(p[0]) + ' ' + f(p[1]) + ' ' + f((p[0] + q[0]) / 2) + ' ' + f((p[1] + q[1]) / 2);
      }
      return d;
    },
    /* Back-and-forth scribble that fills a circle. */
    scribble: function (cx, cy, r, rand) {
      var d = '', rows = 5, inner = r * 0.78;
      for (var i = 0; i <= rows; i++) {
        var y = cy - inner + (i / rows) * inner * 2;
        var half = Math.sqrt(Math.max(0, inner * inner - (y - cy) * (y - cy)));
        var x = i % 2 ? cx + half : cx - half;
        d += (i ? 'L' : 'M') + f(x + (rand() - 0.5) * 1.5) + ' ' + f(y + (rand() - 0.5) * 1.2);
      }
      return d;
    },
    path: function (parent, d, cls) {
      return el('path', { d: d, 'class': cls + ' nb-draw', pathLength: 1 }, parent);
    }
  };

  /* ---------- 4. Figures ---------- */
  var figures = {};

  /* Reviewer coverage: which planted defects each reviewer caught.
     Data: /data/figures/reviewers.json, generated from the study's results file. */
  figures.reviewers = function (fig, data) {
    var rand = rng(30);
    var active = {};
    (fig.getAttribute('data-start') || 'claude').split(',').forEach(function (id) { active[id.trim()] = true; });

    var types = [], byType = {};
    data.defects.forEach(function (d) {
      if (!byType[d.type]) { byType[d.type] = []; types.push(d.type); }
      byType[d.type].push(d);
    });

    var holder = doc.createElement('div');
    var readout = doc.createElement('p');
    readout.className = 'nb-readout';
    readout.setAttribute('aria-live', 'polite');
    var controls = doc.createElement('div');
    controls.className = 'nb-controls';
    controls.setAttribute('role', 'group');
    controls.setAttribute('aria-label', 'Choose reviewers');

    var rowH = 40, left = 138, step = 34, W = 360, H = types.length * rowH + 10;
    var svg = el('svg', { viewBox: '0 0 ' + W + ' ' + H, role: 'img' });
    var dots = [];
    types.forEach(function (t, ti) {
      var y = ti * rowH + 24;
      var label = el('text', { x: left - 16, y: y + 6, 'text-anchor': 'end', 'class': 'nb-label' }, svg);
      label.textContent = t.replace('-', ' ');
      byType[t].forEach(function (d, i) {
        var cx = left + i * step + 12, cy = y;
        el('path', { d: Sketch.circle(cx, cy, 11, rand), 'class': 'nb-ink' }, svg);
        var fill = Sketch.path(svg, Sketch.scribble(cx, cy, 11, rand), 'nb-ink-fill');
        fill.classList.add('nb-undrawn');
        var miss = Sketch.path(svg, Sketch.line(cx - 5, cy - 5, cx + 5, cy + 5, rand, 1) + Sketch.line(cx + 5, cy - 5, cx - 5, cy + 5, rand, 1), 'nb-ink-red');
        dots.push({ d: d, fill: fill, miss: miss });
      });
    });

    function update() {
      var chosen = data.raters.filter(function (r) { return active[r.id]; });
      var caught = 0;
      dots.forEach(function (o) {
        var hit = o.d.caught.some(function (id) { return active[id]; });
        if (hit) caught++;
        o.fill.classList.toggle('nb-undrawn', !hit);
        o.miss.classList.toggle('nb-undrawn', hit || !chosen.length);
      });
      var names = chosen.map(function (r) { return r.label; });
      var who = !names.length ? 'Nobody reviewing' :
        names.length === 1 ? names[0] + ' alone' :
        names.slice(0, -1).join(', ') + ' and ' + names[names.length - 1] + ' together';
      var count = doc.createElement('b');
      count.textContent = caught + ' of ' + data.n_defects;
      readout.textContent = who + ': ';
      readout.appendChild(count);
      readout.appendChild(doc.createTextNode(' bugs caught'));
      svg.setAttribute('aria-label', who + ' caught ' + caught + ' of ' + data.n_defects + ' planted defects.');
    }

    data.raters.forEach(function (r) {
      var b = doc.createElement('button');
      b.type = 'button';
      b.className = 'nb-chip';
      b.textContent = r.label;
      b.setAttribute('aria-pressed', active[r.id] ? 'true' : 'false');
      b.addEventListener('click', function () {
        active[r.id] = !active[r.id];
        b.setAttribute('aria-pressed', active[r.id] ? 'true' : 'false');
        update();
      });
      controls.appendChild(b);
    });

    holder.appendChild(readout);
    holder.appendChild(controls);
    holder.appendChild(svg);
    var slot = fig.querySelector('[data-fig-slot]');
    if (slot) slot.replaceWith(holder); else fig.insertBefore(holder, fig.firstChild);
    update();
  };

  function mountFigures() {
    doc.querySelectorAll('figure[data-fig]').forEach(function (fig) {
      var render = figures[fig.getAttribute('data-fig')], src = fig.getAttribute('data-src');
      if (!render || !src || !window.fetch) return;      // the static fallback inside the figure stays
      fetch(src).then(function (r) {
        if (!r.ok) throw new Error('figure data ' + r.status);
        return r.json();
      }).then(function (data) { render(fig, data); })
        .catch(function (err) { if (window.console) console.warn('Figure left as static text:', err.message); });
    });
  }

  /* ---------- 5. Paper touches ---------- */
  function mountTilt() {
    if (reduced || !window.matchMedia || !matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    doc.querySelectorAll('[data-nb-tilt]').forEach(function (card) {
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;
        card.style.setProperty('--tilt-x', (py * -5).toFixed(2) + 'deg');
        card.style.setProperty('--tilt-y', (px * 6).toFixed(2) + 'deg');
      });
      card.addEventListener('pointerleave', function () {
        card.style.removeProperty('--tilt-x');
        card.style.removeProperty('--tilt-y');
      });
    });
  }
  /* Page turn: the clicked card's title becomes the note's title on the next page. */
  function mountTitleHandoff() {
    doc.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[data-nb-note]');
      if (!a) return;
      doc.querySelectorAll('[data-nb-note-title]').forEach(function (t) { t.style.viewTransitionName = ''; });
      var title = a.querySelector('[data-nb-note-title]');
      if (title) title.style.viewTransitionName = 'nb-title';
    });
  }
  function mountToTop() {
    var btn = doc.querySelector('button.to-top');
    if (!btn) return;                                   // note layouts carry their own link version
    var sync = function () { btn.classList.toggle('is-hidden', (window.scrollY || root.scrollTop || 0) < 600); };
    btn.addEventListener('click', function () { window.scrollTo(0, 0); });
    window.addEventListener('scroll', sync, { passive: true });
    sync();
  }

  function start() {
    mountLamp(); mountReveal(); mountFigures(); mountTilt(); mountTitleHandoff(); mountToTop();
  }
  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', start); else start();

  window.ArbiterNotebook = { sketch: Sketch, figures: figures };
})();
