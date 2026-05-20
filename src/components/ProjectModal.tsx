"use client";

/* eslint-disable @next/next/no-img-element -- Project assets come from Supabase/GitHub and may use arbitrary domains. */

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Copy, ExternalLink, FileText, Github, Star, GitFork, CircleAlert, X } from "lucide-react";
import { difficultyTone, formatDate, projectTimeline, type PortfolioProject } from "@/lib/projects";
import { copyText, safeAssetUrl } from "@/lib/client-utils";

type Props = {
  project: PortfolioProject | null;
  open: boolean;
  onClose: () => void;
};

export default function ProjectModal({ project, open, onClose }: Props) {
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    previousFocus.current = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    window.setTimeout(() => closeRef.current?.focus(), 50);

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key !== "Tab") return;
      const focusable = Array.from(
        dialogRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
        ) ?? []
      ).filter((element) => !element.hasAttribute("disabled") && element.getAttribute("aria-hidden") !== "true");

      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      previousFocus.current?.focus?.();
    };
  }, [open, onClose]);

  const portalTarget = typeof document === "undefined" ? null : document.body;
  if (!project || !portalTarget) return null;

  const pagePath = `/projects/${project.slug}`;
  const pageUrl = typeof window === "undefined" ? pagePath : `${window.location.origin}${pagePath}`;
  const heroImage = safeAssetUrl(project.image_url);
  const screenshots = project.screenshots.filter((shot) => safeAssetUrl(shot));
  const architectureImage = safeAssetUrl(project.architecture_image);
  const hasVisualMedia = Boolean(heroImage || screenshots.length || architectureImage);

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/65 p-3 pb-[calc(var(--status-bar-height)+1rem+env(safe-area-inset-bottom))] backdrop-blur-md sm:p-6 sm:pb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={onClose}
          role="presentation"
        >
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="project-modal-title"
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            className={[
              "premium-surface project-modal-shell flex w-full flex-col overflow-hidden rounded-2xl",
              hasVisualMedia ? "max-w-6xl" : "max-w-5xl",
            ].join(" ")}
            style={{ maxHeight: "min(820px, calc(100dvh - var(--status-bar-height) - 2rem - env(safe-area-inset-bottom)))" }}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="flex shrink-0 items-start justify-between gap-4 border-b border-[var(--border)] px-4 py-4 sm:px-5">
              <div className="min-w-0">
                <div className="text-xs font-medium tracking-[0.16em] text-[var(--muted)]">PROJECT DETAIL</div>
                <h2 id="project-modal-title" className="mt-1 text-2xl font-semibold tracking-tight break-words">
                  {project.title}
                </h2>
                <div className="mt-1 text-xs text-[var(--muted)]">projects/{project.slug}/README.md</div>
              </div>
              <button
                ref={closeRef}
                onClick={onClose}
                className="btn-icon shrink-0"
                aria-label="Close project details"
              >
                <X size={18} />
              </button>
            </div>

            <div className="thin-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 pb-24 sm:p-5 sm:pb-6">
              <div
                className={[
                  "grid gap-5",
                  hasVisualMedia
                    ? "lg:grid-cols-[minmax(0,1.2fr)_minmax(300px,0.8fr)]"
                    : "lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.58fr)]",
                ].join(" ")}
              >
                <div className="space-y-5 min-w-0">
                  {heroImage ? <AssetImage src={heroImage} alt={`${project.title} preview`} /> : null}

                  <p className="text-base leading-8 text-[var(--muted-strong)]">
                    {project.short_description}
                  </p>
                  {project.long_description ? (
                    <p className="text-sm leading-7 text-[var(--muted)]">{project.long_description}</p>
                  ) : null}
                  {project.readme_summary ? (
                    <Panel title="README summary">
                      <p className="text-sm leading-relaxed text-[var(--muted)]">{project.readme_summary}</p>
                    </Panel>
                  ) : null}

                  <Panel title="Stack">
                    <TagList items={project.tech_stack} />
                  </Panel>

                  {project.tags.length ? (
                    <Panel title="Tags">
                      <TagList items={project.tags} subtle />
                    </Panel>
                  ) : null}

                  {screenshots.length ? (
                    <Panel title="Screenshots">
                      <div className="grid gap-3 sm:grid-cols-2">
                        {screenshots.map((shot) => (
                          <AssetImage key={shot} src={shot} alt={`${project.title} screenshot`} compact />
                        ))}
                      </div>
                    </Panel>
                  ) : null}

                  {architectureImage ? (
                    <Panel title="Architecture">
                      <AssetImage src={architectureImage} alt={`${project.title} architecture`} compact />
                    </Panel>
                  ) : null}
                </div>

                <aside className="space-y-4 min-w-0">
                  <Panel title="Metadata">
                    <div className="flex flex-wrap gap-2">
                      {project.featured ? <Badge>Featured</Badge> : null}
                      {project.category ? <Badge>{project.category}</Badge> : null}
                      {project.status ? <Badge>{project.status}</Badge> : null}
                      {project.role ? <Badge>{project.role}</Badge> : null}
                      {project.difficulty ? (
                        <span className={`rounded-md border px-2 py-1 text-xs ${difficultyTone(project.difficulty)}`}>
                          {project.difficulty}
                        </span>
                      ) : null}
                    </div>
                  </Panel>

                  <Panel title="Repository health">
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <Health icon={<Star size={14} />} label="Stars" value={project.stars} />
                      <Health icon={<GitFork size={14} />} label="Forks" value={project.forks} />
                      <Health icon={<CircleAlert size={14} />} label="Issues" value={project.open_issues} />
                    </div>
                    <div className="mt-3 text-xs text-[var(--muted)]">
                      Language: <span className="text-[var(--foreground)]">{project.language || "Not reported"}</span>
                    </div>
                  </Panel>

                  <Panel title="Timeline">
                    <div className="grid gap-2">
                      {projectTimeline(project).map((item) => (
                        <div key={item.label} className="flex items-center justify-between gap-3 text-xs">
                          <span className="text-[var(--muted)]">{item.label}</span>
                          <span className="text-right">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </Panel>

                  <div className="project-modal-actions grid gap-2">
                    <Link href={pagePath} className="btn-primary px-3">
                      <FileText size={16} /> Full case study
                    </Link>
                    {project.repo_url ? (
                      <a href={project.repo_url} target="_blank" rel="noopener noreferrer" className="btn-secondary px-3">
                        <Github size={16} /> GitHub repo
                      </a>
                    ) : null}
                    {project.demo_url ? (
                      <a href={project.demo_url} target="_blank" rel="noopener noreferrer" className="btn-secondary px-3">
                        <ExternalLink size={16} /> Live page
                      </a>
                    ) : null}
                    {project.case_study_pdf ? (
                      <a href={project.case_study_pdf} target="_blank" rel="noopener noreferrer" className="btn-secondary px-3">
                        <FileText size={16} /> Case study PDF
                      </a>
                    ) : null}
                    <CopyButton value={pageUrl} label="Copy project link" />
                    {project.repo_url ? <CopyButton value={project.repo_url} label="Copy GitHub link" /> : null}
                    {project.demo_url ? <CopyButton value={project.demo_url} label="Copy live link" /> : null}
                  </div>

                  <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs text-[var(--muted)]">Last synced {formatDate(project.synced_at)}</div>
                </aside>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    portalTarget
  );
}

export function CopyButton({ value, label }: { value: string; label: string }) {
  const [feedback, setFeedback] = useState("");
  const [copying, setCopying] = useState(false);

  async function copy() {
    if (copying) return;
    setCopying(true);
    const result = await copyText(value);
    setFeedback(result.message);
    setCopying(false);
    window.setTimeout(() => setFeedback(""), 1700);
  }

  return (
    <button
      type="button"
      onClick={copy}
      disabled={copying}
      className="btn-ghost px-3"
      aria-live="polite"
    >
      <Copy size={16} />
      {feedback || (copying ? "Copying..." : label)}
    </button>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="premium-card rounded-2xl p-4">
      <div className="relative mb-3 text-xs font-medium uppercase tracking-[0.16em] text-[var(--muted)]">{title}</div>
      {children}
    </section>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="chip">
      {children}
    </span>
  );
}

function TagList({ items, subtle }: { items: string[]; subtle?: boolean }) {
  if (!items.length) return <div className="text-xs text-[var(--muted)]">Not listed</div>;
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span
          key={item}
          className={[
            "chip",
            subtle ? "text-[var(--muted)]" : "text-[var(--foreground)]",
          ].join(" ")}
        >
          {item}
        </span>
      ))}
    </div>
  );
}

function Health({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3">
      <div className="flex items-center gap-1 text-[var(--muted)]">{icon}{label}</div>
      <div className="mt-1 text-lg font-semibold">{value}</div>
    </div>
  );
}

function AssetImage({ src, alt, compact }: { src?: string | null; alt: string; compact?: boolean }) {
  const [failed, setFailed] = useState(false);
  const safeSrc = safeAssetUrl(src);
  if (!safeSrc || failed) return null;

  return (
    <img
      src={safeSrc}
      alt={alt}
      onError={() => setFailed(true)}
      className={`w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] object-cover shadow-[var(--shadow-card)] ${compact ? "max-h-64" : "max-h-[390px]"}`}
    />
  );
}
