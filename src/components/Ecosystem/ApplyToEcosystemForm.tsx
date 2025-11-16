import * as yup from 'yup';
import { Button, Card, Label } from 'flowbite-react';
import { Field, Form, Formik } from 'formik';
import type { FormikHelpers as FormikActions } from 'formik';
import { useEffect, useState } from 'react';
import type { AxiosResponse } from 'axios';

import { AlertComponent } from '../AlertComponent';
import CustomSpinner from '../CustomSpinner';
import { apiStatusCodes, storageKeys } from '../../config/CommonConstant';
import { submitApplication } from '../../api/ecosystem';
import { getFromLocalStorage } from '../../api/Auth';
import { MembershipType } from '../../types/ecosystem';
import type { SubmitApplicationRequest } from '../../types/ecosystem';

interface ApplyToEcosystemFormProps {
    ecosystemId: string;
    ecosystemName: string;
    onApplicationSubmitted?: () => void;
}

interface FormValues {
    organizationId: string;
    membershipType: MembershipType;
    message: string;
}

const ApplyToEcosystemForm = (props: ApplyToEcosystemFormProps) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [initializing, setInitializing] = useState<boolean>(true);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const [userOrgId, setUserOrgId] = useState<string>('');

    const initialFormData: FormValues = {
        organizationId: '',
        membershipType: MembershipType.BOTH,
        message: '',
    };

    // Get user's organization ID
    useEffect(() => {
        const fetchOrgId = async () => {
            try {
                const orgId = await getFromLocalStorage(storageKeys.ORG_ID);
                if (orgId) {
                    setUserOrgId(orgId);
                }
            } catch (error) {
                console.error('Error fetching organization ID:', error);
            } finally {
                setInitializing(false);
            }
        };
        fetchOrgId();
    }, []);

    const handleSubmit = async (
        values: FormValues,
        { setSubmitting, resetForm }: FormikActions<FormValues>
    ) => {
        setLoading(true);
        setErrorMsg(null);
        setSuccessMsg(null);

        try {
            const payload: SubmitApplicationRequest = {
                organizationId: values.organizationId.trim() || userOrgId,
                membershipType: values.membershipType,
                message: values.message.trim() || undefined,
            };

            const response = await submitApplication(props.ecosystemId, payload);
            const { data } = response as AxiosResponse;

            if (data?.statusCode === apiStatusCodes.API_STATUS_CREATED) {
                setSuccessMsg(
                    data?.message || 'Application submitted successfully! We will review your request.'
                );
                resetForm();
                if (props.onApplicationSubmitted) {
                    props.onApplicationSubmitted();
                }
            } else {
                setErrorMsg(response as string);
            }
        } catch (error) {
            const err = error as Error;
            setErrorMsg(err?.message || 'Failed to submit application');
        } finally {
            setLoading(false);
            setSubmitting(false);
        }
    };

    if (initializing) {
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
            <div className="mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Apply to Join Ecosystem
                </h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Submit your application to join{' '}
                    <span className="font-medium">{props.ecosystemName}</span>
                </p>
            </div>

            {/* Application Form */}
            <Card>
                <Formik
                    initialValues={initialFormData}
                    validationSchema={yup.object().shape({
                        organizationId: yup
                            .string()
                            .test(
                                'has-org-id',
                                'Organization ID is required',
                                function (value) {
                                    return !!value?.trim() || !!userOrgId;
                                }
                            )
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
                            .max(1000, 'Message must be 1000 characters or less')
                            .trim(),
                    })}
                    validateOnBlur
                    validateOnChange
                    enableReinitialize
                    onSubmit={handleSubmit}
                >
                    {(formikHandlers): JSX.Element => (
                        <Form className="space-y-6" onSubmit={formikHandlers.handleSubmit}>
                            {/* Information Section */}
                            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">
                                    Application Process
                                </h3>
                                <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1 list-disc list-inside">
                                    <li>Your application will be reviewed by the ecosystem administrators</li>
                                    <li>You will be notified once a decision has been made</li>
                                    <li>If approved, you can start participating in the ecosystem immediately</li>
                                </ul>
                            </div>

                            {/* Organization ID Field */}
                            {!userOrgId && (
                                <div>
                                    <div className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                        <Label htmlFor="organizationId" value="Organization ID" />
                                        <span className="text-red-500 text-xs">*</span>
                                    </div>
                                    <Field
                                        id="organizationId"
                                        name="organizationId"
                                        type="text"
                                        placeholder="Enter your organization ID"
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
                            )}

                            {userOrgId && (
                                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Organization ID
                                    </div>
                                    <div className="text-sm text-gray-900 dark:text-white font-mono mt-1">
                                        {userOrgId}
                                    </div>
                                </div>
                            )}

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
                                    className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                >
                                    <option value={MembershipType.BOTH}>
                                        Both (Issuer & Verifier)
                                    </option>
                                    <option value={MembershipType.ISSUER}>Issuer Only</option>
                                    <option value={MembershipType.VERIFIER}>Verifier Only</option>
                                </Field>
                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                    Select the type of activities your organization will perform in this
                                    ecosystem
                                </p>
                                {formikHandlers?.errors?.membershipType &&
                                    formikHandlers?.touched?.membershipType ? (
                                    <span className="text-red-500 text-xs">
                                        {formikHandlers?.errors?.membershipType}
                                    </span>
                                ) : (
                                    <span className="text-red-500 text-xs invisible">Error</span>
                                )}
                            </div>

                            {/* Message Field */}
                            <div>
                                <div className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                    <Label
                                        htmlFor="message"
                                        value="Application Message (Optional)"
                                    />
                                </div>
                                <Field
                                    as="textarea"
                                    id="message"
                                    name="message"
                                    rows={6}
                                    placeholder="Tell us about your organization and why you want to join this ecosystem..."
                                    className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                                />
                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                    Provide any additional information that might help your application
                                </p>
                                {formikHandlers?.errors?.message &&
                                    formikHandlers?.touched?.message ? (
                                    <span className="text-red-500 text-xs">
                                        {formikHandlers?.errors?.message}
                                    </span>
                                ) : (
                                    <span className="text-red-500 text-xs invisible">Error</span>
                                )}
                            </div>

                            {/* Terms Agreement */}
                            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                    By submitting this application, you agree to comply with the
                                    ecosystem's terms of service and operational guidelines.
                                </p>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-end gap-3 pt-4">
                                <Button
                                    color="gray"
                                    onClick={() => window.history.back()}
                                    disabled={loading}
                                    type="button"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    isProcessing={loading}
                                    disabled={loading || !formikHandlers.isValid}
                                    className="bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300"
                                >
                                    {loading ? 'Submitting...' : 'Submit Application'}
                                </Button>
                            </div>
                        </Form>
                    )}
                </Formik>
            </Card>
        </div>
    );
};

export default ApplyToEcosystemForm;
