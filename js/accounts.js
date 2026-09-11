/**
 * SWAY — Accounts (real, via Supabase Auth)
 * Sign up / sign in / sign out backed by Supabase. Works across devices.
 */

async function currentUser() {
  if (typeof sway_db === 'undefined') return null;
  const { data } = await sway_db.auth.getUser();
  return data?.user || null;
}

async function doSignUp() {
  const name = (document.getElementById('signup-name')||{}).value.trim();
  const email = (document.getElementById('signup-email')||{}).value.trim().toLowerCase();
  const pass = (document.getElementById('signup-pass')||{}).value;
  if (!name) { showToast('Please enter your name'); return; }
  if (!email || !email.includes('@')) { showToast('Please enter a valid email'); return; }
  if (!pass || pass.length < 6) { showToast('Password must be at least 6 characters'); return; }

  const { data, error } = await sway_db.auth.signUp({
    email, password: pass,
    options: { data: { full_name: name } }
  });
  if (error) { showToast(error.message); return; }
  // Supabase may require email confirmation depending on project settings
  if (data.user && !data.session) {
    showToast('Check your email to confirm your account');
  } else {
    showToast('Welcome to SWAY, ' + name.split(' ')[0]);
  }
  renderAccountState();
}

async function doSignIn() {
  const email = (document.getElementById('signin-email')||{}).value.trim().toLowerCase();
  const pass = (document.getElementById('signin-pass')||{}).value;
  if (!email || !pass) { showToast('Enter your email and password'); return; }
  const { data, error } = await sway_db.auth.signInWithPassword({ email, password: pass });
  if (error) { showToast('Wrong email or password'); return; }
  const nm = data.user?.user_metadata?.full_name || email.split('@')[0];
  showToast('Welcome back, ' + nm.split(' ')[0]);
  renderAccountState();
}

async function doSignOut() {
  await sway_db.auth.signOut();
  showToast('Signed out');
  renderAccountState();
}

async function renderAccountState() {
  const user = await currentUser();
  const loggedOut = document.getElementById('account-logged-out');
  const loggedIn = document.getElementById('account-logged-in');
  if (!loggedOut || !loggedIn) return;
  if (user) {
    loggedOut.style.display = 'none';
    loggedIn.style.display = 'block';
    const nm = user.user_metadata?.full_name || user.email.split('@')[0];
    const hi = document.getElementById('account-hello');
    if (hi) hi.textContent = 'Hey, ' + nm.split(' ')[0];
    const em = document.getElementById('account-email-display');
    if (em) em.textContent = user.email;
    if (typeof loadOrders === 'function') loadOrders();
  } else {
    loggedOut.style.display = 'block';
    loggedIn.style.display = 'none';
  }
}

// Is the logged-in user an admin? (checks the admins table)
async function isCurrentUserAdmin() {
  const user = await currentUser();
  if (!user) return false;
  const { data } = await sway_db.from('admins').select('user_id').eq('user_id', user.id).maybeSingle();
  return !!data;
}

/* ═══════════════════════════════════════════════════════════
   CUSTOMER DASHBOARD — tabs, orders, addresses, profile
═══════════════════════════════════════════════════════════ */
function acctTab(name, btn){
  document.querySelectorAll('.acct-tab').forEach(b=>b.classList.remove('active'));
  if(btn) btn.classList.add('active');
  document.querySelectorAll('.acct-panel').forEach(p=>p.style.display='none');
  const panel = document.getElementById('panel-'+name);
  if(panel) panel.style.display='block';
  if(name==='orders') loadOrders();
  if(name==='addresses') loadAddresses();
  if(name==='profile') loadProfile();
}

