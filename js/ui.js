/**
 * SWAY — UI helpers
 * shirt placeholder, product cards, toast, search, mobile nav, hero shuffle
 */

/* ── Shirt placeholder — same as original ── */
function shirtPH(p) {
  const isBlack = p.color === 'Black', isPink = p.color === 'Pink';
  const sc = isBlack ? '#0f0f0f' : isPink ? '#c9567a' : '#d0d0d0';
  const st = isBlack ? '#fff' : '#0a0a0a';
  const bg = isBlack ? '#0f0f0f' : isPink ? '#f5e0e6' : '#f2f2f2';
  const acEl = p.accentColor ? `<div class="spark-ac" style="--ac:${p.accentColor}"></div>` : '';
  return `<div class="ph" style="background:${bg};--sc:${sc};--st:${st};--bg:${bg}">
    <div class="ph-bg-text" style="--sc:${sc}">SWAY</div>
    <div class="sh-wrap">
      <div class="sl l" style="--sc:${sc}"></div>
      <div class="sl r" style="--sc:${sc}"></div>
      <div class="sh-body" style="--sc:${sc}">
        <div class="sh-collar" style="--bg:${bg}"></div>
        <span class="sh-logo" style="--st:${st}">SWAY</span>
        ${acEl}
      </div>
    </div>
    <div class="ph-design-name" style="--st:${st}">${p.design.toUpperCase()}</div>
  </div>`;
}

/* ── Product card HTML ── */
function productCardHTML(p) {
  const wished   = wishlist.has(p.id);
  const isBlack  = p.color === 'Black';
  const isPink   = p.color === 'Pink';
  const isOrange = p.color === 'Orange';
  const bgClass  = isBlack ? 'bg-black' : (isPink || isOrange) ? 'bg-pink' : 'bg-white';

  // Siblings = same design slug + same gender (for color dots)
  const siblings = SWAY_PRODUCTS.filter(s => s.gender === p.gender && s.design === p.design);

  const lowStock = p.stock > 0 && p.stock <= 5;
  const imgHTML  = p.img
    ? `<img src="${p.img}" alt="${p.name}" loading="lazy" onerror="this.parentNode.innerHTML=shirtPH(SWAY_PRODUCTS.find(x=>x.id==${p.id}))">`
    : shirtPH(p);

  // Series label
  const seriesLabel = {
    'spark': 'Spark',
    'timechaos': 'Time & Chaos',
    'marionette': 'Marionette',
  }[p.series] || p.series;

  const colorDots = siblings.map(s => {
    const shirtBg = s.shirt === 'Black' ? '#0a0a0a' : '#fff';
    // Spark variants: shirt background + spark-colored inner dot.
    // Plain variants: solid shirt color.
    const inner = s.spark
      ? `<span class="dot-spark" style="background:${s.colorHex}"></span>`
      : '';
    return `<div class="color-dot ${s.id === p.id ? 'active' : ''}"
      style="background:${shirtBg};border:1px solid rgba(0,0,0,.25)" title="${s.color}"
      onclick="openPDP(${s.id});event.stopPropagation()">${inner}</div>`;
  }).join('');

  return `<div class="product-card" onclick="openPDP(${p.id})">
    ${p.isNew ? '<div class="badge-new">NEW</div>' : ''}
    <div class="badge-design ${p.series}">${seriesLabel}</div>
    <button class="wishlist-btn" data-wish-id="${p.id}" onclick="toggleWish(${p.id},event)">
      <svg width="15" height="15" viewBox="0 0 20 20" fill="none">
        <path d="M10 17S2 12 2 7a4 4 0 018-2.83A4 4 0 0118 7c0 5-8 10-8 10z"
          stroke="#0a0a0a" stroke-width="1.4" fill="${wished ? '#0a0a0a' : 'none'}"/>
      </svg>
    </button>
    <div class="card-img ${bgClass}">${imgHTML}</div>
    <button class="quick-add" onclick="openPDP(${p.id});event.stopPropagation()">View Product</button>
    <div class="card-info">
      <div class="card-cat">${p.gender.toUpperCase()} · ${seriesLabel.toUpperCase()}</div>
      <div class="card-name">${p.name}</div>
      ${p.subtitle ? `<div style="font-size:10px;color:#aaa;margin-bottom:12px;letter-spacing:.04em;text-transform:uppercase">${p.subtitle}</div>` : ''}
      <div class="card-price-row">
        <span class="card-price">${fmt(p.price)}</span>
      </div>
      ${lowStock ? `<div class="stock-low">Only ${p.stock} left</div>` : ''}
      <div class="card-colors">${colorDots}</div>
      <div class="card-sizes">${SWAY_SIZES.map(sz => `<span class="size-chip">${sz}</span>`).join('')}</div>
    </div>
  </div>`;
}

