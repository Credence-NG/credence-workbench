import * as yup from 'yup';
import { Button, Label, Modal, Table, Badge, Pagination } from 'flowbite-react';
import { Field, Form, Formik } from 'formik';
import type { FormikHelpers as FormikActions } from 'formik';
import { useEffect, useState } from 'react';
import type { AxiosResponse } from 'axios';

import { AlertComponent } from '../AlertComponent';
import CustomSpinner from '../CustomSpinner';
import SearchInput from '../SearchInput';
import { apiStatusCodes } from '../../config/CommonConstant';
import { addOrganization } from '../../api/ecosystem';
import { getOrganizations } from '../../api/organization';
import { MembershipType, RoleInEcosystem } from '../../types/ecosystem';
import type { AddOrganizationRequest } from '../../types/ecosystem';
import { HiPlus } from 'react-icons/hi';

interface AddOrganizationModalProps {
    ecosystemId: string;
    openModal: boolean;
    setOpenModal: (flag: boolean) => void;
    setMessage: (message: string) => void;
    onOrgAdded?: () => void;
}

interface Organization {
    id: string;
    name: string;
    description?: string;
    logo?: string;
}

interface FormValues {
    organizationId: string;
    roleInEcosystem: RoleInEcosystem;
    membershipType: MembershipType;
}

