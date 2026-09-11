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
