import { envConfig } from "./config/envConfig";
import { pathRoutes } from "./config/pathRoutes";

export const onRequest = async (context: any, next: any) => {
  const domains = import.meta.env.PUBLIC_ALLOW_DOMAIN;
  const allowedDomain = `${context.url.origin} ${domains}`;

  // Get WebSocket configuration from environment - use public URLs when available
  const wsProtocol = context.url.protocol === "https:" ? "wss:" : "ws:";
  const wsHost = context.url.hostname;
  const wsPort =
    context.url.port || (context.url.protocol === "https:" ? "443" : "80");

  // Add additional localhost WebSocket configurations ONLY for development
  // Use PUBLIC_MODE for runtime environment detection (not process.env.NODE_ENV which is build-time)
  const runtimeEnv = import.meta.env.PUBLIC_MODE || import.meta.env.PUBLIC_ENVIRONMENT;
  const isDevelopment =
    wsHost === "localhost" ||
    wsHost === "127.0.0.1" ||
    wsHost.includes(".local") ||
    runtimeEnv === "development";

  // Include localhost WebSocket URLs ONLY for development
  // Staging and production should NOT include localhost URLs
  const isViteEnvironment =
    isDevelopment && wsPort === "3000";

  // Debug logging
  console.log("🐛 MIDDLEWARE DEBUG:", {
    runtimeEnv: runtimeEnv,
    publicMode: import.meta.env.PUBLIC_MODE,
    publicEnvironment: import.meta.env.PUBLIC_ENVIRONMENT,
    buildTimeNodeEnv: process.env.NODE_ENV,
    wsHost,
    wsPort,
    isDevelopment,
    isViteEnvironment,
    willAddLocalhost: isDevelopment || isViteEnvironment,
    requestUrl: context.url.href,
    domains: domains?.substring(0, 100) + "...",
    allowedDomain: allowedDomain.substring(0, 100) + "...",
  });

  // Build WebSocket URLs based on environment
  let wsUrls = `${wsProtocol}//${wsHost}`;
  if (wsPort && wsPort !== "80" && wsPort !== "443") {
    wsUrls += `:${wsPort}`;
  }

  // Add both ws and wss variants for the current host
  const wsPortForWs = wsPort !== "3000" ? `:${wsPort}` : "";
  const wsPortForWss = wsPort !== "3000" ? `:${wsPort}` : "";
  const currentHostWs = `ws://${wsHost}${wsPortForWs} wss://${wsHost}${wsPortForWss}`;
  wsUrls = `${wsUrls} ${currentHostWs}`;

  const devWsUrls =
    isDevelopment || isViteEnvironment
      ? " ws://localhost wss://localhost ws://localhost:3000 wss://localhost:3000 ws://localhost:3001 wss://localhost:3001 ws://localhost:5000 wss://localhost:5000 ws://127.0.0.1 wss://127.0.0.1 ws://127.0.0.1:3000 wss://127.0.0.1:3000"
      : "";

  // For development, prepend localhost WebSocket URLs to the domains list
  const finalAllowedDomains =
    isDevelopment || isViteEnvironment
      ? `${allowedDomain} ws://localhost wss://localhost ws://localhost:3000 wss://localhost:3000 ws://localhost:3001 wss://localhost:3001 ws://localhost:5000 wss://localhost:5000 ws://127.0.0.1 wss://127.0.0.1 ws://127.0.0.1:3000 wss://127.0.0.1:3000 ws://studio.confamd.com wss://studio.confamd.com ws://studio.confamd.com:3000 wss://studio.confamd.com:3000`
      : allowedDomain;

  // Handle CORS preflight requests first
  if (context.request.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": allowedDomain,
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers":
          "Content-Type, Authorization, X-Requested-With, Accept, Origin",
        "Access-Control-Max-Age": "86400",
        "Access-Control-Allow-Credentials": "true",
      },
    });
  }

  const response = await next();
  const html = await response.text();

  const nonce = "dynamicNONCE" + new Date().getTime().toString();

  // Set headers only for successful responses
  response.headers.set(
    "Content-Security-Policy",
    `default-src 'self'; script-src 'self' ${allowedDomain} 'nonce-${nonce}_scripts'; style-src 'unsafe-inline' ${allowedDomain}; font-src ${allowedDomain}; img-src 'self' data: ${allowedDomain}; frame-src 'self' ${allowedDomain}; object-src 'none'; media-src 'self'; connect-src 'self' ${finalAllowedDomains} ${wsUrls}; form-action 'self'; frame-ancestors 'self'; `
  );
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Access-Control-Allow-Origin", allowedDomain);
  response.headers.set("Access-Control-Allow-Credentials", "true");
  response.headers.set("ServerTokens", "dummy_server_name");
  response.headers.set("server_tokens", "off");
  response.headers.set("server", "dummy_server_name");
  response.headers.set("Server", "dummy_server_name");
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains; preload"
  );
  response.headers.set("X-XSS-Protection", "1; mode=block");

  let updatedHtml = await html
    .split("<script")
    .join(`<script nonce="${nonce}_scripts" `);

  // Only redirect to sign-in for specific unauthorized responses, not all 302s
  // Note: This was causing issues with legitimate app redirects
  // if (response.status === 302) {
  //   return context.redirect(pathRoutes.auth.sinIn);
  // }

  // Preserve the original response status - don't force everything to 200
  return new Response(updatedHtml, {
    status: response.status,
    headers: response.headers,
  });
};
