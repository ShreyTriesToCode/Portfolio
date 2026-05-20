# Portfolio User Manual

This is the complete beginner-friendly manual for setting up, testing, updating, syncing, and deploying the Shreyansh portfolio at `portfolio.shreybuilds.com`.

The portfolio uses Next.js, TypeScript, Tailwind CSS, Framer Motion, Supabase, GitHub Actions, and a local MCP server.

## 1. Open The Project In VS Code

If you are starting fresh:

```bash
git clone https://github.com/ShreyTriesToCode/Portfolio.git
cd Portfolio
code .
```

If you already downloaded the project, open that existing folder in VS Code.

## 2. Install Dependencies

Run:

```bash
npm install
```

Use Node.js 20 or newer.

## 3. Create `.env.local`

Run:

```bash
cp .env.example .env.local
```

Open `.env.local` and fill only your real local values there.

Required names:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=

PORTFOLIO_GH_TOKEN=
PORTFOLIO_GITHUB_OWNER=ShreyTriesToCode
PORTFOLIO_TOPIC=portfolio
PORTFOLIO_CONFIG_FILE=.portfolio.json

ADMIN_SYNC_SECRET=
```

Important rules:

- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are safe for browser use.
- `SUPABASE_SERVICE_ROLE_KEY`, `PORTFOLIO_GH_TOKEN`, and `ADMIN_SYNC_SECRET` are server-only secrets.
- Do not commit `.env.local`.
- Do not paste real secrets into README, SETUP, screenshots, commits, GitHub issues, or chat.
- Use `PORTFOLIO_GH_TOKEN` instead of `GITHUB_TOKEN`.
- GitHub reserves the `GITHUB_` prefix for Actions internals, so do not create custom secrets or variables starting with `GITHUB_`.

## 4. Run The Portfolio Locally

Run:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

Local checklist:

- Homepage loads.
- Top bar works.
- Sidebar works.
- Dark theme works.
- Light beige theme works.
- Bottom status bar is fixed at the bottom without scrolling.
- Projects load from Supabase.
- Project cards open a modal.
- Project cards show `Live page` and `GitHub repo` buttons when those URLs exist.
- Project modal scrolls internally.
- Resume modal opens or shows the fallback.
- Contact form validates input.

## 5. Check Dark And Light Theme

1. Open the portfolio locally.
2. Click the theme toggle in the top right.
3. Check dark mode first.
4. Switch to light mode.
5. Check sidebar, tabs, project cards, buttons, contact form, modals, and bottom bar.
6. Refresh while light mode is active. It should stay light without flashing the wrong theme.

The light theme should feel like a darker warm beige editor theme with readable text and muted teal/olive actions.

## 6. Verify The Fixed Bottom Status Bar

The VS Code-style status bar should always stay visible at the bottom of the screen.

Check:

- You can see it without scrolling.
- It shows Supabase status, GitHub sync status, project count, last sync, and theme.
- Page content is not hidden behind it.
- On small phones, the status bar can scroll horizontally inside itself.
- Modals and the mobile sidebar layer above the page correctly.

## 7. Test Desktop And Mobile Layout

In Chrome:

1. Right click the page.
2. Click Inspect.
3. Click the device toolbar icon.
4. Test these widths:
   - `320px`
   - `390px`
   - `768px`
   - `1024px`
   - `1440px`
   - a wide desktop size

Checklist:

- No horizontal page scrolling.
- Cards stack cleanly.
- Buttons do not overflow.
- Text stays readable.
- Project modal fits the screen.
- Bottom status bar stays fixed.
- Sidebar opens and closes.
- Command palette opens with `Cmd+K` on Mac or `Ctrl+K` on Windows/Linux.

## 8. Run Code Checks

Run:

```bash
npm run lint
npm run typecheck
npm run build
```

This project currently has `lint`, `typecheck`, and `build` scripts. It does not currently include a `test` script.

## 9. Supabase Setup

In Supabase:

1. Open your Supabase project dashboard.
2. Go to SQL Editor.
3. Run these migration files:

```text
supabase/migrations/portfolio_github_sync.sql
supabase/migrations/certifications.sql
```

Confirm these tables exist:

- `projects`
- `github_project_sync_logs`
- `certifications`
- `contact_messages`
- `profile`, if your current portfolio uses it

Confirm RLS:

- Public users can read `projects`.
- Public users can read `certifications`.
- Public users cannot insert, update, or delete `projects`.
- Public users cannot insert, update, or delete `certifications`.
- Server scripts use `SUPABASE_SERVICE_ROLE_KEY` for project sync writes.
- The contact form keeps using the existing safe client path.

## 10. Add Certifications In Supabase

Open Supabase Table Editor and add rows to `certifications`.

Required field:

- `title`

Useful optional fields:

- `issuer`
- `credential_id`
- `credential_url`
- `description`
- `skills`
- `issued_at`
- `expires_at`
- `featured`
- `priority`

Example values:

```text
title: Introduction To Machine Learning
issuer: NPTEL
credential_id: NPTEL25CS149S233202327
credential_url: https://example.com/credential
description: Practical ML foundations and model evaluation.
skills: {"Machine Learning","Python"}
issued_at: 2025-04
featured: true
priority: 1
```

After adding a row, refresh the portfolio and open the Experience/Certifications section.

## 11. Add A Project To The Portfolio

A GitHub repository is imported only if both are true:

- The repository has the topic `portfolio`.
- The repository root contains `.portfolio.json`.

Steps:

1. Open the project repository on GitHub.
2. Click the gear/settings icon near repository topics.
3. Add topic:

```text
portfolio
```

4. Add a root file named:

```text
.portfolio.json
```

5. Add at least:

```json
{
  "title": "MedFamily",
  "shortDescription": "A mobile-first PWA for family medical records.",
  "techStack": ["React", "TypeScript", "Tailwind CSS", "Supabase"]
}
```

6. Commit that file in the project repository.
7. Run the sync locally or trigger GitHub Actions manually.

Full template:

```json
{
  "title": "MedFamily",
  "slug": "medfamily",
  "category": "Healthcare",
  "featured": true,
  "status": "Active",
  "difficulty": "Major Project",
  "role": "Full Stack Developer",
  "shortDescription": "A mobile-first PWA for family medical records, prescriptions, and medicine reminders.",
  "longDescription": "MedFamily helps families manage medical records, prescriptions, medicine reminders, and patient access in one place.",
  "techStack": ["React", "TypeScript", "Tailwind CSS", "Supabase"],
  "demoUrl": "https://example.com",
  "imageUrl": "",
  "priority": 1,
  "tags": ["healthcare", "pwa", "supabase", "react"],
  "startedAt": "2026-03",
  "completedAt": "",
  "screenshots": [],
  "architectureImage": "",
  "caseStudyPdf": ""
}
```

Notes:

- `demoUrl` creates the `Live page` button.
- The GitHub repo URL is collected automatically from GitHub metadata.
- If `imageUrl`, `screenshots`, or `architectureImage` are empty, image sections are hidden.
- Invalid `.portfolio.json` files are skipped without breaking the whole sync.

## 12. Run GitHub Project Sync Locally

Run:

```bash
npm run sync:github-projects
```

Expected output includes:

- scanned repos
- eligible repos
- imported or updated projects
- skipped repos
- errors

Dry run:

```bash
npm run sync:github-projects -- --dry-run
```

Skipped repos are normal when they do not have the `portfolio` topic or `.portfolio.json`.

## 13. Set Up GitHub Actions Auto Sync

Open your Portfolio repository on GitHub.

Go to:

```text
Settings -> Secrets and variables -> Actions
```

### Add Repository Secrets

Click New repository secret and add:

```text
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
PORTFOLIO_GH_TOKEN
ADMIN_SYNC_SECRET
```

`ADMIN_SYNC_SECRET` is only needed for admin API sync usage, but it is safe to keep configured.

Do not create custom secrets starting with `GITHUB_`.

### Add Repository Variables

Click Variables, then New repository variable, and add:

```text
PORTFOLIO_GITHUB_OWNER=ShreyTriesToCode
PORTFOLIO_TOPIC=portfolio
PORTFOLIO_CONFIG_FILE=.portfolio.json
```

Do not create custom variables starting with `GITHUB_`.

GitHub reserves `GITHUB_` for its own Actions environment variables.

## 14. Run Auto Sync Manually From GitHub

1. Open the Portfolio repository on GitHub.
2. Click Actions.
3. Select `Sync GitHub Projects`.
4. Click Run workflow.
5. Wait for it to finish.
6. Open Supabase and check the `projects` table.
7. Open the portfolio and confirm projects updated.

The workflow also runs daily using this schedule:

```text
30 2 * * *
```

## 15. Run MCP Locally

Run:

```bash
npm run mcp:portfolio
```

MCP is for Codex/manual admin control only. It is not the daily scheduler.

To connect Codex, copy:

```text
.codex/config.example.toml
```

to:

```text
.codex/config.toml
```

or add the same config to:

```text
~/.codex/config.toml
```

Available MCP tools:

- `sync_github_projects`
- `list_portfolio_projects`
- `validate_portfolio_repo`
- `generate_portfolio_json_template`
- `get_sync_status`

## 16. Update The Portfolio Code Safely

Before editing:

```bash
git status
```

Create a branch:

```bash
git checkout -b portfolio-update
```

After making changes:

```bash
npm run lint
npm run typecheck
npm run build
git status
```

Make sure `.env.local` is not listed.

Commit:

```bash
git add .
git commit -m "Update portfolio"
```

Push:

```bash
git push origin portfolio-update
```

Open a Pull Request on GitHub, review changed files, and merge after checks pass.

## 17. Optional Direct Push To Main

This is faster but less safe:

```bash
git add .
git commit -m "Update portfolio"
git push origin main
```

Using a branch and Pull Request is better.

## 18. Deploy Or Redeploy On Vercel

1. Open Vercel.
2. Open the Portfolio project.
3. Confirm the production domain is:

```text
portfolio.shreybuilds.com
```

4. Push or merge the branch to trigger deployment.
5. If needed, open the latest deployment and click Redeploy.

## 19. Add Environment Variables In Vercel

In Vercel:

1. Open Project Settings.
2. Go to Environment Variables.
3. Add the same names from `.env.example`.
4. Use real values only inside Vercel.
5. Do not add old custom `GITHUB_` names.
6. Redeploy after changing environment variables.

Recommended Vercel variables:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
PORTFOLIO_GH_TOKEN
PORTFOLIO_GITHUB_OWNER
PORTFOLIO_TOPIC
PORTFOLIO_CONFIG_FILE
ADMIN_SYNC_SECRET
```

