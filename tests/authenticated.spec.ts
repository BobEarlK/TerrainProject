import { test, expect } from '@playwright/test';

// Tests for AUTHENTICATED state — behaviors 26–43 in BEHAVIORS.md
// Uses saved session from global-setup.ts (playwright/.auth/user1.json).
// global-setup.ts signs in once before the test run; each test here loads that
// snapshot into localStorage instead of signing in through the UI each time.
// This avoids Supabase auth rate limits and eliminates sign-in timing failures.

test.use({ storageState: 'playwright/.auth/user1.json' });

test.describe('AUTHENTICATED state', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Username span confirms Supabase has restored the session from localStorage
    await expect(page.locator('#user-status span')).toBeVisible({ timeout: 15000 });
  });

  // Behavior 26
  test('Username is visible in the status capsule', async ({ page }) => {
    await expect(page.locator('#user-status span')).toBeVisible();
    await expect(page.locator('#user-status span')).not.toBeEmpty();
  });

  // Behavior 27
  test('Sign Out button is visible in the status capsule', async ({ page }) => {
    await expect(page.locator('#signout-btn')).toBeVisible();
  });

  // Behavior 28
  test('Toggle button is visible in the status capsule', async ({ page }) => {
    await expect(page.locator('#toggle-others-btn')).toBeVisible();
  });

  // Behavior 29
  test('Add button is visible', async ({ page }) => {
    await expect(page.locator('#add-btn')).toBeVisible();
  });

  // Behavior 30
  test('Toggle button reads "All cairns" when other cairns are visible', async ({ page }) => {
    await expect(page.locator('#toggle-others-btn')).toHaveText('All cairns');
  });

  // Behavior 31
  test('Toggle button reads "My cairns" when other cairns are hidden', async ({ page }) => {
    await page.locator('#toggle-others-btn').click();
    await expect(page.locator('#toggle-others-btn')).toHaveText('My cairns');
  });

  // Behaviors 32–33: require cairns owned by testUser2 to be present in the DB.
  // Skipped until test data seeding is in place.
  test.skip('Clicking the toggle hides other users cairns (not the current users)', async () => {});
  test.skip('Clicking the toggle again shows other users cairns', async () => {});

  // Behavior 34
  test('Clicking Sign Out returns the app to ANONYMOUS state', async ({ page }) => {
    await page.locator('#signout-btn').click();
    await expect(page.locator('#signin-btn')).toBeVisible({ timeout: 5000 });
  });

  // Behavior 35
  test('Sign Out removes the username from the status capsule', async ({ page }) => {
    await page.locator('#signout-btn').click();
    await expect(page.locator('#user-status span')).toBeHidden();
  });

  // Behavior 36
  test('Sign Out hides the Add button', async ({ page }) => {
    await page.locator('#signout-btn').click();
    await expect(page.locator('#add-btn')).toBeHidden();
  });

  // Behavior 37
  test('Clicking Add opens the cairn placement dialog', async ({ page }) => {
    await page.locator('#add-btn').click();
    await expect(page.locator('#dialog-overlay')).toBeVisible();
  });

  // Behavior 38
  test('Cairn dialog Cancel button closes the dialog', async ({ page }) => {
    await page.locator('#add-btn').click();
    await page.locator('#cancel-btn').click();
    await expect(page.locator('#dialog-overlay')).toBeHidden();
  });

  // Behavior 39
  test('Placing a cairn with empty title or content does nothing', async ({ page }) => {
    await page.locator('#add-btn').click();
    await page.locator('#place-btn').click();
    // Dialog must still be open — empty fields are silently ignored
    await expect(page.locator('#dialog-overlay')).toBeVisible();
  });

  // Behavior 40
  test('Placing a cairn with valid title and content starts drag mode', async ({ page }) => {
    await page.locator('#add-btn').click();
    await page.locator('#input-title').fill('Test Cairn');
    await page.locator('#input-content').fill('Placed by Playwright — will not be dropped');
    await page.locator('#place-btn').click();
    await expect(page.locator('#dialog-overlay')).toBeHidden();
    await expect(page.locator('#instruction')).toBeVisible();
  });

  // Behavior 41 — SKIPPED: dropping saves to the live DB with no cleanup mechanism yet.
  // To implement: complete the drag, verify cairn element appears, then delete the test
  // record from Supabase via REST API before the test ends.
  test.skip('Releasing a cairn drops it at that position and saves to DB', async () => {});

  // Behavior 42
  // Requires at least one cairn in the DB — true on the live site.
  test('Clicking an existing cairn shows a popup with its title and content', async ({ page }) => {
    await expect(page.locator('.cairn').first()).toBeVisible({ timeout: 5000 });
    await page.locator('.cairn').first().click();
    await expect(page.locator('#popup')).toBeVisible();
    await expect(page.locator('#popup-title')).not.toBeEmpty();
  });

  // Behavior 43
  test('Clicking elsewhere on the terrain closes the popup', async ({ page }) => {
    await expect(page.locator('.cairn').first()).toBeVisible({ timeout: 5000 });
    await page.locator('.cairn').first().click();
    await expect(page.locator('#popup')).toBeVisible();
    // Click a spot away from any cairn
    await page.locator('#terrain').click({ position: { x: 10, y: 10 } });
    await expect(page.locator('#popup')).toBeHidden();
  });

});
