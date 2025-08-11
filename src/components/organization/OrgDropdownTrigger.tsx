import { BiChevronDown } from 'react-icons/bi';
import CustomAvatar from '../Avatar/index.tsx';
import type { IOrgInfo } from './interfaces';

interface OrgDropdownTriggerProps {
	activeOrg?: IOrgInfo;
}

const OrgDropdownTrigger = ({ activeOrg }: OrgDropdownTriggerProps) => {
	const truncateName = (name: string, maxLength: number = 20) => {
		return name?.length > maxLength ? `${name.substring(0, maxLength)}...` : name;
	};

	return (
		<div
			id="dropdownUsersButton"
			data-dropdown-toggle="dropdownUsers"
			data-dropdown-placement="bottom"
			className="text-primary-700 flex justify-between text-lg h-fit sm:h-10 w-fit sm:w-56 bg-primary-100 hover:!bg-primary-200 dark:bg-primary-700 cursor-pointer focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-md text-sm px-1 py-1 sm:px-4 sm:py-2.5 text-center inline-flex items-center dark:hover:bg-primary-700 dark:focus:ring-blue-800"
		>
			{activeOrg ? (
				<div className="shrink-0 flex items-center w-6 sm:w-40 text-sm">
					<CustomAvatar
						textSizeRatio={2.5}
						className="max-w-[100%] w-full h-full rounded-full font-sm"
						size="25px"
						src={activeOrg.logoUrl}
						name={activeOrg.name}
					/>
					<span className="ml-2 text-sm text-primary-700 dark:text-white truncate hidden sm:block">
						{truncateName(activeOrg.name)}
					</span>
				</div>
			) : (
				<span className="text-primary-700 dark:text-white hidden sm:block">
					Select organization
				</span>
			)}

			<BiChevronDown
				size={25}
				className="text-primary-700 dark:text-white"
			/>
		</div>
	);
};

export default OrgDropdownTrigger;
