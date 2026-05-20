import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Shreyansh Singhal | Portfolio",
    template: "%s | Shreyansh Singhal",
  },
  description:
    "VS Code themed portfolio of Shreyansh Singhal. Full Stack, App Development, and ML projects with Supabase backend.",
  keywords: [
    "Shreyansh Singhal",
    "Portfolio",
    "Next.js",
    "Supabase",
    "Full Stack",
    "Flutter",
    "Machine Learning",
  ],
  metadataBase: new URL("https://portfolio.shreybuilds.com"),
  openGraph: {
    title: "Shreyansh Singhal | Portfolio",
    description:
      "VS Code themed portfolio. Full Stack, App Development, and ML projects.",
    type: "website",
    url: "https://portfolio.shreybuilds.com",
  },
  twitter: {
    card: "summary_large_image",
    title: "Shreyansh Singhal | Portfolio",
    description:
      "VS Code themed portfolio. Full Stack, App Development, and ML projects.",
  },
  icons: {
    icon: "/portfolio-icon.svg",
    shortcut: "/portfolio-icon.svg",
    apple: "/portfolio-icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const themeInitScript = `
    try {
      var savedTheme = window.localStorage.getItem("theme");
      document.documentElement.setAttribute("data-theme", savedTheme === "light" ? "light" : "dark");
    } catch (_) {
      document.documentElement.setAttribute("data-theme", "dark");
    }
  `;

  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
