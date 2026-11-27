# Service Connect (CSE 340)

Node.js + Express + EJS site.

## Run locally
```powershell
npm install
Copy-Item .env.example .env
```

Add your PostgreSQL `DATABASE_URL` to `.env`, then run:

```powershell
npm run db:setup
npm start
```

Set `SESSION_SECRET` to a long random value in `.env` and in the hosted service
environment. The Render Blueprint generates one automatically.

Open http://127.0.0.1:3000

## Accounts and access
Visitors can register at `/register` and sign in at `/login`. Passwords are
stored as bcrypt hashes. The dashboard requires a signed-in account, and the
user directory and content-management forms require the `admin` role.

For an existing database, add the authentication tables without rebuilding
your organizations and projects, then configure the dedicated grading account:

```powershell
npm run db:migrate-auth
npm run db:setup-admin
```

This creates or resets `admin@example.com` with the course test password
`cse340!` and assigns the admin role. Run it only for the course grading
database; the credentials are intentionally fixed by the assignment.

## Database setup
Set `DATABASE_URL` in `.env` to a PostgreSQL connection string, then initialize
the schema and seed data:

    npm run db:setup

The database is the only source of page data. The application does not use
static fallback data when a database query fails.

## Deploy on Render
- Build command: `npm install`
- Start command: `npm start`
- Set `NODE_ENV=production` in Render's environment settings (do not commit `.env`).
- Link the Render PostgreSQL database through `DATABASE_URL`.
- Run `npm run db:setup` once before the first deploy to create and seed the tables.
