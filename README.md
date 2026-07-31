# WorkBee Dashboard

The operational dashboard for WorkBee, published from
[`chillaah/workbee-dashboard`](https://github.com/chillaah/workbee-dashboard)
through GitHub Pages.

Live dashboard: <https://chillaah.github.io/workbee-dashboard/>

## Features

- Live totals for people, employees, employers, profile completion, document
  coverage, registrations, and vault balances
- Account growth, role, language, job-demand, and location reporting
- User search by name, WorkBee ID, phone number, location, role, or job
  preference
- Detailed employee and employer profiles
- Authenticated access to each person’s uploaded files
- CSV export for the filtered people directory
- Time-aware greeting for the administrator
- WorkBee branding using primary blue `#0D5BFF`, dark blue `#051A3D`, and bee
  yellow `#FFD54A`

The dashboard contains no sample people or placeholder metrics. It remains
locked until the administrator signs in and the WorkBee backend returns live
data.

## Architecture

GitHub Pages serves only the static Next.js interface. It never connects
directly to PostgreSQL and does not contain database credentials.

After sign-in, the browser calls the WorkBee backend over HTTPS. The backend
verifies the credentials, returns a short-lived session token, and uses that
token to protect the dashboard, profile, and document endpoints.

```text
GitHub Pages Dashboard
        │
        │ HTTPS + short-lived session
        ▼
WorkBee Backend API
        │
        ├── PostgreSQL
        └── Private Uploaded Files
```

## Run Locally

Requirements:

- Node.js 22 or later
- The WorkBee backend running locally or at a public HTTPS address

Install dependencies and start the dashboard on port `3001`:

```bash
npm install
npm run dev -- -p 3001
```

Open <http://localhost:3001>.

To prefill the backend address, create `.env.local`:

```dotenv
NEXT_PUBLIC_WORKBEE_API_URL=http://localhost:3000
```

Only the API URL is public. Do not add usernames, passwords, password hashes,
database credentials, or admin tokens to this repository or to any
`NEXT_PUBLIC_` environment variable.

## Backend Authentication

Configure these values only in the WorkBee backend environment:

```dotenv
DASHBOARD_ADMIN_USERNAME=your-dashboard-username
DASHBOARD_ADMIN_PASSWORD_HASH=your-64-character-sha256-password-hash
DASHBOARD_SESSION_TTL_MS=28800000
DASHBOARD_ALLOWED_ORIGINS=http://localhost:3001,https://chillaah.github.io
```

The plaintext password must not be stored in an environment file. Store only
its SHA-256 hash through the backend host’s secret manager.

Authentication behavior:

- Sign-in attempts are rate-limited.
- Invalid credentials return a generic error.
- Successful sign-in creates a random, expiring server-side session.
- The browser stores only the session token in `sessionStorage`.
- Signing out revokes the session.
- Restarting the backend invalidates all in-memory dashboard sessions.

The current username-and-password flow is intentionally simple and should be
replaced with managed identity and multi-factor authentication before broader
production use.

## Live Data Endpoints

The dashboard uses these protected WorkBee API routes:

```text
POST   /api/v1/admin/session
DELETE /api/v1/admin/session
GET    /api/v1/admin/dashboard
GET    /api/v1/admin/users/:userId
GET    /api/v1/admin/users/:userId/documents/:documentId
```

The backend must be deployed at a public HTTPS address and must have access to
the production PostgreSQL database and private uploaded files. A GitHub Pages
site cannot reach a backend or database that exists only on a local computer.

## GitHub Pages

The workflow at `.github/workflows/deploy-pages.yml` builds and deploys the
static export whenever `main` changes.

Repository settings:

1. Set **Pages → Build and deployment → Source** to **GitHub Actions**.
2. Add the repository variable `WORKBEE_API_URL`.
3. Set it to the public HTTPS address of the deployed WorkBee backend.

`WORKBEE_API_URL` is intentionally a public repository variable. It must contain
only the backend origin, never a credential or query-string secret.

## Validation

Run the complete dashboard checks with:

```bash
npm test
```

This runs linting, TypeScript validation, and the production static build.