## 20. Verify The Live Portfolio

After deployment:

1. Open `https://portfolio.shreybuilds.com`.
2. Test dark theme.
3. Test light beige theme.
4. Confirm the bottom status bar is fixed.
5. Open Projects.
6. Confirm project cards load from Supabase.
7. Confirm project cards show `Live page` when `demoUrl` exists.
8. Confirm project cards show `GitHub repo` when the repo synced correctly.
9. Open a project modal.
10. Open a case-study page.
11. Open Experience and confirm certifications load.
12. Test the contact section.
13. Test mobile layout on a phone or Chrome DevTools.

## 21. Common Fixes

Supabase URL missing:

- Check `.env.local`.
- Check Vercel environment variables.
- Check GitHub Actions secrets.

Service role key missing:

- Add `SUPABASE_SERVICE_ROLE_KEY` locally, in GitHub Actions secrets, and in Vercel if server sync/API features need it.

GitHub token missing:

- Use `PORTFOLIO_GH_TOKEN`.
- Do not use a custom secret named with the `GITHUB_` prefix.

GitHub Actions variables missing:

- Add `PORTFOLIO_GITHUB_OWNER`.
- Add `PORTFOLIO_TOPIC`.
- Add `PORTFOLIO_CONFIG_FILE`.

Projects not showing:

