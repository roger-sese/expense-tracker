# Spendwise: Expense Tracker

A full-stack app for tracking where your money goes. You log expenses, group them into your own
categories, and see a monthly breakdown on the dashboard.

| Layer    | Tech                                                                         |
| -------- | ---------------------------------------------------------------------------- |
| Frontend | Next.js 15 (App Router), React 19, TypeScript, TanStack Query               |
| Backend  | NestJS 11, TypeScript, TypeORM, JWT auth, class-validator                    |
| Database | SQLite via `sql.js` (WebAssembly, so no DB server and no native build step) |
| Tests    | Jest + Supertest (API), Vitest + Testing Library (web)                       |
| Extras   | Docker Compose, seeded demo account, responsive UI with dark mode            |

## Quick start

Requires **Node.js 20+** (tested on Node 22 and 25).

```bash
npm run setup   # installs api/ and web/ dependencies
npm run dev     # starts API on :4000 and web on :3000
```

Open http://localhost:3000 and log in with the seeded demo account:

```
email:    demo@example.com
password: password123
```

Or create your own account from the **Register** page. New accounts get five starter categories.

### With Docker

```bash
docker compose up --build
```

The web app is served at http://localhost:3000 and the API at http://localhost:4000/api. Data is kept in the
`api-data` volume.

### Running the apps individually

```bash
cd api && npm install && npm run start:dev   # http://localhost:4000/api
cd web && npm install && npm run dev         # http://localhost:3000
```

Both apps work without any `.env` file. To override the defaults, copy `api/.env.example` to `api/.env` and
`web/.env.example` to `web/.env.local`.

## Screens and workflows

The login and register screens are the auth workflow. Beyond those, the app has five screens:

| Route                 | Screen          | What it does                                                                                   |
| --------------------- | --------------- | ---------------------------------------------------------------------------------------------- |
| `/login`, `/register` | Auth            | Log in or sign up. Signed-out users are redirected here and sent back afterwards.            |
| `/dashboard`          | Dashboard       | Monthly total, change vs. last month, top category, per-category bars, recent expenses, month picker |
| `/expenses`           | Expense list    | Search, filter by category or date range, paginate, edit, delete. Filters live in the URL.    |
| `/expenses/new`       | Add expense     | Validated form (shared component with Edit)                                                    |
| `/expenses/:id/edit`  | Edit expense    | Pre-filled form, shows "not found" for missing or foreign expenses                             |
| `/categories`         | Categories      | Create, rename, recolour. Deleting is blocked while expenses still use the category.          |

**Workflow 1: track spending.** Log in, open the Dashboard, then Add expense, then review it in the Expenses list.
From there you can edit or delete it.

**Workflow 2: organise.** Create a category, assign expenses to it, filter the list by it, and watch the
dashboard breakdown update.

## Architecture

```
expense-tracker/
├── api/                      NestJS REST API
│   ├── src/
│   │   ├── auth/             register/login/me, JWT guard, @CurrentUserId decorator
│   │   ├── users/            User entity + service
│   │   ├── categories/       CRUD + per-user uniqueness + "in use" protection
│   │   ├── expenses/         CRUD, filtering/pagination, monthly summary
│   │   ├── database/         TypeORM (sql.js) config + demo data seeder
│   │   └── common/           money helpers (amounts stored as integer cents)
│   └── test/                 end-to-end tests (in-memory DB)
├── web/                      Next.js frontend
│   └── src/
│       ├── app/              routes: (auth) group, (app) group with shared shell
│       ├── middleware.ts     server-side route guard
│       ├── components/ui/    reusable primitives (Button, fields, Card, Pagination…)
│       ├── features/         auth, expenses, categories, dashboard (components + hooks)
│       └── lib/              typed API client, query keys, formatting, token storage
├── docker-compose.yml
└── scripts/dev.mjs           runs both dev servers together
```

### Key decisions

- **State management.** TanStack Query owns server state (caching, invalidation after mutations, keeping
  previous data while paging). A small `AuthProvider` context owns the session. Expense filters live
  in the URL, so you can share or refresh a view without losing it.
- **Routing.** Route groups separate the public auth layout from the authenticated app shell. Next.js
  middleware redirects signed-out users before a protected page renders and preserves `?next=` safely,
  which blocks open redirects. A 401 from the API anywhere in the app clears the session and returns
  the user to login.
- **Reusability.** UI primitives live in `components/ui`. `ExpenseForm` serves both Add and Edit,
  `ExpenseList` serves both the Expenses page and the dashboard's "Recent" card, and `CategoryForm`
  serves both create and inline edit.
- **Data integrity.** Every query is scoped to the authenticated user, so one user can't read or modify
  another user's data. Money is stored as integer cents. DTOs are validated with a whitelist so unknown
  fields are rejected.

## API

All routes are prefixed with `/api`. Everything except `auth/register`, `auth/login` and `health` requires
an `Authorization: Bearer <token>` header.

| Method | Path                                  | Description                                       |
| ------ | ------------------------------------- | ------------------------------------------------- |
| POST   | `/auth/register`                      | `{ name, email, password }` → `{ accessToken, user }` |
| POST   | `/auth/login`                         | `{ email, password }` → `{ accessToken, user }`   |
| GET    | `/auth/me`                            | Current user                                      |
| GET    | `/categories`                         | List with `expenseCount`                          |
| POST   | `/categories`                         | `{ name, color? }`                                |
| PATCH  | `/categories/:id`                     | `{ name?, color? }`                               |
| DELETE | `/categories/:id`                     | 409 if the category is still in use               |
| GET    | `/expenses?search&categoryId&from&to&page&limit` | Paginated list, newest first           |
| GET    | `/expenses/summary?month=YYYY-MM`     | Totals, per-category breakdown, recent items      |
| GET    | `/expenses/:id`                       | Single expense                                    |
| POST   | `/expenses`                           | `{ description, amount, date, categoryId, notes? }` |
| PATCH  | `/expenses/:id`                       | Partial update                                    |
| DELETE | `/expenses/:id`                       | 204 on success                                    |
| GET    | `/health`                             | Liveness check                                    |

## Testing

```bash
npm test                     # everything below
npm test --prefix api        # API unit tests (services, guard, helpers)
npm run test:e2e --prefix api  # API end-to-end flow against an in-memory DB
npm test --prefix web        # web unit/component tests (forms, API client, middleware, helpers)
npm run lint                 # TypeScript type checks for both apps
```

## Configuration

| Variable              | App | Default                          | Notes                                  |
| --------------------- | --- | -------------------------------- | -------------------------------------- |
| `PORT`                | api | `4000`                           |                                        |
| `WEB_ORIGIN`          | api | `http://localhost:3000`          | CORS allow-list (comma-separated)      |
| `JWT_SECRET`          | api | dev-only value                   | **Set this outside local development** |
| `JWT_EXPIRES_IN`      | api | `1d`                             |                                        |
| `DB_PATH`             | api | `data/expense-tracker.sqlite`    | `:memory:` for a throwaway DB          |
| `SEED_DEMO`           | api | `true`                           | Seeds the demo account on first start  |
| `NEXT_PUBLIC_API_URL` | web | `http://localhost:4000/api`      | Must be reachable from the browser     |

## Possible next steps

Migrations instead of `synchronize`, refresh tokens or httpOnly cookie sessions, CSV export, recurring
expenses, budgets with alerts (a natural fit for push notifications), and page analytics.
