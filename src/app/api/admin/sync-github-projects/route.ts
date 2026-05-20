import { NextResponse } from "next/server";
import { syncGithubProjects } from "@/lib/github-sync/syncProjects";

export async function POST(request: Request) {
  const secret = process.env.ADMIN_SYNC_SECRET;
  const authHeader = request.headers.get("authorization") ?? "";
  const bearerToken = authHeader.toLowerCase().startsWith("bearer ")
    ? authHeader.slice(7).trim()
    : "";
  const provided = request.headers.get("x-admin-sync-secret") || bearerToken;

  if (!secret || provided !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const summary = await syncGithubProjects({ dryRun: body.dryRun !== false });
    return NextResponse.json(summary);
  } catch (error) {
    console.error("Admin GitHub sync failed:", error);
    return NextResponse.json(
      { error: "GitHub project sync failed. Check server logs for details." },
      { status: 500 }
    );
  }
}
