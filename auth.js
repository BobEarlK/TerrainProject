import { client } from './supabase-client.js';
import { state } from './state.js';
import { loadMarkers, applyVisibilityFilter } from './cairns.js';
import { showSetPassword, hideSetPassword, clearLoginForm } from './dialogs.js';

const loginOverlay       = document.getElementById('login-overlay');
const setPasswordOverlay = document.getElementById('set-password-overlay');
const addBtn             = document.getElementById('add-btn');
const userStatus         = document.getElementById('user-status');

// ── Update UI for signed-in or signed-out state ────────────────────────────
// Not awaited by callers that only need the sync part (currentUser set, innerHTML rendered).
// The internal DB fetch updates the displayed username once it resolves.
export async function updateUI(user) {
  state.currentUser = user;

  if (user) {
    addBtn.style.display = 'flex';
    userStatus.innerHTML = `
      <span>${state.currentUsername ?? user.email}</span>
      <button id="toggle-others-btn">${state.showOthers ? 'All cairns' : 'My cairns'}</button>
      <button id="signout-btn">Sign out</button>
    `;
    document.getElementById('signout-btn').addEventListener('click', () => {
      client.auth.signOut(); // fire and forget — SIGNED_OUT hangs like updateUser did
      updateUI(null);        // drive UI directly from click, don't wait for the event
      document.querySelectorAll('.cairn').forEach(el => el.remove());
      loadMarkers();
    });
    document.getElementById('toggle-others-btn').addEventListener('click', () => {
      state.showOthers = !state.showOthers;
      document.getElementById('toggle-others-btn').textContent = state.showOthers ? 'All cairns' : 'My cairns';
      applyVisibilityFilter();
    });

    const { data } = await client.from('profiles').select('username').eq('id', user.id).single();
    state.currentUsername = data?.username ?? null;
    const span = userStatus.querySelector('span');
    if (span) span.textContent = state.currentUsername ?? user.email;
  } else {
    state.currentUsername = null;
    addBtn.style.display  = 'none';
    userStatus.innerHTML  = `<button id="signin-btn">Sign in</button>`;
    document.getElementById('signin-btn').addEventListener('click', () => {
      loginOverlay.classList.add('visible');
    });
  }
}

// ── Choose username dialog ─────────────────────────────────────────────────
// Lives here (not dialogs.js) because it calls updateUI and loadMarkers on success.
export function showChooseUsername() {
  document.getElementById('username-input').value               = '';
  document.getElementById('choose-username-error').style.display = 'none';
  document.getElementById('choose-username-overlay').classList.add('visible');
}

document.getElementById('choose-username-submit-btn').addEventListener('click', async () => {
  const username = document.getElementById('username-input').value.trim();
  const errorEl  = document.getElementById('choose-username-error');
  errorEl.style.display = 'none';

  if (!username) {
    errorEl.textContent   = 'Please enter a username.';
    errorEl.style.display = 'block';
    return;
  }
  if (!/^[a-zA-Z0-9_ ]+$/.test(username)) {
    errorEl.textContent   = 'Letters, numbers, spaces, and underscores only.';
    errorEl.style.display = 'block';
    return;
  }

  const { error } = await client.from('profiles').upsert({ id: state.currentUser.id, username });
  if (error) {
    errorEl.textContent   = error.code === '23505' ? 'That username is taken.' : 'Could not save username. Try again.';
    errorEl.style.display = 'block';
    return;
  }

  state.currentUsername = username;
  document.getElementById('choose-username-overlay').classList.remove('visible');
  await updateUI(state.currentUser);
  document.querySelectorAll('.cairn').forEach(el => el.remove());
  loadMarkers();
});

// ── Set password submit ────────────────────────────────────────────────────
// Owned here (not dialogs.js) because it coordinates with state.passwordWasSet
// and the USER_UPDATED auth event below.
document.getElementById('set-password-submit-btn').addEventListener('click', () => {
  const newPw     = document.getElementById('new-password').value;
  const confirmPw = document.getElementById('confirm-password').value;
  const errorEl   = document.getElementById('set-password-error');
  errorEl.style.display = 'none';

  if (newPw.length < 6) {
    errorEl.textContent   = 'Password must be at least 6 characters.';
    errorEl.style.display = 'block';
    return;
  }
  if (newPw !== confirmPw) {
    errorEl.textContent   = 'Passwords do not match.';
    errorEl.style.display = 'block';
    return;
  }

  // updateUser's promise can hang due to Web Locks — don't await it.
  // Set the flag first; USER_UPDATED fires reliably and drives dismissal.
  state.passwordWasSet = true;
  client.auth.updateUser({ password: newPw }).then(({ error }) => {
    if (error) {
      state.passwordWasSet  = false;
      errorEl.textContent   = error.message || 'Could not set password. Try again.';
      errorEl.style.display = 'block';
    }
  });
});

// ── Profile check after sign-in ────────────────────────────────────────────
// Called without await from onAuthStateChange to break out of Supabase's
// internal lock context before making any DB queries.
async function checkProfileAfterSignIn(user) {
  const { data: profile } = await client
    .from('profiles').select('username').eq('id', user.id).single();

  if (!profile?.username) {
    if (state.arrivalType === 'invite') {
      state.arrivalType = null;
      showSetPassword('Welcome — please set your password');
    } else {
      showChooseUsername();
    }
  }
}

// ── Auth state machine ─────────────────────────────────────────────────────
export function initAuth() {
  client.auth.onAuthStateChange(async (event, session) => {
    // INITIAL_SESSION fires alongside SIGNED_IN on authenticated page loads — skip it.
    // For anonymous visitors (null session) it's the only event, so process normally.
    if (event === 'INITIAL_SESSION' && session?.user) return;

    // Password was set — USER_UPDATED fires reliably even when the promise hangs.
    if (event === 'USER_UPDATED' && state.passwordWasSet) {
      hideSetPassword();
      const user = session?.user ?? null;
      // Defer all DB work — querying inside USER_UPDATED blocks while auth finalises session.
      setTimeout(async () => {
        await updateUI(user);
        if (user) {
          const { data } = await client.from('profiles').select('username').eq('id', user.id).single();
          if (!data?.username) {
            showChooseUsername();
          } else {
            document.querySelectorAll('.cairn').forEach(el => el.remove());
            loadMarkers();
          }
        }
      }, 100);
      return;
    }

    if (event === 'PASSWORD_RECOVERY') {
      updateUI(session?.user ?? null); // not awaited — same lock-reentrancy reason
      if (!state.passwordWasSet) showSetPassword('Set your new password');
      return;
    }

    // Close login overlay if open — signInWithPassword promise can hang (Web Locks).
    if (event === 'SIGNED_IN' && loginOverlay.classList.contains('visible')) {
      loginOverlay.classList.remove('visible');
      clearLoginForm();
    }

    const user = session?.user ?? null;
    updateUI(user); // not awaited — currentUser set synchronously as first line
    document.querySelectorAll('.cairn').forEach(el => el.remove());
    loadMarkers();

    // Must run outside the auth lock context — see checkProfileAfterSignIn comment above.
    if (user) checkProfileAfterSignIn(user);
  });
}
