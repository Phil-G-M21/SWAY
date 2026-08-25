/**
 * SWAY — Product Detail Page
 * IDs match index.html exactly
 */

let pdpProduct      = null;
let pdpSelectedSize = null;
let pdpQty          = 1;

function openPDP(id) {
  const p = SWAY_PRODUCTS.find(x => x.id === id);
  if (!p) return;

  pdpProduct = p;
  pdpSelectedSize = null;
  pdpQty = 1;

  const seriesLabel = {'spark':'Spark Series','timechaos':'Time & Chaos','marionette':'Marionette'}[p.series] || p.series;
  setText('pdp-tag',   p.gender.toUpperCase() + ' · ' + seriesLabel.toUpperCase());
  setText('pdp-name',  p.name);
  setText('pdp-price', fmt(p.price));
  setText('pdp-price-secondary', '');
  setText('pdp-stock', p.stock > 0 && p.stock <= 5 ? 'Only ' + p.stock + ' left in stock' : '');
  setText('pdp-desc',  p.desc);
  setText('pdp-color-label', p.color + (p.accentColor ? ' · Pink Flame' : ''));

  // Badges
  let bdg = '';
  if (p.isNew)  bdg += '<span class="badge-new" style="position:static;display:inline-block;margin-right:6px">NEW</span>';
  if (p.isBest) bdg += '<span style="background:#d4547a;color:#fff;font-size:9px;letter-spacing:.14em;font-weight:600;padding:4px 9px;display:inline-block">BEST SELLER</span>';
  document.getElementById('pdp-badges').innerHTML = bdg;

  // Accordion details
  const details = p.details && p.details.length ? p.details
    : ['Cropped fit', 'Screen-printed graphic', 'Machine wash cold, inside out'];
  document.getElementById('acc-details').innerHTML = '<ul>' + details.map(d => `<li>${d}</li>`).join('') + '</ul>';

  // Gallery
  renderPDPGallery(p);

  // Color swatches
  const siblings = SWAY_PRODUCTS.filter(s => s.gender === p.gender && s.design === p.design);
  document.getElementById('pdp-colors').innerHTML = siblings.map(s => {
    const shirtBg = s.shirt === 'Black' ? '#0a0a0a' : '#fff';
    const inner = s.spark
      ? `<span class="pdp-spark-dot" style="background:${s.colorHex}"></span>`
      : '';
    return `<div class="pdp-color-opt ${s.id === p.id ? 'active' : ''}"
      style="background:${shirtBg};border:1.5px solid rgba(0,0,0,.25)" title="${s.color}"
      onclick="switchPDPColor(${s.id})">${inner}</div>`;
  }).join('');

  // Sizes
  document.getElementById('pdp-sizes').innerHTML = p.sizes.map(sz =>
    `<button class="pdp-size-btn" onclick="pdpSelectSize('${sz}',this)">${sz}</button>`
  ).join('');

  // Qty reset
  pdpQty = 1;
  setText('pdp-qty-val', '1');

  // Related
  renderPDPRelated(p);

  updatePDPWish();
  addToRecentlyViewed(p);

  const pdpEl = document.getElementById('pdp');
  pdpEl.classList.add('open');
  pdpEl.scrollTop = 0;
  document.body.style.overflow = 'hidden';
  // show the mobile add-to-cart bar (only on small screens via CSS)
  const mob = document.getElementById('pdp-mobile-sticky');
  if (mob) mob.classList.add('pdp-open');
  // push history so browser Back closes the PDP and returns to the list
  try { history.pushState({ pdp: id }, '', '#product-' + id); } catch (e) {}
}

function renderPDPGallery(p) {
  const wrap  = document.getElementById('pdp-main-wrap');
  const bg    = p.color === 'Black' ? '#0f0f0f' : (p.color === 'Pink' || p.color === 'Orange') ? '#f5e0e6' : '#f2f2f2';
  const allImgs = (p.imgs && p.imgs.length) ? p.imgs : [p.img].filter(Boolean);

  wrap.style.background = bg;

  wrap.innerHTML = `<img id="pdp-main-src" src="${p.img || ''}" alt="${p.name}"
    style="width:100%;height:auto;display:block;transition:opacity .3s"
    onerror="this.style.opacity='0'">
    <div id="pdp-ph" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center">${shirtPH(p)}</div>`;
  // hide placeholder if real image loads
  const mainImg = wrap.querySelector('#pdp-main-src');
  if (mainImg) mainImg.onload = () => {
    const ph = wrap.querySelector('#pdp-ph');
    if (ph) ph.style.display = 'none';
  };

  const thumbLabels = ['Front', 'Back', 'Model'];
  document.getElementById('pdp-thumbs').innerHTML = allImgs.map((src, i) =>
    `<div class="pdp-thumb ${i === 0 ? 'active' : ''}" onclick="setPDPMain('${src}',this)" style="background:${bg}">
      <img src="${src}" alt="${thumbLabels[i]}" loading="lazy"
        onerror="this.style.opacity='0'">
      <div class="thumb-label">${thumbLabels[i]}</div>
    </div>`
  ).join('');
}

function setPDPMain(src, el) {
  const wrap = document.getElementById('pdp-main-wrap');
  let img = document.getElementById('pdp-main-src');
  if (!img) {
    wrap.innerHTML = `<img id="pdp-main-src" src="${src}" alt=""
      style="width:100%;height:auto;display:block;transition:opacity .3s">`;
    img = document.getElementById('pdp-main-src');
  }
  img.style.opacity = '0';
  setTimeout(() => { img.src = src; img.style.opacity = '1'; }, 200);
  document.querySelectorAll('.pdp-thumb').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
}

