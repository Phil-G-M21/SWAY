/**
 * SWAY — Admin Guard
 * Put this on admin-only pages. It blocks the page until a logged-in
 * ADMIN is verified. Non-admins see a login form and cannot use the tools.
 * Real security is enforced by Supabase RLS too — even if someone bypassed
 * this screen, the database would reject their writes.
 */
(function(){
  // Build a full-screen gate overlay
  const gate = document.createElement('div');
  gate.id = 'admin-gate';
  gate.style.cssText = 'position:fixed;inset:0;background:#0a0a0a;color:#fff;z-index:9999;display:flex;align-items:center;justify-content:center;font-family:-apple-system,BlinkMacSystemFont,sans-serif';
  gate.innerHTML = `
    <div style="width:100%;max-width:340px;padding:24px">
      <h2 style="font-size:22px;margin-bottom:6px;letter-spacing:.02em">Admin Access</h2>
      <p style="font-size:13px;color:#999;margin-bottom:22px">Enter the SWAY admin login to manage the store.</p>
      <input id="gate-email" type="email" placeholder="Email" style="width:100%;padding:12px;margin-bottom:10px;border:1px solid #333;background:#111;color:#fff;border-radius:6px;font-size:14px">
      <input id="gate-pass" type="password" placeholder="Password" style="width:100%;padding:12px;margin-bottom:16px;border:1px solid #333;background:#111;color:#fff;border-radius:6px;font-size:14px">
      <button id="gate-btn" style="width:100%;padding:13px;background:#fff;color:#0a0a0a;border:none;border-radius:6px;font-size:14px;font-weight:600;cursor:pointer">Sign In</button>
      <p id="gate-msg" style="font-size:12px;color:#e0736b;margin-top:12px;min-height:16px"></p>
      <a href="index.html" style="color:#777;font-size:12px;text-decoration:none;display:inline-block;margin-top:8px">← Back to store</a>
    </div>`;
  document.body.appendChild(gate);
  document.body.style.overflow = 'hidden';

  function msg(t){ const m=document.getElementById('gate-msg'); if(m) m.textContent=t; }

  async function checkAccess(){
    if (typeof sway_db === 'undefined'){ msg('Connection error'); return; }
    const { data } = await sway_db.auth.getUser();
    if (!data?.user){ return; }  // not logged in, keep gate
    // logged in — is this an admin?
    const { data: adm } = await sway_db.from('admins').select('user_id').eq('user_id', data.user.id).maybeSingle();
    if (adm){ unlock(); }
    else { msg('This account is not an admin.'); await sway_db.auth.signOut(); }
  }

  function unlock(){
    gate.remove();
    document.body.style.overflow = '';
    if (typeof onAdminReady === 'function') onAdminReady();
  }

  async function signIn(){
    const email=(document.getElementById('gate-email').value||'').trim().toLowerCase();
    const pass=document.getElementById('gate-pass').value||'';
    if(!email||!pass){ msg('Enter email and password'); return; }
    msg('Checking...');
    const { error } = await sway_db.auth.signInWithPassword({ email, password: pass });
    if(error){ msg('Wrong email or password'); return; }
    checkAccess();
  }

  // wire up after a tick so elements exist
  setTimeout(()=>{
    document.getElementById('gate-btn').addEventListener('click', signIn);
    document.getElementById('gate-pass').addEventListener('keydown', e=>{ if(e.key==='Enter') signIn(); });
    checkAccess();  // auto-unlock if already logged in as admin
  }, 50);
})();
