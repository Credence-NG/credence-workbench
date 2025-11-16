let envVariables = globalThis || {};
try {
  if (process?.env) {
    envVariables = {
      ...envVariables,
      ...process?.env,
    };
  }
} catch (error) {}

if (import.meta.env) {
  envVariables = {
    ...envVariables,
    ...import.meta.env,
  };
}

const {
  PUBLIC_BASE_URL,
  PUBLIC_BASE_URL_DEVELOPMENT,
  PUBLIC_BASE_URL_STAGING,
  PUBLIC_BASE_URL_PRODUCTION,
  PUBLIC_ECOSYSTEM_FRONT_END_URL,
  PUBLIC_POLYGON_TESTNET_URL,
  PUBLIC_POLYGON_MAINNET_URL,
  PUBLIC_CRYPTO_PRIVATE_KEY,
  PUBLIC_SHOW_NAME_AS_LOGO,
  PUBLIC_PLATFORM_NAME,
  PUBLIC_PLATFORM_LOGO,
  PUBLIC_POWERED_BY,
  PUBLIC_PLATFORM_WEB_URL,
  PUBLIC_PLATFORM_DOCS_URL,
  PUBLIC_PLATFORM_GIT,
  PUBLIC_PLATFORM_TWITTER_URL,
  PUBLIC_KEYCLOAK_MANAGEMENT_CLIENT_ID,
  PUBLIC_KEYCLOAK_MANAGEMENT_CLIENT_SECRET,
  PUBLIC_PLATFROM_DISCORD_SUPPORT,
  PUBLIC_PLATFORM_DISCORD_URL,
  PUBLIC_ALLOW_DOMAIN,
  PUBLIC_ECOSYSTEM_BASE_URL,
  PUBLIC_MODE,
  PUBLIC_ENVIRONMENT,
  PUBLIC_REDIRECT_FROM_URL,
  PUBLIC_REDIRECTION_TARGET_URL,
}: any = envVariables;

// Environment-aware URL selection
const getEnvironmentAwareBaseUrl = () => {
  // Get environment from multiple sources (NODE_ENV takes precedence)
  let nodeEnv;
  try {
    nodeEnv = typeof process !== 'undefined' ? process?.env?.NODE_ENV : undefined;
  } catch (e) {
    nodeEnv = undefined;
  }
  const mode = PUBLIC_MODE || import.meta.env.PUBLIC_MODE;
  const environment = PUBLIC_ENVIRONMENT || import.meta.env.PUBLIC_ENVIRONMENT;

  // Determine the current environment (priority: NODE_ENV > PUBLIC_MODE > PUBLIC_ENVIRONMENT)
  const currentEnv = nodeEnv || mode || environment;

  // Check for development environment
  if (currentEnv === "development") {
    return (
      PUBLIC_BASE_URL_DEVELOPMENT ||
      import.meta.env.PUBLIC_BASE_URL_DEVELOPMENT ||
      "http://localhost:5000"
    );
  }

  // Check for staging environment
  if (currentEnv === "staging") {
    return (
      PUBLIC_BASE_URL_STAGING ||
      import.meta.env.PUBLIC_BASE_URL_STAGING ||
      PUBLIC_BASE_URL ||
      import.meta.env.PUBLIC_BASE_URL
    );
  }

  // Check for production environment
  if (currentEnv === "production") {
    return (
      PUBLIC_BASE_URL_PRODUCTION ||
      import.meta.env.PUBLIC_BASE_URL_PRODUCTION ||
      PUBLIC_BASE_URL ||
      import.meta.env.PUBLIC_BASE_URL
    );
  }

  // Fallback to the general PUBLIC_BASE_URL
  return PUBLIC_BASE_URL || import.meta.env.PUBLIC_BASE_URL || "http://localhost:5000";
};

export const envConfig = {
  PUBLIC_BASE_URL: getEnvironmentAwareBaseUrl(),
  // PUBLIC_ECOSYSTEM_BASE_URL same as PUBLIC_BASE_URL - using single backend
  PUBLIC_ECOSYSTEM_BASE_URL: getEnvironmentAwareBaseUrl(),
  PUBLIC_ECOSYSTEM_FRONT_END_URL:
    PUBLIC_ECOSYSTEM_FRONT_END_URL ||
    import.meta.env.PUBLIC_ECOSYSTEM_FRONT_END_URL,
  PUBLIC_CRYPTO_PRIVATE_KEY:
    PUBLIC_CRYPTO_PRIVATE_KEY || import.meta.env.PUBLIC_CRYPTO_PRIVATE_KEY,
  PLATFORM_DATA: {
    nameAsLogo:
      PUBLIC_SHOW_NAME_AS_LOGO || import.meta.env.PUBLIC_SHOW_NAME_AS_LOGO,

    polygonTestnet:
      PUBLIC_POLYGON_TESTNET_URL || import.meta.env.PUBLIC_POLYGON_TESTNET_URL,

    polygonMainnet:
      PUBLIC_POLYGON_MAINNET_URL || import.meta.env.PUBLIC_POLYGON_MAINNET_URL,

    name: PUBLIC_PLATFORM_NAME || import.meta.env.PUBLIC_PLATFORM_NAME,
    logo: PUBLIC_PLATFORM_LOGO || import.meta.env.PUBLIC_PLATFORM_LOGO,
    poweredBy: PUBLIC_POWERED_BY || import.meta.env.PUBLIC_POWERED_BY,
    webUrl: PUBLIC_PLATFORM_WEB_URL || import.meta.env.PUBLIC_PLATFORM_WEB_URL,
    docs: PUBLIC_PLATFORM_DOCS_URL || import.meta.env.PUBLIC_PLATFORM_DOCS_URL,
    git: PUBLIC_PLATFORM_GIT || import.meta.env.PUBLIC_PLATFORM_GIT,
    twitter:
      PUBLIC_PLATFORM_TWITTER_URL ||
      import.meta.env.PUBLIC_PLATFORM_TWITTER_URL,
    discord:
      PUBLIC_PLATFORM_DISCORD_URL ||
      import.meta.env.PUBLIC_PLATFORM_DISCORD_URL,
    clientId:
      PUBLIC_KEYCLOAK_MANAGEMENT_CLIENT_ID ||
      import.meta.env.PUBLIC_KEYCLOAK_MANAGEMENT_CLIENT_ID,
    clientSecret:
      PUBLIC_KEYCLOAK_MANAGEMENT_CLIENT_SECRET ||
      import.meta.env.PUBLIC_KEYCLOAK_MANAGEMENT_CLIENT_SECRET,
  },
  PUBLIC_ALLOW_DOMAIN:
    PUBLIC_ALLOW_DOMAIN || import.meta.env.PUBLIC_ALLOW_DOMAIN,
  PUBLIC_PLATFROM_DISCORD_SUPPORT:
    PUBLIC_PLATFROM_DISCORD_SUPPORT ||
    import.meta.env.PUBLIC_PLATFROM_DISCORD_SUPPORT,
  MODE: PUBLIC_MODE || import.meta.env.PUBLIC_MODE,
  PUBLIC_REDIRECT_FROM_URL:
    PUBLIC_REDIRECT_FROM_URL || import.meta.env.PUBLIC_REDIRECT_FROM_URL,
  PUBLIC_REDIRECTION_TARGET_URL:
    PUBLIC_REDIRECTION_TARGET_URL ||
    import.meta.env.PUBLIC_REDIRECTION_TARGET_URL,
};
