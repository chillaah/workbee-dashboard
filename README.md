# WorkBee Dashboard

A static Next.js operations dashboard for the WorkBee platform, designed for
secure operational visibility and static deployment through GitHub Pages.

## What it shows

- total users, employees, employers, profile completion, document coverage, and
  vault balances
- account growth and profile-completion trends
- role and language distribution
- top worker job preferences and geographic coverage
- a searchable, filterable, CSV-exportable people directory
- user search by name, WorkBee ID, or job preference
- click-through employee and employer profiles with private file previews

The published dashboard never connects directly to PostgreSQL. It reads from a
protected WorkBee API endpoint so database credentials remain server-side.

## Local development

```bash
npm install
npm run dev
```

With the WorkBee backend using port `3000`, run the dashboard on port `3001`:

```bash
npm run dev -- -p 3001
```

Open `http://localhost:3001`. The dashboard starts with representative demo
data unless a connection is configured. Select **Connect live data** and enter:

- the public HTTPS URL of the WorkBee backend
- the value configured as `DASHBOARD_ADMIN_TOKEN` on that backend

The key is stored in `sessionStorage`, so it is cleared when the browser session
ends and is not compiled into the GitHub Pages bundle.

For local-only automatic connection, create `.env.local`:

```dotenv
NEXT_PUBLIC_WORKBEE_API_URL=http://localhost:3000
NEXT_PUBLIC_WORKBEE_DASHBOARD_TOKEN=your-local-admin-token
```

Do not use `NEXT_PUBLIC_WORKBEE_DASHBOARD_TOKEN` in a public build because
`NEXT_PUBLIC_` values are compiled into browser code.

## Validation

```bash
npm test
```

## GitHub Pages

The workflow in `.github/workflows/deploy-pages.yml` builds and publishes the
static export whenever `main` is updated. In the repository settings, set
**Pages → Build and deployment → Source** to **GitHub Actions**.
