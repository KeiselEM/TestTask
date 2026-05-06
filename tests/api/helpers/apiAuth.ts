import type { APIRequestContext } from '@playwright/test';
import { TaskApiClient } from '../clients/AuthApiClient';
import { RegisterPage } from '../../ui/pages/RegisterPage';
import { DashboardPage } from '../../ui/pages/DashboardPage';
import { LoginPage } from '../../ui/pages/LoginPage';
import type { Page } from '@playwright/test';

const DEFAULT_PASSWORD = 'Password123';

/**
 * Registers a fresh user via browser (sets session cookie on the page context),
 * then returns a TaskApiClient backed by page.request — which carries the cookie.
 */
export async function setupAuthenticatedApiContext(page: Page): Promise<{
  taskClient: TaskApiClient;
  email: string;
}> {
  const registerPage = new RegisterPage(page);
  const dashboardPage = new DashboardPage(page);
  const loginPage = new LoginPage(page);

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}-${attempt}`;
    const email = `qa+${unique}@example.com`;

    await registerPage.open();
    await registerPage.register(email, DEFAULT_PASSWORD, DEFAULT_PASSWORD);

    try {
      await dashboardPage.expectAuthenticatedArea();
      return { taskClient: new TaskApiClient(page.request), email };
    } catch {
      await loginPage.open();
      await loginPage.login(email, DEFAULT_PASSWORD);
      try {
        await dashboardPage.expectAuthenticatedArea();
        return { taskClient: new TaskApiClient(page.request), email };
      } catch {
        // retry
      }
    }
  }

  throw new Error('Could not authenticate API context after 3 attempts.');
}

export function apiUid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

