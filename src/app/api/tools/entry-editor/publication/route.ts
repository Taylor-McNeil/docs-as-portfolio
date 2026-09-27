import { NextResponse } from "next/server";
import {
  applyPublication,
  loadRepositoryEntry,
  planPublication,
} from "@/lib/entry-publication/publication";
import type { DevlogPublicationDraft } from "@/lib/entry-publication/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function unavailable() {
  return new NextResponse(null, { status: 404 });
}

export async function GET(request: Request) {
  if (process.env.NODE_ENV !== "development") return unavailable();
  try {
    const slug = new URL(request.url).searchParams.get("slug");
    if (!slug) return NextResponse.json({ error: "An entry slug is required." }, { status: 400 });
    return NextResponse.json(await loadRepositoryEntry(slug));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not load the published entry." }, { status: 400 });
  }
}

export async function POST(request: Request) {
  if (process.env.NODE_ENV !== "development") return unavailable();
  try {
    const body = await request.json() as {
      intent?: "plan" | "apply";
      draft?: DevlogPublicationDraft;
      revision?: string;
    };
    if (!body.draft) return NextResponse.json({ error: "A devlog draft is required." }, { status: 400 });
    if (body.intent === "plan") return NextResponse.json(await planPublication(body.draft));
    if (body.intent === "apply" && body.revision) {
      return NextResponse.json(await applyPublication(body.draft, body.revision));
    }
    return NextResponse.json({ error: "Invalid publication request." }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Publication request failed." }, { status: 400 });
  }
}
