import React from 'react';
import { Button } from 'flowbite-react';
import { IssueCredential } from '../../common/enums';
import { useResendCredential } from '../../hooks/useResendCredential';

interface ResendButtonProps {
    credentialRequestId: string;
    currentStatus: string;
    connectionId: string;
    onResendSuccess?: () => void;
    disabled?: boolean;
}

export const ResendButton: React.FC<ResendButtonProps> = ({
    credentialRequestId,
    currentStatus,
    connectionId,
    onResendSuccess,
    disabled = false
}) => {
    const { resendCredential, isLoading, error, success, clearMessages } = useResendCredential();

    // Only show resend button for eligible states
    const canResend = [
        IssueCredential.abandoned,
        IssueCredential.offerSent,
        IssueCredential.proposalSent
    ].includes(currentStatus as IssueCredential);

    const handleResend = async () => {
        clearMessages();
        await resendCredential(credentialRequestId);

        if (onResendSuccess) {
            onResendSuccess();
        }
    };

    if (!canResend) {
        return (
            <span className="text-gray-400 text-xs">
                No action needed
            </span>
        );
    }

    return (
        <div className="resend-credential-container">
            <Button
                size="xs"
                color="warning"
                onClick={handleResend}
                disabled={isLoading || disabled}
                className="resend-btn"
                title={`Resend credential to ${connectionId}`}
            >
                {isLoading ? (
                    <>
                        <svg
                            className="animate-spin -ml-1 mr-2 h-3 w-3 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                            />
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                        </svg>
                        Resending...
                    </>
                ) : (
                    <div className="flex items-center">
                        <svg
                            className="mr-1 h-3 w-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                            />
                        </svg>
                        Resend
                    </div>
                )}
            </Button>

            {error && (
                <div className="mt-1 text-xs text-red-600 dark:text-red-400" title={error}>
                    ⚠️ {error.length > 30 ? `${error.substring(0, 30)}...` : error}
                </div>
            )}

            {success && (
                <div className="mt-1 text-xs text-green-600 dark:text-green-400">
                    ✅ Resent via {success.method}
                </div>
            )}
        </div>
    );
};
