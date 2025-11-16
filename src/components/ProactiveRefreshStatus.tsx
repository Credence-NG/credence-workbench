/**
 * ProactiveTokenRefresh Status Component
 * 
 * A simple React component to display the status of the proactive token refresh system.
 * Add this to any page during development to monitor the system.
 */

import React, { useState, useEffect } from 'react';

interface ActivityStatus {
    isActive: boolean;
    lastActivity: number;
    timeSinceActivity: number;
}

interface TokenInfo {
    expiresIn: number;
    expiresAt: string;
}

const ProactiveRefreshStatus: React.FC = () => {
    const [activityStatus, setActivityStatus] = useState<ActivityStatus | null>(null);
    const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);
    const [isSystemRunning, setIsSystemRunning] = useState(false);

    useEffect(() => {
        const updateStatus = async () => {
            try {
                // Check if ProactiveTokenRefresh is available
                const { ProactiveTokenRefresh } = await import('../utils/proactiveTokenRefresh');

                if (ProactiveTokenRefresh) {
                    setIsSystemRunning(true);
                    const status = ProactiveTokenRefresh.getActivityStatus();
                    setActivityStatus(status);

                    // Get token expiration info
                    const { getFromLocalStorage } = await import('../api/Auth');
                    const { storageKeys } = await import('../config/CommonConstant');

                    const token = await getFromLocalStorage(storageKeys.TOKEN);
                    if (token) {
                        try {
                            const payload = JSON.parse(atob(token.split('.')[1]));
                            const expirationTime = payload.exp * 1000;
                            const timeUntilExpiration = expirationTime - Date.now();

                            setTokenInfo({
                                expiresIn: Math.round(timeUntilExpiration / 1000 / 60),
                                expiresAt: new Date(expirationTime).toLocaleTimeString()
                            });
                        } catch (error) {
                            console.warn('Error parsing token:', error);
                        }
                    }
                } else {
                    setIsSystemRunning(false);
                }
            } catch (error) {
                setIsSystemRunning(false);
                console.warn('ProactiveTokenRefresh not available:', error);
            }
        };

        updateStatus();
        const interval = setInterval(updateStatus, 10000); // Update every 10 seconds

        return () => clearInterval(interval);
    }, []);

    if (!isSystemRunning) {
        return (
            <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-lg">
                <strong>⚠️ ProactiveTokenRefresh:</strong> Not running
            </div>
        );
    }

    return (
        <div className="fixed bottom-4 right-4 bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded shadow-lg max-w-sm">
            <div className="font-bold mb-2">🔄 Proactive Token Refresh Status</div>

            <div className="text-sm space-y-1">
                <div>
                    <strong>User Status:</strong> {activityStatus?.isActive ? '🟢 Active' : '🔴 Inactive'}
                </div>

                {activityStatus && (
                    <div>
                        <strong>Last Activity:</strong> {Math.round(activityStatus.timeSinceActivity / 1000)} seconds ago
                    </div>
                )}

                {tokenInfo && (
                    <>
                        <div>
                            <strong>Token Expires:</strong> {tokenInfo.expiresIn} minutes
                        </div>
                        <div>
                            <strong>Expires At:</strong> {tokenInfo.expiresAt}
                        </div>
                    </>
                )}

                <div className="mt-2 text-xs text-gray-600">
                    Refresh triggers when &lt; 1.5 minutes remain
                </div>
            </div>
        </div>
    );
};

export default ProactiveRefreshStatus;
