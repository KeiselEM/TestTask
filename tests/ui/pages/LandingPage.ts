import { expect, type Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class LandingPage extends BasePage {
  private readonly title: Locator = this.page.getByRole('heading', { name: 'Personal Todo List Application' });
  private readonly loginButton: Locator = this.page.getByRole('button', { name: 'Login' });
  private readonly registerButton: Locator = this.page.getByRole('button', { name: 'Register' });

  async open(): Promise<void> {
    await super.open('/');
  }

  async expectMainContent(): Promise<void> {
    await expect(this.title).toBeVisible();
    await expect(this.loginButton).toBeVisible();
    await expect(this.registerButton).toBeVisible();
  }
}
