import * as yup from 'yup';
import { Button, Label, Modal, Avatar } from 'flowbite-react';
import { Field, Form, Formik } from 'formik';
import type { FormikHelpers as FormikActions } from 'formik';
import { useEffect, useState } from 'react';
import type { AxiosResponse } from 'axios';

import { AlertComponent } from '../AlertComponent';
import { apiStatusCodes } from '../../config/CommonConstant';
import { reviewApplication } from '../../api/ecosystem';
import { ApplicationStatus } from '../../types/ecosystem';
import type { Application, ReviewApplicationRequest } from '../../types/ecosystem';

interface ApplicationReviewModalProps {
    ecosystemId: string;
    application: Application | null;
    openModal: boolean;
    setOpenModal: (flag: boolean) => void;
    setMessage: (message: string) => void;
    onApplicationReviewed?: () => void;
}

interface FormValues {
    status: 'approved' | 'rejected';
    notes: string;
}

const ApplicationReviewModal = (props: ApplicationReviewModalProps) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const initialFormData: FormValues = {
        status: 'approved',
        notes: '',
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
        if (!props.application) return;

        setLoading(true);
        setErrorMsg(null);

        try {
            const payload: ReviewApplicationRequest = {
                status:
                    values.status === 'approved'
                        ? ApplicationStatus.APPROVED
                        : ApplicationStatus.REJECTED,
                notes: values.notes.trim() || undefined,
            };

            const response = await reviewApplication(
                props.ecosystemId,
                props.application.id,
                payload
            );
            const { data } = response as AxiosResponse;

            if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
                props.setMessage(
                    data?.message ||
                    `Application ${values.status === 'approved' ? 'approved' : 'rejected'} successfully`
                );
                resetForm();
                props.setOpenModal(false);
                if (props.onApplicationReviewed) {
                    props.onApplicationReviewed();
                }
            } else {
                setErrorMsg(response as string);
            }
        } catch (error) {
            const err = error as Error;
            setErrorMsg(err?.message || 'Failed to review application');
        } finally {
            setLoading(false);
            setSubmitting(false);
        }
    };

    if (!props.application) {
        return null;
    }

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
            <Modal.Header>Review Application</Modal.Header>
            <Modal.Body>
                <AlertComponent
                    message={errorMsg}
                    type="failure"
                    onAlertClose={() => {
                        setErrorMsg(null);
                    }}
                />

                {/* Application Details */}
                <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                        Application Details
                    </h3>

                    <div className="flex items-center gap-3 mb-4">
                        <Avatar
                            img={props.application.organizationLogo}
                            alt={props.application.organizationName}
                            rounded
                            size="md"
                        />
                        <div>
                            <div className="font-semibold text-gray-900 dark:text-white">
                                {props.application.organizationName}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                ID: {props.application.organizationId}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                        <div>
                            <span className="font-medium">Membership Type:</span>{' '}
                            <span className="capitalize">{props.application.membershipType}</span>
                        </div>
                        <div>
                            <span className="font-medium">Submitted:</span>{' '}
                            {new Date(props.application.submittedAt).toLocaleDateString()}
                        </div>
                        {props.application.message && (
                            <div>
                                <span className="font-medium">Message:</span>
                                <p className="mt-1 text-gray-600 dark:text-gray-400">
                                    {props.application.message}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                <Formik
                    initialValues={initialFormData}
                    validationSchema={yup.object().shape({
                        status: yup
                            .string()
                            .oneOf(['approved', 'rejected'], 'Please select a valid status')
                            .required('Review status is required'),
                        notes: yup
                            .string()
                            .max(500, 'Notes must be 500 characters or less')
                            .trim(),
                    })}
                    validateOnBlur
                    validateOnChange
                    enableReinitialize
                    onSubmit={handleSubmit}
                >
                    {(formikHandlers): JSX.Element => (
                        <Form className="space-y-4" onSubmit={formikHandlers.handleSubmit}>
                            {/* Decision Field */}
                            <div>
                                <div className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                    <Label htmlFor="status" value="Review Decision" />
                                    <span className="text-red-500 text-xs">*</span>
                                </div>
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <Field
                                            type="radio"
                                            name="status"
                                            value="approved"
                                            className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                        />
                                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                                            Approve
                                        </span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <Field
                                            type="radio"
                                            name="status"
                                            value="rejected"
                                            className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                        />
                                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                                            Reject
                                        </span>
                                    </label>
                                </div>
                                {formikHandlers?.errors?.status &&
                                    formikHandlers?.touched?.status ? (
                                    <span className="text-red-500 text-xs">
                                        {formikHandlers?.errors?.status}
                                    </span>
                                ) : (
                                    <span className="text-red-500 text-xs invisible">Error</span>
                                )}
                            </div>

                            {/* Notes Field */}
                            <div>
                                <div className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                    <Label htmlFor="notes" value="Review Notes (Optional)" />
                                </div>
                                <Field
                                    as="textarea"
                                    id="notes"
                                    name="notes"
                                    rows={4}
                                    placeholder="Enter any notes or feedback for this decision..."
                                    className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                                />
                                {formikHandlers?.errors?.notes &&
                                    formikHandlers?.touched?.notes ? (
                                    <span className="text-red-500 text-xs">
                                        {formikHandlers?.errors?.notes}
                                    </span>
                                ) : (
                                    <span className="text-red-500 text-xs invisible">Error</span>
                                )}
                            </div>

                            {/* Warning Message */}
                            {formikHandlers.values.status === 'rejected' && (
                                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                                    <p className="text-sm text-yellow-800 dark:text-yellow-300">
                                        ⚠️ Rejecting this application will permanently deny this
                                        organization's request to join the ecosystem. Consider providing
                                        clear feedback in the notes field.
                                    </p>
                                </div>
                            )}

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
                                    className={
                                        formikHandlers.values.status === 'approved'
                                            ? 'bg-green-600 hover:bg-green-700 focus:ring-4 focus:ring-green-300'
                                            : 'bg-red-600 hover:bg-red-700 focus:ring-4 focus:ring-red-300'
                                    }
                                >
                                    {loading
                                        ? 'Processing...'
                                        : formikHandlers.values.status === 'approved'
                                            ? 'Approve Application'
                                            : 'Reject Application'}
                                </Button>
                            </div>
                        </Form>
                    )}
                </Formik>
            </Modal.Body>
        </Modal>
    );
};

export default ApplicationReviewModal;
