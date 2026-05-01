/* ============================================================
   Chicken Express — main.js
   Handles: navbar, mobile menu, scroll spy, cart,
            Framer Motion-inspired scroll reveal animations
   ============================================================ */

// ─── NAVBAR SCROLL ───────────────────────────────────────────
const navbar = document.getElementById('navbar');
if (navbar) {
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });
}

// ─── HAMBURGER / MOBILE MENU ─────────────────────────────────
const hamburger   = document.getElementById('hamburger');
const mobileMenu  = document.getElementById('mobileMenu');
const mobileClose = document.getElementById('mobileClose');

function openMobileMenu() {
  mobileMenu.classList.add('open');
  hamburger.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeMobileMenu() {
  mobileMenu.classList.remove('open');
  hamburger.classList.remove('open');
  document.body.style.overflow = '';
}

if (hamburger) hamburger.addEventListener('click', openMobileMenu);
if (mobileClose) mobileClose.addEventListener('click', closeMobileMenu);
if (mobileMenu) {
  mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMobileMenu));
}

// ─── SMOOTH SCROLL FOR ANCHOR LINKS ──────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const navH   = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 70;
    const catNavH = document.querySelector('.cat-nav') ? 62 : 0;
    const top    = target.getBoundingClientRect().top + window.scrollY - navH - catNavH - 8;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

// ─── STICKY CATEGORY NAV — SCROLL SPY ────────────────────────
const catNavPills  = document.querySelectorAll('.cat-nav-pill[data-section]');
const menuSections = document.querySelectorAll('.menu-section[id]');

function updateActiveSection() {
  if (!menuSections.length) return;
  const offset  = 70 + 62 + 24;
  const scrollY = window.scrollY + offset;
  let active = menuSections[0].id;
  menuSections.forEach(s => { if (s.offsetTop <= scrollY) active = s.id; });
  catNavPills.forEach(pill => pill.classList.toggle('active', pill.dataset.section === active));
  const activePill = document.querySelector(`.cat-nav-pill[data-section="${active}"]`);
  if (activePill) activePill.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
}

if (menuSections.length) {
  window.addEventListener('scroll', updateActiveSection, { passive: true });
  updateActiveSection();
}

// ─── CART ─────────────────────────────────────────────────────
let cart = [];

function renderCart() {
  const cartItems  = document.getElementById('cartItems');
  const cartFooter = document.getElementById('cartFooter');
  const cartTotal  = document.getElementById('cartTotal');
  const cartCount  = document.getElementById('cartCount');
  if (!cartItems) return;
  cartCount.textContent = cart.length;
  if (!cart.length) {
    cartItems.innerHTML = '<p class="cart-empty">Your cart is empty. Add some items!</p>';
    cartFooter.style.display = 'none';
    return;
  }
  cartFooter.style.display = 'block';
  cartTotal.textContent = `$${cart.reduce((s, i) => s + i.price, 0).toFixed(2)}`;
  cartItems.innerHTML = cart.map((item, idx) => `
    <div class="cart-item">
      <span class="cart-item-name">${item.name}</span>
      <span class="cart-item-price">$${item.price.toFixed(2)}</span>
      <button class="cart-item-remove" onclick="removeFromCart(${idx})" aria-label="Remove">✕</button>
    </div>`).join('');
}

