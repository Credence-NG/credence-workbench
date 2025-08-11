# Sidebar Menu Development Guide

## Overview

The Credence Workbench uses a **role-based, feature-driven sidebar system** that dynamically renders menu items based on user permissions. This guide explains how to add new menu items to the sidebar.

## Architecture

The sidebar system consists of several key components:

- **Features**: Define what actions users can perform (`/src/utils/enums/features.ts`)
- **Permissions**: Map user roles to features (`/src/config/permissions.ts`)
- **Sidebar Menus**: Define the actual menu structure (`/src/config/sidebarMenus.ts`)
- **Dynamic Sidebar**: React component that renders menus based on user permissions (`/src/components/Sidebar/DynamicSidebar.tsx`)

## Adding a New Menu Item

### Step 1: Define the Feature (if new)

If your menu requires a new permission/capability, add it to the Features enum:

**File**: `/src/utils/enums/features.ts`

```typescript
export enum Features {
  // ... existing features
  YOUR_NEW_FEATURE = "your_new_feature",
  MANAGE_REPORTS = "manage_reports",
  VIEW_ANALYTICS = "view_analytics",
}
```

### Step 2: Assign Feature to Roles

Update the permissions configuration to assign the feature to appropriate roles:

**File**: `/src/config/permissions.ts`

```typescript
export const RolePermissions: IPermission[] = [
  {
    role: "owner",
    features: [
      // ... existing features
      Features.YOUR_NEW_FEATURE,
      Features.MANAGE_REPORTS,
    ],
  },
  {
    role: "admin",
    features: [
      // ... existing features
      Features.VIEW_ANALYTICS,
    ],
  },
  // ... other roles
];
```

### Step 3: Create the Menu Item

Add your menu item to the sidebar configuration:

**File**: `/src/config/sidebarMenus.ts`

```typescript
export const SidebarMenus: ISidebarItem[] = [
  // ... existing menus
  {
    label: "Reports",
    href: "/organizations/reports",
    icon: "reports",
    feature: Features.MANAGE_REPORTS,
  },
];
```

### Step 4: Create the Route/Page

Create the actual page that the menu will navigate to:

**File**: `/src/pages/organizations/reports/index.astro`

```astro
---
import LayoutSidebar from '../../../app/LayoutSidebar.astro';
import ReportsComponent from '../../../components/Reports/ReportsComponent';
import { checkUserSession } from '../../../utils/check-session';

const response = await checkUserSession({
  cookies: Astro.cookies, 
  currentPath: Astro.url.pathname
});

if (!response.authorized) {
  return Astro.redirect(response.redirect);
}
---

<LayoutSidebar notFoundPage={!response.permitted}>
  <ReportsComponent client:visible/>
</LayoutSidebar>
```

### Step 5: Add Route Authorization (if needed)

If the menu links to routes that need authorization, update the feature routes:

**File**: `/src/config/featureRoutes.ts`

```typescript
export const FeatureRoutes: IFeatureRoute[] = [
  // ... existing routes
  {
    feature: Features.MANAGE_REPORTS,
    baseRoute: "/organizations/reports",
    routes: [
      "/organizations/reports",
      "/organizations/reports/create",
      "/organizations/reports/edit"
    ],
  },
];
```

## Menu Types

### Simple Menu Item

```typescript
{
  label: "Analytics",
  href: "/organizations/analytics",
  icon: "analytics",
  feature: Features.VIEW_ANALYTICS,
}
```

### Dropdown Menu with Children

```typescript
{
  label: "Settings",
  href: "#", // Use # for parent items that don't navigate
  icon: "settings",
  feature: Features.MANAGE_SETTINGS,
  children: [
    {
      label: "General",
      href: "/organizations/settings/general",
      icon: "general",
      feature: Features.GENERAL_SETTINGS,
    },
    {
      label: "Security",
      href: "/organizations/settings/security",
      icon: "security",
      feature: Features.SECURITY_SETTINGS,
    }
  ]
}
```

### Conditional Menu (Advanced)

For complex menu logic, modify the `DynamicSidebar.tsx` component:

```typescript
// In DynamicSidebar.tsx initializeSidebar function
if (shouldShowCustomMenu(features)) {
  const customMenu = {
    label: "Custom Menu",
    href: "/custom",
    icon: "custom",
    feature: Features.CUSTOM_FEATURE,
    children: buildCustomChildren(features)
  };
  filteredMenus.push(customMenu);
}
```

## Available Icons

