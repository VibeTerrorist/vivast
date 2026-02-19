import { expect, Locator, Page, APIResponse } from '@playwright/test';
import { BasePage } from './base.page';
import { step } from '../utils/step-decorator';
import { SearchAPIHelper } from '../api/search-api.helper';
import { SearchValidatorHelper } from '../api/search-validator.helper';

/**
 * Search Results Page Object
 *
 * Represents the search results page with expanded search interface
 * Includes category dropdown and location autocomplete input
 */
export class SearchResultsPage extends BasePage {
  private lastClickedAdId?: string;
  private searchAPI: SearchAPIHelper;
  private searchValidator: SearchValidatorHelper;

  // ========================================
  // Basic Search Elements
  // ========================================
  readonly categoryDropdown: Locator;
  readonly locationInput: Locator;
  readonly resultsSummaryContainer: Locator;
  readonly keywordInput: Locator;
  readonly searchButton: Locator;
  readonly noResultsContainer: Locator;

  // ========================================
  // Search Filter Elements
  // ========================================
  readonly mobileSearchButton: Locator;
  readonly radiusDropdown: Locator;
  readonly filtersButton: Locator;
  readonly listGalleryToggleButton: Locator;
  readonly createAlertButton: Locator;

  // ========================================
  // Advanced Filter Elements
  // ========================================
  readonly ratesMinDropdown: Locator;
  readonly ratesMaxDropdown: Locator;
  readonly serviceTypeDropdown: Locator;
  readonly genderDropdown: Locator;
  readonly ageMinDropdown: Locator;
  readonly ageMaxDropdown: Locator;
  readonly ethnicityDropdown: Locator;
  readonly advertiserTypeDropdown: Locator;

  // ========================================
  // Filter Checkboxes
  // ========================================
  readonly adsWithPhotosCheckbox: Locator;
  readonly adsWithVideosCheckbox: Locator;
  readonly incallCheckbox: Locator;
  readonly outcallCheckbox: Locator;

  // ========================================
  // Filter Action Buttons
  // ========================================
  readonly clearFiltersButton: Locator;
  readonly showResultsButton: Locator;

  constructor(page: Page) {
    super(page);

    // ========================================
    // Basic Search Elements
    // ========================================
    this.categoryDropdown = page.getByLabel('Category');
    this.locationInput = page.getByTestId('filterGeoSearchField');
    this.resultsSummaryContainer = page.getByTestId('divResultsSummaryContainer');
    this.keywordInput = page.getByLabel('Keywords');
    this.searchButton = page.getByTestId('filterSearchButton');
    this.noResultsContainer = page.locator('.vs-search-no-results'); // Update with TestID

    // ========================================
    // Search Filter Elements
    // ========================================
    this.mobileSearchButton = page.getByTestId('filterSearchButtonMobile');
    this.radiusDropdown = page.locator('#vs_geo_radius'); // Update with TestID
    this.filtersButton = page.locator('#show_filters'); // Update with TestID
    this.listGalleryToggleButton = page.locator('.list-gallery-toggle'); // Update with TestID
    this.createAlertButton = page.locator('#create_alert'); // Update with TestID

    // ========================================
    // Advanced Filter Elements
    // ========================================
    this.ratesMinDropdown = page.getByLabel('Rates').first();
    this.ratesMaxDropdown = page.locator('#vs_searchform_rates_range_max'); // Update with TestID
    this.serviceTypeDropdown = page.getByLabel('Services I offer');
    this.genderDropdown = page.getByLabel('Gender');
    this.ageMinDropdown = page.getByLabel('Age').first();
    this.ageMaxDropdown = page.locator('#vs_searchform_age_range_max'); // Update with TestID
    this.ethnicityDropdown = page.getByLabel('Ethnicity');
    this.advertiserTypeDropdown = page.getByTestId('advertiserType');

    // ========================================
    // Filter Checkboxes
    // ========================================
    this.adsWithPhotosCheckbox = page.getByTestId('adsWithPhotosCheckbox');
    this.adsWithVideosCheckbox = page.getByTestId('adsWithVideosCheckbox');
    this.incallCheckbox = page.getByTestId('adsWithIncallCheckbox');
    this.outcallCheckbox = page.getByTestId('adsWithOutcallCheckbox');

    // ========================================
    // Filter Action Buttons
    // ========================================
    this.clearFiltersButton = page.getByRole('button', { name: 'Clear filters' });
    this.showResultsButton = page.getByRole('button', { name: 'Show results' });

    // Initialize API helpers
    this.searchAPI = new SearchAPIHelper(page);
    this.searchValidator = new SearchValidatorHelper(page);
  }

