import { expect, Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';
import { step } from '../utils/step-decorator';

/**
 * Search Results Page Object
 *
 * Represents the search results page with expanded search interface
 * Includes category dropdown and location autocomplete input
 */
export class SearchResultsPage extends BasePage {
  private lastClickedAdId?: string;

  readonly categoryDropdown: Locator;
  readonly locationInput: Locator;
  readonly resultsSummaryContainer: Locator;
  readonly keywordInput: Locator;
  readonly searchButton: Locator;
  readonly noResultsContainer: Locator;

  constructor(page: Page) {
    super(page);
    this.categoryDropdown = page.getByLabel('Category');
    this.locationInput = page.locator('[data-automation="filterGeoSearchField"]');
    this.resultsSummaryContainer = page.locator('[data-automation="divResultsSummaryContainer"]');
    this.keywordInput = page.locator('#vs_search_keywords');
    this.searchButton = page.locator('[data-automation="filterSearchButton"]');
    this.noResultsContainer = page.locator('.vs-search-no-results');
  }

  private getSearchResultCard(resultNumber: number) {
    return this.page.locator(`li.classified.row${resultNumber}`);
  }

  @step('Navigate to search results page')
  async navigate(): Promise<void> {
    // Search results page is typically reached via search, not direct navigation
    // This is a placeholder - override if needed
    await this.page.goto('/search');
    await this.waitForPageReady();
  }

  @step('Select category: {category}')
  async selectCategory(category: string): Promise<void> {
    await this.categoryDropdown.selectOption({ label: category });
  }

  @step('Enter location: {location}')
  async enterLocation(location: string): Promise<void> {
    await this.locationInput.clear();
    await this.locationInput.fill(location);
  }

  @step('Enter keywords: {keywords}')
  async enterKeywords(keywords: string): Promise<void> {
    await this.keywordInput.clear();
    await this.keywordInput.fill(keywords);
  }

  @step('Click search button')
  async clickSearchButton(): Promise<void> {
    await this.searchButton.click();
    await this.waitForPageReady();
  }

  @step('Verify category is: {expectedCategory}')
  async verifyCategory(expectedCategory: string): Promise<void> {
    const selectedOption = this.categoryDropdown.locator('option:checked');
    const actualCategory = await selectedOption.textContent();

    // Trim whitespace for comparison
    const trimmedActual = actualCategory?.trim() || '';
    const trimmedExpected = expectedCategory.trim();

    await expect(selectedOption).toHaveText(trimmedExpected, {
      ignoreCase: false
    });
  }

  @step('Verify location is: {expectedLocation}')
  async verifyLocation(expectedLocation: string): Promise<void> {
    await expect(this.locationInput).toHaveValue(expectedLocation);
  }

  @step('Verify search filters match selected values')
  async verifySearchFilters(category: string, location: string): Promise<void> {
    await this.verifyCategory(category);
    await this.verifyLocation(location);
  }

  @step('Get results count')
  async getResultsCount(): Promise<number> {
    const resultsCountElement = this.resultsSummaryContainer.locator('b');
    const countText = await resultsCountElement.textContent();
    const count = parseInt(countText?.trim() || '0', 10);
    return count;
  }

  @step('Verify search has results')
  async verifyHasResults(): Promise<void> {
    const count = await this.getResultsCount();

    expect(count).toBeGreaterThan(0);
  }

  @step('Verify no results found')
  async verifyNoResults(): Promise<void> {
    await expect(this.noResultsContainer).toBeVisible();
    await expect(this.noResultsContainer.locator('.no-results-header')).toHaveText('No Results Found');
  }

  @step('Verify results count is: {expectedCount}')
  async verifyResultsCount(expectedCount: number): Promise<void> {
    const actualCount = await this.getResultsCount();

    expect(actualCount).toBe(expectedCount);
  }

  @step('Click search result number {resultNumber}')
  async clickSearchResult(resultNumber: number): Promise<void> {
    const resultCard = this.getSearchResultCard(resultNumber);
    const cladDiv = resultCard.locator('[data-automation="searchResultClad"]');
    this.lastClickedAdId = await cladDiv.getAttribute('data-clad-id') || undefined;

    const adLink = cladDiv.locator('a.clad__ad_link');
    await expect(adLink).toBeVisible();

    const currentUrl = this.page.url();
    await adLink.click();

    await this.page.waitForURL(url => url.toString() !== currentUrl, {
      timeout: 10000
    });
    await this.page.waitForLoadState('domcontentloaded');
  }

  @step('Verify opened ad matches clicked result')
  async verifyOpenedAd(): Promise<void> {
    if (!this.lastClickedAdId) {
      throw new Error('No ad was clicked. Call clickSearchResult() first.');
    }

    const currentUrl = this.page.url();
    const expectedUrlEnding = `/${this.lastClickedAdId}`;

    expect(currentUrl.endsWith(expectedUrlEnding),
      `Expected URL to end with "${expectedUrlEnding}" but got "${currentUrl}"`
    ).toBeTruthy();

    const adElement = this.page.locator(`[data-clad-id="${this.lastClickedAdId}"]`);
    await expect(adElement).toBeVisible();
  }
}
