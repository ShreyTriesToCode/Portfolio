# VS Code Portfolio

A VS Code styled developer portfolio built with Next.js App Router, TypeScript, Tailwind CSS, Framer Motion, and Supabase. Projects are synced from selected GitHub repositories into Supabase, then rendered dynamically on the portfolio.

## Portfolio Features

- GitHub to Supabase project sync
- Local STDIO MCP tools for Codex/manual admin control
- Mobile-first responsive VS Code layout
- Project modal, search, filter, sort, and featured carousel
- Dynamic `/projects/[slug]` case-study pages
- Copy email, project page, GitHub, and demo links
- Skeleton loading and clean error states
- Mobile drawer navigation and command palette with `Cmd+K` / `Ctrl+K`
- Resume preview modal with download fallback
- Difficulty badges, timelines, README summaries, and repository health indicators
- Bottom status bar with Supabase and GitHub sync status
- VS Code style 404 page and fixed bottom status bar

## GitHub Project Auto Sync

The portfolio imports a repository only when both are true:

1. The GitHub repository has the topic `portfolio`
2. The repository root contains `.portfolio.json`

Daily automatic sync is handled by GitHub Actions in `.github/workflows/sync-github-projects.yml`. Manual sync is also available through GitHub Actions `workflow_dispatch`, the local CLI, and MCP.

Run locally:

```bash
npm run sync:github-projects
```

Dry run:

```bash
npm run sync:github-projects -- --dry-run
```

## How to Add a New Project

1. Open the project repository on GitHub.
2. Add the GitHub topic `portfolio`.
3. Add `.portfolio.json` in the repository root.
4. Fill the required fields: `title`, `shortDescription`, and `techStack`.
5. Wait for the daily sync or run the GitHub Action manually.
6. Check the portfolio.

## `.portfolio.json` Template

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
  "demoUrl": "",
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

## MCP Workflow

The local MCP server runs over STDIO and is for Codex/manual admin control only. GitHub Actions is still the scheduler.

Run:

```bash
npm run mcp:portfolio
```

Codex config example:

```toml
[mcp_servers.portfolio]
command = "npm"
args = ["run", "mcp:portfolio"]
```

Available MCP tools:

- `sync_github_projects`
- `list_portfolio_projects`
- `validate_portfolio_repo`
- `generate_portfolio_json_template`
- `get_sync_status`

## Required GitHub Secrets

Add these in GitHub repo settings under Actions secrets:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `PORTFOLIO_GH_TOKEN`

Do not create custom GitHub Actions secrets starting with `GITHUB_`. GitHub reserves that prefix for its own Actions environment variables.

## Required GitHub Actions Variables

Add these in GitHub repo settings under Actions variables:

- `PORTFOLIO_GITHUB_OWNER`
- `PORTFOLIO_TOPIC`
- `PORTFOLIO_CONFIG_FILE`

## Required Local Env Vars

Copy `.env.example` to `.env.local` and fill values:

```bash
cp .env.example .env.local
```

`NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are safe for browser use. `SUPABASE_SERVICE_ROLE_KEY`, `PORTFOLIO_GH_TOKEN`, and `ADMIN_SYNC_SECRET` are server-only and must never be committed.

## Supabase Migration

Run this SQL file in the Supabase SQL Editor:

```text
supabase/migrations/portfolio_github_sync.sql
supabase/migrations/certifications.sql
supabase/migrations/portfolio_security_hardening.sql
supabase/migrations/portfolio_policy_cleanup.sql
supabase/migrations/portfolio_sync_logs_private.sql
supabase/migrations/portfolio_sync_logs_server_only_policy.sql
```

These migrations safely add missing project sync columns, create `github_project_sync_logs`, create a Supabase-backed `certifications` table, enable RLS, add public read policies for portfolio display, keep detailed sync logs server-only, and harden public grants for contact submissions.

## Supabase Certifications

The Certifications section reads from the `certifications` table. Add rows in Supabase Table Editor with at least:

- `title`

Optional fields include `issuer`, `credential_id`, `credential_url`, `description`, `skills`, `issued_at`, `expires_at`, `featured`, and `priority`.

## Local Setup

```bash
git clone https://github.com/ShreyTriesToCode/Portfolio.git
cd Portfolio
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

For a beginner-friendly checklist covering Supabase, GitHub Actions, MCP, local testing, mobile testing, and safe pushing, see [SETUP.md](./SETUP.md).
