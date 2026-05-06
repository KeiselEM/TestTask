import type { APIRequestContext, APIResponse } from '@playwright/test';

export interface RegisterPayload {
  email: string;
  password: string;
  confirmPassword: string;
}

export type TaskPriority = 'High' | 'Medium' | 'Low';
export type TaskStatus = 'Backlog' | 'Todo' | 'In Progress' | 'Done';

export interface CreateTaskPayload {
  title: string;
  description?: string;
  priority?: TaskPriority;
}

export interface UpdateTaskPayload {
  title?: string;
  description?: string | null;
  priority?: TaskPriority;
  status?: TaskStatus;
}

export interface TaskDto {
  id: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  status: TaskStatus;
  createdAt: string;
}

// ── Auth client ───────────────────────────────────────────────────────────────

export class AuthApiClient {
  constructor(private readonly request: APIRequestContext) {}

  async register(payload: Record<string, unknown>): Promise<APIResponse> {
    return this.request.post('/api/auth/register', { data: payload });
  }

  async registerUser(payload: RegisterPayload): Promise<APIResponse> {
    return this.request.post('/api/auth/register', { data: payload });
  }

  async getTasks(): Promise<APIResponse> {
    return this.request.get('/api/tasks');
  }
}

// ── Task client ───────────────────────────────────────────────────────────────

export class TaskApiClient {
  constructor(private readonly request: APIRequestContext) {}

  async getAll(): Promise<APIResponse> {
    return this.request.get('/api/tasks');
  }

  async create(payload: CreateTaskPayload | Record<string, unknown>): Promise<APIResponse> {
    return this.request.post('/api/tasks', { data: payload });
  }

  async update(taskId: string, payload: UpdateTaskPayload): Promise<APIResponse> {
    return this.request.put(`/api/tasks/${taskId}`, { data: payload });
  }

  async delete(taskId: string): Promise<APIResponse> {
    return this.request.delete(`/api/tasks/${taskId}`);
  }
}

