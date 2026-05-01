/* ============================================================
   Chicken Express — main.js
   Handles: navbar, mobile menu, scroll spy, cart, animations
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

// Close on link click
if (mobileMenu) {
  mobileMenu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', closeMobileMenu);
  });
}

// ─── SMOOTH SCROLL FOR ANCHOR LINKS ──────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const navH    = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 70;
    const catNavH = document.querySelector('.cat-nav')
      ? parseInt(getComputedStyle(document.documentElement).getPropertyValue('--cat-nav-h')) || 62
      : 0;
    const offset  = navH + catNavH + 8;
    const top     = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

// ─── STICKY CATEGORY NAV — SCROLL SPY ────────────────────────
const catNavPills  = document.querySelectorAll('.cat-nav-pill[data-section]');
const menuSections = document.querySelectorAll('.menu-section[id]');

function updateActiveSection() {
  if (!menuSections.length) return;

  const navH    = (parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 70);
  const catH    = 62;
  const offset  = navH + catH + 24;
  const scrollY = window.scrollY + offset;

  let active = menuSections[0].id;
  menuSections.forEach(section => {
    if (section.offsetTop <= scrollY) active = section.id;
  });

  catNavPills.forEach(pill => {
    pill.classList.toggle('active', pill.dataset.section === active);
  });

  // scroll active pill into view in the nav
  const activePill = document.querySelector(`.cat-nav-pill[data-section="${active}"]`);
  if (activePill) {
    activePill.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
  }
}

if (menuSections.length) {
  window.addEventListener('scroll', updateActiveSection, { passive: true });
  updateActiveSection();
}

// ─── CART STATE ───────────────────────────────────────────────
let cart = [];

function getTotal() {
  return cart.reduce((sum, item) => sum + item.price, 0);
}

function renderCart() {
  const cartItems  = document.getElementById('cartItems');
  const cartFooter = document.getElementById('cartFooter');
  const cartTotal  = document.getElementById('cartTotal');
  const cartCount  = document.getElementById('cartCount');

  if (!cartItems) return;

  cartCount.textContent = cart.length;

  if (!cart.length) {
    cartItems.innerHTML  = '<p class="cart-empty">Your cart is empty. Add some items!</p>';
    cartFooter.style.display = 'none';
    return;
  }

  cartFooter.style.display = 'block';
  cartTotal.textContent = `$${getTotal().toFixed(2)}`;

  cartItems.innerHTML = cart.map((item, idx) => `
    <div class="cart-item">
      <span class="cart-item-name">${item.name}</span>
      <span class="cart-item-price">$${item.price.toFixed(2)}</span>
      <button class="cart-item-remove" onclick="removeFromCart(${idx})" aria-label="Remove">✕</button>
    </div>
  `).join('');
}

function openCart() {
  const drawer  = document.getElementById('cartDrawer');
  const overlay = document.getElementById('cartOverlay');
  if (!drawer) return;
  drawer.classList.add('open');
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  const drawer  = document.getElementById('cartDrawer');
  const overlay = document.getElementById('cartOverlay');
  if (!drawer) return;
  drawer.classList.remove('open');
  overlay.classList.remove('open');
  document.body.style.overflow = '';
}

window.addToCart = function(btn, name, price) {
  cart.push({ name, price });
  renderCart();

  btn.textContent = '✓ Added';
  btn.classList.add('added');
  setTimeout(() => {
    btn.textContent = 'Add +';
    btn.classList.remove('added');
  }, 1800);
};

window.removeFromCart = function(idx) {
  cart.splice(idx, 1);
  renderCart();
};

// Cart open/close events
const cartFab     = document.getElementById('cartFab');
const cartClose   = document.getElementById('cartClose');
const cartOverlay = document.getElementById('cartOverlay');

if (cartFab)     cartFab.addEventListener('click', openCart);
if (cartClose)   cartClose.addEventListener('click', closeCart);
if (cartOverlay) cartOverlay.addEventListener('click', closeCart);

// ─── INTERSECTION OBSERVER — FADE UP ANIMATIONS ──────────────
const fadeEls = document.querySelectorAll('.item-card, .menu-card, .side-card, .promo-banner, .story-text, .app-text');

if ('IntersectionObserver' in window && fadeEls.length) {
  fadeEls.forEach(el => el.classList.add('fade-up'));

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  fadeEls.forEach(el => io.observe(el));
}

// ─── CATEGORY STRIP ACTIVE STATE (HOMEPAGE) ──────────────────
document.querySelectorAll('.cat-pill').forEach(pill => {
  pill.addEventListener('click', function() {
    document.querySelectorAll('.cat-pill').forEach(p => p.classList.remove('active'));
    this.classList.add('active');
  });
});

// ─── HANDLE HASH ON PAGE LOAD (menu.html) ────────────────────
window.addEventListener('load', () => {
  if (window.location.hash) {
    const target = document.querySelector(window.location.hash);
    if (!target) return;
    setTimeout(() => {
      const navH  = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 70;
      const catH  = document.querySelector('.cat-nav') ? 62 : 0;
      const top   = target.getBoundingClientRect().top + window.scrollY - navH - catH - 16;
      window.scrollTo({ top, behavior: 'smooth' });
    }, 300);
  }
});
