import type { AstroCookies } from "astro";
import { getFromCookies } from "../api/Auth";
import { pathRoutes } from "../config/pathRoutes";
import { RolePermissions } from "../config/permissions";
import {
  checkFeatureAccess,
  getUserAvailableRoutes,
} from "../config/featureRoutes";
import { apiStatusCodes } from "../config/CommonConstant";
import { apiRoutes } from "../config/apiRoutes";
import { setToCookies } from "../api/Auth";
import { envConfig } from "../config/envConfig";

interface IProps {
  cookies: AstroCookies;
  currentPath: string;
}

interface IOutput {
  permitted: boolean;
  redirect?: string;
  authorized?: boolean;
}

export const checkUserSession = async ({
  cookies,
  currentPath,
}: IProps): Promise<IOutput> => {
  const sessionCookie = getFromCookies(cookies, "session");

  if (!sessionCookie) {
    return {
      permitted: false,
      redirect: pathRoutes.auth.sinIn,
      authorized: false,
    };
  }

  try {
    const baseURL =
      import.meta.env.PUBLIC_BASE_URL || process.env.PUBLIC_BASE_URL;
    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionCookie + ""}`,
      },
      method: "GET",
    };
    const res = await fetch(`${baseURL + apiRoutes.users.userProfile}`, {
      ...config,
    });
    const userData = await res.json();
    console.log("Check Authorized User:::", {
      status: userData.statusCode,
      message: userData.message,
    });

    if (userData?.statusCode === apiStatusCodes.API_STATUS_UNAUTHORIZED) {
      const refreshSession = getFromCookies(cookies, "refresh");

      const configRefreshToken = {
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          refreshToken: refreshSession,
        }),
      };

      const res = await fetch(`${baseURL + apiRoutes.auth.refreshToken}`, {
        ...configRefreshToken,
      });
      const userSession = await res.json();

      if (userSession?.statusCode !== apiStatusCodes.API_STATUS_SUCCESS) {
        return {
          permitted: false,
          redirect: pathRoutes.auth.sinIn,
          authorized: false,
        };
      }
      // Use consistent cookie options for refresh token updates
      const cookieOptions = {
        path: "/",
        maxAge: 604800, // 7 days
        httpOnly: true,
        secure: import.meta.env.PUBLIC_ENVIRONMENT === "production",
        sameSite: "lax" as const,
      };

      setToCookies(
        cookies,
        "session",
        userSession?.data?.access_token as string,
        cookieOptions
      );
      setToCookies(
        cookies,
        "refresh",
        userSession?.data?.refresh_token as string,
        cookieOptions
      );

      return {
        permitted: true,
        authorized: true,
      };
    }
  } catch (error) {
    console.log("GET USER DETAILS ERROR::::", error);
  }

  const role = getFromCookies(cookies, "role");
  const rolePermission = RolePermissions.find((item) => item.role === role);

  if (!rolePermission) {
    // Role not found in permissions - redirect to login
    return {
      permitted: false,
      redirect: pathRoutes.auth.sinIn,
      authorized: false,
    };
  }

  // Check if user has access to current path through features
  const hasAccess = checkFeatureAccess(rolePermission.features, currentPath);

  if (hasAccess) {
    return {
      permitted: true,
      authorized: true,
    };
  }

  // Access denied - redirect to first available route for this role
  const availableRoutes = getUserAvailableRoutes(rolePermission.features);
  const redirectPath = availableRoutes[0] || pathRoutes.users.dashboard;

  return {
    permitted: false,
    redirect: redirectPath,
    authorized: true,
  };
};
