"use client";

import { motion } from "framer-motion";

export default function BackgroundFX({ accent }: { accent: string }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* animated grid */}
      <motion.div
        aria-hidden
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)",
          backgroundSize: "42px 42px",
        }}
        animate={{ backgroundPositionX: [0, 240], backgroundPositionY: [0, 180] }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
      />

      {/* accent aura */}
      <motion.div
        aria-hidden
        className="absolute -inset-[30%] blur-3xl opacity-[0.22]"
        style={{
          background: `radial-gradient(closest-side, ${accent}, transparent 70%)`,
        }}
        animate={{ scale: [1, 1.04, 1] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* vignette */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(1000px circle at 50% 25%, transparent 0%, rgba(0,0,0,0.35) 70%, rgba(0,0,0,0.55) 100%)",
        }}
      />

      {/* noise (inline svg, no external URL) */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.06] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23n)' opacity='.35'/%3E%3C/svg%3E\")",
          backgroundSize: "180px 180px",
        }}
      />
    </div>
  );
}