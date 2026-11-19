import { timingSafeEqual } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Password-protects /tools in production with HTTP Basic auth. The browser
 * asks once and remembers it for the session. Any username works; the
 * password is the TOOLS_PASSWORD environment variable (set it in Vercel).
 *
 * - Local dev (`next dev`) skips the check.
 * - With no TOOLS_PASSWORD set, production fails closed: the tools stay locked.
 */

const REALM = 'Basic realm="taylormcneil.dev tools", charset="UTF-8"';

function passwordMatches(given: string, expected: string): boolean {
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  // timingSafeEqual needs equal lengths; compare b to itself so a length mismatch takes the same time.
  return a.length === b.length ? timingSafeEqual(a, b) : !timingSafeEqual(b, b);
}

function suppliedPassword(request: NextRequest): string | null {
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Basic ")) return null;
  try {
    const decoded = Buffer.from(header.slice("Basic ".length), "base64").toString("utf8");
    const colon = decoded.indexOf(":");
    return colon === -1 ? null : decoded.slice(colon + 1);
  } catch {
    return null;
  }
}

export function proxy(request: NextRequest) {
  if (process.env.NODE_ENV === "development") return NextResponse.next();

  const expected = process.env.TOOLS_PASSWORD;
  if (!expected) {
    return new NextResponse("Tools are locked: TOOLS_PASSWORD is not set.", { status: 503 });
  }

  const given = suppliedPassword(request);
  if (given !== null && passwordMatches(given, expected)) return NextResponse.next();

  return new NextResponse("Password required.", {
    status: 401,
    headers: { "WWW-Authenticate": REALM, "Cache-Control": "no-store" },
  });
}

export const config = {
  matcher: ["/tools", "/tools/:path*", "/api/tools/:path*"],
};
