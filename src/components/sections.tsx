"use client";

import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabaseClient";
import SectionHeader from "@/components/SectionHeader";
import type { PeekProject } from "@/components/PeekPanel";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } },
};

const item = {
  hidden: { opacity: 0, y: 10, filter: "blur(2px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.22 } },
};

export function SummarySection({ focusPulse }: { focusPulse?: boolean }) {
  return (
    <div>
      <SectionHeader
        title="summary.md"
        focusPulse={focusPulse}
        subtitleSequence={[
          "Full Stack + Cloud + ML Projects",
          1200,
          "Next.js + Supabase • VS Code style",
          1200,
          "Building products, not just projects.",
          1200,
        ]}
      />

      <motion.div variants={container} initial="hidden" animate="show" className="grid gap-3 md:grid-cols-3">
        <MotionStat label="CGPA" value="9.36/10" />
        <MotionStat label="Graduation" value="2027" />
        <MotionStat label="Focus" value="Full Stack + Cloud + ML" />
      </motion.div>

      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="mt-6 text-[var(--muted)] leading-relaxed">
        Use <span className="text-[var(--accent-2)] font-semibold">Cmd+K</span> to jump between sections fast.
      </motion.p>
    </div>
  );
}

export function AboutSection({ focusPulse }: { focusPulse?: boolean }) {
  return (
    <div>
      <SectionHeader
        title="about.json"
        focusPulse={focusPulse}
        subtitleSequence={[
          "B.Tech CSE @ SRM IST (KTR) • 2027",
          1200,
          "Product building • Cloud fundamentals • ML systems",
          1200,
          "Clean UI, strong backend, real deployments.",
          1200,
        ]}
      />

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <motion.div variants={container} initial="hidden" animate="show" className="flex-1 grid gap-3 md:grid-cols-2">
          <Info label="Email" value="ss4217@srmist.edu.in" />
          <Info label="Phone" value="7014792383" />
          <Info label="Degree" value="B.Tech CSE" />
          <Info label="College" value="SRM IST - Kattankulathur" />
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.25 }} className="w-full lg:w-[280px]">
          <motion.div
            whileHover={{ rotate: 0.3, y: -2 }}
            transition={{ type: "spring", stiffness: 350, damping: 20 }}
            className="rounded-xl border border-[var(--border)] bg-white/5 p-3"
          >
            <div className="text-xs text-[var(--muted)]">Profile</div>
            <img src="/me.jpg" alt="Shreyansh Singhal" className="mt-2 w-full rounded-lg object-cover" />
            <div className="mt-2 text-sm font-semibold">Shreyansh Singhal</div>
            <div className="text-xs text-[var(--muted)]">SRM IST • CSE • 2027</div>
          </motion.div>
        </motion.div>
      </div>

      <motion.div variants={container} initial="hidden" animate="show" className="mt-6">
        <motion.div variants={item} className="text-[var(--muted)] leading-relaxed">
          Interested in{" "}
          <span className="text-[var(--accent-2)] font-semibold">full stack engineering</span>,{" "}
          <span className="text-[var(--accent-2)] font-semibold">cloud workflows</span>, and{" "}
          <span className="text-[var(--accent-2)] font-semibold">ML-driven products</span>.
        </motion.div>
      </motion.div>
    </div>
  );
}

export function EducationSection({ focusPulse }: { focusPulse?: boolean }) {
  const edu = [
    { title: "SRM IST - Kattankulathur (2027)", desc: "B.Tech, Computer Science and Engineering — CGPA 9.36/10" },
    { title: "Swarajaya Senior Secondary School (2023)", desc: "Class XII — Northwest Accreditation Commission, USA — 80.6%" },
    { title: "St Anselm’s Pink City School, Jaipur (2021)", desc: "Class X — CBSE — 82.8%" },
  ];

  return (
    <div>
      <SectionHeader
        title="education.md"
        focusPulse={focusPulse}
        subtitleSequence={[
          "Education timeline • clean and readable",
          1200,
          "Strong CS fundamentals + project work",
          1200,
          "CGPA 9.36/10 • Grad 2027",
          1200,
        ]}
      />
      <Timeline items={edu} />
    </div>
  );
}

