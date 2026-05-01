/**
 * DropWise site: scroll-triggered reveals (IntersectionObserver) + Dropix demo sequence.
 */
(function () {
  'use strict';

  function setYear() {
    var el = document.getElementById('year');
    if (el) el.textContent = new Date().getFullYear();
  }

  function initScrollReveals() {
    var nodes = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
    if (!nodes.length) return;

    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      nodes.forEach(function (n) {
        n.classList.add('is-revealed');
      });
      return;
    }

    var io = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-revealed');
          obs.unobserve(entry.target);
        });
      },
      { root: null, rootMargin: '0px 0px -56px 0px', threshold: 0.1 }
    );

    nodes.forEach(function (n) {
      io.observe(n);
    });
  }

  function delay(ms) {
    return new Promise(function (resolve) {
      setTimeout(resolve, ms);
    });
  }

  function initDropixDemo() {
    var root = document.getElementById('dropixDemoRoot');
    var statusEl = document.getElementById('dropixDemoStatus');
    var btn = document.getElementById('dropixDemoStart');
    var hit = document.getElementById('dropixDemoHit');
    if (!root || !statusEl || !btn) return;

    var running = false;

    function setDemoState(opts) {
      root.classList.toggle('dd-locked', opts.locked);
      root.classList.toggle('dd-unlocked', !opts.locked);
      root.classList.toggle('dd-lid-open', opts.lidOpen);
      root.classList.toggle('dd-lid-closed', !opts.lidOpen);
      root.classList.toggle('dd-pkg-in', opts.pkgIn);
      root.classList.toggle('dd-pkg-out', !opts.pkgIn);
    }

    function setStatus(text) {
      statusEl.textContent = text;
    }

    function idleLockedEmpty() {
      setDemoState({ locked: true, lidOpen: false, pkgIn: false });
      setStatus('Locked');
      root.setAttribute(
        'aria-label',
        'Dropix secure box demonstration: locked and empty. Press Start Demo or activate the box.'
      );
    }

    idleLockedEmpty();

    function setInteractDisabled(disabled) {
      btn.disabled = disabled;
      if (hit) {
        hit.setAttribute('aria-disabled', disabled ? 'true' : 'false');
        hit.tabIndex = disabled ? -1 : 0;
      }
    }

    async function runDemo() {
      if (running) return;
      running = true;
      setInteractDisabled(true);

      var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      var step = reduce ? 80 : 700;

      try {
        idleLockedEmpty();
        await delay(reduce ? 40 : 350);

        setStatus('Unlocked');
        setDemoState({ locked: false, lidOpen: false, pkgIn: false });
        await delay(Math.round(step * 0.65));

        setDemoState({ locked: false, lidOpen: true, pkgIn: false });
        await delay(step);

        setDemoState({ locked: false, lidOpen: true, pkgIn: true });
        setStatus('Package placed inside');
        await delay(Math.round(step * 1.05));

        setDemoState({ locked: false, lidOpen: false, pkgIn: true });
        await delay(Math.round(step * 0.85));

        setDemoState({ locked: true, lidOpen: false, pkgIn: true });
        setStatus('Locked again');
        await delay(reduce ? 120 : 1100);

        idleLockedEmpty();
      } finally {
        running = false;
        setInteractDisabled(false);
      }
    }

    btn.addEventListener('click', function () {
      runDemo();
    });

    if (hit) {
      hit.addEventListener('click', function () {
        if (running) return;
        runDemo();
      });
      hit.addEventListener('keydown', function (e) {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        e.preventDefault();
        runDemo();
      });
    }
  }

  setYear();
  initScrollReveals();
  initDropixDemo();
})();
