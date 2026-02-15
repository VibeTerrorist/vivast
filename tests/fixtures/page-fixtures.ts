import { test as base } from '@playwright/test';
import { handleCookieConsent } from '../../utils/helpers';

/**
 * Extended test with automatic cookie consent handling
 */
export const test = base.extend({
  page: async ({ page }, use) => {
    await page.goto('/');
    await handleCookieConsent(page);
    await use(page);
  },
});

export { expect } from '@playwright/test';
