import { useEffect, useState } from 'react';
import {
	getUserEffectiveFeatures,
	hasFeature as checkFeature,
	isPlatformAdmin as checkPlatformAdmin,
	getRequiredFeature
} from '../config/featureAuth';
import { Features } from '../utils/enums/features';

/**
 * React Hook for Feature-Based Access Control
 * 
 * Use this hook in React components to:
 * - Check if user has specific features
 * - Show/hide UI elements based on permissions
 * - Get user's complete feature list
 * - Check platform admin status
 */

export interface FeatureAccess {
	userFeatures: string[];
	isPlatformAdmin: boolean;
	loading: boolean;
	hasFeature: (feature: string) => boolean;
	canAccess: (feature: string) => boolean;
	refresh: () => Promise<void>;
}

export const useFeatureAccess = (): FeatureAccess => {
	const [userFeatures, setUserFeatures] = useState<string[]>([]);
	const [isPlatformAdmin, setIsPlatformAdmin] = useState<boolean>(false);
	const [loading, setLoading] = useState<boolean>(true);

	const loadFeatures = async () => {
		try {
			setLoading(true);
			const features = await getUserEffectiveFeatures();
			const adminStatus = checkPlatformAdmin();

			setUserFeatures(features);
			setIsPlatformAdmin(adminStatus);
		} catch (error) {
			console.error('Error loading user features:', error);
			setUserFeatures([]);
			setIsPlatformAdmin(false);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadFeatures();
	}, []);

	const hasFeature = (feature: string): boolean => {
		return userFeatures.includes(feature);
	};

	const canAccess = (feature: string): boolean => {
		// Platform admin has access to everything
		if (isPlatformAdmin) return true;
		return hasFeature(feature);
	};

	return {
		userFeatures,
		isPlatformAdmin,
		loading,
		hasFeature,
		canAccess,
		refresh: loadFeatures
	};
};

/**
 * Feature Gate Component
 * 
 * Conditionally render content based on feature access
 */
interface FeatureGateProps {
	feature: string;
	children: React.ReactNode;
	fallback?: React.ReactNode;
	requireAll?: boolean; // If multiple features, require all (default: require any)
}

export const FeatureGate: React.FC<FeatureGateProps> = ({
	feature,
	children,
	fallback = null,
	requireAll = false
}) => {
	const { canAccess, loading } = useFeatureAccess();

	if (loading) {
		return <div className="animate-pulse bg-gray-200 rounded h-4 w-24"></div>;
	}

	const features = feature.split(',').map(f => f.trim());

	const hasAccess = requireAll
		? features.every(f => canAccess(f))
		: features.some(f => canAccess(f));

	return hasAccess ? <>{children}</> : <>{fallback}</>;
};

/**
 * Platform Admin Gate Component
 * 
 * Only render content for platform administrators
 */
interface PlatformAdminGateProps {
	children: React.ReactNode;
	fallback?: React.ReactNode;
}

export const PlatformAdminGate: React.FC<PlatformAdminGateProps> = ({
	children,
	fallback = null
}) => {
	const { isPlatformAdmin, loading } = useFeatureAccess();

	if (loading) {
		return <div className="animate-pulse bg-gray-200 rounded h-4 w-24"></div>;
	}

	return isPlatformAdmin ? <>{children}</> : <>{fallback}</>;
};

/**
 * Feature-based navigation helper
 */
export const useFeatureNavigation = () => {
	const { canAccess, isPlatformAdmin } = useFeatureAccess();

	const getNavigationItems = () => {
		const items: Array<{
			path: string;
			label: string;
			feature: string;
			visible: boolean;
		}> = [];

		// Dashboard (everyone can access)
		items.push({
			path: '/dashboard',
			label: 'Dashboard',
			feature: Features.VIEW_DASHBOARD,
			visible: canAccess(Features.VIEW_DASHBOARD)
		});

		// Organization Management
		if (canAccess(Features.MANAGE_ORGANIZATION)) {
			items.push({
				path: '/organizations',
				label: 'Organizations',
				feature: Features.MANAGE_ORGANIZATION,
				visible: true
			});
		}

		// Schema Management
		if (canAccess(Features.VIEW_SCHEMAS)) {
			items.push({
				path: '/organizations/schemas',
				label: 'Schemas',
				feature: Features.VIEW_SCHEMAS,
				visible: true
			});
		}

		// Credential Issuance
		if (canAccess(Features.ISSUANCE)) {
			items.push({
				path: '/organizations/credentials/issue',
				label: 'Issue Credentials',
				feature: Features.ISSUANCE,
				visible: true
			});
		}

		// Verification
		if (canAccess(Features.VERIFICATION)) {
			items.push({
				path: '/organizations/verification',
				label: 'Verify Credentials',
				feature: Features.VERIFICATION,
				visible: true
			});
		}

		// Connections
		if (canAccess(Features.VIEW_CONNECTIONS)) {
			items.push({
				path: '/connections',
				label: 'Connections',
				feature: Features.VIEW_CONNECTIONS,
				visible: true
			});
		}

		// User Management
		if (canAccess(Features.MANAGE_MEMBERS)) {
			items.push({
				path: '/organizations/users',
				label: 'Users',
				feature: Features.MANAGE_MEMBERS,
				visible: true
			});
		}

		// Platform Settings (Platform Admin Only)
		if (isPlatformAdmin) {
			items.push({
				path: '/platform-settings',
				label: 'Platform Settings',
				feature: Features.PLATFORM_SETTINGS,
				visible: true
			});
		}

		return items.filter(item => item.visible);
	};

	return {
		navigationItems: getNavigationItems(),
		canNavigateTo: (path: string) => {
			const requiredFeature = getRequiredFeature(path);
			return requiredFeature ? canAccess(requiredFeature) : true;
		}
	};
};

/**
 * Utility hook for common feature checks
 */
export const useCommonFeatures = () => {
	const { canAccess, isPlatformAdmin } = useFeatureAccess();

	return {
		// Organization features
		canManageOrganization: canAccess(Features.MANAGE_ORGANIZATION),
		canViewDashboard: canAccess(Features.VIEW_DASHBOARD),
		canManageUsers: canAccess(Features.MANAGE_MEMBERS),
		canInviteUsers: canAccess(Features.INVITE_USERS),

		// Schema features
		canCreateSchema: canAccess(Features.CREATE_SCHEMA),
		canViewSchemas: canAccess(Features.VIEW_SCHEMAS),

		// Credential features
		canIssueCredentials: canAccess(Features.ISSUANCE),
		canBulkIssue: canAccess(Features.BULK_ISSUANCE),
		canEmailIssue: canAccess(Features.EMAIL_ISSUANCE),
		canViewIssuedCredentials: canAccess(Features.VIEW_ISSUED_CREDENTIALS),

		// Verification features
		canVerifyCredentials: canAccess(Features.VERIFICATION),
		canRequestProof: canAccess(Features.REQUEST_PROOF),
		canEmailVerify: canAccess(Features.EMAIL_VERIFICATION),

		// Connection features
		canViewConnections: canAccess(Features.VIEW_CONNECTIONS),
		canManageConnections: canAccess(Features.MANAGE_CONNECTIONS),

		// Admin features
		isPlatformAdmin,
		canAccessPlatformSettings: isPlatformAdmin
	};
};
