import Link from "next/link";
import { Github } from "lucide-react";

export default function NotFound() {
  return (
    <main className="app-shell min-h-screen p-4 text-[var(--foreground)] sm:p-6">
      <section className="premium-surface mx-auto mt-16 max-w-3xl overflow-hidden rounded-2xl">
        <div className="flex items-center gap-2 border-b border-[var(--border)] bg-[var(--surface)] px-4 py-3">
          <span className="h-3 w-3 rounded-full bg-[#ff5f56]" />
          <span className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
          <span className="h-3 w-3 rounded-full bg-[#27c93f]" />
          <span className="ml-3 text-xs text-[var(--muted)]">errors/404.tsx</span>
        </div>
        <div className="p-6 sm:p-8">
          <div className="font-mono text-xs text-[var(--accent-2)]">throw new NotFoundError()</div>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">404.tsx not found</h1>
          <p className="mt-3 text-[var(--muted)]">The page you are looking for does not exist.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/" className="btn-primary px-4">
              Return to Portfolio
            </Link>
            <Link href="/#projects" className="btn-secondary px-4">
              Open Projects
            </Link>
            <a href="https://github.com/ShreyTriesToCode" target="_blank" rel="noopener noreferrer" className="btn-ghost px-4">
              <Github size={16} /> Open GitHub
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
