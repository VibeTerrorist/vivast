import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/login.page';
import { HomePage } from '../../pages/home.page';
import { testCredentials } from '../../utils/env';

test.describe('Account Tests', () => {
  let homePage: HomePage;
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    loginPage = new LoginPage(page);

    await homePage.navigate();
    await homePage.handleCookieConsent();
  });

  test('FAILS - Login with invalid credentials shows error message', async ({ page }) => {
    await homePage.clickMyAccount();
    await loginPage.enterEmail(testCredentials.invalid.email);
    await loginPage.enterPassword(testCredentials.invalid.password);
    await loginPage.checkCaptcha();
    await loginPage.clickLoginButton();
    await loginPage.verifyLoginErrorDisplayed();
    await loginPage.verifyErrorMessage('The login information you entered is incorrect');
  });
});
