/**
 * Search Validator Helper
 * Validates API responses and intercepts network requests with @step decorators
 */

import { Page, APIResponse, Request, Route, expect } from '@playwright/test';
import { step } from '../utils/step-decorator';
import { SearchParameters, SearchAPIParams, RequestValidation } from '../utils/api-types';
import { SEARCH_API_URL, parseQueryParams, toSearchAPIParams } from '../utils/api-helpers';
import { SearchAPIHelper } from './search-api.helper';

export class SearchValidatorHelper {
  private page: Page;
  private searchAPI: SearchAPIHelper;
  private interceptedRequest?: Request;

  constructor(page: Page) {
    this.page = page;
    this.searchAPI = new SearchAPIHelper(page);
  }

  /**
   * Validate API response has correct parameters
   * Works for both direct API calls and intercepted UI requests
   *
   * @param response - API response to validate
   * @param expectedParams - Expected search parameters (UI-friendly labels)
   */
  @step('Validate API response matches: category={category}, location={location}')
  async validateResponse(
    response: APIResponse,
    expectedParams: SearchParameters
  ): Promise<void> {
    // Verify response status
    await expect(response).toBeOK();

    // Extract actual parameters from response URL
    const requestUrl = response.url();
    const actualParams = toSearchAPIParams(parseQueryParams(requestUrl));

    // Get expected API parameters (convert UI labels to IDs)
    const expectedAPIParams = await this.searchAPI.getAPIParams(expectedParams);

    // Compare and validate
    const validation = this.compareParams(actualParams, expectedAPIParams);

    if (!validation.matched) {
      const differences = validation.differences?.join('\n  - ') || 'Unknown differences';
      throw new Error(
        `API request parameters do not match expected values:\n` +
        `  - ${differences}\n\n` +
        `Actual params: ${JSON.stringify(validation.actualParams)}\n` +
        `Expected params: ${JSON.stringify(validation.expectedParams)}`
      );
    }
  }

  /**
   * Start intercepting search API requests (for UI validation)
   * Call before UI action, then validate with validateInterceptedRequest()
   */
  @step('Start intercepting search API requests')
  async startInterception(): Promise<void> {
    this.interceptedRequest = undefined;

    await this.page.route(`${SEARCH_API_URL}*`, async (route: Route) => {
      this.interceptedRequest = route.request();
      await route.continue();  // Don't block UI
    });
  }

  /**
   * Validate the intercepted network request from UI
   * Call after UI search is completed
   *
   * @param expectedParams - Expected search parameters (UI-friendly labels)
   */
  @step('Validate intercepted request matches: category={category}, location={location}')
  async validateInterceptedRequest(
    expectedParams: SearchParameters
  ): Promise<void> {
    if (!this.interceptedRequest) {
      throw new Error(
        'No search API request was intercepted. ' +
        'Make sure startInterception() was called before the UI action.'
      );
    }

    // Extract actual parameters from intercepted request URL
    const requestUrl = this.interceptedRequest.url();
    const actualParams = toSearchAPIParams(parseQueryParams(requestUrl));

    // Get expected API parameters (convert UI labels to IDs)
    const expectedAPIParams = await this.searchAPI.getAPIParams(expectedParams);

    // Compare and validate
    const validation = this.compareParams(actualParams, expectedAPIParams);

    if (!validation.matched) {
      const differences = validation.differences?.join('\n  - ') || 'Unknown differences';
      throw new Error(
        `Intercepted API request parameters do not match expected values:\n` +
        `  - ${differences}\n\n` +
        `Actual params: ${JSON.stringify(validation.actualParams)}\n` +
        `Expected params: ${JSON.stringify(validation.expectedParams)}`
      );
    }

    // Clean up
    await this.stopInterception();
  }

  /**
   * Stop intercepting requests
   */
  @step('Stop intercepting search API requests')
  async stopInterception(): Promise<void> {
    await this.page.unroute(`${SEARCH_API_URL}*`);
    this.interceptedRequest = undefined;
  }

  /**
   * Compare actual vs expected parameters
   * Returns detailed validation result
   *
   * @param actual - Actual API parameters from request
   * @param expected - Expected API parameters
   * @returns Validation result with differences
   */
  private compareParams(
    actual: SearchAPIParams,
    expected: SearchAPIParams
  ): RequestValidation {
    const differences: string[] = [];
    let matched = true;

    // Compare each parameter (ignore default parameters like summary, country, country_id)
    const paramsToCompare: Array<keyof SearchAPIParams> = ['cat_id', 'geo_id', 'meta_code'];

    for (const key of paramsToCompare) {
      const actualValue = actual[key];
      const expectedValue = expected[key];

      // Only compare if expected value is defined
      if (expectedValue !== undefined) {
        if (actualValue !== expectedValue) {
          matched = false;
          differences.push(`${key}: expected ${expectedValue}, got ${actualValue}`);
        }
      }
    }

    return {
      matched,
      actualParams: actual,
      expectedParams: expected,
      differences: differences.length > 0 ? differences : undefined,
    };
  }
}
