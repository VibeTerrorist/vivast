import { Page, expect } from '@playwright/test';
import { step } from '../utils/step-decorator';
import { IBasePage } from '../utils/types';
import { handleCookieConsent as handleCookieConsentUtil } from '../utils/helpers';

/**
 * Base page class containing common functionality for all page objects
 *
 * All page objects should extend this class to inherit:
 * - Common navigation patterns
 * - Cookie consent handling
 * - Adult content disclaimer handling
 * - Wait utilities
 * - Error context
 */
export abstract class BasePage implements IBasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Navigate to the page - must be implemented by child classes
   */
  abstract navigate(): Promise<void>;

  /**
   * Wait for page to be ready
   * Override in child classes for page-specific ready conditions
   */
  async waitForPageReady(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Handle cookie consent banner
   * Delegates to shared utility function for consistent behavior
   */
  @step('Handle cookie consent banner')
  async handleCookieConsent(): Promise<void> {
    await handleCookieConsentUtil(this.page);
  }

  /**
   * Handle adult content disclaimer popup
   * @param action - Either "Agree" or "Disagree"
   */
  @step('Handle adult content disclaimer: {action}')
  async handleAdultDisclaimer(action: 'Agree' | 'Disagree'): Promise<void> {
    try {
      const disclaimer = this.page.locator('#vs-adult-disclaimer');
      await disclaimer.waitFor({ state: 'visible', timeout: 3000 });

      const buttonId = action === 'Agree' ? '#accept-disclaimer' : '#reject-disclaimer';
      const button = this.page.locator(buttonId);
      await button.click({ timeout: 3000 });
      await expect(disclaimer).toBeHidden({ timeout: 3000 });
    } catch {
      // No disclaimer present or already handled
    }
  }
}
