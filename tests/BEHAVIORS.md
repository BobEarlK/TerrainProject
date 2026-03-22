# Behavior Spec — Terrain / Cairn
*Last updated: 2026-03-20*

> **How to use this file:**
> Each numbered behavior maps directly to a test by the same name in the corresponding spec file.
> If a behavior changes intentionally, update the description here AND the test name together.
> If a test fails and the behavior is still correct, fix the code.
> If a test fails and the behavior has changed by design, update both this file and the test.
>
> Behaviors marked `[MANUAL]` cannot be automated by Playwright — see MANUAL_TEST_CHECKLIST.md.

---

## ANONYMOUS state
*The app on first visit, or after sign-out. No session exists.*
*Spec file: `anonymous.spec.js`*

1. Sign In button is visible in the status capsule
2. Add button is hidden
3. Cairns are visible on the terrain
4. No username is shown in the status capsule
5. Clicking Sign In opens the login dialog
6. Login dialog Cancel button closes the dialog without signing in
7. Clicking "Forgot password?" switches the login dialog to the reset view
8. Reset view Back button returns to the sign-in view
9. Reset view: submitting an empty email does nothing
10. Reset view: submitting a valid email shows a success message and changes the button to "Close"
11. Reset view: clicking Close after sending a reset link closes the login dialog

---

## SETTING_PASSWORD state
*User has a session (invite or recovery link) but has not yet set a password.*
*Spec file: `dialogs.spec.js`*
*Note: reaching this state in automated tests requires a Supabase magic link — see MANUAL_TEST_CHECKLIST.md for end-to-end flows. Dialog behavior tests below can be reached by calling showSetPassword() directly in test setup.*

12. Set-password dialog is visible
13. Add button is hidden
14. No cancel button — user must set a password to proceed
15. Submitting with a password shorter than 6 characters shows an error
16. Submitting with mismatched passwords shows an error
17. Show/hide toggle on the password field changes input type and button text
18. Show/hide toggle on the confirm field changes input type and button text
19. Submitting a valid matching password dismisses the dialog

---

## CHOOSING_USERNAME state
*User has a session and a valid password, but no profile row yet.*
*Spec file: `dialogs.spec.js`*

20. Choose-username dialog is visible
21. Add button is hidden
22. No cancel button — user must choose a username to proceed
23. Submitting an empty username shows an error
24. Submitting a username with invalid characters (punctuation, symbols) shows an error — spaces are allowed
25. Submitting a valid username saves it and transitions to AUTHENTICATED

---

## AUTHENTICATED state
*User has a session and a username. Normal operating state.*
*Spec file: `authenticated.spec.js`*

26. Username is visible in the status capsule
27. Sign Out button is visible in the status capsule
28. Toggle button is visible in the status capsule
29. Add button is visible
30. Toggle button reads "Showing cairns" when other cairns are visible
31. Toggle button reads "Hiding cairns" when other cairns are hidden
32. Clicking the toggle hides other users' cairns (not the current user's)
33. Clicking the toggle again shows other users' cairns
34. Clicking Sign Out returns the app to ANONYMOUS state
35. Sign Out removes the username from the status capsule
36. Sign Out hides the Add button
37. Clicking Add opens the cairn placement dialog
38. Cairn dialog Cancel button closes the dialog
39. Placing a cairn with empty title or content does nothing
40. Placing a cairn with valid title and content starts drag mode
41. Releasing a cairn drops it at that position and saves to DB
42. Clicking an existing cairn shows a popup with its title and content
43. Clicking elsewhere on the terrain closes the popup

---

## Cross-state behaviors
*Spec file: `cairns.spec.js`*

44. Cairns are visible to both anonymous and authenticated users
45. Authenticated user's own cairns have amber tinting; others' cairns do not
46. Hiding others' cairns does not hide the current user's cairns

---

## Password autofill compatibility
*Spec file: `dialogs.spec.js`*

54. Submitting the set-password form with mismatched passwords (as autofill might produce) shows a clear error message
55. Apple Passwords / browser autofill can successfully set a password without manual confirm-field entry

> **Note on behavior 55:** Currently broken — Apple Passwords fills both fields correctly, so the issue is likely Supabase rejecting the generated password format (special characters, entropy requirements, etc.). Check Supabase Auth → Password settings. Should display a clear error explaining the rejection rather than failing silently. Reported by beta tester. Do not mark passing until verified with a real Apple-generated password in Safari.

---

## Enter-key support
*Spec file: `dialogs.spec.js`*

47. Enter key in the email field submits the login form
48. Enter key in the password field submits the login form
49. Enter key in the reset email field submits the reset form
50. Enter key in the new-password field submits the set-password form
51. Enter key in the confirm-password field submits the set-password form
52. Enter key in the username field submits the choose-username form
53. Enter key in the cairn title field submits the cairn form
