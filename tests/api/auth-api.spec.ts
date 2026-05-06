import { expect, test } from '@playwright/test';
import { AuthApiClient } from './clients/AuthApiClient';

type RegisterNegativeCase = {
  name: string;
  payload: Record<string, unknown>;
};

const registerNegativeCases: RegisterNegativeCase[] = [
  {
    name: '[EP] empty payload',
    payload: {}
  },
  {
    name: '[EP] malformed email format',
    payload: {
      email: 'not-an-email',
      password: 'Password123',
      confirmPassword: 'Password123'
    }
  },
  {
    name: '[Boundary] password below minimum length',
    payload: {
      email: `qa+${Date.now()}@example.com`,
      password: 'Pass123',
      confirmPassword: 'Pass123'
    }
  },
  {
    name: '[Decision Table] password and confirmation mismatch',
    payload: {
      email: `qa+${Date.now()}@example.com`,
      password: 'Password123',
      confirmPassword: 'Password321'
    }
  },
  {
    name: '[Decision Table] missing confirmPassword',
    payload: {
      email: `qa+${Date.now()}@example.com`,
      password: 'Password123'
    }
  }
];

test.describe('Auth API suite by test design techniques', () => {
  for (const testCase of registerNegativeCases) {
    test(`register rejects invalid payload: ${testCase.name}`, async ({ request }) => {
      const authApiClient = new AuthApiClient(request);
      const response = await authApiClient.register(testCase.payload);

      expect(response.ok()).toBeFalsy();
      expect(response.status()).toBeGreaterThanOrEqual(400);
      expect(response.status()).toBeLessThan(500);

      const rawBody = await response.text();
      expect(typeof rawBody).toBe('string');
    });
  }

  test('[Security/AuthZ] unauthenticated access to tasks is denied', async ({ request }) => {
    const authApiClient = new AuthApiClient(request);
    const response = await authApiClient.getTasks();

    expect(response.ok()).toBeFalsy();
    expect([401, 403]).toContain(response.status());
  });
});
