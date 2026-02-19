/**
 * Category mappings: UI labels to API parameters
 *
 * To add a new category mapping:
 * 1. Open browser DevTools → Network tab
 * 2. Select the category in UI
 * 3. Find request to regions_tree.php
 * 4. Record cat_id and meta_code parameters
 */

import { CategoryMapping } from '../../utils/api-types';

/**
 * Category label to API parameters mapping
 * Key: UI display name (case-sensitive)
 */
export const CATEGORY_MAPPINGS: Record<string, CategoryMapping> = {
  'Home Appliances': {
    label: 'Home Appliances',
    cat_id: 93,
    meta_code: 'appliances_furniture',
  },
  'Escorts and Massages': {
    label: 'Escorts and Massages',
    cat_id: 88,
    meta_code: 'adult_services',
  },
  // Additional categories can be added here as tests expand
};

/**
 * Get category mapping by label
 * @param categoryLabel - UI category label
 * @returns CategoryMapping or undefined if not found
 */
export function getCategoryMapping(categoryLabel: string): CategoryMapping | undefined {
  return CATEGORY_MAPPINGS[categoryLabel];
}

/**
 * Get category ID by label
 * @param categoryLabel - UI category label
 * @returns Category ID or undefined if not found
 */
export function getCategoryId(categoryLabel: string): number | undefined {
  return CATEGORY_MAPPINGS[categoryLabel]?.cat_id;
}

/**
 * Get meta code by label
 * @param categoryLabel - UI category label
 * @returns Meta code or undefined if not found
 */
export function getMetaCode(categoryLabel: string): string | undefined {
  return CATEGORY_MAPPINGS[categoryLabel]?.meta_code;
}
