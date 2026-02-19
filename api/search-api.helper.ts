/**
 * Search API Helper
 * Makes direct API requests to Vivastreet search endpoint with @step decorators
 */

import { Page, APIResponse } from '@playwright/test';
import { step } from '../utils/step-decorator';
import { SearchParameters, SearchAPIParams } from '../utils/api-types';
import { buildSearchAPIUrl } from '../utils/api-helpers';
import { getCategoryMapping } from './mappings/category-mappings';
import { getLocationMapping } from './mappings/location-mappings';

export class SearchAPIHelper {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Method 1: Make search API request with friendly parameters
   * Uses Playwright's page.request (shares cookies/auth with browser)
   *
   * @param params - Search parameters with UI-friendly labels
   * @returns API response for validation
   */
  @step('Search API request: category={category}, location={location}, keyword={keyword}')
  async search(params: SearchParameters): Promise<APIResponse> {
    // Convert UI labels to API IDs using mappings
    const apiParams = this.mapToAPIParams(params);

    // Build URL with query parameters
    const url = buildSearchAPIUrl(apiParams);

    // Make API request with appropriate headers
    return await this.page.request.get(url, {
      headers: {
        'Referer': 'https://www.vivastreet.co.uk/',
        'Accept': 'application/json, text/javascript, */*; q=0.01',
        'X-Requested-With': 'XMLHttpRequest',
      },
    });
  }

  /**
   * Get mapped API parameters without making request
   * Useful for debugging and validation setup
   *
   * @param params - Search parameters with UI-friendly labels
   * @returns API parameters with IDs
   */
  @step('Get API parameters for: category={category}, location={location}')
  async getAPIParams(params: SearchParameters): Promise<SearchAPIParams> {
    return this.mapToAPIParams(params);
  }

  /**
   * Convert friendly parameters to API parameters
   * Throws descriptive error if mapping not found
   *
   * @param params - Search parameters with UI-friendly labels
   * @returns API parameters with IDs
   */
  private mapToAPIParams(params: SearchParameters): SearchAPIParams {
    const apiParams: SearchAPIParams = {};

    // Map category to cat_id and meta_code
    if (params.category) {
      const categoryMapping = getCategoryMapping(params.category);
      if (!categoryMapping) {
        throw new Error(
          `Category mapping not found for: "${params.category}".\n` +
          `Add mapping to api/mappings/category-mappings.ts\n\n` +
          `To find the mapping:\n` +
          `1. Open browser DevTools → Network tab\n` +
          `2. Select "${params.category}" in UI\n` +
          `3. Observe request to regions_tree.php\n` +
          `4. Record cat_id and meta_code parameters`
        );
      }
      apiParams.cat_id = categoryMapping.cat_id;
      apiParams.meta_code = categoryMapping.meta_code;
    }

    // Map location to geo_id
    if (params.location !== undefined) {
      const locationMapping = getLocationMapping(params.location);
      if (!locationMapping) {
        throw new Error(
          `Location mapping not found for: "${params.location}".\n` +
          `Add mapping to api/mappings/location-mappings.ts\n\n` +
          `To find the mapping:\n` +
          `1. Open browser DevTools → Network tab\n` +
          `2. Select "${params.location}" in UI\n` +
          `3. Observe request to regions_tree.php\n` +
          `4. Record geo_id parameter`
        );
      }
      apiParams.geo_id = locationMapping.geo_id;
    }

    // Note: Keywords are not supported by regions_tree.php API
    // Keyword validation will be added in Phase 4 after research

    return apiParams;
  }
}
