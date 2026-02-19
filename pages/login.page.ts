import { expect, Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';
import { step } from '../utils/step-decorator';

/**
 * Login Page Object
 *
 * Represents the login/account page where users authenticate
 */
export class LoginPage extends BasePage {
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly captchaCheckbox: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.emailInput = page.getByTestId('urD_LoginEmailInput');
    this.passwordInput = page.getByTestId('urD_Password');
    this.loginButton = page.getByTestId('urD_Login');
    this.captchaCheckbox = page.locator('label.cb-lb input[type="checkbox"]'); // Update with TestID
    this.errorMessage = page.locator('[role="alert"].bg-error'); // Update with TestID
  }

  @step('Navigate to login page')
  async navigate(): Promise<void> {
    // Login page is reached by clicking "My Account" from homepage
    // This method is here to satisfy BasePage, but should not be called directly
    await this.page.goto('/account_classifieds.php');
    await this.waitForPageReady();
  }

  @step('Enter email: {email}')
  async enterEmail(email: string): Promise<void> {
    await this.page.waitForTimeout(500);
    await this.emailInput.fill(email);
  }

  @step('Enter password')
  async enterPassword(password: string): Promise<void> {
    await this.page.waitForTimeout(500);
    await this.passwordInput.fill(password);
  }

  @step('Check CAPTCHA')
  async checkCaptcha(): Promise<void> {
    try {
      await this.captchaCheckbox.check({ timeout: 5000 });
    } catch (error) {
      console.log('CAPTCHA not found or already solved');
    }
  }

  @step('Click login button')
  async clickLoginButton(): Promise<void> {
    await this.loginButton.waitFor({ state: 'visible' });
    await expect(this.loginButton).toBeEnabled({ timeout: 10000 });
    await this.loginButton.click();
  }

  @step('Verify login error is displayed')
  async verifyLoginErrorDisplayed(): Promise<void> {
    await expect(this.errorMessage).toBeVisible();
  }

  @step('Verify error message: {expectedMessage}')
  async verifyErrorMessage(expectedMessage: string): Promise<void> {
    await expect(this.errorMessage).toContainText(expectedMessage);
  }
}
