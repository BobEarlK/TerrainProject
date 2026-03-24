# Terrain / Cairn Project
*Last updated: 2026-03-23*

> **Claude:** Read sections 1–7 each session. Section 8 (Archive) only if debugging a recurrence of a previously solved problem.

---

## 1. What It Is

A shared creative web space at **pandemicErratic.com** where visitors explore an abstract topographic terrain and leave markers ("cairns") at locations that feel meaningful. Each cairn holds a title and a short text (poem, memory, thought). Other visitors can explore and discover what's been left behind — a collective, living landscape.

Web project only (not iOS). The terrain is invented and artistic, not a real map.

---

## 2. Current State *(as of 2026-03-24)*

**Live at:** pandemicErratic.com — modular: `index.html` (HTML only) + `styles.css` + `main.js` + `auth.js` + `cairns.js` + `dialogs.js` + `state.js` + `supabase-client.js`.

**What works:**
- Topographic background (Topographapp.jpg screenshot, watermark present — license being purchased)
- Cairn markers load from Supabase; click to see title + content popup
- Drag-to-place: fill in title/content → cairn follows mouse until dropped → saves to DB
- Full auth flow: invite email → set password → choose username → signed in
- Password reset: forgot password → email → reset link → set new password → lands in app
- Sign out: returns to anonymous view; all cairns remain visible
- Your cairns visually distinct (amber tint); toggle ("All cairns" / "My cairns") to show/hide others' cairns
- RLS: read = anyone; write = owner only

**Testing status:**
- Playwright end-to-end test suite set up (TypeScript, 3 browsers)
- `anonymous.spec.ts` — **passing** ✓
- `authenticated.spec.ts` — **passing** ✓
- `dialogs.spec.ts` — **passing** ✓
- `cairns.spec.ts` — **passing** ✓ (after Web Locks deadlock fix + testUser1 cairn inserted in Supabase)
- All tests passing on chromium — full 3-browser run is the next step
- `BEHAVIORS.md` — 55 numbered behaviors organized by auth state (in `tests/`)
- `MANUAL_TEST_CHECKLIST.md` — step-by-step scripts for email-dependent flows
- Tagged `tests-green-pre-refactor` in git (pre-session baseline)

**Known issues / deferred:**
- **[DEFERRED]** Apple Passwords silent failure on set-password dialog — revisit when wife is available to test
- No way to change username after initial setup

**DB tables:** `markers` (id, x, y, title, content, user_id), `profiles` (id, username)
**Auth:** Supabase email+password; public signups disabled; Bob invites users manually
**Test users:** Two dedicated Playwright test accounts exist in Supabase (testUser1@mock.com / testUser1, testUser2@mock.com / testUser2). Both have profile rows with usernames. testUser1 has a cairn at x:-1, y:-1 (off-screen, inserted directly via Supabase dashboard). Credentials stored in local `.env` file (gitignored) — see `.env.example` for structure.

---

## 3. Milestones

- [x] **M1** — Live page at pandemicErratic.com ✓ 2026-03-13
- [x] **M2** — Three hardcoded clickable markers ✓ 2026-03-13
- [x] **M3** — Markers loaded from Supabase ✓ 2026-03-13
- [x] **M4** — Drag-to-place new marker, saves to DB ✓ 2026-03-13
- [x] **M5** — User auth; markers owned by user; two users see each other's cairns ✓ 2026-03-18
- [ ] **M6** — Beta polish: UI improvements from wife's feedback + topograph watermark removed
- [ ] **M7** — Change username; groups + group filtering

---

## 4. Next Up

**Immediate — next session start:**
1. Purchase Topograph license → regenerate background without watermark
2. Invite wife (beta tester)
3. Act on wife's UI/UX feedback

**After beta feedback:**
- [ ] Act on UI/UX notes from wife

**After beta feedback:**
- [ ] Act on UI/UX notes from wife

---

