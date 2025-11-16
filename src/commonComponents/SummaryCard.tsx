import React, { useEffect, useState } from 'react';
import { Card } from 'flowbite-react';
import CopyDid from '../commonComponents/CopyDid';
import { storageKeys } from '../config/CommonConstant';
import { getFromLocalStorage } from '../api/Auth';
import { DidMethod } from '../common/enums';

interface IProps {
	schemaName: string;
	version: string;
	credDefId?: string;
	schemaId: string;
	hideCredDefId?: boolean;
}

const SummaryCard = ({ schemaName, version, credDefId, schemaId, hideCredDefId }: Readonly<IProps>) => {
	const [isW3cDid, setIsW3cDid] = useState<boolean>(false);

	const fetchOrgData = async () => {
		console.log('🔍 SummaryCard: Fetching org data...');

		try {
			// First check if the value exists in localStorage
			const rawValue = localStorage.getItem(storageKeys.ORG_DID);
			console.log('🔍 SummaryCard: Raw localStorage value for ORG_DID:', rawValue);
			console.log('🔍 SummaryCard: Value type:', typeof rawValue);
			console.log('🔍 SummaryCard: Value length:', rawValue?.length || 0);

			if (!rawValue) {
				console.warn('⚠️ SummaryCard: ORG_DID not found in localStorage');
				return;
			}

			const orgDid = await getFromLocalStorage(storageKeys.ORG_DID);
			console.log('🔍 SummaryCard: Decrypted orgDid:', orgDid);
			console.log('🔍 SummaryCard: Decrypted orgDid type:', typeof orgDid);
			console.log('🔍 SummaryCard: Decrypted orgDid length:', orgDid?.length || 0);

			if (!orgDid) {
				console.warn('⚠️ SummaryCard: Decryption returned empty/null value');
				return;
			}

			if (orgDid.includes(DidMethod.POLYGON) || orgDid.includes(DidMethod.KEY) || orgDid.includes(DidMethod.WEB)) {
				setIsW3cDid(true);
			} else {
				setIsW3cDid(false);
			}
		} catch (error) {
			console.error('❌ SummaryCard: Error in fetchOrgData:', error);
		}
	};
	useEffect(() => {
		fetchOrgData();
	}, []);

	return (
		<div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3'>
			<Card>
				<div className="flex justify-between items-start">
					<div>
						<h5 className="text-xl font-bold leading-none dark:text-white">
							{schemaName}
						</h5>
						<p className="dark:text-white">
							Version: {version}
						</p>
					</div>
				</div>
				<div className="min-w-0 flex-1 issuance">
					<p className="truncate dark:text-white break-all flex">
						<span className="font-semibold mr-2">Schema ID: </span>
						<span className='flex w-schema-id'>
							<CopyDid value={schemaId || ""} className='truncate font-courier mt-[2px]' />
						</span>
					</p>
					{!isW3cDid && (
						<p className="truncate dark:text-white break-all flex">
							<span className="font-semibold mr-2">Credential Definition: </span>
							<span className='flex w-cred-id'>
								<CopyDid value={credDefId || ""} className='truncate font-courier mt-[2px]' />
							</span>
						</p>
					)}
				</div>
			</Card>
		</div>
	);
};

export default SummaryCard;
