import { expect, type Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class DashboardPage extends BasePage {
  private readonly heading: Locator = this.page.getByRole('heading', { name: 'Your Kanban Board' });
  private readonly logoutButton: Locator = this.page.getByRole('button', { name: 'Logout' });
  private readonly addTaskButton: Locator = this.page.getByRole('button', { name: 'Add New Task' });
  private readonly loginFormEmailInput: Locator = this.page.getByLabel('Email');
  private readonly loginFormPasswordInput: Locator = this.page.getByLabel('Password');

  // Create dialog
  private readonly createTaskDialogTitle: Locator = this.page.getByRole('heading', { name: 'Create New Task' });
  private readonly editTaskDialogTitle: Locator = this.page.getByRole('heading', { name: 'Edit Task' });
  private readonly taskTitleInput: Locator = this.page.getByLabel('Title');
  private readonly taskDescriptionInput: Locator = this.page.getByLabel('Description (Optional)');
  private readonly createTaskSubmitButton: Locator = this.page.getByRole('button', { name: 'Create Task' });
  private readonly saveChangesButton: Locator = this.page.getByRole('button', { name: 'Save Changes' });
  private readonly cancelTaskDialogButton: Locator = this.page.getByRole('button', { name: 'Cancel' });
  private readonly titleRequiredError: Locator = this.page.getByText('Title is required');

  // Kanban columns
  private readonly columnBacklog: Locator = this.page.getByRole('heading', { name: 'Backlog' });
  private readonly columnTodo: Locator = this.page.getByRole('heading', { name: 'Todo' });
  private readonly columnInProgress: Locator = this.page.getByRole('heading', { name: 'In Progress' });
  private readonly columnDone: Locator = this.page.getByRole('heading', { name: 'Done' });

  async open(): Promise<void> {
    await super.open('/dashboard');
  }

  async expectAuthenticatedArea(): Promise<void> {
    await expect(this.page).toHaveURL(/\/dashboard/);
    await expect(this.heading).toBeVisible();
    await expect(this.logoutButton).toBeVisible();
    await expect(this.addTaskButton).toBeVisible();
  }

  async expectRedirectedToLoginGate(): Promise<void> {
    await expect(this.page).toHaveURL(/\/auth\/login/);
    await expect(this.loginFormEmailInput).toBeVisible();
    await expect(this.loginFormPasswordInput).toBeVisible();
  }

  async expectProtectedControlsHidden(): Promise<void> {
    await expect(this.heading).not.toBeVisible();
    await expect(this.logoutButton).not.toBeVisible();
    await expect(this.addTaskButton).not.toBeVisible();
  }

  // ── Board structure ──────────────────────────────────────────────────────────

  async expectKanbanColumnsVisible(): Promise<void> {
    await expect(this.columnBacklog).toBeVisible();
    await expect(this.columnTodo).toBeVisible();
    await expect(this.columnInProgress).toBeVisible();
    await expect(this.columnDone).toBeVisible();
  }

  // ── Create task ──────────────────────────────────────────────────────────────

  async openCreateTaskDialog(): Promise<void> {
    await this.addTaskButton.click();
  }

  async expectCreateTaskDialogOpen(): Promise<void> {
    await expect(this.createTaskDialogTitle).toBeVisible();
    await expect(this.taskTitleInput).toBeVisible();
  }

  async createTask(data: { title: string; description?: string; priority?: 'High' | 'Medium' | 'Low' }): Promise<void> {
    await this.taskTitleInput.fill(data.title);

    if (data.description !== undefined) {
      await this.taskDescriptionInput.fill(data.description);
    }

    if (data.priority !== undefined) {
      await this.page.getByRole('combobox').first().click();
      await this.page.getByRole('option', { name: data.priority }).click();
    }

    await this.createTaskSubmitButton.click();
  }

  async submitCreateTaskWithoutTitle(): Promise<void> {
    await this.taskTitleInput.fill('');
    await this.createTaskSubmitButton.click();
  }

  async cancelCreateTaskDialog(): Promise<void> {
    await this.cancelTaskDialogButton.click();
  }

  async fillTaskDraft(data: { title: string; description?: string }): Promise<void> {
    await this.taskTitleInput.fill(data.title);

    if (data.description !== undefined) {
      await this.taskDescriptionInput.fill(data.description);
    }
  }

  // ── Edit task ────────────────────────────────────────────────────────────────

  private taskCard(taskTitle: string): Locator {
    return this.page.getByText(taskTitle, { exact: true })
      .locator('xpath=ancestor::*[contains(@class,"rounded-xl")]')
      .first();
  }

  private taskMenuButton(taskTitle: string): Locator {
    return this.taskCard(taskTitle).getByRole('button').last();
  }

  async openEditDialog(taskTitle: string): Promise<void> {
    await this.taskCard(taskTitle).hover();
    await this.taskMenuButton(taskTitle).click();
    await this.page.getByRole('menuitem', { name: 'Edit' }).click();
  }

  async expectEditTaskDialogOpen(): Promise<void> {
    await expect(this.editTaskDialogTitle).toBeVisible();
    await expect(this.taskTitleInput).toBeVisible();
  }

  async editTaskTitle(newTitle: string): Promise<void> {
    await this.taskTitleInput.clear();
    await this.taskTitleInput.fill(newTitle);
    await this.saveChangesButton.click();
  }

  async editTaskStatus(status: 'Backlog' | 'Todo' | 'In Progress' | 'Done'): Promise<void> {
    await this.page.getByRole('combobox').last().click();
    await this.page.getByRole('option', { name: status }).click();
    await this.saveChangesButton.click();
  }

  // ── Delete task ──────────────────────────────────────────────────────────────

  async deleteTask(taskTitle: string): Promise<void> {
    await this.taskCard(taskTitle).hover();
    await this.taskMenuButton(taskTitle).click();
    await this.page.getByRole('menuitem', { name: 'Delete' }).click();
    await expect(this.page.getByText(taskTitle, { exact: true })).not.toBeVisible();
  }

  // ── Column assertions ────────────────────────────────────────────────────────

  async expectTaskInColumn(taskTitle: string, column: 'Backlog' | 'Todo' | 'In Progress' | 'Done'): Promise<void> {
    const columnHeading = this.page.getByRole('heading', { name: column, exact: true });
    const columnContainer = columnHeading.locator('xpath=ancestor::div[contains(@class,"rounded-lg")]');
    await expect(columnContainer.getByText(taskTitle, { exact: true })).toBeVisible();
  }

  // ── Task card assertions ─────────────────────────────────────────────────────

  async expectTaskVisible(title: string): Promise<void> {
    await expect(this.page.getByText(title, { exact: true })).toBeVisible();
  }

  async expectTaskDescriptionVisible(description: string): Promise<void> {
    await expect(this.page.getByText(description, { exact: true })).toBeVisible();
  }

  async expectTaskNotVisible(title: string): Promise<void> {
    await expect(this.page.getByText(title, { exact: true })).not.toBeVisible();
  }

  async expectPriorityLabelVisible(taskTitle: string, priority: 'High' | 'Medium' | 'Low'): Promise<void> {
    const card = this.page.getByText(taskTitle, { exact: true })
      .locator('xpath=ancestor::*[contains(@class,"rounded-xl")]');
    // card description renders as "Priority: High | Status: Todo"
    await expect(card.locator('[data-slot="card-description"]')).toContainText(`Priority: ${priority}`);
  }

  async expectTaskStatusVisible(taskTitle: string, status: string): Promise<void> {
    const card = this.page.getByText(taskTitle, { exact: true })
      .locator('xpath=ancestor::*[contains(@class,"rounded-xl")]');
    // card description renders as "Priority: Medium | Status: Todo"
    await expect(card.locator('[data-slot="card-description"]')).toContainText(`Status: ${status}`);
  }

  // ── Misc ─────────────────────────────────────────────────────────────────────

  async expectTitleRequiredError(): Promise<void> {
    await expect(this.titleRequiredError).toBeVisible();
  }

  async expectTitleMarkedInvalidByBrowser(): Promise<void> {
    const isTitleValid = await this.taskTitleInput.evaluate(
      (el) => (el as HTMLInputElement).checkValidity()
    );
    expect(isTitleValid).toBeFalsy();
  }

  async logout(): Promise<void> {
    await this.logoutButton.click();
  }
}



