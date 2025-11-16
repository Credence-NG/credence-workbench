import React, { useEffect, useState } from 'react';
import type { ChangeEvent } from 'react';
import { Card, Pagination, Button } from 'flowbite-react';
import type { AxiosResponse } from 'axios';
import { HiPlus } from 'react-icons/hi';

import { getEcosystems } from '../../api/ecosystem';
import type { Ecosystem, EcosystemListParams } from '../../types/ecosystem';
import { getEcosystemPermissions, type EcosystemPermissions } from '../../utils/ecosystemPermissions';
import { apiStatusCodes } from '../../config/CommonConstant';
import { pathRoutes } from '../../config/pathRoutes';

import BreadCrumbs from '../BreadCrumbs';
import SearchInput from '../SearchInput';
import CustomSpinner from '../CustomSpinner';
import { AlertComponent } from '../AlertComponent';
import { EmptyListMessage } from '../EmptyListComponent';
import EcosystemCard from './EcosystemCard';

const initialPageState = {
    pageNumber: 1,
    pageSize: 9,
    total: 100,
};

const EcosystemList = () => {
    const [loading, setLoading] = useState<boolean>(true);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [ecosystems, setEcosystems] = useState<Ecosystem[]>([]);
    const [currentPage, setCurrentPage] = useState(initialPageState);
    const [searchText, setSearchText] = useState('');
    const [permissions, setPermissions] = useState<EcosystemPermissions | null>(null);

    useEffect(() => {
        loadPermissions();
    }, []);

    useEffect(() => {
        if (permissions) {
            fetchEcosystems();
        }
    }, [currentPage.pageNumber, searchText, permissions]);

    const loadPermissions = async () => {
        try {
            const perms = await getEcosystemPermissions();
            setPermissions(perms);
        } catch (err) {
            console.error('Error loading permissions:', err);
            setError('Failed to load permissions');
        }
    };

    const fetchEcosystems = async () => {
        setLoading(true);
        setError(null);

        try {
            const params: EcosystemListParams = {
                page: currentPage.pageNumber,
                limit: currentPage.pageSize, // Backend expects "limit" not "pageSize"
                search: searchText || undefined,
            };

            const response = await getEcosystems(params) as AxiosResponse;
            const { data } = response;

            if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
                // API returns: { statusCode: 200, message: "", data: { ecosystems: [], totalCount, page, limit, totalPages } }
                const ecosystemData = data?.data?.ecosystems || [];
                const totalCount = data?.data?.totalCount || 0;
                const limit = data?.data?.limit || currentPage.pageSize;
                const totalPages = Math.ceil(totalCount / limit);

                setEcosystems(ecosystemData);
                setCurrentPage((prev) => ({
                    ...prev,
                    total: totalPages,
                }));
            } else {
                setError(data?.message || 'Failed to fetch ecosystems');
            }
        } catch (err: any) {
            const errorMessage = err?.message || 'An error occurred while fetching ecosystems';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const onPageChange = (page: number) => {
        setCurrentPage({
            ...currentPage,
            pageNumber: page,
        });
    };

    const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchText(value);
        setCurrentPage({
            ...currentPage,
            pageNumber: 1, // Reset to first page on search
        });
    };

    const handleCreateClick = () => {
        window.location.href = '/ecosystems/create';
    };

    const handleEcosystemClick = (ecosystemId: string) => {
        window.location.href = `/ecosystems/${ecosystemId}/dashboard`;
    };

    return (
        <div className="px-4 pt-2">
            <div className="mb-4 col-span-full xl:mb-2">
                <BreadCrumbs />

                <div className="flex justify-between items-center mt-4">
                    <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white">
                        Ecosystems
                    </h1>

                    {permissions?.canCreate && (
                        <Button
                            onClick={handleCreateClick}
                            className="bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700"
                        >
                            <HiPlus className="mr-2 h-5 w-5" />
                            Create Ecosystem
                        </Button>
                    )}
                </div>
            </div>

            {(error || message) && (
                <div className="mb-4">
                    <AlertComponent
                        message={error || message}
                        type={error ? 'failure' : 'success'}
                        onAlertClose={() => {
                            setError(null);
                            setMessage(null);
                        }}
                    />
                </div>
            )}

            <div className="mb-4">
                <SearchInput
                    onInputChange={handleSearch}
                    value={searchText}
                />
            </div>

            {loading ? (
                <div className="flex items-center justify-center mb-4">
                    <CustomSpinner />
                </div>
            ) : ecosystems && ecosystems.length > 0 ? (
                <>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 mb-4">
                        {ecosystems.map((ecosystem) => (
                            <EcosystemCard
                                key={ecosystem.id}
                                ecosystem={ecosystem}
                                permissions={permissions}
                                onClick={() => handleEcosystemClick(ecosystem.id)}
                                onUpdate={fetchEcosystems}
                            />
                        ))}
                    </div>

                    {currentPage.total > 1 && (
                        <div className="flex overflow-x-auto sm:justify-center">
                            <Pagination
                                currentPage={currentPage.pageNumber}
                                totalPages={currentPage.total}
                                onPageChange={onPageChange}
                                showIcons
                            />
                        </div>
                    )}
                </>
            ) : (
                <EmptyListMessage
                    message="No ecosystems found"
                    description={
                        searchText
                            ? 'Try adjusting your search to find ecosystems'
                            : permissions?.canCreate
                                ? 'Get started by creating your first ecosystem'
                                : 'No ecosystems are currently available'
                    }
                />
            )}
        </div>
    );
};

export default EcosystemList;
