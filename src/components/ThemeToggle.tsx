"use client";

import React, { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const root = document.documentElement;
    const syncTheme = () => {
      setTheme(root.getAttribute("data-theme") === "light" ? "light" : "dark");
    };

    window.requestAnimationFrame(syncTheme);
    const observer = new MutationObserver(syncTheme);
    observer.observe(root, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("theme", next);
    } catch {
      // Ignore restricted storage modes.
    }
  }

  return (
    <button
      data-theme-toggle
      onClick={toggle}
      className="btn-secondary min-h-9 px-3 text-xs"
      aria-label="Toggle theme"
      aria-pressed={theme === "light"}
      title="Toggle theme"
      suppressHydrationWarning
    >
      {theme === "dark" ? "Dark" : "Light"}
    </button>
  );
}