export function ProjectsSection({
  focusPulse,
  onPeek,
}: {
  focusPulse?: boolean;
  onPeek: (p: PeekProject) => void;
}) {
  const projects: PeekProject[] = [
    {
      title: "GenePredict",
      meta: "Jul 2024 – Aug 2024",
      desc: "Neurological disease risk prediction system with ML pipeline from preprocessing to risk scoring.",
      bullets: ["Data preprocessing + feature extraction notebooks", "Model training and evaluation", "Risk-score output workflow"],
      stack: ["Python", "Jupyter", "Pandas", "Scikit-learn"],
    },
    {
      title: "WorkRex",
      meta: "Jul 2024 – Nov 2025",
      desc: "Flutter app with part-time jobs, forums, community, and study resources concept.",
      bullets: ["Student and business owner flows", "Forum and resources module", "UI-first approach"],
      stack: ["Flutter", "Dart"],
    },
    {
      title: "Automatic Signature Verification System",
      meta: "Feb 2025 – May 2025",
      desc: "Desktop signature verification using ORB feature extraction + matching with a GUI.",
      bullets: ["ORB keypoints + BF matching", "Preprocessing + visual feedback", "ttkbootstrap-style GUI"],
      stack: ["Python", "OpenCV", "ORB"],
    },
    {
      title: "EcoLogic - Garbage Classification Model",
      meta: "Aug 2025 – Nov 2025",
      desc: "Waste classification using transfer learning with ResNet-18 for Organic/Recyclable/Non-Recyclable.",
      bullets: ["Transfer learning + augmentation", "Training and evaluation pipeline", "Inference workflow"],
      stack: ["Python", "PyTorch", "ResNet-18"],
    },
    {
      title: "Patient Healthcare Management System",
      meta: "Feb 2026 – Present",
      desc: "Centralized records + prescription-driven reminders + medicine ordering + caretaker access.",
      bullets: ["Mobile-number access concept", "Reminders and ordering workflow", "Designed for real usage"],
      stack: ["React or Flutter", "Supabase"],
    },
  ];

  const timelineItems = projects.map((p) => ({
    title: `${p.title} (${p.meta ?? ""})`.trim(),
    desc: p.desc,
    onClick: () => onPeek(p),
  }));

  return (
    <div>
      <SectionHeader
        title="projects/"
        focusPulse={focusPulse}
        subtitleSequence={[
          "Click any project to open Peek panel",
          1200,
          "Timeline + micro-interactions",
          1200,
          "Fast navigation via Cmd+K",
          1200,
        ]}
      />
      <Timeline items={timelineItems} clickable />
      <div className="mt-5 text-xs text-[var(--muted)]">Tip: Click a project entry to open details.</div>
    </div>
  );
}

export function SkillsSection({ focusPulse }: { focusPulse?: boolean }) {
  return (
    <div>
      <SectionHeader
        title="skills.ts"
        focusPulse={focusPulse}
        subtitleSequence={[
          "Stack: Languages • Frameworks • Tools",
          1200,
          "Optimized for real-world shipping",
          1200,
          "Frontend + backend + cloud comfort",
          1200,
        ]}
      />

      <motion.div variants={container} initial="hidden" animate="show" className="grid gap-3 md:grid-cols-2">
        <TagCard title="Programming Languages" items={["C/C++", "Java", "HTML", "CSS", "JavaScript", "Python", "Flutter"]} />
        <TagCard title="Tools & Technologies" items={["Android Studio", "Git/GitHub", "Postman", "MySQL", "MongoDB", "Firebase", "Jupyter Notebook"]} />
        <TagCard title="Languages & Frameworks" items={["React.js", "Next.js", "Node.js", "Express.js", "Flask", "Tailwind CSS"]} />
        <TagCard title="Domain Knowledge" items={["AWS core (EC2, S3, IAM)", "Cloud DB basics (RDS/Aurora)"]} />
        <TagCard title="Design Tools" items={["Figma", "Canva"]} />
        <TagCard title="Technical Skills" items={["DSA", "OOP", "DBMS", "Debugging", "SDLC & Agile"]} />
        <TagCard title="Languages" items={["English", "Hindi", "French (Elementary)"]} />
      </motion.div>
    </div>
  );
}

export function CertificationsSection({ focusPulse }: { focusPulse?: boolean }) {
  return (
    <div>
      <SectionHeader
        title="certifications.md"
        focusPulse={focusPulse}
        subtitleSequence={[
          "Certifications that support my work",
          1200,
          "Focus: ML fundamentals + practical learning",
          1200,
          "Can be moved to Supabase later",
          1200,
        ]}
      />
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
        <Card title="Introduction To Machine Learning (NPTEL)" desc="NPTEL - MoE, Govt. of India • NPTEL25CS149S233202327" />
      </motion.div>
    </div>
  );
}

export function VolunteeringSection({ focusPulse }: { focusPulse?: boolean }) {
  return (
    <div>
      <SectionHeader
        title="volunteering.md"
        focusPulse={focusPulse}
        subtitleSequence={[
          "Community work that matters",
          1200,
          "Tutoring • admissions support • engagement",
          1200,
          "Consistent contribution over time",
          1200,
        ]}
      />
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
        <Card
          title="Nanhe Kadam Society, Jaipur — Volunteer"
          desc="Tutoring (Basics of Computing, English, Math), admissions support, fee-support via schemes, nutrition coordination, creative activities, awareness sessions, family engagement."
        />
      </motion.div>
    </div>
  );
}

