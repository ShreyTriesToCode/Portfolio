"use client";

/* eslint-disable @next/next/no-img-element -- Case-study media comes from synced project metadata and may use arbitrary domains. */

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CircleAlert, ExternalLink, GitFork, Github, Star } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { CopyButton } from "@/components/ProjectModal";
import { difficultyTone, normalizeProject, projectTimeline, type PortfolioProject } from "@/lib/projects";
import { safeAssetUrl, userSafeError, withTimeout } from "@/lib/client-utils";
import { isSupabaseConfigured } from "@/lib/supabaseClient";

export default function ProjectCaseStudy({ slug }: { slug: string }) {
  const [project, setProject] = useState<PortfolioProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const loadProject = useCallback(async () => {
    setLoading(true);
    setError(false);
    setErrorMessage("");

    if (!isSupabaseConfigured) {
      setProject(null);
      setError(true);
      setErrorMessage("Supabase environment variables are not configured.");
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await withTimeout(
        supabase.from("projects").select("*").eq("slug", slug).maybeSingle()
      );
      if (error) throw error;
      setProject(data ? normalizeProject(data as Record<string, unknown>) : null);
    } catch (error) {
      console.error("Could not load project case study:", error);
      setProject(null);
      setError(true);
      setErrorMessage(userSafeError(error, "Could not load this project."));
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    loadProject();
  }, [loadProject]);

  if (loading) {
    return (
      <main className="app-shell min-h-screen p-4 text-[var(--foreground)] sm:p-6">
        <div className="premium-surface mx-auto max-w-5xl rounded-2xl p-6">
          <div className="shimmer h-8 w-2/3 rounded-full" />
          <div className="shimmer mt-4 h-28 rounded-2xl" />
        </div>
      </main>
    );
  }

  if (error || !project) {
    return (
      <main className="app-shell min-h-screen p-4 text-[var(--foreground)] sm:p-6">
        <div className="premium-surface mx-auto max-w-3xl rounded-2xl p-6 sm:p-8">
          <div className="text-xs font-medium tracking-[0.16em] text-[var(--muted)]">PROJECT LOOKUP</div>
          <h1 className="mt-3 text-3xl font-semibold">Project not found</h1>
          <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
            {error ? errorMessage || "Could not load this project." : "This case study does not exist in Supabase yet."}
          </p>
          {error ? (
            <button type="button" onClick={loadProject} className="btn-secondary mt-6 mr-3 px-4">
              Retry
            </button>
          ) : null}
          <Link href="/" className="btn-primary mt-6 px-4">
            Return to Portfolio
          </Link>
        </div>
      </main>
    );
  }

  const pageUrl = typeof window === "undefined" ? `/projects/${project.slug}` : window.location.href;
  const screenshots = project.screenshots
    .map((shot) => ({ original: shot, src: safeAssetUrl(shot) }))
    .filter((shot): shot is { original: string; src: string } => Boolean(shot.src));
  const architectureImage = safeAssetUrl(project.architecture_image);

  return (
    <main className="app-shell min-h-screen p-4 text-[var(--foreground)] sm:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <Link href="/#projects" className="btn-ghost px-4">
          <ArrowLeft size={16} /> Back to Projects
        </Link>

        <section className="premium-surface rounded-2xl p-5 sm:p-7">
          <div className="text-xs font-medium tracking-[0.16em] text-[var(--muted)]">CASE STUDY</div>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">{project.title}</h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-[var(--muted-strong)]">{project.short_description}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {project.category ? <Badge>{project.category}</Badge> : null}
            {project.status ? <Badge>{project.status}</Badge> : null}
            {project.role ? <Badge>{project.role}</Badge> : null}
            {project.difficulty ? <span className={`rounded-md border px-2 py-1 text-xs ${difficultyTone(project.difficulty)}`}>{project.difficulty}</span> : null}
          </div>
        </section>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.25fr)_minmax(300px,0.75fr)]">
          <section className="space-y-5">
            <Panel title="Overview">
              <p className="text-sm leading-7 text-[var(--muted)]">{project.long_description || project.short_description}</p>
            </Panel>
            {project.readme_summary ? (
              <Panel title="README summary">
                <p className="text-sm leading-7 text-[var(--muted)]">{project.readme_summary}</p>
              </Panel>
            ) : null}
            <Panel title="Tech stack">
              <div className="flex flex-wrap gap-2">
                {project.tech_stack.map((tech) => <Badge key={tech}>{tech}</Badge>)}
              </div>
            </Panel>
            {project.tags.length ? (
              <Panel title="Tags">
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag) => <Badge key={tag}>{tag}</Badge>)}
                </div>
              </Panel>
            ) : null}
            {screenshots.length ? (
              <Panel title="Screenshots">
                <div className="grid gap-3 sm:grid-cols-2">
                  {screenshots.map((shot) => (
                    <img key={shot.original} src={shot.src} alt={`${project.title} screenshot`} className="rounded-2xl border border-[var(--border)] shadow-[var(--shadow-card)]" />
                  ))}
                </div>
              </Panel>
            ) : null}
            {architectureImage ? (
              <Panel title="Architecture">
                <img src={architectureImage} alt={`${project.title} architecture`} className="rounded-2xl border border-[var(--border)] shadow-[var(--shadow-card)]" />
              </Panel>
            ) : null}
          </section>

          <aside className="space-y-5">
            <Panel title="Repository health">
              <div className="grid grid-cols-3 gap-2 text-xs">
                <Metric icon={<Star size={14} />} label="Stars" value={project.stars} />
                <Metric icon={<GitFork size={14} />} label="Forks" value={project.forks} />
                <Metric icon={<CircleAlert size={14} />} label="Issues" value={project.open_issues} />
              </div>
              <div className="mt-3 text-xs text-[var(--muted)]">Primary language: {project.language || "Not reported"}</div>
            </Panel>
            <Panel title="Timeline">
              <div className="grid gap-2">
                {projectTimeline(project).map((item) => (
                  <div key={item.label} className="flex justify-between gap-3 text-xs">
                    <span className="text-[var(--muted)]">{item.label}</span>
                    <span className="text-right">{item.value}</span>
                  </div>
                ))}
              </div>
            </Panel>
            <div className="grid gap-2">
              {project.demo_url ? <a href={project.demo_url} target="_blank" rel="noopener noreferrer" className="btn-primary px-3"><ExternalLink size={16} /> Live page</a> : null}
              {project.repo_url ? <a href={project.repo_url} target="_blank" rel="noopener noreferrer" className="btn-secondary px-3"><Github size={16} /> GitHub repo</a> : null}
              {project.case_study_pdf ? <a href={project.case_study_pdf} target="_blank" rel="noopener noreferrer" className="btn-secondary px-3">Case study PDF</a> : null}
              <CopyButton value={pageUrl} label="Copy page link" />
              {project.repo_url ? <CopyButton value={project.repo_url} label="Copy GitHub link" /> : null}
              {project.demo_url ? <CopyButton value={project.demo_url} label="Copy live link" /> : null}
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="premium-card rounded-2xl p-5">
      <h2 className="relative mb-3 text-xs font-medium uppercase tracking-[0.16em] text-[var(--muted)]">{title}</h2>
      {children}
    </section>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return <span className="chip">{children}</span>;
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3">
      <div className="flex items-center gap-1 text-[var(--muted)]">{icon}{label}</div>
      <div className="mt-1 text-lg font-semibold">{value}</div>
    </div>
  );
}
