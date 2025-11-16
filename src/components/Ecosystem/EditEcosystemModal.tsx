import { useEffect, useState } from 'react';
import * as yup from 'yup';
import { Button, Label, Modal, Textarea } from 'flowbite-react';
import { Field, Form, Formik } from 'formik';
import type { FormikHelpers } from 'formik';
import type { AxiosResponse } from 'axios';
import { apiStatusCodes } from '../../config/CommonConstant';
import { AlertComponent } from '../AlertComponent';
import CustomSpinner from '../CustomSpinner';
import FormikErrorMessage from '../../commonComponents/formikerror/index';
import { updateEcosystem } from '../../api/ecosystem';
import type { UpdateEcosystemRequest, Ecosystem } from '../../types/ecosystem';
import { BusinessModel, EcosystemStatus } from '../../types/ecosystem';

interface EditEcosystemModalProps {
    openModal: boolean;
    setOpenModal: (open: boolean) => void;
    ecosystemData: Ecosystem | null;
    onEditSuccess?: () => void;
    setMessage?: (message: string) => void;
}

interface FormValues {
    name: string;
    description: string;
    logoUrl: string;
    status: EcosystemStatus;
    businessModel: BusinessModel;
    membershipFee: number | undefined;
    transactionFee: number | undefined;
}

