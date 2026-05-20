import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createInterface } from "node:readline";
import { portfolioJsonTemplate } from "../src/lib/github-sync/portfolioConfig";
import { createSupabaseAdminClient } from "../src/lib/github-sync/supabaseAdmin";
import { syncGithubProjects, validatePortfolioRepo } from "../src/lib/github-sync/syncProjects";

loadLocalEnv();

type JsonRpcRequest = {
  jsonrpc: "2.0";
  id?: string | number;
  method: string;
  params?: Record<string, unknown>;
};

const tools = [
  {
    name: "sync_github_projects",
    description: "Sync eligible GitHub repositories into Supabase projects. Supports dryRun.",
    inputSchema: {
      type: "object",
      properties: { dryRun: { type: "boolean", default: true } },
    },
  },
  {
    name: "list_portfolio_projects",
    description: "List portfolio projects from Supabase.",
    inputSchema: {
      type: "object",
      properties: { featuredOnly: { type: "boolean", default: false } },
    },
  },
  {
    name: "validate_portfolio_repo",
    description: "Validate one GitHub repository for portfolio sync eligibility.",
    inputSchema: {
      type: "object",
      required: ["repoName"],
      properties: { repoName: { type: "string" } },
    },
  },
  {
    name: "generate_portfolio_json_template",
    description: "Generate a ready-to-copy .portfolio.json template.",
    inputSchema: {
      type: "object",
      required: ["repoName"],
      properties: { repoName: { type: "string" }, title: { type: "string" } },
    },
  },
  {
    name: "get_sync_status",
    description: "Return the latest GitHub project sync log from Supabase.",
    inputSchema: { type: "object", properties: {} },
  },
];

const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: false });
rl.on("line", async (line) => {
  if (!line.trim()) return;
  const request = JSON.parse(line) as JsonRpcRequest;
  try {
    if (request.method === "initialize") {
      respond(request.id, {
        protocolVersion: "2024-11-05",
        capabilities: { tools: {} },
        serverInfo: { name: "portfolio-mcp", version: "0.1.0" },
      });
      return;
    }
    if (request.method === "tools/list") {
      respond(request.id, { tools });
      return;
    }
    if (request.method === "tools/call") {
      const params = request.params ?? {};
      const name = String(params.name);
      const args = (params.arguments ?? {}) as Record<string, unknown>;
      const result = await callTool(name, args);
      respond(request.id, {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      });
      return;
    }
    if (request.id !== undefined) respond(request.id, {});
  } catch (error) {
    respondError(request.id, error instanceof Error ? error.message : String(error));
  }
});

async function callTool(name: string, args: Record<string, unknown>) {
  if (name === "sync_github_projects") {
    return syncGithubProjects({ dryRun: args.dryRun !== false });
  }

  if (name === "list_portfolio_projects") {
    const supabase = createSupabaseAdminClient();
    let query = supabase
      .from("projects")
      .select("title,slug,repo_url,demo_url,category,tech_stack,featured,status,difficulty,role,synced_at")
      .order("featured", { ascending: false })
      .order("priority", { ascending: true });
    if (args.featuredOnly) query = query.eq("featured", true);
    const { data, error } = await query;
    if (error) throw error;
    return data ?? [];
  }

  if (name === "validate_portfolio_repo") {
    return validatePortfolioRepo(String(args.repoName ?? ""));
  }

  if (name === "generate_portfolio_json_template") {
    return portfolioJsonTemplate(String(args.repoName ?? "Project"), typeof args.title === "string" ? args.title : undefined);
  }

  if (name === "get_sync_status") {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("github_project_sync_logs")
      .select("status,started_at,finished_at,repos_scanned,repos_imported,repos_skipped,error_message")
      .order("started_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    return data ?? { status: "pending" };
  }

  throw new Error(`Unknown tool: ${name}`);
}

function respond(id: JsonRpcRequest["id"], result: unknown) {
  if (id === undefined) return;
  process.stdout.write(`${JSON.stringify({ jsonrpc: "2.0", id, result })}\n`);
}

function respondError(id: JsonRpcRequest["id"], message: string) {
  if (id === undefined) return;
  process.stdout.write(`${JSON.stringify({ jsonrpc: "2.0", id, error: { code: -32000, message } })}\n`);
}

function loadLocalEnv() {
  for (const file of [".env.local", ".env"]) {
    const fullPath = resolve(process.cwd(), file);
    if (!existsSync(fullPath)) continue;
    for (const line of readFileSync(fullPath, "utf8").split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      if (!key || process.env[key]) continue;
      process.env[key] = trimmed.slice(eq + 1).trim().replace(/^['"]|['"]$/g, "");
    }
  }
}
