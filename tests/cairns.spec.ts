import { test, expect } from '@playwright/test';

// Tests for cross-state cairn visibility — behaviors 44–46 in BEHAVIORS.md
//
// Requires testUser1 and testUser2 to each have at least one cairn in the DB.
// Test cairns are placed at x: -1, y: -1 (off-screen) so they don't appear
// to real users but are present in the DB for ownership checks.

// ── Anonymous ──────────────────────────────────────────────────────────────

test.describe('Cairn visibility — anonymous', () => {

  // Behavior 44 (part 1)
  test('Cairns are visible to anonymous users', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.cairn').first()).toBeVisible({ timeout: 10000 });
  });

});

// ── Authenticated ──────────────────────────────────────────────────────────

test.describe('Cairn visibility — authenticated', () => {

  test.use({ storageState: 'playwright/.auth/user1.json' });

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#user-status span')).toBeVisible({ timeout: 15000 });
  });

  // DIAGNOSTIC — delete after cairn-mine bug resolved
  test('DIAG: cairn ownership state', async ({ page }) => {
    await page.waitForTimeout(3000); // let loadMarkers complete
    const result = await page.evaluate(() => {
      const all = document.querySelectorAll('.cairn');
      const mine = document.querySelectorAll('.cairn-mine');
      const cu = (window as any).currentUser;
      return {
        totalCairns: all.length,
        mineCairns: mine.length,
        currentUserId: cu?.id ?? null,
      };
    });
    console.log('DIAG:', JSON.stringify(result));
    expect(true).toBe(true); // always passes — we just want the log
  });

  // Behavior 44 (part 2)
  test('Cairns are visible to authenticated users', async ({ page }) => {
    await expect(page.locator('.cairn').first()).toBeVisible();
  });

  // Behavior 45
  test("Authenticated user's own cairns have the cairn-mine class (amber tint)", async ({ page }) => {
    await expect(page.locator('.cairn-mine').first()).toBeVisible();
  });

  // Behavior 46
  test("Hiding others' cairns does not hide the current user's cairns", async ({ page }) => {
    await page.locator('#toggle-others-btn').click();
    await expect(page.locator('.cairn-mine').first()).toBeVisible();
    await expect(page.locator('.cairn:not(.cairn-mine)').first()).toBeHidden();
  });

});
