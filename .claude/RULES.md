# Development Rules & Guidelines

This document contains strict rules and best practices for AI assistants and developers working on this codebase.

## TanStack Start & Server Functions

### Server Function Architecture

**RULE 1: Never nest server function calls**
- ❌ WRONG: Call a `createServerFn` from within another server function handler
- ✅ CORRECT: Call `auth.api.*` or other server logic directly within the server function handler
- ✅ CORRECT: Call server functions from loaders, actions, or client code

```typescript
// ❌ WRONG - Nested server function calls
export const myServerFn = createServerFn({ method: "GET" })
  .handler(async () => {
    const result = await anotherServerFn(); // ❌ Don't do this
    return result;
  });

// ✅ CORRECT - Direct logic in handler
export const myServerFn = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async () => {
    const auth = getAuth();
    const req = getRequest();
    const data = await auth.api.someMethod({ headers: req.headers }); // ✅ Do this
    return data;
  });

// ✅ CORRECT - Call server functions from loaders
export const Route = createFileRoute("/my-route")({
  loader: async () => {
    const result = await myServerFn(); // ✅ This is fine
    return result;
  },
});
```

**RULE 2: Apply middleware to ALL server functions that need authentication**
- Every server function that calls `auth.api.*` methods MUST have `.middleware([authMiddleware])`
- The middleware sets up the user context required for authentication

```typescript
// ❌ WRONG - Missing middleware
export const getUserData = createServerFn({ method: "GET" })
  .handler(async () => {
    const auth = getAuth();
    const data = await auth.api.getSession(); // ❌ May fail without middleware
    return data;
  });

// ✅ CORRECT - Middleware applied
export const getUserData = createServerFn({ method: "GET" })
  .middleware([authMiddleware]) // ✅ Middleware sets up auth context
  .handler(async () => {
    const auth = getAuth();
    const data = await auth.api.getSession();
    return data;
  });
```

**RULE 3: Never import server-only utilities in client components**
- `requireUser()`, `requireOrganization()`, `withUser()`, etc. use `AsyncLocalStorage` which cannot run in browsers
- ❌ NEVER call these functions in React components
- ✅ Use route loader data or context instead

```typescript
// ❌ WRONG - Server utilities in component
import { requireUser } from "@/core/middleware";

function MyComponent() {
  const user = requireUser(); // ❌ This will break the client bundle
  return <div>{user.name}</div>;
}

// ✅ CORRECT - Use loader data
import { getRouteApi } from "@tanstack/react-router";

const routeApi = getRouteApi("/my-route");

function MyComponent() {
  const { user } = routeApi.useLoaderData(); // ✅ Get data from loader
  return <div>{user.name}</div>;
}
```

**RULE 4: Organize server functions in dedicated files**
- Create server function files separate from route files
- Route files should import and call server functions, not define them inline
- This prevents server-only code from leaking into client bundles

```typescript
// ✅ CORRECT Structure
// src/core/functions/organizations.ts - Server functions here
export const getUserOrganizations = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async () => { /* ... */ });

// src/routes/my-route.tsx - Import and use
import { getUserOrganizations } from "@/core/functions/organizations";

export const Route = createFileRoute("/my-route")({
  loader: async () => {
    const { organizations } = await getUserOrganizations();
    return { organizations };
  },
});
```

## Logging

**RULE 5: Only log errors, never info/warn in production code**
- Remove all `logger.info()` and `logger.warn()` calls
- Only keep `logger.error()` for actual error cases
- Less noise = easier debugging

```typescript
// ❌ WRONG - Info logging
logger.info("Fetching organizations");
const orgs = await getOrganizations();
logger.info("Organizations fetched", { count: orgs.length });

// ✅ CORRECT - Only errors
try {
  const orgs = await getOrganizations();
  return orgs;
} catch (error) {
  logger.error("Failed to fetch organizations", error); // ✅ Only log errors
  throw error;
}
```

**RULE 6: Always log caught errors (don't silently swallow them)**

```typescript
// ❌ WRONG - Silent error
try {
  await doSomething();
} catch (error) {
  // Silent failure - bad!
}

// ✅ CORRECT - Log the error
try {
  await doSomething();
} catch (error) {
  logger.error("Failed to do something", error);
  // Then handle it appropriately
}
```

## Better Auth Integration

**RULE 7: All auth.api calls should be in server functions with middleware**
- Move `auth.api.*` calls into `createServerFn` handlers
- Apply `authMiddleware` to ensure proper context
- Call the server function from loaders/actions

```typescript
// ✅ CORRECT - Auth API in server function
export const getOrganizationBySlug = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .inputValidator((data: { slug: string }) => data)
  .handler(async ({ data, context }) => {
    const auth = getAuth();
    const req = getRequest();
    
    const organization = await auth.api.getFullOrganization({
      headers: req.headers,
      query: { organizationSlug: data.slug },
    });
    
    return { organization };
  });
```

## Code Organization

**RULE 8: Follow the monorepo structure**
- `apps/user-application` - Frontend (TanStack Start)
- `apps/data-service` - Backend API (Hono)
- `packages/data-ops` - Shared code (must be built first)

**RULE 9: Path aliases**
- Use `@/*` for `src/*` imports in all packages
- Use `@repo/*` for workspace packages

## TypeScript

**RULE 10: Strict mode compliance**
- `noUncheckedIndexedAccess: true` is enabled - always check array/object access
- Use optional chaining and nullish coalescing

```typescript
// ❌ WRONG
const firstOrg = organizations[0]; // May be undefined

// ✅ CORRECT
const firstOrg = organizations[0]; // TypeScript will warn
if (firstOrg) {
  // Use firstOrg safely
}

// ✅ CORRECT - Optional chaining
const orgName = organization?.name ?? "Unknown";
```

## Build & Deployment

**RULE 11: Always build data-ops first**
- Run `pnpm run build:data-ops` before building apps
- Deploy scripts automatically handle this

**RULE 12: Check for AsyncLocalStorage leaks**
- If build fails with "AsyncLocalStorage is not exported by __vite-browser-external"
- Check for server-only imports in components or route files
- Move server logic to dedicated server function files

## Testing Checklist

Before committing changes, verify:
- [ ] Build succeeds: `pnpm build`
- [ ] Lint passes: `pnpm biome check --write .`
- [ ] No server-only code in client bundles
- [ ] All server functions have appropriate middleware
- [ ] No nested server function calls
- [ ] Only error logs remain (no info/warn)
- [ ] All caught errors are logged

## Quick Reference

### Good Patterns ✅

1. Server function with middleware → Called from loader → Data used in component
2. Direct auth.api calls in server function handlers
3. Error logging only
4. Server functions in dedicated files (not inline in routes)
5. Components use `useLoaderData()` or `useRouteContext()`

### Bad Patterns ❌

1. Server function calling another server function
2. auth.api calls without middleware
3. Info/warn logging everywhere
4. Server functions defined inline in route files
5. Components calling `requireUser()` or other server utilities
6. Silent error swallowing (catch without logging)

---

**Remember**: When in doubt, check if the pattern is already used correctly elsewhere in the codebase!
