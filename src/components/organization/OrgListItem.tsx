import CustomAvatar from '../Avatar/index.tsx';
import type { Organisation } from './interfaces';

interface OrgListItemProps {
    org: Organisation;
    onOrgSelect: (org: Organisation) => void;
}

const OrgListItem = ({ org, onOrgSelect }: OrgListItemProps) => {
    const truncateName = (name: string, maxLength: number = 25) => {
        return name?.length > maxLength ? `${name.substring(0, maxLength)}...` : name;
    };

    return (
        <li key={org.id}>
            <button
                className="w-full"
                onClick={() => onOrgSelect(org)}
            >
                <span className="flex items-center w-full px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">
                    <CustomAvatar
                        className="dark:text-white max-w-[100%] w-full h-full rounded-full font-sm"
                        size="35px"
                        src={org.logoUrl}
                        name={org.name}
                        textSizeRatio={2.5}
                    />
                    <span className="ml-3 text-base text-start font-bold text-gray-500 dark:text-white word-break-word">
                        {truncateName(org.name)}
                    </span>
                </span>
            </button>
        </li>
    );
};

export default OrgListItem;
