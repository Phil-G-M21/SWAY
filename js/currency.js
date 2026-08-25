/**
 * SWAY — Currency System
 */
const CURRENCIES = [
  { code:'GHS', symbol:'GHS ', name:'Ghana Cedi',         rate:1,     decimals:0 },
  { code:'USD', symbol:'$',    name:'US Dollar',          rate:0.063, decimals:2 },
  { code:'GBP', symbol:'£',    name:'British Pound',      rate:0.050, decimals:2 },
  { code:'EUR', symbol:'€',    name:'Euro',               rate:0.058, decimals:2 },
  { code:'NGN', symbol:'₦',   name:'Nigerian Naira',     rate:103,   decimals:0 },
  { code:'KES', symbol:'KSh ', name:'Kenyan Shilling',    rate:8.1,   decimals:0 },
  { code:'ZAR', symbol:'R',    name:'South African Rand', rate:1.16,  decimals:2 },
  { code:'CAD', symbol:'CA$',  name:'Canadian Dollar',    rate:0.086, decimals:2 },
  { code:'AED', symbol:'AED ', name:'UAE Dirham',         rate:0.231, decimals:2 },
];

const COUNTRY_TO_CURR = {
  GH:'GHS', NG:'NGN', KE:'KES', ZA:'ZAR',
  US:'USD', CA:'CAD', GB:'GBP',
  DE:'EUR', FR:'EUR', IT:'EUR', ES:'EUR', NL:'EUR', BE:'EUR', AT:'EUR', PT:'EUR',
  AE:'AED',
};

let activeCurrency = CURRENCIES[0];

/** Convert GHS price to active currency and format */
function fmt(ghsPrice) {
  const val = ghsPrice * activeCurrency.rate;
  return activeCurrency.symbol + Number(val.toFixed(activeCurrency.decimals)).toLocaleString(undefined, {
    minimumFractionDigits: activeCurrency.decimals,
    maximumFractionDigits: activeCurrency.decimals,
  });
}

function setCurrency(curr, closeModal = true) {
  activeCurrency = curr;
  localStorage.setItem('sway-currency', curr.code);

  // Nav button
  const code = document.getElementById('curr-code-display');
  if (code) code.textContent = curr.code;

  // Mobile menu
  const mc = document.getElementById('mob-curr-code');
  if (mc) mc.textContent = curr.code;

  // Announce bar threshold
  const ann = document.getElementById('ann-threshold');
  if (ann) ann.textContent = fmt(600);

  if (closeModal) closeCurrencyModal();

  // Re-render everything price-dependent across ALL pages
  if (typeof renderHomePage === 'function') renderHomePage();
  if (typeof renderShopPage === 'function') { renderShopPage('men'); renderShopPage('women'); }
  if (typeof renderCart === 'function') renderCart();
  if (typeof updateCheckoutSummary === 'function') updateCheckoutSummary();
  if (typeof updateMobileCart === 'function') updateMobileCart();
  if (typeof renderWishlistPage === 'function') {
    const wl = document.getElementById('wishlist-page');
    if (wl && wl.classList.contains('open')) renderWishlistPage();
  }
  renderCurrencyGrid();

  // Update open PDP prices (main + related)
  if (typeof pdpProduct !== 'undefined' && pdpProduct) {
    const pp = document.getElementById('pdp-price');
    if (pp) pp.textContent = fmt(pdpProduct.price);
    if (typeof renderPDPRelated === 'function') renderPDPRelated(pdpProduct);
  }
}

function openCurrencyModal() {
  renderCurrencyGrid();
  document.getElementById('currency-modal-bg').classList.add('open');
  try { history.pushState({ overlay: 'currency' }, '', '#currency'); } catch (e) {}
}
function closeCurrencyModal() {
  if (typeof syncCloseHistory === 'function') syncCloseHistory('currency');
  document.getElementById('currency-modal-bg').classList.remove('open');
}

function renderCurrencyGrid() {
  const el = document.getElementById('currency-grid');
  if (!el) return;
  el.innerHTML = CURRENCIES.map(c => `
    <button class="curr-opt ${c.code === activeCurrency.code ? 'active' : ''}"
      onclick="setCurrency(CURRENCIES.find(x=>x.code==='${c.code}'))">
      <div class="curr-info">
        <span class="curr-code">${c.code}</span>
        <span class="curr-name">${c.name}</span>
      </div>
    </button>`).join('');
}

function detectCurrency() {
  const saved = localStorage.getItem('sway-currency');
  if (saved) { const c = CURRENCIES.find(x => x.code === saved); if (c) { setCurrency(c, false); return; } }
  fetch('https://ip-api.com/json/?fields=countryCode')
    .then(r => r.json())
    .then(d => { const code = COUNTRY_TO_CURR[d.countryCode]; if (code) { const c = CURRENCIES.find(x => x.code === code); if (c) setCurrency(c, false); } })
    .catch(() => {});
}

// Shared DOM helper — used across all modules
function setText(id, val) { const el = document.getElementById(id); if (el) el.textContent = val; }

