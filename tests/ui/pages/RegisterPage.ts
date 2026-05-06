import { expect, type Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class RegisterPage extends BasePage {
  private readonly emailInput: Locator = this.page.getByLabel('Email');
  private readonly passwordInput: Locator = this.page.locator('#password');
  private readonly confirmPasswordInput: Locator = this.page.locator('#confirmPassword');
  private readonly createAccountButton: Locator = this.page.getByRole('button', { name: 'Create an account' });
  private readonly passwordMismatchError: Locator = this.page.getByText("Passwords don't match");
  private readonly shortPasswordError: Locator = this.page.getByText('Password must be at least 8 characters long');
  private readonly invalidEmailError: Locator = this.page.getByText('Invalid email address');

  async open(): Promise<void> {
    await super.open('/auth/register');
  }

  async fillEmail(email: string): Promise<void> {
    await this.emailInput.fill(email);
  }

  async fillPassword(password: string): Promise<void> {
    await this.passwordInput.fill(password);
  }

  async fillConfirmPassword(confirmPassword: string): Promise<void> {
    await this.confirmPasswordInput.fill(confirmPassword);
  }

  async submit(): Promise<void> {
    await this.createAccountButton.click();
  }

  async register(email: string, password: string, confirmPassword: string): Promise<void> {
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.fillConfirmPassword(confirmPassword);
    await this.submit();
  }

  async expectPasswordMismatchError(): Promise<void> {
    await expect(this.passwordMismatchError).toBeVisible();
  }

  async expectShortPasswordError(): Promise<void> {
    await expect(this.shortPasswordError).toBeVisible();
  }

  async expectInvalidEmailError(): Promise<void> {
    await expect(this.invalidEmailError).toBeVisible();
  }

  async expectEmailMarkedInvalidByBrowser(): Promise<void> {
    const isValid = await this.emailInput.evaluate(
      (el) => (el as HTMLInputElement).checkValidity()
    );
    expect(isValid).toBeFalsy();
  }
}
