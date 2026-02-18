import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
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
  metadataBase: new URL("https:mydomain.com"),
  openGraph: {
    title: "Shreyansh Singhal | Portfolio",
    description:
      "VS Code themed portfolio. Full Stack, App Development, and ML projects.",
    type: "website",
    url: "https://mydomain.com",
  },
  twitter: {
    card: "summary_large_image",
    title: "Shreyansh Singhal | Portfolio",
    description:
      "VS Code themed portfolio. Full Stack, App Development, and ML projects.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}