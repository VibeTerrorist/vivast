import { expect, Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';
import { step } from '../utils/step-decorator';

/**
 * Ad Details Page Object
 *
 * Represents the ad detail page where users can view full ad information
 * and reveal contact phone numbers
 */
export class AdDetailsPage extends BasePage {
  readonly phoneButton: Locator;

  constructor(page: Page) {
    super(page);
    this.phoneButton = page.locator('[data-automation="spnDetailsContactPhoneButtonDesktopLabel_right"]');
  }

  @step('Navigate to ad details page')
  async navigate(): Promise<void> {
    // Ad details page is typically reached via clicking a search result
    // Direct navigation not supported - use SearchResultsPage.clickSearchResult() instead
    throw new Error('Cannot navigate directly to ad details page. Use SearchResultsPage.clickSearchResult() instead.');
  }

  @step('Click phone number button')
  async clickPhoneNumber(): Promise<void> {
    await this.phoneButton.click();
  }

  @step('Verify phone number is revealed')
  async verifyPhoneNumberRevealed(): Promise<void> {
    const expectedPhoneNumber = await this.phoneButton.getAttribute('data-phone-number');

    if (!expectedPhoneNumber) {
      throw new Error('Phone number data attribute not found on button');
    }

    await expect(this.phoneButton).toHaveText(expectedPhoneNumber);
  }
}
