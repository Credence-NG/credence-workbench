import { Card } from 'flowbite-react';
import type { Ecosystem } from '../../types/ecosystem';

interface EcosystemCardProps {
    ecosystem: Ecosystem;
    onClick: (ecosystemId: string) => void;
}

const EcosystemCard = ({ ecosystem, onClick }: EcosystemCardProps) => {
    const handleClick = () => {
        if (ecosystem.id) {
            onClick(ecosystem.id);
        }
    };

    const getStatusBadge = (status: string) => {
        const statusColors: Record<string, string> = {
            ACTIVE: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
            INACTIVE: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
            SUSPENDED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
            PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
        };

        return (
            <span
                className={`text-xs font-medium mr-2 px-2.5 py-0.5 rounded ${statusColors[status] || statusColors.INACTIVE
                    }`}
            >
                {status}
            </span>
        );
    };

    return (
        <Card
            className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
            onClick={handleClick}
        >
            <div className="flex flex-col h-full">
                <div className="flex items-start justify-between mb-2">
                    <h5 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                        {ecosystem.name}
                    </h5>
                    {ecosystem.status && getStatusBadge(ecosystem.status)}
                </div>

                {ecosystem.description && (
                    <p className="text-gray-700 dark:text-gray-400 mb-4 flex-grow line-clamp-3">
                        {ecosystem.description}
                    </p>
                )}

                <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex flex-col gap-2 text-sm">
                        {ecosystem.logoUrl && (
                            <div className="flex items-center gap-2">
                                <img
                                    src={ecosystem.logoUrl}
                                    alt={`${ecosystem.name} logo`}
                                    className="h-8 w-8 rounded object-cover"
                                />
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                                <span className="font-semibold text-gray-600 dark:text-gray-400">
                                    Type:
                                </span>
                                <span className="ml-2 text-gray-900 dark:text-white">
                                    {ecosystem.businessModel}
                                </span>
                            </div>
                            <div>
                                <span className="font-semibold text-gray-600 dark:text-gray-400">
                                    Visibility:
                                </span>
                                <span className="ml-2 text-gray-900 dark:text-white">
                                    {ecosystem.isPublic ? 'Public' : 'Private'}
                                </span>
                            </div>
                        </div>

                        {ecosystem.totalOrganizations !== undefined && (
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div>
                                    <span className="font-semibold text-gray-600 dark:text-gray-400">
                                        Organizations:
                                    </span>
                                    <span className="ml-2 text-gray-900 dark:text-white">
                                        {ecosystem.totalOrganizations}
                                    </span>
                                </div>
                                {ecosystem.totalTransactions !== undefined && (
                                    <div>
                                        <span className="font-semibold text-gray-600 dark:text-gray-400">
                                            Transactions:
                                        </span>
                                        <span className="ml-2 text-gray-900 dark:text-white">
                                            {ecosystem.totalTransactions}
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}

                        {ecosystem.createDateTime && (
                            <div className="text-gray-500 dark:text-gray-400">
                                Created: {new Date(ecosystem.createDateTime).toLocaleDateString()}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default EcosystemCard;
