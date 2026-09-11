/**
 * SWAY — Checkout
 */

/* ═══════════════════════════════════════════════════════════
   MOMO (manual) CONFIG — edit these to YOUR MoMo account
═══════════════════════════════════════════════════════════ */
const SWAY_MOMO_NUMBER = '020 472 5809';        // the number customers pay to
const SWAY_MOMO_NAME   = 'Joana Adu-Okai';       // the name on that MoMo account
const SWAY_MOMO_NETWORK= 'Telecel';               // the network
// Admin gets notified of new orders on this WhatsApp (from ui.js SWAY_WHATSAPP)

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
  if (!cart.length) { showToast('Your cart is empty'); return; }
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
  if (n === 3) fillMomoDetails();
}

// Fill the MoMo payment box with your account details + the customer's reference
async function fillMomoDetails() {
  const total = cartTotal();
  const set = (id, val) => { const e = document.getElementById(id); if (e) e.textContent = val; };
  set('momo-amount', 'GHS ' + total);
  set('momo-pay-number', SWAY_MOMO_NUMBER);
  set('momo-pay-name', SWAY_MOMO_NAME);
  set('momo-pay-network', SWAY_MOMO_NETWORK);
  // reference = username if logged in, else their name from the form
  let ref = '';
  try {
    if (typeof currentUser === 'function') {
      const u = await currentUser();
      ref = u?.user_metadata?.full_name || u?.email?.split('@')[0] || '';
    }
  } catch(e){}
  if (!ref) ref = (document.getElementById('co-name')||{}).value?.trim() || 'your name';
  set('momo-ref', ref);
  window._swayOrderRef = ref;
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

async function placeOrder() {
  const email = document.getElementById('co-email').value.trim();
  if (!email) { showToast('Please enter your email'); return; }
  if (!document.getElementById('momo-number').value.trim()) {
    showToast('Please enter the MoMo number you paid from'); return;
  }

  const btn = document.getElementById('place-order-btn');
  btn.disabled = true; btn.textContent = 'Placing order...';

  const orderNum = 'SW' + Date.now().toString().slice(-6);
  const ref = window._swayOrderRef || (document.getElementById('co-name')||{}).value?.trim() || '';

  // Create a PENDING order in the database (awaiting your MoMo confirmation)
  const saved = await savePendingOrder(orderNum, email, ref);
  if (!saved) {
    showToast('Could not place order, please try again');
    btn.disabled = false; btn.textContent = "I've Sent Payment · Place Order";
    return;
  }

  // Notify admin (WhatsApp) of the new pending order
  notifyAdminNewOrder(orderNum, ref, email);

  showOrderConfirmedPending(orderNum, email, ref);
  btn.disabled = false; btn.textContent = "I've Sent Payment · Place Order";
}

// Save a pending order to the database
async function savePendingOrder(orderNum, email, ref){
  if (typeof sway_db === 'undefined') return false;
  try {
    const { data: u } = await sway_db.auth.getUser();
    const items = cart.map(i => ({ name:i.product.name, color:i.product.color, size:i.size, qty:i.qty, price:i.product.price }));
    const { error } = await sway_db.from('orders').insert({
      user_id: u?.user?.id || null,
      order_ref: orderNum,
      username: ref,
      items,
      subtotal: cartSubtotal(), shipping: cartShipping(), total: cartTotal(),
      currency: 'GHS', status: 'pending',
      ship_name: (document.getElementById('co-name')||{}).value || '',
      ship_phone: (document.getElementById('momo-number')||{}).value || '',
      ship_address: (document.getElementById('co-address')||{}).value || ''
    });
    return !error;
  } catch(e){ console.warn('Order save failed:', e); return false; }
}

// Open WhatsApp to the admin with the new order details
function notifyAdminNewOrder(orderNum, ref, email){
  const total = cartTotal();
  const items = cart.map(i => `${i.qty}x ${i.product.name} (${i.product.color}, ${i.size})`).join(', ');
  const adminWA = (typeof SWAY_WHATSAPP !== 'undefined') ? SWAY_WHATSAPP : '233204725809';
  const text = encodeURIComponent(
    `NEW ORDER ${orderNum}\nReference: ${ref}\nTotal: GHS ${total}\nItems: ${items}\nCustomer: ${email}\n\nAwaiting MoMo payment confirmation.`
  );
  // Opens WhatsApp for the CUSTOMER to send you the order note (also serves as their proof)
  window.open('https://wa.me/' + adminWA + '?text=' + text, '_blank');
}

// Confirmation screen for a pending order
function showOrderConfirmedPending(orderNum, email, ref){
  const total = cartTotal();
  setText('oc-sub', 'Order placed. We will confirm your payment shortly.');
  document.getElementById('oc-details').innerHTML = `
    <div class="oc-row"><span class="label">Order</span><span>${orderNum}</span></div>
    <div class="oc-row"><span class="label">Reference</span><span>${ref}</span></div>
    <div class="oc-row"><span class="label">Total</span><span>${fmt(total)} (GHS ${total})</span></div>
    <div class="oc-row"><span class="label">Status</span><span>Pending payment</span></div>
    <div class="oc-row"><span class="label">Pay to</span><span>${SWAY_MOMO_NETWORK} ${SWAY_MOMO_NUMBER}</span></div>\n    <div class="oc-row"><span class="label">Name</span><span>${SWAY_MOMO_NAME}</span></div>`;
  closeCheckout();
  document.getElementById('order-confirmed').classList.add('open');
  cart = []; promoApplied = false; promoRate = 0;
  saveCart(); renderCart(); updateCartBadge(); updateMobileCart();
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
async function saveOrderToDB(orderNum, email){
  if (typeof sway_db === 'undefined') return;
  try {
    const { data: u } = await sway_db.auth.getUser();
    const items = cart.map(i => ({ name:i.product.name, color:i.product.color, size:i.size, qty:i.qty, price:i.product.price }));
    await sway_db.from('orders').insert({
      user_id: u?.user?.id || null,
      order_ref: orderNum,
      items,
      subtotal: cartSubtotal(), shipping: cartShipping(), total: cartTotal(),
      currency: 'GHS', status: 'paid',
      ship_name: (document.getElementById('co-name')||{}).value || '',
      ship_phone: (document.getElementById('momo-number')||{}).value || '',
      ship_address: (document.getElementById('co-address')||{}).value || ''
    });
  } catch(e){ console.warn('Order save skipped:', e); }
}

function showOrderConfirmed(orderNum, email) {
  // Save the order to the customer's account (after payment confirmed)
  saveOrderToDB(orderNum, email);
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
