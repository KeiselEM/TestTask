import type { APIRequestContext, APIResponse } from '@playwright/test';

export class AuthApiClient {
  constructor(private readonly request: APIRequestContext) {}

  async register(payload: Record<string, unknown>): Promise<APIResponse> {
    return this.request.post('/api/auth/register', { data: payload });
  }

  async getTasks(): Promise<APIResponse> {
    return this.request.get('/api/tasks');
  }
}
