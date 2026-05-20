"use client";

/* eslint-disable @next/next/no-img-element -- Profile/project assets are Supabase-managed and may use arbitrary domains. */

import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { isSupabaseConfigured, supabase } from "@/lib/supabaseClient";
import SectionHeader from "@/components/SectionHeader";
import { TypeAnimation } from "react-type-animation";
import { Github, Linkedin, Mail, Download, Search, Star, GitFork, CircleAlert, ExternalLink, Copy } from "lucide-react";
import ProjectModal from "@/components/ProjectModal";
import { copyText, safeExternalUrl, userSafeError, validateContactInput, withTimeout } from "@/lib/client-utils";
import {
  difficultyTone,
  formatDate,
  normalizeProject,
  projectMatches,
  projectMatchesFilter,
  sortProjects,
  type PortfolioProject,
} from "@/lib/projects";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } },
};

const item = {
  hidden: { opacity: 0, y: 10, filter: "blur(2px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.22 },
  },
};

type ProfileRow = {
  full_name: string;
  headline: string;
  about: string;
  email: string;
  github_url: string | null;
  linkedin_url: string | null;
  resume_url: string | null;
  photo_url: string | null;
};

type CertificationRow = {
  id: string;
  title: string;
  issuer: string | null;
  credential_id: string | null;
  credential_url: string | null;
  description: string | null;
  skills: string[] | null;
  issued_at: string | null;
  expires_at: string | null;
  featured: boolean | null;
  priority: number | null;
};

const CONTACT_EMAIL = "forshreyanshwork@gmail.com";

function sentenceTypingSequence(text: string) {
  const sentences = (text.match(/[^.!?]+(?:[.!?]+|$)/g) ?? [text])
    .map((sentence) => sentence.replace(/\s+/g, " ").trim())
    .filter(Boolean);

  if (sentences.length <= 1) return [text];

  return sentences.flatMap((_, index) => {
    const line = sentences.slice(0, index + 1).join(" ");
    return index === sentences.length - 1 ? [line] : [line, 140];
  });
}

function uniqueValues(values: Array<string | null | undefined>) {
  return Array.from(new Set(values.map((value) => value?.trim()).filter(Boolean) as string[]));
}

function rotatingSummaryIndex(length: number) {
  if (length <= 1 || typeof window === "undefined") return 0;

  const key = "portfolio-summary-variant";
  const previous = Number(window.sessionStorage.getItem(key) ?? "-1");
  const next = Number.isFinite(previous) ? (previous + 1) % length : 0;
  window.sessionStorage.setItem(key, String(next));
  return next;
}

function buildAtsSummary(profile: ProfileRow | null, projects: PortfolioProject[]) {
  const name = profile?.full_name || "Shreyansh Singhal";
  const headline = profile?.headline || "full-stack developer and computer science student";
  const featuredProjects = [...projects]
    .sort((a, b) => Number(b.featured) - Number(a.featured) || (a.priority ?? 99) - (b.priority ?? 99))
    .slice(0, 3)
    .map((project) => project.title);
  const techStack = uniqueValues(projects.flatMap((project) => project.tech_stack)).slice(0, 7);
  const domains = uniqueValues(projects.flatMap((project) => [project.category, ...project.tags])).slice(0, 5);
  const projectText = featuredProjects.length ? featuredProjects.join(", ") : "portfolio-ready full-stack products";
  const techText = techStack.length ? techStack.join(", ") : "React, TypeScript, Supabase, and modern web tooling";
  const domainText = domains.length ? domains.join(", ") : "web apps, mobile-first products, databases, and machine learning";
  const baseSummary = profile?.about?.replace(/\s+/g, " ").trim();

  const variants = [
    `${name} is a ${headline} focused on full-stack development, frontend engineering, backend integration, database design, and mobile-first product experiences. Recent work includes ${projectText}, using ${techText}. Strengths include clean UI systems, reliable Supabase data flows, API integration, project ownership, and production-minded problem solving.`,
    `${name} builds practical developer products across ${domainText}. The portfolio highlights ${projectText} and hands-on experience with ${techText}. Core ATS keywords: full-stack developer, React, TypeScript, Supabase, REST APIs, responsive UI, database design, machine learning, GitHub automation, and user-focused engineering.`,
    `${name} is a product-minded ${headline} with experience shipping end-to-end projects from interface design to backend data handling. Projects such as ${projectText} show skill in ${techText}. He focuses on accessible UI, scalable architecture, clear documentation, automation, and real-world software delivery.`,
  ];

  if (baseSummary) {
    variants.push(`${baseSummary} Key strengths include full-stack development, responsive frontend design, Supabase-backed data flows, GitHub automation, TypeScript, API integration, and production-ready project delivery.`);
  }

  return variants[rotatingSummaryIndex(variants.length)];
}

