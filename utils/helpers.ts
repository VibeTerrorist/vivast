import { Page, expect } from '@playwright/test';

/**
 * Cookie consent handler for OneTrust banner
 */
export async function handleCookieConsent(page: Page): Promise<void> {
  try {
    const acceptButton = page.getByRole('button', { name: 'Accept All' });
    await acceptButton.click({ timeout: 3000 });
    await expect(acceptButton).toBeHidden({ timeout: 3000 });
  } catch (firstError) {
    try {
      const acceptButtonFallback = page.locator('#onetrust-accept-btn-handler');
      await acceptButtonFallback.click({ timeout: 3000 });
      await expect(page.locator('#onetrust-banner-sdk')).toBeHidden({ timeout: 3000 });
    } catch (secondError) {
      // No cookie banner present or already accepted
    }
  }
}

