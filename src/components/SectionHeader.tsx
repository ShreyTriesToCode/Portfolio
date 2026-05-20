"use client";

import { TypeAnimation } from "react-type-animation";
import { motion } from "framer-motion";

export default function SectionHeader({
  title,
  subtitleSequence,
  focusPulse,
}: {
  title: string;
  subtitleSequence: (string | number)[];
  focusPulse?: boolean;
}) {
  return (
    <header className="mb-8 sm:mb-10">
      <motion.h1
        initial={{ opacity: 0, y: 10, filter: "blur(2px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.25 }}
        className="section-title"
      >
        {title}
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.06, duration: 0.22 }}
        className="mt-4 max-w-2xl text-[var(--muted)]"
      >
        <TypeAnimation
          sequence={subtitleSequence}
          wrapper="div"
          speed={55}
          repeat={Infinity}
          className="text-sm md:text-base leading-relaxed"
        />
      </motion.div>

      <div className="mt-6 relative">
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.35 }}
          style={{ transformOrigin: "left" }}
          className="h-px w-full bg-gradient-to-r from-[var(--border-strong)] via-[var(--border)] to-transparent"
        />
        <motion.div
          animate={focusPulse ? { opacity: [0, 1, 0] } : { opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute left-0 top-[-1px] h-[3px] w-[min(260px,65vw)] rounded-full"
          style={{
            background: "linear-gradient(90deg, var(--accent-2), transparent)",
          }}
        />
      </div>
    </header>
  );
}
