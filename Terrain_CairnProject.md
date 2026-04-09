# Terrain / Cairn Project
*Last updated: 2026-03-25*

> **Claude:** Read sections 1–7 each session. Section 8 (Archive) only if debugging a recurrence of a previously solved problem.

---

## 1. What It Is

A shared creative web space at **pandemicErratic.com** where visitors explore an abstract topographic terrain and leave markers ("cairns") at locations that feel meaningful. Each cairn holds a title and a short text (poem, memory, thought). Other visitors can explore and discover what's been left behind — a collective, living landscape.

**Ultimate purpose:** A mechanism for students (initially medical students) to share meaningful experiences and thoughts asynchronously with peers, in a way that is archivable and visually expressive. The cairn metaphor is intentional — something left behind, marking a moment, discovered by those who pass through later.

The project began as a small personal creative tool and is evolving toward a structured educational platform. Bob is the developer; Andrea (wife) is the first beta tester and early design collaborator. The intended user base is medical students organized into colleges and mentor groups.

Web project only (not iOS). The terrain is invented and artistic, not a real map.

---

## 2. Current State *(as of 2026-03-25)*

**Live at:** pandemicErratic.com — modular: `index.html` (HTML only) + `styles.css` + `main.js` + `auth.js` + `cairns.js` + `dialogs.js` + `state.js` + `supabase-client.js`.

**What works:**
- Topographic background (Topographapp.jpg — Topograph license now purchased; Andrea will regenerate background without watermark using the app)
- Cairn markers load from Supabase; click to see title + content popup
- Drag-to-place: fill in title/content → cairn follows mouse until dropped → saves to DB
- Full auth flow: invite email → set password → choose username → signed in
- Password reset: forgot password → email → reset link → set new password → lands in app
- Sign out: returns to anonymous view; all cairns remain visible
- Your cairns visually distinct (amber tint); toggle ("All cairns" / "My cairns") to show/hide others' cairns
- RLS: read = anyone; write = owner only

**Beta status (2026-03-25):**
- Andrea (wife) has been invited and is actively using the app
- Andrea is gathering feedback from colleagues
- May expand to invite colleagues as a second wave of beta testers
- Pending feedback: style changes are coming — colors for menus, buttons, and dialog boxes; cairn sizing (currently too uniform and likely wrong scale)
- Andrea will replace the background image herself using Topograph once she has access

**Testing status:**
- Playwright end-to-end test suite set up (TypeScript, 3 browsers)
- `anonymous.spec.ts` — **passing** ✓
- `authenticated.spec.ts` — **passing** ✓
- `dialogs.spec.ts` — **passing** ✓
- `cairns.spec.ts` — **passing** ✓ (after Web Locks deadlock fix + testUser1 cairn inserted in Supabase)
- All tests passing on chromium — full 3-browser run not yet confirmed
- `BEHAVIORS.md` — 55 numbered behaviors organized by auth state (in `tests/`)
- `MANUAL_TEST_CHECKLIST.md` — step-by-step scripts for email-dependent flows
- Tagged `tests-green-pre-refactor` in git (pre-session baseline)

**Known issues / deferred:**
- **[DEFERRED]** Apple Passwords silent failure on set-password dialog — Andrea testing may surface this
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
- [x] **M6a** — Topograph license purchased; Andrea invited as beta tester ✓ 2026-03-25
- [ ] **M6b** — Beta polish: implement style/color/sizing changes from Andrea's feedback; Andrea regenerates background without watermark
- [ ] **M7** — CairnBuilder: per-user unique cairn shapes (see §5)
- [ ] **M8** — Group/college filtering: mentor group → college → year → all (see §5)
- [ ] **M9** — Map zoom/sectors: coordinate space supports zoom; default view is one sector (see §5)

---

## 4. Next Up

**Waiting on (no code needed yet):**
- Andrea's feedback on colors, button/dialog styling, and cairn sizing
- Andrea's background regeneration via Topograph (she handles this herself)
- Andrea's colleague input — may result in a second wave of invites

**When feedback arrives — implement in this order:**
1. Style pass: update CSS for menu/button/dialog colors per Andrea's notes
2. Cairn sizing: adjust SVG scale so cairns feel right at typical screen sizes
3. Any other UX notes from Andrea or colleagues