  private getSearchResultCard(resultNumber: number) {
    return this.page.locator(`li.classified.row${resultNumber}`); // Update with TestID
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

  // ========================================
  // Advanced Filter Methods
  // ========================================

  @step('Open filters panel')
  async openFilters(): Promise<void> {
    await this.filtersButton.click();
  }

  @step('Select radius: {radius}')
  async selectRadius(radius: string): Promise<void> {
    await this.radiusDropdown.selectOption({ label: radius });
  }

  @step('Select rate range: min={minRate}, max={maxRate}')
  async selectRateRange(minRate?: string, maxRate?: string): Promise<void> {
    if (minRate) {
      await this.ratesMinDropdown.selectOption({ value: minRate });
    }
    if (maxRate) {
      await this.ratesMaxDropdown.selectOption({ value: maxRate });
    }
  }

  @step('Select service type: {serviceType}')
  async selectServiceType(serviceType: string): Promise<void> {
    await this.serviceTypeDropdown.selectOption({ value: serviceType });
  }

  @step('Select gender: {gender}')
  async selectGender(gender: string): Promise<void> {
    await this.genderDropdown.selectOption({ label: gender });
  }

  @step('Select age range: min={minAge}, max={maxAge}')
  async selectAgeRange(minAge?: string, maxAge?: string): Promise<void> {
    if (minAge) {
      await this.ageMinDropdown.selectOption({ value: minAge });
    }
    if (maxAge) {
      await this.ageMaxDropdown.selectOption({ value: maxAge });
    }
  }

  @step('Select ethnicity: {ethnicity}')
  async selectEthnicity(ethnicity: string): Promise<void> {
    await this.ethnicityDropdown.selectOption({ label: ethnicity });
  }

  @step('Select advertiser type: {advertiserType}')
  async selectAdvertiserType(advertiserType: 'individual' | 'pro' | ''): Promise<void> {
    await this.advertiserTypeDropdown.selectOption({ value: advertiserType });
  }

  @step('Toggle "Ads with photos" filter: {state}')
  async toggleAdsWithPhotos(state: boolean): Promise<void> {
    const isChecked = await this.adsWithPhotosCheckbox.isChecked();
    if (isChecked !== state) {
      await this.adsWithPhotosCheckbox.check();
    }
  }

  @step('Toggle "Ads with video" filter: {state}')
  async toggleAdsWithVideos(state: boolean): Promise<void> {
    const isChecked = await this.adsWithVideosCheckbox.isChecked();
    if (isChecked !== state) {
      await this.adsWithVideosCheckbox.check();
    }
  }

  @step('Toggle "Incall" filter: {state}')
  async toggleIncall(state: boolean): Promise<void> {
    const isChecked = await this.incallCheckbox.isChecked();
    if (isChecked !== state) {
      await this.incallCheckbox.check();
    }
  }

  @step('Toggle "Outcall" filter: {state}')
  async toggleOutcall(state: boolean): Promise<void> {
    const isChecked = await this.outcallCheckbox.isChecked();
    if (isChecked !== state) {
      await this.outcallCheckbox.check();
    }
  }

  @step('Clear all filters')
  async clearFilters(): Promise<void> {
    await this.clearFiltersButton.click();
  }

  @step('Apply filters and show results')
  async applyFilters(): Promise<void> {
    await this.showResultsButton.click();
    await this.waitForPageReady();
  }

  @step('Toggle list/gallery view')
  async toggleListGalleryView(): Promise<void> {
    await this.listGalleryToggleButton.click();
  }

  @step('Create search alert')
  async createAlert(): Promise<void> {
    await this.createAlertButton.click();
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
    const resultsCountElement = this.resultsSummaryContainer.locator('b'); // Update with TestID
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
    await this.page.waitForTimeout(1000);
    const resultCard = this.getSearchResultCard(resultNumber);
    const cladDiv = resultCard.getByTestId('searchResultClad');
    this.lastClickedAdId = await cladDiv.getAttribute('data-clad-id') || undefined;

    const adLink = cladDiv.getByRole('link');
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

  // ========================================
  // API Validation Methods
  // ========================================

  /**
   * Perform search via API (bypasses UI)
   *
   * @param category - Category label (e.g., "Home Appliances")
   * @param location - Location label (e.g., "London")
   * @param keyword - Search keyword (not yet supported by regions_tree.php)
   * @returns API response for validation
   */
  @step('Search via API: category={category}, location={location}, keyword={keyword}')
  async searchViaAPI(
    category?: string,
    location?: string,
    keyword?: string
  ): Promise<APIResponse> {
    return await this.searchAPI.search({ category, location, keyword });
  }

  /**
   * Setup API request interception before UI search
   * Call this BEFORE performing UI search actions
   *
   * @param category - Category label to validate
   * @param location - Location label to validate
   */
  @step('Validate UI search triggers correct API: category={category}, location={location}')
  async validateUISearchAPI(category?: string, location?: string): Promise<void> {
    await this.searchValidator.startInterception();
  }

  /**
   * Validate the intercepted API request after UI search
   * Call this AFTER UI search is completed
   *
   * @param category - Category label to validate
   * @param location - Location label to validate
   */
  @step('Confirm API request matches: category={category}, location={location}')
  async confirmAPIRequest(category?: string, location?: string): Promise<void> {
    await this.searchValidator.validateInterceptedRequest({
      category,
      location,
    });
  }

  /**
   * Validate API response directly
   *
   * @param response - API response to validate
   * @param category - Expected category label
   * @param location - Expected location label
   */
  @step('Validate API response')
  async validateAPIResponse(
    response: APIResponse,
    category?: string,
    location?: string
  ): Promise<void> {
    await this.searchValidator.validateResponse(response, {
      category,
      location,
    });
  }
}
