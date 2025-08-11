import { Features } from "../utils/enums/features";
import { pathRoutes } from "./pathRoutes";

export interface IFeatureRoute {
  feature: string;
  routes: string[];
  baseRoute: string;
}

export const FeatureRoutes: IFeatureRoute[] = [
  // Dashboard & Profile
  {
    feature: Features.VIEW_DASHBOARD,
    baseRoute: "/dashboard",
    routes: ["/dashboard"],
  },
  {
    feature: Features.MANAGE_PROFILE,
    baseRoute: "/profile",
    routes: ["/profile"],
  },

  // Organization Management
  {
    feature: Features.MANAGE_ORGANIZATION,
    baseRoute: "/organizations",
    routes: [
      "/organizations",
      "/organizations/dashboard",
      "/organizations/users",
      "/organizations/invitations",
    ],
  },
  {
    feature: Features.VIEW_WALLET_DETAILS,
    baseRoute: "/organizations",
    routes: ["/organizations", "/organizations/dashboard"],
  },

  // Schema Management
  {
    feature: Features.CREATE_SCHEMA,
    baseRoute: "/organizations/schemas",
    routes: ["/organizations/schemas", "/organizations/schemas/create"],
  },
  {
    feature: Features.VIEW_SCHEMAS,
    baseRoute: "/organizations/schemas",
    routes: ["/organizations/schemas"],
  },
  {
    feature: Features.SCHEMA_ENDORSEMENT,
    baseRoute: "/organizations/schemas",
    routes: ["/organizations/schemas", "/organizations/schemas/create"],
  },

  // DID Management
  {
    feature: Features.MANAGE_DIDS,
    baseRoute: "/organizations/dids",
    routes: ["/organizations/dids", "/organizations/dids/create"],
  },
  {
    feature: Features.CREATE_DID,
    baseRoute: "/organizations/dids",
    routes: ["/organizations/dids", "/organizations/dids/create"],
  },

  // Issuance Features
  {
    feature: Features.ISSUANCE,
    baseRoute: "/organizations/credentials/issue",
    routes: [
      "/organizations/credentials/issue",
      "/organizations/credentials/issue/schemas",
      "/organizations/credentials/issue/schemas/cred-defs",
      "/organizations/credentials/issue/schemas/cred-defs/connections",
      "/organizations/credentials/issue/schemas/cred-defs/connections/issuance",
      "/organizations/credentials/issue/connections/issuance",
    ],
  },
  {
    feature: Features.BULK_ISSUANCE,
    baseRoute: "/organizations/credentials/issue/bulk-issuance",
    routes: [
      "/organizations/credentials/issue/bulk-issuance",
      "/organizations/credentials/issue/bulk-issuance/history",
    ],
  },
  {
    feature: Features.EMAIL_ISSUANCE,
    baseRoute: "/organizations/credentials/issue/email",
    routes: [
      "/organizations/credentials/issue/email",
      "/organizations/credentials/issue/email/history",
    ],
  },
  {
    feature: Features.VIEW_ISSUED_CREDENTIALS,
    baseRoute: "/organizations/credentials",
    routes: ["/organizations/credentials"],
  },

  // Verification Features
  {
    feature: Features.VERIFICATION,
    baseRoute: "/organizations/verification",
    routes: [
      "/organizations/verification",
      "/organizations/verification/verify-credentials",
      "/organizations/verification/verify-credentials/schemas",
      "/organizations/verification/verify-credentials/schemas/cred-defs",
      "/organizations/verification/verify-credentials/schemas/cred-defs/connections",
      "/organizations/verification/verify-credentials/schemas/cred-defs/connections/verification",
    ],
  },
  {
    feature: Features.REQUEST_PROOF,
    baseRoute: "/organizations/verification",
    routes: [
      "/organizations/verification",
      "/organizations/verification/verify-credentials",
    ],
  },

  // Connection Management
  {
    feature: Features.VIEW_CONNECTIONS,
    baseRoute: "/connections",
    routes: ["/connections"],
  },
  {
    feature: Features.MANAGE_CONNECTIONS,
    baseRoute: "/connections",
    routes: ["/connections"],
  },

  // User Management
  {
    feature: Features.MANAGE_MEMBERS,
    baseRoute: "/organizations/users",
    routes: ["/organizations/users", "/organizations/invitations"],
  },
  {
    feature: Features.SEND_INVITATION,
    baseRoute: "/invitations",
    routes: ["/invitations"],
  },

  // Platform Administration
  {
    feature: Features.PLATFORM_MANAGEMENT,
    baseRoute: "/platform-settings",
    routes: ["/platform-settings"],
  },
  {
    feature: Features.PLATFORM_SETTINGS,
    baseRoute: "/platform-settings",
    routes: ["/platform-settings"],
  },

  // Ecosystem Management
  {
    feature: Features.ECOSYSTEM_MANAGEMENT,
    baseRoute: "/ecosystems",
    routes: ["/ecosystems"],
  },
  {
    feature: Features.CREATE_ORG,
    baseRoute: "/dashboard",
    routes: ["/dashboard"], // Organization creation might be from dashboard
  },
  {
    feature: Features.SETTINGS,
    baseRoute: "/settings",
    routes: ["/settings"],
  },
];

// Helper function to check if a path matches a feature
export const checkFeatureAccess = (
  userFeatures: string[],
  currentPath: string
): boolean => {
  return userFeatures.some((userFeature) => {
    const featureRoute = FeatureRoutes.find((fr) => fr.feature === userFeature);
    if (!featureRoute) return false;

    // Check exact match or hierarchical match
    return (
      featureRoute.routes.includes(currentPath) ||
      currentPath.startsWith(featureRoute.baseRoute + "/") ||
      currentPath === featureRoute.baseRoute
    );
  });
};

// Helper function to get available routes for a user
export const getUserAvailableRoutes = (userFeatures: string[]): string[] => {
  const routes = new Set<string>();

  userFeatures.forEach((feature) => {
    const featureRoute = FeatureRoutes.find((fr) => fr.feature === feature);
    if (featureRoute) {
      featureRoute.routes.forEach((route) => routes.add(route));
    }
  });

  return Array.from(routes);
};