## 5. Future Ideas

*Roughly ordered from simpler to more complex. Nothing here is committed.*

**Near-term / moderate effort:**
- Change username — simple: add a settings link that reopens the choose-username dialog
- Email notifications when a new cairn is placed near yours
- Edit / delete your own cairns
- Image or video attached to a cairn

**Groups:**
- Users can join or create named groups
- Cairns tagged with a group; filter display by group
- Requires: `groups` table, `user_groups` join table, filter UI

**Cairn customization:**
- Simple cairn builder: pick from ~5 rock shapes, adjust sizes, stack several, save composite as SVG
- SVG is small (line drawing = a few KB), storable as a string in the DB per user
- Each user's cairn becomes visually personal and distinctive
- Scope: moderate UI work; storage cost is minimal if SVG strings

**Terrain zoom / pan (research needed):**
- Current approach: static screenshot of topograph.app — no zoom or pan
- Option A: pre-render multiple zoom levels as static images, implement simple tile switching — moderate work, still static
- Option B: investigate whether topograph.app exposes any embed or API — likely not, but worth checking after license purchase
- Option C: a full tile map system (like OpenStreetMap) would be significant engineering — probably out of scope for this project's spirit
- **Verdict:** Raise with topograph developer when purchasing license. Don't build until we know what's possible.

**Visual atmosphere (deferred):**
- More depth and texture in the terrain
- Cairns crumble or fade with age
- Seasonal or time-of-day visual changes

---

## 6. Key Decisions

| Decision | Choice | Reason |
|---|---|---|
| Auth method | Email + password via Supabase | Simple, no OAuth dependency |
| Registration | Invite-only (Bob invites manually) | Small trusted community |
| RLS | Read = anyone; write = owner only | Anonymous browsing allowed |
| Anonymous visitors | Can browse, cannot place cairns | Lowers barrier to explore |
| Visual distinction | Your cairns amber-tinted (.cairn-mine) | Clear ownership at a glance |
| SMTP | Resend via custom SMTP in Supabase | Free tier rate limit too low |

---

## 7. Infrastructure

**Stack:** Pure HTML/CSS/JS frontend. No backend framework (Flask removed — not needed). Supabase for DB + auth. Render for hosting. GitHub for source control + deploy trigger.

**Deploy:** Edit `index.html` → commit in GitHub Desktop → push → live in ~1 min.
**Source control:** Bob commits and pushes via GitHub Desktop. Claude makes file edits only — does not commit or push.
**Repo:** https://github.com/BobEarlK/TerrainProject.git
**Files:** `/Users/bobearl/Developer/TerrainProject/` — mount this in Cowork each session.

**SMTP (Resend):** Configured in Supabase → Authentication → SMTP. Host: smtp.resend.com, port 465, user: resend, sender: noreply@pandemicerratic.com. DNS on Cloudflare. Working ✓

**Claude's session start checklist:**
1. Mount `~/Claude Cowork Folder` (to update these files)
2. Mount `/Users/bobearl/Developer/TerrainProject` (to edit code)
3. Read sections 1–4 of this file, then tell Bob current state and ask what to tackle

---

## 8. Archive *(Claude: skip unless debugging a recurrence — open the relevant section)*

---

<details>
<summary><strong>Phase 6 — Playwright test suite setup</strong> (2026-03-20 to 2026-03-22 · Moderate effort · Anonymous passing; authenticated blocked on deploy)</summary>

**Goal:** Write a behavior-driven test suite before refactoring the codebase, to serve as a safety net.