function openCart() {
  const d = document.getElementById('cartDrawer'), o = document.getElementById('cartOverlay');
  if (!d) return;
  d.classList.add('open'); o.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeCart() {
  const d = document.getElementById('cartDrawer'), o = document.getElementById('cartOverlay');
  if (!d) return;
  d.classList.remove('open'); o.classList.remove('open');
  document.body.style.overflow = '';
}

window.addToCart = function(btn, name, price) {
  cart.push({ name, price });
  renderCart();
  btn.textContent = '✓ Added';
  btn.classList.add('added');
  setTimeout(() => { btn.textContent = 'Add +'; btn.classList.remove('added'); }, 1800);
};
window.removeFromCart = function(idx) { cart.splice(idx, 1); renderCart(); };

const cartFab     = document.getElementById('cartFab');
const cartClose   = document.getElementById('cartClose');
const cartOverlay = document.getElementById('cartOverlay');
if (cartFab)     cartFab.addEventListener('click', openCart);
if (cartClose)   cartClose.addEventListener('click', closeCart);
if (cartOverlay) cartOverlay.addEventListener('click', closeCart);

// ─── HANDLE HASH ON PAGE LOAD ────────────────────────────────
window.addEventListener('load', () => {
  if (!window.location.hash) return;
  const target = document.querySelector(window.location.hash);
  if (!target) return;
  setTimeout(() => {
    const top = target.getBoundingClientRect().top + window.scrollY - 70 - 62 - 16;
    window.scrollTo({ top, behavior: 'smooth' });
  }, 300);
});


/* ============================================================
   FRAMER MOTION–STYLE SCROLL REVEAL
   ============================================================
   Presets mirror Framer Motion's most common variants:
     fadeUp    → { opacity:0, y:56 }  → { opacity:1, y:0 }
     fadeDown  → { opacity:0, y:-40 } → { opacity:1, y:0 }
     fadeLeft  → { opacity:0, x:72 }  → { opacity:1, x:0 }   (enters from right)
     fadeRight → { opacity:0, x:-72 } → { opacity:1, x:0 }   (enters from left)
     scaleIn   → { opacity:0, scale:0.86 } → { opacity:1, scale:1 }
     fadeIn    → { opacity:0 } → { opacity:1 }

   Easing: cubic-bezier(0.16, 1, 0.3, 1) = ease-out-expo  (Framer Motion default)
   Stagger: delay multiplied per sibling index inside a parent
   ============================================================ */

const EASE   = 'cubic-bezier(0.16, 1, 0.3, 1)';
const EASE_S = 'cubic-bezier(0.34, 1.56, 0.64, 1)'; // spring — used for scale-in

// ── animation map: selector → { preset, stagger, delay, duration } ──
const REVEAL_MAP = [
  // headings / eyebrows
  { sel: '.craving-header',              preset: 'fadeUp',    dur: 0.75 },
  { sel: '.section-header',             preset: 'fadeUp',    dur: 0.75 },
  { sel: '.menu-section-header',        preset: 'fadeUp',    dur: 0.75 },
  { sel: '.eyebrow',                    preset: 'fadeDown',  dur: 0.6  },
  { sel: '.strip-heading',              preset: 'fadeUp',    dur: 0.7  },
  { sel: '.hero-badge',                 preset: 'fadeDown',  dur: 0.6  },

  // cards — staggered per sibling
  { sel: '.craving-card',               preset: 'scaleIn',   dur: 0.7,  stagger: 0.10 },
  { sel: '.item-card',                  preset: 'fadeUp',    dur: 0.75, stagger: 0.10 },
  { sel: '.menu-card',                  preset: 'fadeUp',    dur: 0.7,  stagger: 0.07 },
  { sel: '.side-feat-card',             preset: 'fadeUp',    dur: 0.75, stagger: 0.12 },
  { sel: '.side-card',                  preset: 'scaleIn',   dur: 0.6,  stagger: 0.09 },

  // two-column split sections (text from one side, image from the other)
  { sel: '.promo-text',                 preset: 'fadeRight', dur: 0.9  },
  { sel: '.promo-img',                  preset: 'fadeLeft',  dur: 0.9  },
  { sel: '.story-text',                 preset: 'fadeRight', dur: 0.9  },
  { sel: '.story-img',                  preset: 'fadeLeft',  dur: 0.9  },
  { sel: '.tea-content',                preset: 'fadeRight', dur: 0.85 },
  { sel: '.tea-img',                    preset: 'fadeLeft',  dur: 0.85 },
  { sel: '.app-text',                   preset: 'fadeRight', dur: 0.85 },
  { sel: '.app-img',                    preset: 'scaleIn',   dur: 0.7  },

  // stats — spring stagger
  { sel: '.stat',                       preset: 'fadeUp',    dur: 0.65, stagger: 0.14 },

  // footer
  { sel: '.footer-brand',               preset: 'fadeUp',    dur: 0.7  },
  { sel: '.footer-col',                 preset: 'fadeUp',    dur: 0.7,  stagger: 0.10 },

  // CTA strip
  { sel: '.locations-strip h2',         preset: 'fadeUp',    dur: 0.75 },
  { sel: '.locations-strip p',          preset: 'fadeUp',    dur: 0.7,  delay: 0.1 },
  { sel: '.locations-strip .btn-primary', preset: 'scaleIn', dur: 0.65, delay: 0.22 },

  // promo label badge
  { sel: '.promo-label',                preset: 'fadeDown',  dur: 0.55 },

  // sides scroll items
  { sel: '.sides-section .side-feat-card', preset: 'fadeUp', dur: 0.7, stagger: 0.1 },
];

// ── initial CSS for each preset ──────────────────────────────
function getInitialStyle(preset) {
  switch (preset) {
    case 'fadeUp':    return { opacity: '0', transform: 'translateY(56px)' };
    case 'fadeDown':  return { opacity: '0', transform: 'translateY(-40px)' };
    case 'fadeLeft':  return { opacity: '0', transform: 'translateX(72px)' };
    case 'fadeRight': return { opacity: '0', transform: 'translateX(-72px)' };
    case 'scaleIn':   return { opacity: '0', transform: 'scale(0.86) translateY(24px)' };
    case 'fadeIn':    return { opacity: '0', transform: 'none' };
    default:          return { opacity: '0', transform: 'translateY(40px)' };
  }
}

// ── apply initial hidden state ────────────────────────────────
function initReveal(el, preset, delay, dur, ease) {
  const init = getInitialStyle(preset);
  el.style.opacity        = init.opacity;
  el.style.transform      = init.transform;
  el.style.willChange     = 'opacity, transform';
  el.style.transition     = [
    `opacity ${dur}s ${ease} ${delay}s`,
    `transform ${dur}s ${ease} ${delay}s`,
  ].join(', ');
  el._revealReady = true;
}

// ── trigger the reveal ────────────────────────────────────────
function triggerReveal(el) {
  el.style.opacity   = '1';
  el.style.transform = 'none';
  setTimeout(() => { el.style.willChange = 'auto'; }, 1200);
}

// ── build the observer and register elements ──────────────────
function setupScrollReveal() {
  if (!('IntersectionObserver' in window)) return;

  const observed = new WeakSet();

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      if (!el._revealReady) return;
      triggerReveal(el);
      io.unobserve(el);
    });
  }, {
    threshold: 0.08,
    rootMargin: '0px 0px -60px 0px',
  });

  REVEAL_MAP.forEach(({ sel, preset, dur = 0.8, stagger = 0, delay = 0 }) => {
    const els = document.querySelectorAll(sel);
    if (!els.length) return;

    // Group siblings under the same parent for stagger calculation
    const parentMap = new Map();
    els.forEach(el => {
      if (observed.has(el)) return;
      const parent = el.parentElement;
      if (!parentMap.has(parent)) parentMap.set(parent, []);
      parentMap.get(parent).push(el);
    });

    parentMap.forEach(siblings => {
      siblings.forEach((el, i) => {
        if (observed.has(el)) return;
        const totalDelay = delay + (stagger ? i * stagger : 0);
        const easing     = preset === 'scaleIn' ? EASE_S : EASE;
        initReveal(el, preset, totalDelay, dur, easing);
        io.observe(el);
        observed.add(el);
      });
    });
  });
}

