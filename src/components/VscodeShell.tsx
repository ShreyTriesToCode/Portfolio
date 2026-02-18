"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ThemeToggle from "@/components/ThemeToggle";
import { supabase } from "@/lib/supabaseClient";
import BackgroundFX from "@/components/BackgroundFX";
import PeekPanel, { PeekProject } from "@/components/PeekPanel";

import {
  FileText,
  User,
  GraduationCap,
  FolderGit2,
  Brain,
  BadgeCheck,
  HeartHandshake,
  Sparkles,
  Send,
  Search,
} from "lucide-react";

import {
  AboutSection,
  CertificationsSection,
  ContactSection,
  EducationSection,
  ExtracurricularSection,
  ProjectsSection,
  SkillsSection,
  SummarySection,
  VolunteeringSection,
} from "@/components/sections";

type FileKey =
  | "summary.md"
  | "about.json"
  | "education.md"
  | "projects/"
  | "skills.ts"
  | "certifications.md"
  | "volunteering.md"
  | "extracurricular.md"
  | "contact.ts";

type Tab = { key: FileKey; title: string };

const fileMeta: Record<FileKey, { title: string; Icon: React.ElementType; accent: string }> = {
  "summary.md": { title: "summary.md", Icon: FileText, accent: "rgba(122,162,247,0.55)" },
  "about.json": { title: "about.json", Icon: User, accent: "rgba(158,206,106,0.55)" },
  "education.md": { title: "education.md", Icon: GraduationCap, accent: "rgba(224,175,104,0.55)" },
  "projects/": { title: "projects/", Icon: FolderGit2, accent: "rgba(125,207,255,0.55)" },
  "skills.ts": { title: "skills.ts", Icon: Brain, accent: "rgba(187,154,247,0.55)" },
  "certifications.md": { title: "certifications.md", Icon: BadgeCheck, accent: "rgba(247,118,142,0.55)" },
  "volunteering.md": { title: "volunteering.md", Icon: HeartHandshake, accent: "rgba(115,218,202,0.55)" },
  "extracurricular.md": { title: "extracurricular.md", Icon: Sparkles, accent: "rgba(255,158,100,0.55)" },
  "contact.ts": { title: "contact.ts", Icon: Send, accent: "rgba(192,202,245,0.55)" },
};

