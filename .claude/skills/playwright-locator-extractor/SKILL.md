# Playwright Locator Extractor

Extract Playwright locators from HTML code following best practices and priority order.

## Trigger Patterns

Use this skill when:
- "extract locators from html"
- "get playwright selectors"
- "create locators for"
- "find best locator"
- "convert html to locators"
- User provides HTML code and asks for locators

## Instructions

When extracting locators from HTML code, follow this systematic approach:

### 1. Priority Order for Locator Selection

Always prefer locators in this order (highest priority first):

1. **Test IDs** (`getByTestId`) - Highest priority, most stable for test automation
2. **Role-based** (`getByRole`) - Resilient, matches how users and assistive technology perceive the page
3. **Label-based** (`getByLabel`, `getByPlaceholder`) - Good for form elements
4. **Text-based** (`getByText`, `getByTitle`) - For elements with visible text
5. **CSS/XPath** (`locator('css=...')`) - Last resort only

**Project-Specific Configuration:**
- This project uses `data-automation` as the custom test ID attribute
- Configured in `playwright.config.ts` with `testIdAttribute: 'data-automation'`
- Always use `page.getByTestId('value')` instead of `page.locator('[data-automation="value"]')`

**MANDATORY RULE - `// Update with TestID` Comment:**

**Any locator using the `locator()` method MUST have the `// Update with TestID` comment.**

This applies to ALL of these cases:
```typescript
// ✅ ALWAYS add comment when using locator() method
page.locator('.class-name')                    // Update with TestID
page.locator('#element-id')                    // Update with TestID
page.locator('[role="alert"].bg-error')        // Update with TestID
page.locator('li.classified.row1')             // Update with TestID
page.locator('input[type="checkbox"]')         // Update with TestID

// ❌ NEVER omit the comment when using locator()
page.locator('.class-name')                    // WRONG - missing comment
page.locator('[role="alert"].bg-error')        // WRONG - missing comment

// ✅ No comment needed for semantic methods
page.getByTestId('element')                    // No comment needed
page.getByRole('button', { name: 'Submit' })   // No comment needed
page.getByLabel('Email')                       // No comment needed
```

**Exception:** Only stable third-party IDs (OneTrust, Stripe, etc.) are exempt from this rule:
```typescript
page.locator('#onetrust-accept-btn-handler')   // OK - stable third-party ID
page.locator('#stripe-card-element')           // OK - stable third-party ID
```

### 2. Analysis Process

For each HTML element provided:

1. **Identify the element type** (button, input, link, heading, etc.)
2. **Check for ARIA attributes** (role, aria-label, aria-labelledby)
3. **Look for visible text content**
4. **Check for stable attributes** (id, data-testid, name)
5. **Consider parent-child relationships** for uniqueness

### 3. Locator Extraction Rules

#### Buttons
```typescript
// HTML: <button>Submit</button>
page.getByRole('button', { name: 'Submit' })

// HTML: <button aria-label="Close dialog">×</button>
page.getByRole('button', { name: 'Close dialog' })

// HTML: <button id="submit-btn">Submit</button>
// If role is available, prefer: page.getByRole('button', { name: 'Submit' })
// Fallback: page.locator('#submit-btn')
```

#### Links
```typescript
// HTML: <a href="/home">Home</a>
page.getByRole('link', { name: 'Home' })

// HTML: <a href="/about">Learn More</a>
page.getByRole('link', { name: 'Learn More' })
```

#### Form Elements
```typescript
// HTML: <input type="text" placeholder="Enter email">
page.getByPlaceholder('Enter email')

// HTML: <input type="text" aria-label="Email address">
page.getByLabel('Email address')

// HTML: <label for="email">Email</label><input id="email" type="text">
page.getByLabel('Email')

// HTML: <input type="checkbox" aria-label="Remember me">
page.getByRole('checkbox', { name: 'Remember me' })

// HTML: <select name="country">...</select> with label
page.getByRole('combobox', { name: 'Country' })

// HTML: <input type="radio" value="option1" aria-label="Option 1">
page.getByRole('radio', { name: 'Option 1' })
```

