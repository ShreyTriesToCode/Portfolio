"use client";

import React from "react";
import { TypeAnimation } from "react-type-animation";
import { motion } from "framer-motion";

export default function SectionHeader({
  title,
  subtitleSequence,
}: {
  title: string;
  subtitleSequence: (string | number)[];
}) {
  return (
    <div className="mb-6">
      <motion.h1
        initial={{ opacity: 0, y: 10, filter: "blur(2px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.25 }}
        className="text-4xl font-bold tracking-tight"
      >
        {title}
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05, duration: 0.22 }}
        className="mt-3 text-[var(--muted)]"
      >
        <TypeAnimation
          sequence={subtitleSequence}
          wrapper="div"
          speed={55}
          repeat={Infinity}
          className="text-sm md:text-base leading-relaxed"
        />
      </motion.div>

      {/* Focus line */}
      <motion.div
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.35 }}
        style={{ transformOrigin: "left" }}
        className="mt-4 h-px w-full bg-[var(--border)]"
      />
    </div>
  );
}