function switchPDPColor(id) {
  const p = SWAY_PRODUCTS.find(x => x.id === id);
  if (!p) return;
  pdpProduct = p;
  pdpSelectedSize = null;
  pdpQty = 1;

  setText('pdp-price', fmt(p.price));
  setText('pdp-price-secondary', '');
  setText('pdp-color-label', p.color + (p.accentColor ? ' · Pink Flame' : ''));
  setText('pdp-qty-val', '1');

  renderPDPGallery(p);
  document.querySelectorAll('.pdp-color-opt').forEach(d => d.classList.toggle('active', d.title === p.color));
  setText('pdp-desc', p.desc);
  document.querySelectorAll('.pdp-size-btn').forEach(b => b.classList.remove('active'));
  updatePDPWish();
}

function pdpSelectSize(sz, btn) {
  pdpSelectedSize = sz;
  document.querySelectorAll('.pdp-size-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

function pdpChangeQty(delta) {
  pdpQty = Math.max(1, Math.min(10, pdpQty + delta));
  setText('pdp-qty-val', pdpQty);
}

function pdpAddToCart() {
  if (!pdpSelectedSize) { showToast('Please select a size'); return; }
  addToCart(pdpProduct, pdpSelectedSize, pdpQty);
  showToast(pdpProduct.name + ' (' + pdpProduct.color + ', ' + pdpSelectedSize + ') added');
}

function pdpBuyNow() {
  if (!pdpSelectedSize) { showToast('Please select a size'); return; }
  addToCart(pdpProduct, pdpSelectedSize, pdpQty);
  closePDP();
  setTimeout(openCheckout, 300);
}

function pdpToggleWish() {
  if (!pdpProduct) return;
  toggleWish(pdpProduct.id);
}

function updatePDPWish() {
  if (!pdpProduct) return;
  const wished = wishlist.has(pdpProduct.id);
  const heart  = document.getElementById('pdp-heart');
  const btn    = document.getElementById('pdp-wish-btn');
  if (heart) {
    heart.setAttribute('fill',   wished ? '#c05a7a' : 'none');
    heart.setAttribute('stroke', wished ? '#c05a7a' : '#0a0a0a');
  }
  if (btn) btn.classList.toggle('wished', wished);
}

// Keep updatePDPWishBtn as alias so toggleWish in pages.js can call it
function updatePDPWishBtn() { updatePDPWish(); }

function shareProduct(method) {
  const url  = window.location.href;
  const text = 'Check out ' + (pdpProduct ? pdpProduct.name : 'this') + ' from SWAY. ' + url;
  if (method === 'whatsapp') window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank');
  if (method === 'copy') navigator.clipboard.writeText(url)
    .then(() => showToast('Link copied!'))
    .catch(() => showToast('Copy the URL from your browser'));
}

function closePDP() {
  if (typeof syncCloseHistory === 'function') syncCloseHistory('product-' + (pdpProduct ? pdpProduct.id : ''));
  document.getElementById('pdp').classList.remove('open');
  const mob = document.getElementById('pdp-mobile-sticky');
  if (mob) mob.classList.remove('pdp-open');
  const cartOpen  = document.getElementById('cart-drawer')?.classList.contains('open');
  const checkOpen = document.getElementById('checkout-page')?.classList.contains('open');
  const wlOpen    = document.getElementById('wishlist-page')?.classList.contains('open');
  if (!cartOpen && !checkOpen && !wlOpen) document.body.style.overflow = '';
}

function renderPDPRelated(p) {
  const wrap   = document.getElementById('pdp-related');
  const scroll = document.getElementById('pdp-related-scroll');
  if (!wrap || !scroll) return;
  const related = SWAY_PRODUCTS
    .filter(x => x.id !== p.id && (x.design === p.design || x.gender === p.gender))
    .slice(0, 6);
  if (!related.length) { wrap.style.display = 'none'; return; }
  wrap.style.display = 'block';
  scroll.innerHTML = related.map(r => {
    const bg = r.color === 'Black' ? '#0f0f0f' : r.color === 'Pink' ? '#f5e0e6' : '#f2f2f2';
    return `<div style="flex-shrink:0;width:130px;cursor:pointer" onclick="openPDP(${r.id})">
      <div style="height:173px;background:${bg};overflow:hidden;margin-bottom:8px">
        ${r.img
          ? `<img src="${r.img}" alt="${r.name}" style="width:100%;height:100%;object-fit:cover;object-position:center top;display:block" onerror="this.parentNode.innerHTML=shirtPH(SWAY_PRODUCTS.find(x=>x.id==${r.id}))">`
          : shirtPH(r)}
      </div>
      <div style="font-size:11px;color:#555;margin-bottom:3px">${r.name}, ${r.color}</div>
      <div style="font-size:12px;font-weight:600">${fmt(r.price)}</div>
    </div>`;
  }).join('');
}

// Touch swipe on gallery
(function() {
  let startX = 0;
  document.addEventListener('touchstart', e => {
    if (e.target.closest('#pdp-main-wrap')) startX = e.touches[0].clientX;
  }, { passive: true });
  document.addEventListener('touchend', e => {
    if (!e.target.closest('#pdp-main-wrap')) return;
    const diff = e.changedTouches[0].clientX - startX;
    if (Math.abs(diff) < 40) return;
    const thumbs = document.querySelectorAll('.pdp-thumb');
    if (!thumbs.length) return;
    const active = [...thumbs].findIndex(t => t.classList.contains('active'));
    const next = diff < 0 ? Math.min(active + 1, thumbs.length - 1) : Math.max(active - 1, 0);
    if (next !== active) thumbs[next].click();
  }, { passive: true });
})();