#### Headings
```typescript
// HTML: <h1>Welcome</h1>
page.getByRole('heading', { name: 'Welcome', level: 1 })

// HTML: <h2>Section Title</h2>
page.getByRole('heading', { name: 'Section Title', level: 2 })
```

#### Lists and Items
```typescript
// HTML: <ul><li>Item 1</li><li>Item 2</li></ul>
page.getByRole('list').getByRole('listitem')
page.getByRole('listitem').filter({ hasText: 'Item 1' })
```

#### Navigation Elements
```typescript
// HTML: <nav>...</nav>
page.getByRole('navigation')

// HTML: <main>...</main>
page.getByRole('main')

// HTML: <dialog>...</dialog>
page.getByRole('dialog')

// HTML: <div role="alert">Error message</div>
page.getByRole('alert')
```

#### Text Content
```typescript
// HTML: <div>Welcome to our site</div>
page.getByText('Welcome to our site')
page.getByText(/welcome/i) // case-insensitive regex
page.getByText('Welcome', { exact: true }) // exact match only
```

#### Test IDs
```typescript
// HTML: <button data-testid="submit-btn">Submit</button>
page.getByTestId('submit-btn')

// HTML: <button data-automation="urD_Login">Login</button>
// This project uses data-automation as custom test ID attribute:
page.getByTestId('urD_Login')

// ❌ Don't use locator() for data-automation attributes
page.locator('[data-automation="urD_Login"]') // Bad

// ✅ Always use getByTestId() instead
page.getByTestId('urD_Login') // Good
```

#### CSS/XPath Locators (Last Resort)
```typescript
// HTML: <button id="onetrust-accept-btn-handler">Accept</button>
// For stable third-party IDs (like OneTrust, Stripe, etc.):
page.locator('#onetrust-accept-btn-handler')

// HTML: <div class="modal-content">...</div>
// Avoid if possible, use only when no semantic alternative exists:
page.locator('.modal-content') // Update with TestID

// HTML: <button class="btn-login">Login</button>
// Mark for future improvement with TestID:
page.locator('.btn-login') // Update with TestID
```

**Important:** Always add `// Update with TestID` comment when using CSS/XPath locators to make them easy to find and replace later when test IDs are added.

### 4. Filtering and Chaining

When multiple elements match, use filters:

```typescript
// Filter by text
page.getByRole('listitem').filter({ hasText: 'Product' })

// Filter by NOT having text
page.getByRole('listitem').filter({ hasNotText: 'Out of stock' })

// Filter by child element
page.getByRole('listitem').filter({
  has: page.getByRole('button', { name: 'Buy' })
})

// Chaining
page.getByRole('article').getByRole('heading')

// Position-based (avoid when possible)
page.getByRole('listitem').first()
page.getByRole('listitem').last()
page.getByRole('listitem').nth(2) // 0-indexed
```

### 5. Special Cases

#### Shadow DOM
```typescript
// Playwright pierces shadow DOM automatically
page.getByRole('button', { name: 'Shadow Button' })

// Explicit shadow DOM traversal (rarely needed):
page.locator('my-component').locator('internal:shadow=button')
```

#### Iframes
```typescript
// HTML: <iframe name="content">...</iframe>
const frame = page.frameLocator('iframe[name="content"]')
await frame.getByRole('button').click()

// By index
const frame = page.frameLocator('iframe').first()

// Nested iframes
const nestedFrame = page.frameLocator('#outer').frameLocator('#inner')
```

#### Dynamic Content
```typescript
// Wait for specific state
await page.getByRole('button').waitFor({ state: 'visible' })
await page.getByText('Loading').waitFor({ state: 'hidden' })

// Wait for count
await expect(page.getByRole('listitem')).toHaveCount(5)

// Get all matching elements
const items = await page.getByRole('listitem').all()
```

