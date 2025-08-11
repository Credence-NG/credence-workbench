interface CreateOrgButtonProps {
    onCreateOrg: () => void;
}

const CreateOrgButton = ({ onCreateOrg }: CreateOrgButtonProps) => {
    return (
        <button
            onClick={onCreateOrg}
            className="flex items-center px-5 py-3 text-base font-medium text-primary-700 border-t border-gray-200 rounded-b-lg bg-gray-50 dark:border-gray-600 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white hover:underline w-full"
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                className="pr-2 dark:text-white"
                width="24"
                height="24"
                fill="none"
                viewBox="0 0 24 24"
            >
                <path
                    fill="currentColor"
                    d="M21.89 9.89h-7.78V2.11a2.11 2.11 0 1 0-4.22 0v7.78H2.11a2.11 2.11 0 1 0 0 4.22h7.78v7.78a2.11 2.11 0 1 0 4.22 0v-7.78h7.78a2.11 2.11 0 1 0 0-4.22Z"
                />
            </svg>
            Create Organization
        </button>
    );
};

export default CreateOrgButton;
