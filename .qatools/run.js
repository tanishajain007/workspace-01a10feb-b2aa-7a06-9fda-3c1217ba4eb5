/* Functional test: loads the real index.html + js/main.js in jsdom and
   exercises the actual code paths. */
const fs = require('fs');
const path = require('path');
const { JSDOM, VirtualConsole } = require('jsdom');

const root = '/home/user/lubemax';
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const js = fs.readFileSync(path.join(root, 'js/main.js'), 'utf8');

const errors = [];
const vc = new VirtualConsole();
vc.on('jsdomError', (e) => errors.push('jsdomError: ' + e.message));
vc.on('error', (...a) => errors.push('console.error: ' + a.join(' ')));

const dom = new JSDOM(html, {
  url: 'http://localhost/',
  runScripts: 'outside-only',
  pretendToBeVisual: true,
  virtualConsole: vc
});
const { window } = dom;
const { document } = window;

// Polyfills jsdom lacks (not part of the shipped code)
window.Element.prototype.scrollIntoView = function () {};
window.openedUrls = [];
window.open = (u) => { window.openedUrls.push(u); return null; };
window.matchMedia = window.matchMedia || function (q) {
  return { matches: false, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} };
};

// --- static reference checks -------------------------------------------------
const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
const jsIds = [...js.matchAll(/qs\('#([A-Za-z0-9_-]+)'\)/g)].map((m) => m[1]);
const missingIds = [...new Set(jsIds)].filter((i) => !ids.has(i));

const hrefs = [...html.matchAll(/href="#([A-Za-z0-9_-]+)"/g)].map((m) => m[1]);
const brokenAnchors = [...new Set(hrefs)].filter((h) => !ids.has(h));

// --- run the real script ----------------------------------------------------
window.eval(js);

const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('  PASS  ' + name); }
  else { fail++; console.log('  FAIL  ' + name + (extra ? '  → ' + extra : '')); }
}

console.log('\n== Static integrity ==');
check('every qs("#id") in main.js exists in index.html', missingIds.length === 0, missingIds.join(', '));
check('no broken in-page anchors', brokenAnchors.length === 0, brokenAnchors.join(', '));

console.log('\n== Imagery ==');
check('hero photo present', !!$('.hero__media img') && $('.hero__media img').getAttribute('src') === 'images/hero.jpg');
check('facility photo present', !!$('.about__media img'));
check('8 application photos present', $$('.app__media img').length === 8, String($$('.app__media img').length));
check('app imgs are lazy', $$('.app__media img').every((i) => i.getAttribute('loading') === 'lazy'));
const appSrcs = $$('.app__media img').map((i) => i.getAttribute('src'));
for (const src of appSrcs) {
  if (!fs.existsSync(path.join(root, src))) { check('image file exists: ' + src, false); }
}
check('all referenced image files exist on disk', appSrcs.every((s) => fs.existsSync(path.join(root, s))) &&
  ['images/hero.jpg', 'images/facility.jpg'].every((s) => fs.existsSync(path.join(root, s))));

console.log('\n== Product tabs (renderProducts / setTab) ==');
check('tab counts rendered', $('[data-count-for="engine"]').textContent === '3');
check('grease count = 1', $('[data-count-for="grease"]').textContent === '1');
check('initial grid shows 3 engine cards', $$('#productGrid .card').length === 3);
check('engine card 1 name', $$('#productGrid .card h3')[0].textContent === '4T Engine Oil');
check('card has brand tag LUBEMAX', $$('#productGrid .card')[0].innerHTML.includes('LUBEMAX'));
const firstImg = $$('#productGrid .card img')[0];
check('card uses <img> with lazy loading', !!firstImg && firstImg.getAttribute('loading') === 'lazy' &&
  firstImg.getAttribute('src') === 'images/product-engine.jpg', firstImg && firstImg.getAttribute('src'));
check('card img has descriptive alt', !!firstImg && firstImg.alt.includes('4T Engine Oil'), firstImg && firstImg.alt);

