import { state } from './state.js';
import { loadMarkers, addCairnToTerrain, closePopup } from './cairns.js';
import { updateUI, initAuth, showChooseUsername } from './auth.js';
import { showSetPassword } from './dialogs.js';

// ── Bootstrap ──────────────────────────────────────────────────────────────
// Render the sign-in button immediately — auth event may be delayed by token
// refresh. updateUI() replaces this with the correct state once auth settles.
const loginOverlay = document.getElementById('login-overlay');
const userStatus   = document.getElementById('user-status');
userStatus.innerHTML = `<button id="signin-btn">Sign in</button>`;
document.getElementById('signin-btn').addEventListener('click', () => {
  loginOverlay.classList.add('visible');
});

initAuth();

// ── Cairn placement dialog ─────────────────────────────────────────────────
const dialogOverlay = document.getElementById('dialog-overlay');

document.getElementById('add-btn').addEventListener('click', () => {
  dialogOverlay.classList.add('visible');
});

document.getElementById('cancel-btn').addEventListener('click', () => {
  dialogOverlay.classList.remove('visible');
  clearCairnDialog();
});

document.getElementById('place-btn').addEventListener('click', () => {
  const title   = document.getElementById('input-title').value.trim();
  const content = document.getElementById('input-content').value.trim();
  if (!title || !content) return;
  dialogOverlay.classList.remove('visible');
  clearCairnDialog();
  addCairnToTerrain(0.5, 0.5, title, content, true, true);
});

function clearCairnDialog() {
  document.getElementById('input-title').value   = '';
  document.getElementById('input-content').value = '';
}

// ── Popup close on background click ───────────────────────────────────────
document.addEventListener('click', closePopup);

// ── Enter key support ──────────────────────────────────────────────────────
function onEnter(inputId, btnId) {
  document.getElementById(inputId).addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById(btnId).click();
  });
}

onEnter('login-email',    'login-submit-btn');
onEnter('login-password', 'login-submit-btn');
onEnter('reset-email',    'reset-submit-btn');
onEnter('new-password',   'set-password-submit-btn');
onEnter('confirm-password', 'set-password-submit-btn');
onEnter('username-input', 'choose-username-submit-btn');
onEnter('input-title',    'place-btn');

// ── Playwright test hooks ──────────────────────────────────────────────────
window.showSetPassword  = showSetPassword;
window.showChooseUsername = showChooseUsername;
Object.defineProperty(window, 'currentUser', { get: () => state.currentUser });