/* =========================
   SUMMARY (NOW HOLDS PROFILE.ABOUT)
   - NO phrase typing here
   - ONLY summary text typing
   - Typing speed faster than reading pace
========================= */
export function SummarySection({ focusPulse }: { focusPulse?: boolean }) {
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [summaryText, setSummaryText] = useState("");
  const [loading, setLoading] = useState(true);
  const summarySequence = useMemo(() => sentenceTypingSequence(summaryText), [summaryText]);

  useEffect(() => {
    let mounted = true;

    (async () => {
      if (!isSupabaseConfigured) {
        setProfile(null);
        setLoading(false);
        return;
      }
      setLoading(true);
      const [{ data, error }, { data: projectRows }] = await Promise.all([
        withTimeout(supabase
          .from("profile")
          .select(
            "full_name,headline,about,email,github_url,linkedin_url,resume_url,photo_url"
          )
          .order("id", { ascending: true })
          .limit(1)
          .maybeSingle()).catch((error) => ({ data: null, error })),
        withTimeout(supabase
          .from("projects")
          .select("*")
          .order("featured", { ascending: false })
          .order("priority", { ascending: true })).catch(() => ({ data: null, error: null })),
      ]);

      if (!mounted) return;

      if (error) {
        setProfile(null);
        setSummaryText("");
        setLoading(false);
        return;
      }

      const nextProfile = (data as ProfileRow) ?? null;
      const projects = ((projectRows as Record<string, unknown>[] | null) ?? []).map(normalizeProject);
      setProfile(nextProfile);
      setSummaryText(buildAtsSummary(nextProfile, projects));
      setLoading(false);
    })();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="space-y-8">
      {/* Custom header so there is NO header typing animation */}
      <div className="mb-6">
        <motion.h1
          initial={{ opacity: 0, y: 10, filter: "blur(2px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.25 }}
          className="text-4xl font-bold tracking-tight"
        >
          summary.md
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06, duration: 0.22 }}
          className="mt-3 text-sm md:text-base text-[var(--muted)] leading-relaxed"
        >
          A quick intro and what I build.
        </motion.p>

        <div className="mt-4 relative">
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.35 }}
            style={{ transformOrigin: "left" }}
            className="h-px w-full bg-[var(--border)]"
          />
          <motion.div
            animate={focusPulse ? { opacity: [0, 1, 0] } : { opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute left-0 top-[-1px] h-[3px] w-[220px] rounded-full"
            style={{
              background: "linear-gradient(90deg, var(--accent-2), transparent)",
            }}
          />
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22 }}
        className="premium-card rounded-2xl p-5 sm:p-6"
      >
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="chip">Summary</span>
          <span className="chip">Full stack</span>
          <span className="chip">Supabase</span>
          <span className="chip">Mobile-first</span>
        </div>

        {loading ? (
          <div className="space-y-3">
            <div className="shimmer h-4 w-[92%] rounded-full" />
            <div className="shimmer h-4 w-[86%] rounded-full" />
            <div className="shimmer h-4 w-[70%] rounded-full" />
          </div>
        ) : profile?.about ? (
          <TypeAnimation
            sequence={summarySequence}
            wrapper="p"
            speed={88}
            repeat={0}
            cursor={true}
            className="relative text-base sm:text-lg text-[var(--muted-strong)] leading-8 break-words whitespace-pre-wrap"
          />
        ) : (
          <p className="muted-copy">
            Add your summary in Supabase: <b>profile.about</b>
          </p>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.12 }}
        className="grid gap-3 sm:grid-cols-3"
      >
        <Info label="Navigation" value="Cmd+K command palette" />
        <Info label="Projects" value="GitHub synced into Supabase" />
        <Info label="Details" value="Modal + case-study pages" />
      </motion.div>
    </div>
  );
}

