import { AiOutlineSearch } from 'react-icons/ai';

interface OrgSearchInputProps {
	onSearchChange: (value: string) => void;
}

const OrgSearchInput = ({ onSearchChange }: OrgSearchInputProps) => {
	return (
		<div className="w-full flex items-center sticky top-0 bg-white px-2 border dark:border-gray-500 rounded-t-md border-gray-100 dark:text-gray-200 dark:bg-gray-600 dark:hover:text-white">
			<AiOutlineSearch
				size={22}
				className="text-gray-700 dark:text-white"
			/>
			<input
				type="text"
				placeholder="Search organization"
				onChange={(e) => onSearchChange(e.target.value)}
				className="placeholder:text-gray-500 dark:placeholder:text-white p-2 w-full outline-none dark:bg-gray-600"
			/>
		</div>
	);
};

export default OrgSearchInput;
