# API Validation Skill

Expert guidance for creating and managing API validation in the Vivastreet test automation framework.

## Trigger Phrases

Use this skill when:
- "analyze this cURL" / "add mapping from cURL"
- "create API validation for [endpoint]"
- "add [category/location] mapping"
- "validate API request for [feature]"
- "intercept network request"

## Core Patterns

### 3-Layer API Validation Architecture

```
Layer 3: Test Specs (tests/e2e/*.spec.ts)
    ↓ Uses page object API methods
Layer 2: Page Objects (pages/*.page.ts)
    ↓ Uses API helpers with @step decorators
Layer 1: API Helpers (api/*.helper.ts, utils/api-*.ts)
    ↓ Makes requests, validates responses
```

### File Organization

```
api/
├── [feature]-api.helper.ts        # API request class (@step methods)
├── [feature]-validator.helper.ts  # Validation class (@step methods)
└── mappings/
    ├── category-mappings.ts       # Category label → API IDs
    └── location-mappings.ts       # Location label → geo_id

utils/
├── api-types.ts                   # TypeScript interfaces
└── api-helpers.ts                 # URL utilities (no @step)
```

## Workflow 1: Analyze cURL and Add Mappings

When a user shares a cURL command, extract mappings and add them to existing mapping files.

### Step 1: Parse cURL Command

Extract these key elements:
- **URL and query parameters**: Look for `cat_id`, `geo_id`, `meta_code`
- **Headers**: Note `Referer`, `X-Requested-With`, `Accept`
- **Request method**: GET, POST, etc.

**Example cURL:**
```bash
curl 'https://search.vivastreet.co.uk/ajax/regions_tree.php?cat_id=44&geo_id=7&meta_code=escorts_massages&summary=1&country=GB&country_id=GB' \
  -H 'Referer: https://www.vivastreet.co.uk/' \
  -H 'X-Requested-With: XMLHttpRequest'
```

**Extracted parameters:**
- `cat_id=44`
- `geo_id=7`
- `meta_code=escorts_massages`
- Default params: `summary=1`, `country=GB`, `country_id=GB`

### Step 2: Identify UI Labels

Ask the user or infer from context:
- "What category label does `cat_id=44` correspond to?" → "Escorts and Massages"
- "What location does `geo_id=7` represent?" → "London"

### Step 3: Add to Category Mappings

**File:** `api/mappings/category-mappings.ts`

**Pattern to follow:**
```typescript
export const CATEGORY_MAPPINGS: Record<string, CategoryMapping> = {
  'Home Appliances': {
    label: 'Home Appliances',
    cat_id: 93,
    meta_code: 'appliances_furniture',
  },
  // ADD NEW MAPPING HERE
};
```

**Rules:**
- Key = exact UI label (case-sensitive)
- `label` = same as key
- `cat_id` = number from cURL
- `meta_code` = string from cURL
- Add comment if non-obvious: `// Adult category`

**Example addition:**
```typescript
'Escorts and Massages': {
  label: 'Escorts and Massages',
  cat_id: 44,
  meta_code: 'escorts_massages',
},
```

### Step 4: Add to Location Mappings

**File:** `api/mappings/location-mappings.ts`

**Pattern to follow:**
```typescript
export const LOCATION_MAPPINGS: Record<string, LocationMapping> = {
  'London': {
    label: 'London',
    geo_id: 7,
  },
  // ADD NEW MAPPING HERE
};
```

**Rules:**
- Key = exact UI label (case-sensitive)
- `label` = same as key
- `geo_id` = number from cURL
- Empty string mapping always exists: `''` → `geo_id: 0`

**Example addition:**
```typescript
'Manchester': {
  label: 'Manchester',
  geo_id: 15,
},
```

### Step 5: Verify TypeScript Compilation

After adding mappings:
```bash
npx tsc --noEmit
```

Must complete without errors.

## Workflow 2: Create New API Helper

When adding API validation for a new feature/endpoint:

### Template: API Helper Class

**File:** `api/[feature]-api.helper.ts`

```typescript
import { Page, APIResponse } from '@playwright/test';
import { step } from '../utils/step-decorator';
import { [Feature]Parameters, [Feature]APIParams } from '../utils/api-types';
import { build[Feature]APIUrl } from '../utils/api-helpers';

export class [Feature]APIHelper {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Make API request with friendly parameters
   * Uses Playwright's page.request (shares cookies/auth)
   */
  @step('[Feature] API request: param1={param1}, param2={param2}')
  async [action](params: [Feature]Parameters): Promise<APIResponse> {
    // 1. Map UI labels to API IDs
    const apiParams = this.mapToAPIParams(params);

    // 2. Build URL
    const url = build[Feature]APIUrl(apiParams);

    // 3. Make request
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
   */
  @step('Get API parameters for [feature]')
  async getAPIParams(params: [Feature]Parameters): Promise<[Feature]APIParams> {
    return this.mapToAPIParams(params);
  }

  /**
   * Convert friendly parameters to API parameters
   * Throws descriptive error if mapping not found
   */
  private mapToAPIParams(params: [Feature]Parameters): [Feature]APIParams {
    const apiParams: [Feature]APIParams = {};

    // Map each parameter using mapping files
    // Throw helpful errors if mappings missing

    return apiParams;
  }
}
```

**Required elements:**
- ✅ Import `@step` from `../utils/step-decorator`
- ✅ Use `page.request` (not `request.newContext()`)
- ✅ Add `@step` to all public methods
- ✅ Use parameter injection in step names: `{paramName}`
- ✅ Throw helpful errors when mappings missing
- ✅ Include instructions in error message

## Workflow 3: Create Validator Helper

**File:** `api/[feature]-validator.helper.ts`

```typescript
import { Page, APIResponse, Request, Route, expect } from '@playwright/test';
import { step } from '../utils/step-decorator';
import { [Feature]Parameters, [Feature]APIParams, RequestValidation } from '../utils/api-types';
import { [FEATURE]_API_URL, parseQueryParams, to[Feature]APIParams } from '../utils/api-helpers';
import { [Feature]APIHelper } from './[feature]-api.helper';

export class [Feature]ValidatorHelper {
  private page: Page;
  private [feature]API: [Feature]APIHelper;
  private interceptedRequest?: Request;

  constructor(page: Page) {
    this.page = page;
    this.[feature]API = new [Feature]APIHelper(page);
  }

  /**
   * Validate API response has correct parameters
   */
  @step('Validate [feature] API response matches expected params')
  async validateResponse(
    response: APIResponse,
    expectedParams: [Feature]Parameters
  ): Promise<void> {
    // 1. Verify response OK
    await expect(response).toBeOK();

    // 2. Extract actual params from URL
    const requestUrl = response.url();
    const actualParams = to[Feature]APIParams(parseQueryParams(requestUrl));

    // 3. Get expected API params
    const expectedAPIParams = await this.[feature]API.getAPIParams(expectedParams);

    // 4. Compare and validate
    const validation = this.compareParams(actualParams, expectedAPIParams);

    if (!validation.matched) {
      const differences = validation.differences?.join('\n  - ') || 'Unknown';
      throw new Error(
        `API request parameters do not match:\n` +
        `  - ${differences}\n\n` +
        `Actual: ${JSON.stringify(validation.actualParams)}\n` +
        `Expected: ${JSON.stringify(validation.expectedParams)}`
      );
    }
  }

  /**
   * Start intercepting API requests
   */
  @step('Start intercepting [feature] API requests')
  async startInterception(): Promise<void> {
    this.interceptedRequest = undefined;

    await this.page.route(`${[FEATURE]_API_URL}*`, async (route: Route) => {
      this.interceptedRequest = route.request();
      await route.continue();  // Don't block UI
    });
  }

  /**
   * Validate intercepted request
   */
  @step('Validate intercepted [feature] request')
  async validateInterceptedRequest(
    expectedParams: [Feature]Parameters
  ): Promise<void> {
    if (!this.interceptedRequest) {
      throw new Error('No request intercepted. Call startInterception() first.');
    }

    // Extract and validate (same logic as validateResponse)

    await this.stopInterception();
  }

  /**
   * Stop intercepting
   */
  @step('Stop intercepting [feature] API requests')
  async stopInterception(): Promise<void> {
    await this.page.unroute(`${[FEATURE]_API_URL}*`);
    this.interceptedRequest = undefined;
  }

  /**
   * Compare actual vs expected parameters
   */
  private compareParams(
    actual: [Feature]APIParams,
    expected: [Feature]APIParams
  ): RequestValidation {
    const differences: string[] = [];
    let matched = true;

    // Compare relevant parameters (ignore defaults)
    const paramsToCompare: Array<keyof [Feature]APIParams> = [/* list keys */];

    for (const key of paramsToCompare) {
      const actualValue = actual[key];
      const expectedValue = expected[key];

      if (expectedValue !== undefined && actualValue !== expectedValue) {
        matched = false;
        differences.push(`${key}: expected ${expectedValue}, got ${actualValue}`);
      }
    }

    return { matched, actualParams: actual, expectedParams: expected, differences: differences.length > 0 ? differences : undefined };
  }
}
```

