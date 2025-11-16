import * as yup from 'yup';
import { Button, Label, Modal } from 'flowbite-react';
import { Field, Form, Formik } from 'formik';
import type { FormikHelpers as FormikActions } from 'formik';
import { useEffect, useState } from 'react';
import type { AxiosResponse } from 'axios';

import { AlertComponent } from '../AlertComponent';
import { apiStatusCodes } from '../../config/CommonConstant';
import { processSettlement, approveSettlement } from '../../api/ecosystem';
import type { ProcessSettlementRequest, Settlement } from '../../types/ecosystem';

interface ProcessSettlementModalProps {
    ecosystemId: string;
    settlement: Settlement | null;
    openModal: boolean;
    setOpenModal: (flag: boolean) => void;
    setMessage: (message: string) => void;
    onSettlementProcessed?: () => void;
}

interface FormValues {
    organizationId: string;
    periodStart: string;
    periodEnd: string;
    action: 'process' | 'approve';
}

const ProcessSettlementModal = (props: ProcessSettlementModalProps) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    // If settlement is provided, we're approving. Otherwise, we're creating a new one.
    const isApproval = props.settlement !== null;

    const initialFormData: FormValues = {
        organizationId: props.settlement?.organizationId || '',
        periodStart: props.settlement?.periodStart.split('T')[0] || '',
        periodEnd: props.settlement?.periodEnd.split('T')[0] || '',
        action: isApproval ? 'approve' : 'process',
    };

    useEffect(() => {
        if (!props.openModal) {
            setErrorMsg(null);
            setLoading(false);
        }
    }, [props.openModal]);

    const handleSubmit = async (
        values: FormValues,
        { setSubmitting, resetForm }: FormikActions<FormValues>
    ) => {
        setLoading(true);
        setErrorMsg(null);

        try {
            if (values.action === 'approve' && props.settlement) {
                // Approve existing settlement
                const response = await approveSettlement(
                    props.ecosystemId,
                    props.settlement.id
                );
                const { data } = response as AxiosResponse;

                if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
                    props.setMessage(data?.message || 'Settlement approved successfully');
                    resetForm();
                    props.setOpenModal(false);
                    if (props.onSettlementProcessed) {
                        props.onSettlementProcessed();
                    }
                } else {
                    setErrorMsg(response as string);
                }
            } else {
                // Process new settlement
                const payload: ProcessSettlementRequest = {
                    organizationId: values.organizationId.trim(),
                    periodStart: new Date(values.periodStart).toISOString(),
                    periodEnd: new Date(values.periodEnd).toISOString(),
                };

                const response = await processSettlement(props.ecosystemId, payload);
                const { data } = response as AxiosResponse;

                if (data?.statusCode === apiStatusCodes.API_STATUS_CREATED) {
                    props.setMessage(data?.message || 'Settlement processed successfully');
                    resetForm();
                    props.setOpenModal(false);
                    if (props.onSettlementProcessed) {
                        props.onSettlementProcessed();
                    }
                } else {
                    setErrorMsg(response as string);
                }
            }
        } catch (error) {
            const err = error as Error;
            setErrorMsg(err?.message || 'Failed to process settlement');
        } finally {
            setLoading(false);
            setSubmitting(false);
        }
    };

    return (
        <Modal
            size="lg"
            show={props.openModal}
            onClose={() => {
                if (!loading) {
                    props.setOpenModal(false);
                }
            }}
        >
            <Modal.Header>
                {isApproval ? 'Approve Settlement' : 'Process New Settlement'}
            </Modal.Header>
            <Modal.Body>
                <AlertComponent
                    message={errorMsg}
                    type="failure"
                    onAlertClose={() => {
                        setErrorMsg(null);
                    }}
                />

                {isApproval && props.settlement && (
                    <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                            Settlement Details
                        </h3>
                        <div className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                            <div>
                                <span className="font-medium">Organization:</span>{' '}
                                {props.settlement.organizationName}
                            </div>
                            <div>
                                <span className="font-medium">Total Amount:</span>{' '}
                                {new Intl.NumberFormat('en-US', {
                                    style: 'currency',
                                    currency: props.settlement.currency,
                                }).format(props.settlement.totalAmount)}
                            </div>
                            <div>
                                <span className="font-medium">Transactions:</span>{' '}
                                {props.settlement.transactionCount}
                            </div>
                            <div>
                                <span className="font-medium">Period:</span>{' '}
                                {new Date(props.settlement.periodStart).toLocaleDateString()} -{' '}
                                {new Date(props.settlement.periodEnd).toLocaleDateString()}
                            </div>
                        </div>
                    </div>
                )}

                <Formik
                    initialValues={initialFormData}
                    validationSchema={yup.object().shape({
                        organizationId: yup
                            .string()
                            .required('Organization ID is required')
                            .trim(),
                        periodStart: yup
                            .date()
                            .required('Start date is required')
                            .max(new Date(), 'Start date cannot be in the future'),
                        periodEnd: yup
                            .date()
                            .required('End date is required')
                            .min(yup.ref('periodStart'), 'End date must be after start date')
                            .max(new Date(), 'End date cannot be in the future'),
                        action: yup
                            .string()
                            .oneOf(['process', 'approve'])
                            .required('Action is required'),
                    })}
                    validateOnBlur
                    validateOnChange
                    enableReinitialize
                    onSubmit={handleSubmit}
                >
                    {(formikHandlers): JSX.Element => (
                        <Form className="space-y-4" onSubmit={formikHandlers.handleSubmit}>
                            {!isApproval && (
                                <>
                                    {/* Organization ID Field */}
                                    <div>
                                        <div className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                            <Label htmlFor="organizationId" value="Organization ID" />
                                            <span className="text-red-500 text-xs">*</span>
                                        </div>
                                        <Field
                                            id="organizationId"
                                            name="organizationId"
                                            type="text"
                                            placeholder="Enter organization ID"
                                            className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                                        />
                                        {formikHandlers?.errors?.organizationId &&
                                            formikHandlers?.touched?.organizationId ? (
                                            <span className="text-red-500 text-xs">
                                                {formikHandlers?.errors?.organizationId}
                                            </span>
                                        ) : (
                                            <span className="text-red-500 text-xs invisible">Error</span>
                                        )}
                                    </div>

                                    {/* Date Range */}
                                    <div className="grid grid-cols-2 gap-4">
                                        {/* Period Start */}
                                        <div>
                                            <div className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                                <Label htmlFor="periodStart" value="Period Start" />
                                                <span className="text-red-500 text-xs">*</span>
                                            </div>
                                            <Field
                                                id="periodStart"
                                                name="periodStart"
                                                type="date"
                                                className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                                            />
                                            {formikHandlers?.errors?.periodStart &&
                                                formikHandlers?.touched?.periodStart ? (
                                                <span className="text-red-500 text-xs">
                                                    {formikHandlers?.errors?.periodStart}
                                                </span>
                                            ) : (
                                                <span className="text-red-500 text-xs invisible">Error</span>
                                            )}
                                        </div>

                                        {/* Period End */}
                                        <div>
                                            <div className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                                <Label htmlFor="periodEnd" value="Period End" />
                                                <span className="text-red-500 text-xs">*</span>
                                            </div>
                                            <Field
                                                id="periodEnd"
                                                name="periodEnd"
                                                type="date"
                                                className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                                            />
                                            {formikHandlers?.errors?.periodEnd &&
                                                formikHandlers?.touched?.periodEnd ? (
                                                <span className="text-red-500 text-xs">
                                                    {formikHandlers?.errors?.periodEnd}
                                                </span>
                                            ) : (
                                                <span className="text-red-500 text-xs invisible">Error</span>
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Hidden Action Field */}
                            <Field type="hidden" name="action" />

                            {/* Action Buttons */}
                            <div className="flex justify-end gap-3 pt-4">
                                <Button
                                    color="gray"
                                    onClick={() => props.setOpenModal(false)}
                                    disabled={loading}
                                    type="button"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    isProcessing={loading}
                                    disabled={loading || !formikHandlers.isValid}
                                    className="bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700"
                                >
                                    {loading
                                        ? isApproval
                                            ? 'Approving...'
                                            : 'Processing...'
                                        : isApproval
                                            ? 'Approve Settlement'
                                            : 'Process Settlement'}
                                </Button>
                            </div>
                        </Form>
                    )}
                </Formik>
            </Modal.Body>
        </Modal>
    );
};

export default ProcessSettlementModal;
