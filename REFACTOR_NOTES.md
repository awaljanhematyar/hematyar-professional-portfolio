# What changed in this cleanup

## Goal
Improve code navigation and explain important logic **without intentionally changing runtime features or database data**.

## Changed
- Added explanatory comments to key React, data, auth, storage, Edge Function and migration files.
- Moved skill logo selection from `src/pages/Portfolio.jsx` to `src/components/SkillIcon.jsx`.
- Moved shared admin field/menu definitions from `src/pages/Admin.jsx` to `src/config/adminContent.js`.
- Added labeled JSX page sections in `Portfolio.jsx`.
- Fixed indentation for the `skill-pill` JSX block; simplified the `RecordForm` effect to an explicit block without changing its behavior.
- Added a CSS style map and named sections, keeping stylesheet order intact.
- Removed a second redundant `.hero-profile-image` CSS rule that repeated identical properties; retained rounded corners and no frame.
- Added `CODE_MAP.md`, `CODE_GUIDE_PS.md`, formatting configuration and VS Code extension suggestions.
- Excluded the uploaded `.env.local` file from this shared ZIP.

## Not changed
- Supabase table schema, RLS policy logic and storage permissions.
- Main website content, public routes, dark-mode default, profile image style, and Admin functionality.
- Supabase database records, user accounts or any live deployments.

## Verification
- Parsed every JS / JSX / TS / MJS source file with the TypeScript parser; syntax diagnostics were zero at packaging time.
- Verified relative imports resolve to local files.
- Not run: `npm install`, production build, runtime/e2e tests, external Supabase tests. These must run on your own machine or a configured build environment.

## Files intentionally omitted
- `.env.local` from the user's uploaded backup (environment configuration; not source code).
- `node_modules`, `dist`, `.git` (not part of this uploaded archive).
