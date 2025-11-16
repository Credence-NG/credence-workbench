import * as yup from 'yup';
import { Button, Card, Label, Table, Badge } from 'flowbite-react';
import { Field, Form, Formik } from 'formik';
import type { FormikHelpers as FormikActions } from 'formik';
import { useEffect, useState } from 'react';
import type { AxiosResponse } from 'axios';

import { AlertComponent } from '../AlertComponent';
import CustomSpinner from '../CustomSpinner';
import { apiStatusCodes } from '../../config/CommonConstant';
import { getPricing, setPricing, getEcosystemSchemas } from '../../api/ecosystem';
import type { CredentialPricing, SetPricingRequest, SchemaListParams } from '../../types/ecosystem';
import { getEcosystemPermissions } from '../../utils/ecosystemPermissions';

interface PricingManagerProps {
    ecosystemId: string;
}

interface FormValues {
    schemaId: string;
    issuancePrice: number;
    verificationPrice: number;
    revocationPrice: number;
    currency: string;
    platformShareIssuance: number;
    ecosystemShareIssuance: number;
    issuerShareIssuance: number;
    platformShareVerification: number;
    ecosystemShareVerification: number;
    issuerShareVerification: number;
}

const PricingManager = (props: PricingManagerProps) => {
    const [loading, setLoading] = useState<boolean>(true);
    const [submitting, setSubmitting] = useState<boolean>(false);
    const [pricingList, setPricingList] = useState<CredentialPricing[]>([]);
    const [ecosystemSchemas, setEcosystemSchemas] = useState<any[]>([]);
    const [loadingSchemas, setLoadingSchemas] = useState<boolean>(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const [showForm, setShowForm] = useState<boolean>(false);
    const [canSetPricing, setCanSetPricing] = useState<boolean>(false);

    const initialFormData: FormValues = {
        schemaId: '',
        issuancePrice: 0,
        verificationPrice: 0,
        revocationPrice: 0,
        currency: 'USD',
        platformShareIssuance: 10,
        ecosystemShareIssuance: 5,
        issuerShareIssuance: 85,
        platformShareVerification: 10,
        ecosystemShareVerification: 5,
        issuerShareVerification: 85,
    };

    // Fetch permissions
    useEffect(() => {
        const checkPermissions = async () => {
            const permissions = await getEcosystemPermissions();
            setCanSetPricing(permissions.canSetPricing);
        };
        checkPermissions();
    }, []);

    // Fetch ecosystem schemas for dropdown
    const fetchEcosystemSchemas = async () => {
        setLoadingSchemas(true);
        try {
            const params: SchemaListParams = {
                pageNumber: 1,
                pageSize: 100, // Get all schemas
                searchByText: '',
            };
            const response = await getEcosystemSchemas(props.ecosystemId, params) as AxiosResponse;
            const { data } = response;

            if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
                // Backend returns schemas inside data.schemas
                const schemaList = Array.isArray(data?.data?.schemas) ? data.data.schemas : [];
                setEcosystemSchemas(schemaList);
            }
        } catch (error) {
            console.error('Error fetching ecosystem schemas:', error);
        } finally {
            setLoadingSchemas(false);
        }
    };

    useEffect(() => {
        if (showForm) {
            fetchEcosystemSchemas();
        }
    }, [showForm, props.ecosystemId]);

    // Fetch pricing list
    const fetchPricing = async () => {
        setLoading(true);
        setErrorMsg(null);

        try {
            const response = await getPricing(props.ecosystemId);
            const { data } = response as AxiosResponse;

            if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
                // Backend returns schemas inside data.schemas
                const pricingArray = Array.isArray(data?.data?.schemas) ? data.data.schemas : [];
                setPricingList(pricingArray);
            } else {
                setErrorMsg(response as string);
            }
        } catch (error) {
            const err = error as Error;
            setErrorMsg(err?.message || 'Failed to fetch pricing');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPricing();
    }, [props.ecosystemId]);

    const handleSubmit = async (
        values: FormValues,
        { setSubmitting: setFormSubmitting, resetForm }: FormikActions<FormValues>
    ) => {
        setSubmitting(true);
        setErrorMsg(null);
        setSuccessMsg(null);

        try {
            const payload: SetPricingRequest = {
                schemaId: values.schemaId.trim(),
                issuancePrice: values.issuancePrice,
                verificationPrice: values.verificationPrice,
                revocationPrice: values.revocationPrice || undefined,
                currency: values.currency,
                issuanceRevenueSharing: {
                    platformShare: values.platformShareIssuance,
                    ecosystemShare: values.ecosystemShareIssuance,
                    issuerShare: values.issuerShareIssuance,
                },
                verificationRevenueSharing: {
                    platformShare: values.platformShareVerification,
                    ecosystemShare: values.ecosystemShareVerification,
                    issuerShare: values.issuerShareVerification,
                },
            };

            const response = await setPricing(props.ecosystemId, payload);
            const { data } = response as AxiosResponse;

            if (data?.statusCode === apiStatusCodes.API_STATUS_CREATED) {
                setSuccessMsg(data?.message || 'Pricing set successfully');
                resetForm();
                setShowForm(false);
                fetchPricing(); // Refresh the list
            } else {
                setErrorMsg(response as string);
            }
        } catch (error) {
            const err = error as Error;
            setErrorMsg(err?.message || 'Failed to set pricing');
        } finally {
            setSubmitting(false);
            setFormSubmitting(false);
        }
    };

    const formatCurrency = (amount: number, currency: string) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency || 'USD',
        }).format(amount);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <CustomSpinner />
            </div>
        );
    }

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
            <div className="mb-4 flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Schema Pricing
                    </h2>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Manage pricing for whitelisted schema-based credential operations in this ecosystem
                    </p>
                </div>
                {canSetPricing && !showForm && (
                    <Button
                        onClick={() => setShowForm(true)}
                        className="bg-primary-700 hover:bg-primary-800"
                    >
                        Add New Pricing
                    </Button>
                )}
            </div>

            {/* Add Pricing Form */}
            {showForm && canSetPricing && (
                <Card className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Set Schema Pricing
                    </h3>

                    <Formik
                        initialValues={initialFormData}
                        validationSchema={yup.object().shape({
                            schemaId: yup
                                .string()
                                .required('Schema ID is required')
                                .uuid('Schema ID must be a valid UUID')
                                .trim(),
                            issuancePrice: yup
                                .number()
                                .min(0, 'Price must be 0 or greater')
                                .required('Issuance price is required'),
                            verificationPrice: yup
                                .number()
                                .min(0, 'Price must be 0 or greater')
                                .required('Verification price is required'),
                            revocationPrice: yup
                                .number()
                                .min(0, 'Price must be 0 or greater')
                                .nullable(),
                            currency: yup
                                .string()
                                .required('Currency is required')
                                .length(3, 'Currency must be 3 characters')
                                .matches(/^[A-Z]{3}$/, 'Currency must be 3 uppercase letters')
                                .trim(),
                            platformShareIssuance: yup
                                .number()
                                .min(0, 'Share must be between 0 and 100')
                                .max(100, 'Share must be between 0 and 100')
                                .required('Platform share for issuance is required'),
                            ecosystemShareIssuance: yup
                                .number()
                                .min(0, 'Share must be between 0 and 100')
                                .max(100, 'Share must be between 0 and 100')
                                .required('Ecosystem share for issuance is required'),
                            issuerShareIssuance: yup
                                .number()
                                .min(0, 'Share must be between 0 and 100')
                                .max(100, 'Share must be between 0 and 100')
                                .required('Issuer share for issuance is required')
                                .test('total-100', 'Issuance shares must total 100%', function (value) {
                                    const { platformShareIssuance, ecosystemShareIssuance } = this.parent;
                                    return (platformShareIssuance + ecosystemShareIssuance + (value || 0)) === 100;
                                }),
                            platformShareVerification: yup
                                .number()
                                .min(0, 'Share must be between 0 and 100')
                                .max(100, 'Share must be between 0 and 100')
                                .required('Platform share for verification is required'),
                            ecosystemShareVerification: yup
                                .number()
                                .min(0, 'Share must be between 0 and 100')
                                .max(100, 'Share must be between 0 and 100')
                                .required('Ecosystem share for verification is required'),
                            issuerShareVerification: yup
                                .number()
                                .min(0, 'Share must be between 0 and 100')
                                .max(100, 'Share must be between 0 and 100')
                                .required('Issuer share for verification is required')
                                .test('total-100', 'Verification shares must total 100%', function (value) {
                                    const { platformShareVerification, ecosystemShareVerification } = this.parent;
                                    return (platformShareVerification + ecosystemShareVerification + (value || 0)) === 100;
                                }),
                        })}
                        validateOnBlur
                        validateOnChange
                        enableReinitialize
                        onSubmit={handleSubmit}
                    >
                        {(formikHandlers): JSX.Element => (
                            <Form className="space-y-4" onSubmit={formikHandlers.handleSubmit}>
                                {/* Schema ID */}
                                <div>
                                    <div className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                        <Label
                                            htmlFor="schemaId"
                                            value="Schema"
                                        />
                                        <span className="text-red-500 text-xs">*</span>
                                    </div>
                                    <Field
                                        as="select"
                                        id="schemaId"
                                        name="schemaId"
                                        className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                                        disabled={loadingSchemas}
                                    >
                                        <option value="">
                                            {loadingSchemas ? 'Loading schemas...' : 'Select a schema'}
                                        </option>
                                        {ecosystemSchemas.map((schema) => (
                                            <option
                                                key={schema.id}
                                                value={schema.schemaId}
                                            >
                                                {schema.schema?.name} v{schema.schema?.version} ({schema.governanceLevel})
                                            </option>
                                        ))}
                                    </Field>
                                    {formikHandlers?.errors?.schemaId &&
                                        formikHandlers?.touched?.schemaId ? (
                                        <span className="text-red-500 text-xs">
                                            {formikHandlers?.errors?.schemaId}
                                        </span>
                                    ) : (
                                        <span className="text-xs text-gray-500">
                                            Only whitelisted schemas from the Schemas tab can have pricing set
                                        </span>
                                    )}
                                </div>

                                {/* Pricing Fields Row */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {/* Issuance Price */}
                                    <div>
                                        <div className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                            <Label htmlFor="issuancePrice" value="Issuance Price" />
                                            <span className="text-red-500 text-xs">*</span>
                                        </div>
                                        <Field
                                            id="issuancePrice"
                                            name="issuancePrice"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            placeholder="0.00"
                                            className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                                        />
                                        {formikHandlers?.errors?.issuancePrice &&
                                            formikHandlers?.touched?.issuancePrice ? (
                                            <span className="text-red-500 text-xs">
                                                {formikHandlers?.errors?.issuancePrice}
                                            </span>
                                        ) : (
                                            <span className="text-red-500 text-xs invisible">Error</span>
                                        )}
                                    </div>

                                    {/* Verification Price */}
                                    <div>
                                        <div className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                            <Label
                                                htmlFor="verificationPrice"
                                                value="Verification Price"
                                            />
                                            <span className="text-red-500 text-xs">*</span>
                                        </div>
                                        <Field
                                            id="verificationPrice"
                                            name="verificationPrice"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            placeholder="0.00"
                                            className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                                        />
                                        {formikHandlers?.errors?.verificationPrice &&
                                            formikHandlers?.touched?.verificationPrice ? (
                                            <span className="text-red-500 text-xs">
                                                {formikHandlers?.errors?.verificationPrice}
                                            </span>
                                        ) : (
                                            <span className="text-red-500 text-xs invisible">Error</span>
                                        )}
                                    </div>

                                    {/* Revocation Price */}
                                    <div>
                                        <div className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                            <Label
                                                htmlFor="revocationPrice"
                                                value="Revocation Price (Optional)"
                                            />
                                        </div>
                                        <Field
                                            id="revocationPrice"
                                            name="revocationPrice"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            placeholder="0.00"
                                            className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                                        />
                                        {formikHandlers?.errors?.revocationPrice &&
                                            formikHandlers?.touched?.revocationPrice ? (
                                            <span className="text-red-500 text-xs">
                                                {formikHandlers?.errors?.revocationPrice}
                                            </span>
                                        ) : (
                                            <span className="text-red-500 text-xs invisible">Error</span>
                                        )}
                                    </div>
                                </div>

                                {/* Currency */}
                                <div className="max-w-xs">
                                    <div className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                        <Label htmlFor="currency" value="Currency" />
                                        <span className="text-red-500 text-xs">*</span>
                                    </div>
                                    <Field
                                        as="select"
                                        id="currency"
                                        name="currency"
                                        className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                                    >
                                        <option value="USD">USD - US Dollar</option>
                                        <option value="NGN">NGN - Nigerian Naira</option>
                                        <option value="CAD">CAD - Canadian Dollar</option>
                                    </Field>
                                    {formikHandlers?.errors?.currency &&
                                        formikHandlers?.touched?.currency ? (
                                        <span className="text-red-500 text-xs">
                                            {formikHandlers?.errors?.currency}
                                        </span>
                                    ) : (
                                        <span className="text-red-500 text-xs invisible">Error</span>
                                    )}
                                </div>

                                {/* Revenue Sharing Section */}
                                <div className="border-t pt-4 mt-4">
                                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
                                        Revenue Sharing Configuration
                                    </h4>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                                        Configure how revenue is split between platform, ecosystem, and issuers/verifiers (must total 100%)
                                    </p>

                                    {/* Issuance Revenue Sharing */}
                                    <div className="mb-6">
                                        <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                                            Issuance Revenue Sharing
                                        </h5>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            {/* Platform Share - Issuance */}
                                            <div>
                                                <div className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                                    <Label
                                                        htmlFor="platformShareIssuance"
                                                        value="Platform Share (%)"
                                                    />
                                                    <span className="text-red-500 text-xs">*</span>
                                                </div>
                                                <Field
                                                    id="platformShareIssuance"
                                                    name="platformShareIssuance"
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    placeholder="10"
                                                    className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                                                />
                                                {formikHandlers?.errors?.platformShareIssuance &&
                                                    formikHandlers?.touched?.platformShareIssuance && (
                                                        <span className="text-red-500 text-xs">
                                                            {formikHandlers?.errors?.platformShareIssuance}
                                                        </span>
                                                    )}
                                            </div>

                                            {/* Ecosystem Share - Issuance */}
                                            <div>
                                                <div className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                                    <Label
                                                        htmlFor="ecosystemShareIssuance"
                                                        value="Ecosystem Share (%)"
                                                    />
                                                    <span className="text-red-500 text-xs">*</span>
                                                </div>
                                                <Field
                                                    id="ecosystemShareIssuance"
                                                    name="ecosystemShareIssuance"
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    placeholder="5"
                                                    className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                                                />
                                                {formikHandlers?.errors?.ecosystemShareIssuance &&
                                                    formikHandlers?.touched?.ecosystemShareIssuance && (
                                                        <span className="text-red-500 text-xs">
                                                            {formikHandlers?.errors?.ecosystemShareIssuance}
                                                        </span>
                                                    )}
                                            </div>

                                            {/* Issuer Share */}
                                            <div>
                                                <div className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                                    <Label
                                                        htmlFor="issuerShareIssuance"
                                                        value="Issuer Share (%)"
                                                    />
                                                    <span className="text-red-500 text-xs">*</span>
                                                </div>
                                                <Field
                                                    id="issuerShareIssuance"
                                                    name="issuerShareIssuance"
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    placeholder="85"
                                                    className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                                                />
                                                {formikHandlers?.errors?.issuerShareIssuance &&
                                                    formikHandlers?.touched?.issuerShareIssuance ? (
                                                    <span className="text-red-500 text-xs">
                                                        {formikHandlers?.errors?.issuerShareIssuance}
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-gray-500">
                                                        Total: {(formikHandlers.values.platformShareIssuance || 0) +
                                                            (formikHandlers.values.ecosystemShareIssuance || 0) +
                                                            (formikHandlers.values.issuerShareIssuance || 0)}%
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Verification Revenue Sharing */}
                                    <div>
                                        <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                                            Verification Revenue Sharing
                                        </h5>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            {/* Platform Share - Verification */}
                                            <div>
                                                <div className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                                    <Label
                                                        htmlFor="platformShareVerification"
                                                        value="Platform Share (%)"
                                                    />
                                                    <span className="text-red-500 text-xs">*</span>
                                                </div>
                                                <Field
                                                    id="platformShareVerification"
                                                    name="platformShareVerification"
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    placeholder="10"
                                                    className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                                                />
                                                {formikHandlers?.errors?.platformShareVerification &&
                                                    formikHandlers?.touched?.platformShareVerification && (
                                                        <span className="text-red-500 text-xs">
                                                            {formikHandlers?.errors?.platformShareVerification}
                                                        </span>
                                                    )}
                                            </div>

                                            {/* Ecosystem Share - Verification */}
                                            <div>
                                                <div className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                                    <Label
                                                        htmlFor="ecosystemShareVerification"
                                                        value="Ecosystem Share (%)"
                                                    />
                                                    <span className="text-red-500 text-xs">*</span>
                                                </div>
                                                <Field
                                                    id="ecosystemShareVerification"
                                                    name="ecosystemShareVerification"
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    placeholder="5"
                                                    className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                                                />
                                                {formikHandlers?.errors?.ecosystemShareVerification &&
                                                    formikHandlers?.touched?.ecosystemShareVerification && (
                                                        <span className="text-red-500 text-xs">
                                                            {formikHandlers?.errors?.ecosystemShareVerification}
                                                        </span>
                                                    )}
                                            </div>

                                            {/* Issuer Share (Verification) */}
                                            <div>
                                                <div className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                                    <Label
                                                        htmlFor="issuerShareVerification"
                                                        value="Issuer Share (%)"
                                                    />
                                                    <span className="text-red-500 text-xs">*</span>
                                                </div>
                                                <Field
                                                    id="issuerShareVerification"
                                                    name="issuerShareVerification"
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    placeholder="85"
                                                    className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                                                />
                                                {formikHandlers?.errors?.issuerShareVerification &&
                                                    formikHandlers?.touched?.issuerShareVerification ? (
                                                    <span className="text-red-500 text-xs">
                                                        {formikHandlers?.errors?.issuerShareVerification}
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-gray-500">
                                                        Total: {(formikHandlers.values.platformShareVerification || 0) +
                                                            (formikHandlers.values.ecosystemShareVerification || 0) +
                                                            (formikHandlers.values.issuerShareVerification || 0)}%
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex justify-end gap-3 pt-4">
                                    <Button
                                        color="gray"
                                        onClick={() => setShowForm(false)}
                                        disabled={submitting}
                                        type="button"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        isProcessing={submitting}
                                        disabled={submitting || !formikHandlers.isValid}
                                        className="bg-primary-700 hover:bg-primary-800"
                                    >
                                        {submitting ? 'Setting...' : 'Set Pricing'}
                                    </Button>
                                </div>
                            </Form>
                        )}
                    </Formik>
                </Card>
            )}

            {/* Pricing List */}
            {pricingList.length === 0 ? (
                <Card>
                    <div className="text-center py-8">
                        <p className="text-gray-500 dark:text-gray-400">
                            No pricing configured yet.
                        </p>
                        {canSetPricing && !showForm && (
                            <Button
                                onClick={() => setShowForm(true)}
                                className="mt-4 bg-primary-700 hover:bg-primary-800"
                            >
                                Add First Pricing
                            </Button>
                        )}
                    </div>
                </Card>
            ) : (
                <Card>
                    <div className="overflow-x-auto">
                        <Table>
                            <Table.Head>
                                <Table.HeadCell>Schema</Table.HeadCell>
                                <Table.HeadCell>Issuance</Table.HeadCell>
                                <Table.HeadCell>Verification</Table.HeadCell>
                                <Table.HeadCell>Revocation</Table.HeadCell>
                                <Table.HeadCell>Currency</Table.HeadCell>
                                <Table.HeadCell>Last Updated</Table.HeadCell>
                            </Table.Head>
                            <Table.Body className="divide-y">
                                {pricingList.map((pricing) => (
                                    <Table.Row
                                        key={pricing.id}
                                        className="bg-white dark:border-gray-700 dark:bg-gray-800"
                                    >
                                        <Table.Cell className="font-medium text-gray-900 dark:text-white">
                                            <div>
                                                <div className="font-semibold">
                                                    {(() => {
                                                        // Try nested schema object first (if backend populates it)
                                                        if (pricing.schema?.name) {
                                                            return pricing.schema.name;
                                                        }
                                                        // Otherwise parse from schemaLedgerId (Indy format: did:2:name:version)
                                                        const parts = pricing.schemaLedgerId?.split(':');
                                                        return parts && parts.length >= 3 ? parts[2] : 'Unknown Schema';
                                                    })()}
                                                </div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                    {(() => {
                                                        // Try nested schema object first
                                                        if (pricing.schema?.version) {
                                                            return `v${pricing.schema.version}`;
                                                        }
                                                        // Otherwise parse from schemaLedgerId (Indy format: did:2:name:version)
                                                        const parts = pricing.schemaLedgerId?.split(':');
                                                        return parts && parts.length >= 4 ? `v${parts[3]}` : '';
                                                    })()}
                                                </div>
                                                <div className="text-xs text-gray-400 dark:text-gray-500 truncate max-w-xs">
                                                    {pricing.schemaLedgerId?.substring(0, 40)}...
                                                </div>
                                            </div>
                                        </Table.Cell>
                                        <Table.Cell>
                                            <Badge color="success">
                                                {formatCurrency(pricing.issuancePrice, pricing.currency)}
                                            </Badge>
                                        </Table.Cell>
                                        <Table.Cell>
                                            <Badge color="info">
                                                {formatCurrency(
                                                    pricing.verificationPrice,
                                                    pricing.currency
                                                )}
                                            </Badge>
                                        </Table.Cell>
                                        <Table.Cell>
                                            {pricing.revocationPrice !== null &&
                                                pricing.revocationPrice !== undefined ? (
                                                <Badge color="warning">
                                                    {formatCurrency(
                                                        pricing.revocationPrice,
                                                        pricing.currency
                                                    )}
                                                </Badge>
                                            ) : (
                                                <span className="text-gray-400 dark:text-gray-500">
                                                    N/A
                                                </span>
                                            )}
                                        </Table.Cell>
                                        <Table.Cell>
                                            <span className="font-mono text-sm">
                                                {pricing.currency}
                                            </span>
                                        </Table.Cell>
                                        <Table.Cell>
                                            {pricing.lastChangedDateTime
                                                ? new Date(pricing.lastChangedDateTime).toLocaleDateString()
                                                : 'N/A'}
                                        </Table.Cell>
                                    </Table.Row>
                                ))}
                            </Table.Body>
                        </Table>
                    </div>
                </Card>
            )}
        </div>
    );
};

export default PricingManager;
