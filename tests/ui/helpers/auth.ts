import { DashboardPage } from '../pages/DashboardPage';
import { RegisterPage } from '../pages/RegisterPage';
import { LoginPage } from '../pages/LoginPage';

/**
 * Registers a fresh user account and navigates to the authenticated dashboard.
 * Falls back to login if the post-registration redirect does not happen.
 * Retries up to 3 times with unique accounts to avoid flakiness.
 */
export async function authenticateToDashboard(
  registerPage: RegisterPage,
  dashboardPage: DashboardPage,
  loginPage: LoginPage
): Promise<void> {
  const password = 'Password123';

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${attempt}`;
    const email = `qa+${unique}@example.com`;

    await registerPage.open();
    await registerPage.register(email, password, password);

    try {
      await dashboardPage.expectAuthenticatedArea();
      return;
    } catch {
      await loginPage.open();
      await loginPage.login(email, password);

      try {
        await dashboardPage.expectAuthenticatedArea();
        return;
      } catch {
        // Try with a fresh account on the next iteration.
      }
    }
  }

  throw new Error('Could not authenticate for dashboard tests after 3 attempts.');
}

export function uid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}