**Infrastructure set up:**
- Playwright installed with TypeScript; `playwright.config.ts` configured: `fullyParallel: false` (real DB), `baseURL: https://www.pandemicerratic.com` (www required — redirect origin matching for storageState), `trace: retain-on-failure`
- Auth state machine documented in `AsyncEventMap.md`: 4 states (ANONYMOUS, SETTING_PASSWORD, CHOOSING_USERNAME, AUTHENTICATED), transition table
- `BEHAVIORS.md` — 55 numbered behaviors organized by state; spec files reference behavior numbers
- `MANUAL_TEST_CHECKLIST.md` — step-by-step manual test scripts for email-dependent flows
- `.env` / `.env.example` — test credentials (gitignored)
- Two Supabase test users created: testUser1@mock.com, testUser2@mock.com
- `global-setup.ts` — signs in as testUser1 once before each test run; saves storageState to `playwright/.auth/user1.json`

**anonymous.spec.ts — 33/33 passing ✓**
- 11 tests × 3 browsers
- Key fix: Chromium's strict hit-testing routes clicks to the password input when `#forgot-link` has `margin-top: -10px` overlapping it. `force: true` doesn't help (still coordinate-based). Fix: `page.evaluate(() => document.getElementById('forgot-link')?.click())` — dispatches click in JS context, bypasses hit-testing entirely.
- Helper `openLoginDialog(page)` waits for overlay to be visible before interacting.

**authenticated.spec.ts — all failing (unresolved going into next session)**
- storageState injection confirmed working (SIGNED_IN event fires)
- Root cause: `updateUI(user)` awaited a DB query *before* setting `userStatus.innerHTML`. The DB query can hang due to Web Locks issue on returning visits. Span never rendered → `#user-status span` selector times out.
- Fix written: moved `userStatus.innerHTML` to render *before* the `await` in `updateUI`. Span appears instantly with email, then updates to username when query resolves. **Not yet deployed.**

**Things confirmed NOT to work — do not retry:**
- Increasing `beforeEach` timeout (10s → 30s) — span still never appears; timing is not the issue
- `force: true` on Playwright clicks for elements with overlapping siblings — still coordinate-based; use `page.evaluate` instead
</details>

---

<details>
<summary><strong>Phase 1 — MVP: live page to drag-and-drop cairns</strong> (2026-03-13 · Minor effort · All resolved)</summary>

Built the entire core product in a single session. Steps in order:

- Deployed a blank HTML page to pandemicErratic.com via Render watching a GitHub repo — proved the full pipeline worked before writing any real code
- Added a topographic background image and placed cairn SVG markers at hardcoded positions; clicking a cairn showed a popup with title + content
- Wired Supabase: created a `markers` table, replaced hardcoded markers with a live DB read
- Added a form dialog to create new cairns; implemented drag-to-place mechanic (cairn follows mouse from center of screen until dropped, then saves x/y/title/content to DB)

No significant bugs. Straightforward incremental build.
</details>

---

<details>
<summary><strong>Phase 2 — Version control and deploy pipeline</strong> (2026-03-15 · Minor effort · All resolved)</summary>

- Connected the TerrainProject folder to GitHub via GitHub Desktop; created BobEarlK/TerrainProject repo
- Added `.gitignore` (note: `.DS_Store` may still need `git rm --cached .DS_Store` if it reappears)
- Wired Render to watch the GitHub repo — auto-deploys on push, live in ~1 min
- Workflow from this point: edit `index.html` → commit in GitHub Desktop → push → done
</details>

---

<details>
<summary><strong>Phase 3 — Multi-user auth and cairn ownership</strong> (2026-03-15 to 2026-03-16 · Moderate effort · All resolved)</summary>

Implemented full Supabase auth in a single session:

- Disabled public signups in Supabase dashboard — invite-only
- Added `user_id` column to `markers` table; added RLS (read = anyone, write = owner only)
- Added login/logout UI: liquid glass capsule top-right, sign-in dialog, sign-out button
- Gated "place cairn" behind auth check; stamped `user_id` on new marker inserts
- Your cairns visually distinct via amber tint (`.cairn-mine` CSS class)
- Added `profiles` table for usernames; choose-username dialog for new users
- Added legend toggle: show/hide other users' cairns; your cairns always visible
- Added forgot-password flow; set-password overlay for invite arrivals and recovery
- Added show/hide toggle on password fields; Enter-key support on all dialog inputs

