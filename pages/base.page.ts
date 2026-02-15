import { Page, expect } from '@playwright/test';
import { step } from '../utils/step-decorator';
import { IBasePage } from '../utils/types';

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
   */
  @step('Handle cookie consent banner')
  async handleCookieConsent(): Promise<void> {
    try {
      const acceptButton = this.page.getByRole('button', { name: 'Accept All' });
      await acceptButton.click({ timeout: 3000 });
      await expect(acceptButton).toBeHidden({ timeout: 3000 });
    } catch (firstError) {
      try {
        const acceptButtonFallback = this.page.locator('#onetrust-accept-btn-handler');
        await acceptButtonFallback.click({ timeout: 3000 });
        await expect(this.page.locator('#onetrust-banner-sdk')).toBeHidden({ timeout: 3000 });
      } catch (secondError) {
        // No cookie banner present or already accepted
      }
    }
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
