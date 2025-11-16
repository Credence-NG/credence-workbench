import { Features } from "../utils/enums/features";
import { pathRoutes } from "./pathRoutes";

export interface ISidebarItem {
  label: string;
  href: string;
  icon: string;
  feature: string;
  children?: ISidebarItem[];
}

export const SidebarMenus: ISidebarItem[] = [
  // Dashboard - Available to all authenticated users
  {
    label: "Dashboard",
    href: pathRoutes.users.dashboard,
    icon: "dashboard",
    feature: Features.VIEW_DASHBOARD,
  },

  // Invitations - For receiving and managing organization invitations
  {
    label: "Invitations",
    href: pathRoutes.users.invitations,
    icon: "invitations",
    feature: Features.VIEW_DASHBOARD, // Use a basic feature so it's available to all users
  },

  // Organizations - Role-based access
  {
    label: "Organizations",
    href: pathRoutes.organizations.root,
    icon: "organization",
    feature: Features.MANAGE_ORGANIZATION,
    children: [
      {
        label: "Dashboard",
        href: pathRoutes.organizations.dashboard,
        icon: "dashboard",
        feature: Features.MANAGE_ORGANIZATION,
      },
      {
        label: "List",
        href: "/organizations", // Assuming you have a route for listing organizations
        icon: "Orgs List",
        feature: Features.MANAGE_ORGANIZATION,
      },
      {
        label: "Members",
        href: "/organizations/users", // Based on your route structure
        icon: "users",
        feature: Features.MANAGE_MEMBERS,
      },
    ],
  },

  // Schemas - For schema creators
  {
    label: "Schemas",
    href: pathRoutes.organizations.schemas,
    icon: "schema",
    feature: Features.CREATE_SCHEMA,
  },

  // Credentials - Split by role capability
  {
    label: "Credentials",
    href: "#",
    icon: "credentials",
    feature: Features.VIEW_DASHBOARD, // Use feature that definitely works
    children: [
      {
        label: "Issued Credentials",
        href: pathRoutes.organizations.issuedCredentials,
        icon: "Issued",
        feature: Features.VIEW_ISSUED_CREDENTIALS,
      },
      {
        label: "Issue",
        href: pathRoutes.organizations.issuedCredentials,
        icon: "issue",
        feature: Features.ISSUANCE,
      },
      {
        label: "Pending Requests",
        href: pathRoutes.organizations.pendingRequests,
        icon: "pending",
        feature: Features.VIEW_DASHBOARD, // Use feature that works
      },
      {
        label: "Verify",
        href: pathRoutes.organizations.credentials,
        icon: "verify",
        feature: Features.VERIFICATION,
      },
    ],
  },

  // Pending Requests - Standalone menu
  {
    label: "Pending Requests",
    href: pathRoutes.organizations.pendingRequests,
    icon: "pending",
    feature: Features.PENDING_REQUESTS,
  },

  // Connections - For connection management
  {
    label: "Connections",
    href: pathRoutes.users.connectionList,
    icon: "connections",
    feature: Features.VIEW_CONNECTIONS,
  },

  // Users/Members - For member management (owners/admins)
  {
    label: "Users",
    href: "/organizations/users",
    icon: "users",
    feature: Features.MANAGE_MEMBERS,
  },

  // Ecosystem - For ecosystem features
  {
    label: "Ecosystem",
    href: "#",
    icon: "ecosystem",
    feature: Features.ECOSYSTEM_MANAGEMENT,
    children: [
      {
        label: "List",
        href: pathRoutes.ecosystem.root,
        icon: "lists",
        feature: Features.VIEW_ECOSYSTEMS,
      },
      {
        label: "Create",
        href: `${pathRoutes.ecosystem.root}/create`,
        icon: "issue",
        feature: Features.CREATE_ECOSYSTEM,
      },
    ],
  },

  // Admin - For administrative functions
  {
    label: "Admin",
    href: "#",
    icon: "admin",
    feature: Features.APPROVE_ORGANIZATION,
    children: [
      {
        label: "Organization Verification",
        href: pathRoutes.admin.organizationVerification,
        icon: "verification",
        feature: Features.APPROVE_ORGANIZATION,
      },
      {
        label: "Audit Logs",
        href: pathRoutes.admin.organizationAuditLogs,
        icon: "audit",
        feature: Features.APPROVE_ORGANIZATION,
      },
    ],
  },

  // Platform Settings - Platform admin only
  {
    label: "Platform Settings",
    href: pathRoutes.users.platformSetting,
    icon: "settings",
    feature: Features.PLATFORM_MANAGEMENT,
  },

  // Profile - Available to all
  {
    label: "Profile",
    href: pathRoutes.users.profile,
    icon: "profile",
    feature: Features.MANAGE_PROFILE,
  },
];

// Helper function to filter menus based on user features
export const getVisibleMenus = (userFeatures: string[]): ISidebarItem[] => {
  const filterMenuByFeatures = (menu: ISidebarItem): ISidebarItem | null => {
    // Check if user has access to this menu item
    if (!userFeatures.includes(menu.feature)) {
      return null;
    }

    // Filter children if they exist
    const filteredChildren = menu.children
      ?.map((child) => filterMenuByFeatures(child))
      .filter(Boolean) as ISidebarItem[];

    return {
      ...menu,
      children: filteredChildren?.length > 0 ? filteredChildren : undefined,
    };
  };

  return SidebarMenus.map((menu) => filterMenuByFeatures(menu)).filter(
    Boolean
  ) as ISidebarItem[];
};

// Helper function to check if a menu should show Credentials parent based on children
export const shouldShowCredentialsMenu = (userFeatures: string[]): boolean => {
  return (
    userFeatures.includes(Features.ISSUANCE) ||
    userFeatures.includes(Features.VERIFICATION) ||
    userFeatures.includes(Features.PENDING_REQUESTS) ||
    userFeatures.includes(Features.VIEW_PENDING_REQUESTS)
  );
};
