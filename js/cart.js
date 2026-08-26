/**
 * SWAY — Cart & Wishlist
 */
let cart = JSON.parse(localStorage.getItem('sway-cart') || '[]');
let wishlist = new Set(JSON.parse(localStorage.getItem('sway-wish') || '[]'));

// Clean the saved cart: drop items whose product no longer exists (e.g. after a
// product-data update) and re-link each item to the current product object so
// prices, images and colors are always fresh. Prevents "badge shows 1 but cart
// is empty" when old saved data references IDs that changed.
function sanitizeCart() {
  if (!Array.isArray(cart)) { cart = []; return; }
  cart = cart.filter(i => i && i.product && typeof i.product.id === 'number')
             .map(i => {
               const fresh = (typeof SWAY_PRODUCTS !== 'undefined')
                 ? SWAY_PRODUCTS.find(p => p.id === i.product.id) : null;
               if (!fresh) return null;              // product gone -> drop
               return { key: i.key, product: fresh, size: i.size, qty: i.qty };
             })
             .filter(Boolean);
  saveCart();
}
let promoApplied = false, promoRate = 0;
const PROMO_CODES = { 'SWAY10': 0.10, 'LAUNCH15': 0.15 };

function saveCart() { localStorage.setItem('sway-cart', JSON.stringify(cart)); }
function saveWish() { localStorage.setItem('sway-wish', JSON.stringify([...wishlist])); }

function cartSubtotal() { return cart.reduce((s, i) => s + i.product.price * i.qty, 0); }
function cartShipping() { return cartSubtotal() >= 600 ? 0 : 30; }
function cartDiscount() { return promoApplied ? Math.round(cartSubtotal() * promoRate) : 0; }
function cartTotal()    { return cartSubtotal() + cartShipping() - cartDiscount(); }

function addToCart(p, size, qty = 1) {
  if (typeof p === 'number') p = SWAY_PRODUCTS.find(x => x.id === p);
  if (!p) return;
  const key = p.id + '-' + size;
  const ex = cart.find(i => i.key === key);
  if (ex) ex.qty = Math.min(ex.qty + qty, 10);
  else cart.push({ key, product: p, size, qty });
  saveCart();
  renderCart();
  updateCartBadge();
  updateMobileCart();
}

function updateQty(key, delta) {
  const item = cart.find(i => i.key === key);
  if (!item) return;
  item.qty += delta;
  if (item.qty < 1) cart = cart.filter(i => i.key !== key);
  saveCart();
  renderCart();
  updateCartBadge();
  updateMobileCart();
  updateCheckoutSummary();
}

function applyPromo() {
  const code = document.getElementById('promo-input').value.trim().toUpperCase();
  const rate = PROMO_CODES[code];
  if (rate) {
    promoApplied = true; promoRate = rate;
    showToast(Math.round(rate * 100) + '% off applied!');
    renderCart(); updateCheckoutSummary();
  } else {
    showToast('Invalid promo code');
  }
}

function updateCartBadge() {
  const n = cart.reduce((s, i) => s + i.qty, 0);
  const badge = document.getElementById('cart-badge');
  if (!badge) return;
  badge.textContent = n;
  badge.classList.toggle('show', n > 0);
}

function updateMobileCart() {
  const count = cart.reduce((s, i) => s + i.qty, 0);
  const bar = document.getElementById('mobile-cart-sticky');
  if (!bar) return;
  bar.style.display = count > 0 ? 'block' : 'none';
  const lbl = document.getElementById('mobile-cart-lbl');
  const tot = document.getElementById('mobile-cart-total');
  if (lbl) lbl.textContent = 'View Cart (' + count + ')';
  if (tot) tot.textContent = fmt(cartSubtotal());
  // wire click every time in case DOM was re-rendered
  // Always wire the click — do it last so openCart is definitely defined
  const btn = document.getElementById('mobile-cart-btn');
  if (btn) {
    btn.onclick = null;
    btn.onclick = function(e) { e.preventDefault(); openCart(); };
  }
}

