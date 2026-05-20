"use client";

import React, { type CSSProperties, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ThemeToggle from "@/components/ThemeToggle";
import { isSupabaseConfigured, supabase } from "@/lib/supabaseClient";
import BackgroundFX from "@/components/BackgroundFX";
import { formatDate, normalizeProject, type GithubSyncStatus, type PortfolioProject } from "@/lib/projects";
import { copyText, safeExternalUrl, userSafeError, withTimeout } from "@/lib/client-utils";

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
  Menu,
  X,
  Eye,
  Download,
  Github,
  Mail,
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

type ShellProfile = {
  email: string | null;
  github_url: string | null;
  resume_url: string | null;
};

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

function navLabel(key: FileKey) {
  const labels: Record<FileKey, string> = {
    "summary.md": "Home",
    "about.json": "About",
    "education.md": "Education",
    "projects/": "Projects",
    "skills.ts": "Skills",
    "certifications.md": "Experience",
    "volunteering.md": "Volunteering",
    "extracurricular.md": "Extracurricular",
    "contact.ts": "Contact",
  };
  return labels[key];
}

export default function VscodeShell() {
  const fileList = useMemo(() => Object.keys(fileMeta) as FileKey[], []);
  const [tabs, setTabs] = useState<Tab[]>([{ key: "summary.md", title: fileMeta["summary.md"].title }]);
  const [activeKey, setActiveKey] = useState<FileKey>("summary.md");

  const [paletteOpen, setPaletteOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [paletteIndex, setPaletteIndex] = useState(0);

  const [sbState, setSbState] = useState<"checking" | "connected" | "offline">("checking");
  const [syncStatus, setSyncStatus] = useState<GithubSyncStatus>({ status: "pending" });
  const [projectCount, setProjectCount] = useState(0);
  const [focusPulse, setFocusPulse] = useState(false);
  const [focusDim, setFocusDim] = useState(false);
  const [shellProfile, setShellProfile] = useState<ShellProfile | null>(null);
  const [shellProjects, setShellProjects] = useState<PortfolioProject[]>([]);
  const [shellDataError, setShellDataError] = useState("");
  const [shellNotice, setShellNotice] = useState("");
  const [resumeOpen, setResumeOpen] = useState(false);

  const editorRef = useRef<HTMLDivElement | null>(null);
  const [glow, setGlow] = useState({ x: 0, y: 0, visible: false });

  // Mobile sidebar drawer
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Theme watcher for theme-aware overlays
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  useEffect(() => {
    const root = document.documentElement;

    function syncTheme() {
      const t = (root.getAttribute("data-theme") as "dark" | "light") || "dark";
      setTheme(t);
    }

    syncTheme();
    const obs = new MutationObserver(syncTheme);
    obs.observe(root, { attributes: true, attributeFilter: ["data-theme"] });
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!mobileSidebarOpen) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileSidebarOpen]);

  const topBarBg = "var(--chrome-topbar-bg)";
  const tabsBg = "var(--chrome-tabs-bg)";
  const focusDimBg = "var(--focus-dim-bg)";

  const bgFxOpacity = theme === "dark" ? 1 : 0.75;
  const email = shellProfile?.email || "forshreyanshwork@gmail.com";
  const resumeUrl = safeExternalUrl(shellProfile?.resume_url);
  const githubUrl = safeExternalUrl(shellProfile?.github_url) || "https://github.com/ShreyTriesToCode";

  const latestProject = [...shellProjects].sort((a, b) => String(b.last_github_update ?? "").localeCompare(String(a.last_github_update ?? "")))[0];
  const featuredProject = shellProjects.find((project) => project.featured);
  const commands = [
    { title: "Search projects", Icon: Search, action: () => openFile("projects/") },
    { title: "Go to About", Icon: User, action: () => openFile("about.json") },
    { title: "Go to Projects", Icon: FolderGit2, action: () => openFile("projects/") },
    { title: "Go to Skills", Icon: Brain, action: () => openFile("skills.ts") },
    { title: "Go to Experience", Icon: BadgeCheck, action: () => openFile("certifications.md") },
    { title: "Go to Contact", Icon: Send, action: () => openFile("contact.ts") },
    { title: "Open GitHub", Icon: Github, action: () => window.open(githubUrl, "_blank", "noopener,noreferrer") },
    { title: "Download Resume", Icon: Download, action: () => resumeUrl ? window.open(resumeUrl, "_blank", "noopener,noreferrer") : setResumeOpen(true) },
    { title: "View Resume", Icon: Eye, action: () => setResumeOpen(true) },
    { title: "Toggle Theme", Icon: Sparkles, action: () => document.querySelector<HTMLButtonElement>("[data-theme-toggle]")?.click() },
    {
      title: "Copy Email",
      Icon: Mail,
      action: async () => {
        const result = await copyText(email);
        setShellNotice(result.message);
        window.setTimeout(() => setShellNotice(""), 1600);
      },
    },
    { title: "Open featured projects", Icon: Sparkles, action: () => openFile("projects/") },
    ...(latestProject ? [{ title: `Open latest project: ${latestProject.title}`, Icon: FolderGit2, action: () => window.location.assign(`/projects/${latestProject.slug}`) }] : []),
    ...(featuredProject ? [{ title: `Open featured: ${featuredProject.title}`, Icon: FolderGit2, action: () => window.location.assign(`/projects/${featuredProject.slug}`) }] : []),
  ];

  const filtered = commands.filter((command) => command.title.toLowerCase().includes(query.toLowerCase())).slice(0, 20);

  function openFile(key: FileKey) {
    setActiveKey(key);
    setTabs((prev) => (prev.some((t) => t.key === key) ? prev : [...prev, { key, title: fileMeta[key].title }]));

    setFocusPulse(true);
    setFocusDim(true);
    window.setTimeout(() => setFocusPulse(false), 550);
    window.setTimeout(() => setFocusDim(false), 200);

    // If on phone, close drawer after selecting
    setMobileSidebarOpen(false);
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

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (resumeOpen) return;

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen(true);
        setPaletteIndex(0);
        return;
      }

      if (e.key === "Escape") {
        setPaletteOpen(false);
        setMobileSidebarOpen(false);
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
          sel.action();
          setPaletteOpen(false);
          setQuery("");
        }
      }
    }

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [paletteOpen, filtered, paletteIndex, resumeOpen]);

  useEffect(() => {
    const el = editorRef.current;
    if (el === null) return;
    const currentEl: HTMLDivElement = el;

    function onMove(e: MouseEvent) {
      const rect = currentEl.getBoundingClientRect();
      setGlow({ x: e.clientX - rect.left, y: e.clientY - rect.top, visible: true });
    }
    function onLeave() {
      setGlow((g) => ({ ...g, visible: false }));
    }

    currentEl.addEventListener("mousemove", onMove);
    currentEl.addEventListener("mouseleave", onLeave);
    return () => {
      currentEl.removeEventListener("mousemove", onMove);
      currentEl.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function check() {
      if (!isSupabaseConfigured) {
        setSbState("offline");
        return;
      }
      setSbState("checking");
      const { error } = await withTimeout(supabase.from("contact_messages").select("id").limit(1)).catch((error) => ({ error }));
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

  useEffect(() => {
    let cancelled = false;

    async function loadShellData() {
      if (!isSupabaseConfigured) {
        setShellDataError("Supabase environment variables are not configured.");
        return;
      }

      try {
        const [{ data: profile }, { data: projects }, { data: syncLog, error: syncError }] = await Promise.all([
          withTimeout(supabase.from("profile").select("email,github_url,resume_url").order("id", { ascending: true }).limit(1).maybeSingle()),
          withTimeout(supabase.from("projects").select("*")),
          withTimeout(supabase
            .from("github_project_sync_logs")
            .select("status,started_at,finished_at,repos_scanned,repos_imported,repos_skipped,error_message")
            .order("started_at", { ascending: false })
            .limit(1)
            .maybeSingle()),
        ]);

        if (cancelled) return;
        setShellDataError("");
        setShellProfile((profile as ShellProfile | null) ?? null);
        const normalized = ((projects as Record<string, unknown>[] | null) ?? []).map(normalizeProject);
        setShellProjects(normalized);
        setProjectCount(normalized.length);
        if (syncError || !syncLog) {
          setSyncStatus({ status: "pending" });
        } else {
          const row = syncLog as Record<string, unknown>;
          setSyncStatus({
            status: row.status === "failed" ? "failed" : row.status === "synced" ? "synced" : "pending",
            started_at: String(row.started_at ?? ""),
            finished_at: String(row.finished_at ?? ""),
            repos_scanned: Number(row.repos_scanned ?? 0),
            repos_imported: Number(row.repos_imported ?? 0),
            repos_skipped: Number(row.repos_skipped ?? 0),
            error_message: typeof row.error_message === "string" ? row.error_message : null,
          });
        }
      } catch (error) {
        if (cancelled) return;
        console.error("Could not load shell data:", error);
        setShellDataError(userSafeError(error, "Could not load portfolio status."));
        setSyncStatus({ status: "pending" });
      }
    }

    loadShellData();
    return () => {
      cancelled = true;
    };
  }, []);

  const ActiveIcon = fileMeta[activeKey].Icon;

  function renderSidebarContent(compact?: boolean) {
    return (
      <div className={compact ? "px-4 py-4" : "px-3 pb-4"}>
        <div className="mb-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-[var(--foreground)]">
            <span className="grid h-6 w-6 place-items-center rounded-lg bg-[var(--surface-strong)] text-[var(--accent-2)]">▾</span>
            <span>PORTFOLIO</span>
          </div>
          <div className="mt-1 text-xs text-[var(--muted)]">Developer workspace</div>
        </div>

        <nav className="mt-2 space-y-1 text-sm relative" aria-label="Portfolio sections">
          {fileList.map((k) => {
            const Icon = fileMeta[k].Icon;
            const isActive = activeKey === k;

            return (
              <motion.button
                type="button"
                key={k}
                whileHover={{ x: 5 }}
                whileTap={{ scale: 0.985 }}
                onClick={() => openFile(k)}
                aria-current={isActive ? "page" : undefined}
                className={[
                  "group min-h-11 w-full px-3 py-2 rounded-xl cursor-pointer flex items-center gap-3 select-none relative text-left transition-colors",
                  isActive
                    ? "bg-[var(--surface-strong)] text-[var(--foreground)] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
                    : "text-[var(--muted)] hover:bg-[var(--surface)] hover:text-[var(--foreground)]",
                ].join(" ")}
              >
                {isActive ? (
                  <motion.span
                    layoutId="activeIndicator"
                    className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full"
                    style={{ background: "var(--accent-2)" }}
                  />
                ) : null}

                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-[var(--surface)]">
                  <Icon size={15} className="opacity-90" />
                </span>
                <span>{navLabel(k)}</span>
              </motion.button>
            );
          })}
        </nav>

        <div className="mt-5 grid gap-2">
          <button
            onClick={() => {
              setPaletteOpen(true);
              setPaletteIndex(0);
              setMobileSidebarOpen(false);
            }}
            className="btn-secondary w-full px-3 text-xs"
          >
            <Search size={14} />
            <span>Cmd+K Command Palette</span>
          </button>
          <button
            onClick={() => {
              setResumeOpen(true);
              setMobileSidebarOpen(false);
            }}
            className="btn-ghost w-full px-3 text-xs"
          >
            <FileText size={14} />
            <span>View Resume</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell portfolio-shell min-h-screen text-[var(--foreground)]">
      {/* Top bar */}
      <div
        className="sticky top-0 z-40 h-14 flex items-center justify-between gap-3 px-3 sm:px-4 border-b border-[var(--border)] backdrop-blur-xl"
        style={{ background: topBarBg }}
      >
        <div className="flex items-center gap-2 min-w-0">
          {/* Mobile menu button */}
          <button
            className="btn-icon md:hidden mr-1"
            onClick={() => setMobileSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            <Menu size={16} />
          </button>

          <div className="flex gap-2 shrink-0">
            <span className="h-3 w-3 rounded-full bg-[#ff5f56]" />
            <span className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
            <span className="h-3 w-3 rounded-full bg-[#27c93f]" />
          </div>

          <div className="ml-2 sm:ml-3 flex min-w-0 items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1.5 text-sm text-[var(--muted)]">
            <ActiveIcon size={15} className="opacity-90 shrink-0 text-[var(--accent-2)]" />
            <span className="opacity-90 truncate">~/shrey/portfolio/{fileMeta[activeKey].title}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => {
              setPaletteOpen(true);
              setPaletteIndex(0);
            }}
            className="btn-ghost hidden sm:inline-flex px-3 text-xs"
          >
            <Search size={14} />
            Cmd+K
          </button>
          <ThemeToggle />
        </div>
      </div>

      {/* Mobile Sidebar Drawer */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <motion.div
            className="fixed inset-0 z-[60] md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
            className="absolute inset-0 bg-black/55 backdrop-blur-sm"
              onClick={() => setMobileSidebarOpen(false)}
            />
            <motion.div
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: "spring", stiffness: 260, damping: 28 }}
              className="absolute left-0 top-0 bottom-0 w-[min(330px,88vw)] border-r border-[var(--border)] bg-[var(--bg-sidebar)] shadow-2xl backdrop-blur-xl"
            >
              <div className="px-4 py-4 flex items-center justify-between border-b border-[var(--border)]">
                <div className="text-xs font-semibold tracking-[0.24em] text-[var(--muted)]">EXPLORER</div>
                <button
                  className="btn-icon"
                  onClick={() => setMobileSidebarOpen(false)}
                  aria-label="Close sidebar"
                >
                  <X size={16} />
                </button>
              </div>
              {renderSidebarContent(true)}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Layout: stack on mobile, two columns on md+ */}
      <div className="portfolio-main-grid grid grid-cols-1 md:grid-cols-[280px_minmax(0,1fr)]">
        {/* Desktop sidebar */}
        <motion.div
          initial={{ x: -16, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.25 }}
          className="hidden md:block border-r border-[var(--border)] bg-[var(--bg-sidebar)] backdrop-blur-xl"
        >
          <div className="px-4 py-4 text-xs font-semibold tracking-[0.24em] text-[var(--muted)]">EXPLORER</div>
          {renderSidebarContent()}
        </motion.div>

        {/* Editor */}
        <div ref={editorRef} className="relative min-w-0 overflow-x-hidden">
          <div
            style={{
              "--accent-2": fileMeta[activeKey].accent,
              opacity: bgFxOpacity,
            } as CSSProperties}
            className="absolute inset-0"
          >
            <BackgroundFX accent={fileMeta[activeKey].accent} />
          </div>

          <AnimatePresence>
            {focusDim ? (
              <motion.div
                className="absolute inset-0 z-10"
                style={{ background: focusDimBg }}
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
              background: `radial-gradient(680px circle at ${glow.x}px ${glow.y}px, var(--pointer-glow), transparent 58%)`,
            }}
          />

          {/* Tabs */}
          <div
            className="thin-scrollbar relative h-11 flex items-end border-b border-[var(--border)] overflow-x-auto z-20 backdrop-blur-xl"
            style={{ background: tabsBg }}
          >
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
                      "h-11 px-4 flex items-center gap-2 border-r border-[var(--border)] text-sm cursor-pointer whitespace-nowrap transition-colors",
                      activeKey === t.key
                        ? "bg-[var(--surface-strong)] text-[var(--foreground)]"
                        : "text-[var(--muted)] hover:bg-[var(--surface)]",
                    ].join(" ")}
                    onClick={() => setActiveKey(t.key)}
                  >
                    <span className="truncate max-w-[160px] sm:max-w-none">{t.title}</span>
                    {tabs.length > 1 ? (
                      <button
                        className="ml-1 rounded-md px-1.5 py-0.5 hover:bg-[var(--surface-strong)]"
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

          {/* Content area: smaller padding on mobile, with extra room for the fixed status bar. */}
          <div className="relative z-20 p-3 pb-[calc(var(--status-bar-height)+1.5rem+env(safe-area-inset-bottom))] sm:p-5 sm:pb-[calc(var(--status-bar-height)+2rem+env(safe-area-inset-bottom))] lg:p-8 lg:pb-[calc(var(--status-bar-height)+2.5rem+env(safe-area-inset-bottom))]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeKey}
                initial={{ opacity: 0, y: 10, filter: "blur(2px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -8, filter: "blur(2px)" }}
                transition={{ duration: 0.22 }}
                className="premium-surface mx-auto max-w-7xl rounded-2xl p-4 sm:p-6 lg:p-8 relative"
                style={{ "--accent-2": fileMeta[activeKey].accent } as CSSProperties}
              >
                {renderSection(activeKey, focusPulse)}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Command Palette */}
      <AnimatePresence>
        {paletteOpen && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-start justify-center px-3 pt-20 sm:pt-28 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPaletteOpen(false)}
          >
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
              className="premium-surface w-[620px] max-w-[94vw] rounded-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3 text-xs text-[var(--muted)]">
                <span className="font-semibold tracking-[0.18em]">COMMAND PALETTE</span>
                <span className="chip hidden sm:inline-flex">Esc to close</span>
              </div>

              <input
                autoFocus
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPaletteIndex(0);
                }}
                placeholder="Search files... (↑↓ select, Enter open, Esc close)"
                className="w-full border-b border-[var(--border)] bg-transparent px-4 py-4 text-sm outline-none placeholder:text-[var(--muted)]"
              />

              <div className="thin-scrollbar max-h-[360px] overflow-y-auto p-2">
                {filtered.map((f, idx) => {
                  const Icon = f.Icon;
                  const selected = idx === paletteIndex;
                  return (
                    <div
                      key={f.title}
                      onMouseEnter={() => setPaletteIndex(idx)}
                      onClick={() => {
                        f.action();
                        setPaletteOpen(false);
                        setQuery("");
                      }}
                      className={[
                        "rounded-xl px-3 py-3 text-sm cursor-pointer flex items-center gap-3 transition-colors",
                        selected ? "bg-[var(--surface-strong)] text-[var(--foreground)]" : "text-[var(--muted)] hover:bg-[var(--surface)]",
                      ].join(" ")}
                    >
                      <span className="grid h-8 w-8 place-items-center rounded-lg bg-[var(--surface)]">
                        <Icon size={16} className="opacity-90" />
                      </span>
                      <span className="truncate">{f.title}</span>
                    </div>
                  );
                })}
                {filtered.length === 0 && <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-5 text-sm text-[var(--muted)]">No matching command</div>}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ResumeModal open={resumeOpen} resumeUrl={resumeUrl} onClose={() => setResumeOpen(false)} />

      {/* Bottom status bar */}
      <motion.div
        initial={{ y: 14, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.24, ease: "easeOut" }}
        className="status-bar thin-scrollbar fixed inset-x-0 bottom-0 z-[45] flex items-center gap-3 overflow-x-auto border-t border-[var(--border)] px-3 pt-1.5 text-xs text-[var(--muted)] backdrop-blur-xl"
      >
        <div className="flex shrink-0 items-center gap-3">
          <span>main</span>
          <span className="hidden sm:inline">0 problems</span>
        </div>
        <div className="flex min-w-max flex-1 items-center justify-end gap-2 sm:gap-3">
          <span className="hidden sm:inline">TypeScript</span>
          <span className="hidden sm:inline">UTF-8</span>

          <span
            className={[
              "status-pill px-2.5 py-[3px] rounded-full border border-[var(--border)]",
              sbState === "connected"
                ? "status-pill-ok"
                : sbState === "offline"
                ? "status-pill-error"
                : "status-pill-pending",
            ].join(" ")}
          >
            Supabase: {sbState === "checking" ? "checking..." : sbState}
          </span>
          <span
            className={[
              "status-pill px-2.5 py-[3px] rounded-full border border-[var(--border)]",
              syncStatus.status === "synced"
                ? "status-pill-ok"
                : syncStatus.status === "failed"
                ? "status-pill-error"
                : "status-pill-pending",
            ].join(" ")}
            title={syncStatus.error_message || undefined}
          >
            GitHub: {syncStatus.status === "synced" ? "Synced" : syncStatus.status === "failed" ? "Failed" : "Pending"}
          </span>
          <span>Projects: {projectCount}</span>
          <span className="hidden md:inline">Last Sync: {formatDate(syncStatus.finished_at || syncStatus.started_at)}</span>
          {shellDataError ? <span className="status-pill text-[var(--warning)]" title={shellDataError}>Data warning</span> : null}
          {shellNotice ? <span className="status-pill text-[var(--success)]">{shellNotice}</span> : null}
          <span className="hidden sm:inline">Theme: {theme === "dark" ? "Dark" : "Light"}</span>
        </div>
      </motion.div>
    </div>
  );
}

function ResumeModal({ open, resumeUrl, onClose }: { open: boolean; resumeUrl: string; onClose: () => void }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-md p-3 sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Resume preview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className="premium-surface mx-auto flex h-full max-w-5xl flex-col overflow-hidden rounded-2xl"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] px-4 py-3">
              <div>
                <div className="text-sm font-semibold">resume.pdf</div>
                <div className="text-xs text-[var(--muted)]">Preview</div>
              </div>
              <div className="flex items-center gap-2">
                {resumeUrl ? (
                  <a href={resumeUrl} download className="btn-primary min-h-9 px-3 text-xs">
                    Download
                  </a>
                ) : null}
                <button onClick={onClose} className="btn-ghost min-h-9 px-3 text-xs">
                  Close
                </button>
              </div>
            </div>
            <div className="min-h-0 flex-1 bg-[var(--surface-muted)]">
              {resumeUrl ? (
                <iframe src={resumeUrl} title="Resume preview" className="h-full w-full" />
              ) : (
                <div className="grid h-full place-items-center p-6 text-center text-sm text-[var(--muted)]">
                  <div className="premium-card max-w-md rounded-2xl p-6">
                    <div className="text-base font-semibold text-[var(--foreground)]">Resume preview not configured</div>
                    <p className="mt-2 leading-relaxed">
                      Add a PDF URL to <b>profile.resume_url</b> in Supabase or place one in <b>public/</b>.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function renderSection(key: FileKey, focusPulse: boolean) {
  switch (key) {
    case "summary.md":
      return <SummarySection focusPulse={focusPulse} />;
    case "about.json":
      return <AboutSection focusPulse={focusPulse} />;
    case "education.md":
      return <EducationSection focusPulse={focusPulse} />;
    case "projects/":
      return <ProjectsSection focusPulse={focusPulse} />;
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
