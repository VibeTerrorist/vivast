/**
 * API helper utilities for Vivastreet Search API
 * Low-level utilities for URL building and parameter parsing (no @step decorators)
 */

import { SearchAPIParams } from './api-types';

/**
 * Vivastreet search API endpoint
 */
export const SEARCH_API_URL = 'https://search.vivastreet.co.uk/ajax/regions_tree.php';

/**
 * Default API parameters included in all requests
 */
export const DEFAULT_API_PARAMS: SearchAPIParams = {
  summary: 1,
  country: 'GB',
  country_id: 'GB',
};

/**
 * Build full URL with query parameters
 * @param params - API parameters to include in URL
 * @returns Complete URL with query string
 */
export function buildSearchAPIUrl(params: SearchAPIParams): string {
  const mergedParams = { ...DEFAULT_API_PARAMS, ...params };
  const searchParams = new URLSearchParams();

  // Add parameters in consistent order
  Object.entries(mergedParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  });

  return `${SEARCH_API_URL}?${searchParams.toString()}`;
}

/**
 * Parse query parameters from URL string
 * @param url - Full URL with query string
 * @returns Object with query parameter key-value pairs
 */
export function parseQueryParams(url: string): Record<string, string> {
  const urlObj = new URL(url);
  const params: Record<string, string> = {};

  urlObj.searchParams.forEach((value, key) => {
    params[key] = value;
  });

  return params;
}

/**
 * Convert query params to typed SearchAPIParams
 * @param params - Raw query parameters from URL
 * @returns Typed SearchAPIParams object
 */
export function toSearchAPIParams(params: Record<string, string>): SearchAPIParams {
  const result: SearchAPIParams = {};

  if (params.geo_id) result.geo_id = parseInt(params.geo_id, 10);
  if (params.cat_id) result.cat_id = parseInt(params.cat_id, 10);
  if (params.meta_code) result.meta_code = params.meta_code;
  if (params.summary) result.summary = parseInt(params.summary, 10);
  if (params.country) result.country = params.country;
  if (params.country_id) result.country_id = params.country_id;

  return result;
}
