# AGENTS.md - Agent Coding Guidelines

This file guides agentic coding systems (Claude, Cursor, Copilot, etc.) when working in this repository.

## Commands

### Build & Test

```bash
# Single test file (from package directory)
pnpm test -- path/to/test.test.ts    # Run one test file
pnpm test -- --watch                 # Run tests in watch mode

# Full monorepo
pnpm run build                        # Build all packages
pnpm run test                         # Test all packages
pnpm run typecheck                    # TypeScript checks
pnpm run lint                         # Fix lint issues
pnpm run check                        # Lint + format
```

### Development

```bash
pnpm run setup                        # Initial setup (required first)
pnpm run dev:web                      # Dev: web app (port 3000)
pnpm run dev:api                      # Dev: API (Hono + Workers)
pnpm run build:core                   # Rebuild core package (needed after changes)
```

## Code Style

### Imports & Organization

- **Path aliases**: Use `@/*` for `src/*`, `@repo/*` for workspace packages
- **Order**: External → internal paths → relative imports
- **Server functions**: Keep in dedicated `src/server/functions/*.ts` files (never inline in routes)
- **Avoid**: Importing server-only utilities (`requireUser`, `getDb`) in client components

### TypeScript & Types

- **Strict mode**: `noUncheckedIndexedAccess: true` - always check array/object access
- **Null safety**: Use optional chaining (`?.`) and nullish coalescing (`??`)
- **No `any`**: Disabled linting rule but avoid unless necessary

### Formatting & Linting

- **Formatter**: Biome (2 spaces, 100 char line width, double quotes)
- **Trailing commas**: All (enforced)
- **No unused vars/imports**: Strictly enforced, auto-fix with `pnpm run lint`

# Facade Functions

FacadeConstraints {

- Apply only to functions in `*-model.ts` files.
- Function names must follow `<action><Entity><OptionalWith...><DataSource><OptionalBy...>()` pattern.
- Allowed actions: save | retrieve | update | delete.
- Entity names are singular, in PascalCase.
- Use “With…” to indicate included relations before “From/In/ToDatabase”.
- Use “By…” to indicate lookup key(s) last; key names must match schema fields exactly.
- Use “And” to chain multiple included relations or keys.
- Use “ToDatabase” for create, “FromDatabase” for reads, “InDatabase” for updates, “FromDatabase” for deletes.
- Facades must perform a single database operation (no business logic).
- Facades must always return raw Prisma results (no transformations).
- Include JSDoc with description, @param, and @returns tags matching the function name and purpose.
- Prefer explicit Prisma includes/selects; avoid `include: { *: true }`.
- Function bodies must use the `prisma.<entity>.<operation>` pattern directly.
  }

### Error Handling

- **Log errors only**: `logger.error()` in catch blocks; no `info`/`warn` in production code
- **Never swallow errors**: Always log caught errors before handling
- **Throw intentionally**: Let caller decide what to do with error
- **Server functions**: Use `.inputValidator()` for Zod schema validation

## Critical Rules (from .claude/RULES.md)

1. **No nested server functions**: Call `auth.api.*` directly in handlers, not other server functions
2. **Middleware required**: All `createServerFn` calling `auth.api.*` must have `.middleware([authMiddleware])`
3. **Server code isolation**: Never import `requireUser()`, `getDb()` in React components; use loader data instead
4. **Build order**: `core` package must be built before `web`/`api` can run
5. **Build error fix**: "AsyncLocalStorage" errors indicate server code leaked into client bundle

## Testing Checklist

Before committing:

- [ ] `pnpm run build` succeeds
- [ ] `pnpm run lint` passes
- [ ] No server-only code in client bundles
- [ ] All auth server functions have middleware
- [ ] No nested server function calls
- [ ] Only error logs remain (no info/warn)
- [ ] All caught errors logged
