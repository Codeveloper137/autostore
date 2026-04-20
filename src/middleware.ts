export { authEdge as middleware } from "@/auth.edge";

export const config = {
  matcher: ["/admin/:path*"],
};
