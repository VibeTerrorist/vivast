/**
 * Location mappings: UI labels to API parameters
 *
 * To add a new location mapping:
 * 1. Open browser DevTools → Network tab
 * 2. Select the location in UI
 * 3. Find request to regions_tree.php
 * 4. Record geo_id parameter
 */

import { LocationMapping } from '../../utils/api-types';

/**
 * Location label to API parameter mapping
 * Key: UI display name (case-sensitive)
 */
export const LOCATION_MAPPINGS: Record<string, LocationMapping> = {
  'London': {
    label: 'London',
    geo_id: 7,
  },
  '': {
    label: '',
    geo_id: 0,  // Empty location = no geo filter
  },
};

/**
 * Get location mapping by label
 * @param locationLabel - UI location label
 * @returns LocationMapping or undefined if not found
 */
export function getLocationMapping(locationLabel: string): LocationMapping | undefined {
  return LOCATION_MAPPINGS[locationLabel];
}

/**
 * Get geographic ID by label
 * @param locationLabel - UI location label
 * @returns Geographic ID or undefined if not found
 */
export function getGeoId(locationLabel: string): number | undefined {
  return LOCATION_MAPPINGS[locationLabel]?.geo_id;
}
