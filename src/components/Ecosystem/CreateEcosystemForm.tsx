import { useState } from 'react';
import * as yup from 'yup';
import { Button, Label, Textarea } from 'flowbite-react';
import { Field, Form, Formik } from 'formik';
import type { FormikHelpers } from 'formik';
import type { AxiosResponse } from 'axios';
import { apiStatusCodes } from '../../config/CommonConstant';
import { AlertComponent } from '../AlertComponent';
import CustomSpinner from '../CustomSpinner';
import FormikErrorMessage from '../../commonComponents/formikerror/index';
import { createEcosystem } from '../../api/ecosystem';
import type { CreateEcosystemRequest } from '../../types/ecosystem';
import { BusinessModel } from '../../types/ecosystem';

interface FormValues extends CreateEcosystemRequest { }

const CreateEcosystemForm = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    const initialValues: FormValues = {
        name: '',
        description: '',
        logoUrl: '',
        businessModel: BusinessModel.OPEN,
        membershipFee: undefined,
        transactionFee: undefined,
    };

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

    const submitForm = async (
        values: FormValues,
        { resetForm }: FormikHelpers<FormValues>
    ) => {
        setLoading(true);
        setErrorMsg(null);
        setSuccessMsg(null);

        try {
            const payload: CreateEcosystemRequest = {
                name: values.name,
                description: values.description || undefined,
                logoUrl: values.logoUrl || undefined,
                businessModel: values.businessModel,
                membershipFee: values.membershipFee || undefined,
                transactionFee: values.transactionFee || undefined,
            };

            const response = await createEcosystem(payload) as AxiosResponse;
            const { data } = response;

            // Backend returns 201 for successful creation
            if (data?.statusCode === apiStatusCodes.API_STATUS_CREATED || data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
                setSuccessMsg(data?.message || 'Ecosystem created successfully');
                resetForm();

                // Redirect to ecosystem list after short delay
                setTimeout(() => {
                    window.location.href = '/ecosystems';
                }, 2000);
            } else {
                setErrorMsg(data?.message || 'Failed to create ecosystem');
            }
        } catch (error: any) {
            const errorMessage = error?.message || 'An error occurred while creating the ecosystem';
            setErrorMsg(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    Create Ecosystem
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Set up a new ecosystem coordination layer to manage organizations and credential transactions.
                </p>
            </div>

            <AlertComponent
                message={errorMsg}
                type={'failure'}
                onAlertClose={() => setErrorMsg(null)}
            />

            <AlertComponent
                message={successMsg}
                type={'success'}
                onAlertClose={() => setSuccessMsg(null)}
            />

            <div className="bg-white border border-gray-200 rounded-lg shadow-sm dark:border-gray-700 dark:bg-gray-800 p-6">
                <Formik
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                    validateOnBlur
                    validateOnChange
                    onSubmit={submitForm}
                >
                    {(formikHandlers) => (
                        <Form className="space-y-6" onSubmit={formikHandlers.handleSubmit}>
                            {/* Name Field */}
                            <div>
                                <Label htmlFor="name" value="Ecosystem Name" className="required" />
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

                            {/* Business Model Field */}
                            <div>
                                <Label htmlFor="businessModel" value="Business Model" className="required" />
                                <Field
                                    as="select"
                                    id="businessModel"
                                    name="businessModel"
                                    value={formikHandlers.values.businessModel}
                                    onChange={formikHandlers.handleChange}
                                    onBlur={formikHandlers.handleBlur}
                                    className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                >
                                    <option value={BusinessModel.OPEN}>Open - All organizations can join</option>
                                    {/* Future business models (when backend supports them):
                                    <option value={BusinessModel.RESTRICTED}>Restricted - Requires approval</option>
                                    <option value={BusinessModel.INVITE_ONLY}>Invite Only - By invitation only</option>
                                    */}
                                </Field>
                                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                    Currently only "Open" model is supported. Additional business models will be available soon.
                                </p>
                                <FormikErrorMessage
                                    error={formikHandlers?.errors?.businessModel}
                                    touched={formikHandlers?.touched?.businessModel}
                                />
                            </div>

                            {/* Submit Buttons */}
                            <div className="flex justify-end gap-4 pt-4">
                                <Button
                                    type="button"
                                    color="light"
                                    onClick={() => {
                                        window.location.href = '/ecosystems';
                                    }}
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
                                            <span className="ml-2">Creating...</span>
                                        </>
                                    ) : (
                                        'Create Ecosystem'
                                    )}
                                </Button>
                            </div>
                        </Form>
                    )}
                </Formik>
            </div>
        </div>
    );
};

export default CreateEcosystemForm;
