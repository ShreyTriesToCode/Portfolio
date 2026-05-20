"use client";

import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";

export default function BackgroundFX({ accent }: { accent: string }) {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const root = document.documentElement;

    function sync() {
      const t = (root.getAttribute("data-theme") as "dark" | "light") || "dark";
      setTheme(t);
    }

    sync();
    const obs = new MutationObserver(sync);
    obs.observe(root, { attributes: true, attributeFilter: ["data-theme"] });
    return () => obs.disconnect();
  }, []);

  // Theme-aware styling
  const gridColor =
    theme === "dark" ? "rgba(186,230,232,0.055)" : "rgba(16,35,38,0.08)";

  const auraOpacity = theme === "dark" ? 0.24 : 0.14;

  // Light theme vignette must be subtle (not black fog)
  const vignette =
    theme === "dark"
      ? "radial-gradient(1100px circle at 50% 22%, transparent 0%, rgba(0,0,0,0.30) 70%, rgba(0,0,0,0.54) 100%)"
      : "radial-gradient(1100px circle at 50% 22%, rgba(0,0,0,0.00) 0%, rgba(16,35,38,0.05) 70%, rgba(16,35,38,0.11) 100%)";

  // Noise should be much lighter in light mode
  const noiseOpacity = theme === "dark" ? 0.06 : 0.035;
  const noiseBlend: React.CSSProperties["mixBlendMode"] =
    theme === "dark" ? "overlay" : "multiply";

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* animated grid */}
      <motion.div
        aria-hidden
        className="absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(to right, ${gridColor} 1px, transparent 1px),
                            linear-gradient(to bottom, ${gridColor} 1px, transparent 1px)`,
          backgroundSize: "42px 42px",
        }}
        animate={{
          backgroundPositionX: [0, 240],
          backgroundPositionY: [0, 180],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
      />

      {/* accent aura */}
      <motion.div
        aria-hidden
        className="absolute -inset-[30%] blur-3xl"
        style={{
          opacity: auraOpacity,
          background: `radial-gradient(closest-side, ${accent}, transparent 70%)`,
        }}
        animate={{ scale: [1, 1.045, 1] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* vignette (theme aware) */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{ background: vignette }}
      />

      {/* noise (inline svg) */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          opacity: noiseOpacity,
          mixBlendMode: noiseBlend,
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23n)' opacity='.35'/%3E%3C/svg%3E\")",
          backgroundSize: "180px 180px",
        }}
      />
    </div>
  );
}