/* ── Toast ── */
let _toastTimer;
function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => t.classList.remove('show'), 2400);
}

/* ── Search ── */
function openSearch() {
  document.getElementById('search-overlay').classList.add('open');
  document.getElementById('search-input').focus();
  try { history.pushState({ overlay: 'search' }, '', '#search'); } catch (e) {}
  document.body.style.overflow = 'hidden';
}
function closeSearch() {
  if (typeof syncCloseHistory === 'function') syncCloseHistory('search');
  document.getElementById('search-overlay').classList.remove('open');
  document.body.style.overflow = '';
  document.getElementById('search-input').value = '';
  document.getElementById('search-results').innerHTML = '';
}
function doSearch(q) {
  const el = document.getElementById('search-results');
  if (!q || q.length < 1) { el.innerHTML = ''; return; }
  const r = SWAY_PRODUCTS.filter(p =>
    [p.name, p.design, p.color, p.gender, p.desc].join(' ').toLowerCase().includes(q.toLowerCase())
  );
  if (!r.length) { el.innerHTML = `<div class="search-empty">No results for "<em>${q}</em>"</div>`; return; }
  el.innerHTML = r.map(p => `
    <div class="search-result-item" onclick="closeSearch();openPDP(${p.id})">
      <div class="sri-img" style="background:${p.color==='Black'?'#111':p.color==='Pink'?'#f5e0e6':'#f0f0f0'}">
        ${p.img ? `<img src="${p.img}" alt="${p.name}" onerror="this.style.display='none'">` : ''}
      </div>
      <div class="sri-info">
        <div class="sri-name">${p.name}, ${p.color}</div>
        <div class="sri-meta">${p.gender.toUpperCase()} · ${p.design.toUpperCase()}</div>
      </div>
      <span class="sri-price">${fmt(p.price)}</span>
    </div>`).join('');
}

/* ── Mobile menu ── */
function toggleMenu() {
  document.getElementById('mobile-menu').classList.toggle('open');
  document.getElementById('ham-btn').classList.toggle('open');
}

/* ── Accordion ── */
function toggleAcc(head) {
  const body = head.nextElementSibling;
  const icon = head.querySelector('.acc-icon');
  body.classList.toggle('open');
  icon.textContent = body.classList.contains('open') ? '−' : '+';
}

/* ── Size guide ── */
function openSizeGuide()  { document.getElementById('sg-modal-bg').classList.add('open'); try { history.pushState({ overlay: 'sizeguide' }, '', '#size-guide'); } catch (e) {} }
function closeSizeGuide() { if (typeof syncCloseHistory === 'function') syncCloseHistory('size-guide'); document.getElementById('sg-modal-bg').classList.remove('open'); }

/* ── Keyboard shortcuts ── */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeSearch();
    closeSizeGuide();
    closeCurrencyModal();
    if (typeof closePDP === 'function') closePDP();
    if (typeof closeCart === 'function') closeCart();
    if (typeof closeWishlist === 'function') closeWishlist();
    if (typeof closeCheckout === 'function') closeCheckout();
  }
});

