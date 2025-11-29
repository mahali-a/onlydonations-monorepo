# OnlyDonations API

Cloudflare Worker API service with Hono, queue consumers, and durable objects.

## 🌍 Environments

This project uses Wrangler environments for staging and production deployments.

### Environment Overview

| Environment | Worker Name                     | Domain                        | Database              |
|-------------|---------------------------------|-------------------------------|-----------------------|
| Development | (local)                         | `localhost:8787`              | `onlydonations-db-stg`|
| Staging     | `onlydonations-api-staging`     | `api.stg.onlydonations.com`   | `onlydonations-db-stg`|
| Production  | `onlydonations-api-production`  | `api.onlydonations.com`       | `onlydonations-db-prod`|

### Deployment Commands

```bash
# Local development (uses top-level config)
bun run dev

# Deploy to STAGING
bun run deploy:staging
# Or: wrangler deploy --env staging

# Deploy to PRODUCTION
bun run deploy:production
# Or: wrangler deploy --env production
```

### Setting Secrets

Secrets must be set per environment:

```bash
# Staging secrets
npx wrangler secret put RESEND_API_KEY --env staging
npx wrangler secret put PAYSTACK_SECRET_KEY --env staging

# Production secrets
npx wrangler secret put RESEND_API_KEY --env production
npx wrangler secret put PAYSTACK_SECRET_KEY --env production
```

### Local Development Secrets

For local development, put secrets in `.dev.vars` (not committed to git):

```bash
# Copy the example file
cp .dev.vars.example .dev.vars

# Edit .dev.vars with your values
```

**Note**: The API uses Wrangler directly (not Vite), so it uses `.dev.vars` for secrets instead of `.env.local`.

## Features

- **Hono** - Lightweight web framework
- **Queue Consumers** - Background job processing
- **Durable Objects** - Stateful campaign tracking
- **D1 Database** - SQLite at the edge
- **R2 Storage** - Object storage for assets