const gearTab = $('#tab-gear');
gearTab.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
check('clicking Gear tab re-renders 3 cards', $$('#productGrid .card').length === 3);
check('Gear tab aria-selected=true', gearTab.getAttribute('aria-selected') === 'true');
check('Engine tab aria-selected=false', $('#tab-engine').getAttribute('aria-selected') === 'false');
check('Engine tab tabindex=-1', $('#tab-engine').tabIndex === -1);
check('gear grid shows Gear Oil', $$('#productGrid .card h3')[0].textContent === 'Gear Oil');
check('gear cards use gear photo', $$('#productGrid .card img')[0].getAttribute('src') === 'images/product-gear.jpg');
check('panel aria-label updated', $('#panel-products').getAttribute('aria-label').includes('Control under pressure'));

$('#tab-grease').dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
check('grease shows placeholder card', $$('#productGrid .card').length === 1 &&
  $$('#productGrid .card')[0].innerHTML.includes('Editable placeholder'));
check('grease card still shows grease photo', $$('#productGrid .card img')[0].getAttribute('src') === 'images/product-grease.jpg');

console.log('\n== Keyboard tablist (roving tabindex) ==');
$('#tab-grease').focus();
const tablist = $('[role="tablist"]');
tablist.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
check('ArrowRight wraps to first tab (engine)', $('#tab-engine').classList.contains('is-active'));
check('focus moved to engine tab', document.activeElement === $('#tab-engine'));
tablist.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'End', bubbles: true }));
check('End selects last tab (grease)', $('#tab-grease').classList.contains('is-active'));
tablist.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
check('ArrowLeft selects coolant', $('#tab-coolant').classList.contains('is-active') &&
  $$('#productGrid .card h3')[0].textContent === 'Coolant');

console.log('\n== Category deep link [data-jump] ==');
document.querySelector('a[data-jump="gear"]').dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true }));
check('footer "Gear & hydraulic oil" activates gear tab', $('#tab-gear').classList.contains('is-active'));

console.log('\n== Mobile nav toggle ==');
const toggle = $('#navToggle'), nav = $('#primaryNav');
toggle.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
check('opens: aria-expanded=true', toggle.getAttribute('aria-expanded') === 'true');
check('opens: label = Close', toggle.getAttribute('aria-label') === 'Close navigation menu');
check('opens: .is-open class', nav.classList.contains('is-open'));
check('opens: body locked', document.body.classList.contains('nav-locked'));
document.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
check('Escape closes: aria-expanded=false', toggle.getAttribute('aria-expanded') === 'false');
check('Escape restores label', toggle.getAttribute('aria-label') === 'Open navigation menu');
check('Escape unlocks body', !document.body.classList.contains('nav-locked'));
toggle.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
$$('.main-nav a')[0].dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
check('clicking a nav link closes the menu', !nav.classList.contains('is-open'));

const baselineErrors = errors.length;   // jsdom "navigation not implemented" noise baseline

console.log('\n== Form validation ==');
const form = $('#enquiryForm');
const status = $('#formStatus');
function submit() { form.dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true })); }

submit();
check('empty submit blocked', window.openedUrls.length === 0);
check('error status shown', status.classList.contains('is-error'));
check('name marked invalid', $('#name').getAttribute('aria-invalid') === 'true');
check('name error text', $('#name-err').textContent === 'Please enter your name.');
check('phone error text', $('#phone-err').textContent === 'Please enter a phone number.');
check('purpose error text', $('#purpose-err').textContent.includes('Choose one purpose'));

$('#name').value = 'Rohit Kumar';
$('#name').dispatchEvent(new window.Event('input', { bubbles: true }));
check('name error clears on valid input', $('#name-err').textContent === '' && !$('#name').hasAttribute('aria-invalid'));

$('#phone').value = '12345';
$('#phone').dispatchEvent(new window.Event('blur', { bubbles: true }));
check('short phone rejected with digit count', $('#phone-err').textContent.includes('at least 10 digits — you entered 5'), $('#phone-err').textContent);
$('#phone').value = '987654321012345678';
$('#phone').dispatchEvent(new window.Event('input', { bubbles: true }));
check('over-long phone rejected on format', $('#phone-err').textContent.includes('Use digits only'), $('#phone-err').textContent);
$('#phone').value = 'abcdefghij';
$('#phone').dispatchEvent(new window.Event('input', { bubbles: true }));
check('letter-only phone reports 0 digits', $('#phone-err').textContent.includes('you entered 0'), $('#phone-err').textContent);
$('#phone').value = '98765-4321-0123456789';
$('#phone').dispatchEvent(new window.Event('input', { bubbles: true }));
check('10+ digits with bad chars rejected on format', $('#phone-err').textContent.includes('Use digits only'), $('#phone-err').textContent);
$('#phone').value = '98765 43210';
$('#phone').dispatchEvent(new window.Event('input', { bubbles: true }));
check('valid phone clears error', $('#phone-err').textContent === '');