### 6. Output Format

For each HTML element, provide:

1. **Primary locator** (following priority order)
2. **Alternative locator(s)** (fallback options)
3. **Brief explanation** of why this locator was chosen
4. **Code example** in TypeScript

Example output format:

```typescript
// HTML: <button id="submit-btn" aria-label="Submit form">Submit</button>

// Primary (most resilient):
page.getByRole('button', { name: 'Submit form' })

// Alternative (if aria-label is removed):
page.getByRole('button', { name: 'Submit' })

// Fallback (if text changes):
page.locator('#submit-btn')

// Reason: Using getByRole with aria-label provides the most resilient
// selector that matches how assistive technology and users perceive the button.
```

### 7. Anti-Patterns to Avoid

❌ **Don't use**: Brittle CSS class selectors without TestID fallback comment
```typescript
// Bad (no comment)
page.locator('.btn-primary')

// Better (marked for improvement)
page.locator('.btn-primary') // Update with TestID

// Best (use test ID or semantic locator)
page.getByTestId('submit-btn')
page.getByRole('button', { name: 'Submit' })
```

❌ **Don't use**: Dynamic IDs without context
```typescript
// Bad
page.locator('#dynamic-id-123')
// Good
page.getByRole('button', { name: 'Submit' })
```

❌ **Don't use**: Complex XPath
```typescript
// Bad
page.locator('xpath=//div[@class="container"]//button[1]')
// Good
page.getByRole('main').getByRole('button').first()
```

❌ **Don't test**: Implementation details
```typescript
// Bad - testing internal structure
page.locator('div.internal-wrapper > span.text-content')
// Good - testing user-visible behavior
page.getByText('Expected content')
```

### 8. Best Practices Checklist

When extracting locators, ensure:

- ✅ **Prioritize test IDs first** (highest priority for test automation)
- ✅ **MANDATORY: Add `// Update with TestID` comment to EVERY locator using `locator()` method** (except stable third-party IDs)
- ✅ Provide at least 2 alternative locators for resilience
- ✅ Use case-insensitive regex for text when appropriate
- ✅ Consider accessibility (how screen readers perceive it)
- ✅ Avoid position-based selectors (nth, first, last) unless necessary
- ✅ Use filter() for disambiguation instead of complex selectors
- ✅ Include comments explaining the locator strategy
- ✅ Test that locators are unique and stable

## Examples

### Example 1: Cookie Consent Banner

**Input HTML:**
```html
<button id="onetrust-accept-btn-handler">Accept All</button>
<button id="onetrust-reject-all-handler">Accept Necessary Only</button>
<button id="onetrust-pc-btn-handler" aria-label="Manage, Opens the preference center dialog">Manage</button>
```

**Output:**
```typescript
// Accept All Button
// Primary: Use text-based locator (most readable)
page.getByRole('button', { name: 'Accept All' })

// Alternative: OneTrust standard ID (stable across sites)
page.locator('#onetrust-accept-btn-handler')

// Reason: Role + text is most resilient. ID is stable but less semantic.

// Reject Button
page.getByRole('button', { name: 'Accept Necessary Only' })
page.locator('#onetrust-reject-all-handler')

// Manage Button
// Primary: Use aria-label (most accessible)
page.getByRole('button', { name: /Manage/i })

// Alternative: ID fallback
page.locator('#onetrust-pc-btn-handler')

// Reason: aria-label provides accessible name, regex allows partial match.
```

### Example 2: Search Form

**Input HTML:**
```html
<form>
  <label for="search-input">Search products</label>
  <input id="search-input" type="text" placeholder="Enter product name">
  <button type="submit">Search</button>
</form>
```