/* ── Nav scroll shadow ── */
window.addEventListener('scroll', () => {
  document.getElementById('main-nav')?.classList.toggle('scrolled', window.scrollY > 10);
}, { passive: true });

/* ── Announce bar rotation ── */
let annIdx = 0;
setInterval(() => {
  const slides = document.querySelectorAll('.aslide');
  if (!slides.length) return;
  slides[annIdx].classList.remove('active');
  annIdx = (annIdx + 1) % slides.length;
  slides[annIdx].classList.add('active');
}, 3500);

/* ═══════════════════════════════════════════════
   HERO SHUFFLE — same as original
   wide1.jpg…wide5.jpg / fwide1.jpg…fwide5.jpg  (large cell)
   model1.jpg…model5.jpg / fmodel1.jpg…fmodel5.jpg (2x2 grid)
═══════════════════════════════════════════════ */
const visW = new Set(), visP = new Set();

// preload
[...WIDE_IMGS, ...PORT_IMGS].forEach(s => {
  const i = new Image(); i.src = 'images/' + s;
});

function shuffle(a) {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
}

function pickFrom(pool, vis, exc) {
  return shuffle(pool).filter(s => !vis.has(s) && s !== exc)[0]
      || shuffle(pool).filter(s => s !== exc)[0];
}

function initCell(cell, src, isLarge) {
  cell.innerHTML = '';
  cell.style.position = 'relative';
  const vis = isLarge ? visW : visP;
  vis.add(src);

  const mk = (op, z) => {
    const img = document.createElement('img');
    img.style.cssText = `position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:${isLarge ? 'center center' : 'center top'};display:block;filter:brightness(.82);transition:opacity .85s ease;opacity:${op};z-index:${z}`;
    return img;
  };

  const A = mk(1, 1), B = mk(0, 2);
  A.src = 'images/' + src;
  cell.appendChild(A);
  cell.appendChild(B);

  if (isLarge) {
    const ov = document.createElement('div');
    ov.className = 'hero-overlay';
    ov.style.zIndex = '10';
    ov.innerHTML = `<div class="tag">SS26 Campaign</div>
      <h1>MOVE<br>DIFFERENT.</h1>
      <div class="hero-cta">
        <button class="hero-btn primary" onclick="document.querySelector('.shop-tabs').scrollIntoView({behavior:'smooth'})">Shop Now</button>
        <button class="hero-btn secondary" onclick="setGender('women',document.querySelectorAll('.nav-text-links button')[1]);document.querySelector('.shop-tabs').scrollIntoView({behavior:'smooth'})">Women's</button>
      </div>`;
    cell.appendChild(ov);
  }

  let front = A, back = B, cur = src;
  const pool = isLarge ? WIDE_IMGS : PORT_IMGS;

  function swap() {
    const next = pickFrom(pool, vis, cur);
    if (!next) return;
    back.src = 'images/' + next;
    back.onload = () => {
      back.style.opacity = '1'; front.style.opacity = '0';
      setTimeout(() => {
        vis.delete(cur); vis.add(next); cur = next;
        front.style.transition = 'none'; front.style.opacity = '0';
        requestAnimationFrame(() => {
          front.style.transition = 'opacity .85s ease';
          [front, back] = [back, front];
          front.style.zIndex = '2'; back.style.zIndex = '1';
        });
      }, 900);
    };
  }

  function sched() {
    const d = isLarge ? 5000 + Math.random() * 4000 : 2000 + Math.random() * 3000;
    setTimeout(() => { swap(); sched(); }, d);
  }
  setTimeout(sched, Math.random() * 2000);
}

function initHero() {
  const large  = document.querySelector('.hero-cell.large');
  const smalls = Array.from(document.querySelectorAll('.hero-right .hero-cell'));
  if (!large) return;

  // Wide image shuffles all wides; 4-grid shuffles all portraits
  const wp = shuffle(WIDE_IMGS.slice());
  const pp = shuffle(PORT_IMGS.slice());
  if (wp.length) initCell(large, wp[0], true);
  smalls.forEach((cell, i) => { if (pp.length) initCell(cell, pp[i % pp.length], false); });
}

