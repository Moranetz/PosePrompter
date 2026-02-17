# CLAUDE.md — Instructions for AI agents working on PosePrompter

## Project structure

- **Frontend**: React + Vite app in `src/`
- **Backend**: Express API server in `server/`
- **Main component**: `src/PhotoElementRandomizer.jsx` (the monolith — do NOT split into a directory)
- **Components**: `src/components/` (the ONLY component directory — never create a root `components/`)
- **Utilities**: `src/utils/`, `src/hooks/`, `src/api/`, `src/config/`
- **Docs**: `docs/` for any documentation that needs to persist

## Rules

### Never create markdown files in the repo root
All documentation goes in `docs/`. The only root markdown file is `README.md`.
Do NOT create files like `BUG_FIXES.md`, `SECURITY_CHECKLIST.md`, `DESIGN_DOCUMENT.md`,
`PROMPT_FOR_NEXT_AGENT.md`, etc. These are gitignored and will be rejected.

### Never create stub/placeholder components
Do not create component directories with `README.md` files describing planned structures.
Do not create `index.jsx` files that import from files that don't exist yet.
Only create files that contain working code.

### Never create duplicate directories
- Components go in `src/components/` — never in a root-level `components/` directory.
- There is one component directory. Do not create parallel copies.

### Clean up after yourself
- If you create a component, it must be imported and used somewhere.
- If you remove usage of a component, delete the component file too.
- Do not leave orphaned files behind.

### Imports
- Use static imports by default.
- Only use dynamic `await import()` when genuinely needed for code-splitting (lazy-loaded routes)
  or to break circular dependencies.
- Never mix static and dynamic imports of the same module across the codebase — pick one.

### Build verification
- Run `npx vite build` before committing to verify zero warnings and a clean build.

## Build & dev commands

```bash
# Frontend dev server
npm run dev

# Production build (must pass with zero warnings)
npx vite build

# Backend dev server
cd server && npm run dev
```
