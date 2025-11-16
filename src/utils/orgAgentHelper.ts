/**
 * Helper utility to safely access org_agents data
 *
 * The backend API returns org_agents as a single object, but historically
 * the frontend treated it as an array. This helper provides a consistent
 * interface for accessing org_agents data.
 */

import type { OrgAgent } from '../components/organization/interfaces';

/**
 * Safely get the org_agents object from API response
 * @param orgAgents - The org_agents data from API (can be object or null)
 * @returns The org_agents object or null
 */
export const getOrgAgent = (orgAgents: OrgAgent | null | undefined): OrgAgent | null => {
  if (!orgAgents || typeof orgAgents !== 'object') {
    return null;
  }
  return orgAgents;
};

/**
 * Check if organization has a wallet (org_agents exists)
 * @param orgAgents - The org_agents data from API
 * @returns true if wallet exists, false otherwise
 */
export const hasWallet = (orgAgents: OrgAgent | null | undefined): boolean => {
  return orgAgents !== null && orgAgents !== undefined && typeof orgAgents === 'object';
};

/**
 * Get the orgDid from org_agents
 * @param orgAgents - The org_agents data from API
 * @returns The orgDid string or null
 */
export const getOrgDid = (orgAgents: OrgAgent | null | undefined): string | null => {
  const agent = getOrgAgent(orgAgents);
  return agent?.orgDid || null;
};

/**
 * Get the wallet name from org_agents
 * @param orgAgents - The org_agents data from API
 * @returns The wallet name string or null
 */
export const getWalletName = (orgAgents: OrgAgent | null | undefined): string | null => {
  const agent = getOrgAgent(orgAgents);
  return agent?.walletName || null;
};