**First invite-flow bug (2026-03-16, minor):** Supabase fired `INITIAL_SESSION` on invite arrival instead of `SIGNED_IN`, so set-password dialog never showed. Fix: read `type=invite` from URL hash before Supabase clears it (stored in `arrivalType`); use that as an additional trigger.
</details>

---

<details>
<summary><strong>Phase 4 — Custom SMTP via Resend</strong> (2026-03-16 to 2026-03-17 · Minor effort · All resolved)</summary>

Supabase free tier rate-limits auth emails to ~3/hour — hit this immediately during invite testing.

- Created Resend account; verified `pandemicerratic.com` domain
- DNS originally at Namecheap, which blocked Resend's MX bounce record while Email Forwarding was active — moved DNS to Cloudflare to resolve
- Added DKIM, SPF, DMARC records; added MX bounce record in Cloudflare
- Wired Resend into Supabase: Authentication → SMTP → host smtp.resend.com, port 465, user `resend`, sender `noreply@pandemicerratic.com`
- One SMTP 535 error: wrong sender email (personal address instead of domain address) — fixed

Invite emails now deliver reliably with no rate limit concern.
</details>

---

<details>
<summary><strong>Phase 5 — Invite flow and password-set bugs</strong> (2026-03-17 to 2026-03-18 · Hard · All resolved)</summary>

This phase took three sessions and most of the debugging effort. Documented in detail because the failure modes are non-obvious and could recur.

**Bug 1 — INITIAL_SESSION + SIGNED_IN race (2026-03-17, medium)**
Invite arrivals fire both events almost simultaneously. Both async handlers ran concurrently, both saw `arrivalType === 'invite'`, causing set-password and choose-username dialogs to open on top of each other.
Fix: skip `INITIAL_SESSION` entirely when `arrivalType === 'invite'`; let `SIGNED_IN` own the invite path alone.

**Bug 2 — `updateUser` promise hangs forever (2026-03-17, hard)**
`client.auth.updateUser()` triggers `USER_UPDATED` server-side (password IS set), but the JS promise never resolves due to Web Locks contention between concurrent Supabase internal operations. The dialog dismiss was in the submit handler's success branch — unreachable.
Fix: don't await `updateUser`. Fire it without awaiting. Drive dialog dismissal from `USER_UPDATED` auth event instead, which fires reliably. Partial workaround also in place: Web Locks bypass in Supabase client config — `lock: async (name, acquireTimeout, fn) => fn()`.

**Bug 3 — `passwordWasSet` flag set too late (2026-03-17, minor)**
Flag was set after `await updateUser`. Auth events fire synchronously inside the call — before the await returns — so the flag was always false when checked.
Fix: set `passwordWasSet = true` before calling `updateUser`. Reset to false only in the `.then()` error branch.

**Bug 4 — DB queries inside USER_UPDATED handler hang (2026-03-18, hard)**
After fixing the dialog dismiss, the follow-up DB work (profile query, choose-username) never ran. The Supabase client blocks all DB queries made directly inside the `USER_UPDATED` event handler while it finalises the session state — the queries simply never resolve. No error thrown; execution just stops silently.
Fix: defer all DB work via `setTimeout(..., 100)` — breaks out of the auth event callback entirely before touching the DB.

**Things confirmed NOT to work — do not retry these approaches:**
- Awaiting `updateUser` and driving dialog dismissal from the submit handler's `.then()` — hangs
- Setting `passwordWasSet = true` after any `await` in the submit handler — events fire before the flag is set
- Calling `client.from(...)` directly inside a USER_UPDATED handler — blocks silently; always use setTimeout
- Patching the same approach repeatedly without console.log evidence — burns tokens and sessions
</details>
