# Vivastreet Test Automation Framework

Playwright-based test automation for Vivastreet.co.uk classifieds marketplace.

## Installation

### Prerequisites
- Node.js 20+
- npm

### Setup

```bash
# Clone the repository
cd vivast

# Install dependencies
npm install

# Install Playwright browsers
npx playwright install chromium firefox

# Configure test credentials
cp .env.example .env
# Edit .env and add your valid test account credentials
```

## Running Tests

### Local Execution

```bash
# Run all tests headless (default)
npm test

# Run tests with browser visible (headed mode)
npm run test:headed

# Interactive UI mode (recommended for development)
npm run test:ui

# Debug mode with DevTools
npm run test:debug
```

### Specific Browsers

```bash
npm run test:chromium    # Chromium only
npm run test:firefox     # Firefox only
```

### Single Test File

```bash
# Headless
npm test -- ad-search.spec.ts

# Headed
npm test -- ad-search.spec.ts --headed

# Specific test by name
npm test -- --grep "should open page"
```

## Stability Tactics

### Selector Strategy

**Priority order (most resilient first):**
1. **Semantic locators** - `getByRole()`, `getByLabel()`, `getByText()`
2. **Test attributes** - `data-automation` attributes
3. **Stable IDs** - Only for third-party components (OneTrust)
4. **CSS/XPath** - Last resort

### Wait Strategy

- **Action auto-waiting:** Playwright waits automatically before actions (enabled by default)
- **Navigation waits:** Explicit `waitForURL()` for page transitions
- **Custom waits:** 500ms delays for form inputs to prevent data removal
- **Timeouts configured:**
  - Test: 60s
  - Expect: 10s
  - Action: 15s
  - Navigation: 30s

### Retry Strategy

- **Local:** 0 retries (fail fast for debugging)
- **CI:** 2 retries (handle network/timing flakiness)
- **Parallel execution:** Enabled (`fullyParallel: true`)

### Error Handling

- **Cookie consent:** Auto-handled with graceful fallback if not present
- **Adult disclaimer:** Auto-handled with configurable Agree/Disagree
- **CAPTCHA:** Attempted with try-catch, graceful skip if not present. This solution did not work and I decided to pretend it is a design choice. It will be used to demostrate how failed tests are shown in the GitHub Actions.
- **Step decorator:** All page object methods wrapped for clear failure reporting and overall test scripts readability.

## Architecture

**3-Layer Pattern:**
```
Layer 3: Test Specs (tests/e2e/*.spec.ts)
    ↓ Uses natural language methods
Layer 2: Page Objects (pages/*.page.ts)
    ↓ Uses @step decorators
Layer 1: Base Utilities (utils/*.ts, pages/base.page.ts)
```

**Key principles:**
- Tests read like specifications
- Page objects encapsulate page interactions
- Constructor pattern for locators for ease of maintenance
- All public methods use `@step` decorator

## CI/CD

Tests run automatically on:
- Push to `main` or `develop` branches
- Pull requests to `main`
- Daily at midnight (scheduled)

Results and artifacts retained for 7 days.

Primitive reporting works via automatic upload of HTML report to GitHub Pages.

## Brief Notes

### Test Scenario Selection

Two search related scenarios were chosen because they cover the main user journeys of users looking for a service. The first test is a positive test case, while the second test is a negative test case verifying that marketplace correctly handles empty search results.
As requested both of these tests are read-only.

### What Was Not Automated and Why

I decided to leave login test failing since battle with cloudflare might have taken too much time and would require additional tools usage of which is unrealistic for a real test automation framework. CloudFlare provides a way to allow automation software via their own opensource solution Cloudflare Worker or a simple whitelist of IP addresses. However I don't think it is in scope of this task.

## AI usage disclaimer
AI was used for writing commentaries, formatting and structuring the README.md file, as well as for cleaning up the code and removing unnecessary comments and console.log statements used in the process of debugging. 
However I was trying to make this codebase readable not only for me and other developers, but also AI agents that can be used to speed up the development process and deal with the backlog of tests since it was mentioned as one of your main concerns during the interview.