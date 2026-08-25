/**
 * SWAY — Pages: wishlist, recently viewed, toggles
 * Main section routing is handled inline in index.html
 */

let recentlyViewed = [];

/* ── Keep these for compatibility with other modules ── */
let activeGender = 'men';

/* ── Wishlist toggle on cards ── */
function toggleWish(id, e) {
  if (e) e.stopPropagation();
  wishlist.has(id) ? wishlist.delete(id) : wishlist.add(id);
  localStorage.setItem('sway-wish', JSON.stringify([...wishlist]));
  // re-render the currently visible grids
  ['men-grid','women-grid','home-new-row','wl-content'].forEach(gid => {
    const el = document.getElementById(gid);
    if (el && el.innerHTML) {
      // just update heart icons without full re-render
    }
  });
  document.querySelectorAll('[data-wish-id]').forEach(btn => {
    const wid = parseInt(btn.getAttribute('data-wish-id'));
    const path = btn.querySelector('path');
    if (path) path.setAttribute('fill', wishlist.has(wid) ? '#0a0a0a' : 'none');
  });
  updateWishBadge();
  if (typeof pdpProduct !== 'undefined' && pdpProduct && pdpProduct.id === id) updatePDPWish();
  showToast(wishlist.has(id) ? 'Saved to wishlist' : 'Removed from wishlist');
}

function updateWishBadge() {
  const n     = wishlist.size;
  const badge = document.getElementById('wish-badge');
  if (badge) { badge.textContent = n; badge.classList.toggle('show', n > 0); }
  const heart = document.getElementById('nav-heart');
  if (heart)  heart.setAttribute('fill', n > 0 ? '#0a0a0a' : 'none');
}

/* ── Recently viewed ── */
function addToRecentlyViewed(p) {
  recentlyViewed = recentlyViewed.filter(x => x.id !== p.id);
  recentlyViewed.unshift(p);
  if (recentlyViewed.length > 8) recentlyViewed.pop();
}

/* ── Wishlist page ── */
function openWishlist() {
  renderWishlistPage();
  document.getElementById('wishlist-page').classList.add('open');
  document.body.style.overflow = 'hidden';
  try { history.pushState({ overlay: 'wishlist' }, '', '#wishlist'); } catch (e) {}
}
function closeWishlist() {
  if (typeof syncCloseHistory === 'function') syncCloseHistory('wishlist');
  document.getElementById('wishlist-page').classList.remove('open');
  document.body.style.overflow = '';
}
function renderWishlistPage() {
  const items = [...wishlist].map(id => SWAY_PRODUCTS.find(p => p.id === id)).filter(Boolean);
  document.getElementById('wl-count').textContent = items.length + ' item' + (items.length !== 1 ? 's' : '') + ' saved';
  const el = document.getElementById('wl-content');
  if (!items.length) {
    el.innerHTML = '<div class="wl-empty">Your wishlist is empty.<br><br><button onclick="closeWishlist()">Browse Tees</button></div>';
    return;
  }
  el.innerHTML = `<div class="wl-grid">${items.map(p => `
    <div class="wl-item">
      ${productCardHTML(p)}
      <button class="wl-move-btn" onclick="addToCart(SWAY_PRODUCTS.find(x=>x.id===${p.id}),SWAY_SIZES[1]);showToast('${p.name} added to cart')">Move to Cart</button>
    </div>`).join('')}</div>`;
}

/* ── Newsletter (kept for compatibility) ── */
function scrollToNewsletter() {
  const el = document.getElementById('newsletter-section');
  if (el) el.scrollIntoView({ behavior: 'smooth' });
}

/* ── Mobile menu ── */
function toggleMenu() {
  const menu    = document.getElementById('mobile-menu');
  const overlay = document.getElementById('mob-menu-overlay');
  const btn     = document.getElementById('ham-btn');
  const open    = menu.classList.contains('open');
  menu.classList.toggle('open', !open);
  if (overlay) overlay.classList.toggle('open', !open);
  btn.classList.toggle('open', !open);
  document.body.style.overflow = open ? '' : 'hidden';
}
