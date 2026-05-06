import { test } from '@playwright/test';
import { DashboardPage } from './pages/DashboardPage';
import { RegisterPage } from './pages/RegisterPage';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { authenticateToDashboard } from './helpers/auth';

test.describe('Dashboard suite by test design techniques', () => {
  test('[Smoke] authenticated user sees core dashboard controls', async ({ page }) => {
    const registerPage = new RegisterPage(page);
    const dashboardPage = new DashboardPage(page);
    const loginPage = new LoginPage(page);

    await authenticateToDashboard(registerPage, dashboardPage, loginPage);
  });

  test('[Positive + State Transition] user creates a task and sees it in board', async ({ page }) => {
    const registerPage = new RegisterPage(page);
    const dashboardPage = new DashboardPage(page);
    const loginPage = new LoginPage(page);

    const title = `task-${Date.now()}`;

    await authenticateToDashboard(registerPage, dashboardPage, loginPage);
    await dashboardPage.openCreateTaskDialog();
    await dashboardPage.expectCreateTaskDialogOpen();
    await dashboardPage.createTask({ title });
    await dashboardPage.expectTaskVisible(title);
  });

  test('[Decision Table] task can be created with optional description', async ({ page }) => {
    const registerPage = new RegisterPage(page);
    const dashboardPage = new DashboardPage(page);
    const loginPage = new LoginPage(page);

    const title = `task-with-description-${Date.now()}`;
    const description = `description-${Date.now()}`;

    await authenticateToDashboard(registerPage, dashboardPage, loginPage);
    await dashboardPage.openCreateTaskDialog();
    await dashboardPage.createTask({ title, description });
    await dashboardPage.expectTaskVisible(title);
    await dashboardPage.expectTaskDescriptionVisible(description);
  });

  test('[Boundary Value] create task rejects empty title', async ({ page }) => {
    const registerPage = new RegisterPage(page);
    const dashboardPage = new DashboardPage(page);
    const loginPage = new LoginPage(page);

    await authenticateToDashboard(registerPage, dashboardPage, loginPage);
    await dashboardPage.openCreateTaskDialog();
    await dashboardPage.submitCreateTaskWithoutTitle();
    await dashboardPage.expectCreateTaskDialogOpen();
  });

  test('[Negative] cancel in create task dialog does not create a task', async ({ page }) => {
    const registerPage = new RegisterPage(page);
    const dashboardPage = new DashboardPage(page);
    const loginPage = new LoginPage(page);

    const title = `cancelled-task-${Date.now()}`;

    await authenticateToDashboard(registerPage, dashboardPage, loginPage);
    await dashboardPage.openCreateTaskDialog();
    await dashboardPage.expectCreateTaskDialogOpen();
    await dashboardPage.fillTaskDraft({ title });
    await dashboardPage.cancelCreateTaskDialog();
    await dashboardPage.expectTaskNotVisible(title);
  });

  test('[Security/AuthZ] logout drops authenticated state and returns to public area', async ({ page }) => {
    const registerPage = new RegisterPage(page);
    const dashboardPage = new DashboardPage(page);
    const landingPage = new LandingPage(page);
    const loginPage = new LoginPage(page);

    await authenticateToDashboard(registerPage, dashboardPage, loginPage);
    await dashboardPage.logout();
    await landingPage.expectMainContent();
  });
});
