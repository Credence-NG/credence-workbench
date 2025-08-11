import { axiosGet, axiosPost, axiosPut } from "../services/apiRequests";
import CryptoJS from "crypto-js";
import { apiRoutes } from "../config/apiRoutes";
import { envConfig } from "../config/envConfig";
import { storageKeys } from "../config/CommonConstant";
import type { AddPassword } from "../components/Profile/interfaces";
import type { AstroCookies } from "astro";
import pako from "pako";

export interface UserSignUpData {
  email: string;
  clientId: string;
  clientSecret: string;
}
export interface AddPasswordDetails {
  email: string;
  password: string;
  isPasskey: boolean;
  firstName: string | null;
  lastName: string | null;
}
export interface UserSignInData {
  email: string | undefined;
  isPasskey: boolean;
  password?: string;
}
export interface EmailVerifyData {
  verificationCode: string;
  email: string;
}

export interface KeyCloakData {
  email: string;
  oldPassword: string;
  newPassword: string;
}

export const sendVerificationMail = async (payload: UserSignUpData) => {
  const details = {
    url: apiRoutes.auth.sendMail,
    payload,
    config: { headers: { "Content-type": "application/json" } },
  };
  try {
    const response = await axiosPost(details);
    return response;
  } catch (error) {
    const err = error as Error;
    return err?.message;
  }
};

export const resetPassword = async (
  payload: { password: string; token: string | null },
  email: string | null
) => {
  const details = {
    url: `${apiRoutes.auth.resetPassword}/${email}`,
    payload,
  };
  try {
    const response = await axiosPost(details);
    return response;
  } catch (error) {
    const err = error as Error;
    return err?.message;
  }
};

export const forgotPassword = async (payload: { email: string }) => {
  const details = {
    url: apiRoutes.auth.forgotPassword,
    payload,
  };
  try {
    const response = await axiosPost(details);
    return response;
  } catch (error) {
    const err = error as Error;
    return err?.message;
  }
};

export const loginUser = async (payload: UserSignInData) => {
  const details = {
    url: apiRoutes.auth.sinIn,
    payload,
    config: { headers: { "Content-type": "application/json" } },
  };
  try {
    const response = await axiosPost(details);
    return response;
  } catch (error) {
    const err = error as Error;
    return err?.message;
  }
};

export const resetPasswordKeyCloak = async (payload: KeyCloakData) => {
  const details = {
    url: apiRoutes.auth.keyClockResetPassword,
    payload,
    config: { headers: { "Content-type": "application/json" } },
  };
  try {
    const response = await axiosPost(details);
    return response;
  } catch (error) {
    const err = error as Error;
    return err?.message;
  }
};

export const getUserProfile = async (accessToken: string) => {
  const details = {
    url: apiRoutes.users.userProfile,
    config: { headers: { Authorization: `Bearer ${accessToken}` } },
  };
  try {
    const response = await axiosGet(details);
    return response;
  } catch (error) {
    const err = error as Error;
    return err?.message;
  }
};

export const updateUserProfile = async (data: object) => {
  const url = apiRoutes.users.update;
  const payload = data;
  const token = await getFromLocalStorage(storageKeys.TOKEN);

  const config = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  };
  const axiosPayload = {
    url,
    payload,
    config,
  };

  try {
    return await axiosPut(axiosPayload);
  } catch (error) {
    const err = error as Error;
    return err?.message;
  }
};

export const verifyUserMail = async (payload: EmailVerifyData) => {
  const details = {
    url: `${apiRoutes.auth.verifyEmail}?verificationCode=${payload?.verificationCode}&email=${payload?.email}`,
    config: { headers: { "Content-type": "application/json" } },
  };
  try {
    const response = await axiosGet(details);
    return response;
  } catch (error) {
    const err = error as Error;
    return err?.message;
  }
};

export const checkUserExist = async (payload: string) => {
  const details = {
    url: `${apiRoutes.users.checkUser}${payload}`,
    config: { headers: { "Content-type": "application/json" } },
  };
  try {
    const response = await axiosGet(details);
    return response;
  } catch (error) {
    const err = error as Error;
    return err?.message;
  }
};

export const addPasswordDetails = async (payload: AddPasswordDetails) => {
  const details = {
    url: `${apiRoutes.auth.addDetails}`,
    payload,
    config: { headers: { "Content-type": "application/json" } },
  };
  try {
    const response = await axiosPost(details);
    return response;
  } catch (error) {
    const err = error as Error;
    return err?.message;
  }
};

