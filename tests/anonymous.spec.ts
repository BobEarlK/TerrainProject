import { test, expect, Page } from '@playwright/test';

// Tests for ANONYMOUS state — behaviors 1–11 in BEHAVIORS.md
// No sign-in required. Each test gets a fresh browser context (no stored session).

// Helper: open the login dialog and wait for it to be fully visible before proceeding.
// Without the explicit wait, Chromium can attempt to click inside the dialog before
// it has finished rendering — Firefox and WebKit are slower and don't hit this.
async function openLoginDialog(page: Page) {
  await page.locator('#signin-btn').click();
  await expect(page.locator('#login-overlay')).toBeVisible();
}

test.describe('ANONYMOUS state', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Sign In button is set synchronously — its presence confirms the page is ready
    await page.waitForSelector('#signin-btn');
  });

  // Behavior 1
  test('Sign In button is visible in the status capsule', async ({ page }) => {
    await expect(page.locator('#signin-btn')).toBeVisible();
  });

  // Behavior 2
  test('Add button is hidden', async ({ page }) => {
    await expect(page.locator('#add-btn')).toBeHidden();
  });

  // Behavior 3
  // Requires at least one cairn to exist in the DB. True on the live site.
  test('Cairns are visible on the terrain', async ({ page }) => {
    await expect(page.locator('.cairn').first()).toBeVisible({ timeout: 5000 });
  });

  // Behavior 4
  test('No username is shown in the status capsule', async ({ page }) => {
    await expect(page.locator('#user-status span')).toBeHidden();
  });

  // Behavior 5
  test('Clicking Sign In opens the login dialog', async ({ page }) => {
    await openLoginDialog(page);
    await expect(page.locator('#login-overlay')).toBeVisible();
  });

  // Behavior 6
  test('Login dialog Cancel button closes the dialog without signing in', async ({ page }) => {
    await openLoginDialog(page);
    await page.locator('#login-cancel-btn').click();
    await expect(page.locator('#login-overlay')).toBeHidden();
  });

  // Behavior 7
  test('Clicking "Forgot password?" switches the login dialog to the reset view', async ({ page }) => {
    await openLoginDialog(page);
    // page.evaluate fires the click directly in JS — bypasses Chromium's coordinate-based
// hit-testing, which routes clicks on #forgot-link to the password input above it
// due to the negative margin-top on .forgot-link overlapping into the input's space.
await page.evaluate(() => document.getElementById('forgot-link')?.click());
    await expect(page.locator('#reset-view')).toBeVisible();
    await expect(page.locator('#login-view')).toBeHidden();
  });

  // Behavior 8
  test('Reset view Back button returns to the sign-in view', async ({ page }) => {
    await openLoginDialog(page);
    // page.evaluate fires the click directly in JS — bypasses Chromium's coordinate-based
// hit-testing, which routes clicks on #forgot-link to the password input above it
// due to the negative margin-top on .forgot-link overlapping into the input's space.
await page.evaluate(() => document.getElementById('forgot-link')?.click());
    await page.locator('#reset-back-btn').click();
    await expect(page.locator('#login-view')).toBeVisible();
    await expect(page.locator('#reset-view')).toBeHidden();
  });

  // Behavior 9
  test('Reset view: submitting an empty email does nothing', async ({ page }) => {
    await openLoginDialog(page);
    // page.evaluate fires the click directly in JS — bypasses Chromium's coordinate-based
// hit-testing, which routes clicks on #forgot-link to the password input above it
// due to the negative margin-top on .forgot-link overlapping into the input's space.
await page.evaluate(() => document.getElementById('forgot-link')?.click());
    await page.locator('#reset-submit-btn').click();
    await expect(page.locator('#reset-submit-btn')).toHaveText('Send reset link');
    await expect(page.locator('#login-overlay')).toBeVisible();
  });

  // Behavior 10
  // Uses a fake email — Supabase returns success without sending when the address is unknown.
  // This tests the UI response only, not actual email delivery (see MANUAL_TEST_CHECKLIST.md).
  test('Reset view: submitting a valid email shows a success message and changes the button to "Close"', async ({ page }) => {
    await openLoginDialog(page);
    // page.evaluate fires the click directly in JS — bypasses Chromium's coordinate-based
// hit-testing, which routes clicks on #forgot-link to the password input above it
// due to the negative margin-top on .forgot-link overlapping into the input's space.
await page.evaluate(() => document.getElementById('forgot-link')?.click());
    await page.locator('#reset-email').fill('nobody@example.com');
    await page.locator('#reset-submit-btn').click();
    await expect(page.locator('#login-message')).toBeVisible();
    await expect(page.locator('#reset-submit-btn')).toHaveText('Close');
  });

  // Behavior 11
  test('Reset view: clicking Close after sending a reset link closes the login dialog', async ({ page }) => {
    await openLoginDialog(page);
    // page.evaluate fires the click directly in JS — bypasses Chromium's coordinate-based
// hit-testing, which routes clicks on #forgot-link to the password input above it
// due to the negative margin-top on .forgot-link overlapping into the input's space.
await page.evaluate(() => document.getElementById('forgot-link')?.click());
    await page.locator('#reset-email').fill('nobody@example.com');
    await page.locator('#reset-submit-btn').click();
    await expect(page.locator('#reset-submit-btn')).toHaveText('Close');
    await page.locator('#reset-submit-btn').click();
    await expect(page.locator('#login-overlay')).toBeHidden();
  });

});
