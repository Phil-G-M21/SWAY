/**
 * SWAY — Checkout
 */

/* ═══════════════════════════════════════════════════════════
   PAYSTACK CONFIG
   ───────────────────────────────────────────────────────────
   To go LIVE with real payments:
   1. Create a free account at paystack.com (Ghana supported)
   2. Get your PUBLIC key from Settings → API Keys (starts pk_)
   3. Paste it into PAYSTACK_PUBLIC_KEY below
   4. Set PAYSTACK_ENABLED to true
   5. Add this line to index.html <head>:
        <script src="https://js.paystack.co/v1/inline.js"></script>
   That's it — MoMo and Card will process real payments.
   Until then it runs in demo mode (simulated confirmation).
═══════════════════════════════════════════════════════════ */
const PAYSTACK_PUBLIC_KEY = '';            // <-- paste your pk_ key here
const PAYSTACK_ENABLED    = false;         // <-- set true when key is added

let coCurrentStep = 1, activePayTab = 'momo';

function openCheckout() {
  // Close the cart VISUALLY only — do not run its history sync here, or it
  // will history.back() and immediately close the checkout we are opening.
  const cd = document.getElementById('cart-drawer');
  const ov = document.getElementById('overlay');
  if (cd) cd.classList.remove('open');
  if (ov) ov.classList.remove('open');
  const bar = document.getElementById('mobile-cart-sticky');
  if (bar) bar.style.display = 'none';

  // Keep the PDP in the DOM (checkout covers it at a higher z-index) so the
  // browser Back button unwinds cleanly: checkout -> product -> section.
  updateCheckoutSummary();
  coGoStep(1);
  document.getElementById('checkout-page').classList.add('open');
  document.body.style.overflow = 'hidden';
  window.scrollTo(0, 0);
  // Replace the cart history entry with a checkout one (don't stack a new one
  // on top, so Back from checkout goes to the product/section, not the cart).
  try {
    if (location.hash === '#cart') {
      history.replaceState({ checkout: true }, '', '#checkout');
    } else {
      history.pushState({ checkout: true }, '', '#checkout');
    }
  } catch (e) {}
}
function closeCheckout() {
  if (typeof syncCloseHistory === 'function') syncCloseHistory('checkout');
  document.getElementById('checkout-page').classList.remove('open');
  // If the product page is still open underneath, keep scroll locked
  const pdp = document.getElementById('pdp');
  if (pdp && pdp.classList.contains('open')) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
}
function coGoStep(n) {
  coCurrentStep = n;
  [1, 2, 3].forEach(i => {
    document.getElementById('co-step' + i).style.display = i === n ? 'block' : 'none';
    const el = document.getElementById('cstep' + i);
    el.classList.toggle('active', i === n);
    el.classList.toggle('done', i < n);
  });
  updateCheckoutSummary();
}
function coNext(from) {
  if (from === 1) {
    const nm = document.getElementById('co-name').value.trim();
    const em = document.getElementById('co-email').value.trim();
    if (!nm || !em.includes('@')) { showToast('Please fill in name and a valid email'); return; }
  }
  if (from === 2) {
    if (!document.getElementById('co-city').value.trim() || !document.getElementById('co-address').value.trim()) {
      showToast('Please fill in city and address'); return;
    }
  }
  coGoStep(from + 1);
}
function coBack(from) { coGoStep(from - 1); }

function setPayTab(tab, btn) {
  activePayTab = tab;
  document.querySelectorAll('.payment-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  ['momo', 'card'].forEach(t => {
    const el = document.getElementById('pay-' + t);
    if (el) el.style.display = t === tab ? 'block' : 'none';
  });
}

function fmtCard(el) {
  const v = el.value.replace(/\D/g, '').substring(0, 16);
  el.value = v.match(/.{1,4}/g)?.join(' ') || v;
}

