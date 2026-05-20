import type { GithubRepo } from "./types";

const GITHUB_API = "https://api.github.com";

export type GithubClientOptions = {
  token?: string;
};

export class GithubClient {
  private token?: string;

  constructor(options: GithubClientOptions = {}) {
    this.token = options.token;
  }

  async listPublicRepos(owner: string) {
    const repos: GithubRepo[] = [];
    for (let page = 1; page <= 10; page += 1) {
      const batch = await this.request<GithubRepo[]>(
        `/users/${encodeURIComponent(owner)}/repos?per_page=100&page=${page}&sort=updated`
      );
      repos.push(...batch);
      if (batch.length < 100) break;
    }
    return repos;
  }

  async getRepo(owner: string, repoName: string) {
    return this.request<GithubRepo>(
      `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repoName)}`
    );
  }

  async getTopics(owner: string, repoName: string) {
    const data = await this.request<{ names: string[] }>(
      `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repoName)}/topics`,
      { accept: "application/vnd.github+json" }
    );
    return data.names ?? [];
  }

  async getRootTextFile(owner: string, repoName: string, path: string) {
    try {
      const data = await this.request<{ content?: string; encoding?: string }>(
        `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repoName)}/contents/${encodeURIComponent(path)}`
      );
      if (!data.content) return null;
      if (data.encoding === "base64") {
        return Buffer.from(data.content.replace(/\n/g, ""), "base64").toString("utf8");
      }
      return data.content;
    } catch (error) {
      if (error instanceof GithubHttpError && error.status === 404) return null;
      throw error;
    }
  }

  async getReadme(owner: string, repoName: string) {
    try {
      const data = await this.request<{ content?: string; encoding?: string }>(
        `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repoName)}/readme`
      );
      if (!data.content) return "";
      return Buffer.from(data.content.replace(/\n/g, ""), data.encoding === "base64" ? "base64" : "utf8").toString("utf8");
    } catch (error) {
      if (error instanceof GithubHttpError && error.status === 404) return "";
      throw error;
    }
  }

  async getLanguages(owner: string, repoName: string) {
    try {
      return await this.request<Record<string, number>>(
        `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repoName)}/languages`
      );
    } catch {
      return {};
    }
  }

  private async request<T>(path: string, options: { accept?: string } = {}) {
    const response = await fetch(`${GITHUB_API}${path}`, {
      headers: {
        Accept: options.accept ?? "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
      },
    });

    if (!response.ok) {
      throw new GithubHttpError(response.status, `${response.status} ${response.statusText}: ${await response.text()}`);
    }

    return (await response.json()) as T;
  }
}

export class GithubHttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "GithubHttpError";
    this.status = status;
  }
}