**Output:**
```typescript
// Search Input
// Primary: Use label association (most semantic)
page.getByLabel('Search products')

// Alternative: Use placeholder
page.getByPlaceholder('Enter product name')

// Alternative: Use ID (least preferred)
page.locator('#search-input')

// Search Button
// Primary: Use role + text
page.getByRole('button', { name: 'Search' })

// Alternative: Use type attribute
page.locator('button[type="submit"]')

// Reason: Label association is most accessible and resilient to UI changes.
```

### Example 3: Product List

**Input HTML:**
```html
<ul class="product-list">
  <li class="product-item">
    <h3>Laptop</h3>
    <span class="price">£999</span>
    <button>Buy Now</button>
  </li>
  <li class="product-item">
    <h3>Phone</h3>
    <span class="price">£599</span>
    <button>Buy Now</button>
  </li>
</ul>
```

**Output:**
```typescript
// Product List
page.getByRole('list')

// All Product Items
page.getByRole('listitem')

// Specific Product by Name
page.getByRole('listitem').filter({ hasText: 'Laptop' })

// Product with "Buy Now" button
page.getByRole('listitem').filter({
  has: page.getByRole('button', { name: 'Buy Now' })
})

// Heading within specific product
page.getByRole('listitem')
  .filter({ hasText: 'Laptop' })
  .getByRole('heading', { level: 3 })

// Price for specific product
page.getByRole('listitem')
  .filter({ hasText: 'Laptop' })
  .getByText('£999')

// Buy button for specific product
page.getByRole('listitem')
  .filter({ hasText: 'Laptop' })
  .getByRole('button', { name: 'Buy Now' })

// Reason: Using role + filtering creates maintainable selectors
// that work even if CSS classes change.
```

## Integration with Page Objects

After extracting locators, use them directly in page object methods:

```typescript
// In page object
import { BasePage } from './base.page';
import { step } from '../utils/step-decorator';

export class CookieConsentPage extends BasePage {
  @step('Accept all cookies')
  async acceptAll(): Promise<void> {
    try {
      // Primary: semantic locator
      await this.page.getByRole('button', { name: 'Accept All' }).click({ timeout: 3000 });
    } catch {
      // Fallback: stable third-party ID
      await this.page.locator('#onetrust-accept-btn-handler').click({ timeout: 3000 });
    }
  }

  @step('Reject all cookies')
  async rejectAll(): Promise<void> {
    await this.page.getByRole('button', { name: 'Accept Necessary Only' }).click();
  }

  @step('Open cookie preferences')
  async openPreferences(): Promise<void> {
    await this.page.getByRole('button', { name: /Manage/i }).click();
  }
}
```

**Best Practice:** Use semantic locators directly in page objects. No selector registry needed - the locator methods are already self-documenting and type-safe.

## Output Format

Provide extracted locators in this format:

```typescript
// ========================================
// Element: [Description]
// HTML: [Original HTML snippet]
// ========================================

// Primary Locator (Priority 1):
[locator code]

// Alternative Locator (Priority 2):
[locator code]

// Fallback Locator (Priority 3):
[locator code]

// Reasoning:
[Why this locator strategy was chosen]

// Usage Example:
[Code example showing how to use in a test]

// ========================================
```

## Common Issues and Solutions

| Issue | Solution |
|-------|----------|
| Multiple matches | Use `.filter()` with `hasText` or `has` |
| No semantic attributes | Request data-testid from developers |
| Dynamic IDs | Use role, text, or test-id instead |
| Element not visible | Check for hidden state or wait conditions |
| Case sensitivity | Use regex with `i` flag: `/text/i` |
| Partial text match | Use `getByText('partial', { exact: false })` |

## Summary

This skill helps extract robust Playwright locators that:
- Prioritize accessibility and semantics
- Provide fallback strategies for resilience
- Follow Playwright best practices
- Create maintainable test automation
- Match how users interact with the page

Always prefer user-facing locators over implementation details.
