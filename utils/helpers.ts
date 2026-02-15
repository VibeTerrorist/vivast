import { Page } from '@playwright/test';

/**
 * Cookie consent handler for OneTrust banner
 */
export async function handleCookieConsent(page: Page): Promise<void> {
  try {
    await page.getByRole('button', { name: 'Accept All' }).click({ timeout: 3000 });
  } catch {
    try {
      await page.locator('#onetrust-accept-btn-handler').click({ timeout: 3000 });
    } catch {
      // No cookie banner or already accepted
    }
  }
}

