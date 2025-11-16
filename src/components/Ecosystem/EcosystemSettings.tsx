import * as yup from 'yup';
import { Button, Card, Label } from 'flowbite-react';
import { Field, Form, Formik } from 'formik';
import type { FormikHelpers as FormikActions } from 'formik';
import { useEffect, useState } from 'react';
import type { AxiosResponse } from 'axios';

import { AlertComponent } from '../AlertComponent';
import CustomSpinner from '../CustomSpinner';
import { apiStatusCodes } from '../../config/CommonConstant';
import { getEcosystem, updateEcosystem } from '../../api/ecosystem';
import { getEcosystemPermissions } from '../../utils/ecosystemPermissions';
import { EcosystemStatus, BusinessModel } from '../../types/ecosystem';
import type { Ecosystem, UpdateEcosystemRequest } from '../../types/ecosystem';

interface EcosystemSettingsProps {
    ecosystemId: string;
}

interface GeneralFormValues {
    name: string;
    description: string;
    logoUrl: string;
    status: EcosystemStatus;
}

interface BusinessFormValues {
    businessModel: BusinessModel;
    membershipFee: number;
    transactionFee: number;
}

const EcosystemSettings = (props: EcosystemSettingsProps) => {
    const [loading, setLoading] = useState<boolean>(true);
    const [submitting, setSubmitting] = useState<boolean>(false);
    const [ecosystem, setEcosystem] = useState<Ecosystem | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const [canManageSettings, setCanManageSettings] = useState<boolean>(false);

    // Check permissions
    useEffect(() => {
        const checkPermissions = async () => {
            const permissions = await getEcosystemPermissions();
            setCanManageSettings(permissions.canManageSettings);
        };
        checkPermissions();
    }, []);

    // Fetch ecosystem data
    const fetchEcosystem = async () => {
        setLoading(true);
        setErrorMsg(null);

        try {
            const response = await getEcosystem(props.ecosystemId);
            const { data } = response as AxiosResponse;

            if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
                setEcosystem(data?.data);
            } else {
                setErrorMsg(data?.message || 'Failed to fetch ecosystem');
            }
        } catch (error) {
            const err = error as Error;
            setErrorMsg(err?.message || 'Failed to fetch ecosystem settings');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEcosystem();
    }, [props.ecosystemId]);

    const handleGeneralSubmit = async (
        values: GeneralFormValues,
        { setSubmitting: setFormSubmitting }: FormikActions<GeneralFormValues>
    ) => {
        setSubmitting(true);
        setErrorMsg(null);
        setSuccessMsg(null);

        try {
            const payload: UpdateEcosystemRequest = {
                name: values.name.trim(),
                description: values.description.trim() || undefined,
                logoUrl: values.logoUrl.trim() || undefined,
                status: values.status,
            };

            const response = await updateEcosystem(props.ecosystemId, payload);
            const { data } = response as AxiosResponse;

            if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
                setSuccessMsg(data?.message || 'General settings updated successfully');
                fetchEcosystem(); // Refresh data
            } else {
                setErrorMsg(data?.message || 'Failed to update general settings');
            }
        } catch (error) {
            const err = error as Error;
            setErrorMsg(err?.message || 'Failed to update general settings');
        } finally {
            setSubmitting(false);
            setFormSubmitting(false);
        }
    };

    const handleBusinessSubmit = async (
        values: BusinessFormValues,
        { setSubmitting: setFormSubmitting }: FormikActions<BusinessFormValues>
    ) => {
        setSubmitting(true);
        setErrorMsg(null);
        setSuccessMsg(null);

        try {
            const payload: UpdateEcosystemRequest = {
                businessModel: values.businessModel,
                membershipFee:
                    values.businessModel === BusinessModel.SUBSCRIPTION
                        ? values.membershipFee
                        : undefined,
                transactionFee:
                    values.businessModel === BusinessModel.TRANSACTION_FEE ||
                        values.businessModel === BusinessModel.HYBRID
                        ? values.transactionFee
                        : undefined,
            };

            const response = await updateEcosystem(props.ecosystemId, payload);
            const { data } = response as AxiosResponse;

            if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
                setSuccessMsg(data?.message || 'Business model settings updated successfully');
                fetchEcosystem(); // Refresh data
            } else {
                setErrorMsg(data?.message || 'Failed to update business model settings');
            }
        } catch (error) {
            const err = error as Error;
            setErrorMsg(err?.message || 'Failed to update business model settings');
        } finally {
            setSubmitting(false);
            setFormSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <CustomSpinner />
            </div>
        );
    }

    if (!ecosystem) {
        return (
            <div className="px-4 pt-2">
                <Card>
                    <div className="text-center py-8">
                        <p className="text-gray-500 dark:text-gray-400">
                            Ecosystem not found.
                        </p>
                    </div>
                </Card>
            </div>
        );
    }

    if (!canManageSettings) {
        return (
            <div className="px-4 pt-2">
                <Card>
                    <div className="text-center py-8">
                        <p className="text-gray-500 dark:text-gray-400">
                            You don't have permission to manage ecosystem settings.
                        </p>
                    </div>
                </Card>
            </div>
        );
    }

    const generalInitialData: GeneralFormValues = {
        name: ecosystem.name,
        description: ecosystem.description || '',
        logoUrl: ecosystem.logoUrl || '',
        status: ecosystem.status,
    };

    const businessInitialData: BusinessFormValues = {
        businessModel: ecosystem.businessModel,
        membershipFee: ecosystem.membershipFee || 0,
        transactionFee: ecosystem.transactionFee || 0,
    };

    return (
        <div className="px-4 pt-2">
            {/* Alert Messages */}
            <AlertComponent
                message={errorMsg}
                type="failure"
                onAlertClose={() => setErrorMsg(null)}
            />
            <AlertComponent
                message={successMsg}
                type="success"
                onAlertClose={() => setSuccessMsg(null)}
            />

            {/* Header */}
            <div className="mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Ecosystem Settings
                </h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Manage configuration and preferences for this ecosystem
                </p>
            </div>

            {/* General Settings Section */}
            <div className="mb-6">
                <Card>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        General Settings
                    </h3>

                    <Formik
                        initialValues={generalInitialData}
                        validationSchema={yup.object().shape({
                            name: yup
                                .string()
                                .required('Ecosystem name is required')
                                .min(3, 'Name must be at least 3 characters')
                                .max(100, 'Name must be 100 characters or less')
                                .trim(),
                            description: yup
                                .string()
                                .max(500, 'Description must be 500 characters or less')
                                .trim(),
                            logoUrl: yup
                                .string()
                                .url('Please enter a valid URL')
                                .trim(),
                            status: yup
                                .string()
                                .oneOf(
                                    [
                                        EcosystemStatus.ACTIVE,
                                        EcosystemStatus.INACTIVE,
                                        EcosystemStatus.SUSPENDED,
                                        EcosystemStatus.PENDING,
                                    ],
                                    'Please select a valid status'
                                )
                                .required('Status is required'),
                        })}
                        validateOnBlur
                        validateOnChange
                        enableReinitialize
                        onSubmit={handleGeneralSubmit}
                    >
                        {(formikHandlers): JSX.Element => (
                            <Form className="space-y-4" onSubmit={formikHandlers.handleSubmit}>
                                {/* Name Field */}
                                <div>
                                    <div className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                        <Label htmlFor="name" value="Ecosystem Name" />
                                        <span className="text-red-500 text-xs">*</span>
                                    </div>
                                    <Field
                                        id="name"
                                        name="name"
                                        type="text"
                                        placeholder="Enter ecosystem name"
                                        className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                                    />
                                    {formikHandlers?.errors?.name &&
                                        formikHandlers?.touched?.name ? (
                                        <span className="text-red-500 text-xs">
                                            {formikHandlers?.errors?.name}
                                        </span>
                                    ) : (
                                        <span className="text-red-500 text-xs invisible">Error</span>
                                    )}
                                </div>

                                {/* Description Field */}
                                <div>
                                    <div className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                        <Label htmlFor="description" value="Description" />
                                    </div>
                                    <Field
                                        as="textarea"
                                        id="description"
                                        name="description"
                                        rows={4}
                                        placeholder="Enter ecosystem description"
                                        className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                                    />
                                    {formikHandlers?.errors?.description &&
                                        formikHandlers?.touched?.description ? (
                                        <span className="text-red-500 text-xs">
                                            {formikHandlers?.errors?.description}
                                        </span>
                                    ) : (
                                        <span className="text-red-500 text-xs invisible">Error</span>
                                    )}
                                </div>

                                {/* Logo URL Field */}
                                <div>
                                    <div className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                        <Label htmlFor="logoUrl" value="Logo URL" />
                                    </div>
                                    <Field
                                        id="logoUrl"
                                        name="logoUrl"
                                        type="url"
                                        placeholder="https://example.com/logo.png"
                                        className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                                    />
                                    {formikHandlers?.errors?.logoUrl &&
                                        formikHandlers?.touched?.logoUrl ? (
                                        <span className="text-red-500 text-xs">
                                            {formikHandlers?.errors?.logoUrl}
                                        </span>
                                    ) : (
                                        <span className="text-red-500 text-xs invisible">Error</span>
                                    )}
                                </div>

                                {/* Status Field */}
                                <div>
                                    <div className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                        <Label htmlFor="status" value="Status" />
                                        <span className="text-red-500 text-xs">*</span>
                                    </div>
                                    <Field
                                        as="select"
                                        id="status"
                                        name="status"
                                        className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    >
                                        <option value={EcosystemStatus.ACTIVE}>Active</option>
                                        <option value={EcosystemStatus.INACTIVE}>Inactive</option>
                                        <option value={EcosystemStatus.SUSPENDED}>Suspended</option>
                                        <option value={EcosystemStatus.PENDING}>Pending</option>
                                    </Field>
                                    {formikHandlers?.errors?.status &&
                                        formikHandlers?.touched?.status ? (
                                        <span className="text-red-500 text-xs">
                                            {formikHandlers?.errors?.status}
                                        </span>
                                    ) : (
                                        <span className="text-red-500 text-xs invisible">Error</span>
                                    )}
                                </div>

                                {/* Action Buttons */}
                                <div className="flex justify-end pt-4">
                                    <Button
                                        type="submit"
                                        isProcessing={submitting}
                                        disabled={submitting || !formikHandlers.isValid}
                                        className="bg-primary-700 hover:bg-primary-800"
                                    >
                                        {submitting ? 'Saving...' : 'Save General Settings'}
                                    </Button>
                                </div>
                            </Form>
                        )}
                    </Formik>
                </Card>
            </div>

            {/* Business Model Settings Section */}
            <div className="mb-6">
                <Card>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Business Model & Fees
                    </h3>

                    <Formik
                        initialValues={businessInitialData}
                        validationSchema={yup.object().shape({
                            businessModel: yup
                                .string()
                                .oneOf(
                                    [
                                        BusinessModel.SUBSCRIPTION,
                                        BusinessModel.TRANSACTION_FEE,
                                        BusinessModel.HYBRID,
                                        BusinessModel.FREE,
                                    ],
                                    'Please select a valid business model'
                                )
                                .required('Business model is required'),
                            membershipFee: yup
                                .number()
                                .min(0, 'Fee must be 0 or greater')
                                .when('businessModel', {
                                    is: (val: string) => val === BusinessModel.SUBSCRIPTION || val === BusinessModel.HYBRID,
                                    then: (schema) => schema.required('Membership fee is required'),
                                }),
                            transactionFee: yup
                                .number()
                                .min(0, 'Fee must be 0 or greater')
                                .when('businessModel', {
                                    is: (val: string) => val === BusinessModel.TRANSACTION_FEE || val === BusinessModel.HYBRID,
                                    then: (schema) => schema.required('Transaction fee is required'),
                                }),
                        })}
                        validateOnBlur
                        validateOnChange
                        enableReinitialize
                        onSubmit={handleBusinessSubmit}
                    >
                        {(formikHandlers): JSX.Element => (
                            <Form className="space-y-4" onSubmit={formikHandlers.handleSubmit}>
                                {/* Business Model Field */}
                                <div>
                                    <div className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                        <Label htmlFor="businessModel" value="Business Model" />
                                        <span className="text-red-500 text-xs">*</span>
                                    </div>
                                    <Field
                                        as="select"
                                        id="businessModel"
                                        name="businessModel"
                                        className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    >
                                        <option value={BusinessModel.FREE}>Free</option>
                                        <option value={BusinessModel.SUBSCRIPTION}>
                                            Subscription Based
                                        </option>
                                        <option value={BusinessModel.TRANSACTION_FEE}>
                                            Transaction Fee Based
                                        </option>
                                        <option value={BusinessModel.HYBRID}>
                                            Hybrid (Subscription + Transaction)
                                        </option>
                                    </Field>
                                    {formikHandlers?.errors?.businessModel &&
                                        formikHandlers?.touched?.businessModel ? (
                                        <span className="text-red-500 text-xs">
                                            {formikHandlers?.errors?.businessModel}
                                        </span>
                                    ) : (
                                        <span className="text-red-500 text-xs invisible">Error</span>
                                    )}
                                </div>

                                {/* Subscription Fee (conditional) */}
                                {(formikHandlers.values.businessModel === BusinessModel.SUBSCRIPTION ||
                                    formikHandlers.values.businessModel === BusinessModel.HYBRID) && (
                                        <div>
                                            <div className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                                <Label htmlFor="membershipFee" value="Subscription Fee (USD)" />
                                                <span className="text-red-500 text-xs">*</span>
                                            </div>
                                            <Field
                                                id="membershipFee"
                                                name="membershipFee"
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                placeholder="0.00"
                                                className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                                            />
                                            {formikHandlers?.errors?.membershipFee &&
                                                formikHandlers?.touched?.membershipFee ? (
                                                <span className="text-red-500 text-xs">
                                                    {formikHandlers?.errors?.membershipFee}
                                                </span>
                                            ) : (
                                                <span className="text-red-500 text-xs invisible">Error</span>
                                            )}
                                        </div>
                                    )}

                                {/* Transaction Fee (conditional) */}
                                {(formikHandlers.values.businessModel === BusinessModel.TRANSACTION_FEE ||
                                    formikHandlers.values.businessModel === BusinessModel.HYBRID) && (
                                        <div>
                                            <div className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                                <Label
                                                    htmlFor="transactionFee"
                                                    value="Transaction Fee (USD per transaction)"
                                                />
                                                <span className="text-red-500 text-xs">*</span>
                                            </div>
                                            <Field
                                                id="transactionFee"
                                                name="transactionFee"
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                placeholder="0.00"
                                                className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                                            />
                                            {formikHandlers?.errors?.transactionFee &&
                                                formikHandlers?.touched?.transactionFee ? (
                                                <span className="text-red-500 text-xs">
                                                    {formikHandlers?.errors?.transactionFee}
                                                </span>
                                            ) : (
                                                <span className="text-red-500 text-xs invisible">Error</span>
                                            )}
                                        </div>
                                    )}

                                {/* Action Buttons */}
                                <div className="flex justify-end pt-4">
                                    <Button
                                        type="submit"
                                        isProcessing={submitting}
                                        disabled={submitting || !formikHandlers.isValid}
                                        className="bg-primary-700 hover:bg-primary-800"
                                    >
                                        {submitting ? 'Saving...' : 'Save Business Settings'}
                                    </Button>
                                </div>
                            </Form>
                        )}
                    </Formik>
                </Card>
            </div>
        </div>
    );
};

export default EcosystemSettings;
