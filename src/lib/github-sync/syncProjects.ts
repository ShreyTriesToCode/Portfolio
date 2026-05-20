import { GithubClient } from "./github";
import { parsePortfolioConfig, validatePortfolioConfig } from "./portfolioConfig";
import { extractReadmeSummary } from "./readme";
import { createSupabaseAdminClient } from "./supabaseAdmin";
import type { GithubRepo, RepoValidationResult, SyncProject, SyncSummary } from "./types";

export type SyncOptions = {
  dryRun?: boolean;
  owner?: string;
  topic?: string;
  configFile?: string;
  repoNames?: string[];
};

function githubSyncEnv() {
  return {
    token: process.env.PORTFOLIO_GH_TOKEN || process.env.GITHUB_TOKEN,
    owner: process.env.PORTFOLIO_GITHUB_OWNER || process.env.GITHUB_OWNER || "ShreyTriesToCode",
    topic: process.env.PORTFOLIO_TOPIC || process.env.GITHUB_PORTFOLIO_TOPIC || "portfolio",
    configFile: process.env.PORTFOLIO_CONFIG_FILE || process.env.GITHUB_PORTFOLIO_CONFIG_FILE || ".portfolio.json",
  };
}

export async function syncGithubProjects(options: SyncOptions = {}): Promise<SyncSummary> {
  const env = githubSyncEnv();
  const owner = options.owner || env.owner;
  const topic = options.topic || env.topic;
  const configFile = options.configFile || env.configFile;
  const dryRun = Boolean(options.dryRun);
  const startedAt = new Date().toISOString();
  const github = new GithubClient({ token: env.token });
  const results: RepoValidationResult[] = [];

  let repos: GithubRepo[];
  if (options.repoNames?.length) {
    repos = [];
    for (const repoName of options.repoNames) {
      try {
        repos.push(await github.getRepo(owner, repoName));
      } catch (error) {
        results.push({
          repo: repoName,
          eligible: false,
          imported: false,
          skipped: true,
          reasons: [errorMessage(error)],
        });
      }
    }
  } else {
    repos = await github.listPublicRepos(owner);
  }

  for (const repo of repos) {
    const result = await inspectRepo({ github, owner, topic, configFile, repo });
    results.push(result);
  }

  const eligibleProjects = results.filter((result) => result.eligible && result.project).map((result) => result.project!);
  let imported = 0;
  let fatalWriteError = "";

  if (!dryRun && eligibleProjects.length > 0) {
    try {
      const supabase = createSupabaseAdminClient();
      const { error } = await supabase.from("projects").upsert(eligibleProjects, {
        onConflict: "github_repo_id",
      });
      if (error) throw error;
      imported = eligibleProjects.length;
      for (const result of results) {
        if (result.project) result.imported = true;
      }
    } catch (error) {
      fatalWriteError = errorMessage(error);
      for (const result of results) {
        if (result.project) result.reasons.push(`Supabase upsert failed: ${fatalWriteError}`);
      }
    }
  } else if (dryRun) {
    imported = eligibleProjects.length;
  }

  const summary: SyncSummary = {
    owner,
    topic,
    configFile,
    dryRun,
    scanned: repos.length,
    eligible: eligibleProjects.length,
    imported,
    skipped: results.filter((result) => result.skipped).length,
    errors: results.filter((result) => result.reasons.some((reason) => /failed|error/i.test(reason))).length + (fatalWriteError ? 1 : 0),
    startedAt,
    finishedAt: new Date().toISOString(),
    results,
  };

  if (!dryRun) await writeSyncLog(summary, fatalWriteError);

  return summary;
}

export async function validatePortfolioRepo(repoName: string) {
  const env = githubSyncEnv();
  const owner = env.owner;
  const topic = env.topic;
  const configFile = env.configFile;
  const github = new GithubClient({ token: env.token });
  const repo = await github.getRepo(owner, repoName);
  return inspectRepo({ github, owner, topic, configFile, repo });
}

