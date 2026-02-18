"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabaseClient";
import SectionHeader from "@/components/SectionHeader";
import type { PeekProject } from "@/components/PeekPanel";
import { TypeAnimation } from "react-type-animation";
import { Github, Linkedin, Mail, Download } from "lucide-react";

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

type ProjectRow = {
  id: number;
  title: string;
  timeframe: string | null;
  description: string;
  bullets: string[] | null;
  stack: string[] | null;
  github_url: string | null;
  live_url: string | null;
  image_url: string | null;
  featured: boolean | null;
  sort_order: number | null;
};

/* =========================
   SUMMARY (NOW HOLDS PROFILE.ABOUT)
   - NO phrase typing here
   - ONLY summary text typing
   - Typing speed faster than reading pace
========================= */
export function SummarySection({ focusPulse }: { focusPulse?: boolean }) {
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("profile")
        .select(
          "full_name,headline,about,email,github_url,linkedin_url,resume_url,photo_url"
        )
        .order("id", { ascending: true })
        .limit(1)
        .maybeSingle();

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

  return (
    <div>
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
        className="rounded-xl border border-[var(--border)] bg-white/5 p-5"
      >
        <div className="text-xs text-[var(--muted)] mb-2">Summary</div>

        {loading ? (
          <div className="space-y-3">
            <div className="h-4 w-[92%] rounded bg-white/10" />
            <div className="h-4 w-[86%] rounded bg-white/10" />
            <div className="h-4 w-[70%] rounded bg-white/10" />
          </div>
        ) : profile?.about ? (
          <TypeAnimation
            sequence={[profile.about]}
            wrapper="p"
            speed={70}   // faster typing
            repeat={0}
            cursor={true}
            className="text-[var(--muted)] leading-relaxed break-words whitespace-pre-wrap"
          />
        ) : (
          <p className="text-[var(--muted)] leading-relaxed">
            Add your summary in Supabase: <b>profile.about</b>
          </p>
        )}
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.12 }}
        className="mt-5 text-[var(--muted)] leading-relaxed"
      >
        Use <span className="text-[var(--accent-2)] font-semibold">Cmd+K</span>{" "}
        for fast navigation. Projects open in the Peek panel.
      </motion.p>
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

  const email = "forshreyanshwork@gmail.com";

  useEffect(() => {
    let mounted = true;

    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("profile")
        .select(
          "full_name,headline,about,email,github_url,linkedin_url,resume_url,photo_url"
        )
        .order("id", { ascending: true })
        .limit(1)
        .maybeSingle();

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
  const github = profile?.github_url ?? "";
  const linkedin = profile?.linkedin_url ?? "";
  const resumeUrl = profile?.resume_url ?? "";
  const photoUrl = profile?.photo_url ?? "";

  return (
    <div>
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

      <div className="grid gap-6 lg:grid-cols-[1fr_320px] lg:items-start">
        {/* LEFT: info cards */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid gap-3 md:grid-cols-2"
        >
          <Info label="Email" value={email} />
          <Info label="College" value="SRM IST - Kattankulathur" />
          <Info label="Degree" value="B.Tech CSE" />
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
            className="rounded-xl border border-[var(--border)] bg-white/5 p-3"
          >
            <div className="text-xs text-[var(--muted)]">Profile</div>

            {/* Compact image block so it does not push layout */}
            <div className="mt-2 rounded-lg overflow-hidden border border-[var(--border)] bg-black/20">
              {loading ? (
                <div className="h-[240px] w-full bg-white/10" />
              ) : photoUrl ? (
                <img
                  src={photoUrl}
                  alt={fullName || "Profile photo"}
                  className="w-full h-[240px] object-cover object-top"
                />
              ) : (
                <div className="h-[240px] w-full flex items-center justify-center text-xs text-[var(--muted)]">
                  Add <b className="mx-1">profile.photo_url</b> in Supabase
                </div>
              )}
            </div>

            <div className="mt-2 text-sm font-semibold">
              {loading ? (
                <span className="inline-block h-4 w-40 rounded bg-white/10" />
              ) : fullName ? (
                fullName
              ) : (
                <span className="text-[var(--muted)] text-xs">
                  Add profile.full_name in Supabase
                </span>
              )}
            </div>

            <div className="text-xs text-[var(--muted)] mt-1">
              {loading ? (
                <span className="inline-block h-3 w-52 rounded bg-white/10" />
              ) : headline ? (
                headline
              ) : (
                <span className="text-[var(--muted)] text-xs">
                  Add profile.headline in Supabase
                </span>
              )}
            </div>

            <div className="mt-3 flex items-center gap-2">
              <IconLink loading={loading} href={github} label="GitHub" Icon={Github} />
              <IconLink loading={loading} href={linkedin} label="LinkedIn" Icon={Linkedin} />

              <a
                href={`mailto:${email}`}
                className="rounded-md border border-[var(--border)] bg-white/5 hover:bg-white/10 p-2"
                aria-label="Email"
              >
                <Mail size={16} />
              </a>

              <a
                href={resumeUrl || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className={[
                  "ml-auto rounded-md border border-[var(--border)] px-3 py-2 text-xs flex items-center gap-2",
                  "bg-white/10 hover:bg-white/15",
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

      <div className="mt-6 text-sm text-[var(--muted)]">
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
      <div className="h-9 w-9 rounded-md border border-[var(--border)] bg-white/5" />
    );
  }
  if (!href) {
    return (
      <div
        className="h-9 w-9 rounded-md border border-[var(--border)] bg-white/5 opacity-50 flex items-center justify-center"
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
      className="rounded-md border border-[var(--border)] bg-white/5 hover:bg-white/10 p-2"
      aria-label={label}
    >
      <Icon size={16} />
    </a>
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
    <div>
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
  onPeek,
}: {
  focusPulse?: boolean;
  onPeek: (p: PeekProject) => void;
}) {
  const [rows, setRows] = useState<ProjectRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("projects")
        .select(
          "id,title,timeframe,description,bullets,stack,github_url,live_url,image_url,featured,sort_order"
        )
        .order("sort_order", { ascending: true })
        .order("id", { ascending: true });

      if (!mounted) return;

      if (error) {
        setRows([]);
        setLoading(false);
        return;
      }

      setRows((data as ProjectRow[]) ?? []);
      setLoading(false);
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const timelineItems = useMemo(() => {
    return rows.map((p) => {
      const peek: PeekProject = {
        title: p.title,
        meta: p.timeframe ?? undefined,
        desc: p.description,
        bullets: p.bullets ?? undefined,
        stack: p.stack ?? undefined,
        links: [
          ...(p.github_url ? [{ label: "GitHub", href: p.github_url }] : []),
          ...(p.live_url ? [{ label: "Live", href: p.live_url }] : []),
        ],
      };

      return {
        title: `${p.title}${p.timeframe ? ` (${p.timeframe})` : ""}`,
        desc: p.description,
        onClick: () => onPeek(peek),
      };
    });
  }, [rows, onPeek]);

  return (
    <div>
      <SectionHeader
        title="projects/"
        focusPulse={focusPulse}
        subtitleSequence={[
          "Projects loaded from Supabase",
          1200,
          "Click any entry to open Peek",
          1200,
        ]}
      />

      {loading ? (
        <div className="space-y-3">
          <div className="h-14 rounded-lg border border-[var(--border)] bg-white/5" />
          <div className="h-14 rounded-lg border border-[var(--border)] bg-white/5" />
          <div className="h-14 rounded-lg border border-[var(--border)] bg-white/5" />
        </div>
      ) : rows.length === 0 ? (
        <div className="text-sm text-[var(--muted)]">
          No projects found. Add rows in Supabase table: <b>projects</b>.
        </div>
      ) : (
        <Timeline items={timelineItems} clickable />
      )}
    </div>
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
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-3"
      >
        <Card
          title="Introduction To Machine Learning (NPTEL)"
          desc="NPTEL - MoE, Govt. of India • NPTEL25CS149S233202327"
        />
      </motion.div>
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
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{
    type: "idle" | "ok" | "err";
    msg?: string;
  }>({ type: "idle" });

  const canSubmit = useMemo(
    () =>
      name.trim().length >= 2 &&
      senderEmail.trim().includes("@") &&
      message.trim().length >= 5,
    [name, senderEmail, message]
  );

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus({ type: "idle" });

    if (!canSubmit) {
      setStatus({ type: "err", msg: "Please fill all fields correctly." });
      return;
    }

    setLoading(true);
    const { error } = await supabase.from("contact_messages").insert([
      {
        name: name.trim(),
        email: senderEmail.trim(),
        message: message.trim(),
      },
    ]);
    setLoading(false);

    if (error) {
      setStatus({ type: "err", msg: error.message });
      return;
    }

    setStatus({ type: "ok", msg: "Message sent successfully." });
    setName("");
    setSenderEmail("");
    setMessage("");
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
        className="grid gap-3 md:grid-cols-2"
      >
        <Input label="Name" value={name} onChange={setName} />
        <Input label="Email" value={senderEmail} onChange={setSenderEmail} />
        <div className="md:col-span-2">
          <Input label="Message" textarea value={message} onChange={setMessage} />
        </div>

        <motion.button
          type="submit"
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.985 }}
          disabled={!canSubmit || loading}
          className={[
            "w-fit rounded-md border border-[var(--border)] px-4 py-2 text-sm",
            "bg-white/10 hover:bg-white/15",
            !canSubmit || loading ? "opacity-50 cursor-not-allowed" : "",
          ].join(" ")}
        >
          {loading ? "Sending..." : "Send"}
        </motion.button>

        {status.type !== "idle" && (
          <div
            className={[
              "md:col-span-2 text-sm",
              status.type === "ok" ? "text-green-300" : "text-red-300",
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
      <div className="rounded-lg border border-[var(--border)] bg-white/5 p-4">
        <div className="text-xs text-[var(--muted)]">{label}</div>
        <div className="mt-1 text-sm font-semibold break-words">{value}</div>
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
      <div className="rounded-lg border border-[var(--border)] bg-white/5 p-4 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity"
          style={{
            background:
              "radial-gradient(600px circle at 40% 10%, var(--accent-2), transparent 60%)",
          }}
        />
        <div className="relative">
          <div className="text-base font-semibold">{title}</div>
          <div className="mt-2 text-sm text-[var(--muted)] leading-relaxed">
            {desc}
          </div>
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
      <div className="rounded-lg border border-[var(--border)] bg-white/5 p-4">
        <div className="text-base font-semibold">{title}</div>
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="mt-3 flex flex-wrap gap-2"
        >
          {items.map((t) => (
            <motion.span
              key={t}
              variants={item}
              whileHover={{ y: -1 }}
              className="rounded-md border border-[var(--border)] bg-black/10 px-2 py-1 text-xs text-[var(--muted)]"
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
      <span className="text-xs text-[var(--muted)]">{label}</span>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-28 resize-none rounded-md border border-[var(--border)] bg-black/20 px-3 py-2 text-sm outline-none focus:border-[var(--accent-2)]"
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 rounded-md border border-[var(--border)] bg-black/20 px-3 text-sm outline-none focus:border-[var(--accent-2)]"
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
        className="absolute left-2 top-1 bottom-1 w-px bg-[var(--border)]"
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
              <div className="absolute -left-[22px] top-[8px] h-3 w-3 rounded-full border border-[var(--border)] bg-[var(--bg-panel)]" />
              <div className="rounded-lg border border-[var(--border)] bg-white/5 p-4">
                <div className="text-base font-semibold">{it.title}</div>
                <div className="mt-2 text-sm text-[var(--muted)] leading-relaxed">
                  {it.desc}
                </div>
                {clickable ? (
                  <div className="mt-3 text-xs text-[var(--accent-2)] font-semibold">
                    Open Peek →
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