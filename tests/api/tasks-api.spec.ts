import { expect, test } from '@playwright/test';
import { AuthApiClient, TaskApiClient } from './clients/AuthApiClient';
import { setupAuthenticatedApiContext, apiUid } from './helpers/apiAuth';

test.describe('Tasks API suite by test design techniques', () => {

  // ── AuthZ (unauthenticated — use standalone request) ────────────────────────

  test('[Security/AuthZ] unauthenticated GET /api/tasks returns 401 or 403', async ({ request }) => {
    const taskClient = new TaskApiClient(request);
    const response = await taskClient.getAll();

    expect(response.ok()).toBeFalsy();
    expect([401, 403]).toContain(response.status());
  });

  test('[Security/AuthZ] unauthenticated POST /api/tasks returns 401 or 403', async ({ request }) => {
    const taskClient = new TaskApiClient(request);
    const response = await taskClient.create({ title: 'should-be-blocked' });

    expect(response.ok()).toBeFalsy();
    expect([401, 403]).toContain(response.status());
  });

  // ── GET /api/tasks ──────────────────────────────────────────────────────────

  test('[Smoke] authenticated GET /api/tasks returns 200 with array', async ({ page }) => {
    const { taskClient } = await setupAuthenticatedApiContext(page);
    const response = await taskClient.getAll();

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(Array.isArray(body)).toBe(true);
  });

  test('[Positive] new user has empty tasks list initially', async ({ page }) => {
    const { taskClient } = await setupAuthenticatedApiContext(page);
    const response = await taskClient.getAll();

    const body = await response.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBe(0);
  });

  // ── POST /api/tasks ─────────────────────────────────────────────────────────

  test('[Positive] POST /api/tasks creates task and returns it in response', async ({ page }) => {
    const { taskClient } = await setupAuthenticatedApiContext(page);
    const title = `api-task-${apiUid()}`;

    const response = await taskClient.create({ title, priority: 'Medium' });
    expect([200, 201]).toContain(response.status());

    const body = await response.json();
    expect(body.id).toBeDefined();
    expect(body.title).toBe(title);
    expect(body.priority).toBe('Medium');
  });

  test('[Positive] created task appears in GET /api/tasks', async ({ page }) => {
    const { taskClient } = await setupAuthenticatedApiContext(page);
    const title = `api-task-list-${apiUid()}`;

    await taskClient.create({ title, priority: 'Low' });

    // poll up to 5 s for eventual consistency
    let found = false;
    for (let i = 0; i < 10; i++) {
      const tasks = await (await taskClient.getAll()).json();
      if (Array.isArray(tasks) && tasks.some((t: { title: string }) => t.title === title)) {
        found = true;
        break;
      }
      await page.waitForTimeout(500);
    }
    expect(found).toBe(true);
  });

  test('[Decision Table] POST creates task with High priority correctly', async ({ page }) => {
    const { taskClient } = await setupAuthenticatedApiContext(page);
    const title = `high-priority-${apiUid()}`;

    const body = await (await taskClient.create({ title, priority: 'High' })).json();
    expect(body.priority).toBe('High');
  });

  test('[Decision Table] POST creates task with description', async ({ page }) => {
    const { taskClient } = await setupAuthenticatedApiContext(page);
    const title = `with-desc-${apiUid()}`;
    const description = `desc-${apiUid()}`;

    const body = await (await taskClient.create({ title, description, priority: 'Low' })).json();
    expect(body.description).toBe(description);
  });

  test('[Boundary Value] POST rejects task with empty title', async ({ page }) => {
    const { taskClient } = await setupAuthenticatedApiContext(page);
    const response = await taskClient.create({ title: '', priority: 'Medium' });

    expect(response.ok()).toBeFalsy();
    expect(response.status()).toBeGreaterThanOrEqual(400);
    expect(response.status()).toBeLessThan(500);
  });

  test('[Boundary Value] POST rejects task without title field', async ({ page }) => {
    const { taskClient } = await setupAuthenticatedApiContext(page);
    const response = await taskClient.create({ priority: 'Medium' });

    expect(response.ok()).toBeFalsy();
    expect(response.status()).toBeGreaterThanOrEqual(400);
    expect(response.status()).toBeLessThan(500);
  });

  test('[Equivalence Partitioning] POST rejects invalid priority value', async ({ page }) => {
    const { taskClient } = await setupAuthenticatedApiContext(page);
    const response = await taskClient.create({ title: `task-${apiUid()}`, priority: 'Critical' as never });

    expect(response.ok()).toBeFalsy();
    expect(response.status()).toBeGreaterThanOrEqual(400);
    expect(response.status()).toBeLessThan(500);
  });

  // ── PUT /api/tasks/:id ──────────────────────────────────────────────────────

  test('[Positive] PUT /api/tasks/:id updates task title', async ({ page }) => {
    const { taskClient } = await setupAuthenticatedApiContext(page);
    const title = `update-me-${apiUid()}`;
    const updatedTitle = `updated-${apiUid()}`;

    const created = await (await taskClient.create({ title, priority: 'Low' })).json();
    const response = await taskClient.update(created.id, { title: updatedTitle });

    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.title).toBe(updatedTitle);
  });

  test('[State Transition] PUT changes status from Backlog to In Progress', async ({ page }) => {
    const { taskClient } = await setupAuthenticatedApiContext(page);
    const created = await (await taskClient.create({ title: `status-${apiUid()}`, priority: 'Medium' })).json();

    const response = await taskClient.update(created.id, { status: 'In Progress' });
    expect(response.ok()).toBeTruthy();

    const body = await response.json();
    expect(body.status).toBe('In Progress');
  });

  test('[State Transition] PUT changes status from Backlog to Done', async ({ page }) => {
    const { taskClient } = await setupAuthenticatedApiContext(page);
    const created = await (await taskClient.create({ title: `done-${apiUid()}`, priority: 'High' })).json();

    const response = await taskClient.update(created.id, { status: 'Done' });
    expect(response.ok()).toBeTruthy();

    const body = await response.json();
    expect(body.status).toBe('Done');
  });

  test('[Equivalence Partitioning] PUT rejects invalid status value', async ({ page }) => {
    const { taskClient } = await setupAuthenticatedApiContext(page);
    const created = await (await taskClient.create({ title: `bad-status-${apiUid()}`, priority: 'Low' })).json();

    const response = await taskClient.update(created.id, { status: 'Cancelled' as never });
    expect(response.ok()).toBeFalsy();
    expect(response.status()).toBeGreaterThanOrEqual(400);
    expect(response.status()).toBeLessThan(500);
  });

  test('[Negative] PUT non-existent task returns 404', async ({ page }) => {
    const { taskClient } = await setupAuthenticatedApiContext(page);
    const response = await taskClient.update('non-existent-id-000', { title: 'ghost' });

    expect(response.status()).toBe(404);
  });

  // ── DELETE /api/tasks/:id ───────────────────────────────────────────────────

  test('[Positive] DELETE removes task and it is absent from GET', async ({ page }) => {
    const { taskClient } = await setupAuthenticatedApiContext(page);
    const created = await (await taskClient.create({ title: `delete-me-${apiUid()}`, priority: 'Low' })).json();

    const deleteResponse = await taskClient.delete(created.id);
    expect(deleteResponse.ok()).toBeTruthy();

    const tasks = await (await taskClient.getAll()).json();
    expect(tasks.some((t: { id: string }) => t.id === created.id)).toBe(false);
  });

  test('[Negative] DELETE non-existent task returns 404', async ({ page }) => {
    const { taskClient } = await setupAuthenticatedApiContext(page);
    const response = await taskClient.delete('non-existent-id-000');

    expect(response.status()).toBe(404);
  });

  test('[Negative] DELETE one task does not remove other tasks', async ({ page }) => {
    const { taskClient } = await setupAuthenticatedApiContext(page);

    const keep = await (await taskClient.create({ title: `keep-${apiUid()}`, priority: 'Low' })).json();
    const del = await (await taskClient.create({ title: `del-${apiUid()}`, priority: 'Low' })).json();

    await taskClient.delete(del.id);

    const tasks = await (await taskClient.getAll()).json();
    expect(tasks.some((t: { id: string }) => t.id === keep.id)).toBe(true);
    expect(tasks.some((t: { id: string }) => t.id === del.id)).toBe(false);
  });
});


