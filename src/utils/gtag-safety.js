// Bridge to the TypeScript implementation. This ensures imports that
// resolve to `.js` still get the typed runtime initializer from
// `gtag-safety.ts`.
// Re-export the TypeScript implementation explicitly to avoid
// resolving back to this .js file and causing a circular import.
export { default, ensureGtag } from './gtag-safety.ts';
