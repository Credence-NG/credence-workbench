'use client';

import { Button, Card, Pagination, Spinner } from 'flowbite-react';
import { ChangeEvent, useEffect, useState } from 'react';
import type { OrgRole, Organisation } from './interfaces'
import { getOrganizationInvitations, getOrganizations } from '../../api/organization';

import type { AxiosResponse } from 'axios';
import BreadCrumbs from '../BreadCrumbs';
import CreateOrgFormModal from "./CreateOrgFormModal";
import CustomAvatar from '../Avatar'
import type { Invitation } from './interfaces/invitations';
import SearchInput from '../SearchInput';
import { TextTittlecase } from '../../utils/TextTransform';
import { apiStatusCodes } from '../../config/CommonConstant';

const initialPageState = {
    pageNumber: 1,
    pageSize: 9,
    total: 0,
};


const Invitations = () => {
    const [openModal, setOpenModal] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false)
    const [message, setMessage] = useState<string>('')
    const [currentPage, setCurrentPage] = useState(initialPageState);
    const timestamp = Date.now();

    const onPageChange = (page: number) => {
        setCurrentPage({
            ...currentPage,
            pageNumber: page
        })
    };
    const [searchText, setSearchText] = useState("");

    const [invitationsList, setInvitationsList] = useState<Array<Invitation> | null>(null)
    const props = { openModal, setOpenModal };

    const createOrganizationModel = () => {
        props.setOpenModal(true)
    }

    //Fetch the user organization list
    const getAllInvitations = async () => {
        setLoading(true)
        const response = await getOrganizationInvitations(currentPage.pageNumber, currentPage.pageSize, searchText);
        const { data } = response as AxiosResponse

        if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {

            const totalPages = data?.data?.totalPages;

            const invitationList = data?.data?.invitations
            setInvitationsList(invitationList)
            setCurrentPage({
                ...currentPage,
                total: totalPages
            })
        } else {
            setMessage(response as string)
        }

        setLoading(false)
    }

    //This useEffect is called when the searchText changes 
    useEffect(() => {

        // let getData: string | number | NodeJS.Timeout | undefined;
        let getData: NodeJS.Timeout

        if (searchText.length >= 1) {
            getData = setTimeout(() => {
                getAllInvitations()

            }, 1000)
        } else {
            getAllInvitations()
        }

        return () => clearTimeout(getData)
    }, [searchText, openModal, currentPage.pageNumber])

    //onCHnage of Search input text
    const searchInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        setSearchText(e.target.value);
    }

    const redirectOrgDashboard = (orgId: number) => {
        localStorage.setItem('orgId', orgId.toString())
        window.location.href = '/organizations/dashboard'
    }


    return (
        <div className="px-4 pt-6">
            <div className="mb-4 col-span-full xl:mb-2">

                <BreadCrumbs />
                <h1 className="ml-1 text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white">
                    Invitations
                </h1>
            </div>
            <div>
                <div
                    className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2 dark:border-gray-700 sm:p-6 dark:bg-gray-800"
                >
                    <div className="flex items-center justify-between mb-4">
                        <SearchInput
                            onInputChange={searchInputChange}
                        />
                        <Button
                            className='text-base font-medium text-center text-white bg-primary-700 rounded-lg hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 sm:w-auto dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"'
                        >
                            Send Invitations
                        </Button>
                    </div>

                    <CreateOrgFormModal
                        openModal={props.openModal}
                        setOpenModal={
                            props.setOpenModal
                        } />
                    {loading
                        ? <div className="flex items-center justify-center mb-4">
                            <Spinner
                                color="info"
                            />
                        </div>
                        : <div className="mt-1 grid w-full grid-cols-1 gap-4 mt-0 mb-4 xl:grid-cols-2 2xl:grid-cols-3">
                            {
                                invitationsList && invitationsList.map((invitation) => (
                                    <Card className='transform transition duration-500 hover:scale-105 hover:bg-gray-50 cursor-pointer'>
                                       
                                        <div className='flex items-center'>
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="90px" height="70px">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                                            </svg>


                                            <div className='ml-4'>
                                                <h5 className="text-base font-medium tracking-tight text-gray-900 dark:text-white">
                                                    <p>
                                                        {invitation.email}
                                                    </p>
                                                </h5>
                                                <span className='mt-1 flex'>
                                                    Status:
                                                    {
                                                        invitation.status === 'pending'
                                                            ? <p className='ml-1 text-orange-500'>
                                                                {TextTittlecase(invitation.status)}
                                                            </p>
                                                            : invitation.status === 'accepted'
                                                                ? <p className='ml-1 text-green-500'>
                                                                    {TextTittlecase(invitation.status)}
                                                                </p>
                                                                : <p className='ml-1 text-red-500'>
                                                                    {TextTittlecase(invitation.status)}
                                                                </p>

                                                    }
                                                </span>

                                                <div className="flow-root h-auto">
                                                    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                                                        <li className="py-3 sm:py-4 overflow-auto">
                                                            <div className="items-center space-x-4">
                                                                <div className="inline-flex items-center text-base font-normal text-gray-900 dark:text-white">
                                                                    Roles:
                                                                    {invitation.orgRoles &&
                                                                        invitation.orgRoles.length > 0 &&
                                                                        invitation.orgRoles.map((role: OrgRole, index: number) => {
                                                                            return (
                                                                                <span
                                                                                    key={index}
                                                                                    className="m-1 bg-blue-100 text-blue-800 text-sm font-medium mr-2 px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300"
                                                                                >
                                                                                    {role.name.charAt(0).toUpperCase() + role.name.slice(1)}
                                                                                </span>
                                                                            );
                                                                        })}
                                                                </div>
                                                                <div className="flex items-end text-sm font-normal text-gray-500 dark:text-white fixed right-2 bottom-2">
                                                                    Created on: {invitation.createDateTime.split('T')[0]}
                                                                </div>

                                                            </div>
                                                        </li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                ))
                            }
                        </div>
                    }

                    <div className="flex items-center justify-end mb-4">

                        <Pagination
                            currentPage={currentPage.pageNumber}
                            onPageChange={onPageChange}
                            totalPages={currentPage.total}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Invitations;