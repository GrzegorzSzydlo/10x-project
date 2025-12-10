# CI/CD Configuration

This project uses GitHub Actions for continuous integration and deployment to Cloudflare Pages.

## Workflows

### Pull Request CI (`pull-request.yml`)

Runs on all pull requests targeting the `master` branch:

- **Lint**: Code quality checks using ESLint
- **Unit Tests**: Runs unit tests with coverage reporting
- **E2E Tests**: Runs end-to-end tests with Playwright
- **PR Comment**: Posts a summary comment with all test results

### Master Branch CI/CD (`master.yml`)

Runs on push to the `master` branch:

- **Lint**: Code quality checks using ESLint
- **Unit Tests**: Runs unit tests with coverage reporting
- **Build**: Builds the application for production
- **Deploy**: Deploys the built application to Cloudflare Pages
- **Status Notification**: Prints deployment status summary

## Required GitHub Secrets

### Application Secrets (used in both workflows)

- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_KEY`: Your Supabase anon/public key
- `OPENROUTER_API_KEY`: Your OpenRouter API key

### E2E Testing Secrets (used in PR workflow only)

- `E2E_USERNAME_ID`: Test user UUID from auth.users
- `E2E_USERNAME`: Test user email
- `E2E_PASSWORD`: Test user password

### Cloudflare Deployment Secrets (used in master workflow only)

- `CLOUDFLARE_API_TOKEN`: Cloudflare API token with Pages:Edit permissions
- `CLOUDFLARE_ACCOUNT_ID`: Your Cloudflare account ID

## Setting up GitHub Secrets

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add each secret listed above with its corresponding value

## GitHub Environments

This project uses two environments:

- **integration**: For E2E testing in pull requests
- **production**: For deployment to Cloudflare Pages from master branch

### Setting up Environments

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Environments**
3. Create two environments: `integration` and `production`
4. Add the required secrets to each environment

## Cloudflare Pages Setup

### Getting Your Cloudflare Credentials

1. **Account ID**:
   - Log in to Cloudflare Dashboard
   - Select your account
   - Copy the Account ID from the URL or account overview

2. **API Token**:
   - Go to **My Profile** → **API Tokens**
   - Click **Create Token**
   - Use the "Edit Cloudflare Workers" template or create custom token with:
     - Permissions: `Account.Cloudflare Pages:Edit`
   - Copy the generated token

3. **Project Name**:
   - Go to **Workers & Pages** in Cloudflare Dashboard
   - Note your Pages project name (or create a new one)

## Local Development

The project is configured to work with Cloudflare's local development environment:

```bash
npm run dev  # Runs on port 3000
```

The Cloudflare adapter is configured with `platformProxy.enabled: true` for local development compatibility.

## Build Output

- **Local/Node**: Previously used `@astrojs/node` adapter
- **Cloudflare Pages**: Now uses `@astrojs/cloudflare` adapter
- Build output: `dist/` directory (optimized for Cloudflare Pages)

## Notes

- The master workflow does **not** run E2E tests to keep deployment fast
- E2E tests are comprehensive and run only on pull requests
- Code coverage reports are uploaded to Codecov for both unit and E2E tests
- Build artifacts are retained for 7 days for debugging purposes