**Required elements:**
- ✅ Two validation modes: direct response + network interception
- ✅ Use `route.continue()` to not block UI
- ✅ Detailed error messages with parameter diffs
- ✅ Automatic cleanup after validation

## Workflow 4: Integrate with Page Object

**File:** `pages/[feature].page.ts`

**Add imports:**
```typescript
import { APIResponse } from '@playwright/test';
import { [Feature]APIHelper } from '../api/[feature]-api.helper';
import { [Feature]ValidatorHelper } from '../api/[feature]-validator.helper';
```

**Add properties:**
```typescript
private [feature]API: [Feature]APIHelper;
private [feature]Validator: [Feature]ValidatorHelper;
```

**Initialize in constructor:**
```typescript
constructor(page: Page) {
  super(page);
  // ... existing locators ...

  this.[feature]API = new [Feature]APIHelper(page);
  this.[feature]Validator = new [Feature]ValidatorHelper(page);
}
```

**Add API validation methods (after existing methods):**
```typescript
// ========================================
// API Validation Methods
// ========================================

/**
 * Perform [action] via API (bypasses UI)
 */
@step('[Action] via API: param1={param1}, param2={param2}')
async [action]ViaAPI(param1?: string, param2?: string): Promise<APIResponse> {
  return await this.[feature]API.[action]({ param1, param2 });
}

/**
 * Setup API request interception before UI action
 */
@step('Validate UI [action] triggers correct API')
async validateUI[Action]API(param1?: string, param2?: string): Promise<void> {
  await this.[feature]Validator.startInterception();
}

/**
 * Validate intercepted API request after UI action
 */
@step('Confirm API request matches params')
async confirmAPIRequest(param1?: string, param2?: string): Promise<void> {
  await this.[feature]Validator.validateInterceptedRequest({ param1, param2 });
}

/**
 * Validate API response directly
 */
@step('Validate API response')
async validateAPIResponse(
  response: APIResponse,
  param1?: string,
  param2?: string
): Promise<void> {
  await this.[feature]Validator.validateResponse(response, { param1, param2 });
}
```

## Error Handling Patterns

### Missing Mapping Error Template

```typescript
throw new Error(
  `[Type] mapping not found for: "${value}".\n` +
  `Add mapping to api/mappings/[type]-mappings.ts\n\n` +
  `To find the mapping:\n` +
  `1. Open browser DevTools → Network tab\n` +
  `2. Select "${value}" in UI\n` +
  `3. Observe request to [endpoint]\n` +
  `4. Record [param_name] parameter`
);
```

### Parameter Mismatch Error Template

