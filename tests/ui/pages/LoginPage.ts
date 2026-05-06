import { expect, type Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  private readonly emailInput: Locator = this.page.getByLabel('Email');
  private readonly passwordInput: Locator = this.page.getByLabel('Password');
  private readonly loginButton: Locator = this.page.getByRole('button', { name: 'Login' });
  private readonly invalidCredentialsError: Locator = this.page.getByText('Invalid email or password.');
  private readonly emailValidationError: Locator = this.page.getByText('Invalid email address');
  private readonly passwordRequiredError: Locator = this.page.getByText('Password is required');

  async open(): Promise<void> {
    await super.open('/auth/login');
  }

  async fillEmail(email: string): Promise<void> {
    await this.emailInput.fill(email);
  }

  async fillPassword(password: string): Promise<void> {
    await this.passwordInput.fill(password);
  }

  async submit(): Promise<void> {
    await this.loginButton.click();
  }

  async login(email: string, password: string): Promise<void> {
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.submit();
  }

  async expectInvalidCredentialsError(): Promise<void> {
    await expect(this.invalidCredentialsError).toBeVisible();
  }

  async expectEmailValidationError(): Promise<void> {
    await expect(this.emailValidationError).toBeVisible();
  }

  async expectPasswordRequiredError(): Promise<void> {
    await expect(this.passwordRequiredError).toBeVisible();
  }

  async expectEmailMarkedInvalidByBrowser(): Promise<void> {
    const isValid = await this.emailInput.evaluate(
      (el) => (el as HTMLInputElement).checkValidity()
    );
    expect(isValid).toBeFalsy();
  }

  async expectPasswordMarkedInvalidByBrowser(): Promise<void> {
    const isValid = await this.passwordInput.evaluate(
      (el) => (el as HTMLInputElement).checkValidity()
    );
    expect(isValid).toBeFalsy();
  }
}
