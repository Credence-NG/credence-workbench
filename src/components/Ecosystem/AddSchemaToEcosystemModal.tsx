import * as yup from 'yup';
import { Button, Label, Modal, Table, Badge, Pagination, Select, TextInput } from 'flowbite-react';
import { Field, Form, Formik } from 'formik';
import type { FormikHelpers as FormikActions } from 'formik';
import { useEffect, useState } from 'react';
import type { AxiosResponse } from 'axios';

import { AlertComponent } from '../AlertComponent';
import CustomSpinner from '../CustomSpinner';
import SearchInput from '../SearchInput';
import { apiStatusCodes, storageKeys } from '../../config/CommonConstant';
import { addSchemaToEcosystem, updateSchemaPricing } from '../../api/ecosystem';
import { getAllSchemas } from '../../api/Schema';
import type { AddSchemaToEcosystemRequest, EcosystemSchema, UpdateSchemaPricingRequest } from '../../types/ecosystem';
import { HiPlus, HiDocumentText, HiInformationCircle, HiPencil } from 'react-icons/hi';
import { getFromLocalStorage } from '../../api/Auth';
import type { GetAllSchemaListParameter } from '../Resources/Schema/interfaces';
import {
    validateAddSchemaRequest,
    createStandardRevenueSplit,
    calculateRevenueDistribution,
    STANDARD_REVENUE_SPLIT,
    VALID_CURRENCIES,
} from '../../utils/ecosystemValidation';

interface AddSchemaToEcosystemModalProps {
    ecosystemId: string;
    openModal: boolean;
    setOpenModal: (flag: boolean) => void;
    setMessage: (message: string) => void;
    onSchemaAdded?: () => void;
    editingSchema?: EcosystemSchema | null; // For edit mode
}

interface SchemaAttribute {
    attributeName: string;
    schemaDataType: string;
    displayName: string;
    isRequired: boolean;
}

interface Schema {
    id: string;
    name: string;
    version: string;
    schemaLedgerId: string;
    attributes: SchemaAttribute[];
    createDateTime: string;
    orgId?: string;
    organizationName?: string;
}

// Updated form values with new pricing model
interface FormValues extends AddSchemaToEcosystemRequest {
    useStandardSplit: boolean; // UI helper field
}

