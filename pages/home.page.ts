import { expect, Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';
import { step } from '../utils/step-decorator';

export class HomePage extends BasePage {
  readonly categoryDropdown: Locator;
  readonly geolocationDropdown: Locator;
  readonly searchButton: Locator;
  readonly myAccountLink: Locator;

  constructor(page: Page) {
    super(page);
    this.categoryDropdown = page.locator('[data-automation="categoryDropdown"]');
    this.geolocationDropdown = page.locator('[data-automation="searchGeoDropdown"]');
    this.searchButton = page.locator('[data-automation="homepageSearchButton"]');
    this.myAccountLink = page.locator('[data-automation="lnkHeaderLogin"]');
  }

  @step('Navigate to homepage')
  async navigate(): Promise<void> {
    await this.page.goto('/');
    await this.waitForPageReady();
  }

  @step('Verify homepage has loaded')
  async verifyLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/vivastreet\.co\.uk/);
    await expect(this.page.locator('body')).toBeVisible();
  }

  @step('Select category: {category}')
  async selectCategory(category: string): Promise<void> {
    await this.categoryDropdown.selectOption({ label: category });
  }

  @step('Select location: {location}')
  async selectLocation(location: string): Promise<void> {
    await this.geolocationDropdown.selectOption({ label: location });
  }

  @step('Click search button')
  async clickSearch(): Promise<void> {
    await this.searchButton.click();
  }

  @step('Click My Account link')
  async clickMyAccount(): Promise<void> {
    await this.myAccountLink.click();
  }
}
