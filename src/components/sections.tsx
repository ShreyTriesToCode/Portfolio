"use client";

import React, { useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { motion } from "framer-motion";
import SectionHeader from "@/components/SectionHeader";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } },
};

const item = {
  hidden: { opacity: 0, y: 10, filter: "blur(2px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.22 } },
};

export function SummarySection() {
  return (
    <div>
      <SectionHeader
        title="summary.md"
        subtitleSequence={[
          "Full Stack + Cloud + ML Projects",
          1200,
          "Next.js + Supabase • VS Code portfolio",
          1200,
          "Building products, not just projects.",
          1200,
        ]}
      />

      <motion.div variants={container} initial="hidden" animate="show" className="grid gap-3 md:grid-cols-3">
        <MotionStat label="CGPA" value="9.36/10" />
        <MotionStat label="Graduation" value="2027" />
        <MotionStat label="Working Status" value="Freelancer" />
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="mt-6 text-[var(--muted)] leading-relaxed"
      >
        Use <span className="text-[var(--accent)] font-semibold">Cmd+K</span> to jump between sections fast.
      </motion.p>
    </div>
  );
}

export function AboutSection() {
  return (
    <div>
      <SectionHeader
        title="about.json"
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

        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.25 }}
          className="w-full lg:w-[280px]"
        >
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
          Interested in <span className="text-[var(--accent)] font-semibold">full stack engineering</span>,{" "}
          <span className="text-[var(--accent)] font-semibold">cloud workflows</span>, and{" "}
          <span className="text-[var(--accent)] font-semibold">ML-driven products</span>.
        </motion.div>
      </motion.div>
    </div>
  );
}

export function EducationSection() {
  return (
    <div>
      <SectionHeader
        title="education.md"
        subtitleSequence={[
          "SRM IST (KTR) • B.Tech CSE • 2027",
          1200,
          "CGPA 9.36/10",
          1200,
          "Strong CS fundamentals + project work",
          1200,
        ]}
      />

      <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
        <Card title="SRM IST - Kattankulathur (2027)" desc="B.Tech, Computer Science and Engineering — CGPA 9.36/10" />
        <Card
          title="Swarajaya Senior Secondary School (2023)"
          desc="Class XII — Northwest Accreditation Commission, USA — 80.6%"
        />
        <Card title="St Anselm’s Pink City School, Jaipur (2021)" desc="Class X — CBSE — 82.8%" />
      </motion.div>
    </div>
  );
}

export function ProjectsSection() {
  return (
    <div>
      <SectionHeader
        title="projects/"
        subtitleSequence={[
          "Highlight reel: real builds, not placeholders",
          1200,
          "ML pipelines • Flutter apps • Computer vision",
          1200,
          "Case-study tabs can be next",
          1200,
        ]}
      />

      <motion.div variants={container} initial="hidden" animate="show" className="grid gap-4 md:grid-cols-2">
        <Card
          title="GenePredict (Jul 2024 – Aug 2024)"
          desc="Neurological disease risk prediction. Preprocessing → feature extraction → model training → risk score."
        />
        <Card
          title="WorkRex (Jul 2024 – Nov 2025)"
          desc="Flutter app: part-time jobs, forums, student community, and resource sharing."
        />
        <Card
          title="Automatic Signature Verification System (Feb 2025 – May 2025)"
          desc="Python + OpenCV desktop app using ORB feature extraction and matching with GUI."
        />
        <Card
          title="EcoLogic - Garbage Classification Model (Aug 2025 – Nov 2025)"
          desc="ResNet-18 transfer learning pipeline for waste classification with augmentation and evaluation."
        />
        <Card
          title="Patient Healthcare Management System (Feb 2026 – Present)"
          desc="Centralized records + prescription reminders + medicine ordering + caretaker access."
        />
      </motion.div>
    </div>
  );
}

export function SkillsSection() {
  return (
    <div>
      <SectionHeader
        title="skills.ts"
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
        <TagCard
          title="Tools & Technologies"
          items={["Android Studio", "Git/GitHub", "Postman", "MySQL", "MongoDB", "Firebase", "Jupyter Notebook"]}
        />
        <TagCard
          title="Languages & Frameworks"
          items={["React.js", "Next.js", "Node.js", "Express.js", "Flask", "Tailwind CSS"]}
        />
        <TagCard title="Domain Knowledge" items={["AWS core (EC2, S3, IAM)", "Cloud DB basics (RDS/Aurora)"]} />
        <TagCard title="Design Tools" items={["Figma", "Canva"]} />
        <TagCard title="Technical Skills" items={["DSA", "OOP", "DBMS", "Debugging", "SDLC & Agile"]} />
        <TagCard title="Languages" items={["English", "Hindi", "French (Elementary)"]} />
      </motion.div>
    </div>
  );
}

export function CertificationsSection() {
  return (
    <div>
      <SectionHeader
        title="certifications.md"
        subtitleSequence={[
          "Certifications that support my work",
          1200,
          "More incoming!",
          1200,
        ]}
      />
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
        <Card title="Introduction To Machine Learning (NPTEL)" desc="NPTEL - MoE, Govt. of India • NPTEL25CS149S233202327" />
      </motion.div>
    </div>
  );
}

export function VolunteeringSection() {
  return (
    <div>
      <SectionHeader
        title="volunteering.md"
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

export function ExtracurricularSection() {
  return (
    <div>
      <SectionHeader
        title="extracurricular.md"
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
        <Card
          title="App Archives (Apr 2024) — Cherry+ Network SRM"
          desc="Built social-media style backend (profiles, posts, likes) using Node.js and MongoDB. Practiced CRUD APIs."
        />
        <Card
          title="IEEE Student Branch / IEEE Computer Society — Social Media Volunteer"
          desc="Created posts and announcements, supported engagement for club events."
        />
      </motion.div>
    </div>
  );
}

export function ContactSection() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: "idle" | "ok" | "err"; msg?: string }>({ type: "idle" });

  const canSubmit = useMemo(() => name.trim().length >= 2 && email.trim().includes("@") && message.trim().length >= 5, [
    name,
    email,
    message,
  ]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus({ type: "idle" });

    if (!canSubmit) {
      setStatus({ type: "err", msg: "Please fill all fields correctly." });
      return;
    }

    setLoading(true);
    const { error } = await supabase.from("contact_messages").insert([{ name: name.trim(), email: email.trim(), message: message.trim() }]);
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
        subtitleSequence={[
          "Drop a message. It goes straight into my Database.",
          1000,
          "Fast replies when I am free.",
          1000,
          "Let’s build something useful.",
          1000,
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

/* UI helpers */
function MotionStat({ label, value }: { label: string; value: string }) {
  return (
    <motion.div variants={item}>
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
      <div className="rounded-lg border border-[var(--border)] bg-white/5 p-4">
        <div className="text-base font-semibold">{title}</div>
        <div className="mt-2 text-sm text-[var(--muted)] leading-relaxed">{desc}</div>
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
          className="h-28 resize-none rounded-md border border-[var(--border)] bg-black/20 px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 rounded-md border border-[var(--border)] bg-black/20 px-3 text-sm outline-none focus:border-[var(--accent)]"
        />
      )}
    </label>
  );
}