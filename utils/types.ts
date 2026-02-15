import { Page } from '@playwright/test';

/**
 * Base page interface
 */
export interface IBasePage {
  page: Page;
  navigate(): Promise<void>;
}