// ── page-load entrance for hero elements (above the fold) ─────
function setupHeroEntrance() {
  const heroEls = [
    { sel: '.hero-badge',    delay: 0.05 },
    { sel: '.hero-title',    delay: 0.18 },
    { sel: '.hero-sub',      delay: 0.32 },
    { sel: '.hero-ctas',     delay: 0.44 },
    { sel: '.hero-scroll-hint', delay: 0.6 },
  ];

  heroEls.forEach(({ sel, delay }) => {
    const el = document.querySelector(sel);
    if (!el) return;
    el.style.opacity   = '0';
    el.style.transform = 'translateY(32px)';
    el.style.transition = `opacity 0.85s ${EASE} ${delay}s, transform 0.85s ${EASE} ${delay}s`;
    // Use rAF so the browser paints the hidden state first
    requestAnimationFrame(() => requestAnimationFrame(() => {
      el.style.opacity   = '1';
      el.style.transform = 'none';
    }));
  });
}

// ── number counter animation for stats ────────────────────────
function animateCounters() {
  document.querySelectorAll('.stat-num').forEach(el => {
    const raw    = el.textContent.trim();
    const num    = parseInt(raw.replace(/\D/g, ''), 10);
    const suffix = raw.replace(/[\d]/g, '');
    if (!num) return;

    el._counted = false;
    const countIO = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting || el._counted) return;
        el._counted = true;
        countIO.unobserve(el);

        const start    = Date.now();
        const duration = 1400;
        const ease     = t => 1 - Math.pow(1 - t, 3); // easeOutCubic

        function tick() {
          const progress = Math.min((Date.now() - start) / duration, 1);
          el.textContent = Math.round(ease(progress) * num) + suffix;
          if (progress < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      });
    }, { threshold: 0.5 });
    countIO.observe(el);
  });
}

// ── navbar entrance on load ───────────────────────────────────
function setupNavEntrance() {
  if (!navbar) return;
  navbar.style.transform   = 'translateY(-100%)';
  navbar.style.transition  = `transform 0.7s ${EASE}`;
  requestAnimationFrame(() => requestAnimationFrame(() => {
    navbar.style.transform = 'none';
  }));
}

// ── init all ─────────────────────────────────────────────────
setupNavEntrance();
setupHeroEntrance();

// Run reveal setup after a short tick so initial page paint is clean
requestAnimationFrame(() => {
  setupScrollReveal();
  animateCounters();
});