- Check the repo has topic `portfolio`.
- Check `.portfolio.json` exists at the repository root.
- Check required fields: `title`, `shortDescription`, `techStack`.
- Run `npm run sync:github-projects`.
- Check Supabase `projects` table.
- Check public SELECT RLS policy.

Live page button missing:

- Add `demoUrl` in `.portfolio.json`.
- Run sync again.

GitHub repo button missing:

- Confirm the repo passed the sync filters.
- Check `repo_url` exists in Supabase.

Images showing blank:

- Leave image fields empty if no image exists.
- The UI hides missing image sections.
- If using external images, make sure the URL is public.

Certifications not showing:

- Check the `certifications` table.
- Add at least one row with `title`.
- Confirm public SELECT policy exists.

Theme not changing:

- Click the theme toggle.
- Refresh the page.
- Check that `data-theme` changes on the `html` element.

Status bar overlapping content:

- Confirm the fixed status bar is visible.
- Check mobile safe-area spacing.
- Re-run `npm run build` after CSS changes.

Build failed:

- Read the first real TypeScript or ESLint error.
- Fix it.
- Run `npm run build` again.

`.env.local` appears in git status:

- Stop before committing.
- Confirm `.env.local` is in `.gitignore`.
- Do not commit secrets.

## 22. Final Release Checklist

Before merging or deploying:

- `npm run lint` passes.
- `npm run typecheck` passes.
- `npm run build` passes.
- `.env.local` is not committed.
- Supabase migrations are applied.
- GitHub Actions secrets are set.
- GitHub Actions variables are set.
- Manual sync works.
- Daily sync workflow exists.
- Projects appear in Supabase.
- Projects appear on the portfolio.
- Certifications appear if rows exist.
- Contact form still works.
- Dark theme works.
- Light beige theme works.
- Bottom status bar is fixed.
- Mobile layout works.
- Live site works at `portfolio.shreybuilds.com`.
