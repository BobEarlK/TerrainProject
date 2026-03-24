import { client } from './supabase-client.js';

const loginOverlay = document.getElementById('login-overlay');

// ── Login dialog ───────────────────────────────────────────────────────────
export function showLoginDialog() {
  loginOverlay.classList.add('visible');
}

export function clearLoginForm() {
  document.getElementById('login-email').value            = '';
  document.getElementById('login-password').value         = '';
  document.getElementById('login-error').style.display    = 'none';
  document.getElementById('login-message').style.display  = 'none';
  document.getElementById('login-view').style.display     = 'block';
  document.getElementById('reset-view').style.display     = 'none';
}

document.getElementById('login-cancel-btn').addEventListener('click', () => {
  loginOverlay.classList.remove('visible');
  clearLoginForm();
});

document.getElementById('login-submit-btn').addEventListener('click', async () => {
  const email    = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  const errorEl  = document.getElementById('login-error');
  errorEl.style.display = 'none';

  const { error } = await client.auth.signInWithPassword({ email, password });
  if (error) {
    errorEl.textContent   = 'Invalid email or password.';
    errorEl.style.display = 'block';
  } else {
    loginOverlay.classList.remove('visible');
    clearLoginForm();
  }
});

// ── Forgot password / reset view ───────────────────────────────────────────
document.getElementById('forgot-link').addEventListener('click', () => {
  document.getElementById('login-view').style.display = 'none';
  document.getElementById('reset-view').style.display = 'block';
});

document.getElementById('reset-back-btn').addEventListener('click', () => {
  document.getElementById('reset-view').style.display  = 'none';
  document.getElementById('login-view').style.display  = 'block';
  document.getElementById('login-message').style.display = 'none';
  const btn = document.getElementById('reset-submit-btn');
  btn.textContent = 'Send reset link';
  btn.onclick     = null;
});

document.getElementById('reset-submit-btn').addEventListener('click', async () => {
  const email = document.getElementById('reset-email').value.trim();
  const msgEl = document.getElementById('login-message');
  if (!email) return;

  const { error } = await client.auth.resetPasswordForEmail(email, {
    redirectTo: 'https://pandemicerratic.com'
  });

  if (error) {
    msgEl.style.color   = '#8b3a3a';
    msgEl.textContent   = error.message || 'Something went wrong. Try again.';
    msgEl.style.display = 'block';
  } else {
    msgEl.style.color   = '#3a6b3a';
    msgEl.textContent   = 'If that email is registered, you\'ll receive a reset link shortly.';
    msgEl.style.display = 'block';
    const btn = document.getElementById('reset-submit-btn');
    btn.textContent = 'Close';
    btn.onclick = () => {
      loginOverlay.classList.remove('visible');
      clearLoginForm();
    };
  }
});

// ── Set password dialog (invite + recovery) ────────────────────────────────
const setPasswordOverlay = document.getElementById('set-password-overlay');

export function showSetPassword(title) {
  document.getElementById('set-password-title').textContent  = title || 'Set your password';
  document.getElementById('new-password').value              = '';
  document.getElementById('confirm-password').value          = '';
  document.getElementById('set-password-error').style.display = 'none';
  document.getElementById('new-password').type               = 'password';
  document.getElementById('confirm-password').type           = 'password';
  document.querySelectorAll('.pw-toggle').forEach(btn => btn.textContent = 'Show');
  setPasswordOverlay.classList.add('visible');
}

export function hideSetPassword() {
  setPasswordOverlay.classList.remove('visible');
}

document.querySelectorAll('.pw-toggle').forEach(btn => {
  btn.addEventListener('click', () => {
    const input    = document.getElementById(btn.dataset.target);
    const isHidden = input.type === 'password';
    input.type     = isHidden ? 'text' : 'password';
    btn.textContent = isHidden ? 'Hide' : 'Show';
  });
});

// Submit is handled in auth.js because it needs to coordinate with
// the USER_UPDATED auth event and the passwordWasSet flag in state.
