export type PortfolioProject = {
  id: string;
  github_repo_id?: number | null;
  github_owner?: string | null;
  github_name?: string | null;
  slug: string;
  title: string;
  category?: string | null;
  short_description: string;
  long_description?: string | null;
  readme_summary?: string | null;
  tech_stack: string[];
  tags: string[];
  repo_url?: string | null;
  demo_url?: string | null;
  image_url?: string | null;
  screenshots: string[];
  architecture_image?: string | null;
  case_study_pdf?: string | null;
  featured: boolean;
  status?: string | null;
  difficulty?: string | null;
  role?: string | null;
  priority: number;
  stars: number;
  forks: number;
  open_issues: number;
  language?: string | null;
  languages: Record<string, number>;
  started_at?: string | null;
  completed_at?: string | null;
  last_github_update?: string | null;
  last_commit_at?: string | null;
  synced_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type GithubSyncStatus = {
  status: "synced" | "pending" | "failed";
  started_at?: string | null;
  finished_at?: string | null;
  repos_scanned?: number | null;
  repos_imported?: number | null;
  repos_skipped?: number | null;
  error_message?: string | null;
};

type AnyRow = Record<string, unknown>;

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
}

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function asNumber(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    .map((item) => item.trim())
    .filter((item, index, array) => array.findIndex((candidate) => candidate.toLowerCase() === item.toLowerCase()) === index);
}

function asRecord(value: unknown): Record<string, number> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as Record<string, number>;
}

export function normalizeProject(row: AnyRow): PortfolioProject {
  const title = asString(row.title) ?? "Untitled Project";
  const legacyDescription = asString(row.description);
  const shortDescription = asString(row.short_description) ?? legacyDescription ?? "";
  const repoUrl = safeProjectUrl(asString(row.repo_url) ?? asString(row.github_url));
  const demoUrl = safeProjectUrl(asString(row.demo_url) ?? asString(row.live_url));
  const stack = asStringArray(row.tech_stack).length
    ? asStringArray(row.tech_stack)
    : asStringArray(row.stack);
  const slug = asString(row.slug) ?? slugify(title) ?? slugify(asString(row.github_name) ?? title);

  return {
    id: String(row.id ?? slug ?? title),
    github_repo_id: asNumber(row.github_repo_id, 0) || null,
    github_owner: asString(row.github_owner),
    github_name: asString(row.github_name),
    slug: slug || "project",
    title,
    category: asString(row.category),
    short_description: shortDescription,
    long_description: asString(row.long_description) ?? legacyDescription,
    readme_summary: asString(row.readme_summary),
    tech_stack: stack,
    tags: asStringArray(row.tags),
    repo_url: repoUrl,
    demo_url: demoUrl,
    image_url: safeProjectAsset(asString(row.image_url)),
    screenshots: asStringArray(row.screenshots)
      .map(safeProjectAsset)
      .filter((value): value is string => Boolean(value)),
    architecture_image: safeProjectAsset(asString(row.architecture_image)),
    case_study_pdf: safeProjectAsset(asString(row.case_study_pdf)),
    featured: Boolean(row.featured),
    status: asString(row.status) ?? "Active",
    difficulty: asString(row.difficulty),
    role: asString(row.role),
    priority: asNumber(row.priority, asNumber(row.sort_order, 99)),
    stars: asNumber(row.stars),
    forks: asNumber(row.forks),
    open_issues: asNumber(row.open_issues),
    language: asString(row.language),
    languages: asRecord(row.languages),
    started_at: asString(row.started_at) ?? asString(row.timeframe),
    completed_at: asString(row.completed_at),
    last_github_update: asString(row.last_github_update),
    last_commit_at: asString(row.last_commit_at),
    synced_at: asString(row.synced_at),
    created_at: asString(row.created_at),
    updated_at: asString(row.updated_at),
  };
}

export function sortProjects(projects: PortfolioProject[], mode = "featured") {
  const copy = [...projects];
  return copy.sort((a, b) => {
    if (mode === "latest") {
      return dateValue(b.last_github_update ?? b.last_commit_at ?? b.updated_at) - dateValue(a.last_github_update ?? a.last_commit_at ?? a.updated_at);
    }
    if (mode === "priority") return a.priority - b.priority || a.title.localeCompare(b.title);
    if (mode === "az") return a.title.localeCompare(b.title);
    return Number(b.featured) - Number(a.featured) || a.priority - b.priority || dateValue(b.last_github_update) - dateValue(a.last_github_update);
  });
}

export function projectMatches(project: PortfolioProject, query: string) {
  const q = normalizeSearch(query);
  if (!q) return true;
  const haystack = [
    project.title,
    project.short_description,
    project.long_description,
    project.readme_summary,
    project.category,
    project.status,
    project.difficulty,
    project.role,
    ...project.tech_stack,
    ...project.tags,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .replace(/\s+/g, " ");
  return haystack.includes(q);
}

export function projectMatchesFilter(project: PortfolioProject, filter: string) {
  if (filter === "All") return true;
  if (filter === "Featured") return project.featured;
  const needle = normalizeSearch(filter);
  return [
    project.category,
    project.status,
    project.difficulty,
    project.role,
    ...project.tags,
    ...project.tech_stack,
  ]
    .filter(Boolean)
    .some((value) => normalizeSearch(String(value)).includes(needle));
}

export function formatDate(value?: string | null) {
  if (!value) return "Not set";
  if (/^\d{4}-\d{2}$/.test(value)) {
    const [year, month] = value.split("-");
    return new Intl.DateTimeFormat("en", { month: "short", year: "numeric" }).format(
      new Date(Number(year), Number(month) - 1, 1)
    );
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(date);
}

export function projectTimeline(project: PortfolioProject) {
  return [
    { label: "Started", value: formatDate(project.started_at) },
    { label: project.completed_at ? "Completed" : "Status", value: project.completed_at ? formatDate(project.completed_at) : project.status ?? "Active" },
    { label: "GitHub update", value: formatDate(project.last_github_update ?? project.last_commit_at) },
    { label: "Last synced", value: formatDate(project.synced_at) },
  ];
}

export function difficultyTone(difficulty?: string | null) {
  const value = difficulty?.toLowerCase() ?? "";
  if (value.includes("major")) return "difficulty-badge-major";
  if (value.includes("advanced")) return "difficulty-badge-advanced";
  if (value.includes("intermediate")) return "difficulty-badge-intermediate";
  if (value.includes("beginner")) return "difficulty-badge-beginner";
  return "difficulty-badge-neutral";
}

function dateValue(value?: string | null) {
  if (!value) return 0;
  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
}

function normalizeSearch(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function safeProjectUrl(value?: string | null) {
  if (!value) return null;
  try {
    const parsed = new URL(value);
    return ["http:", "https:"].includes(parsed.protocol) ? parsed.toString() : null;
  } catch {
    return null;
  }
}

function safeProjectAsset(value?: string | null) {
  if (!value) return null;
  if (value.startsWith("/")) return value;
  return safeProjectUrl(value);
}
