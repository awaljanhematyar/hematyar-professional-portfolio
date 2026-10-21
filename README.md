# Awal Jan Hematyar — Professional Developer Portfolio

A **React + Tailwind CSS + Supabase** developer portfolio and content management system. Designed for long-term use, with a public-facing site, authenticated admin dashboard, Supabase PostgreSQL, Storage, moderated comments, and private contact messages.

> **Setup status:** The user has already configured a Supabase project locally. This ZIP does not contain the local `.env.local` or any live database data. Production build/deployment and external service integration were **not verified** in this cleanup. See the setup and test steps below.

## Project origin and accuracy

The old portfolio URL `https://awal-jan-hematyar-portfolio.vercel.app/` was **not accessible** during preparation. An independent public résumé, `https://aslicv.com/awaljanhematyar`, provided the candidate name, education, internship, skills, and certificates used for **preview mode**. Please verify every detail before publishing. No fabricated projects or clients were added; projects initially display an intentional empty state. Contact details are in the preview only because they are already public on that résumé.

## Start reading the code

- **`CODE_GUIDE_PS.md`** — easy Pashto guide for learning the architecture.
- **`CODE_MAP.md`** — find any feature, file, function, or CSS area quickly.
- **`REFACTOR_NOTES.md`** — what was changed and what was deliberately preserved.

## Features included in source

- Responsive editorial dark/light frontend with Home, About, Skills, Projects, Journey, Certificates, Contact and moderated Feedback
- Per-project details and optional screenshot gallery
- Admin login and database allowlisted authorization
- Admin CRUD for profile, skills, projects, project screenshots, experience, education, certificates, services, social links, and site settings
- Private contact inbox and comment moderation
- Public submission function with validated form fields, honeypot and database-backed hourly rate limiting
- Resend notification attempt **after** storing a message; admin retry endpoint
- Protected Supabase Storage uploads; 8 MB and MIME restrictions
- Real database-count dashboard statistics
- Empty/loading/error states and mobile admin sidebar

## Requirements

- Node.js 20.19+ or 22.12+ (for modern Vite)
- npm
- A Supabase account and new project
- Optional Resend account **with a verified sending domain** for email notifications

## 1. Run the UI locally (preview mode)

In **Windows PowerShell**:

```powershell
cd "C:\path\to\hematyar-portfolio"
npm install
npm run dev
```

Open `http://localhost:5173`. Without Supabase keys, the website renders preview content, **but admin login, data editing, form submissions and uploads are disabled**. This is intentional: no simulated saving.

## 2. Configure Supabase

1. Create a Supabase project and keep its URL and **publishable** key (or legacy anon key).
2. Run the migration SQL in `supabase/migrations/20261009_initial.sql` using Supabase SQL Editor or `supabase db push` after linking the CLI.
3. Copy `.env.example` to `.env.local`.
4. Add the keys:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLIC_KEY
```

**Never** insert a service-role key or email API secret in a `VITE_` variable. Restart `npm run dev` after changing `.env.local`.

## 3. Provision the administrator securely

1. In Supabase Authentication, create/invite the actual administrator email. Confirm the account as needed and set a password. Do **not** enable public sign-up for administrative access.
2. Run this **once**, in Supabase SQL Editor, replacing the email with your actual admin email:

```sql
insert into public.admin_users(user_id)
select id from auth.users where email = 'YOUR_ACTUAL_ADMIN_EMAIL'
on conflict do nothing;
```

3. Visit `http://localhost:5173/admin/login` and sign in.
4. Unauthorized accounts are rejected by both the UI and database RLS. The `admin_users` table cannot be populated by ordinary client requests.

## 4. Create real published content

Go to the Admin Dashboard and create the **Profile** record first. Then add Skills, Projects, Experience, Education, Certificates, Social Links and optionally Services. Use the **Published** checkbox to display items publicly.

Your new Supabase database starts **empty** by design. Preview résumé content is not automatically inserted into live data, avoiding unreviewed claims.

For project screenshots in **Project Images**, copy the UUID of an existing project and provide it as `project_id`. Uploaded files go to the `portfolio-public` Supabase Storage bucket; assets are publicly readable, while uploads are allowed only for admins.

The CV PDF is an **optional public download**, not a private document. Upload only a version you wish visitors to access.

## 5. Deploy the public submission function

Install/configure Supabase CLI and link your project. Configure secrets using a CLI or the Supabase dashboard:

```powershell
supabase secrets set ALLOWED_ORIGINS="http://localhost:5173,https://YOUR_DOMAIN.vercel.app"
supabase secrets set SUBMISSION_SALT="GENERATE_A_LONG_RANDOM_SECRET_AT_LEAST_20_CHARACTERS"
```

Use a truly random, unique `SUBMISSION_SALT`, not the example value.

Deploy the public function **without JWT verification** because anonymous visitors need to contact you:

```powershell
supabase functions deploy public-submit --no-verify-jwt
```

**Security:** The function performs server-side validation and atomic, one-hour rate limiting before using the service-role key to insert. Public visitors do **not** have direct insert rights on private tables. Its CORS allowlist should name your actual frontend origins. CORS alone is not bot protection; add Turnstile/CAPTCHA if you face sustained abuse. IP-related metadata is hashed with a salt rather than stored in clear text.

## 6. Optional real email notification

1. Sign up with an email delivery provider compatible with Resend's API and verify a domain.
2. Set the secrets server-side:

```powershell
supabase secrets set RESEND_API_KEY="YOUR_PRIVATE_RESEND_API_KEY"
supabase secrets set NOTIFY_ADMIN_EMAIL="YOUR_ACTUAL_ADMIN_EMAIL"
supabase secrets set NOTIFY_FROM_EMAIL="Portfolio <portfolio@YOUR_VERIFIED_DOMAIN>"
```

3. Deploy the retry function with JWT verification enabled:

```powershell
supabase functions deploy retry-notification
```

The public submission function stores the message first. It then attempts email notification. Failed attempts remain in Supabase with `notification_status = failed`. They can be retried in the Admin Dashboard. **Email `sent` reflects provider API acceptance, not guaranteed delivery to the inbox.**

If you do not configure Resend, contact messages still save in the database; their notification status shows failed with a configuration error. The Admin Dashboard always retains the message.

## 7. Deploy the frontend to Vercel

- Push the folder to your own GitHub repository.
- Import the repository to Vercel as a **Vite** project.
- Build command: `npm run build`
- Output folder: `dist`
- Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` in Vercel environment variables.
- Redeploy after changing environment variables.
- Add your deployed origin to the Supabase `ALLOWED_ORIGINS` secret and redeploy Edge Functions.
- Configure Supabase Auth site URL and redirect URLs to match production.
- A `vercel.json` SPA rewrite is included for client-side routing.

## 8. Production checks (must be performed after configuration)

- [ ] `npm install` and `npm run build` succeed
- [ ] Unauthenticated visitor cannot read `contact_messages` or `comments` private emails
- [ ] Unauthorized authenticated account cannot perform CRUD or upload files
- [ ] Admin login works and remains authenticated across refresh
- [ ] Published records appear; drafts remain hidden
- [ ] Contact message saves even when email provider is unavailable
- [ ] Rate limit rejects excessive submissions
- [ ] Comments are private until approved
- [ ] Project media uploads and public CV download work
- [ ] Email provider acceptance and failed-retry behavior work
- [ ] Responsive design tested at 360, 768, 1024 and 1440 px
- [ ] Keyboard navigation, contrast, image alt text and focus rings verified
- [ ] No secret or service role key appears in the compiled JavaScript

## Project layout

```text
src/
  components/SiteChrome.jsx    # Site header, footer, shared section components
  components/SkillIcon.jsx      # Technology icon registry and fallback
  config/adminContent.js       # Admin editor field definitions / menu items
  contexts/AuthContext.jsx     # Session and admin authorization checks
  data/preview.js              # Clearly labeled preview-only public résumé content
  hooks/usePortfolio.js        # Public Supabase content queries
  lib/api.js                   # CRUD, storage, submit/retry calls
  lib/supabase.js              # Safe browser client configuration
  pages/Portfolio.jsx          # Public website and project details
  pages/Admin.jsx              # Admin login, CRUD, moderation and inbox
  styles/index.css             # Tailwind import and responsive design system
  App.jsx                      # Routes and admin gate
  main.jsx                     # React entrypoint
supabase/
  migrations/20261009_initial.sql
  functions/public-submit/index.ts
  functions/retry-notification/index.ts
```

## Technical notes / limitations

- The initial website uses client-side rendering. For excellent indexing of dynamic project pages, add Vite-compatible pre-rendering or server rendering in a later phase. Updating the document title alone does not fully solve crawler SEO.
- Theme preference is saved in localStorage. Passwords are never stored there.
- The email service requires configuration and an external provider (subject to its current pricing/free-tier limits).
- Admin form validation is basic; strict permissions are enforced by RLS. The database and Edge Functions must be deployed and security-tested before production use.
- Public project image galleries and profile file paths accept URLs only from admin-owned content; only authorized admins can edit them.
- Storage replacement currently creates a fresh object and updates its URL. Old unused files must be cleaned in Supabase Storage if you want to reclaim space.
- Avoid providing direct personal reference contact details in a public portfolio without their permission.

## Design direction

Dark navy + soft lime, editorial typography, two-tone atmospheric hero, curated section hierarchy, quiet motion and minimal visual clutter. Theme defaults to dark for first-time visitors and remembers an explicit light/dark choice. The admin uses the same design tokens as the public site.

## Cleanup notice

This archive is a readability-focused refactor. It excludes `.env.local` even though the uploaded backup contained it. React/Supabase behavior has not been fully regression-tested after the refactor. Run `npm install`, `npm run build`, and a real UI smoke test before deploying.
# hematyar-professional-portfolio

## Atelier North Interiors case study

The existing Projects section and detail route include **Atelier North Interiors**, a fictional interior design portfolio demonstration.

- [Live Demo](https://atelier-north-interiors.vercel.app)
- [GitHub Repository](https://github.com/awaljanhematyar/atelier-north-interiors)
- Stack: React, Vite, Tailwind CSS and React Router.
- Cover: `public/projects/atelier-north-interiors.webp`, derived from an actual live-site browser screenshot.

`src/data/atelierNorth.js` adds this source-managed case study alongside the existing published CMS projects without changing their records or order. If the CMS publishes the same slug, its record takes priority and the entry is not duplicated. Existing design, administration, Supabase configuration and other portfolio sections are preserved; no database migration or credential change is needed.

Run the integration regression checks with `node --test src/data/atelierNorth.test.mjs`, the existing `npm run check`, and `npm run build`.

The studio, its concepts and testimonials are clearly fictional; its forms do not deliver messages or book appointments. Incorporated reference-photo licensing is documented in the [Atelier North image credits](https://github.com/awaljanhematyar/atelier-north-interiors/blob/main/IMAGE_CREDITS.md).