```typescript
throw new Error(
  `API request parameters do not match expected values:\n` +
  `  - ${differences.join('\n  - ')}\n\n` +
  `Actual params: ${JSON.stringify(actualParams)}\n` +
  `Expected params: ${JSON.stringify(expectedParams)}`
);
```

## Testing Patterns

### Direct API Test

```typescript
test('API returns correct results', async ({ page }) => {
  const featurePage = new FeaturePage(page);

  const response = await featurePage.[action]ViaAPI('value1', 'value2');
  await featurePage.validateAPIResponse(response, 'value1', 'value2');
});
```

### Hybrid UI + API Test

```typescript
test('UI triggers correct API', async ({ page }) => {
  const featurePage = new FeaturePage(page);

  await featurePage.navigate();
  await featurePage.handleCookieConsent();

  // Setup interception BEFORE UI action
  await featurePage.validateUI[Action]API('value1', 'value2');

  // Perform UI action
  await featurePage.doUIAction();

  // Validate intercepted request AFTER UI action
  await featurePage.confirmAPIRequest('value1', 'value2');
});
```

## TypeScript Interface Patterns

**File:** `utils/api-types.ts`

```typescript
// UI-level parameters (friendly names)
export interface [Feature]Parameters {
  param1?: string;  // UI label
  param2?: string;  // UI label
}

// API-level parameters (IDs and codes)
export interface [Feature]APIParams {
  api_param1?: number;    // API ID
  api_param2?: string;    // API code
  // Default params
  summary?: number;
  country?: string;
  country_id?: string;
}

// Mapping structures
export interface [Type]Mapping {
  label: string;
  [api_field]: number | string;
}
```

## Common Tasks Quick Reference

### Task: Add category mapping from cURL

1. Extract `cat_id` and `meta_code` from cURL
2. Confirm UI label with user
3. Add to `api/mappings/category-mappings.ts`:
   ```typescript
   'Category Name': {
     label: 'Category Name',
     cat_id: [number],
     meta_code: '[string]',
   },
   ```
4. Run `npx tsc --noEmit` to verify

### Task: Add location mapping from cURL

1. Extract `geo_id` from cURL
2. Confirm location name with user
3. Add to `api/mappings/location-mappings.ts`:
   ```typescript
   'Location Name': {
     label: 'Location Name',
     geo_id: [number],
   },
   ```
4. Run `npx tsc --noEmit` to verify

### Task: Create test with API validation

1. Import page object in test
2. For direct API: call `[action]ViaAPI()` then `validateAPIResponse()`
3. For hybrid: call `validateUI[Action]API()` → do UI action → call `confirmAPIRequest()`

## Verification Checklist

After implementing API validation:

- [ ] TypeScript compiles: `npx tsc --noEmit`
- [ ] All public methods have `@step` decorator
- [ ] Error messages are descriptive with instructions
- [ ] Mappings follow naming conventions (case-sensitive)
- [ ] Helper classes use `page.request` not separate context
- [ ] Network interception uses `route.continue()` (doesn't block)
- [ ] Tests pass: `npm test -- [test-file].spec.ts`
- [ ] @step annotations visible in HTML report

## Key Principles

1. **Type Safety**: Always define interfaces in `api-types.ts` first
2. **Separation of Concerns**: Helpers make requests, validators validate
3. **Helpful Errors**: Guide users to discover missing mappings
4. **@step Decorators**: All public methods for test reporting
5. **Parameter Injection**: Use `{paramName}` in step descriptions
6. **No Breaking Changes**: API validation is opt-in, existing tests unaffected
7. **Case Sensitivity**: Mapping keys must match exact UI labels

## Examples

See working examples in:
- `tests/e2e/examples/api-direct.spec.ts` - Direct API testing
- `tests/e2e/examples/api-hybrid.spec.ts` - UI + API validation
- `api/search-api.helper.ts` - Reference implementation
- `api/search-validator.helper.ts` - Validator reference
