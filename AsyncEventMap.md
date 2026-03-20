# Async Event Map — Terrain / Cairn
*Last updated: 2026-03-19*

> **Purpose:** A living document. Before adding any feature that touches auth, DB queries, or page load order, read this first. Update it when anything changes. Most bugs in this project have been sequencing bugs — this is why.

---

## Mental model: how JS async works here

JavaScript is single-threaded. There is no true concurrency — only interleaving. When you `await` something, you pause that function and let other things run. When you don't `await`, you fire something off and immediately continue. The event loop decides what runs next.

The Supabase client has two layers:
- **Auth layer** — manages session, tokens, fires events. Reads from localStorage. May make a network call to refresh an expired token.
- **DB layer** — executes queries. Queues behind auth if auth isn't settled. Will hang silently if auth is broken.

These two layers are mostly independent, but DB queries wait for auth to reach a valid state before executing.

---

## Page load sequence (always)

| Step | What happens | Sync or Async |
|---|---|---|
| 1 | HTML parsed, DOM available | sync |
| 2 | Supabase client created (`createClient`) | sync |
| 3 | State variables initialized (`currentUser`, `showOthers`, etc.) | sync |
| 4 | DOM refs captured (`terrain`, `popup`, `userStatus`, etc.) | sync |
| 5 | All event listeners attached (buttons, dialogs, enter-key support) | sync |
| 6 | `onAuthStateChange` handler registered | sync |
| 7 | `loadMarkers()` called immediately | async — fires, does not block |
| 8 | Supabase reads stored session from localStorage | async, internal |
| 9 | If token is expired: Supabase makes network call to refresh it | async, internal |
| 10 | Auth event fires (see scenarios below) | async |
| 11 | Auth handler runs → `updateUI()` → DB query → marker reload | async chain |

**Key point:** Steps 7 and 8–11 race. Step 7 (`loadMarkers`) may queue behind step 9 (token refresh) if the Supabase client isn't ready. This is fine as long as auth settles correctly.

---

## Auth event scenarios

### Anonymous visitor (no stored session)
```
INITIAL_SESSION fires (session = null)
  → updateUI(null)          — no DB call; just sets Sign In button
  → loadMarkers()           — anonymous read; no auth needed; RLS allows it
```
No await dependencies on auth. `loadMarkers()` from step 7 and this one may both run — harmless duplicate.

---

### Returning logged-in user (valid stored session)
```
INITIAL_SESSION fires (session = user)
  → await updateUI(user)
      → await profiles query    — needs valid auth token
      → sets username + buttons
  → await profiles query (second check — username exists?)
  → loadMarkers()               — re-runs with ownership tinting
```
Both profiles queries need a valid auth token. If the token is expired and refresh fails, both hang silently.

---

### Returning logged-in user (expired stored session) ← CURRENT BUG
```
Supabase attempts token refresh  — requires internal lock
  → lock bypass (our workaround) breaks the refresh
  → auth state never settles
  → all DB queries queue behind auth and hang forever
SIGNED_IN fires (from stored data, doesn't need network)
  → updateUI(user) called
      → profiles query queued → hangs
  → innerHTML never set; cairns never load
```
**Root cause:** The `lock: async (name, acquireTimeout, fn) => fn()` bypass was added to fix `updateUser` hanging. It also breaks token refresh. See "Await decisions" below.

---

### Invite arrival
```
INITIAL_SESSION fires → skipped (arrivalType === 'invite')
SIGNED_IN fires
  → await updateUI(user)
  → profile check: no username
  → showSetPassword()           — no DB call; just shows dialog
  → user submits password
      → updateUser fired WITHOUT await   ← intentional; promise may hang
      → passwordWasSet = true
  → USER_UPDATED fires
      → setTimeout 100ms        ← breaks out of auth callback before touching DB
      → await updateUI(user)
      → profiles query          ← deferred; auth has settled by now
      → showChooseUsername() if no username
  → user submits username
      → upsert to profiles      ← needs valid auth
      → loadMarkers()
```

---

### Password reset
```
PASSWORD_RECOVERY fires
  → await updateUI(user)
  → showSetPassword()
  → (same as invite flow from here)
```

---

## Await decisions

| Operation | Awaited? | Reason |
|---|---|---|
| `updateUser` (password set) | **NO** | Promise hangs due to Web Locks contention; USER_UPDATED event drives dismissal instead |
| `updateUI(user)` | **YES** | Must complete before profile check and marker reload |
| profiles query inside `updateUI` | **YES** | Need username to populate UI |
| profiles query in auth handler | **YES** | Need result to decide: show choose-username, or load markers |
| Initial cairn load (raw fetch) | **NO** | Bypasses auth lock; no ownership needed; fires and forgets |
| `loadMarkers()` in auth handler | **NO** | Fires and forgets after auth has settled; reloads with ownership |
| DB queries inside `loadMarkers` | **YES** (internal) | Need data before we can render markers |
| `client.auth.signOut()` | **NO** | Event-driven; SIGNED_OUT fires and drives cleanup |

---

## Known hazards

**Don't query the DB inside a USER_UPDATED handler directly.**
The Supabase client blocks DB queries while finalising the session after a password update. Always `setTimeout(..., 100)` first. Confirmed broken; confirmed fix works. Do not retry the direct approach.

**Don't await `updateUser`.**
The promise may never resolve due to Web Locks contention between concurrent auth operations. USER_UPDATED fires reliably regardless.

**Don't use the lock bypass.**
`lock: async (name, acquireTimeout, fn) => fn()` was added to fix the `updateUser` AbortError. It also breaks token refresh, causing all DB queries to hang on returning visits with expired tokens. The `updateUser` fix (don't await it) makes the lock bypass redundant. Removed as of 2026-03-19.

**The immediate cairn load must use raw fetch, not the Supabase client.**
The client queues all DB queries behind the auth lock during token refresh. A raw `fetch()` to the Supabase REST API bypasses this entirely. The initial load is anonymous (no ownership tinting needed), so auth is not required. After auth settles, the auth handler's `loadMarkers()` re-runs via the client to apply ownership tinting. If auth is broken or slow, cairns still appear immediately.

---

## What each new feature should ask

Before adding anything that touches the DB or auth:
1. Does this need a valid auth session? (If yes: make sure auth has settled first)
2. Am I calling a DB query inside an auth event handler? (If yes: use `setTimeout`)
3. Am I awaiting something whose promise might not resolve? (Don't — use events instead)
4. Am I adding to the page-load sequence? (If yes: update this document)