**Pre-invite cleanup (do before any new wave of users):**
- Strip console.logs from production code
- Fix `#forgot-link` CSS overlap bug (Chromium hit-testing workaround exists in tests — fix the actual CSS)
- Add `TOKEN_REFRESHED` guard (prevent duplicate handler firing on token refresh)
- Confirm full 3-browser Playwright run is green after any CSS changes

---

## 5. Future Ideas

*Roughly ordered from simpler to more complex. Nothing here is committed.*

**Near-term / low effort:**
- Change username — add a settings link that reopens the choose-username dialog
- Edit / delete your own cairns

**Near-term / moderate effort:**
- Email notifications when a new cairn is placed near yours
- Media attachments — images and audio attached to a cairn, not just text (storage and UI implications; needs design thought)

**CairnBuilder (moderate–hard):**
- A web-based tool where each user designs their personal cairn: pick from ~5 rock shapes, adjust colors/sizes/shading, stack them
- Goal: each user's cairn is visually unique and personally meaningful — not a uniform marker
- SVG is the right format: small, scalable, storable as a string in the DB per user
- Lives on the same site as a web tool — not a separate iOS app
- Could be integrated into the initial profile/setup flow, or accessible later via a profile settings link

**Cairn aging (hard — but high value for the mission):**
- Cairns visually show their age: a recent cairn looks fresh; an older one looks weathered
- Eventually: cairns begin to tilt, then crumble into rubble over a long timescale
- This reinforces the archival nature of the project — the landscape has memory and history built into it
- Requires: timestamp already in DB (`created_at`); aging logic computes visual state client-side
- The rubble/topple end-state is complex animation — defer until simpler aging works

**Group management UI (moderate — prerequisite to group filtering):**
- At scale, Bob needs a way to manage group membership without touching Supabase directly
- A simple admin page (gated behind an admin flag on profiles) to invite users, assign college/year/mentor_group, and revoke access
- This is a prerequisite to rolling out to 200 students

**Group/college filtering (hard — data model change needed):**
- Intended user base: medical students in 5 colleges with ~4 years each; up to ~200 users at a time
- **Key data model insight:** year and college are orthogonal — a college contains students from all years; a year contains students from all colleges. A student has both a `college` and a `year`, independently. Mentor groups are nested within colleges.
- **Filter model:** Amazon-style faceted filtering — college and year are independent filter axes, not a nested drill-down. A user can filter by college AND year simultaneously as separate controls.
- **Role-gated access to filters:** The filter controls are not uniformly visible — each role sees the filters appropriate to their scope. A student might only see "My group"; a mentor sees group + college; a college head sees college + year; Bob (admin) sees everything. This implies a `role` field on `profiles` (student / mentor / college_head / admin).
- Data model: `profiles` needs `college`, `year`, `mentor_group`, and `role`
- RLS implications: group-level visibility rules become more complex; role-gated filter logic likely computed in JS client-side rather than expressed entirely in RLS

**Terrain zoom / sectors (hard — research needed):**
- At ~15 cairns, a single map view gets crowded; at 200 users it becomes unreadable
- Default view: a sector of the full coordinate space; zoom out to see more
- Option A: pre-render multiple zoom levels as static images, implement simple tile switching — moderate, still static
- Option B: investigate whether topograph.app exposes embed or API — worth raising with the developer now that a license is purchased
- Option C: full tile map system (like OpenStreetMap) — significant engineering, probably out of scope for this project's spirit
- **Verdict:** Don't build until we know what topograph.app supports. Raise with developer.

**Multiple backgrounds / maps:**
- Different terrain images, potentially selectable per group or per user
- Lowest-effort version: pre-exported images with a switcher; no dynamic tile system

**Archivability (open question — no implementation yet):**
- A snapshot/export of the terrain at a point in time is a goal (e.g., a graduating class's cairns preserved)
- What "persists" long-term is unsettled: do cairns stay forever? decay into rubble (see aging above)? get archived to a read-only view?
- This intersects with cairn aging — the visual language of aging could be the archival mechanism itself
- Don't design this until the aging feature has a clearer direction

**Visual atmosphere (deferred):**
- More depth and texture in the terrain
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
