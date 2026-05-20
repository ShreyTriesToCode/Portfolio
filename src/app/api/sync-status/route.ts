import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/github-sync/supabaseAdmin";
import type { GithubSyncStatus } from "@/lib/projects";

export const dynamic = "force-dynamic";

function pendingStatus(): GithubSyncStatus {
  return { status: "pending" };
}

export async function GET() {
  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("github_project_sync_logs")
      .select("status,started_at,finished_at,repos_scanned,repos_imported,repos_skipped")
      .order("started_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      return NextResponse.json(pendingStatus());
    }

    const status = data.status === "failed" ? "failed" : data.status === "synced" ? "synced" : "pending";
    return NextResponse.json({
      status,
      started_at: data.started_at ?? null,
      finished_at: data.finished_at ?? null,
      repos_scanned: data.repos_scanned ?? 0,
      repos_imported: data.repos_imported ?? 0,
      repos_skipped: data.repos_skipped ?? 0,
    } satisfies GithubSyncStatus);
  } catch {
    return NextResponse.json(pendingStatus());
  }
}
