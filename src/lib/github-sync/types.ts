export type PortfolioConfig = {
  title: string;
  slug?: string;
  category?: string;
  featured?: boolean;
  status?: string;
  difficulty?: "Beginner" | "Intermediate" | "Advanced" | "Major Project" | string;
  role?: string;
  shortDescription: string;
  longDescription?: string;
  techStack: string[];
  demoUrl?: string;
  imageUrl?: string;
  priority?: number;
  tags?: string[];
  startedAt?: string;
  completedAt?: string;
  screenshots?: string[];
  architectureImage?: string;
  caseStudyPdf?: string;
};

export type GithubRepo = {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  language: string | null;
  pushed_at: string | null;
  updated_at: string | null;
  private: boolean;
};

export type ValidatedPortfolioConfig =
  Required<Pick<PortfolioConfig, "title" | "shortDescription" | "techStack">> &
    Omit<PortfolioConfig, "title" | "shortDescription" | "techStack"> & {
      slug: string;
      category: string;
      featured: boolean;
      status: string;
      difficulty: string;
      role: string;
      longDescription: string;
      demoUrl: string;
      imageUrl: string;
      priority: number;
      tags: string[];
      startedAt: string;
      completedAt: string;
      screenshots: string[];
      architectureImage: string;
      caseStudyPdf: string;
    };

export type SyncProject = {
  github_repo_id: number;
  github_owner: string;
  github_name: string;
  slug: string;
  title: string;
  category: string;
  short_description: string;
  long_description: string;
  readme_summary: string;
  tech_stack: string[];
  tags: string[];
  repo_url: string;
  demo_url: string;
  image_url: string;
  screenshots: string[];
  architecture_image: string;
  case_study_pdf: string;
  featured: boolean;
  status: string;
  difficulty: string;
  role: string;
  priority: number;
  stars: number;
  forks: number;
  open_issues: number;
  language: string | null;
  languages: Record<string, number>;
  started_at: string;
  completed_at: string;
  last_github_update: string | null;
  last_commit_at: string | null;
  synced_at: string;
  updated_at: string;
};

export type RepoValidationResult = {
  repo: string;
  eligible: boolean;
  imported: boolean;
  skipped: boolean;
  reasons: string[];
  project?: SyncProject;
};

export type SyncSummary = {
  owner: string;
  topic: string;
  configFile: string;
  dryRun: boolean;
  scanned: number;
  eligible: number;
  imported: number;
  skipped: number;
  errors: number;
  startedAt: string;
  finishedAt: string;
  results: RepoValidationResult[];
};
