import { test } from '@playwright/test';
import { DashboardPage } from './pages/DashboardPage';
import { RegisterPage } from './pages/RegisterPage';
import { LoginPage } from './pages/LoginPage';
import { authenticateToDashboard, uid } from './helpers/auth';

test.describe('Task CRUD suite by test design techniques', () => {

  // ── Kanban board structure ─────────────────────────────────────────────────

  test('[Smoke] all four kanban columns are visible after login', async ({ page }) => {
    const registerPage = new RegisterPage(page);
    const dashboardPage = new DashboardPage(page);
    const loginPage = new LoginPage(page);

    await authenticateToDashboard(registerPage, dashboardPage, loginPage);
    await dashboardPage.expectKanbanColumnsVisible();
  });

  // ── Create ─────────────────────────────────────────────────────────────────

  test('[Positive] new task with title only appears in board', async ({ page }) => {
    const registerPage = new RegisterPage(page);
    const dashboardPage = new DashboardPage(page);
    const loginPage = new LoginPage(page);

    const title = `task-${uid()}`;

    await authenticateToDashboard(registerPage, dashboardPage, loginPage);
    await dashboardPage.openCreateTaskDialog();
    await dashboardPage.createTask({ title });
    await dashboardPage.expectTaskVisible(title);
  });

  test('[Decision Table] new task defaults to Medium priority and Backlog status', async ({ page }) => {
    const registerPage = new RegisterPage(page);
    const dashboardPage = new DashboardPage(page);
    const loginPage = new LoginPage(page);

    const title = `task-defaults-${uid()}`;

    await authenticateToDashboard(registerPage, dashboardPage, loginPage);
    await dashboardPage.openCreateTaskDialog();
    await dashboardPage.createTask({ title });
    await dashboardPage.expectPriorityLabelVisible(title, 'Medium');
    // NOTE: create schema does not include status — backend defaults to Backlog
    await dashboardPage.expectTaskStatusVisible(title, 'Backlog');
  });

  test('[Decision Table] task created with High priority shows High label', async ({ page }) => {
    const registerPage = new RegisterPage(page);
    const dashboardPage = new DashboardPage(page);
    const loginPage = new LoginPage(page);

    const title = `task-high-${uid()}`;

    await authenticateToDashboard(registerPage, dashboardPage, loginPage);
    await dashboardPage.openCreateTaskDialog();
    await dashboardPage.createTask({ title, priority: 'High' });
    await dashboardPage.expectPriorityLabelVisible(title, 'High');
  });

  test('[Decision Table] task created with Low priority shows Low label', async ({ page }) => {
    const registerPage = new RegisterPage(page);
    const dashboardPage = new DashboardPage(page);
    const loginPage = new LoginPage(page);

    const title = `task-low-${uid()}`;

    await authenticateToDashboard(registerPage, dashboardPage, loginPage);
    await dashboardPage.openCreateTaskDialog();
    await dashboardPage.createTask({ title, priority: 'Low' });
    await dashboardPage.expectPriorityLabelVisible(title, 'Low');
  });

  test('[Equivalence Partitioning] task created with description shows description on card', async ({ page }) => {
    const registerPage = new RegisterPage(page);
    const dashboardPage = new DashboardPage(page);
    const loginPage = new LoginPage(page);

    const title = `task-desc-${uid()}`;
    const description = `desc-${uid()}`;

    await authenticateToDashboard(registerPage, dashboardPage, loginPage);
    await dashboardPage.openCreateTaskDialog();
    await dashboardPage.createTask({ title, description });
    await dashboardPage.expectTaskDescriptionVisible(description);
  });

  test('[Boundary Value] task created without description shows no description block', async ({ page }) => {
    const registerPage = new RegisterPage(page);
    const dashboardPage = new DashboardPage(page);
    const loginPage = new LoginPage(page);

    const title = `task-nodesc-${uid()}`;
    const description = `must-not-appear-${uid()}`;

    await authenticateToDashboard(registerPage, dashboardPage, loginPage);
    await dashboardPage.openCreateTaskDialog();
    await dashboardPage.createTask({ title });
    await dashboardPage.expectTaskNotVisible(description);
  });

  test('[Boundary Value] creating task with empty title keeps dialog open', async ({ page }) => {
    const registerPage = new RegisterPage(page);
    const dashboardPage = new DashboardPage(page);
    const loginPage = new LoginPage(page);

    await authenticateToDashboard(registerPage, dashboardPage, loginPage);
    await dashboardPage.openCreateTaskDialog();
    await dashboardPage.submitCreateTaskWithoutTitle();
    await dashboardPage.expectCreateTaskDialogOpen();
  });

  test('[Negative] cancelling create dialog does not add a task to board', async ({ page }) => {
    const registerPage = new RegisterPage(page);
    const dashboardPage = new DashboardPage(page);
    const loginPage = new LoginPage(page);

    const title = `cancelled-${uid()}`;

    await authenticateToDashboard(registerPage, dashboardPage, loginPage);
    await dashboardPage.openCreateTaskDialog();
    await dashboardPage.fillTaskDraft({ title });
    await dashboardPage.cancelCreateTaskDialog();
    await dashboardPage.expectTaskNotVisible(title);
  });

  // ── Edit ───────────────────────────────────────────────────────────────────

  test('[Positive] editing task title updates it on the board', async ({ page }) => {
    const registerPage = new RegisterPage(page);
    const dashboardPage = new DashboardPage(page);
    const loginPage = new LoginPage(page);

    const original = `task-edit-${uid()}`;
    const updated = `task-edited-${uid()}`;

    await authenticateToDashboard(registerPage, dashboardPage, loginPage);
    await dashboardPage.openCreateTaskDialog();
    await dashboardPage.createTask({ title: original });
    await dashboardPage.expectTaskVisible(original);

    await dashboardPage.openEditDialog(original);
    await dashboardPage.expectEditTaskDialogOpen();
    await dashboardPage.editTaskTitle(updated);

    await dashboardPage.expectTaskVisible(updated);
    await dashboardPage.expectTaskNotVisible(original);
  });

  test('[State Transition] editing task status moves it to the correct column', async ({ page }) => {
    const registerPage = new RegisterPage(page);
    const dashboardPage = new DashboardPage(page);
    const loginPage = new LoginPage(page);

    const title = `task-status-${uid()}`;

    await authenticateToDashboard(registerPage, dashboardPage, loginPage);
    await dashboardPage.openCreateTaskDialog();
    await dashboardPage.createTask({ title });
    // backend defaults new tasks to Backlog
    await dashboardPage.expectTaskStatusVisible(title, 'Backlog');

    await dashboardPage.openEditDialog(title);
    await dashboardPage.editTaskStatus('In Progress');

    await dashboardPage.expectTaskStatusVisible(title, 'In Progress');
  });

  test('[State Transition] task can be moved from Todo to Done', async ({ page }) => {
    const registerPage = new RegisterPage(page);
    const dashboardPage = new DashboardPage(page);
    const loginPage = new LoginPage(page);

    const title = `task-done-${uid()}`;

    await authenticateToDashboard(registerPage, dashboardPage, loginPage);
    await dashboardPage.openCreateTaskDialog();
    await dashboardPage.createTask({ title });

    await dashboardPage.openEditDialog(title);
    await dashboardPage.editTaskStatus('Done');

    await dashboardPage.expectTaskStatusVisible(title, 'Done');
  });

  // ── Delete ─────────────────────────────────────────────────────────────────

  test('[Positive] deleted task disappears from the board', async ({ page }) => {
    const registerPage = new RegisterPage(page);
    const dashboardPage = new DashboardPage(page);
    const loginPage = new LoginPage(page);

    const title = `task-delete-${uid()}`;

    await authenticateToDashboard(registerPage, dashboardPage, loginPage);
    await dashboardPage.openCreateTaskDialog();
    await dashboardPage.createTask({ title });
    await dashboardPage.expectTaskVisible(title);

    await dashboardPage.deleteTask(title);
    await dashboardPage.expectTaskNotVisible(title);
  });

  test('[Negative] deleting one task does not remove other tasks', async ({ page }) => {
    const registerPage = new RegisterPage(page);
    const dashboardPage = new DashboardPage(page);
    const loginPage = new LoginPage(page);

    const keepTitle = `task-keep-${uid()}`;
    const deleteTitle = `task-delete-${uid()}`;

    await authenticateToDashboard(registerPage, dashboardPage, loginPage);

    await dashboardPage.openCreateTaskDialog();
    await dashboardPage.createTask({ title: keepTitle });

    await dashboardPage.openCreateTaskDialog();
    await dashboardPage.createTask({ title: deleteTitle });

    await dashboardPage.deleteTask(deleteTitle);

    await dashboardPage.expectTaskNotVisible(deleteTitle);
    await dashboardPage.expectTaskVisible(keepTitle);
  });
});


