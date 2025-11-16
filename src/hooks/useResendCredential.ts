import { useState } from "react";
import type { AxiosResponse } from "axios";
import { resendCredential } from "../api/issuance";
import { apiStatusCodes } from "../config/CommonConstant";
import type {
  ResendCredentialHook,
  ResendCredentialResponse,
} from "../components/Issuance/interface";

export const useResendCredential = (): ResendCredentialHook => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<ResendCredentialResponse | null>(null);

  const getErrorMessage = (errorMsg: string): string => {
    if (errorMsg.includes("Maximum resends")) {
      return "Daily resend limit reached. Please try again tomorrow.";
    }
    if (errorMsg.includes("current state")) {
      return "This credential cannot be resent in its current state.";
    }
    if (errorMsg.includes("permissions") || errorMsg.includes("Insufficient")) {
      return "You do not have permission to resend credentials.";
    }
    if (errorMsg.includes("not found")) {
      return "Credential request not found.";
    }
    return "Failed to resend credential. Please try again.";
  };

  const resendCredentialRequest = async (credentialRequestId: string) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await resendCredential(credentialRequestId);
      const { data } = response as AxiosResponse;

      if (
        data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS ||
        data?.statusCode === 200
      ) {
        setSuccess(data.data);
      } else {
        const errorMessage = getErrorMessage(
          data?.message || (response as string)
        );
        setError(errorMessage);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? getErrorMessage(err.message)
          : "An unexpected error occurred";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  return {
    resendCredential: resendCredentialRequest,
    isLoading,
    error,
    success,
    clearMessages,
  };
};
