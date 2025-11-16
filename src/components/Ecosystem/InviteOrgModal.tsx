import * as yup from 'yup';
import { Button, Label, Modal } from 'flowbite-react';
import { Field, Form, Formik } from 'formik';
import type { FormikHelpers as FormikActions } from 'formik';
import { useEffect, useState } from 'react';
import type { AxiosResponse } from 'axios';

import { AlertComponent } from '../AlertComponent';
import { apiStatusCodes } from '../../config/CommonConstant';
import { sendInvitation } from '../../api/ecosystem';
import { MembershipType } from '../../types/ecosystem';
import type { SendInvitationRequest } from '../../types/ecosystem';

interface InviteOrgModalProps {
    ecosystemId: string;
    openModal: boolean;
    setOpenModal: (flag: boolean) => void;
    setMessage: (message: string) => void;
    onInviteSent?: () => void;
}

interface FormValues {
    organizationId: string;
    membershipType: MembershipType;
    message: string;
}

const InviteOrgModal = (props: InviteOrgModalProps) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const initialFormData: FormValues = {
        organizationId: '',
        membershipType: MembershipType.BOTH,
        message: '',
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
            const payload: SendInvitationRequest = {
                organizationId: values.organizationId.trim(),
                membershipType: values.membershipType,
                message: values.message.trim() || undefined,
            };

            const response = await sendInvitation(props.ecosystemId, payload);
            const { data } = response as AxiosResponse;

            if (data?.statusCode === apiStatusCodes.API_STATUS_CREATED) {
                props.setMessage(data?.message || 'Invitation sent successfully');
                resetForm();
                props.setOpenModal(false);
                if (props.onInviteSent) {
                    props.onInviteSent();
                }
            } else {
                setErrorMsg(response as string);
            }
        } catch (error) {
            const err = error as Error;
            setErrorMsg(err?.message || 'Failed to send invitation');
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
            <Modal.Header>Invite Organization to Ecosystem</Modal.Header>
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
                    validationSchema={yup.object().shape({
                        organizationId: yup
                            .string()
                            .required('Organization ID is required')
                            .trim(),
                        membershipType: yup
                            .string()
                            .oneOf(
                                [MembershipType.ISSUER, MembershipType.VERIFIER, MembershipType.BOTH],
                                'Please select a valid membership type'
                            )
                            .required('Membership type is required'),
                        message: yup
                            .string()
                            .max(500, 'Message must be 500 characters or less')
                            .trim(),
                    })}
                    validateOnBlur
                    validateOnChange
                    enableReinitialize
                    onSubmit={handleSubmit}
                >
                    {(formikHandlers): JSX.Element => (
                        <Form className="space-y-4" onSubmit={formikHandlers.handleSubmit}>
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
                                    className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
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

                            {/* Membership Type Field */}
                            <div>
                                <div className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                    <Label htmlFor="membershipType" value="Membership Type" />
                                    <span className="text-red-500 text-xs">*</span>
                                </div>
                                <Field
                                    as="select"
                                    id="membershipType"
                                    name="membershipType"
                                    className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                >
                                    <option value={MembershipType.BOTH}>
                                        Both (Issuer & Verifier)
                                    </option>
                                    <option value={MembershipType.ISSUER}>Issuer Only</option>
                                    <option value={MembershipType.VERIFIER}>Verifier Only</option>
                                </Field>
                                {formikHandlers?.errors?.membershipType &&
                                    formikHandlers?.touched?.membershipType ? (
                                    <span className="text-red-500 text-xs">
                                        {formikHandlers?.errors?.membershipType}
                                    </span>
                                ) : (
                                    <span className="text-red-500 text-xs invisible">Error</span>
                                )}
                            </div>

                            {/* Message Field (Optional) */}
                            <div>
                                <div className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                    <Label htmlFor="message" value="Invitation Message (Optional)" />
                                </div>
                                <Field
                                    as="textarea"
                                    id="message"
                                    name="message"
                                    rows={4}
                                    placeholder="Enter a message to include with the invitation..."
                                    className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                />
                                {formikHandlers?.errors?.message &&
                                    formikHandlers?.touched?.message ? (
                                    <span className="text-red-500 text-xs">
                                        {formikHandlers?.errors?.message}
                                    </span>
                                ) : (
                                    <span className="text-red-500 text-xs invisible">Error</span>
                                )}
                            </div>

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
                                    {loading ? 'Sending...' : 'Send Invitation'}
                                </Button>
                            </div>
                        </Form>
                    )}
                </Formik>
            </Modal.Body>
        </Modal>
    );
};

export default InviteOrgModal;