export const addPasskeyUserDetails = async (
  payload: AddPassword,
  email: string
) => {
  const token = await getFromLocalStorage(storageKeys.TOKEN);
  const details = {
    url: `${apiRoutes.auth.passkeyUserDetails}${email}`,
    payload,
    config: {
      headers: {
        "Content-type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    },
  };
  try {
    const response = await axiosPut(details);
    return response;
  } catch (error) {
    const err = error as Error;
    return err?.message;
  }
};

export const passwordEncryption = (password: string): string => {
  const CRYPTO_PRIVATE_KEY: string = import.meta.env.PUBLIC_CRYPTO_PRIVATE_KEY;
  const encryptedPassword: string = CryptoJS.AES.encrypt(
    JSON.stringify(password),
    CRYPTO_PRIVATE_KEY
  ).toString();
  return encryptedPassword;
};

export const encryptData = (value: any): string => {
  const CRYPTO_PRIVATE_KEY: string = import.meta.env.PUBLIC_CRYPTO_PRIVATE_KEY;

  try {
    if (typeof value !== "string") {
      value = JSON.stringify(value);
    }
    return CryptoJS.AES.encrypt(value, CRYPTO_PRIVATE_KEY).toString();
  } catch (error) {
    // Handle encryption error
    console.error("Encryption error:", error);
    return "";
  }
};

export const decryptData = (value: any): string => {
  const CRYPTO_PRIVATE_KEY: string = import.meta.env.PUBLIC_CRYPTO_PRIVATE_KEY;

  try {
    let bytes = CryptoJS.AES.decrypt(value, CRYPTO_PRIVATE_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    // Handle decryption error or invalid input
    console.error("Decryption error:", error);
    return "";
  }
};

export const setToLocalStorage = async (key: string, value: any) => {
  // If passed value is object then checked empty object
  if (typeof value === "object" && Boolean(Object.keys(value).length <= 0)) {
    return;
  }

  // If passed value is string then checked if value is falsy
  if (typeof value === "string" && !value?.trim()) {
    return;
  }

  const convertedValue = await encryptData(value);
  const setValue = await localStorage.setItem(key, convertedValue as string);
  return true;
};

export const getFromLocalStorage = async (key: string) => {
  const value = await localStorage.getItem(key);
  const convertedValue = value ? await decryptData(value) : "";
  return convertedValue;
};

export const getFromCookies = (
  cookies: AstroCookies,
  key: string
): string | undefined => {
  const value = cookies.get(key)?.value;

  // If no value, return undefined
  if (!value) {
    return value;
  }

  // Check if the value is compressed
  if (value.startsWith("gz:")) {
    try {
      const base64Data = value.replace("gz:", "");
      const compressed = Uint8Array.from(atob(base64Data), (c) =>
        c.charCodeAt(0)
      );
      const decompressed = pako.inflate(compressed, { to: "string" });

      const isDevelopment =
        import.meta.env.PUBLIC_ENVIRONMENT === "development";
      if (isDevelopment) {
        console.log(
          `Decompressed cookie '${key}': ${value.length} -> ${decompressed.length} characters`
        );
      }

      return decompressed;
    } catch (error) {
      console.warn("Cookie decompression failed for key:", key, error);
      // Return undefined or empty string instead of corrupted data
      return "";
    }
  }

  // Return uncompressed value as-is
  return value;
};

export const setToCookies = (
  cookies: AstroCookies,
  key: string,
  value: any,
  option: { [key: string]: any }
): boolean => {
  if (typeof value === "object" && Boolean(Object.keys(value).length <= 0)) {
    return;
  }

  if (typeof value === "string" && !value?.trim()) {
    return;
  }

  let finalValue = value;

  // Try compression for large values
  if (typeof value === "string" && value.length > 2000) {
    try {
      const compressed = pako.deflate(value);
      const base64Compressed = btoa(String.fromCharCode(...compressed));
      const compressedValue = `gz:${base64Compressed}`;

      // Check if compressed value is still too large
      if (compressedValue.length > 3800) {
        // Leave some buffer
        console.warn(
          `Cookie '${key}' is still too large after compression (${compressedValue.length} chars). Consider using session storage.`
        );
        // You might want to return false here or throw an error
        // depending on your error handling strategy
      }

      finalValue = compressedValue;
    } catch (error) {
      console.warn("Cookie compression failed, using original value:", error);

      // If original value is too large, warn
      if (value.length > 3800) {
        console.error(
          `Cookie '${key}' is too large (${value.length} chars) and compression failed. This will cause issues.`
        );
      }
    }
  }

  const isDevelopment = import.meta.env.PUBLIC_ENVIRONMENT === "development";

  if (isDevelopment && typeof value === "string") {
    console.log(`Setting cookie '${key}': ${value.length} characters`);
  }

  if (isDevelopment && finalValue !== value) {
    console.log(
      `Compressed cookie '${key}': ${value.length} -> ${finalValue.length} characters`
    );
  }

  const updatedOption: { [key: string]: any } = {
    ...option,
    httpOnly: true,
    secure: !isDevelopment,
    sameSite: isDevelopment ? "lax" : "strict",
  };

  cookies.set(key, finalValue as string, updatedOption);
  return true;
};

export const removeFromLocalStorage = async (key: string) => {
  await localStorage.removeItem(key);
  return true;
};