/* ═══════════════════════════════════════════════
   GENDER PANEL IMAGE SHUFFLE (homepage)
   Men panel   -> wide1-5.jpg
   Women panel -> fwide1-5.jpg
═══════════════════════════════════════════════ */
function initGenderPanels() {
  const menWide   = WIDE_IMGS.filter(s => !s.startsWith('f'));
  const womenWide = WIDE_IMGS.filter(s => s.startsWith('f'));
  shufflePanel('men-panel-img', menWide);
  shufflePanel('women-panel-img', womenWide);
}

function shufflePanel(elId, pool) {
  const cell = document.getElementById(elId);
  if (!cell || !pool.length) return;

  cell.style.position = 'relative';
  cell.style.overflow = 'hidden';

  const mk = (op, z) => {
    const img = document.createElement('img');
    img.style.cssText = `position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center top;display:block;filter:brightness(.65);transition:opacity 1s ease;opacity:${op};z-index:${z}`;
    return img;
  };

  const order = shuffle(pool);
  let idx = 0;
  const A = mk(1, 1), B = mk(0, 2);
  A.src = 'images/' + order[0];
  // hide placeholder icon once a real image loads
  A.onload = () => { const ph = cell.querySelector('.model-ph'); if (ph) ph.style.display = 'none'; };
  A.onerror = () => { A.style.opacity = '0'; };
  cell.appendChild(A);
  cell.appendChild(B);

  let front = A, back = B;
  function swap() {
    if (pool.length < 2) return;
    idx = (idx + 1) % order.length;
    back.src = 'images/' + order[idx];
    back.onload = () => {
      back.style.opacity = '1';
      front.style.opacity = '0';
      const t = front; front = back; back = t;
      front.style.zIndex = '2'; back.style.zIndex = '1';
    };
    back.onerror = () => {};
  }
  setInterval(swap, 4000 + Math.random() * 2000);
}

/* ═══════════════════════════════════════════════
   LOOKBOOK — one big stage, shuffles ALL wide images
   (both wide1-5 and fwide1-5)
═══════════════════════════════════════════════ */
let lookbookBuilt = false;
function initLookbook() {
  const gallery = document.getElementById('lookbook-gallery');
  if (!gallery) return;
  if (lookbookBuilt) return;     // build once
  lookbookBuilt = true;

  // ALL campaign images: wides (landscape) + portraits (models)
  // wide1-5 + fwide1-5  and  model1-5 + fmodel1-5
  const wides     = WIDE_IMGS.slice();   // landscape -> full width
  const portraits = PORT_IMGS.slice();   // portrait  -> 2-col grid

  let html = '';

  // Interleave: one wide, then two portraits, repeat — a magazine rhythm
  let wi = 0, pi = 0;
  while (wi < wides.length || pi < portraits.length) {
    if (wi < wides.length) {
      html += `<div class="lb-wide">
        <img src="images/${wides[wi]}" alt="SWAY campaign" loading="lazy" onerror="this.parentNode.classList.add('lb-empty')">
      </div>`;
      wi++;
    }
    if (pi < portraits.length) {
      html += '<div class="lb-pair">';
      for (let k = 0; k < 2 && pi < portraits.length; k++, pi++) {
        html += `<div class="lb-port">
          <img src="images/${portraits[pi]}" alt="SWAY campaign" loading="lazy" onerror="this.parentNode.classList.add('lb-empty')">
        </div>`;
      }
      html += '</div>';
    }
  }

  gallery.innerHTML = html;
}

/* ═══════════════════════════════════════════════
   REVEAL ON SCROLL — adds .in when a .reveal enters view
═══════════════════════════════════════════════ */
function initReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;
  if (!('IntersectionObserver' in window)) {
    els.forEach(e => e.classList.add('in'));
    return;
  }
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  els.forEach(e => obs.observe(e));
}
