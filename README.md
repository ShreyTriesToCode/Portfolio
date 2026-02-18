# VSCode Portfolio (Next.js + Supabase)

A VS Code–inspired personal portfolio built with **Next.js (App Router)**, **Tailwind CSS**, **Framer Motion animations**, and **Supabase** for dynamic content + contact messages.

It looks and behaves like a mini editor:
- Explorer sidebar opens “files” (sections)
- Tabs at the top
- Command Palette (`Cmd + K`)
- Animated background + cursor glow
- Dark/Light theme toggle (default dark)
- Supabase status + live contact form saving to DB

---

## Tech Stack
- **Next.js (App Router)**
- **TypeScript**
- **Tailwind CSS**
- **Framer Motion**
- **Supabase** (Postgres + API)

---

## Features
- VS Code–style UI (Explorer + Tabs + Editor)
- Command Palette: `Cmd+K` / `Ctrl+K`
- Dark/Light theme (default: dark)
- Animated grid + aura background (theme-aware)
- Supabase integration:
  - `projects` fetched dynamically
  - `contact_messages` inserts via form
  - Live connection status indicator

---

## Local Setup

### 1) Clone and install
```bash
git clone https://github.com/<your-username>/<your-repo>.git
cd <your-repo>
npm install
