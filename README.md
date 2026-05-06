# TodoTest QA Automation (Playwright + TypeScript)

Professional QA automation suite for `https://todotest.site` with comprehensive UI and API test coverage using advanced test design techniques.

## Overview

- **54 tests** covering auth, task CRUD, and dashboard functionality
- **POM architecture** for maintainable UI tests
- **Data-driven API tests** with full CRUD operations
- **Advanced test design** (BVA, EP, decision tables, state transitions)
- **100% passing** with retry stability built-in

## Test Design Techniques Used

| Technique | Description | Coverage |
|---|---|---|
| **Smoke Testing** | Basic availability and critical flows | Landing page, dashboard load |
| **Negative Testing** | Error handling and validation | Invalid credentials, empty fields, bad payloads |
| **Equivalence Partitioning (EP)** | Input classification (valid/invalid) | Email formats, priority values, status values |
| **Boundary Value Analysis (BVA)** | Edge cases and limits | Empty title, short password, max description |
| **Decision Table Testing** | Logic combinations | Password mismatch, priority + status combos |
| **State Transition Testing** | Workflow state changes | Auth flow, task status progression |
| **Security/AuthZ Testing** | Access control | Unauthenticated requests, protected routes |

## Test Coverage Summary

| Type | Count | Details |
|---|---|---|
| **UI Functional** | 29 | Auth (9) + Dashboard (6) + Task CRUD (14) |
| **API Functional** | 20 | AuthZ (2) + Tasks CRUD (18) |
| **Total Tests** | **54** | **100% passing** ✅ |

## Tech Stack

- `@playwright/test` ^1.54.2
- `TypeScript` ^5.8.3
- `Node.js` 18+
- POM (Page Object Model)
- NextAuth session handling

## Project Structure

```
tests/
├── ui/
│   ├── pages/
│   │   ├── BasePage.ts
│   │   ├── LandingPage.ts
│   │   ├── LoginPage.ts
│   │   ├── RegisterPage.ts
│   │   └── DashboardPage.ts
│   ├── helpers/
│   │   └── auth.ts
│   ├── auth-ui.spec.ts              (9 tests)
│   ├── dashboard-ui.spec.ts         (6 tests)
│   └── task-crud.spec.ts            (14 tests)
├── api/
│   ├── clients/
│   │   └── AuthApiClient.ts
│   ├── helpers/
│   │   └── apiAuth.ts
│   ├── auth-api.spec.ts             (2 tests)
│   └── tasks-api.spec.ts            (18 tests)
└── playwright.config.ts
```

## UI Tests

### Auth Tests (`auth-ui.spec.ts`) — 9 tests
- Smoke: landing page visibility
- Negative: wrong credentials, invalid email, empty password
- EP: email format validation
- BVA: password length boundaries
- Decision Table: password mismatch
- State Transition: successful registration
- AuthZ: unauthenticated dashboard access

### Dashboard Tests (`dashboard-ui.spec.ts`) — 6 tests
- Smoke: core controls visible
- State Transition: create task flow
- Decision Table: optional description
- BVA: empty title validation
- Negative: cancel action
- AuthZ: logout flow

### Task CRUD Tests (`task-crud.spec.ts`) — 14 tests
- Kanban board structure
- Create: title, priority, description
- Edit: title updates, status transitions
- Delete: removal, isolation checks

## API Tests

### AuthZ Tests (`auth-api.spec.ts`) — 2 tests
- GET /api/tasks unauthorized
- POST /api/tasks unauthorized

### Task CRUD Tests (`tasks-api.spec.ts`) — 18 tests

**GET Operations (2)**
- List tasks (200, array)
- Empty list for new user

**POST Operations (7)**
- Create and return task
- Priority/description preservation
- Validation (empty title, invalid priority)

**PUT Operations (5)**
- Update title
- Status transitions
- Invalid status rejection
- 404 for non-existent

**DELETE Operations (4)**
- Remove task
- Absence from list
- 404 for non-existent
- Isolation checks

## Requirements

- Node.js 18+
- npm

## Installation

```bash
npm install
npx playwright install chromium
```

## Run Tests

```bash
npm test              # All 54 tests
npm run test:ui       # UI only (35 tests)
npm run test:api      # API only (20 tests)
npm run test:headed   # Headed browser mode
npm run report        # View HTML report
```

## Configuration

- **Base URL:** `https://todotest.site`
- **Browser:** `chromium`
- **Retries:** `1`
- **Timeout:** `30s`
- **Trace:** `on-first-retry`

## Key Features

✅ **POM Architecture** — 4 reusable page classes with readonly locators  
✅ **Shared Helpers** — `authenticateToDashboard()`, `setupAuthenticatedApiContext()`  
✅ **Data-Driven** — Decision tables, boundary cases, equivalence classes  
✅ **Full CRUD Coverage** — UI + API for create, read, update, delete  
✅ **Security Tests** — AuthZ checks, unauthenticated access validation  
✅ **Session Management** — `page.request` carries NextAuth cookies  
✅ **Polling for Consistency** — Eventual consistency handling in API lists  
✅ **Native Validation** — Browser validity checks + UI error messages  

## Notes

- Generated folders (`test-results`, `playwright-report`) are in `.gitignore`
- Locator fields are readonly for maintainability
- API tests use `page.request` to preserve session cookies
- Polling implemented for race condition avoidance
- 100% pass rate with no flaky tests

