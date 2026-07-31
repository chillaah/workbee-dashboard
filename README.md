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

Open `http://localhost:3001`. The dashboard remains locked until a backend
connection is configured and the administrator signs in. Enter:

- the public HTTPS URL of the WorkBee backend
- the dashboard username and password configured only on that backend

The backend returns an expiring session token. Only that token is kept in
`sessionStorage`, so it is cleared when the browser session ends. The username
and password are not stored or compiled into the GitHub Pages bundle.

To prefill the backend address locally, create `.env.local`:

```dotenv
NEXT_PUBLIC_WORKBEE_API_URL=http://localhost:3000
```

Configure `DASHBOARD_ADMIN_USERNAME` and
`DASHBOARD_ADMIN_PASSWORD_HASH` only in the backend environment. Never add
credentials, password hashes, or admin tokens to this repository.

## Validation

```bash
npm test
```

## GitHub Pages

The workflow in `.github/workflows/deploy-pages.yml` builds and publishes the
static export whenever `main` is updated. In the repository settings, set
**Pages → Build and deployment → Source** to **GitHub Actions**.

Set the repository variable `WORKBEE_API_URL` to the public HTTPS address of the
deployed backend. Repository variables are compiled into the site, so this value
must be a public URL and must never contain credentials.