const EditEcosystemModal = ({
    openModal,
    setOpenModal,
    ecosystemData,
    onEditSuccess,
    setMessage,
}: EditEcosystemModalProps) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [initialEcosystemData, setInitialEcosystemData] = useState<FormValues>({
        name: '',
        description: '',
        logoUrl: '',
        status: EcosystemStatus.ACTIVE,
        businessModel: BusinessModel.TRANSACTION_FEE,
        membershipFee: undefined,
        transactionFee: undefined,
    });

    useEffect(() => {
        if (openModal && ecosystemData) {
            setInitialEcosystemData({
                name: ecosystemData.name ?? '',
                description: ecosystemData.description ?? '',
                logoUrl: ecosystemData.logoUrl ?? '',
                status: ecosystemData.status ?? EcosystemStatus.ACTIVE,
                businessModel: ecosystemData.businessModel ?? BusinessModel.TRANSACTION_FEE,
                membershipFee: ecosystemData.membershipFee,
                transactionFee: ecosystemData.transactionFee,
            });
        }
    }, [ecosystemData, openModal]);

    useEffect(() => {
        if (!openModal) {
            setInitialEcosystemData({
                name: '',
                description: '',
                logoUrl: '',
                status: EcosystemStatus.ACTIVE,
                businessModel: BusinessModel.TRANSACTION_FEE,
                membershipFee: undefined,
                transactionFee: undefined,
            });
            setErrorMsg(null);
        }
    }, [openModal]);

    const validationSchema = yup.object().shape({
        name: yup
            .string()
            .min(2, 'Ecosystem name must be at least 2 characters')
            .max(100, 'Ecosystem name must be at most 100 characters')
            .required('Ecosystem name is required')
            .trim(),
        description: yup
            .string()
            .max(500, 'Description must be at most 500 characters'),
        logoUrl: yup
            .string()
            .url('Must be a valid URL'),
        status: yup
            .string()
            .oneOf(Object.values(EcosystemStatus), 'Invalid status')
            .required('Status is required'),
        businessModel: yup
            .string()
            .oneOf(Object.values(BusinessModel), 'Invalid business model')
            .required('Business model is required'),
        membershipFee: yup
            .number()
            .min(0, 'Membership fee cannot be negative')
            .nullable(),
        transactionFee: yup
            .number()
            .min(0, 'Transaction fee cannot be negative')
            .max(100, 'Transaction fee cannot exceed 100%')
            .nullable(),
    });

    const submitUpdateEcosystem = async (values: FormValues) => {
        setLoading(true);
        setErrorMsg(null);

        const payload: UpdateEcosystemRequest = {
            name: values.name,
            description: values.description || undefined,
            logoUrl: values.logoUrl || undefined,
            status: values.status,
            businessModel: values.businessModel,
            membershipFee: values.membershipFee || undefined,
            transactionFee: values.transactionFee || undefined,
        };

        try {
            const response = await updateEcosystem(
                ecosystemData?.id as string,
                payload
            ) as AxiosResponse;

            const { data } = response;

            if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
                if (onEditSuccess) {
                    onEditSuccess();
                }
                if (setMessage) {
                    setMessage(data?.message || 'Ecosystem updated successfully');
                }
                setOpenModal(false);
            } else {
                setErrorMsg(data?.message || 'Failed to update ecosystem');
            }
        } catch (error: any) {
            const errorMessage = error?.message || 'An error occurred while updating the ecosystem';
            setErrorMsg(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            show={openModal}
            onClose={() => {
                setInitialEcosystemData({
                    name: ecosystemData?.name ?? '',
                    description: ecosystemData?.description ?? '',
                    logoUrl: ecosystemData?.logoUrl ?? '',
                    status: ecosystemData?.status ?? EcosystemStatus.ACTIVE,
                    businessModel: ecosystemData?.businessModel ?? BusinessModel.TRANSACTION_FEE,
                    membershipFee: ecosystemData?.membershipFee,
                    transactionFee: ecosystemData?.transactionFee,
                });
                setOpenModal(false);
                setErrorMsg(null);
            }}
        >
            <Modal.Header>Edit Ecosystem</Modal.Header>
            <Modal.Body>
                <AlertComponent
                    message={errorMsg}
                    type={'failure'}
                    onAlertClose={() => {
                        setErrorMsg(null);
                    }}
                />

                <Formik
                    initialValues={initialEcosystemData}
                    validationSchema={validationSchema}
                    validateOnBlur
                    validateOnChange
                    enableReinitialize
                    onSubmit={async (
                        values: FormValues,
                        { resetForm }: FormikHelpers<FormValues>
                    ) => {
                        submitUpdateEcosystem(values);
                    }}
                >
                    {(formikHandlers): JSX.Element => (
                        <Form className="space-y-6" onSubmit={formikHandlers.handleSubmit}>
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
                                    value={formikHandlers.values.name || ''}
                                    onChange={formikHandlers.handleChange}
                                    onBlur={formikHandlers.handleBlur}
                                    className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                                />
                                <FormikErrorMessage
                                    error={formikHandlers?.errors?.name}
                                    touched={formikHandlers?.touched?.name}
                                />
                            </div>

                            {/* Description Field */}
                            <div>
                                <Label htmlFor="description" value="Description" />
                                <Field name="description">
                                    {({ field }: any) => (
                                        <Textarea
                                            {...field}
                                            id="description"
                                            placeholder="Enter ecosystem description"
                                            rows={4}
                                            value={formikHandlers.values.description || ''}
                                            onChange={formikHandlers.handleChange}
                                            onBlur={formikHandlers.handleBlur}
                                        />
                                    )}
                                </Field>
                                <FormikErrorMessage
                                    error={formikHandlers?.errors?.description}
                                    touched={formikHandlers?.touched?.description}
                                />
                            </div>

                            {/* Logo URL Field */}
                            <div>
                                <Label htmlFor="logoUrl" value="Logo URL" />
                                <Field
                                    id="logoUrl"
                                    name="logoUrl"
                                    type="url"
                                    placeholder="https://example.com/logo.png"
                                    value={formikHandlers.values.logoUrl || ''}
                                    onChange={formikHandlers.handleChange}
                                    onBlur={formikHandlers.handleBlur}
                                    className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                                />
                                <FormikErrorMessage
                                    error={formikHandlers?.errors?.logoUrl}
                                    touched={formikHandlers?.touched?.logoUrl}
                                />
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
                                    value={formikHandlers.values.status}
                                    onChange={formikHandlers.handleChange}
                                    onBlur={formikHandlers.handleBlur}
                                    className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                >
                                    <option value={EcosystemStatus.ACTIVE}>Active</option>
                                    <option value={EcosystemStatus.INACTIVE}>Inactive</option>
                                    <option value={EcosystemStatus.SUSPENDED}>Suspended</option>
                                    <option value={EcosystemStatus.PENDING}>Pending</option>
                                </Field>
                                <FormikErrorMessage
                                    error={formikHandlers?.errors?.status}
                                    touched={formikHandlers?.touched?.status}
                                />
                            </div>

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
                                    value={formikHandlers.values.businessModel}
                                    onChange={formikHandlers.handleChange}
                                    onBlur={formikHandlers.handleBlur}
                                    className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                >
                                    <option value={BusinessModel.TRANSACTION_FEE}>Transaction Fee</option>
                                    <option value={BusinessModel.SUBSCRIPTION}>Subscription</option>
                                    <option value={BusinessModel.HYBRID}>Hybrid</option>
                                    <option value={BusinessModel.FREE}>Free</option>
                                </Field>
                                <FormikErrorMessage
                                    error={formikHandlers?.errors?.businessModel}
                                    touched={formikHandlers?.touched?.businessModel}
                                />
                            </div>

                            {/* Membership Fee Field */}
                            {(formikHandlers.values.businessModel === BusinessModel.SUBSCRIPTION ||
                                formikHandlers.values.businessModel === BusinessModel.HYBRID) && (
                                    <div>
                                        <Label htmlFor="membershipFee" value="Membership Fee (USD)" />
                                        <Field
                                            id="membershipFee"
                                            name="membershipFee"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            placeholder="0.00"
                                            value={formikHandlers.values.membershipFee || ''}
                                            onChange={formikHandlers.handleChange}
                                            onBlur={formikHandlers.handleBlur}
                                            className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                                        />
                                        <FormikErrorMessage
                                            error={formikHandlers?.errors?.membershipFee}
                                            touched={formikHandlers?.touched?.membershipFee}
                                        />
                                    </div>
                                )}

                            {/* Transaction Fee Field */}
                            {(formikHandlers.values.businessModel === BusinessModel.TRANSACTION_FEE ||
                                formikHandlers.values.businessModel === BusinessModel.HYBRID) && (
                                    <div>
                                        <Label htmlFor="transactionFee" value="Transaction Fee (%)" />
                                        <Field
                                            id="transactionFee"
                                            name="transactionFee"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            max="100"
                                            placeholder="0.00"
                                            value={formikHandlers.values.transactionFee || ''}
                                            onChange={formikHandlers.handleChange}
                                            onBlur={formikHandlers.handleBlur}
                                            className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                                        />
                                        <FormikErrorMessage
                                            error={formikHandlers?.errors?.transactionFee}
                                            touched={formikHandlers?.touched?.transactionFee}
                                        />
                                    </div>
                                )}

                            {/* Submit Buttons */}
                            <div className="flex justify-end gap-4 pt-4">
                                <Button
                                    type="button"
                                    color="light"
                                    onClick={() => setOpenModal(false)}
                                    disabled={loading}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={loading || !formikHandlers.isValid}
                                >
                                    {loading ? (
                                        <>
                                            <CustomSpinner size="sm" />
                                            <span className="ml-2">Updating...</span>
                                        </>
                                    ) : (
                                        'Update Ecosystem'
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

export default EditEcosystemModal;
