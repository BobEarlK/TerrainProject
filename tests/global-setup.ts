import { chromium } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Runs once before all tests. Signs in as testUser1 and saves the session to disk.
// authenticated.spec.ts loads this saved session instead of signing in each test,
// which avoids Supabase auth rate limits and eliminates sign-in timing failures.
//
// The saved session file (playwright/.auth/user1.json) contains the Supabase
// localStorage entries — effectively a snapshot of "already signed in" state.
// Supabase will auto-refresh the token if it has expired when tests run.

async function globalSetup() {
  // Must use www — see baseURL comment in playwright.config.ts
  const baseURL = 'https://www.pandemicerratic.com';
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.goto(baseURL);
  await page.waitForSelector('#signin-btn');
  await page.locator('#signin-btn').click();
  await page.waitForSelector('#login-overlay');

  await page.locator('#login-email').fill(process.env.TEST_USER1_EMAIL!);
  await page.locator('#login-password').fill(process.env.TEST_USER1_PASSWORD!);
  await page.locator('#login-submit-btn').click();

  // Wait for AUTHENTICATED state — username span confirms session is active
  await page.waitForSelector('#user-status span', { timeout: 15000 });

  // Save localStorage (contains Supabase session tokens) to disk
  await page.context().storageState({ path: 'playwright/.auth/user1.json' });
  await browser.close();
}

export default globalSetup;
