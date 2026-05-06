# TodoTest QA Automation (Playwright + TypeScript)

Test project for validating `https://todotest.site` with UI and API automated tests.

## What's Included

- UI automated tests with Playwright
- API automated tests for auth endpoints
- POM structure for UI (`BasePage`, `LandingPage`, `LoginPage`, `RegisterPage`, `DashboardPage`)

## Test Design Techniques Used

- `Smoke testing` — basic availability and key entry points
- `Negative testing` — invalid credentials and invalid payload handling
- `Equivalence Partitioning (EP)` — valid vs invalid email classes
- `Boundary Value Analysis (BVA)` — password length below minimum threshold
- `Decision Table testing` — password/confirm-password combinations
- `State Transition testing` — anonymous -> registered -> authenticated dashboard
- `Security/AuthZ checks` — unauthorized access to protected routes/endpoints

## Test Types Covered

- UI functional tests
- API functional tests
- Validation tests
- Basic authorization/security checks
- Regression-ready smoke checks

## Tech Stack

- `@playwright/test`
- `TypeScript`
- `Node.js`

## Project Structure

- `tests/ui/auth-ui.spec.ts` — UI scenarios organized by test design technique
- `tests/ui/pages/BasePage.ts` — base page class
- `tests/ui/pages/LandingPage.ts` — landing page object
- `tests/ui/pages/LoginPage.ts` — login page object
- `tests/ui/pages/RegisterPage.ts` — register page object
- `tests/ui/pages/DashboardPage.ts` — dashboard page object
- `tests/api/auth-api.spec.ts` — API scenarios organized by test design technique
- `tests/api/clients/AuthApiClient.ts` — API client
- `playwright.config.ts` — Playwright config

## Requirements

- Node.js 18+
- npm

## Installation

```bash
npm install
npx playwright install chromium
```

## Run Tests

Full run:

```bash
npm test
```

UI only:

```bash
npm run test:ui
```

API only:

```bash
npm run test:api
```

Run with headed browser:

```bash
npm run test:headed
```

Open report:

```bash
npm run report
```

## Current Settings

- `baseURL`: `https://todotest.site`
- `browser`: `chromium`
- `retries`: `1`
- `trace`: `on-first-retry`

## Note

Generated result folders (`test-results`, `playwright-report`) are listed in `.gitignore` and should not be committed.
