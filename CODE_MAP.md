# Code Map — Hematyar Professional Portfolio

> **Start here when you want to find a feature or understand a code change.**
> Stack: React 19 + Vite + Tailwind CSS 4 + Supabase.
> This is a code-navigation guide, not a claim of production testing.

## 1. Find the file by the feature

| I want to change… | Open this file | Search keyword |
|---|---|---|
| All page URLs/routes | `src/App.jsx` | `Route path=` |
| Who can open Admin | `src/App.jsx` | `AdminGate` |
| React startup | `src/main.jsx` | `createRoot` |
| Navbar / menu | `src/components/SiteChrome.jsx` | `SiteHeader` |
| Dark mode (default) / theme switch | `src/components/SiteChrome.jsx` | `ThemeButton` |
| Website footer | `src/components/SiteChrome.jsx` | `SiteFooter` |
| Uploaded profile photo / fallback initials | `src/pages/Portfolio.jsx` | `IntroShape` |
| Profile photo rounding / remove frame | `src/styles/index.css` | `11 PROFILE IMAGE OVERRIDES` |
| Skills technology logos and their colors | `src/components/SkillIcon.jsx` | `skillIcons` |
| Skills card size and spacing | `src/styles/index.css` | `SKILLS SECTION` or `.skill-pill` |
| Home / About / Skills / Projects / Journey / Contact | `src/pages/Portfolio.jsx` | `PortfolioBody` |
| Project detail page / gallery | `src/pages/Portfolio.jsx` | `ProjectDetails` |
| Contact & public comments form | `src/pages/Portfolio.jsx` | `ContactForm` |
| Admin login UI | `src/pages/Admin.jsx` | `AdminLogin` |
| Admin sidebar / dashboard layout | `src/pages/Admin.jsx` | `AdminDashboard` |
| All Admin form input fields | `src/config/adminContent.js` | `definitions` |
| Admin menu sections | `src/config/adminContent.js` | `navigation` |
| Admin editor: Save / image upload | `src/pages/Admin.jsx` | `RecordForm` |
| Admin list/create/delete | `src/pages/Admin.jsx` | `ContentManager` |
| Comments & messages moderation | `src/pages/Admin.jsx` | `Moderation` |
| Sign in, sign out, admin lookup | `src/contexts/AuthContext.jsx` | `refresh` or `signIn` |
| Public DB data fetching | `src/hooks/usePortfolio.js` | `load` |
| Supabase browser connection | `src/lib/supabase.js` | `createClient` |
| Database CRUD / Storage upload | `src/lib/api.js` | `saveRecord`, `uploadPublicAsset` |
| Contact/feedback submission server | `supabase/functions/public-submit/index.ts` | `Deno.serve` |
| Retry failed email notification | `supabase/functions/retry-notification/index.ts` | `Deno.serve` |
| Database schema, permissions, storage | `supabase/migrations/20261009_initial.sql` | `CREATE TABLE`, `CREATE POLICY` |
| Local preview (only when not configured) | `src/data/preview.js` | `preview` |
| Main CSS and mobile rules | `src/styles/index.css` | `STYLE MAP` |
| Vercel fallback for React Router | `vercel.json` | `rewrites` |

## 2. What happens after the visitor opens the website?

1. `src/main.jsx` creates React and wraps the app with the router and `AuthProvider`.
2. `src/App.jsx` decides whether to show homepage, project details, or Admin screens.
3. `src/hooks/usePortfolio.js` gets published content from Supabase through `src/lib/api.js`.
4. `src/pages/Portfolio.jsx` renders the public site; `SkillIcon.jsx` selects logo icons.
5. `src/styles/index.css` provides the dark-first responsive design and custom overrides.

**Important:** Content stored in Supabase isn't inside the ZIP. Your existing live content remains in your Supabase project.

## 3. What happens when Admin clicks “Save Changes”?

1. Admin goes to `/admin/dashboard` and chooses a section.
2. `src/config/adminContent.js` defines which fields the generic form shows.
3. `RecordForm` in `src/pages/Admin.jsx` turns field values into database-friendly values.
4. `src/lib/api.js` runs insert/update, or the profile/settings singleton upsert is called.
5. Supabase RLS policies decide whether the user is actually permitted to change data.
6. The updated information appears publicly if the record is published.

> **Editing an Admin field does not create a new database column.** For new fields, update both the database migration and the Admin form.

## 4. Contact message and comments data flow

- Public `ContactForm` calls `submitPublic()` in `src/lib/api.js`.
- The `public-submit` Edge Function validates, rate-limits, and saves the record.
- Contact notifications are attempted separately and can fail while the message remains stored.
- Admin uses the `Moderation` screen to see messages and approve comments.
- Public visitors see only approved comments from the `get_approved_comments` RPC.

## 5. CSS section index

Open `src/styles/index.css`, then press **Ctrl+F** and search:

- `01 TOKENS`: primary colors, default dark mode and `.light` overrides
- `02 SHARED`: common buttons, typography and global layout
- `03 HEADER`: desktop/mobile navbar
- `04 HERO`: top part of homepage
- `05 ABOUT`: About section
- `05 SKILLS`: technology pills/cards
- `06 PROJECT`: projects and education/experience
- `07 CONTACT`: contact form and public comments
- `08 PROJECT DETAILS`: individual project page
- `09 ADMIN`: Dashboard/editor styles
- `10 RESPONSIVE`: mobile breakpoints
- `11 PROFILE IMAGE OVERRIDES`: clean image without outer frame, 24px rounded corners

**Do not move CSS blocks casually:** later selectors override earlier ones. This was preserved deliberately.

## 6. Useful VS Code navigation shortcuts (Windows)

| Shortcut | Action |
|---|---|
| `Ctrl + P` | Find a file by name |
| `Ctrl + Shift + F` | Search text across the whole project |
| `Ctrl + F` | Search inside the current file |
| `Ctrl + Shift + O` | Browse symbols/functions in current file |
| `F12` | Go to definition (when language service recognizes it) |
| `Alt + Left` | Go back to previous code location |
| `Ctrl + /` | Toggle comment on selected lines |
| `Shift + Alt + F` | Format the active file (formatter extension required) |

## 7. Suggested workflow before each change

1. Create a Git commit or backup.
2. Find the responsible file in the table above.
3. Change one small thing; avoid unrelated rewrites.
4. Run `npm run dev` and check the affected screen.
5. Run `npm run build` before deployment.
6. For Supabase schema/security changes, test authorization separately.

## 8. Safe formatting

The repository contains `.prettierrc.json` and VS Code extension recommendations.
To install Prettier in your own project (requires npm internet access):

```powershell
npm install --save-dev prettier
npx prettier --write "src/**/*.{js,jsx,css}" "supabase/functions/**/*.ts"
```

Use `npm run build` afterward and inspect Git diff. Comments explain non-obvious behavior; they do not replace testing.

## 9. Caution: environment files

The uploaded source ZIP contained `.env.local`. It is intentionally **not** included in this cleaned archive. Reuse the one saved on your PC, or recreate it following `.env.example`. Never commit `.env.local`, database passwords, or private Edge Function secrets to GitHub.