export default function VscodeShell() {
  const fileList = useMemo(() => Object.keys(fileMeta) as FileKey[], []);
  const [tabs, setTabs] = useState<Tab[]>([{ key: "summary.md", title: fileMeta["summary.md"].title }]);
  const [activeKey, setActiveKey] = useState<FileKey>("summary.md");

  const [paletteOpen, setPaletteOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [paletteIndex, setPaletteIndex] = useState(0);

  const filtered = fileList
    .map((k) => ({ key: k, ...fileMeta[k] }))
    .filter((f) => f.title.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 20);

  const [sbState, setSbState] = useState<"checking" | "connected" | "offline">("checking");
  const [focusPulse, setFocusPulse] = useState(false);
  const [focusDim, setFocusDim] = useState(false);

  const [peekOpen, setPeekOpen] = useState(false);
  const [peekProject, setPeekProject] = useState<PeekProject | null>(null);

  const editorRef = useRef<HTMLDivElement | null>(null);
  const [glow, setGlow] = useState({ x: 0, y: 0, visible: false });

  function openFile(key: FileKey) {
    setActiveKey(key);
    setTabs((prev) => (prev.some((t) => t.key === key) ? prev : [...prev, { key, title: fileMeta[key].title }]));

    setFocusPulse(true);
    setFocusDim(true);
    window.setTimeout(() => setFocusPulse(false), 550);
    window.setTimeout(() => setFocusDim(false), 200);
  }

  function closeTab(key: FileKey) {
    setTabs((prev) => {
      const next = prev.filter((t) => t.key !== key);
      if (activeKey === key) {
        const fallback = next[next.length - 1]?.key ?? "summary.md";
        setActiveKey(fallback);
      }
      return next.length ? next : [{ key: "summary.md", title: fileMeta["summary.md"].title }];
    });
  }

  function openPeek(p: PeekProject) {
    setPeekProject(p);
    setPeekOpen(true);
  }

  function closePeek() {
    setPeekOpen(false);
    window.setTimeout(() => setPeekProject(null), 180);
  }

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen(true);
        setPaletteIndex(0);
        return;
      }

      if (e.key === "Escape") {
        setPaletteOpen(false);
        return;
      }

      if (!paletteOpen) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setPaletteIndex((i) => Math.min(i + 1, Math.max(filtered.length - 1, 0)));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setPaletteIndex((i) => Math.max(i - 1, 0));
      }
      if (e.key === "Enter") {
        e.preventDefault();
        const sel = filtered[paletteIndex];
        if (sel) {
          openFile(sel.key);
          setPaletteOpen(false);
          setQuery("");
        }
      }
    }

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [paletteOpen, filtered, paletteIndex]);

  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;

    function onMove(e: MouseEvent) {
      const rect = el.getBoundingClientRect();
      setGlow({ x: e.clientX - rect.left, y: e.clientY - rect.top, visible: true });
    }
    function onLeave() {
      setGlow((g) => ({ ...g, visible: false }));
    }

    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function check() {
      setSbState("checking");
      const { error } = await supabase.from("contact_messages").select("id").limit(1);
      if (cancelled) return;
      setSbState(error ? "offline" : "connected");
    }

    check();
    const t = setInterval(check, 30000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, []);

  const ActiveIcon = fileMeta[activeKey].Icon;

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--foreground)]">
      <div className="h-12 flex items-center justify-between px-3 border-b border-[var(--border)] bg-black/20 backdrop-blur">
        <div className="flex items-center gap-2">
          <div className="flex gap-2">
            <span className="h-3 w-3 rounded-full bg-[#ff5f56]" />
            <span className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
            <span className="h-3 w-3 rounded-full bg-[#27c93f]" />
          </div>

          <div className="ml-3 flex items-center gap-2 text-sm text-[var(--muted)]">
            <ActiveIcon size={16} className="opacity-90" />
            <span className="opacity-90">~/shrey/portfolio/{fileMeta[activeKey].title}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </div>

      <div className="grid grid-cols-[260px_1fr] min-h-[calc(100vh-48px-32px)]">
        <motion.div
          initial={{ x: -16, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.25 }}
          className="border-r border-[var(--border)] bg-[var(--bg-sidebar)]"
        >
          <div className="px-3 py-3 text-xs tracking-widest text-[var(--muted)]">EXPLORER</div>

          <div className="px-2 pb-3">
            <div className="px-2 py-1 text-sm text-[var(--foreground)] flex items-center gap-2">
              <span className="opacity-80">▾</span>
              <span className="opacity-90">PORTFOLIO</span>
            </div>

            <div className="mt-2 space-y-1 text-sm relative">
              {fileList.map((k) => {
                const Icon = fileMeta[k].Icon;
                const isActive = activeKey === k;

                return (
                  <motion.div
                    key={k}
                    whileHover={{ x: 5 }}
                    whileTap={{ scale: 0.985 }}
                    onClick={() => openFile(k)}
                    className={[
                      "px-2 py-1 rounded-md cursor-pointer flex items-center gap-2 select-none relative",
                      isActive ? "bg-white/10 text-[var(--foreground)]" : "text-[var(--muted)] hover:bg-white/5",
                    ].join(" ")}
                  >
                    {isActive ? (
                      <motion.span
                        layoutId="activeIndicator"
                        className="absolute left-0 top-1 bottom-1 w-[3px] rounded-full"
                        style={{ background: "var(--accent-2)" }}
                      />
                    ) : null}

                    <Icon size={16} className="opacity-90" />
                    <span>{fileMeta[k].title}</span>
                  </motion.div>
                );
              })}
            </div>

            <div className="mt-4 px-2">
              <button
                onClick={() => {
                  setPaletteOpen(true);
                  setPaletteIndex(0);
                }}
                className="w-full rounded-md border border-[var(--border)] bg-white/5 px-3 py-2 text-xs text-[var(--muted)] hover:bg-white/10 flex items-center justify-center gap-2"
              >
                <Search size={14} />
                <span>Cmd+K Command Palette</span>
              </button>
            </div>
          </div>
        </motion.div>

        <div ref={editorRef} className="relative bg-[var(--bg-main)] overflow-hidden">
          <div style={{ ["--accent-2" as any]: fileMeta[activeKey].accent }} className="absolute inset-0">
            <BackgroundFX accent={fileMeta[activeKey].accent} />
          </div>

          <AnimatePresence>
            {focusDim ? (
              <motion.div
                className="absolute inset-0 z-10 bg-black/25"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />
            ) : null}
          </AnimatePresence>

          <div
            className="pointer-events-none absolute inset-0 z-[5]"
            style={{
              opacity: glow.visible ? 1 : 0,
              transition: "opacity 200ms ease",
              background: `radial-gradient(650px circle at ${glow.x}px ${glow.y}px, rgba(255,255,255,0.06), transparent 55%)`,
            }}
          />

          <div className="relative h-10 flex items-end border-b border-[var(--border)] bg-black/10 overflow-x-auto z-20">
            <AnimatePresence initial={false}>
              {tabs.map((t) => (
                <motion.div
                  key={t.key}
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: "auto", opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <motion.div
                    whileHover={{ y: -1 }}
                    transition={{ type: "spring", stiffness: 420, damping: 26 }}
                    className={[
                      "h-10 px-3 flex items-center gap-2 border-r border-[var(--border)] text-sm cursor-pointer whitespace-nowrap",
                      activeKey === t.key ? "bg-[var(--bg-panel)] text-[var(--foreground)]" : "text-[var(--muted)] hover:bg-white/5",
                    ].join(" ")}
                    onClick={() => setActiveKey(t.key)}
                  >
                    <span>{t.title}</span>
                    {tabs.length > 1 ? (
                      <button
                        className="ml-1 px-1 hover:bg-white/10 rounded"
                        onClick={(e) => {
                          e.stopPropagation();
                          closeTab(t.key);
                        }}
                        aria-label="Close tab"
                      >
                        ×
                      </button>
                    ) : null}
                  </motion.div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div className="relative p-6 z-20">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeKey}
                initial={{ opacity: 0, y: 10, filter: "blur(2px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -8, filter: "blur(2px)" }}
                transition={{ duration: 0.22 }}
                className="rounded-xl border border-[var(--border)] bg-white/5 p-6 relative"
                style={{ ["--accent-2" as any]: fileMeta[activeKey].accent }}
              >
                {renderSection(activeKey, focusPulse, openPeek)}
              </motion.div>
            </AnimatePresence>
          </div>

          <PeekPanel open={peekOpen} project={peekProject} onClose={closePeek} />
        </div>
      </div>

      <AnimatePresence>
        {paletteOpen && (
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-start justify-center pt-32 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPaletteOpen(false)}
          >
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
              className="w-[560px] max-w-[92vw] rounded-xl border border-[var(--border)] bg-[var(--bg-panel)] shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-4 py-2 text-xs text-[var(--muted)] border-b border-[var(--border)]">Command Palette</div>

              <input
                autoFocus
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPaletteIndex(0);
                }}
                placeholder="Search files... (↑↓ select, Enter open, Esc close)"
                className="w-full px-4 py-3 bg-transparent border-b border-[var(--border)] outline-none text-sm"
              />

              <div className="max-h-64 overflow-y-auto">
                {filtered.map((f, idx) => {
                  const Icon = f.Icon;
                  const selected = idx === paletteIndex;
                  return (
                    <div
                      key={f.key}
                      onMouseEnter={() => setPaletteIndex(idx)}
                      onClick={() => {
                        openFile(f.key);
                        setPaletteOpen(false);
                        setQuery("");
                      }}
                      className={[
                        "px-4 py-2 text-sm cursor-pointer flex items-center gap-2",
                        selected ? "bg-white/10" : "hover:bg-white/5",
                      ].join(" ")}
                    >
                      <Icon size={16} className="opacity-90" />
                      <span>{f.title}</span>
                    </div>
                  );
                })}
                {filtered.length === 0 && <div className="px-4 py-3 text-sm text-[var(--muted)]">No results</div>}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="h-8 border-t border-[var(--border)] bg-black/20 flex items-center justify-between px-3 text-xs text-[var(--muted)]">
        <div className="flex items-center gap-3">
          <span>main</span>
          <span>0 problems</span>
        </div>
        <div className="flex items-center gap-3">
          <span>TypeScript</span>
          <span>UTF-8</span>
          <span className={sbState === "connected" ? "text-green-300" : sbState === "offline" ? "text-red-300" : "text-[var(--accent-2)]"}>
            Supabase: {sbState === "checking" ? "checking..." : sbState}
          </span>
        </div>
      </div>
    </div>
  );
}

function renderSection(key: FileKey, focusPulse: boolean, openPeek: (p: PeekProject) => void) {
  switch (key) {
    case "summary.md":
      return <SummarySection focusPulse={focusPulse} />;
    case "about.json":
      return <AboutSection focusPulse={focusPulse} />;
    case "education.md":
      return <EducationSection focusPulse={focusPulse} />;
    case "projects/":
      return <ProjectsSection focusPulse={focusPulse} onPeek={openPeek} />;
    case "skills.ts":
      return <SkillsSection focusPulse={focusPulse} />;
    case "certifications.md":
      return <CertificationsSection focusPulse={focusPulse} />;
    case "volunteering.md":
      return <VolunteeringSection focusPulse={focusPulse} />;
    case "extracurricular.md":
      return <ExtracurricularSection focusPulse={focusPulse} />;
    case "contact.ts":
      return <ContactSection focusPulse={focusPulse} />;
    default:
      return null;
  }
}