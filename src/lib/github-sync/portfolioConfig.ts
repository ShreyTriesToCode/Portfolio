import type { PortfolioConfig, ValidatedPortfolioConfig } from "./types";

export function parsePortfolioConfig(raw: string) {
  try {
    return { config: JSON.parse(raw) as PortfolioConfig, error: null };
  } catch (error) {
    return {
      config: null,
      error: error instanceof Error ? error.message : "Invalid JSON",
    };
  }
}

export function validatePortfolioConfig(
  config: PortfolioConfig | null,
  fallbackRepoName: string
): { config: ValidatedPortfolioConfig | null; reasons: string[] } {
  const reasons: string[] = [];
  if (!config || typeof config !== "object") {
    return { config: null, reasons: ["Missing or invalid .portfolio.json object"] };
  }

  if (!isNonEmptyString(config.title)) reasons.push("Missing required field: title");
  if (!isNonEmptyString(config.shortDescription)) reasons.push("Missing required field: shortDescription");
  if (!Array.isArray(config.techStack) || config.techStack.length === 0) {
    reasons.push("Missing required field: techStack");
  }

  if (reasons.length) return { config: null, reasons };

  const title = config.title.trim();
  const generatedSlug = slugify(config.slug || title || fallbackRepoName);

  return {
    reasons: [],
    config: {
      title,
      slug: generatedSlug || slugify(fallbackRepoName),
      category: safeString(config.category, "General"),
      featured: Boolean(config.featured),
      status: safeString(config.status, "Active"),
      difficulty: safeString(config.difficulty, ""),
      role: safeString(config.role, ""),
      shortDescription: config.shortDescription.trim(),
      longDescription: safeString(config.longDescription, ""),
      techStack: config.techStack.filter(isNonEmptyString).map((item) => item.trim()),
      demoUrl: safeString(config.demoUrl, ""),
      imageUrl: safeString(config.imageUrl, ""),
      priority: typeof config.priority === "number" ? config.priority : 99,
      tags: Array.isArray(config.tags) ? config.tags.filter(isNonEmptyString).map((item) => item.trim()) : [],
      startedAt: safeString(config.startedAt, ""),
      completedAt: safeString(config.completedAt, ""),
      screenshots: Array.isArray(config.screenshots)
        ? config.screenshots.filter(isNonEmptyString).map((item) => item.trim())
        : [],
      architectureImage: safeString(config.architectureImage, ""),
      caseStudyPdf: safeString(config.caseStudyPdf, ""),
    },
  };
}

export function portfolioJsonTemplate(repoName: string, title?: string) {
  return {
    title: title || repoName,
    slug: slugify(title || repoName),
    category: "Web App",
    featured: false,
    status: "Active",
    difficulty: "Intermediate",
    role: "Full Stack Developer",
    shortDescription: "A concise one-line summary of what this project does.",
    longDescription: "A longer explanation of the problem, solution, and your role.",
    techStack: ["React", "TypeScript", "Tailwind CSS", "Supabase"],
    demoUrl: "",
    imageUrl: "",
    priority: 99,
    tags: ["web", "portfolio"],
    startedAt: "2026-01",
    completedAt: "",
    screenshots: [],
    architectureImage: "",
    caseStudyPdf: "",
  };
}

function safeString(value: unknown, fallback: string) {
  return typeof value === "string" ? value.trim() : fallback;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
}