const AddSchemaToEcosystemModal = (props: AddSchemaToEcosystemModalProps) => {
    const { editingSchema } = props;
    const isEditMode = !!editingSchema;

    const [loading, setLoading] = useState<boolean>(false);
    const [loadingSchemas, setLoadingSchemas] = useState<boolean>(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [schemas, setSchemas] = useState<Schema[]>([]);
    const [selectedSchema, setSelectedSchema] = useState<Schema | null>(null);
    const [searchText, setSearchText] = useState('');
    const [schemaType, setSchemaType] = useState<'indy' | 'w3c'>('indy');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [validationWarnings, setValidationWarnings] = useState<string[]>([]);
    const pageSize = 5;

    // Initial form with standard revenue split or editing data
    const getInitialFormData = (): FormValues => {
        if (isEditMode && editingSchema) {
            // Backend might still use old field name 'verificationVerifierShare', so we fallback to it
            const verificationIssuerShareValue = (editingSchema as any).verificationIssuerShare
                || (editingSchema as any).verificationVerifierShare;

            return {
                schemaLedgerId: editingSchema.schemaLedgerId,
                issuancePrice: Number(editingSchema.issuancePrice),
                verificationPrice: Number(editingSchema.verificationPrice),
                revocationPrice: Number(editingSchema.revocationPrice),
                currency: editingSchema.currency,
                useStandardSplit: false, // Assume custom split when editing
                issuancePlatformShare: Number(editingSchema.issuancePlatformShare),
                issuanceEcosystemShare: Number(editingSchema.issuanceEcosystemShare),
                issuanceIssuerShare: Number(editingSchema.issuanceIssuerShare),
                verificationPlatformShare: Number(editingSchema.verificationPlatformShare),
                verificationEcosystemShare: Number(editingSchema.verificationEcosystemShare),
                verificationIssuerShare: Number(verificationIssuerShareValue),
                revocationPlatformShare: Number(editingSchema.revocationPlatformShare),
                revocationEcosystemShare: Number(editingSchema.revocationEcosystemShare),
                revocationIssuerShare: Number(editingSchema.revocationIssuerShare),
            };
        }
        return {
            schemaLedgerId: '',
            issuancePrice: 10.00,
            verificationPrice: 5.00,
            revocationPrice: 2.00,
            currency: 'USD',
            useStandardSplit: true,
            ...createStandardRevenueSplit(),
        };
    };

    const [initialFormData, setInitialFormData] = useState<FormValues>(getInitialFormData());

    // Update form data when editingSchema changes
    useEffect(() => {
        if (editingSchema) {
            // Pre-populate form with editing schema data
            // Note: Backend might still use old field name 'verificationVerifierShare', so we fallback to it
            const verificationIssuerShareValue = (editingSchema as any).verificationIssuerShare
                || (editingSchema as any).verificationVerifierShare;

            setInitialFormData({
                schemaLedgerId: editingSchema.schemaLedgerId,
                issuancePrice: Number(editingSchema.issuancePrice),
                verificationPrice: Number(editingSchema.verificationPrice),
                revocationPrice: Number(editingSchema.revocationPrice),
                currency: editingSchema.currency,
                useStandardSplit: false,
                issuancePlatformShare: Number(editingSchema.issuancePlatformShare),
                issuanceEcosystemShare: Number(editingSchema.issuanceEcosystemShare),
                issuanceIssuerShare: Number(editingSchema.issuanceIssuerShare),
                verificationPlatformShare: Number(editingSchema.verificationPlatformShare),
                verificationEcosystemShare: Number(editingSchema.verificationEcosystemShare),
                verificationIssuerShare: Number(verificationIssuerShareValue),
                revocationPlatformShare: Number(editingSchema.revocationPlatformShare),
                revocationEcosystemShare: Number(editingSchema.revocationEcosystemShare),
                revocationIssuerShare: Number(editingSchema.revocationIssuerShare),
            });
        } else {
            // Reset to default values
            setInitialFormData({
                schemaLedgerId: '',
                issuancePrice: 10.00,
                verificationPrice: 5.00,
                revocationPrice: 2.00,
                currency: 'USD',
                useStandardSplit: true,
                ...createStandardRevenueSplit(),
            });
        }
    }, [editingSchema]);

    const validationSchema = yup.object().shape({
        schemaLedgerId: yup
            .string()
            .required('Please select a schema'),
            // Note: Removed DID format requirement to accept existing schema formats
            // TODO: Update when all schemas have proper DID-format schemaLedgerId values
        issuancePrice: yup
            .number()
            .min(0, 'Price cannot be negative')
            .required('Issuance price is required'),
        verificationPrice: yup
            .number()
            .min(0, 'Price cannot be negative')
            .required('Verification price is required'),
        revocationPrice: yup
            .number()
            .min(0, 'Price cannot be negative')
            .required('Revocation price is required'),
        currency: yup
            .string()
            .length(3, 'Currency must be 3 characters')
            .uppercase()
            .required('Currency is required'),
        // Revenue shares validation
        issuancePlatformShare: yup.number().min(0).max(100).required(),
        issuanceEcosystemShare: yup.number().min(0).max(100).required(),
        issuanceIssuerShare: yup.number().min(0).max(100).required(),
        verificationPlatformShare: yup.number().min(0).max(100).required(),
        verificationEcosystemShare: yup.number().min(0).max(100).required(),
        verificationIssuerShare: yup.number().min(0).max(100).required(),
        revocationPlatformShare: yup.number().min(0).max(100).required(),
        revocationEcosystemShare: yup.number().min(0).max(100).required(),
        revocationIssuerShare: yup.number().min(0).max(100).required(),
    });

    useEffect(() => {
        if (!props.openModal) {
            setErrorMsg(null);
            setLoading(false);
            setSelectedSchema(null);
            setSearchText('');
            setSchemaType('indy');
            setCurrentPage(1);
            setValidationWarnings([]);
        } else {
            fetchSchemas();
        }
    }, [props.openModal]);

    useEffect(() => {
        if (props.openModal) {
            fetchSchemas();
        }
    }, [currentPage, searchText, schemaType]);

    const fetchSchemas = async () => {
        setLoadingSchemas(true);
        setErrorMsg(null);

        try {
            const params: GetAllSchemaListParameter = {
                page: currentPage,
                itemPerPage: pageSize,
                allSearch: searchText || '',
            };

            const response = await getAllSchemas(params, schemaType) as AxiosResponse;
            const { data } = response;

            if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
                const schemaList = data?.data?.data || [];
                const totalItems = data?.data?.totalItems || 0;

                setSchemas(schemaList.map((schema: any) => ({
                    id: schema.id || schema.schemaId || '',
                    name: schema.name,
                    version: schema.version,
                    schemaLedgerId: schema.schemaLedgerId,
                    attributes: schema.attributes || [],
                    createDateTime: schema.createDateTime,
                    orgId: schema.orgId,
                    organizationName: schema.organizationName,
                })));

                setTotalPages(Math.ceil(totalItems / pageSize));
            } else {
                setErrorMsg(data?.message || 'Failed to fetch schemas');
            }
        } catch (error) {
            const err = error as Error;
            setErrorMsg(err?.message || 'Failed to fetch schemas');
        } finally {
            setLoadingSchemas(false);
        }
    };

    const handleSchemaSelect = (schema: Schema, setFieldValue: any) => {
        setSelectedSchema(schema);
        setFieldValue('schemaLedgerId', schema.schemaLedgerId);
    };

    const handleStandardSplitToggle = (checked: boolean, setFieldValue: any) => {
        setFieldValue('useStandardSplit', checked);
        if (checked) {
            const standardSplit = createStandardRevenueSplit();
            Object.entries(standardSplit).forEach(([key, value]) => {
                setFieldValue(key, value);
            });
        }
    };

    const calculateShareTotal = (platform: number | string, ecosystem: number | string, issuerOrVerifier: number | string): number => {
        const p = Number(platform) || 0;
        const e = Number(ecosystem) || 0;
        const i = Number(issuerOrVerifier) || 0;
        return p + e + i;
    };

    const handleSubmit = async (
        values: FormValues,
        actions: FormikActions<FormValues>
    ) => {
        setLoading(true);
        setErrorMsg(null);
        setValidationWarnings([]);

        try {
            // Remove UI helper field
            const { useStandardSplit, ...requestData } = values;

            // Validate using our validation utility
            const validation = validateAddSchemaRequest(requestData);

            if (!validation.valid) {
                setErrorMsg(validation.errors.join('; '));
                setLoading(false);
                actions.setSubmitting(false);
                return;
            }

            if (validation.warnings && validation.warnings.length > 0) {
                setValidationWarnings(validation.warnings);
            }

            console.log(`🚀 [${isEditMode ? 'Edit' : 'Add'}SchemaModal] Submitting schema with pricing:`, {
                ecosystemId: props.ecosystemId,
                schemaLedgerId: requestData.schemaLedgerId,
                isEditMode,
                pricing: {
                    issuance: requestData.issuancePrice,
                    verification: requestData.verificationPrice,
                    revocation: requestData.revocationPrice,
                },
                revenue: {
                    issuance: `${requestData.issuancePlatformShare}/${requestData.issuanceEcosystemShare}/${requestData.issuanceIssuerShare}`,
                    verification: `${requestData.verificationPlatformShare}/${requestData.verificationEcosystemShare}/${requestData.verificationIssuerShare}`,
                    revocation: `${requestData.revocationPlatformShare}/${requestData.revocationEcosystemShare}/${requestData.revocationIssuerShare}`,
                }
            });

            let response: AxiosResponse;

            if (isEditMode && editingSchema) {
                // Update existing schema pricing
                // Send both old and new field names for backward compatibility
                const updatePayload: any = {
                    issuancePrice: requestData.issuancePrice,
                    verificationPrice: requestData.verificationPrice,
                    revocationPrice: requestData.revocationPrice,
                    currency: requestData.currency,
                    issuancePlatformShare: requestData.issuancePlatformShare,
                    issuanceEcosystemShare: requestData.issuanceEcosystemShare,
                    issuanceIssuerShare: requestData.issuanceIssuerShare,
                    verificationPlatformShare: requestData.verificationPlatformShare,
                    verificationEcosystemShare: requestData.verificationEcosystemShare,
                    verificationIssuerShare: requestData.verificationIssuerShare,
                    verificationVerifierShare: requestData.verificationIssuerShare, // Backward compatibility
                    revocationPlatformShare: requestData.revocationPlatformShare,
                    revocationEcosystemShare: requestData.revocationEcosystemShare,
                    revocationIssuerShare: requestData.revocationIssuerShare,
                };
                response = await updateSchemaPricing(
                    props.ecosystemId,
                    editingSchema.id,
                    updatePayload
                ) as AxiosResponse;
            } else {
                // Add new schema
                response = await addSchemaToEcosystem(
                    props.ecosystemId,
                    requestData
                ) as AxiosResponse;
            }

            const { data } = response;

            const successStatusCode = isEditMode
                ? apiStatusCodes.API_STATUS_SUCCESS
                : apiStatusCodes.API_STATUS_CREATED;

            if (data?.statusCode === successStatusCode) {
                console.log(`✅ [${isEditMode ? 'Edit' : 'Add'}SchemaModal] Schema ${isEditMode ? 'updated' : 'added'} successfully`);
                props.setMessage(`Schema ${isEditMode ? 'updated' : 'added to ecosystem'} successfully!`);
                actions.resetForm();
                setSelectedSchema(null);
                setValidationWarnings([]);
                props.setOpenModal(false);
                if (props.onSchemaAdded) {
                    props.onSchemaAdded();
                }
            } else {
                setErrorMsg(data?.message || `Failed to ${isEditMode ? 'update' : 'add'} schema`);
            }
        } catch (error) {
            const err = error as any;
            const errorMessage = err?.response?.data?.message || err?.message || `Failed to ${isEditMode ? 'update' : 'add'} schema`;
            console.error(`❌ [${isEditMode ? 'Edit' : 'Add'}SchemaModal] Error:`, errorMessage);
            setErrorMsg(errorMessage);
        } finally {
            setLoading(false);
            actions.setSubmitting(false);
        }
    };

    return (
        <Modal
            show={props.openModal}
            onClose={() => props.setOpenModal(false)}
            size="6xl"
        >
            <Modal.Header>{isEditMode ? 'Edit Schema Pricing' : 'Add Schema to Ecosystem with Pricing'}</Modal.Header>
            <Modal.Body className="max-h-[80vh] overflow-y-auto">
                <Formik
                    initialValues={initialFormData}
                    validationSchema={validationSchema}
                    onSubmit={handleSubmit}
                    validateOnBlur
                    validateOnChange
                    enableReinitialize
                >
                    {({ errors, touched, setFieldValue, values }) => (
                        <Form>
                            <div className="space-y-6">
                                {errorMsg && (
                                    <AlertComponent
                                        message={errorMsg}
                                        type={'failure'}
                                        onAlertClose={() => setErrorMsg(null)}
                                    />
                                )}

                                {validationWarnings.length > 0 && (
                                    <div className="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
                                        <div className="flex items-start">
                                            <HiInformationCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 mr-2" />
                                            <div>
                                                <h4 className="text-sm font-semibold text-yellow-800 dark:text-yellow-200">Warnings:</h4>
                                                <ul className="text-xs text-yellow-700 dark:text-yellow-300 list-disc ml-4 mt-1">
                                                    {validationWarnings.map((warning, idx) => (
                                                        <li key={idx}>{warning}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Step 1: Select Schema or Show Selected */}
                                {isEditMode ? (
                                    <div>
                                        <h3 className="text-lg font-semibold mb-2">
                                            1. Selected Schema
                                        </h3>
                                        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                                            <div className="flex items-center gap-3">
                                                <HiDocumentText className="h-6 w-6 text-primary-600" />
                                                <div>
                                                    <div className="font-semibold text-gray-900 dark:text-white">
                                                        {(() => {
                                                            const parts = editingSchema?.schemaLedgerId?.split(':');
                                                            return parts && parts.length >= 3 ? parts[2] : 'Schema';
                                                        })()}
                                                    </div>
                                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                                        Version: {(() => {
                                                            const parts = editingSchema?.schemaLedgerId?.split(':');
                                                            return parts && parts.length >= 4 ? parts[3] : 'N/A';
                                                        })()}
                                                    </div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-500 font-mono mt-1">
                                                        {editingSchema?.schemaLedgerId?.substring(0, 50)}...
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <h3 className="text-lg font-semibold mb-2">
                                            1. Select Schema from Platform
                                        </h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                            Browse and select a schema to add to your ecosystem with pricing configuration.
                                        </p>

                                    {/* Search and Filter */}
                                    <div className="mb-4 flex gap-4">
                                        <div className="flex-1">
                                            <SearchInput
                                                onInputChange={(e) => {
                                                    setSearchText(e.target.value);
                                                    setCurrentPage(1);
                                                }}
                                                value={searchText}
                                            />
                                        </div>
                                        <div className="w-48">
                                            <Select
                                                value={schemaType}
                                                onChange={(e) => {
                                                    setSchemaType(e.target.value as 'indy' | 'w3c');
                                                    setCurrentPage(1);
                                                }}
                                            >
                                                <option value="indy">Indy Schemas</option>
                                                <option value="w3c">W3C Schemas</option>
                                            </Select>
                                        </div>
                                    </div>

                                    {/* Schema List */}
                                    {loadingSchemas ? (
                                        <div className="flex items-center justify-center py-8">
                                            <CustomSpinner />
                                        </div>
                                    ) : schemas.length > 0 ? (
                                        <>
                                            <div className="overflow-x-auto border rounded-lg">
                                                <Table>
                                                    <Table.Head>
                                                        <Table.HeadCell>Schema Name</Table.HeadCell>
                                                        <Table.HeadCell>Version</Table.HeadCell>
                                                        <Table.HeadCell>Organization</Table.HeadCell>
                                                        <Table.HeadCell>Attributes</Table.HeadCell>
                                                        <Table.HeadCell>Action</Table.HeadCell>
                                                    </Table.Head>
                                                    <Table.Body className="divide-y">
                                                        {schemas.map((schema, index) => (
                                                            <Table.Row
                                                                key={schema.schemaLedgerId || schema.id || index}
                                                                className={`bg-white dark:border-gray-700 dark:bg-gray-800 ${selectedSchema?.schemaLedgerId === schema.schemaLedgerId
                                                                    ? 'bg-blue-50 dark:bg-blue-900'
                                                                    : ''
                                                                    }`}
                                                            >
                                                                <Table.Cell className="font-medium">
                                                                    <div className="flex items-center gap-2">
                                                                        <HiDocumentText className="h-5 w-5 text-gray-400" />
                                                                        <div>
                                                                            <div>{schema.name}</div>
                                                                            <div className="text-xs text-gray-500 font-normal">
                                                                                {schema.schemaLedgerId
                                                                                    ? `${schema.schemaLedgerId.substring(0, 30)}...`
                                                                                    : 'N/A'}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </Table.Cell>
                                                                <Table.Cell>
                                                                    <Badge color="info">{schema.version}</Badge>
                                                                </Table.Cell>
                                                                <Table.Cell>
                                                                    {schema.organizationName || 'Unknown'}
                                                                </Table.Cell>
                                                                <Table.Cell>
                                                                    <Badge color="gray">
                                                                        {schema.attributes.length} attributes
                                                                    </Badge>
                                                                </Table.Cell>
                                                                <Table.Cell>
                                                                    <Button
                                                                        size="xs"
                                                                        color={selectedSchema?.schemaLedgerId === schema.schemaLedgerId ? 'success' : 'light'}
                                                                        onClick={() => handleSchemaSelect(schema, setFieldValue)}
                                                                    >
                                                                        {selectedSchema?.schemaLedgerId === schema.schemaLedgerId ? 'Selected' : 'Select'}
                                                                    </Button>
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
                                                        onPageChange={setCurrentPage}
                                                        showIcons
                                                    />
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <div className="text-center py-8 text-gray-500">
                                            <HiDocumentText className="mx-auto h-12 w-12 mb-2 opacity-50" />
                                            <p>No schemas found</p>
                                        </div>
                                    )}

                                    {errors.schemaLedgerId && touched.schemaLedgerId && (
                                        <p className="text-red-600 text-sm mt-2">{errors.schemaLedgerId}</p>
                                    )}
                                </div>
                                )}

                                {/* Step 2: Configure Pricing */}
                                {(selectedSchema || isEditMode) && (
                                    <>
                                        <div className="border-t pt-6">
                                            <h3 className="text-lg font-semibold mb-4">
                                                2. Configure Pricing
                                            </h3>

                                            {/* Selected Schema Info */}
                                            <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg mb-4">
                                                <p className="text-sm font-medium mb-1">Selected Schema:</p>
                                                {isEditMode && editingSchema ? (
                                                    <>
                                                        <p className="font-semibold">
                                                            {(() => {
                                                                const parts = editingSchema.schemaLedgerId?.split(':');
                                                                return parts && parts.length >= 3 ? parts[2] : 'Schema';
                                                            })()} v{(() => {
                                                                const parts = editingSchema.schemaLedgerId?.split(':');
                                                                return parts && parts.length >= 4 ? parts[3] : 'N/A';
                                                            })()}
                                                        </p>
                                                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                                            {editingSchema.schemaLedgerId}
                                                        </p>
                                                    </>
                                                ) : selectedSchema ? (
                                                    <>
                                                        <p className="font-semibold">
                                                            {selectedSchema.name} v{selectedSchema.version}
                                                        </p>
                                                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                                            {selectedSchema.schemaLedgerId}
                                                        </p>
                                                    </>
                                                ) : null}
                                            </div>

                                            {/* Pricing Fields */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                                <div>
                                                    <Label htmlFor="issuancePrice" value="Issuance Price *" />
                                                    <Field
                                                        as={TextInput}
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        id="issuancePrice"
                                                        name="issuancePrice"
                                                        placeholder="10.00"
                                                    />
                                                    {errors.issuancePrice && touched.issuancePrice && (
                                                        <p className="text-red-600 text-xs mt-1">{errors.issuancePrice}</p>
                                                    )}
                                                </div>

                                                <div>
                                                    <Label htmlFor="verificationPrice" value="Verification Price *" />
                                                    <Field
                                                        as={TextInput}
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        id="verificationPrice"
                                                        name="verificationPrice"
                                                        placeholder="5.00"
                                                    />
                                                    {errors.verificationPrice && touched.verificationPrice && (
                                                        <p className="text-red-600 text-xs mt-1">{errors.verificationPrice}</p>
                                                    )}
                                                </div>

                                                <div>
                                                    <Label htmlFor="revocationPrice" value="Revocation Price *" />
                                                    <Field
                                                        as={TextInput}
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        id="revocationPrice"
                                                        name="revocationPrice"
                                                        placeholder="2.00"
                                                    />
                                                    {errors.revocationPrice && touched.revocationPrice && (
                                                        <p className="text-red-600 text-xs mt-1">{errors.revocationPrice}</p>
                                                    )}
                                                </div>

                                                <div>
                                                    <Label htmlFor="currency" value="Currency *" />
                                                    <Field
                                                        as={Select}
                                                        id="currency"
                                                        name="currency"
                                                    >
                                                        {VALID_CURRENCIES.map(curr => (
                                                            <option key={curr} value={curr}>{curr}</option>
                                                        ))}
                                                    </Field>
                                                    {errors.currency && touched.currency && (
                                                        <p className="text-red-600 text-xs mt-1">{errors.currency}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Step 3: Revenue Sharing */}
                                        <div className="border-t pt-6">
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="text-lg font-semibold">
                                                    3. Revenue Sharing Configuration
                                                </h3>
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={values.useStandardSplit}
                                                        onChange={(e) => handleStandardSplitToggle(e.target.checked, setFieldValue)}
                                                        className="rounded text-blue-600"
                                                    />
                                                    <span className="text-sm font-medium">
                                                        Use Standard Split (10/5/85)
                                                    </span>
                                                </label>
                                            </div>

                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                                Configure how revenue is distributed between Platform, Ecosystem, and Issuers/Verifiers.
                                                Each operation must total exactly 100%.
                                            </p>

                                            {/* Issuance Revenue Split */}
                                            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                                <h4 className="font-semibold mb-3">Issuance Revenue Split</h4>
                                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                                    <div>
                                                        <Label value="Platform %" />
                                                        <Field
                                                            as={TextInput}
                                                            type="number"
                                                            min="0"
                                                            max="100"
                                                            name="issuancePlatformShare"
                                                            disabled={values.useStandardSplit}
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label value="Ecosystem %" />
                                                        <Field
                                                            as={TextInput}
                                                            type="number"
                                                            min="0"
                                                            max="100"
                                                            name="issuanceEcosystemShare"
                                                            disabled={values.useStandardSplit}
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label value="Issuer %" />
                                                        <Field
                                                            as={TextInput}
                                                            type="number"
                                                            min="0"
                                                            max="100"
                                                            name="issuanceIssuerShare"
                                                            disabled={values.useStandardSplit}
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label value="Total" />
                                                        <div className={`px-3 py-2 rounded-lg border ${calculateShareTotal(
                                                            values.issuancePlatformShare,
                                                            values.issuanceEcosystemShare,
                                                            values.issuanceIssuerShare
                                                        ) === 100
                                                            ? 'bg-green-50 border-green-500 text-green-700 dark:bg-green-900 dark:text-green-300'
                                                            : 'bg-red-50 border-red-500 text-red-700 dark:bg-red-900 dark:text-red-300'
                                                            }`}>
                                                            {calculateShareTotal(
                                                                values.issuancePlatformShare,
                                                                values.issuanceEcosystemShare,
                                                                values.issuanceIssuerShare
                                                            ).toFixed(0)}%
                                                        </div>
                                                    </div>
                                                </div>
                                                {/* Example calculation */}
                                                <div className="mt-3 text-xs text-gray-600 dark:text-gray-400">
                                                    Example: For a ${Number(values.issuancePrice) || 0} issuance →
                                                    Platform: ${((Number(values.issuancePrice) * Number(values.issuancePlatformShare)) / 100).toFixed(2)},
                                                    Ecosystem: ${((Number(values.issuancePrice) * Number(values.issuanceEcosystemShare)) / 100).toFixed(2)},
                                                    Issuer: ${((Number(values.issuancePrice) * Number(values.issuanceIssuerShare)) / 100).toFixed(2)}
                                                </div>
                                            </div>

                                            {/* Verification Revenue Split */}
                                            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                                <h4 className="font-semibold mb-3">Verification Revenue Split</h4>
                                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                                    <div>
                                                        <Label value="Platform %" />
                                                        <Field
                                                            as={TextInput}
                                                            type="number"
                                                            min="0"
                                                            max="100"
                                                            name="verificationPlatformShare"
                                                            disabled={values.useStandardSplit}
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label value="Ecosystem %" />
                                                        <Field
                                                            as={TextInput}
                                                            type="number"
                                                            min="0"
                                                            max="100"
                                                            name="verificationEcosystemShare"
                                                            disabled={values.useStandardSplit}
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label value="Issuer %" />
                                                        <Field
                                                            as={TextInput}
                                                            type="number"
                                                            min="0"
                                                            max="100"
                                                            name="verificationIssuerShare"
                                                            disabled={values.useStandardSplit}
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label value="Total" />
                                                        <div className={`px-3 py-2 rounded-lg border ${calculateShareTotal(
                                                            values.verificationPlatformShare,
                                                            values.verificationEcosystemShare,
                                                            values.verificationIssuerShare
                                                        ) === 100
                                                            ? 'bg-green-50 border-green-500 text-green-700 dark:bg-green-900 dark:text-green-300'
                                                            : 'bg-red-50 border-red-500 text-red-700 dark:bg-red-900 dark:text-red-300'
                                                            }`}>
                                                            {calculateShareTotal(
                                                                values.verificationPlatformShare,
                                                                values.verificationEcosystemShare,
                                                                values.verificationIssuerShare
                                                            ).toFixed(0)}%
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="mt-3 text-xs text-gray-600 dark:text-gray-400">
                                                    Example: For a ${Number(values.verificationPrice) || 0} verification →
                                                    Platform: ${((Number(values.verificationPrice) * Number(values.verificationPlatformShare)) / 100).toFixed(2)},
                                                    Ecosystem: ${((Number(values.verificationPrice) * Number(values.verificationEcosystemShare)) / 100).toFixed(2)},
                                                    Issuer: ${((Number(values.verificationPrice) * Number(values.verificationIssuerShare)) / 100).toFixed(2)}
                                                </div>
                                            </div>

                                            {/* Revocation Revenue Split */}
                                            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                                <h4 className="font-semibold mb-3">Revocation Revenue Split</h4>
                                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                                    <div>
                                                        <Label value="Platform %" />
                                                        <Field
                                                            as={TextInput}
                                                            type="number"
                                                            min="0"
                                                            max="100"
                                                            name="revocationPlatformShare"
                                                            disabled={values.useStandardSplit}
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label value="Ecosystem %" />
                                                        <Field
                                                            as={TextInput}
                                                            type="number"
                                                            min="0"
                                                            max="100"
                                                            name="revocationEcosystemShare"
                                                            disabled={values.useStandardSplit}
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label value="Issuer %" />
                                                        <Field
                                                            as={TextInput}
                                                            type="number"
                                                            min="0"
                                                            max="100"
                                                            name="revocationIssuerShare"
                                                            disabled={values.useStandardSplit}
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label value="Total" />
                                                        <div className={`px-3 py-2 rounded-lg border ${calculateShareTotal(
                                                            values.revocationPlatformShare,
                                                            values.revocationEcosystemShare,
                                                            values.revocationIssuerShare
                                                        ) === 100
                                                            ? 'bg-green-50 border-green-500 text-green-700 dark:bg-green-900 dark:text-green-300'
                                                            : 'bg-red-50 border-red-500 text-red-700 dark:bg-red-900 dark:text-red-300'
                                                            }`}>
                                                            {calculateShareTotal(
                                                                values.revocationPlatformShare,
                                                                values.revocationEcosystemShare,
                                                                values.revocationIssuerShare
                                                            ).toFixed(0)}%
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="mt-3 text-xs text-gray-600 dark:text-gray-400">
                                                    Example: For a ${Number(values.revocationPrice) || 0} revocation →
                                                    Platform: ${((Number(values.revocationPrice) * Number(values.revocationPlatformShare)) / 100).toFixed(2)},
                                                    Ecosystem: ${((Number(values.revocationPrice) * Number(values.revocationEcosystemShare)) / 100).toFixed(2)},
                                                    Issuer: ${((Number(values.revocationPrice) * Number(values.revocationIssuerShare)) / 100).toFixed(2)}
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Form Actions */}
                            <div className="flex justify-end gap-2 mt-6 pt-6 border-t">
                                <Button
                                    color="gray"
                                    onClick={() => props.setOpenModal(false)}
                                    disabled={loading}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={loading || (!selectedSchema && !isEditMode)}
                                >
                                    {loading ? (
                                        <>
                                            <CustomSpinner />
                                            <span className="ml-2">{isEditMode ? 'Updating...' : 'Adding Schema...'}</span>
                                        </>
                                    ) : isEditMode ? (
                                        <>
                                            <HiPencil className="mr-2 h-5 w-5" />
                                            Update Pricing
                                        </>
                                    ) : (
                                        <>
                                            <HiPlus className="mr-2 h-5 w-5" />
                                            Add Schema with Pricing
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

export default AddSchemaToEcosystemModal;
