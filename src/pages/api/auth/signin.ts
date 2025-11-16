import type { APIRoute } from "astro";
import { pathRoutes } from "../../../config/pathRoutes";
import { setToCookies } from "../../../api/Auth";

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  /* Get body from request */
  const body = await request.json();

  const sessionCookie = body?.data;

  // Set persistent cookies with 7 day expiration (604800 seconds)
  const cookieOptions = {
    path: "/",
    maxAge: 604800, // 7 days
    httpOnly: true,
    secure: import.meta.env.PUBLIC_ENVIRONMENT === "production",
    sameSite: "lax" as const,
  };

  setToCookies(cookies, "session", sessionCookie?.access_token as string, cookieOptions);
  setToCookies(cookies, "refresh", sessionCookie?.refresh_token as string, cookieOptions);
  setToCookies(cookies, "role", sessionCookie?.role as string, cookieOptions);

  // Return success response instead of redirecting
  // Let the client-side handle the redirect based on enhanced registration flow
  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
};
