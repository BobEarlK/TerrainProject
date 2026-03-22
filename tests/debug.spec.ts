import { test } from '@playwright/test';

// Throwaway diagnostic — delete this file once the storageState issue is resolved.
// Run with: npx playwright test debug.spec.ts --project=chromium --headed

test.use({ storageState: 'playwright/.auth/user1.json' });

test('storageState diagnostic', async ({ page }) => {
  await page.goto('/');

  // Give Supabase up to 15 seconds to fire INITIAL_SESSION and update the DOM
  await page.waitForTimeout(15000);

  const state = await page.evaluate(() => {
    const lsKey = Object.keys(localStorage).find(k => k.includes('supabase') || k.includes('sb-'));
    const session = lsKey ? JSON.parse(localStorage.getItem(lsKey) || 'null') : null;
    return {
      localStorageKey: lsKey ?? '(none)',
      hasSession: !!session,
      tokenExpiry: session?.expires_at ?? null,
      userEmail: session?.user?.email ?? null,
      userStatusHTML: document.getElementById('user-status')?.innerHTML ?? '(not found)',
      addBtnVisible: (document.getElementById('add-btn') as HTMLElement)?.style.display ?? '(not found)',
      chooseUsernameVisible: document.getElementById('choose-username-overlay')?.classList.contains('visible') ?? false,
      loginOverlayVisible: document.getElementById('login-overlay')?.classList.contains('visible') ?? false,
    };
  });

  console.log('\n=== DIAGNOSTIC OUTPUT ===');
  console.log('localStorage key found:', state.localStorageKey);
  console.log('Session present in localStorage:', state.hasSession);
  console.log('Token expires_at:', state.tokenExpiry ? new Date(state.tokenExpiry * 1000).toISOString() : 'N/A');
  console.log('User email:', state.userEmail);
  console.log('#user-status innerHTML:', state.userStatusHTML);
  console.log('add-btn display:', state.addBtnVisible);
  console.log('choose-username overlay visible:', state.chooseUsernameVisible);
  console.log('login overlay visible:', state.loginOverlayVisible);
  console.log('=========================\n');

  // Always pass — we just want the output
  // Look at the console output to diagnose the problem
});
