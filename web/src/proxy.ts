import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  const { response, claims } = await updateSession(request);
  const { pathname } = request.nextUrl;

  // Signed-out visitors never see account or admin shells; the pages re-check server-side.
  if (!claims && (pathname.startsWith("/account") || pathname.startsWith("/admin"))) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    url.searchParams.set("signin", pathname);
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|images/|favicon.ico|icon|apple-icon|opengraph-image|robots.txt|sitemap.xml|.*\.(?:svg|png|jpg|jpeg|gif|webp|avif)$).*)",
  ],
};
