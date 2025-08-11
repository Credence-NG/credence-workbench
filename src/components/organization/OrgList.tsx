import type { Organisation } from './interfaces';
import OrgListItem from './OrgListItem';

interface OrgListProps {
    organizations: Organisation[];
    onOrgSelect: (org: Organisation) => void;
}

const OrgList = ({ organizations, onOrgSelect }: OrgListProps) => {
    if (organizations.length === 0) {
        return (
            <div className="text-black-100 text-sm text-center p-10">
                <span>No organizations found</span>
            </div>
        );
    }

    return (
        <>
            {organizations.map((org) => (
                <OrgListItem
                    key={org.id}
                    org={org}
                    onOrgSelect={onOrgSelect}
                />
            ))}
        </>
    );
};

export default OrgList;