/* =========================
   ABOUT (NO SUMMARY HERE)
   - Photo card compact so it does NOT cause scroll
   - No hardcoded fallback photo/name/links content
========================= */
export function AboutSection({ focusPulse }: { focusPulse?: boolean }) {
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [loading, setLoading] = useState(true);

  const email = CONTACT_EMAIL;

  useEffect(() => {
    let mounted = true;

    (async () => {
      if (!isSupabaseConfigured) {
        setProfile(null);
        setLoading(false);
        return;
      }
      setLoading(true);
      const { data, error } = await withTimeout(supabase
        .from("profile")
        .select(
          "full_name,headline,about,email,github_url,linkedin_url,resume_url,photo_url"
        )
        .order("id", { ascending: true })
        .limit(1)
        .maybeSingle());

      if (!mounted) return;

      if (error) {
        setProfile(null);
        setLoading(false);
        return;
      }

      setProfile((data as ProfileRow) ?? null);
      setLoading(false);
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const fullName = profile?.full_name ?? "";
  const headline = profile?.headline ?? "";
  const github = safeExternalUrl(profile?.github_url);
  const linkedin = safeExternalUrl(profile?.linkedin_url);
  const resumeUrl = safeExternalUrl(profile?.resume_url);
  const photoUrl = profile?.photo_url ?? "";

  return (
    <div id="about">
      <SectionHeader
        title="about.json"
        focusPulse={focusPulse}
        subtitleSequence={[
          "B.Tech CSE @ SRM IST (KTR) • 2027",
          1200,
          "Interested in Web, App and ML development projects",
          1200,
        ]}
      />

      <div className="grid gap-5 lg:grid-cols-[1fr_340px] lg:items-start">
        {/* LEFT: info cards */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid gap-4 md:grid-cols-2"
        >
          <Info label="Email" value={email} />
          <Info label="College" value="SRM IST - Kattankulathur" />
          <Info label="Degree" value="B.Tech CSE" />
          <Info label="Focus" value="Web, app, cloud and ML projects" />
        </motion.div>

        {/* RIGHT: profile card */}
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.25 }}
          className="lg:sticky lg:top-4"
        >
          <motion.div
            whileHover={{ rotate: 0.2, y: -1 }}
            transition={{ type: "spring", stiffness: 320, damping: 22 }}
            className="premium-card rounded-2xl p-3"
          >
            <div className="flex items-center justify-between px-1 pb-2">
              <div className="text-xs font-semibold tracking-[0.18em] text-[var(--muted)]">PROFILE</div>
              <span className="h-2 w-2 rounded-full bg-[var(--success)] shadow-[0_0_18px_var(--success)]" />
            </div>

            {/* Compact image block so it does not push layout */}
            <div className="mt-2 rounded-2xl overflow-hidden border border-[var(--border)] bg-[var(--surface-muted)]">
              {loading ? (
                <div className="shimmer h-[260px] w-full" />
              ) : photoUrl ? (
                <img
                  src={photoUrl}
                  alt={fullName || "Profile photo"}
                  className="w-full h-[260px] object-cover object-top"
                />
              ) : (
                <div className="h-[260px] w-full flex items-center justify-center px-6 text-center text-xs text-[var(--muted)]">
                  Add <b className="mx-1">profile.photo_url</b> in Supabase
                </div>
              )}
            </div>

            <div className="mt-4 px-1 text-base font-semibold">
              {loading ? (
                <span className="shimmer inline-block h-4 w-40 rounded-full" />
              ) : fullName ? (
                fullName
              ) : (
                <span className="text-[var(--muted)] text-xs">
                  Add profile.full_name in Supabase
                </span>
              )}
            </div>

            <div className="mt-1 px-1 text-sm text-[var(--muted)]">
              {loading ? (
                <span className="shimmer inline-block h-3 w-52 rounded-full" />
              ) : headline ? (
                headline
              ) : (
                <span className="text-[var(--muted)] text-xs">
                  Add profile.headline in Supabase
                </span>
              )}
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <IconLink loading={loading} href={github} label="GitHub" Icon={Github} />
              <IconLink loading={loading} href={linkedin} label="LinkedIn" Icon={Linkedin} />

              <a href={`mailto:${email}`} className="btn-icon" aria-label="Email">
                <Mail size={16} />
              </a>
              <CopyEmailButton email={email} />

              <a
                href={resumeUrl || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className={[
                  "btn-primary ml-auto min-h-10 px-3 text-xs",
                  !resumeUrl || loading ? "opacity-50 pointer-events-none" : "",
                ].join(" ")}
                aria-label="Download Resume"
              >
                <Download size={14} />
                Resume
              </a>
            </div>
          </motion.div>
        </motion.div>
      </div>

      <div className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 text-sm text-[var(--muted)]">
        Interested in development projects like web, app and even ML projects.
      </div>
    </div>
  );
}

function IconLink({
  loading,
  href,
  label,
  Icon,
}: {
  loading: boolean;
  href: string | null | undefined;
  label: string;
  Icon: React.ElementType;
}) {
  if (loading) {
    return (
      <div className="shimmer h-10 w-10 rounded-xl border border-[var(--border)]" />
    );
  }
  if (!href) {
    return (
      <div
      className="btn-icon opacity-50"
        title={`Add ${label} URL in Supabase`}
      >
        <Icon size={16} />
      </div>
    );
  }
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="btn-icon"
      aria-label={label}
    >
      <Icon size={16} />
    </a>
  );
}

function CopyEmailButton({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);

  async function copyEmail() {
    const result = await copyText(email);
    setCopied(result.ok);
    window.setTimeout(() => setCopied(false), 1500);
  }

  return (
    <button
      type="button"
      onClick={copyEmail}
      className="btn-icon"
      aria-label="Copy email"
      title={copied ? "Copied" : "Copy email"}
    >
      <Copy size={16} />
    </button>
  );
}

/* =========================
   EDUCATION
========================= */
export function EducationSection({ focusPulse }: { focusPulse?: boolean }) {
  const edu = [
    {
      title: "SRM IST - Kattankulathur (2027)",
      desc: "B.Tech, Computer Science and Engineering",
    },
    {
      title: "Swarajaya Senior Secondary School (2023)",
      desc: "Class XII",
    },
    {
      title: "St Anselm’s Pink City School, Jaipur (2021)",
      desc: "Class X",
    },
  ];

  return (
    <div id="projects">
      <SectionHeader
        title="education.md"
        focusPulse={focusPulse}
        subtitleSequence={["Education timeline", 1200, "Consistent learning + project work", 1200]}
      />
      <Timeline items={edu.map((e) => ({ title: e.title, desc: e.desc }))} />
    </div>
  );
}

/* =========================
   PROJECTS (SUPABASE ONLY)
========================= */
export function ProjectsSection({
  focusPulse,
}: {
  focusPulse?: boolean;
}) {
  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [sort, setSort] = useState("featured");
  const [selected, setSelected] = useState<PortfolioProject | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query), 180);
    return () => window.clearTimeout(timer);
  }, [query]);

  async function loadProjects() {
    setLoading(true);
    setError(false);

    if (!isSupabaseConfigured) {
      setProjects([]);
      setError(true);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await withTimeout(supabase.from("projects").select("*"));
      if (error) throw error;
      setProjects(sortProjects(((data as Record<string, unknown>[]) ?? []).map(normalizeProject)));
    } catch (error) {
      console.error("Could not load projects:", error);
      setProjects([]);
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let mounted = true;

    (async () => {
      if (!isSupabaseConfigured) {
        if (!mounted) return;
        setProjects([]);
        setError(true);
        setLoading(false);
        return;
      }
      try {
        const { data, error } = await withTimeout(supabase.from("projects").select("*"));
        if (error) throw error;
        if (!mounted) return;
        setProjects(sortProjects(((data as Record<string, unknown>[]) ?? []).map(normalizeProject)));
      } catch (error) {
        console.error("Could not load projects:", error);
        if (!mounted) return;
        setProjects([]);
        setError(true);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const filters = useMemo(() => {
    const dynamic = new Set<string>(["All", "Featured", "Full Stack", "AI/ML", "Healthcare", "Web App", "Mobile/PWA", "DevOps", "Computer Vision", "Major Project"]);
    projects.forEach((project) => {
      if (project.category) dynamic.add(project.category);
      if (project.difficulty) dynamic.add(project.difficulty);
      project.tags.slice(0, 4).forEach((tag) => dynamic.add(tag));
    });
    return Array.from(dynamic).slice(0, 16);
  }, [projects]);

  const visibleProjects = useMemo(() => {
    return sortProjects(
      projects.filter((project) => projectMatches(project, debouncedQuery) && projectMatchesFilter(project, filter)),
      sort
    );
  }, [projects, debouncedQuery, filter, sort]);

  const featuredProjects = useMemo(() => sortProjects(projects.filter((project) => project.featured), "featured").slice(0, 5), [projects]);

  return (
    <div>
      <SectionHeader
        title="projects/"
        focusPulse={focusPulse}
        subtitleSequence={[
          "GitHub synced projects from Supabase",
          1200,
          "Search, filter and open details instantly",
          1200,
        ]}
      />

      {loading ? (
        <ProjectSkeletons />
      ) : error ? (
        <div className="premium-card rounded-2xl p-5 text-sm text-[var(--muted)]">
          <div className="text-base font-semibold text-[var(--foreground)]">Could not load projects right now.</div>
          <p className="mt-2">
            {isSupabaseConfigured ? "The request failed. You can retry without refreshing the page." : "Supabase environment variables are not configured."}
          </p>
          <button type="button" onClick={loadProjects} className="btn-secondary mt-4 px-4">
            Retry
          </button>
        </div>
      ) : projects.length === 0 ? (
        <div className="premium-card rounded-2xl p-6 text-sm text-[var(--muted)]">
          <div className="text-base font-semibold text-[var(--foreground)]">No projects synced yet</div>
          <p className="mt-2 leading-relaxed">
            Add GitHub topic <b>portfolio</b>, include <b>.portfolio.json</b>, then run the sync.
          </p>
        </div>
      ) : (
        <>
          {featuredProjects.length ? (
            <div className="mb-7">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold tracking-[0.18em] text-[var(--muted)]">FEATURED</div>
                  <div className="mt-1 text-sm text-[var(--muted)]">Selected projects with the strongest signal.</div>
                </div>
              </div>
              <div className="thin-scrollbar flex snap-x gap-4 overflow-x-auto pb-3">
                {featuredProjects.map((project) => (
                  <motion.button
                    key={project.id}
                    onClick={() => setSelected(project)}
                    whileHover={{ y: -3 }}
                    whileTap={{ scale: 0.98 }}
                    className="premium-card min-w-[270px] max-w-[380px] snap-start rounded-2xl p-5 text-left sm:min-w-[340px]"
                  >
                    <div className="relative flex items-start justify-between gap-3">
                      <span className="min-w-0 truncate text-lg font-semibold">{project.title}</span>
                      <span className="chip shrink-0">Featured</span>
                    </div>
                    <p className="relative mt-3 line-clamp-2 text-sm leading-relaxed text-[var(--muted)]">{project.short_description}</p>
                    <div className="relative mt-4 flex flex-wrap gap-2">
                      {project.tech_stack.slice(0, 3).map((tech) => <MiniBadge key={tech}>{tech}</MiniBadge>)}
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          ) : null}

          <div className="premium-card mb-5 grid gap-3 rounded-2xl p-3 lg:grid-cols-[1fr_190px_180px]">
            <label className="relative block">
              <span className="sr-only">Search projects</span>
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                aria-label="Search projects"
                placeholder="Search projects..."
                className="field-control pl-9 pr-3 text-sm outline-none"
              />
            </label>
            <select
              aria-label="Filter projects"
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              className="field-control px-3 text-sm outline-none"
            >
              {filters.map((value) => (
                <option key={value} value={value}>{value}</option>
              ))}
            </select>
            <select
              aria-label="Sort projects"
              value={sort}
              onChange={(event) => setSort(event.target.value)}
              className="field-control px-3 text-sm outline-none"
            >
              <option value="featured">Featured first</option>
              <option value="latest">Latest updated</option>
              <option value="priority">Priority</option>
              <option value="az">A to Z</option>
            </select>
          </div>
          {(query || filter !== "All" || sort !== "featured") ? (
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3 text-xs text-[var(--muted)]">
              <span>
                Showing {visibleProjects.length} of {projects.length} project{projects.length === 1 ? "" : "s"}
              </span>
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setDebouncedQuery("");
                  setFilter("All");
                  setSort("featured");
                }}
                className="btn-ghost min-h-8 px-3 text-xs"
              >
                Clear search and filters
              </button>
            </div>
          ) : null}

          {visibleProjects.length ? (
            <motion.div variants={container} initial="hidden" animate="show" className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {visibleProjects.map((project) => (
                <ProjectCard key={project.id} project={project} onOpen={() => setSelected(project)} />
              ))}
            </motion.div>
          ) : (
            <div className="premium-card rounded-2xl p-6 text-sm text-[var(--muted)]">
              <div className="text-base font-semibold text-[var(--foreground)]">No matching projects found</div>
              <p className="mt-2">Try a different keyword, filter, or sort option.</p>
            </div>
          )}
        </>
      )}
      <ProjectModal open={Boolean(selected)} project={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

function ProjectCard({ project, onOpen }: { project: PortfolioProject; onOpen: () => void }) {
  const hasProjectLinks = Boolean(project.demo_url || project.repo_url);

  return (
    <motion.article
      variants={item}
      whileHover={{ y: -3 }}
      className="premium-card group flex h-full min-w-0 flex-col rounded-2xl p-5"
    >
      <button
        type="button"
        onClick={onOpen}
        className="relative flex flex-1 flex-col text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-2)]"
        aria-label={`Open details for ${project.title}`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-lg font-semibold">{project.title}</h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {project.category ? <MiniBadge>{project.category}</MiniBadge> : null}
              {project.featured ? <MiniBadge>Featured</MiniBadge> : null}
              {project.difficulty ? (
                <span className={`rounded-md border px-2 py-1 text-[10px] ${difficultyTone(project.difficulty)}`}>
                  {project.difficulty}
                </span>
              ) : null}
            </div>
          </div>
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] transition-colors group-hover:text-[var(--accent-2)]">
            <ExternalLink size={16} />
          </span>
        </div>

        <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-[var(--muted)]">
          {project.short_description || project.long_description || "Project details sync from GitHub."}
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          {project.tech_stack.slice(0, 4).map((tech) => (
            <MiniBadge key={tech}>{tech}</MiniBadge>
          ))}
        </div>

        <div className="mt-auto flex flex-wrap items-center gap-3 border-t border-[var(--border)] pt-4 text-xs text-[var(--muted)]">
          <span className="inline-flex items-center gap-1"><Star size={13} /> {project.stars}</span>
          <span className="inline-flex items-center gap-1"><GitFork size={13} /> {project.forks}</span>
          <span className="inline-flex items-center gap-1"><CircleAlert size={13} /> {project.open_issues}</span>
          {project.language ? <span className="ml-auto truncate">{project.language}</span> : null}
        </div>
      </button>

      {hasProjectLinks ? (
        <div className="relative mt-4 flex flex-wrap gap-2 border-t border-[var(--border)] pt-4">
          {project.demo_url ? (
            <a
              href={project.demo_url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary min-h-9 flex-1 px-3 text-xs sm:flex-none"
              aria-label={`Open live page for ${project.title}`}
            >
              <ExternalLink size={14} /> Live page
            </a>
          ) : null}
          {project.repo_url ? (
            <a
              href={project.repo_url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary min-h-9 flex-1 px-3 text-xs sm:flex-none"
              aria-label={`Open GitHub repository for ${project.title}`}
            >
              <Github size={14} /> GitHub repo
            </a>
          ) : null}
        </div>
      ) : null}
    </motion.article>
  );
}

function ProjectSkeletons() {
  return (
    <div className="space-y-4">
      <div className="shimmer h-32 rounded-2xl border border-[var(--border)]" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((n) => (
          <div key={n} className="shimmer h-56 rounded-2xl border border-[var(--border)]" />
        ))}
      </div>
    </div>
  );
}

function MiniBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="chip relative text-[10px]">
      {children}
    </span>
  );
}

/* =========================
   SKILLS
========================= */
export function SkillsSection({ focusPulse }: { focusPulse?: boolean }) {
  return (
    <div>
      <SectionHeader
        title="skills.ts"
        focusPulse={focusPulse}
        subtitleSequence={[
          "Languages • Frameworks • Tools",
          1200,
          "Practical, project-based stack",
          1200,
        ]}
      />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-3 md:grid-cols-2"
      >
        <TagCard
          title="Programming Languages"
          items={["C/C++", "Java", "JavaScript", "Python", "Dart"]}
        />
        <TagCard
          title="Frontend"
          items={["React", "Next.js", "Tailwind CSS", "HTML", "CSS"]}
        />
        <TagCard
          title="Backend"
          items={["Node.js", "Express", "Flask", "Supabase"]}
        />
        <TagCard
          title="Tools"
          items={["Git/GitHub", "Postman", "Figma", "Android Studio", "VS Code"]}
        />
        <TagCard title="Databases" items={["MySQL", "MongoDB", "Postgres"]} />
        <TagCard title="Interests" items={["Full Stack", "App Dev", "ML"]} />
      </motion.div>
    </div>
  );
}

/* =========================
   CERTIFICATIONS
========================= */
export function CertificationsSection({ focusPulse }: { focusPulse?: boolean }) {
  const [certifications, setCertifications] = useState<CertificationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadCertifications() {
    if (!isSupabaseConfigured) {
      setCertifications([]);
      setError("Supabase environment variables are not configured.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const { data, error } = await withTimeout(
        supabase
          .from("certifications")
          .select("id,title,issuer,credential_id,credential_url,description,skills,issued_at,expires_at,featured,priority")
          .order("featured", { ascending: false })
          .order("priority", { ascending: true })
          .order("issued_at", { ascending: false })
      );

      if (error) throw error;
      setCertifications(((data as CertificationRow[] | null) ?? []).filter((cert) => Boolean(cert.title?.trim())));
    } catch (error) {
      console.error("Could not load certifications:", error);
      setError(userSafeError(error, "Could not load certifications right now."));
      setCertifications([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;

    async function run() {
      if (!active) return;
      await loadCertifications();
    }

    run();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div>
      <SectionHeader
        title="certifications.md"
        focusPulse={focusPulse}
        subtitleSequence={[
          "Certifications",
          1200,
          "Focused on practical learning",
          1200,
        ]}
      />

      {loading ? (
        <div className="space-y-3">
          {[0, 1].map((index) => (
            <div key={index} className="premium-card rounded-2xl p-5">
              <div className="shimmer h-4 w-48 rounded-full" />
              <div className="mt-3 shimmer h-3 w-[72%] rounded-full" />
              <div className="mt-4 flex gap-2">
                <div className="shimmer h-7 w-20 rounded-full" />
                <div className="shimmer h-7 w-24 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="premium-card rounded-2xl p-5 text-sm text-[var(--muted)]">
          <div className="text-base font-semibold text-[var(--foreground)]">Could not load certifications right now.</div>
          <p className="mt-2">{error}</p>
          <button type="button" onClick={loadCertifications} className="btn-secondary mt-4 px-4">
            Retry
          </button>
        </div>
      ) : certifications.length === 0 ? (
        <div className="premium-card rounded-2xl p-6 text-sm text-[var(--muted)]">
          <div className="text-base font-semibold text-[var(--foreground)]">No certifications added yet</div>
          <p className="mt-2 leading-relaxed">
            Add rows in Supabase: <b>certifications</b>. Required field: <b>title</b>.
          </p>
        </div>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-3"
        >
          {certifications.map((certification) => (
            <CertificationCard key={certification.id} certification={certification} />
          ))}
        </motion.div>
      )}
    </div>
  );
}

/* =========================
   VOLUNTEERING
========================= */
export function VolunteeringSection({ focusPulse }: { focusPulse?: boolean }) {
  return (
    <div>
      <SectionHeader
        title="volunteering.md"
        focusPulse={focusPulse}
        subtitleSequence={[
          "Community work",
          1200,
          "Tutoring • admissions support • engagement",
          1200,
        ]}
      />
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-3"
      >
        <Card
          title="Nanhe Kadam Society, Jaipur — Volunteer"
          desc="Tutoring (Basics of Computing, English, Math), admissions support, fee-support via schemes, nutrition coordination, creative activities, awareness sessions, family engagement."
        />
      </motion.div>
    </div>
  );
}

/* =========================
   EXTRACURRICULAR
========================= */
export function ExtracurricularSection({ focusPulse }: { focusPulse?: boolean }) {
  return (
    <div>
      <SectionHeader
        title="extracurricular.md"
        focusPulse={focusPulse}
        subtitleSequence={[
          "Workshops + club work",
          1200,
          "Tech + communication",
          1200,
        ]}
      />
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-3"
      >
        <Card
          title="App Archives (Apr 2024) — Node.js + MongoDB"
          desc="Workshop focused on social-media style backend features and practical development."
        />
        <Card
          title="IEEE CS — Social Media Volunteer"
          desc="Created posts, supported engagement, and promoted club events."
        />
      </motion.div>
    </div>
  );
}

/* =========================
   CONTACT
========================= */
export function ContactSection({ focusPulse }: { focusPulse?: boolean }) {
  const [name, setName] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{
    type: "idle" | "ok" | "err";
    msg?: string;
  }>({ type: "idle" });

  const validationHint = useMemo(
    () =>
      validateContactInput({
        name,
        email: senderEmail,
        message,
        website,
      }),
    [name, senderEmail, message, website]
  );

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus({ type: "idle" });

    const validationMessage = validateContactInput({
      name,
      email: senderEmail,
      message,
      website,
    });

    if (validationMessage) {
      setStatus({ type: "err", msg: validationMessage });
      return;
    }

    if (!isSupabaseConfigured) {
      setStatus({ type: "err", msg: "Contact form is not configured yet." });
      return;
    }

    setLoading(true);
    try {
      const { error } = await withTimeout(supabase.from("contact_messages").insert([
        {
          name: name.trim(),
          email: senderEmail.trim().toLowerCase(),
          message: message.trim(),
        },
      ]));

      if (error) throw error;

      setStatus({ type: "ok", msg: "Message sent successfully. I will reply by email." });
      setName("");
      setSenderEmail("");
      setMessage("");
      setWebsite("");
    } catch (error) {
      console.error("Contact form submission failed:", error);
      setStatus({ type: "err", msg: userSafeError(error, "Could not send the message. Please try again.") });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <SectionHeader
        title="contact.ts"
        focusPulse={focusPulse}
        subtitleSequence={[
          "Drop a message. It goes into Supabase.",
          1200,
          "I usually reply via email.",
          1200,
        ]}
      />

      <motion.form
        onSubmit={onSubmit}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.22 }}
        className="premium-card grid gap-4 rounded-2xl p-4 sm:p-5 md:grid-cols-2"
        noValidate
      >
        <Input label="Name" value={name} onChange={setName} />
        <Input label="Email" value={senderEmail} onChange={setSenderEmail} />
        <label className="hidden" aria-hidden="true">
          Website
          <input tabIndex={-1} autoComplete="off" value={website} onChange={(event) => setWebsite(event.target.value)} />
        </label>
        <div className="md:col-span-2">
          <Input label="Message" textarea value={message} onChange={setMessage} />
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--muted)]">
            <span>{message.trim().length}/1200 characters</span>
            {validationHint && (name || senderEmail || message) ? <span>{validationHint}</span> : null}
          </div>
        </div>

        <motion.button
          type="submit"
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.985 }}
          disabled={loading}
          aria-disabled={loading}
          className={[
            "btn-primary w-fit px-5",
            loading ? "opacity-50 cursor-not-allowed" : "",
          ].join(" ")}
        >
          {loading ? "Sending..." : "Send message"}
        </motion.button>

        {status.type !== "idle" && (
          <div
            role={status.type === "err" ? "alert" : "status"}
            aria-live="polite"
            className={[
              "md:col-span-2 text-sm",
              status.type === "ok" ? "rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 text-[var(--success)]" : "rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 text-[var(--danger)]",
            ].join(" ")}
          >
            {status.msg}
          </div>
        )}
      </motion.form>
    </div>
  );
}

/* =========================
   HELPERS
========================= */
function Info({ label, value }: { label: string; value: string }) {
  return (
    <motion.div variants={item}>
      <div className="premium-card rounded-2xl p-4">
        <div className="relative text-xs font-medium uppercase tracking-[0.16em] text-[var(--muted)]">{label}</div>
        <div className="relative mt-2 text-sm font-semibold leading-relaxed break-words">{value}</div>
      </div>
    </motion.div>
  );
}

function Card({ title, desc }: { title: string; desc: string }) {
  return (
    <motion.div
      variants={item}
      whileHover={{ y: -2, rotate: 0.15 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
    >
      <div className="premium-card rounded-2xl p-5">
        <div className="relative text-base font-semibold">{title}</div>
        <div className="relative mt-2 text-sm text-[var(--muted)] leading-relaxed">
          {desc}
        </div>
      </div>
    </motion.div>
  );
}

function CertificationCard({ certification }: { certification: CertificationRow }) {
  const credentialUrl = safeExternalUrl(certification.credential_url);
  const dateParts = [
    certification.issued_at ? `Issued ${formatDate(certification.issued_at)}` : "",
    certification.expires_at ? `Expires ${formatDate(certification.expires_at)}` : "",
  ].filter(Boolean);

  return (
    <motion.div
      variants={item}
      whileHover={{ y: -2, rotate: 0.12 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
    >
      <div className="premium-card rounded-2xl p-5">
        <div className="relative flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="text-base font-semibold break-words">{certification.title}</div>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-[var(--muted)]">
              {certification.issuer ? <span>{certification.issuer}</span> : null}
              {certification.credential_id ? <span className="chip">ID: {certification.credential_id}</span> : null}
              {certification.featured ? <span className="chip">Featured</span> : null}
            </div>
          </div>
          {credentialUrl ? (
            <a
              href={credentialUrl}
              target="_blank"
              rel="noreferrer"
              className="btn-ghost shrink-0 px-3 text-xs"
              aria-label={`Open credential for ${certification.title}`}
            >
              <ExternalLink size={14} />
              Credential
            </a>
          ) : null}
        </div>

        {certification.description ? (
          <p className="relative mt-3 text-sm leading-relaxed text-[var(--muted)]">{certification.description}</p>
        ) : null}

        <div className="relative mt-4 flex flex-wrap gap-2">
          {dateParts.map((part) => (
            <span key={part} className="chip">{part}</span>
          ))}
          {(certification.skills ?? []).filter(Boolean).slice(0, 5).map((skill) => (
            <span key={skill} className="chip">{skill}</span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function TagCard({ title, items }: { title: string; items: string[] }) {
  return (
    <motion.div
      variants={item}
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
    >
      <div className="premium-card rounded-2xl p-5">
        <div className="relative text-base font-semibold">{title}</div>
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="relative mt-4 flex flex-wrap gap-2"
        >
          {items.map((t) => (
            <motion.span
              key={t}
              variants={item}
              whileHover={{ y: -1 }}
              className="chip"
            >
              {t}
            </motion.span>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}

function Input({
  label,
  textarea = false,
  value,
  onChange,
}: {
  label: string;
  textarea?: boolean;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--muted)]">{label}</span>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required
          maxLength={1200}
          className="field-control h-36 resize-none px-3 py-3 text-sm outline-none"
        />
      ) : (
        <input
          type={label.toLowerCase() === "email" ? "email" : "text"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required
          maxLength={label.toLowerCase() === "name" ? 80 : undefined}
          autoComplete={label.toLowerCase() === "email" ? "email" : "name"}
          className="field-control px-3 text-sm outline-none"
        />
      )}
    </label>
  );
}

function Timeline({
  items,
  clickable,
}: {
  items: { title: string; desc: string; onClick?: () => void }[];
  clickable?: boolean;
}) {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="relative pl-6"
    >
      <motion.div
        initial={{ scaleY: 0, opacity: 0 }}
        animate={{ scaleY: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        style={{ transformOrigin: "top" }}
        className="absolute left-2 top-1 bottom-1 w-px bg-gradient-to-b from-[var(--accent-2)] via-[var(--border)] to-transparent"
      />

      <div className="grid gap-4">
        {items.map((it) => (
          <motion.div
            key={it.title}
            variants={item}
            whileHover={clickable ? { x: 3 } : undefined}
            className={clickable ? "cursor-pointer" : ""}
            onClick={it.onClick}
          >
            <div className="relative">
              <div className="absolute -left-[22px] top-[16px] h-3 w-3 rounded-full border border-[var(--accent-2)] bg-[var(--bg-panel)] shadow-[0_0_18px_var(--glow)]" />
              <div className="premium-card rounded-2xl p-5">
                <div className="relative text-base font-semibold">{it.title}</div>
                <div className="relative mt-2 text-sm text-[var(--muted)] leading-relaxed">
                  {it.desc}
                </div>
                {clickable ? (
                  <div className="mt-3 text-xs text-[var(--accent-2)] font-semibold">
                    Peek →
                  </div>
                ) : null}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
