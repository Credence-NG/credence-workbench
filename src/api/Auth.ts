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
  phoneNumber: string | null;
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
    // If value is not a string, try to convert it
    if (typeof value !== "string") {
      console.warn(
        "DecryptData: Value is not a string, attempting to convert:",
        typeof value
      );
      value = String(value);
    }

    // Check if value looks like encrypted data
    if (!value || value.length < 10) {
      console.warn(
        "DecryptData: Value appears to be too short for encrypted data:",
        value
      );
      return "";
    }

    // Check if the crypto key is available
    if (!CRYPTO_PRIVATE_KEY) {
      console.error(
        "DecryptData: CRYPTO_PRIVATE_KEY is not available from environment"
      );
      return "";
    }

    // Additional debugging for the problematic value
    if (value.startsWith("U2FsdGVkX1")) {
      //   console.log("🔍 DecryptData: Debugging encryption details:");
      //   console.log("  - Value starts with U2FsdGVkX1 (CryptoJS format): true");
      //   console.log("  - Value length:", value.length);
      //   console.log("  - Crypto key available:", !!CRYPTO_PRIVATE_KEY);
      //   console.log("  - Crypto key length:", CRYPTO_PRIVATE_KEY?.length || 0);
      //   console.log("  - Full value:", value);
    }

    let bytes = CryptoJS.AES.decrypt(value, CRYPTO_PRIVATE_KEY);
    const decryptedString = bytes.toString(CryptoJS.enc.Utf8);

    // If decryption results in empty string, try alternative approaches
    if (!decryptedString) {
      console.error(
        "DecryptData: Decryption resulted in empty string for value:",
        value?.substring(0, 50) + "..."
      );
      console.error(
        "DecryptData: Crypto key length:",
        CRYPTO_PRIVATE_KEY?.length || 0
      );
      console.error("DecryptData: Raw bytes object:", bytes);
      console.error("DecryptData: Bytes sigBytes:", bytes.sigBytes);

      // Check if the value might be stored as plain text (fallback for migration)
      try {
        // If the value looks like JSON or plain text, return it as-is
        if (
          value.startsWith("{") ||
          value.startsWith("[") ||
          value.includes(",") ||
          !value.includes("+") ||
          !value.includes("/")
        ) {
          console.warn(
            "DecryptData: Value might be plain text, returning as-is"
          );
          return value;
        }
      } catch (e) {
        // Ignore
      }
    }

    return decryptedString;
  } catch (error) {
    // Handle decryption error or invalid input
    console.error(
      "DecryptData: Decryption error for value:",
      value?.substring(0, 50) + "...",
      error
    );

    // Final fallback - if decryption fails completely, check if value might be plain text
    try {
      if (
        typeof value === "string" &&
        (value.startsWith("{") ||
          value.startsWith("[") ||
          (!value.includes("+") && !value.includes("/")))
      ) {
        console.warn(
          "DecryptData: FALLBACK - Treating failed decryption as plain text"
        );
        return value;
      }
    } catch (e) {
      // Ignore fallback errors
    }

    return "";
  }
};

export const setToLocalStorage = async (key: string, value: any) => {
  // Debug logging for role-related keys
  if (
    key === "user_roles" ||
    key === "org_roles" ||
    key === "user_permissions"
  ) {
    console.log(`🔒 SetToLocalStorage DEBUG for ${key}:`);
    console.log("Value to store:", value);
    console.log("Value type:", typeof value);
    console.log(
      "Value length/count:",
      Array.isArray(value) ? value.length : value?.length || 0
    );
  }

  // If passed value is object then checked empty object
  if (typeof value === "object" && Boolean(Object.keys(value).length <= 0)) {
    if (
      key === "user_roles" ||
      key === "org_roles" ||
      key === "user_permissions"
    ) {
      console.log(
        `❌ SetToLocalStorage: Empty object detected for ${key}, not storing`
      );
    }
    return;
  }

  // If passed value is string then checked if value is falsy
  if (typeof value === "string" && !value?.trim()) {
    if (
      key === "user_roles" ||
      key === "org_roles" ||
      key === "user_permissions"
    ) {
      console.log(
        `❌ SetToLocalStorage: Empty/falsy string detected for ${key}, not storing`
      );
    }
    return;
  }

  const convertedValue = encryptData(value);

  if (
    key === "user_roles" ||
    key === "org_roles" ||
    key === "user_permissions"
  ) {
    console.log("Encrypted value length:", convertedValue?.length || 0);
    console.log("About to store in localStorage...");
  }

  localStorage.setItem(key, convertedValue as string);

  if (
    key === "user_roles" ||
    key === "org_roles" ||
    key === "user_permissions"
  ) {
    console.log(`✅ Successfully stored ${key} in localStorage`);
    // Verify it was stored
    const verification = localStorage.getItem(key);
    console.log("Verification - value exists in localStorage:", !!verification);
    console.log(
      "Verification - stored value length:",
      verification?.length || 0
    );
  }

  return true;
};

export const getFromLocalStorage = async (key: string) => {
  const value = localStorage.getItem(key);

  // Debug logging for role-related keys and ORG_DID
  if (
    key === "user_roles" ||
    key === "org_roles" ||
    key === "user_permissions" ||
    key === "did"
  ) {
    console.log(`🔍 GetFromLocalStorage DEBUG for ${key}:`);
    console.log(
      "Raw value from localStorage:",
      value ? value.substring(0, 100) + "..." : "null/undefined"
    );
    console.log("Value exists:", !!value);
    console.log("Value length:", value?.length || 0);
  }

  if (!value) {
    if (
      key === "user_roles" ||
      key === "org_roles" ||
      key === "user_permissions" ||
      key === "did"
    ) {
      console.log(`❌ No value found in localStorage for key: ${key}`);
    }
    return "";
  }

  const convertedValue = decryptData(value);

  // Debug logging for role-related keys and ORG_DID
  if (
    key === "user_roles" ||
    key === "org_roles" ||
    key === "user_permissions" ||
    key === "did"
  ) {
    console.log("Decrypted value:", convertedValue || "empty/failed");
    console.log("Decryption successful:", !!convertedValue);
  }

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
