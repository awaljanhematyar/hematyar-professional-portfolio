# Phase 1 — Portfolio Discovery and Architecture

Date: 9 October 2026

## Source limitations

The existing primary URL `https://awal-jan-hematyar-portfolio.vercel.app/` could not be opened. Therefore no visual, responsiveness, code quality, or page-level claims about **that existing site** have been verified. A separate public résumé for Awal Jan Hematyar was available at `https://aslicv.com/awaljanhematyar`. The details below are sourced from that site, NOT extracted from the original Vercel website.

## Secondary-source content inventory — requires owner's confirmation

| Field | Source-supported content |
|---|---|
| Name | Awal Jan Hematyar |
| Title | Front end developer |
| Location | Kabul, Afghanistan |
| Education | B.S. Computer Science, Information Systems, Kabul University (September 2022–June 2026) |
| Experience | Front-End Developer Intern, Upskill Educational Services (June–December 2024) |
| Selected skills | HTML, CSS, JavaScript, React.js, Next.js, Tailwind CSS, Git, GitHub, MongoDB, Firebase, REST API, UI/UX Design |
| Certificates | Upskill Front-End Development Bootcamp; Introduction to Front-End Development (Coursera); English Language Diploma; Practical English Language |
| Professional email | Listed on the public AsliCV profile; included in preview only |
| LinkedIn | Listed on the public AsliCV profile; included in preview only |
| Verified projects | **None identified in accessible material**; do not invent project names |
| CV file | Public résumé mentions a download; no original PDF imported |
| Image | Public résumé displays a photo but no image was imported or reproduced |

## Recommendations

1. Prioritize authentic professional identity and strong project presentation over empty claims or template gimmicks.
2. Maintain a clear primary action for work and contact.
3. Create a content-managed portfolio with drafts/publishing controls and structured project detail pages.
4. Separate visitor-private contact/comment data from public read access.
5. Use allowlisted Supabase auth, RLS, server-side Edge submission functions, restricted file upload permissions.
6. Keep functionality honest while Supabase and email provider credentials are missing.

## Visual proposal

Editorial dark navy (#08121d) + fresh lime (#b8ee7c), Manrope headings, DM Sans body, generous whitespace, responsive grids, subtle code motifs, crisp project cards and a polished dark/light admin.

## Public sitemap

- `/` — Home, About, Skills, Selected Work, Experience/Education, Certifications/Services, Contact, Feedback
- `/projects/:slug` — published project detail page and optional gallery
- `/admin/login` — Supabase email/password sign in
- `/admin/dashboard` — protected content studio (tabs via querystring)

## Supabase schema overview

- `admin_users`: allowlisted administrators only
- `profiles`, `site_settings`: singleton content/settings
- `skills`, `projects`, `project_images`, `experience`, `education`, `certificates`, `services`, `social_links`: published content
- `comments`: private emails/status, public read via narrow secure function
- `contact_messages`: private enquiries and notification status
- `submission_rate_limits`: hashed identities with 1-hour counters

## Deployment dependencies

A real Supabase project URL + publishable key, a pre-provisioned Auth user, SQL migration applied, Edge Functions deployed, `ALLOWED_ORIGINS` and `SUBMISSION_SALT` configured, and optional verified Resend sender domain are still required. No production tests have yet been run.

## Development phases

1. Discovery and content verification (this report)
2. React/Vite + Tailwind UI foundation (source included)
3. PostgreSQL + RLS security (migration included, not applied)
4. Auth + CRUD admin dashboard (source included, not connected)
5. Public portfolio, project pages, contact and comments (source included)
6. Edge Functions and email integrations (source included, not deployed)
7. Local dependency installation and build/test
8. Supabase configuration and remote security tests
9. Deployment, production QA and accessibility/performance audit

## Status

**Source delivered, but not production-deployed or fully tested.** All claims in this document are carefully distinguished between observed secondary-source facts, design recommendations and unverified/live-service implementation status.
