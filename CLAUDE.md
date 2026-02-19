# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

## ⚠️ Maintaining This File

**Only add actionable instructions that cannot be inferred from the codebase.**

❌ Do NOT add:
- Example code that mirrors existing files
- Generic Playwright/npm commands
- Configuration values already in config files
- Explanations of benefits ("saves space", "more resilient")
- Documentation of what exists (file trees, API lists)

✅ DO add:
- Project-specific patterns and conventions
- Decision rules and priorities
- Mandatory requirements
- Non-obvious workflows

## Project Overview

Playwright-based test automation framework for Vivastreet.co.uk classifieds marketplace with 3-layer architecture.

## Core Architecture: 3-Layer Pattern

**Strict layering - each layer has single responsibility:**

```
Layer 3: Test Specs (tests/e2e/*.spec.ts)
    ↓ Uses natural language methods
Layer 2: Page Objects (pages/*.page.ts)
    ↓ Uses @step decorators + constructor locators
Layer 1: Base Utilities (utils/*.ts, pages/base.page.ts)
```

**Requirements:**
- Tests (Layer 3) must read like natural language specifications
- Page objects (Layer 2) must use `@step` decorator on all public methods
- Prioritize semantic locators over implementation details

## @step Decorator Pattern

**Mandatory for all page object methods.**

```typescript
import { step } from '../utils/step-decorator';

@step()  // Auto-generates: "ClassName.methodName"
async search(query: string) { ... }

@step("Search for {query} in {location}")  // Custom with params
async searchWithLocation(query: string, location: string) { ... }
```

**Implementation:**
- Modern TypeScript 5+ decorator API (no tsconfig flags needed)
- Boxing enabled for error reporting
- Parameter injection: `{paramName}` syntax

## Playwright Semantic Locators

**Priority order (use highest available):**

1. **Test IDs (highest priority):** `getByTestId('value')`
2. `getByRole('button', { name: 'Submit' })`
3. `getByLabel('Email')`, `getByPlaceholder('...')`
4. `getByText('Welcome')`, `getByTitle('...')`
5. **CSS/XPath (last resort):** `locator('#id')` - only for stable third-party IDs

**Project-Specific Test ID Configuration:**
- This project uses `data-automation` as the custom test ID attribute
- Configured in `playwright.config.ts`: `testIdAttribute: 'data-automation'`
- Always use `page.getByTestId('value')` instead of `page.locator('[data-automation="value"]')`

```typescript
// ✅ Correct - use getByTestId
readonly loginButton = page.getByTestId('urD_Login');

// ❌ Wrong - don't use locator for data-automation
readonly loginButton = page.locator('[data-automation="urD_Login"]');
```

**MANDATORY: `// Update with TestID` Comment Rule**

**ANY locator using `locator()` method MUST have the `// Update with TestID` comment.**

```typescript
// ✅ ALWAYS add comment when using locator() method
readonly element = page.locator('.class-name');              // Update with TestID
readonly alert = page.locator('[role="alert"].bg-error');    // Update with TestID
readonly card = page.locator('li.classified.row1');          // Update with TestID

// ❌ NEVER omit the comment when using locator()
readonly element = page.locator('.class-name');              // WRONG - missing comment

// ✅ No comment needed for semantic methods
readonly button = page.getByTestId('submit');                // No comment needed
readonly link = page.getByRole('link', { name: 'Home' });    // No comment needed
```

**Exception:** Stable third-party IDs (OneTrust, Stripe, etc.) don't need the comment.

## Page Object Pattern

**All page objects must:**

1. Extend `BasePage` from `pages/base.page.ts`
2. Implement abstract `navigate()` method
3. Use `@step` decorator on all public methods
4. Define locators in constructor using `readonly` properties
5. Use Playwright semantic locators (see priority order above)
6. Call `handleCookieConsent()` if navigating to a new page

**Constructor pattern (required):**

```typescript
import { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';

export class SearchPage extends BasePage {
  readonly searchInput: Locator;
  readonly searchButton: Locator;

  constructor(page: Page) {
    super(page);
    this.searchInput = page.getByPlaceholder('Search...');
    this.searchButton = page.getByRole('button', { name: 'Search' });
  }

  @step('Search for {query}')
  async search(query: string): Promise<void> {
    await this.searchInput.fill(query);
    await this.searchButton.click();
  }
}
```

## Cookie Consent & Adult Disclaimer

- Cookie consent: Auto-handled by `BasePage.handleCookieConsent()`
- Adult disclaimer: Use `BasePage.handleAdultDisclaimer('Agree' | 'Disagree')`
- Both have graceful fallbacks if not present

## Test Fixtures

Two patterns available:

1. **Standard:** `import { test, expect } from '@playwright/test';`
2. **Auto-cookie-handling:** `import { test, expect } from '../fixtures/page-fixtures';`
   - Automatically navigates to `/` and handles cookies before each test

## Adding New Tests

1. Inspect UI to identify elements and accessible names/roles
2. Create page object in `pages/` extending `BasePage`
3. Use semantic locators in constructor (see priority order)
4. Add `@step` decorators to all public methods
5. Write test spec in `tests/e2e/` using page object methods
6. Run: `npm test -- your-test.spec.ts --headed`

**Tip:** `npx playwright codegen https://www.vivastreet.co.uk` to explore locators

## CI/CD

Tests run automatically on:
- Push to `main` or `develop` branches
- Pull requests to `main`
- Daily at midnight (scheduled)

Artifacts retained for 7 days. HTML reports auto-deployed to GitHub Pages.
