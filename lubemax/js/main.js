/* ==========================================================================
   LUBEMAX Lubricants — main.js
   Vanilla JS only. No dependencies, no build step.

   Contents
     1. Settings & helpers
     2. Product data (source: lubemax.in)
     3. Product tabs + grid rendering
     4. Mobile navigation
     5. Smooth anchor navigation + category deep links
     6. Scroll spy, progress bar, sticky header, back to top
     7. Scroll reveal + count-up stats
     8. Pillar ticker
     9. Enquiry form validation + WhatsApp hand-off
    10. Misc (year, reduced motion)
   ========================================================================== */

(function () {
  'use strict';

  /* ----------------------------------------------------------------------
     1. Settings & helpers
     ---------------------------------------------------------------------- */
  var SETTINGS = {
    enquiryWhatsApp: '918760011113',   // Reference: enquiries open on this number
    enquiryLabel: '+91 87600 11113',   // Reference: WhatsApp enquiry line
    salesPhoneLabel: '+91 91115 55812', // Reference: "Call our team"
    messageLimit: 800
  };

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  function qs(sel, root) { return (root || document).querySelector(sel); }
  function qsa(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function smoothScrollTo(el) {
    if (!el) return;
    el.scrollIntoView({ behavior: prefersReducedMotion.matches ? 'auto' : 'smooth', block: 'start' });
  }

  /* ----------------------------------------------------------------------
     2. Product data
     Every entry below is taken from the reference site (lubemax.in).
     Viscosity grades, pack sizes, API/JASO specs and pricing are NOT
     published there, so they are intentionally left out rather than
     invented. Add them here once you have verified data.
     ---------------------------------------------------------------------- */
  var CATEGORIES = {
    engine:  { index: '01', label: 'Engine oil',            heading: 'Advanced engine protection' },
    gear:    { index: '02', label: 'Gear & hydraulic',      heading: 'Control under pressure' },
    coolant: { index: '03', label: 'Coolants',              heading: 'Thermal performance, managed' },
    grease:  { index: '04', label: 'Grease & additives',    heading: 'Grease & additives' }
  };

  var PRODUCTS = [
    {
      id: '4t-engine-oil',
      img: 'images/product-engine.jpg',
      category: 'engine',
      name: '4T Engine Oil',
      grade: '4T',
      kicker: 'Two-wheeler · four stroke',
      blurb: 'High-performance four-stroke protection for smoother pickup, cleaner engines and confident daily riding.',
      brands: ['LUBEFAST', 'LUBEMAX', 'SKN'],
      chips: ['Two-wheeler', 'Four stroke']
    },
    {
      id: 'car-engine-oil',
      img: 'images/product-engine.jpg',
      category: 'engine',
      name: 'Diesel & Petrol Engine Oil',
      grade: 'D+P',
      kicker: 'Four-wheeler · heavy vehicles',
      blurb: 'Advanced synthetic technology engineered for responsive performance and stop-start city protection.',
      brands: ['LUBEFAST', 'LUBEMAX', 'SKN'],
      chips: ['Four-wheeler', 'Heavy vehicles', 'Synthetic technology']
    },
    {
      id: 'tractor-engine-oil',
      img: 'images/product-engine.jpg',
      category: 'engine',
      name: 'Tractor & Off-Highway Engine Oil',
      grade: 'TO',
      kicker: 'Agriculture · high load',
      blurb: 'Dependable protection under dust, heat and sustained high-load agricultural operations.',
      brands: ['LUBEFAST', 'LUBEMAX', 'SKN'],
      chips: ['Tractor', 'Agriculture', 'High load']
    },
    {
      id: 'gear-oil',
      img: 'images/product-gear.jpg',
      category: 'gear',
      name: 'Gear Oil',
      grade: 'EP',
      kicker: 'Extreme pressure gear sets',
      blurb: 'Extreme-pressure gear protection for smooth shifts and durable performance under shock loads.',
      brands: ['LUBEMAX', 'SKN'],
      chips: ['Extreme pressure', 'Shock load', 'Manual gearboxes']
    },
    {
      id: 'hydraulic-oil',
      img: 'images/product-gear.jpg',
      category: 'gear',
      name: 'Hydraulic Oil & Agriculture Oil',
      grade: 'AW',
      kicker: 'Hydraulic power · UTTO · PSO',
      blurb: 'Anti-wear hydraulic fluid with oxidation control, rapid air release and reliable pump protection.',
      brands: ['LUBEMAX', 'SKN'],
      chips: ['Anti-wear', 'Oxidation control', 'Pump protection']
    },
    {
      id: 'transmission-oil',
      img: 'images/product-gear.jpg',
      category: 'gear',
      name: 'Transmission Oil',
      grade: 'ATF',
      kicker: 'Transmission & braking',
      blurb: 'Precision friction performance for responsive shifting, seal compatibility and transmission life.',
      brands: ['LUBEMAX', 'SKN'],
      chips: ['Friction control', 'Seal compatible']
    },
    {
      id: 'coolant',
      img: 'images/product-coolant.jpg',
      category: 'coolant',
      name: 'Coolant',
      grade: 'LL',
      kicker: 'Long-life cooling',
      blurb: 'Long-life cooling technology that helps prevent overheating, corrosion, scale and coolant loss.',
      brands: ['LUBEMAX', 'SKN'],
      chips: ['Anti-corrosion', 'Scale control', 'Heat management']
    },
    {
      id: 'grease-additives',
      img: 'images/product-grease.jpg',
      category: 'grease',
      name: 'Grease & Additives',
      grade: 'GR',
      kicker: 'Category placeholder',
      blurb: 'Listed as a product category on the LUBEMAX enquiry form. Product names, grades and pack sizes are not published on the reference site — replace this card with your verified range.',
      brands: [],
      chips: ['Placeholder'],
      placeholder: true
    }
  ];

  var BRAND_COLORS = {
    LUBEFAST: '#2c9aa8',
    LUBEMAX: '#f2a32c',
    SKN: '#0e4c58'
  };

  /* ----------------------------------------------------------------------
     3. Product tabs + grid rendering
     ---------------------------------------------------------------------- */
  var tabs = qsa('.tab');
  var grid = qs('#productGrid');
  var activeFilter = tabs.length ? tabs[0].dataset.filter : null;

  function brandTags(brands) {
    if (!brands || !brands.length) {
      return '<span class="tag tag--muted">Brands TBC</span>';
    }
    return brands.map(function (b) {
      var cls = b === 'LUBEMAX' ? 'tag tag--amber' : 'tag';
      return '<span class="' + cls + '">' + b + '</span>';
    }).join('');
  }

  function cardMarkup(p, i) {
    var chips = (p.chips || []).map(function (c) { return '<span class="chip">' + c + '</span>'; }).join('');
    return '' +
      '<li class="card" style="animation-delay:' + (i * 55) + 'ms">' +
        '<figure class="card__media">' +
          '<img src="' + p.img + '" alt="' + p.name + ' — LUBEMAX product pack" width="800" height="436" loading="lazy" decoding="async">' +
          '<span class="card__brands">' + brandTags(p.brands) + '</span>' +
        '</figure>' +
        '<div class="card__body">' +
          '<p class="card__kicker">' + p.kicker + '</p>' +
          '<h3>' + p.name + '</h3>' +
          '<p class="card__blurb">' + p.blurb + '</p>' +
          (chips ? '<div class="card__meta">' + chips + '</div>' : '') +
          (p.placeholder
            ? '<p class="card__note">Editable placeholder — add verified products to js/main.js → PRODUCTS.</p>'
            : '<p class="card__note">Grades and pack sizes available on request.</p>') +
          '<div class="card__action">' +
            '<a class="textlink" href="#contact" data-enquiry="' + p.name + '">Enquire about this product' +
              '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M5 12h13M12 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
            '</a>' +
          '</div>' +
        '</div>' +
      '</li>';
  }

  function renderProducts(filter) {
    if (!grid) return;
    var items = PRODUCTS.filter(function (p) { return p.category === filter; });

    if (!items.length) {
      grid.innerHTML = '<li class="empty"><strong>Coming soon.</strong> No products published in this category yet — add them to js/main.js.</li>';
      return;
    }
    grid.innerHTML = items.map(cardMarkup).join('');
  }

  function setTab(filter, opts) {
    var focus = opts && opts.focus;
    activeFilter = filter;

    tabs.forEach(function (tab) {
      var isActive = tab.dataset.filter === filter;
      tab.classList.toggle('is-active', isActive);
      tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
      tab.tabIndex = isActive ? 0 : -1;
      if (isActive && focus) tab.focus();
    });

    renderProducts(filter);

    var panel = qs('#panel-products');
    if (panel) {
      var cat = CATEGORIES[filter] || {};
      panel.setAttribute('aria-label', (cat.heading || 'Products') + ' — ' + (cat.label || ''));
    }
  }

  // Tab counts
  Object.keys(CATEGORIES).forEach(function (key) {
    var el = qs('[data-count-for="' + key + '"]');
    if (el) el.textContent = PRODUCTS.filter(function (p) { return p.category === key; }).length;
  });

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () { setTab(tab.dataset.filter); });
  });

  // Roving tabindex: arrow keys / Home / End
  var tablist = qs('[role="tablist"]');
  if (tablist) {
    tablist.addEventListener('keydown', function (e) {
      var keys = ['ArrowRight', 'ArrowLeft', 'Home', 'End'];
      if (keys.indexOf(e.key) === -1) return;
      e.preventDefault();
      var i = tabs.indexOf(document.activeElement);
      if (i === -1) return;
      var next;
      if (e.key === 'ArrowRight') next = (i + 1) % tabs.length;
      else if (e.key === 'ArrowLeft') next = (i - 1 + tabs.length) % tabs.length;
      else if (e.key === 'Home') next = 0;
      else next = tabs.length - 1;
      setTab(tabs[next].dataset.filter, { focus: true });
    });
  }

  if (grid) renderProducts(activeFilter);

  /* ----------------------------------------------------------------------
     4. Mobile navigation
     ---------------------------------------------------------------------- */
  var navToggle = qs('#navToggle');
  var nav = qs('#primaryNav');

  function setNav(open) {
    if (!navToggle || !nav) return;
    nav.classList.toggle('is-open', open);
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
    navToggle.querySelector('.nav-toggle__text').textContent = open ? 'Close' : 'Menu';
    document.body.classList.toggle('nav-locked', open);
  }

  if (navToggle && nav) {
    navToggle.addEventListener('click', function () {
      setNav(navToggle.getAttribute('aria-expanded') !== 'true');
    });

    // Close on link click
    qsa('a', nav).forEach(function (a) {
      a.addEventListener('click', function () { setNav(false); });
    });

    // Close on Escape, return focus to toggle
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        setNav(false);
        navToggle.focus();
      }
    });

    // Close when leaving mobile breakpoint
    var mq = window.matchMedia('(min-width: 1151px)');
    var onMq = function () { if (mq.matches) setNav(false); };
    if (mq.addEventListener) mq.addEventListener('change', onMq);
    else if (mq.addListener) mq.addListener(onMq);
  }

  /* ----------------------------------------------------------------------
     5. Delegated clicks: smooth anchors, category deep links, prefilled enquiry
     One handler so a link can never be handled twice.
     ---------------------------------------------------------------------- */
  function closestFrom(target, selector) {
    // e.target can be an SVG child (no .closest in some engines) or a text node
    if (!target || typeof target.closest !== 'function') return null;
    if (typeof Element !== 'undefined' && !(target instanceof Element)) return null;
    return target.closest(selector);
  }

  document.addEventListener('click', function (e) {
    // a) Jump to a product category (footer links, brand cards)
    var jump = closestFrom(e.target, '[data-jump]');
    if (jump) {
      e.preventDefault();
      setTab(jump.dataset.jump);
      smoothScrollTo(qs('#products'));
      return;
    }

    // b) Pre-fill the enquiry form from a product card
    var enq = closestFrom(e.target, '[data-enquiry]');
    if (enq) {
      var msg = qs('#message');
      if (msg && !msg.value.trim()) {
        msg.value = 'Enquiry about: ' + enq.dataset.enquiry + '. ';
      }
      // falls through to the anchor handling below
    }

    // c) In-page anchors
    var link = closestFrom(e.target, 'a[href^="#"]');
    if (!link) return;
    var id = link.getAttribute('href');
    if (!id || id === '#') return;
    var target = document.getElementById(id.slice(1));
    if (!target) return;
    e.preventDefault();
    smoothScrollTo(target);
    if (history.replaceState) history.replaceState(null, '', id);
  });

  /* ----------------------------------------------------------------------
     6. Scroll spy, progress bar, sticky header, back to top
     ---------------------------------------------------------------------- */
  var header = qs('#siteHeader');
  var progressBar = qs('#scrollProgress');
  var toTop = qs('#toTop');
  var floatTop = qs('#floatTop');
  var floatTopVisible = false;
  var parallaxEl = qs('[data-parallax]');
  var sections = qsa('main section[id]');
  var navLinks = qsa('[data-navlink]');
  var ticking = false;

  function onScrollFrame() {
    ticking = false;
    var y = window.pageYOffset || document.documentElement.scrollTop;
    var docH = document.documentElement.scrollHeight - window.innerHeight;

    if (progressBar) {
      progressBar.style.width = (docH > 0 ? Math.min(100, (y / docH) * 100) : 0) + '%';
    }
    if (header) header.classList.toggle('is-stuck', y > 12);

    // Floating back-to-top appears once the hero is behind you
    if (floatTop) {
      var showTop = y > 640;
      if (showTop !== floatTopVisible) {
        floatTopVisible = showTop;
        floatTop.hidden = !showTop;
        floatTop.classList.toggle('is-visible', showTop);
      }
    }

    // Gentle parallax on hero imagery (skipped for reduced motion)
    if (parallaxEl && !prefersReducedMotion.matches) {
      parallaxEl.style.transform = 'translate3d(0, ' + (y * 0.055).toFixed(1) + 'px, 0) scale(1.06)';
    }

    // Active section for the nav
    var threshold = y + 140;
    var current = null;
    sections.forEach(function (s) { if (s.offsetTop <= threshold) current = s.id; });
    navLinks.forEach(function (l) {
      var isCurrent = current && l.getAttribute('href') === '#' + current;
      if (isCurrent) l.setAttribute('aria-current', 'true');
      else l.removeAttribute('aria-current');
    });
  }

  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; window.requestAnimationFrame(onScrollFrame); }
  }, { passive: true });
  onScrollFrame();

  function scrollTop() {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion.matches ? 'auto' : 'smooth' });
  }
  if (toTop) {
    toTop.addEventListener('click', function () {
      scrollTop();
      var brand = qs('.brand');
      if (brand) brand.focus({ preventScroll: true });
    });
  }
  if (floatTop) {
    floatTop.addEventListener('click', scrollTop);
  }

  /* ----------------------------------------------------------------------
     7. Scroll reveal + count-up stats
     ---------------------------------------------------------------------- */
  var reveals = qsa('.reveal');

  if (!('IntersectionObserver' in window) || prefersReducedMotion.matches) {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });

    reveals.forEach(function (el) { revealObserver.observe(el); });
  }

  function countUp(el) {
    var target = parseFloat(el.dataset.target || '0');
    var suffix = el.dataset.suffix || '';
    if (prefersReducedMotion.matches) { el.textContent = target + suffix; return; }

    var duration = 1400;
    var start = null;
    function frame(ts) {
      if (!start) start = ts;
      var t = Math.min(1, (ts - start) / duration);
      var eased = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (t < 1) window.requestAnimationFrame(frame);
    }
    window.requestAnimationFrame(frame);
  }

  var counters = qsa('.count');
  if (counters.length) {
    if (!('IntersectionObserver' in window)) {
      counters.forEach(countUp);
    } else {
      var countObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) { countUp(entry.target); countObserver.unobserve(entry.target); }
        });
      }, { threshold: 0.6 });
      counters.forEach(function (c) { countObserver.observe(c); });
    }
  }

  /* ----------------------------------------------------------------------
     8. Pillar ticker (content duplicated for a seamless loop)
     ---------------------------------------------------------------------- */
  var tickerTrack = qs('#tickerTrack');
  if (tickerTrack) {
    var pillars = [
      'Maximum performance',
      'Advanced additives',
      'Precision blending',
      'Own manufacturing',
      'Dedicated R&D',
      'Made in India',
      'Quality tested in every batch',
      '500+ active dealers',
      '250+ products'
    ];
    var html = pillars.map(function (p) {
      return '<span class="ticker__item">' + p + '</span>';
    }).join('');
    tickerTrack.innerHTML = html + html;
  }

  /* ----------------------------------------------------------------------
     9. Enquiry form validation + WhatsApp hand-off
     ---------------------------------------------------------------------- */
  var form = qs('#enquiryForm');

  if (form) {
    var statusBox = qs('#formStatus');
    var name = qs('#name');
    var phone = qs('#phone');
    var email = qs('#email');
    var city = qs('#city');
    var company = qs('#company');
    var product = qs('#product');
    var message = qs('#message');

    function setError(field, errId, msg) {
      var err = qs('#' + errId);
      if (err) err.textContent = msg || '';
      if (field) {
        if (msg) field.setAttribute('aria-invalid', 'true');
        else field.removeAttribute('aria-invalid');
      }
    }

    function validateName() {
      var v = name.value.trim();
      if (!v) { setError(name, 'name-err', 'Please enter your name.'); return false; }
      if (v.length < 2) { setError(name, 'name-err', 'Name looks too short.'); return false; }
      setError(name, 'name-err', '');
      return true;
    }

    function validatePhone() {
      var v = phone.value.trim();
      if (!v) { setError(phone, 'phone-err', 'Please enter a phone number.'); return false; }
      var digits = v.replace(/\D/g, '').length;
      if (digits < 10) {
        setError(phone, 'phone-err', 'Phone number needs at least 10 digits — you entered ' + digits + '.');
        return false;
      }
      if (!/^[+]?[\d\s().-]{7,17}$/.test(v)) {
        setError(phone, 'phone-err', 'Use digits only, with optional spaces, +, ( ) or -.');
        return false;
      }
      setError(phone, 'phone-err', '');
      return true;
    }

    function validateEmail() {
      var v = email.value.trim();
      if (!v) { setError(email, 'email-err', ''); return true; } // optional
      if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(v)) {
        setError(email, 'email-err', 'Enter a valid email address, or leave it blank.');
        return false;
      }
      setError(email, 'email-err', '');
      return true;
    }

    function validatePurpose() {
      var picked = form.querySelector('input[name="purpose"]:checked');
      if (!picked) { setError(null, 'purpose-err', 'Choose one purpose so we can route your enquiry.'); return false; }
      setError(null, 'purpose-err', '');
      return true;
    }

    function validateMessage() {
      var v = message.value;
      if (v.length > SETTINGS.messageLimit) {
        setError(message, 'message-err', 'Message is ' + (v.length - SETTINGS.messageLimit) + ' characters too long.');
        return false;
      }
      setError(message, 'message-err', '');
      return true;
    }

    function validateAll() {
      var results = [validateName(), validatePhone(), validateEmail(), validatePurpose(), validateMessage()];
      return results.every(Boolean);
    }

    // Live re-validation once a field has been touched
    [
      [name, validateName], [phone, validatePhone],
      [email, validateEmail], [message, validateMessage]
    ].forEach(function (pair) {
      var field = pair[0], fn = pair[1];
      if (!field) return;
      // Validate on blur for any non-empty value (the length rule needs it),
      // and re-validate on input once a field has already been flagged.
      field.addEventListener('blur', function () { if (field.value.trim()) fn(); });
      field.addEventListener('input', function () {
        if (field.getAttribute('aria-invalid') === 'true') fn();
      });
    });

    qsa('input[name="purpose"]').forEach(function (r) {
      r.addEventListener('change', validatePurpose);
    });

    function purposeValue() {
      var picked = form.querySelector('input[name="purpose"]:checked');
      return picked ? picked.value : 'General enquiry';
    }

    function buildMessage() {
      var lines = [
        '*New LUBEMAX enquiry*',
        'Purpose: ' + purposeValue(),
        'Name: ' + name.value.trim(),
        'Phone: ' + phone.value.trim()
      ];
      if (email.value.trim()) lines.push('Email: ' + email.value.trim());
      if (company.value.trim()) lines.push('Company: ' + company.value.trim());
      if (city.value.trim()) lines.push('City: ' + city.value.trim());
      if (product.value) lines.push('Product interest: ' + product.value);
      if (message.value.trim()) lines.push('Message: ' + message.value.trim());
      return lines.join('\n');
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      if (!validateAll()) {
        statusBox.className = 'form-status is-error';
        statusBox.textContent = 'Please fix the highlighted fields and send again.';

        // Move focus to the first problem: an invalid field, or the purpose group
        var firstBad = form.querySelector('[aria-invalid="true"]');
        if (!firstBad && !form.querySelector('input[name="purpose"]:checked')) {
          firstBad = form.querySelector('input[name="purpose"]');
        }
        if (firstBad) {
          firstBad.focus({ preventScroll: true });
          firstBad.scrollIntoView({ behavior: prefersReducedMotion.matches ? 'auto' : 'smooth', block: 'center' });
        }
        return;
      }

      statusBox.className = 'form-status is-ok';
      statusBox.textContent = 'Enquiry ready — opening WhatsApp at ' + SETTINGS.enquiryLabel + '…';

      var url = 'https://wa.me/' + SETTINGS.enquiryWhatsApp + '?text=' + encodeURIComponent(buildMessage());
      var opened = window.open(url, '_blank', 'noopener');
      if (!opened) window.location.href = url; // popup blocked — navigate instead
    });

    form.addEventListener('reset', function () {
      window.setTimeout(function () {
        qsa('.field-err').forEach(function (el) { el.textContent = ''; });
        qsa('[aria-invalid]').forEach(function (el) { el.removeAttribute('aria-invalid'); });
        statusBox.className = 'form-status';
        statusBox.textContent = '';
      }, 0);
    });
  }

  /* ----------------------------------------------------------------------
     10. Misc
     ---------------------------------------------------------------------- */
  var year = qs('#year');
  if (year) year.textContent = String(new Date().getFullYear());

})();
