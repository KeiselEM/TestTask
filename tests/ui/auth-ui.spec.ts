import { test } from '@playwright/test';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';

test.describe('UI auth suite by test design techniques', () => {
  test('[Smoke] public landing page has core entry points', async ({ page }) => {
    const landingPage = new LandingPage(page);

    await landingPage.open();
    await landingPage.expectMainContent();
  });

  test('[Negative] login with wrong credentials shows auth error', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.open();
    await loginPage.login(`qa+${Date.now()}@example.com`, 'wrong-password');
    await loginPage.expectInvalidCredentialsError();
  });

  test('[Equivalence Partitioning] login rejects invalid email format', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.open();
    await loginPage.login('invalid-email-format', 'Password123');
    await loginPage.expectEmailMarkedInvalidByBrowser();
  });

  test('[Boundary Value] login rejects empty password', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.open();
    await loginPage.fillEmail(`qa+${Date.now()}@example.com`);
    await loginPage.fillPassword('');
    await loginPage.submit();
    await loginPage.expectPasswordMarkedInvalidByBrowser();
  });

  test('[Decision Table] registration rejects mismatched passwords', async ({ page }) => {
    const registerPage = new RegisterPage(page);

    await registerPage.open();
    await registerPage.register(`qa+${Date.now()}@example.com`, 'Password123', 'Password321');
    await registerPage.expectPasswordMismatchError();
  });

  test('[Boundary Value] registration rejects short password (< 8)', async ({ page }) => {
    const registerPage = new RegisterPage(page);

    await registerPage.open();
    await registerPage.register(`qa+${Date.now()}@example.com`, 'Pass123', 'Pass123');
    await registerPage.expectShortPasswordError();
  });

  test('[Equivalence Partitioning] registration rejects invalid email format', async ({ page }) => {
    const registerPage = new RegisterPage(page);

    await registerPage.open();
    await registerPage.register('invalid-email', 'Password123', 'Password123');
    await registerPage.expectEmailMarkedInvalidByBrowser();
  });

  test('[State Transition] successful registration opens authenticated dashboard', async ({ page }) => {
    const registerPage = new RegisterPage(page);
    const dashboardPage = new DashboardPage(page);

    const email = `qa+${Date.now()}@example.com`;

    await registerPage.open();
    await registerPage.register(email, 'Password123', 'Password123');
    await dashboardPage.expectAuthenticatedArea();
  });

  test('[Security/AuthZ] unauthenticated access to dashboard keeps protected controls hidden', async ({ page }) => {
    const dashboardPage = new DashboardPage(page);

    await dashboardPage.open();
    await dashboardPage.expectProtectedControlsHidden();
  });
});