async function loadOrders(){
  const el = document.getElementById('orders-list');
  if(!el) return;
  const user = await currentUser();
  if(!user){ el.innerHTML='<p class="acct-empty">Please sign in.</p>'; return; }
  const { data, error } = await sway_db.from('orders').select('*').order('created_at',{ascending:false});
  if(error){ el.innerHTML='<p class="acct-empty">Could not load orders.</p>'; return; }
  if(!data || !data.length){ el.innerHTML='<p class="acct-empty">No orders yet. Your purchases will show here.</p>'; return; }
  el.innerHTML = data.map(o=>`
    <div class="order-card">
      <div class="order-head">
        <span class="order-ref">Order ${o.order_ref||('#'+o.id)}</span>
        <span class="order-status">${o.status||'paid'}</span>
      </div>
      <div class="order-items">${(o.items||[]).map(i=>`${i.qty}x ${i.name} (${i.color||''} ${i.size||''})`).join(', ')}</div>
      <div class="order-foot">
        <span>${new Date(o.created_at).toLocaleDateString()}</span>
        <span class="order-total">${o.currency||'GHS'} ${o.total}</span>
      </div>
    </div>`).join('');
}

async function loadAddresses(){
  const el = document.getElementById('addresses-list');
  if(!el) return;
  const { data } = await sway_db.from('addresses').select('*').order('created_at',{ascending:false});
  if(!data || !data.length){ el.innerHTML='<p class="acct-empty">No saved addresses yet.</p>'; return; }
  el.innerHTML = data.map(a=>`
    <div class="addr-card">
      <div class="addr-label">${a.label||'Address'}</div>
      <div class="addr-body">${a.full_name||''}<br>${a.line1||''}, ${a.city||''} ${a.region||''}<br>${a.country||''} · ${a.phone||''}</div>
      <button class="addr-del" onclick="deleteAddress(${a.id})">Remove</button>
    </div>`).join('');
}

async function addAddress(){
  const user = await currentUser();
  if(!user){ showToast('Please sign in'); return; }
  const get = id => (document.getElementById(id)||{}).value?.trim() || '';
  const line1 = get('addr-line1');
  if(!line1){ showToast('Enter at least the address'); return; }
  const { error } = await sway_db.from('addresses').insert({
    user_id: user.id, label: get('addr-label')||'Address',
    full_name: get('addr-name'), phone: get('addr-phone'),
    line1, city: get('addr-city'), region: get('addr-region'), country:'Ghana'
  });
  if(error){ showToast(error.message); return; }
  showToast('Address saved');
  ['addr-label','addr-name','addr-phone','addr-line1','addr-city','addr-region'].forEach(id=>{ const e=document.getElementById(id); if(e) e.value=''; });
  loadAddresses();
}

async function deleteAddress(id){
  const { error } = await sway_db.from('addresses').delete().eq('id',id);
  if(error){ showToast(error.message); return; }
  showToast('Address removed'); loadAddresses();
}

async function loadProfile(){
  const user = await currentUser();
  if(!user) return;
  const nameEl = document.getElementById('prof-name');
  const phoneEl = document.getElementById('prof-phone');
  if(nameEl) nameEl.value = user.user_metadata?.full_name || '';
  const { data } = await sway_db.from('profiles').select('*').eq('id',user.id).maybeSingle();
  if(data){
    if(nameEl && data.full_name) nameEl.value = data.full_name;
    if(phoneEl) phoneEl.value = data.phone || '';
  }
}

async function saveProfile(){
  const user = await currentUser();
  if(!user){ showToast('Please sign in'); return; }
  const name = (document.getElementById('prof-name')||{}).value?.trim() || '';
  const phone = (document.getElementById('prof-phone')||{}).value?.trim() || '';
  // upsert profile row
  const { error } = await sway_db.from('profiles').upsert({ id:user.id, full_name:name, phone, updated_at:new Date().toISOString() });
  if(error){ showToast(error.message); return; }
  // also update auth metadata name
  await sway_db.auth.updateUser({ data:{ full_name:name } });
  showToast('Profile saved');
  renderAccountState();
}

async function changePassword(){
  const pass = (document.getElementById('prof-pass')||{}).value || '';
  if(pass.length < 6){ showToast('Password must be at least 6 characters'); return; }
  const { error } = await sway_db.auth.updateUser({ password: pass });
  if(error){ showToast(error.message); return; }
  showToast('Password changed');
  const e = document.getElementById('prof-pass'); if(e) e.value='';
}
