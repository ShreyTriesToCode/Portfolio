import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { syncGithubProjects } from "../src/lib/github-sync/syncProjects";

loadLocalEnv();

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const summary = await syncGithubProjects({ dryRun });

  console.log("GitHub Portfolio Sync");
  console.log(`Owner: ${summary.owner}`);
  console.log(`Topic filter: ${summary.topic}`);
  console.log(`Config file: ${summary.configFile}`);
  if (summary.dryRun) console.log("Mode: dry run");
  console.log("");
  console.log(`Scanned: ${summary.scanned}`);
  console.log(`Eligible: ${summary.eligible}`);
  console.log(`Imported/Updated: ${summary.imported}`);
  console.log(`Skipped: ${summary.skipped}`);
  console.log(`Errors: ${summary.errors}`);

  const notable = summary.results.filter((result) => result.reasons.length > 0);
  if (notable.length) {
    console.log("");
    console.log("Repo notes:");
    for (const result of notable) {
      console.log(`- ${result.repo}: ${result.reasons.join("; ")}`);
    }
  }

  if (summary.errors > 0 && summary.imported === 0 && summary.eligible > 0 && !summary.dryRun) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});

function loadLocalEnv() {
  for (const file of [".env.local", ".env"]) {
    const fullPath = resolve(process.cwd(), file);
    if (!existsSync(fullPath)) continue;
    const contents = readFileSync(fullPath, "utf8");
    for (const line of contents.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      const rawValue = trimmed.slice(eq + 1).trim();
      if (!key || process.env[key]) continue;
      process.env[key] = rawValue.replace(/^['"]|['"]$/g, "");
    }
  }
}
