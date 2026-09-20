import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const username = process.env.ADMIN_USER;
  const password = process.env.ADMIN_PASSWORD;

  if (!username || !password) {
    return new NextResponse("Admin access is not configured.", { status: 503 });
  }

  const auth = request.headers.get("authorization");
  if (auth?.startsWith("Basic ")) {
    try {
      const decoded = atob(auth.slice(6));
      const separator = decoded.indexOf(":");
      const suppliedUser = decoded.slice(0, separator);
      const suppliedPassword = decoded.slice(separator + 1);
      if (suppliedUser === username && suppliedPassword === password) {
        return NextResponse.next();
      }
    } catch {
      // fall through to challenge
    }
  }

  return new NextResponse("Authentication required.", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="The Sarah Method Admin"' },
  });
}

export const config = { matcher: "/admin/:path*" };
