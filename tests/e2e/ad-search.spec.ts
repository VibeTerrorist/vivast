import { test, expect } from '@playwright/test';
import { HomePage } from '../../pages/home.page';
import { SearchResultsPage } from '../../pages/searchResults.page';
import { AdDetailsPage } from '../../pages/adDetails.page';

test.describe('Ad Search Tests', () => {
  let homePage: HomePage;
  let searchResultsPage: SearchResultsPage;
  let adDetailsPage: AdDetailsPage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    searchResultsPage = new SearchResultsPage(page);
    adDetailsPage = new AdDetailsPage(page);

    await homePage.navigate();
    await homePage.handleCookieConsent();
  });

  test('Searches for a product, opens it and reveals phone number', async ({ page }) => {
    await homePage.selectCategory('Escorts and Massages');
    await homePage.selectLocation('London');
    await homePage.clickSearch();
    await homePage.handleAdultDisclaimer('Agree');
    await searchResultsPage.verifySearchFilters('Escorts and Massages', 'London');
    await searchResultsPage.verifyHasResults();
    await searchResultsPage.clickSearchResult(1);
    await searchResultsPage.verifyOpenedAd();
    await adDetailsPage.clickPhoneNumber();
    await adDetailsPage.verifyPhoneNumberRevealed();
  });

  test('Searches for a service, uses unrealistic keywords, verifies no results found', async ({ page }) => {
    await homePage.selectCategory('Escorts and Massages');
    await homePage.clickSearch();
    await homePage.handleAdultDisclaimer('Agree');
    await searchResultsPage.verifySearchFilters('Escorts and Massages', '');
    await searchResultsPage.enterKeywords('unrealisticKeywords');
    await searchResultsPage.clickSearchButton();
    await searchResultsPage.verifyNoResults();
  })
});