function renderCart() {
  const body = document.getElementById('cart-body');
  const foot = document.getElementById('cart-foot');
  if (!body) return;

  const sub  = cartSubtotal();
  const pct  = Math.min(100, (sub / 600) * 100);
  const left = Math.max(0, 600 - sub);
  const fill = document.getElementById('free-ship-fill');
  const txt  = document.getElementById('free-ship-text');
  if (fill) fill.style.width = pct + '%';
  if (txt)  txt.textContent = left > 0 ? fmt(left) + ' away from free shipping' : 'Free shipping on this order';

  if (!cart.length) {
    body.innerHTML = '<div class="cart-empty">Nothing in your cart yet.</div>';
    if (foot) foot.style.display = 'none';
    return;
  }
  if (foot) foot.style.display = 'block';

  const ship = cartShipping(), disc = cartDiscount(), total = cartTotal();
  setText('subtotal-val', fmt(sub));
  setText('shipping-val', ship === 0 ? 'Free' : fmt(ship));
  setText('total-val', fmt(total));
  const promoRow = document.getElementById('promo-row-cart');
  if (promoRow) promoRow.style.display = promoApplied ? '' : 'none';
  if (promoApplied) setText('promo-disc-val', '-' + fmt(disc));

  body.innerHTML = cart.map(item => {
    const p = item.product;
    const thumbBg = p.color === 'Black' ? '#111' : p.color === 'Pink' ? '#f5e0e6' : '#efefef';
    const thumbFg = p.color === 'Black' ? '#fff' : '#0a0a0a';
    const imgTag  = p.img
      ? `<img src="${p.img}" alt="${p.name}" onerror="this.style.display='none'">`
      : `<div class="cart-thumb-ph" style="background:${thumbBg}"><span style="font-family:'Bebas Neue',sans-serif;font-size:10px;letter-spacing:.12em;color:${thumbFg};opacity:.45">SWAY</span></div>`;
    return `<div class="cart-item">
      <div class="cart-thumb" style="background:${thumbBg}">${imgTag}</div>
      <div class="cart-item-info">
        <div class="ci-cat">${p.gender} · ${p.design}</div>
        <div class="ci-name">${p.name}</div>
        <div class="ci-meta">${p.color}${p.accentColor ? ' · Flame' : ''} / ${item.size}</div>
        <div class="qty-row">
          <div class="qty-ctrl">
            <button onclick="updateQty('${item.key}',-1)">−</button>
            <span>${item.qty}</span>
            <button onclick="updateQty('${item.key}',1)">+</button>
          </div>
          <span class="ci-price">${fmt(p.price * item.qty)}</span>
        </div>
      </div>
      <button class="remove-btn" onclick="updateQty('${item.key}',-99)" aria-label="Remove">×</button>
    </div>`;
  }).join('');
}

function openCart() {
  // Do NOT close the PDP — cart opens over it so Back returns to the product
  document.getElementById('cart-drawer').classList.add('open');
  document.getElementById('overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
  // hide the bar while cart is open
  const bar = document.getElementById('mobile-cart-sticky');
  if (bar) bar.style.display = 'none';
  try { history.pushState({ overlay: 'cart' }, '', '#cart'); } catch (e) {}
}

function closeCart() {
  if (typeof syncCloseHistory === 'function') syncCloseHistory('cart');
  document.getElementById('cart-drawer').classList.remove('open');
  document.getElementById('overlay').classList.remove('open');
  const pdpOpen   = document.getElementById('pdp')?.classList.contains('open');
  const checkOpen = document.getElementById('checkout-page')?.classList.contains('open');
  if (!pdpOpen && !checkOpen) document.body.style.overflow = '';
  // restore bar if there are items
  const count = cart.reduce((s, i) => s + i.qty, 0);
  const bar = document.getElementById('mobile-cart-sticky');
  if (bar && count > 0) bar.style.display = 'block';
}

/* ── Mobile cart bar: auto-hide on scroll down, show on scroll up ── */
(function initCartBarAutoHide() {
  let lastY = window.scrollY;
  let ticking = false;
  function onScroll() {
    const bar = document.getElementById('mobile-cart-sticky');
    if (!bar || bar.style.display === 'none') { lastY = window.scrollY; return; }
    const y = window.scrollY;
    const goingDown = y > lastY && y > 120;
    const nearBottom = (window.innerHeight + y) >= (document.body.scrollHeight - 80);
    if (goingDown && !nearBottom) {
      bar.classList.add('bar-hidden');     // hide while reading down the page
    } else {
      bar.classList.remove('bar-hidden');  // show when scrolling up or at bottom
    }
    lastY = y;
    ticking = false;
  }
  window.addEventListener('scroll', function() {
    if (!ticking) { window.requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
})();
