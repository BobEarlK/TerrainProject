# Manual Test Checklist — Terrain / Cairn
*Last updated: 2026-03-20*

> Run this checklist before any public release or when the invite/recovery flow changes.
> These flows depend on real email delivery and cannot be automated by Playwright.
> All other behaviors are covered in `tests/BEHAVIORS.md` and the Playwright spec files.

---

## Invite flow

**Setup:** Bob invites a test email address from the Supabase dashboard (Authentication → Users → Invite).

1. Open the invite email
2. Click the invite link
3. **Expected:** Set-password dialog appears with title "Welcome — please set your password"
4. Enter two mismatched passwords and submit
5. **Expected:** Error message: "Passwords do not match"
6. Enter a password shorter than 6 characters and submit
7. **Expected:** Error message: "Password must be at least 6 characters"
8. Enter a valid matching password and submit
9. **Expected:** Set-password dialog dismisses; choose-username dialog appears
10. Submit an empty username
11. **Expected:** Error message: "Please enter a username"
12. Submit a username with invalid characters (e.g. "hello world")
13. **Expected:** Error message: "Letters, numbers, and underscores only"
14. Submit a valid username
15. **Expected:** Choose-username dialog dismisses; app is in AUTHENTICATED state; username visible in capsule; cairns load with ownership tinting

---

## Password reset flow

**Setup:** User is on the site and not signed in.

1. Click Sign In
2. Click "Forgot password?"
3. Enter the test account email and click "Send reset link"
4. **Expected:** Success message appears; button changes to "Close"
5. Open the reset email
6. Click the reset link
7. **Expected:** App loads; set-password dialog appears with title "Set your new password"
8. Enter a valid new password and submit
9. **Expected:** Set-password dialog dismisses; app is in AUTHENTICATED state; username visible in capsule

---

## Sign-out and sign-back-in

1. From AUTHENTICATED state, click Sign Out
2. **Expected:** App returns to ANONYMOUS state; Sign In button visible; Add button hidden
3. Click Sign In
4. Enter test credentials and submit
5. **Expected:** App returns to AUTHENTICATED state; username visible; cairns reload with ownership tinting
