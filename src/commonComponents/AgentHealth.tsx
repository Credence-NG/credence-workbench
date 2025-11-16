import { apiStatusCodes, storageKeys } from '../config/CommonConstant.ts';
import { useEffect, useState } from 'react';

import type { AxiosResponse } from 'axios';
import CustomSpinner from '../components/CustomSpinner';
import { getAgentHealth } from '../api/Agent.ts';
import { getFromLocalStorage } from '../api/Auth.ts';

interface Agent {
	label: string;
	endpoints: string[];
	isInitialized: boolean;
}

const AgentHealth = () => {
	const [agentHealthDetails, setAgentHealthDetails] = useState<Agent>();
	const [loader, setLoader] = useState<boolean>(true);
	const [orgId, setOrgId] = useState<string>("");

	useEffect(() => {
		setTimeout(() => {
			getAgentHealthDetails();
		}, 4000);
	}, []);

	const getAgentHealthDetails = async () => {
		try {
			const organizationId = await getFromLocalStorage(storageKeys.ORG_ID);
			console.log('🏥 AgentHealth Component: Starting agent health check for orgId:', organizationId);
			setOrgId(organizationId)
			if (organizationId) {
				const agentData = await getAgentHealth(organizationId);
				const { data } = agentData as AxiosResponse;
				console.log('🏥 AgentHealth Component: Received agent health response:', {
					statusCode: data?.statusCode,
					agentDetails: data?.data,
					isInitialized: data?.data?.isInitialized,
					endpoints: data?.data?.endpoints,
					timestamp: new Date().toISOString()
				});
				if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
					setAgentHealthDetails(data?.data);
					setLoader(false);
					console.log('✅ AgentHealth Component: Agent health check completed successfully');
				} else {
					console.warn('⚠️ AgentHealth Component: Agent health check failed with status:', data?.statusCode);
					setLoader(false);
				}
			} else {
				console.error('❌ AgentHealth Component: Organization not created yet');
				setLoader(false);
			}
		} catch (error) {
			setLoader(false);
			console.error('❌ AgentHealth Component: An error occurred during agent health check:', error);
		}
	};
	return (
		<div className="">
			<div>
				{loader ? (
					<div>
						<CustomSpinner hideMessage={true} />
					</div>	
				) : orgId && (
					agentHealthDetails?.isInitialized ? (
						<div className="w-fit flex shrink-0 items-center bg-green-100 text-green-800 text-xs font-medium rounded-full px-2 py-2 md:py-1 dark:bg-green-900 dark:text-green-300">
							<div className="w-1 h-1 bg-green-500 rounded-full p-1 shrink-0 md:mr-1" />
							<span className="w-fit mr-1 shrink-0 md:block hidden rounded-full dark:bg-green-900 dark:text-green-300">
								Wallet Agent is up and running
							</span>
						</div>
					) : (
						<div className="w-fit flex shrink-0 items-center bg-red-100 text-red-800 text-xs font-medium rounded-full p-2 md:p-1 dark:bg-red-900 dark:text-red-300">
							<div className="w-1 h-1 md:mr-1 bg-red-500 rounded-full p-1 shrink-0 md:mr-1" />
							<span className="w-fit mr-1 shrink-0 md:block hidden rounded-full text-red-800 dark:bg-red-900 dark:text-red-300">
								Wallet Agent is not running
							</span>
						</div>
					)
				)
				}
			</div>
		</div>
	);
};

export default AgentHealth;