function updateCheckoutSummary() {
  if (!document.getElementById('os-subtotal')) return;
  const sub = cartSubtotal(), ship = cartShipping(), disc = cartDiscount(), total = cartTotal();
  setText('os-subtotal', fmt(sub));
  setText('os-shipping', ship === 0 ? 'Free' : fmt(ship));
  setText('os-total', fmt(total));
  const pr = document.getElementById('os-promo-row');
  if (pr) pr.style.display = promoApplied ? '' : 'none';
  if (promoApplied) setText('os-promo-val', '-' + fmt(disc));

  const items = document.getElementById('os-items');
  if (!items) return;
  items.innerHTML = cart.map(item => {
    const p = item.product;
    return `<div class="os-item">
      <div class="os-thumb" style="background:${p.color==='Black'?'#111':p.color==='Pink'?'#f5e0e6':'#efefef'}">
        ${p.img ? `<img src="${p.img}" alt="${p.name}" onerror="this.style.display='none'">` : ''}
        <span class="os-qty">${item.qty}</span>
      </div>
      <div class="os-item-info">
        <div class="os-item-name">${p.name}</div>
        <div class="os-item-meta">${p.color} / ${item.size}</div>
      </div>
      <span class="os-item-price">${fmt(p.price * item.qty)}</span>
    </div>`;
  }).join('');
}

function placeOrder() {
  const email = document.getElementById('co-email').value.trim();
  if (!email) { showToast('Please enter your email'); return; }
  if (activePayTab === 'momo' && !document.getElementById('momo-number').value.trim()) {
    showToast('Please enter your MoMo number'); return;
  }

  // Route to real Paystack when it's set up, otherwise demo mode
  if (PAYSTACK_ENABLED && PAYSTACK_PUBLIC_KEY && typeof PaystackPop !== 'undefined') {
    payWithPaystack(email);
  } else {
    demoPayment(email);
  }
}

/* Real payment — runs when Paystack is configured */
function payWithPaystack(email) {
  const total = cartTotal();                 // total in GHS
  const orderNum = 'SW' + Date.now().toString().slice(-6);
  const handler = PaystackPop.setup({
    key: PAYSTACK_PUBLIC_KEY,
    email: email,
    amount: total * 100,                     // Paystack uses the smallest unit (pesewas)
    currency: 'GHS',
    ref: orderNum,
    channels: activePayTab === 'momo' ? ['mobile_money'] : ['card'],
    metadata: {
      custom_fields: [
        { display_name: 'Name', variable_name: 'name', value: document.getElementById('co-name').value.trim() },
        { display_name: 'Phone', variable_name: 'phone', value: (document.getElementById('momo-number')||{}).value || '' }
      ]
    },
    callback: function(response) {
      // response.reference = the successful transaction ref
      showOrderConfirmed(orderNum, email);
    },
    onClose: function() {
      showToast('Payment cancelled');
      const btn = document.getElementById('place-order-btn');
      btn.disabled = false; btn.textContent = 'Place Order';
    }
  });
  handler.openIframe();
}

/* Demo payment — simulated until Paystack is connected */
function demoPayment(email) {
  const btn = document.getElementById('place-order-btn');
  btn.disabled = true; btn.textContent = 'Processing…';
  const orderNum = 'SW' + Date.now().toString().slice(-6);
  setTimeout(() => {
    showOrderConfirmed(orderNum, email);
    btn.disabled = false; btn.textContent = 'Place Order';
  }, 1800);
}

/* Shared success screen */
function showOrderConfirmed(orderNum, email) {
  const total = cartTotal();
  setText('oc-sub', 'Confirmation sent to ' + email);
  document.getElementById('oc-details').innerHTML = `
    <div class="oc-row"><span class="label">Order</span><span>${orderNum}</span></div>
    <div class="oc-row"><span class="label">Items</span><span>${cart.reduce((s,i)=>s+i.qty,0)}</span></div>
    <div class="oc-row"><span class="label">Total</span><span>${fmt(total)} (GHS ${total})</span></div>
    <div class="oc-row"><span class="label">Payment</span><span>${activePayTab==='momo'?'Mobile Money':'Card'}</span></div>
    <div class="oc-row"><span class="label">Delivery</span><span>3 to 5 business days</span></div>`;
  closeCheckout();
  document.getElementById('order-confirmed').classList.add('open');
  cart = []; promoApplied = false; promoRate = 0;
  saveCart();
  renderCart(); updateCartBadge(); updateMobileCart();
}
