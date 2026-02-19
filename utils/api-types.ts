/**
 * TypeScript interfaces for Vivastreet Search API
 * Defines type-safe contracts for API parameters, UI parameters, and mappings
 */

/**
 * API-level parameters (query params sent to regions_tree.php)
 */
export interface SearchAPIParams {
  geo_id?: number;
  cat_id?: number;
  meta_code?: string;
  summary?: number;
  country?: string;
  country_id?: string;
}

/**
 * UI-level parameters (friendly names used in tests)
 */
export interface SearchParameters {
  category?: string;      // e.g., "Home Appliances"
  location?: string;      // e.g., "London"
  keyword?: string;       // e.g., "conditioner"
}

/**
 * Category mapping entry (UI label to API parameters)
 */
export interface CategoryMapping {
  label: string;          // UI display name
  cat_id: number;         // Category ID for API
  meta_code: string;      // Meta code for API
}

/**
 * Location mapping entry (UI label to API parameter)
 */
export interface LocationMapping {
  label: string;          // UI display name
  geo_id: number;         // Geographic ID for API
}

/**
 * Validation result structure
 */
export interface RequestValidation {
  matched: boolean;
  actualParams: SearchAPIParams;
  expectedParams: SearchAPIParams;
  differences?: string[];
}