export function ExtracurricularSection({ focusPulse }: { focusPulse?: boolean }) {
  return (
    <div>
      <SectionHeader
        title="extracurricular.md"
        focusPulse={focusPulse}
        subtitleSequence={[
          "Workshops + club work",
          1200,
          "Node.js • MongoDB • IEEE social media",
          1200,
          "Building + communicating both",
          1200,
        ]}
      />
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
        <Card title="App Archives (Apr 2024) — Cherry+ Network SRM" desc="Node.js and MongoDB workshop focused on social-media style backend features." />
        <Card title="IEEE Student Branch / IEEE CS — Social Media Volunteer" desc="Created posts, supported engagement, and promoted club events." />
      </motion.div>
    </div>
  );
}

export function ContactSection({ focusPulse }: { focusPulse?: boolean }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: "idle" | "ok" | "err"; msg?: string }>({ type: "idle" });

  const canSubmit = useMemo(
    () => name.trim().length >= 2 && email.trim().includes("@") && message.trim().length >= 5,
    [name, email, message]
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
      { name: name.trim(), email: email.trim(), message: message.trim() },
    ]);
    setLoading(false);

    if (error) {
      setStatus({ type: "err", msg: error.message });
      return;
    }

    setStatus({ type: "ok", msg: "Message sent successfully." });
    setName("");
    setEmail("");
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
          "RLS should allow inserts from anon key",
          1200,
          "Let’s build something useful.",
          1200,
        ]}
      />

      <motion.form onSubmit={onSubmit} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.22 }} className="grid gap-3 md:grid-cols-2">
        <Input label="Name" value={name} onChange={setName} />
        <Input label="Email" value={email} onChange={setEmail} />
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
          <div className={["md:col-span-2 text-sm", status.type === "ok" ? "text-green-300" : "text-red-300"].join(" ")}>
            {status.msg}
          </div>
        )}
      </motion.form>
    </div>
  );
}

/* helpers */
function MotionStat({ label, value }: { label: string; value: string }) {
  return (
    <motion.div variants={item} whileHover={{ y: -2 }} transition={{ type: "spring", stiffness: 260, damping: 22 }}>
      <div className="rounded-lg border border-[var(--border)] bg-white/5 p-4">
        <div className="text-xs text-[var(--muted)]">{label}</div>
        <div className="mt-1 text-xl font-semibold">{value}</div>
      </div>
    </motion.div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <motion.div variants={item}>
      <div className="rounded-lg border border-[var(--border)] bg-white/5 p-4">
        <div className="text-xs text-[var(--muted)]">{label}</div>
        <div className="mt-1 text-sm font-semibold">{value}</div>
      </div>
    </motion.div>
  );
}

function Card({ title, desc }: { title: string; desc: string }) {
  return (
    <motion.div variants={item} whileHover={{ y: -2, rotate: 0.15 }} transition={{ type: "spring", stiffness: 300, damping: 22 }}>
      <div className="rounded-lg border border-[var(--border)] bg-white/5 p-4 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity"
          style={{ background: "radial-gradient(600px circle at 40% 10%, var(--accent-2), transparent 60%)" }}
        />
        <div className="relative">
          <div className="text-base font-semibold">{title}</div>
          <div className="mt-2 text-sm text-[var(--muted)] leading-relaxed">{desc}</div>
        </div>
      </div>
    </motion.div>
  );
}

function TagCard({ title, items }: { title: string; items: string[] }) {
  return (
    <motion.div variants={item} whileHover={{ y: -2 }} transition={{ type: "spring", stiffness: 260, damping: 22 }}>
      <div className="rounded-lg border border-[var(--border)] bg-white/5 p-4">
        <div className="text-base font-semibold">{title}</div>
        <motion.div variants={container} initial="hidden" animate="show" className="mt-3 flex flex-wrap gap-2">
          {items.map((t) => (
            <motion.span key={t} variants={item} whileHover={{ y: -1 }} className="rounded-md border border-[var(--border)] bg-black/10 px-2 py-1 text-xs text-[var(--muted)]">
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
    <motion.div variants={container} initial="hidden" animate="show" className="relative pl-6">
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
                <div className="mt-2 text-sm text-[var(--muted)] leading-relaxed">{it.desc}</div>
                {clickable ? (
                  <div className="mt-3 text-xs text-[var(--accent-2)] font-semibold">Open Peek →</div>
                ) : null}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}