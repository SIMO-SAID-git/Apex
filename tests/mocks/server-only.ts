// Vitest-only stand-in for the "server-only" package.
//
// The real package's default export throws unconditionally when resolved
// outside a bundler that understands the "react-server" export condition
// (see node_modules/server-only/package.json) — Next.js's build resolves it
// to a no-op in that context, but plain Node/Vitest does not. This stub is
// aliased in vitest.config.ts purely so unit tests can import
// lib/services/profile-service.ts, lib/auth/session.ts, etc. directly.
// It has no effect on the actual Next.js build or runtime, where the real
// "server-only" package (and its client-import guard) is still used.
export {};
