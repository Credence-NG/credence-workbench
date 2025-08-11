import type { Organisation } from './interfaces';
import OrgSearchInput from './OrgSearchInput';
import OrgList from './OrgList';
import CreateOrgButton from './CreateOrgButton';

interface OrgDropdownContentProps {
	organizations: Organisation[];
	onSearchChange: (value: string) => void;
	onOrgSelect: (org: Organisation) => void;
	onCreateOrg: () => void;
	showCreateOrg?: boolean;
}

const OrgDropdownContent = ({
	organizations,
	onSearchChange,
	onOrgSelect,
	onCreateOrg,
	showCreateOrg = true
}: OrgDropdownContentProps) => {
	return (
		<div
			id="dropdownUsers"
			className="z-10 hidden border border-gray-200 shadow-xl bg-gray-50 rounded-md shadow w-56 dark:bg-gray-700"
			suppressHydrationWarning={true}
		>
			<ul
				className="max-h-56 pb-2 overflow-y-auto text-gray-700 dark:text-gray-200 text-sm scrollbar scrollbar-w-3 scrollbar-thumb-rounded-[0.25rem] scrollbar-track-slate-200 scrollbar-thumb-gray-400 dark:scrollbar-track-gray-900 dark:scrollbar-thumb-gray-700"
				aria-labelledby="dropdownUsersButton"
			>
				<OrgSearchInput onSearchChange={onSearchChange} />
				<OrgList
					organizations={organizations}
					onOrgSelect={onOrgSelect}
				/>
			</ul>
			{showCreateOrg && <CreateOrgButton onCreateOrg={onCreateOrg} />}
		</div>
	);
};

export default OrgDropdownContent;