async function inspectRepo({
  github,
  owner,
  topic,
  configFile,
  repo,
}: {
  github: GithubClient;
  owner: string;
  topic: string;
  configFile: string;
  repo: GithubRepo;
}): Promise<RepoValidationResult> {
  const reasons: string[] = [];

  try {
    const topics = await github.getTopics(owner, repo.name);
    if (!topics.includes(topic)) {
      return skipped(repo.name, [`Missing GitHub topic: ${topic}`]);
    }

    const rawConfig = await github.getRootTextFile(owner, repo.name, configFile);
    if (!rawConfig) {
      return skipped(repo.name, [`Missing root file: ${configFile}`]);
    }

    const parsed = parsePortfolioConfig(rawConfig);
    if (parsed.error) return skipped(repo.name, [`Invalid ${configFile}: ${parsed.error}`]);

    const validation = validatePortfolioConfig(parsed.config, repo.name);
    if (!validation.config) return skipped(repo.name, validation.reasons);

    let readmeSummary = "";
    try {
      const readme = await github.getReadme(owner, repo.name);
      readmeSummary = readme ? extractReadmeSummary(readme) : "";
    } catch (error) {
      reasons.push(`README unavailable: ${errorMessage(error)}`);
    }

    const languages = await github.getLanguages(owner, repo.name);
    const config = validation.config;
    const now = new Date().toISOString();
    const project: SyncProject = {
      github_repo_id: repo.id,
      github_owner: owner,
      github_name: repo.name,
      slug: config.slug,
      title: config.title,
      category: config.category,
      short_description: config.shortDescription,
      long_description: config.longDescription,
      readme_summary: readmeSummary,
      tech_stack: config.techStack,
      tags: config.tags,
      repo_url: repo.html_url,
      demo_url: config.demoUrl,
      image_url: config.imageUrl,
      screenshots: config.screenshots,
      architecture_image: config.architectureImage,
      case_study_pdf: config.caseStudyPdf,
      featured: config.featured,
      status: config.status,
      difficulty: config.difficulty,
      role: config.role,
      priority: config.priority,
      stars: repo.stargazers_count ?? 0,
      forks: repo.forks_count ?? 0,
      open_issues: repo.open_issues_count ?? 0,
      language: repo.language,
      languages,
      started_at: config.startedAt,
      completed_at: config.completedAt,
      last_github_update: repo.updated_at,
      last_commit_at: repo.pushed_at,
      synced_at: now,
      updated_at: now,
    };

    return {
      repo: repo.name,
      eligible: true,
      imported: false,
      skipped: false,
      reasons,
      project,
    };
  } catch (error) {
    return skipped(repo.name, [`Repo scan failed: ${errorMessage(error)}`]);
  }
}

async function writeSyncLog(summary: SyncSummary, errorMessageValue: string) {
  try {
    const supabase = createSupabaseAdminClient();
    await supabase.from("github_project_sync_logs").insert({
      started_at: summary.startedAt,
      finished_at: summary.finishedAt,
      status: errorMessageValue ? "failed" : "synced",
      repos_scanned: summary.scanned,
      repos_eligible: summary.eligible,
      repos_imported: summary.imported,
      repos_skipped: summary.skipped,
      error_message: errorMessageValue || null,
      details: {
        dryRun: summary.dryRun,
        results: summary.results.map((result) => ({
          repo: result.repo,
          eligible: result.eligible,
          imported: result.imported,
          skipped: result.skipped,
          reasons: result.reasons,
        })),
      },
    });
  } catch (error) {
    console.error("Could not write github_project_sync_logs row:", errorMessage(error));
  }
}

function skipped(repo: string, reasons: string[]): RepoValidationResult {
  return {
    repo,
    eligible: false,
    imported: false,
    skipped: true,
    reasons,
  };
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}
