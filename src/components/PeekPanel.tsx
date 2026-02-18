"use client";

import React, { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

export type PeekProject = {
  title: string;
  meta?: string;
  desc: string;
  bullets?: string[];
  stack?: string[];
  links?: { label: string; href: string }[];
};

export default function PeekPanel({
  open,
  project,
  onClose,
}: {
  open: boolean;
  project: PeekProject | null;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && project && (
        <motion.div
          className="absolute inset-x-0 bottom-0 z-40"
          initial={{ y: 260, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 220, opacity: 0 }}
          transition={{ type: "spring", stiffness: 380, damping: 32 }}
        >
          <div className="mx-6 mb-6 rounded-xl border border-[var(--border)] bg-[var(--bg-panel)] shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
              <div className="min-w-0">
                <div className="text-sm font-semibold truncate">{project.title}</div>
                {project.meta ? (
                  <div className="text-xs text-[var(--muted)] truncate">{project.meta}</div>
                ) : null}
              </div>

              <button
                onClick={onClose}
                className="rounded-md border border-[var(--border)] bg-white/5 hover:bg-white/10 p-1.5"
                aria-label="Close peek panel"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-4 grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
              <div>
                <div className="text-sm text-[var(--muted)] leading-relaxed">
                  {project.desc}
                </div>

                {project.bullets?.length ? (
                  <ul className="mt-3 space-y-2 text-sm">
                    {project.bullets.map((b) => (
                      <li key={b} className="flex gap-2">
                        <span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-[var(--accent-2)]" />
                        <span className="text-[var(--muted)]">{b}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>

              <div className="rounded-lg border border-[var(--border)] bg-white/5 p-3">
                <div className="text-xs text-[var(--muted)]">Stack</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(project.stack ?? []).map((s) => (
                    <span
                      key={s}
                      className="rounded-md border border-[var(--border)] bg-black/10 px-2 py-1 text-xs text-[var(--muted)]"
                    >
                      {s}
                    </span>
                  ))}
                </div>

                {project.links?.length ? (
                  <>
                    <div className="mt-4 text-xs text-[var(--muted)]">Links</div>
                    <div className="mt-2 grid gap-2">
                      {project.links.map((l) => (
                        <a
                          key={l.href}
                          href={l.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-md border border-[var(--border)] bg-white/5 hover:bg-white/10 px-3 py-2 text-xs text-[var(--muted)]"
                        >
                          {l.label}
                        </a>
                      ))}
                    </div>
                  </>
                ) : null}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}