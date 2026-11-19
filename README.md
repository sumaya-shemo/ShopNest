
## Part B: Continuous Integration Pipeline

# ShopNest — Product Management & Inventory System

Express.js + MySQL product catalogue with a plain JavaScript frontend. MySQL runs directly on Ubuntu; 

## Local setup

```bash
npm install
cp .env.example .env
# Edit .env with your MySQL connection values
npm run db:setup
npm run db:seed
npm run dev
```

Open `http://localhost:3000`.

## Database

The database is named `shopnest_db`. Create it and a restricted application account in MySQL:

```sql
CREATE DATABASE shopnest_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'root'@'localhost' IDENTIFIED BY 'YOUR_STRONG_PASSWORD';
GRANT SELECT, INSERT, UPDATE, DELETE ON shopnest_db.* TO 'shopnest_user'@'localhost';
FLUSH PRIVILEGES;
```

Configure `.env`. Import `database/schema.sql` and `database/seed.sql` if you prefer manual setup. The database setup script may require an administrative account because schema creation is not granted to the restricted runtime user.

## API

- `GET /health`
- `GET /api/products`
- `GET /api/products?search=mouse`
- `GET /api/products?category=Accessories`
- `GET /api/products/:id`

## CI checks

```bash
npm run lint:frontend
npm run test:frontend
npm run build:frontend
npm run lint:backend
npm run test:backend
npm run build:backend
```

Frontend tests use JSDOM to execute `public/app.js` and check product loading, search, category filtering, and API errors. Backend tests use Supertest against the real Express app, routes, and controllers, with a stubbed database adapter so GitHub Actions does not require a live MySQL service.

## GitHub Actions

`.github/workflows/ci-cd.yml` runs independent Frontend CI and Backend CI jobs on pushes and pull requests targeting `main`. Deployment runs only after both jobs pass and only on a push to `main`.

For deployment, configure these repository Actions secrets:

- `SERVER_HOST`: Ubuntu server IP or DNS name
- `SERVER_USER`: deployment account
- `SERVER_SSH_KEY`: private key matching the server user's `authorized_keys`
- `SERVER_PORT`: optional SSH port (defaults to 22)
![Repository Actions secrets]()
The workflow syncs the application to `/var/www/shopnest`, preserves the server-side `.env`, installs production dependencies, restarts `shopnest.service`, and checks `/health`. The server must already have Node.js, npm, rsync, MySQL, the production `.env`, and the systemd service configured. Give the deploy user only the required directory and service permissions.

## Branch Protection – Block Merging When CI Fails

ShopNest uses GitHub Branch Protection Rules to prevent pull requests from being merged into the `main` branch unless all required Continuous Integration (CI) checks pass.


## GitHub Configuration For Branch Protection
1. Open your GitHub repository.
2. Navigate to Settings.
3. Open Rules → Rulesets or Branches.
4. Create a branch protection rule targeting main.
5. Enable Require a pull request before merging.
6. Enable Require status checks to pass before merging.
7. Select these required status checks:
   - Frontend CI
   - Backend CI
8. Enable Require branches to be up to date before merging.
9. Save the configuration.

![Branch Protection]()

## Expected Behavior

**Important:** Run the GitHub Actions workflow at least once before selecting the required status checks. GitHub needs to discover the check names first.

### Expected Branch Protection Behavior

| Frontend CI | Backend CI | Pull Request |
|---|---|---|
| Passed | Passed | Merge Allowed |
| Passed | Failed | Merge Blocked |
| Failed | Passed | Merge Blocked |
| Failed | Failed | Merge Blocked |
| Running | Passed | Merge Blocked |

### CI Failure Example

If a developer pushes code containing an ESLint error or a failing automated test:

1. GitHub Actions automatically starts the CI pipeline.
2. The Frontend CI or Backend CI job fails.
3. GitHub marks the required status check as failed.
4. The pull request cannot be merged while the required check is failing.

The developer must fix the issue, push the updated code, and wait for the CI checks to pass.

### Successful CI Example

When both jobs pass:

- Frontend CI: Success
- Backend CI: Success
- All other required branch rules: Satisfied

GitHub allows the pull request to be merged.

### Why Branch Protection Is Important

- Prevents broken code from reaching production.
- Ensures frontend and backend tests pass before merging.
- Enforces code quality through ESLint.
- Reduces deployment failures.
- Maintains a stable `main` branch.
- Encourages a pull-request-based development workflow.

**Note:** Repository administrators may have bypass permissions depending on the ruleset configuration. Disable bypass permissions if the protection must apply to administrators too.

**ShopNest Policy:** No code should be merged into the `main` branch unless all required CI checks pass.

## Part C: Workflow Architecture