const AddOrganizationModal = (props: AddOrganizationModalProps) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [loadingOrgs, setLoadingOrgs] = useState<boolean>(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
    const [searchText, setSearchText] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const pageSize = 5;

    const initialFormData: FormValues = {
        organizationId: '',
        roleInEcosystem: RoleInEcosystem.BOTH,
        membershipType: MembershipType.MEMBER,
    };

    const validationSchema = yup.object().shape({
        organizationId: yup
            .string()
            .required('Please select an organization'),
        roleInEcosystem: yup
            .string()
            .oneOf(Object.values(RoleInEcosystem), 'Invalid role')
            .required('Role is required'),
        membershipType: yup
            .string()
            .oneOf(Object.values(MembershipType), 'Invalid membership type')
            .required('Membership type is required'),
    });

    useEffect(() => {
        if (!props.openModal) {
            setErrorMsg(null);
            setLoading(false);
            setSelectedOrg(null);
            setSearchText('');
            setCurrentPage(1);
        } else {
            fetchOrganizations();
        }
    }, [props.openModal]);

    useEffect(() => {
        if (props.openModal) {
            fetchOrganizations();
        }
    }, [currentPage, searchText]);

    const fetchOrganizations = async () => {
        setLoadingOrgs(true);
        setErrorMsg(null);

        try {
            const response = await getOrganizations(
                currentPage,
                pageSize,
                searchText,
                '' // role filter - empty means all
            ) as AxiosResponse;

            const { data } = response;

            if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
                const orgList = data?.data?.organizations || [];
                const totalItems = data?.data?.totalItems || 0;

                setOrganizations(orgList.map((org: any) => ({
                    id: org.id,
                    name: org.name,
                    description: org.description,
                    logo: org.logoUrl,
                })));

                setTotalPages(Math.ceil(totalItems / pageSize));
            } else {
                setErrorMsg(data?.message || 'Failed to fetch organizations');
            }
        } catch (error) {
            const err = error as Error;
            setErrorMsg(err?.message || 'Failed to fetch organizations');
        } finally {
            setLoadingOrgs(false);
        }
    };

    const handleSubmit = async (
        values: FormValues,
        { setSubmitting, resetForm }: FormikActions<FormValues>
    ) => {
        if (!selectedOrg) {
            setErrorMsg('Please select an organization');
            setSubmitting(false);
            return;
        }

        setLoading(true);
        setErrorMsg(null);

        try {
            const payload: AddOrganizationRequest = {
                orgId: values.organizationId,
                roleInEcosystem: values.roleInEcosystem,
                membershipType: values.membershipType,
                metadata: {
                    addedBy: 'dashboard',
                    addedAt: new Date().toISOString(),
                },
            };

            const response = await addOrganization(props.ecosystemId, payload);
            const { data } = response as AxiosResponse;

            if (data?.statusCode === apiStatusCodes.API_STATUS_CREATED || data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
                props.setMessage(data?.message || `${selectedOrg.name} added successfully as ${values.roleInEcosystem}`);
                resetForm();
                setSelectedOrg(null);
                props.setOpenModal(false);
                if (props.onOrgAdded) {
                    props.onOrgAdded();
                }
            } else {
                setErrorMsg(data?.message || 'Failed to add organization');
            }
        } catch (error) {
            const err = error as Error;
            setErrorMsg(err?.message || 'Failed to add organization');
        } finally {
            setLoading(false);
            setSubmitting(false);
        }
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchText(e.target.value);
        setCurrentPage(1); // Reset to first page on search
    };

    const handleOrgSelect = (org: Organization, setFieldValue: any) => {
        setSelectedOrg(org);
        setFieldValue('organizationId', org.id);
    };

    const getRoleLabel = (role: RoleInEcosystem) => {
        const labels: Record<RoleInEcosystem, string> = {
            [RoleInEcosystem.ISSUER]: 'Issuer Only',
            [RoleInEcosystem.VERIFIER]: 'Verifier Only',
            [RoleInEcosystem.BOTH]: 'Issuer & Verifier',
        };
        return labels[role];
    };

    const getMembershipTypeLabel = (type: MembershipType) => {
        const labels: Record<MembershipType, string> = {
            [MembershipType.MEMBER]: 'Member',
            [MembershipType.PARTNER]: 'Partner',
            [MembershipType.FOUNDING_MEMBER]: 'Founding Member',
        };
        return labels[type];
    };

    return (
        <Modal
            size="3xl"
            show={props.openModal}
            onClose={() => {
                if (!loading) {
                    props.setOpenModal(false);
                }
            }}
        >
            <Modal.Header>Add Organization to Ecosystem</Modal.Header>
            <Modal.Body>
                <AlertComponent
                    message={errorMsg}
                    type="failure"
                    onAlertClose={() => {
                        setErrorMsg(null);
                    }}
                />

                <Formik
                    initialValues={initialFormData}
                    validationSchema={validationSchema}
                    onSubmit={handleSubmit}
                    enableReinitialize
                >
                    {(formikHandlers) => (
                        <Form className="space-y-6">
                            {/* Search Organizations */}
                            <div>
                                <Label htmlFor="search" value="Search Organizations" />
                                <SearchInput
                                    onInputChange={handleSearchChange}
                                    value={searchText}
                                />
                            </div>

                            {/* Organization List */}
                            <div>
                                <Label value="Select Organization" className="mb-2 block required" />
                                {loadingOrgs ? (
                                    <div className="flex justify-center py-8">
                                        <CustomSpinner />
                                    </div>
                                ) : organizations.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                        No organizations found
                                    </div>
                                ) : (
                                    <>
                                        <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                                            <Table hoverable>
                                                <Table.Head>
                                                    <Table.HeadCell className="w-12">Select</Table.HeadCell>
                                                    <Table.HeadCell>Organization</Table.HeadCell>
                                                    <Table.HeadCell>Description</Table.HeadCell>
                                                </Table.Head>
                                                <Table.Body className="divide-y">
                                                    {organizations.map((org) => (
                                                        <Table.Row
                                                            key={org.id}
                                                            className={`cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 ${selectedOrg?.id === org.id ? 'bg-primary-50 dark:bg-primary-900' : ''
                                                                }`}
                                                            onClick={() => handleOrgSelect(org, formikHandlers.setFieldValue)}
                                                        >
                                                            <Table.Cell>
                                                                <input
                                                                    type="radio"
                                                                    name="selectedOrg"
                                                                    checked={selectedOrg?.id === org.id}
                                                                    onChange={() => handleOrgSelect(org, formikHandlers.setFieldValue)}
                                                                    className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                                                />
                                                            </Table.Cell>
                                                            <Table.Cell>
                                                                <div className="flex items-center gap-3">
                                                                    {org.logo && (
                                                                        <img
                                                                            src={org.logo}
                                                                            alt={org.name}
                                                                            className="h-8 w-8 rounded-full object-cover"
                                                                        />
                                                                    )}
                                                                    <span className="font-medium text-gray-900 dark:text-white">
                                                                        {org.name}
                                                                    </span>
                                                                </div>
                                                            </Table.Cell>
                                                            <Table.Cell>
                                                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                                                    {org.description || 'No description'}
                                                                </span>
                                                            </Table.Cell>
                                                        </Table.Row>
                                                    ))}
                                                </Table.Body>
                                            </Table>
                                        </div>

                                        {/* Pagination */}
                                        {totalPages > 1 && (
                                            <div className="flex justify-center mt-4">
                                                <Pagination
                                                    currentPage={currentPage}
                                                    totalPages={totalPages}
                                                    onPageChange={(page) => setCurrentPage(page)}
                                                    showIcons
                                                />
                                            </div>
                                        )}
                                    </>
                                )}
                                {formikHandlers.touched.organizationId && formikHandlers.errors.organizationId && (
                                    <span className="text-red-600 text-xs mt-1 block">
                                        {formikHandlers.errors.organizationId}
                                    </span>
                                )}
                            </div>

                            {/* Selected Organization Summary */}
                            {selectedOrg && (
                                <div className="p-4 bg-primary-50 dark:bg-primary-900 rounded-lg border border-primary-200 dark:border-primary-700">
                                    <div className="flex items-center gap-3">
                                        <HiPlus className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                Adding: <span className="font-bold">{selectedOrg.name}</span>
                                            </p>
                                            <p className="text-xs text-gray-600 dark:text-gray-400">
                                                {selectedOrg.description}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Role in Ecosystem Selection */}
                            <div>
                                <Label htmlFor="roleInEcosystem" value="Role in Ecosystem" className="required" />
                                <Field
                                    as="select"
                                    id="roleInEcosystem"
                                    name="roleInEcosystem"
                                    value={formikHandlers.values.roleInEcosystem}
                                    onChange={formikHandlers.handleChange}
                                    onBlur={formikHandlers.handleBlur}
                                    disabled={!selectedOrg}
                                    className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50"
                                >
                                    <option value={RoleInEcosystem.BOTH}>
                                        {getRoleLabel(RoleInEcosystem.BOTH)} - Can issue and verify credentials
                                    </option>
                                    <option value={RoleInEcosystem.ISSUER}>
                                        {getRoleLabel(RoleInEcosystem.ISSUER)} - Can only issue credentials
                                    </option>
                                    <option value={RoleInEcosystem.VERIFIER}>
                                        {getRoleLabel(RoleInEcosystem.VERIFIER)} - Can only verify credentials
                                    </option>
                                </Field>
                                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                    Select what operations this organization can perform in the ecosystem
                                </p>
                            </div>

                            {/* Membership Type Selection */}
                            <div>
                                <Label htmlFor="membershipType" value="Membership Level" className="required" />
                                <Field
                                    as="select"
                                    id="membershipType"
                                    name="membershipType"
                                    value={formikHandlers.values.membershipType}
                                    onChange={formikHandlers.handleChange}
                                    onBlur={formikHandlers.handleBlur}
                                    disabled={!selectedOrg}
                                    className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50"
                                >
                                    <option value={MembershipType.MEMBER}>
                                        {getMembershipTypeLabel(MembershipType.MEMBER)} - Standard membership
                                    </option>
                                    <option value={MembershipType.PARTNER}>
                                        {getMembershipTypeLabel(MembershipType.PARTNER)} - Partner organization
                                    </option>
                                    <option value={MembershipType.FOUNDING_MEMBER}>
                                        {getMembershipTypeLabel(MembershipType.FOUNDING_MEMBER)} - Founding member status
                                    </option>
                                </Field>
                                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                    Choose the membership level for this organization
                                </p>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-end gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <Button
                                    type="button"
                                    color="light"
                                    onClick={() => props.setOpenModal(false)}
                                    disabled={loading}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={loading || !selectedOrg || !formikHandlers.isValid}
                                >
                                    {loading ? (
                                        <>
                                            <CustomSpinner size="sm" />
                                            <span className="ml-2">Adding...</span>
                                        </>
                                    ) : (
                                        <>
                                            <HiPlus className="mr-2 h-5 w-5" />
                                            Add Organization
                                        </>
                                    )}
                                </Button>
                            </div>
                        </Form>
                    )}
                </Formik>
            </Modal.Body>
        </Modal>
    );
};

export default AddOrganizationModal;