$('#email').value = 'not-an-email';
$('#email').dispatchEvent(new window.Event('blur', { bubbles: true }));
check('invalid email rejected', $('#email-err').textContent.includes('valid email'));
$('#email').value = 'buyer@example.com';
$('#email').dispatchEvent(new window.Event('input', { bubbles: true }));
check('valid email clears error', $('#email-err').textContent === '');

$('#message').value = 'x'.repeat(801);
$('#message').dispatchEvent(new window.Event('blur', { bubbles: true }));
check('over-long message rejected', $('#message-err').textContent.includes('1 characters too long'));
$('#message').value = 'Need 15W-40 for a 12-truck fleet in Rohtak.';
$('#message').dispatchEvent(new window.Event('input', { bubbles: true }));

submit();
check('still blocked while purpose missing', window.openedUrls.length === 0);

const radio = document.querySelector('input[name="purpose"][value="Become Distributor"]');
radio.checked = true;
radio.dispatchEvent(new window.Event('change', { bubbles: true }));
check('purpose error clears after selection', $('#purpose-err').textContent === '');

$('#company').value = 'Sharma Transport';
$('#city').value = 'Rohtak';
$('#product').value = 'Engine Oil';
submit();

check('valid submit opens WhatsApp', window.openedUrls.length === 1);
const url = window.openedUrls[0] || '';
const text = decodeURIComponent(url.split('?text=')[1] || '');
check('WhatsApp number is the enquiry line', url.startsWith('https://wa.me/918760011113'), url.slice(0, 40));
check('message includes purpose', text.includes('Purpose: Become Distributor'));
check('message includes name/phone', text.includes('Name: Rohit Kumar') && text.includes('Phone: 98765 43210'));
check('message includes product + city', text.includes('Product interest: Engine Oil') && text.includes('City: Rohtak'));
check('message includes free text', text.includes('Need 15W-40 for a 12-truck fleet in Rohtak.'));
check('success status shown', status.classList.contains('is-ok') && status.textContent.includes('+91 87600 11113'));

console.log('\n== Reset handling ==');
form.dispatchEvent(new window.Event('reset', { bubbles: true }));
setTimeout(() => {
  check('reset clears status box', status.textContent === '' && status.className === 'form-status');
  check('reset clears error texts', $$('.field-err').every((e) => e.textContent === ''));

  console.log('\n== Enquiry prefill from product card ==');
  $('#message').value = '';   // jsdom doesn't clear values on reset; real browsers do
  $('#tab-engine').dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
  document.querySelector('[data-enquiry]').dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
  check('message prefilled with product name', $('#message').value.startsWith('Enquiry about: 4T Engine Oil'), $('#message').value);

  console.log('\n== Anchor handling suppresses default navigation ==');
  const ev1 = new window.MouseEvent('click', { bubbles: true, cancelable: true });
  document.querySelector('.footer__col a[href="#products"]').dispatchEvent(ev1);
  check('footer anchor: preventDefault called', ev1.defaultPrevented === true);
  const ev2 = new window.MouseEvent('click', { bubbles: true, cancelable: true });
  document.querySelector('a[data-jump="coolant"]').dispatchEvent(ev2);
  check('deep-link anchor: preventDefault called', ev2.defaultPrevented === true);
  check('deep-link switched to coolant tab', $('#tab-coolant').classList.contains('is-active') &&
    $$('#productGrid .card h3')[0].textContent === 'Coolant');

  console.log('\n== Ticker + year ==');
  check('ticker duplicated for seamless loop', $$('#tickerTrack .ticker__item').length === 18);
  check('year injected', /^\d{4}$/.test($('#year').textContent) && +$('#year').textContent >= 2026);

  console.log('\n== Console ==');
  check('no unexpected runtime errors', errors.every((e) => e.includes('Not implemented: navigation')),
    errors.filter((e) => !e.includes('Not implemented: navigation')).join(' | ') || '(none)');

  console.log('\n----------------------------------------');
  console.log('  PASS: ' + pass + '   FAIL: ' + fail);
  console.log('----------------------------------------');
  process.exit(fail ? 1 : 0);
}, 10);
