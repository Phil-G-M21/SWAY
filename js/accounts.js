/**
 * SWAY — Local Accounts
 * A simple client-side account system using localStorage.
 * Not a real backend (no server), but gives real sign up / sign in /
 * session behaviour for the store. Passwords are lightly hashed so they
 * are not stored in plain text, but this is NOT bank-grade security —
 * when the backend is added later, this swaps out for real auth.
 */

const ACCT_KEY = 'sway-accounts';
const SESSION_KEY = 'sway-session';

function loadAccounts() {
  try { return JSON.parse(localStorage.getItem(ACCT_KEY) || '{}'); }
  catch (e) { return {}; }
}
function saveAccounts(a) { localStorage.setItem(ACCT_KEY, JSON.stringify(a)); }

// Tiny non-reversible hash (djb2) — obscures the password in storage.
function hashPass(str) {
  let h = 5381;
  for (let i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) | 0;
  return String(h);
}

function currentUser() {
  try {
    const email = localStorage.getItem(SESSION_KEY);
    if (!email) return null;
    const acct = loadAccounts()[email.toLowerCase()];
    return acct ? { email: email.toLowerCase(), name: acct.name } : null;
  } catch (e) { return null; }
}

function doSignUp() {
  const name = (document.getElementById('signup-name')||{}).value.trim();
  const email = (document.getElementById('signup-email')||{}).value.trim().toLowerCase();
  const pass = (document.getElementById('signup-pass')||{}).value;
  if (!name) { showToast('Please enter your name'); return; }
  if (!email || !email.includes('@')) { showToast('Please enter a valid email'); return; }
  if (!pass || pass.length < 4) { showToast('Password must be at least 4 characters'); return; }

  const accounts = loadAccounts();
  if (accounts[email]) { showToast('An account with that email already exists'); return; }
  accounts[email] = { name: name, pass: hashPass(pass) };
  saveAccounts(accounts);
  localStorage.setItem(SESSION_KEY, email);
  showToast('Welcome to SWAY, ' + name.split(' ')[0]);
  renderAccountState();
}

function doSignIn() {
  const email = (document.getElementById('signin-email')||{}).value.trim().toLowerCase();
  const pass = (document.getElementById('signin-pass')||{}).value;
  if (!email || !pass) { showToast('Enter your email and password'); return; }
  const accounts = loadAccounts();
  const acct = accounts[email];
  if (!acct || acct.pass !== hashPass(pass)) { showToast('Wrong email or password'); return; }
  localStorage.setItem(SESSION_KEY, email);
  showToast('Welcome back, ' + acct.name.split(' ')[0]);
  renderAccountState();
}

function doSignOut() {
  localStorage.removeItem(SESSION_KEY);
  showToast('Signed out');
  renderAccountState();
}

// Swap the account page between logged-out (forms) and logged-in (dashboard)
function renderAccountState() {
  const user = currentUser();
  const loggedOut = document.getElementById('account-logged-out');
  const loggedIn = document.getElementById('account-logged-in');
  if (!loggedOut || !loggedIn) return;
  if (user) {
    loggedOut.style.display = 'none';
    loggedIn.style.display = 'block';
    const hi = document.getElementById('account-hello');
    if (hi) hi.textContent = 'Hey, ' + user.name.split(' ')[0];
    const em = document.getElementById('account-email-display');
    if (em) em.textContent = user.email;
  } else {
    loggedOut.style.display = 'block';
    loggedIn.style.display = 'none';
  }
  // reflect in nav if there's an indicator
  const navAcct = document.getElementById('nav-account-label');
  if (navAcct) navAcct.textContent = user ? user.name.split(' ')[0] : 'Account';
}