The system has predefined icon mappings in the `DynamicSidebar` component:

- `dashboard` - Dashboard icon
- `organization` - Organization/building icon
- `schema` - Schema/document icon
- `credentials` - Credentials/certificate icon
- `connections` - Connections/network icon
- `users` - Users/people icon
- `ecosystem` - Ecosystem/globe icon
- `settings` - Settings/gear icon
- `profile` - Profile/user icon
- `reports` - Reports/chart icon
- `analytics` - Analytics/graph icon

## Role-Based Visibility

The sidebar system automatically:

- ✅ Shows menus only if the user has the required feature
- ✅ Filters children based on individual child permissions
- ✅ Handles dropdown expansion/collapse state
- ✅ Maintains menu state across page navigation

## Testing Your Menu

After adding your menu, verify:

1. **Permission Check**: Ensure the user role has the required feature in `permissions.ts`
2. **Route Exists**: Check that the target route/page exists and is accessible
3. **Role Testing**: Verify the menu appears for users with the right permissions
4. **Security**: Test that users without permissions don't see the menu
5. **Navigation**: Confirm clicking the menu navigates to the correct page

## Example: Adding a "Reports" Menu

### 1. Add Feature
```typescript
// /src/utils/enums/features.ts
export enum Features {
  // ... existing
  MANAGE_REPORTS = "manage_reports",
}
```

### 2. Assign to Roles
```typescript
// /src/config/permissions.ts
{
  role: "owner",
  features: [
    // ... existing
    Features.MANAGE_REPORTS,
  ],
}
```

### 3. Add Menu
```typescript
// /src/config/sidebarMenus.ts
{
  label: "Reports",
  href: "/organizations/reports",
  icon: "reports",
  feature: Features.MANAGE_REPORTS,
  children: [
    {
      label: "Dashboard",
      href: "/organizations/reports/dashboard",
      icon: "dashboard",
      feature: Features.MANAGE_REPORTS,
    },
    {
      label: "Create Report",
      href: "/organizations/reports/create",
      icon: "create",
      feature: Features.MANAGE_REPORTS,
    }
  ]
}
```

### 4. Create Page
```astro
<!-- /src/pages/organizations/reports/index.astro -->
---
import LayoutSidebar from '../../../app/LayoutSidebar.astro';
import Reports from '../../../components/Reports/Reports';
import { checkUserSession } from '../../../utils/check-session';

const response = await checkUserSession({
  cookies: Astro.cookies, 
  currentPath: Astro.url.pathname
});

if (!response.authorized) {
  return Astro.redirect(response.redirect);
}
---

<LayoutSidebar notFoundPage={!response.permitted}>
  <Reports client:visible/>
</LayoutSidebar>
```

## Best Practices

1. **Feature Naming**: Use descriptive, action-based feature names (e.g., `MANAGE_REPORTS`, `VIEW_ANALYTICS`)
2. **Role Assignment**: Only assign features to roles that genuinely need them
3. **Menu Hierarchy**: Keep menu depth reasonable (max 2 levels recommended)
4. **Icon Consistency**: Use consistent icons that match the functionality
5. **Route Structure**: Follow the existing route patterns (`/organizations/feature/subfeature`)
6. **Authorization**: Always add authorization checks to new pages
7. **Testing**: Test with different user roles to ensure proper visibility

## Troubleshooting

### Menu Not Appearing
- Check if the user role has the required feature in `permissions.ts`
- Verify the feature is correctly defined in `features.ts`
- Check browser console for permission-related errors

### Menu Appearing for Wrong Users
- Review role assignments in `permissions.ts`
- Check if multiple features grant access to the same menu

### Navigation Issues
- Verify the target route exists
- Check for typos in the `href` path
- Ensure the target page has proper authorization

### Icon Not Displaying
- Check if the icon name is mapped in `DynamicSidebar.tsx`
- Add new icon mappings if needed

## File Structure Reference

```
src/
├── config/
│   ├── permissions.ts          # Role → Feature mappings
│   ├── sidebarMenus.ts        # Menu structure definition
│   └── featureRoutes.ts       # Feature → Route mappings
├── utils/enums/
│   └── features.ts            # Feature definitions
├── components/Sidebar/
│   └── DynamicSidebar.tsx     # Sidebar rendering logic
└── pages/
    └── organizations/         # Menu target pages
        └── your-feature/
            └── index.astro
```

This architecture ensures that the sidebar is secure, maintainable, and scales well with new features and roles.
