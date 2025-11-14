# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Setup
```bash
pnpm run setup
```
Installs all dependencies and builds the `core` package (required before development).

### Development
```bash
# Web App (TanStack Start on Cloudflare)
pnpm run dev:web

# API (Hono on Cloudflare Workers)
pnpm run dev:api
```

### Building
```bash
# Build core package (required by both apps)
pnpm run build:core
```

### Deployment
```bash
# Web App to Cloudflare Pages
pnpm run deploy:web

# API to Cloudflare Workers
pnpm run deploy:api
```

### Working with Sub-Applications
Navigate to individual packages for app-specific commands:
```bash
cd apps/web
pnpm dev        # Start dev server on port 3000
pnpm build      # Build for production
pnpm test       # Run Vitest tests
pnpx shadcn@latest add <component>  # Add Shadcn components

cd apps/api
pnpm dev        # Start dev server with remote bindings
pnpm test       # Run Vitest tests
pnpm deploy     # Deploy to Cloudflare Workers
```

### Core Package (packages/core)
```bash
cd packages/core
pnpm build                          # Build the package (TypeScript + tsc-alias)
pnpm better-auth:generate           # Generate Better Auth schema
pnpm drizzle:generate               # Generate Drizzle migrations
pnpm drizzle:migrate                # Run Drizzle migrations
pnpm drizzle:pull                   # Pull schema from database
```

## Architecture

This is a **pnpm monorepo** containing a SaaS application split into two Cloudflare-based services that share common data operations code.

### Monorepo Structure
- `apps/web` - TanStack Start frontend (Cloudflare Pages)
- `apps/api` - Hono backend API (Cloudflare Workers)
- `packages/core` - Shared core library for auth, database, schemas, and queries (@repo/core)

### Package Manager
Uses **pnpm workspaces** (v10.14.0) with workspace protocol for internal dependencies (`@repo/core`).

### Key Dependencies
Build dependencies specified in `onlyBuiltDependencies` (pnpm-workspace.yaml:6-10):
- `@tailwindcss/oxide`
- `better-sqlite3`
- `esbuild`
- `sharp`
- `workerd`

## Web App (`apps/web`)

**Stack**: TanStack Start (React 19), TanStack Router, TanStack Query, Vite, Tailwind CSS v4, Better Auth

**Deployment**: Cloudflare Pages via `wrangler deploy`

**Key Files**:
- `src/routes/` - File-based routing (generates `routeTree.gen.ts`)
- `src/router.tsx` - Router setup with SSR Query integration
- `src/routes/__root.tsx` - Root layout with HTML structure
- `src/server.ts` - Cloudflare Pages entry point
- `wrangler.jsonc` - Cloudflare configuration (compatibility_flags: nodejs_compat)

**TypeScript Config** (tsconfig.json:4-22):
- Strict mode with `noUncheckedIndexedAccess`, `noUnusedLocals`, `noUnusedParameters`
- Path alias: `@/*` → `src/*`
- Bundler module resolution

**Authentication**: Uses Better Auth with social providers (no email/password). Auth tables prefixed with `auth_*`.

**Styling**: Tailwind v4 via Vite plugin. Shadcn components configured with "new-york" style and Zinc base color.

## API (`apps/api`)

**Stack**: Hono v4, Cloudflare Workers, Durable Objects, Workflows

**Entry Point**: `src/index.ts` exports `WorkerEntrypoint` class that delegates to Hono app

**Structure**:
- `src/hono/app.ts` - Main Hono application with typed Bindings
- `src/durable-objects/` - Durable Object implementations
- `src/workflows/` - Cloudflare Workflows

**TypeScript Config** (tsconfig.json:40-44):
- Custom type definitions via `worker-configuration.d.ts` and `service-bindings.d.ts`
- Path aliases: `@/*` → `src/*`, `@/bindings` → service bindings types
- Strict mode with `noUncheckedIndexedAccess`

**Testing**: Vitest with `@cloudflare/vitest-pool-workers` for Workers-specific testing

**Deployment**: Cloudflare Workers via `wrangler deploy` with observability enabled

## Core Package (`packages/core`)

**Purpose**: Shared library providing auth, database access, Zod schemas, and queries. Must be built before using dependent apps.

**Exports** (package.json:5-22):
- `@repo/core/auth/*` - Better Auth setup and server
- `@repo/core/database/*` - Drizzle database initialization
- `@repo/core/zod-schema/*` - Shared validation schemas
- `@repo/core/queries/*` - Reusable queries (e.g., Polar API)

**Build Process**: TypeScript compilation + `tsc-alias` for path resolution

**Database**: Drizzle ORM with PlanetScale serverless driver (MySQL dialect)
- Auth schema auto-generated via Better Auth CLI
- Migration files in `src/drizzle/`
- Tables filter excludes `auth_*` tables from user migrations

**Database Setup** (src/database/setup.ts:6-23):
- `initDatabase()` - Initializes singleton Drizzle instance with PlanetScale connection
- `getDb()` - Returns initialized database or throws error

**Auth Setup** (src/auth/setup.ts:3-28):
- `createBetterAuth()` - Factory for Better Auth instance
- Email/password disabled, social providers only
- Custom model names: `auth_user`, `auth_session`, `auth_verification`, `auth_account`

**Environment Variables** (drizzle.config.ts:7-9):
- `DATABASE_HOST`
- `DATABASE_USERNAME`
- `DATABASE_PASSWORD`

**TypeScript Config**:
- Bundler module resolution
- `noUncheckedIndexedAccess: true`
- Path alias: `@/*` → `src/*`
- Cloudflare Workers types included

## Development Workflow

1. **Initial Setup**: Run `pnpm run setup` to install dependencies and build `core`
2. **Making Changes to core**: Run `pnpm run build:core` before testing in dependent apps
3. **Database Changes**: Use Drizzle commands in `packages/core` to generate/migrate schemas
4. **Auth Schema Updates**: Run `better-auth:generate` after modifying `config/auth.ts`
5. **Deployment**: Both deploy scripts automatically rebuild `core` first

## Important Notes

- **Build Order**: `core` must be built before `web` or `api` can run
- **Path Aliases**: All packages use `@/*` for `src/*` imports
- **TypeScript Strictness**: All packages enforce `noUncheckedIndexedAccess` for safer array/object access
- **Cloudflare Compatibility**: Both apps require `nodejs_compat` flag
- **Shared Types**: Service bindings and worker configuration defined in `apps/api/*.d.ts`
