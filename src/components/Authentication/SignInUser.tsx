import {
	Field,
	Form,
	Formik,
	FormikHelpers,
	FormikProps,
	FormikValues,
} from 'formik';
import { Button, Checkbox, Label, TextInput } from 'flowbite-react';
import * as yup from 'yup';

import { asset, url } from '../../lib/data.js';
import { passwordRegex } from '../../config/CommonConstant.js';
import React from 'react';
import { axoisGet } from '../../services/apiRequests.js';

interface Values {
	email: string;
    password:string,
}

const SignInUser = () => {

    const verifyUser = async(values: Values) =>{
       
    }
    
	return (
		<div className="min-h-screen align-middle flex pb-[12vh]">
			<div className="w-full flex flex-col items-center justify-center px-6 pt-8 mx-auto pt:mt-0 dark:bg-gray-900">
				<div className="w-full max-w-xl p-6 space-y-8 sm:p-8 bg-white rounded-lg shadow dark:bg-gray-800">
					<h2 className="text-2xl font-bold text-gray-900 dark:text-white">
						Sign In
					</h2>

					<Formik
						initialValues={{
							email: '',
                            password:'',
						}}
						validationSchema={yup.object().shape({
							email: yup
								.string()
								.required('Email is required')
								.email('Email is invalid')
								.trim(),
							password: yup
								.string()
								.required('Password is required')
						})}
						validateOnBlur
						validateOnChange
						enableReinitialize
						onSubmit={(values: Values) => verifyUser(values)}
					>
						{(formikHandlers): JSX.Element => (
							<Form className="mt-8 space-y-6"  onSubmit={formikHandlers.handleSubmit}>
								<div>
									<div className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
										<Label htmlFor="email2" value="Email" />
                                        <span className='text-red-500 text-xs'>*</span>
									</div>
									<Field
										id="email"
										name="email"
										className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
										type="email"
									/>
                                    {
                                        (formikHandlers?.errors?.email && formikHandlers?.touched?.email) &&
                                        <span className="text-red-500 text-xs">{formikHandlers?.errors?.email}</span>
                                    }
								</div>
								<div>
									<div className="mb-2 block">
										<Label htmlFor="password" value="Password" />
                                        <span className='text-red-500 text-xs'>*</span>
									</div>

									<Field
										id="password"
										name="password"
										className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
										type="password"
									/>
                                    {
                                        (formikHandlers?.errors?.password && formikHandlers?.touched?.password) &&
                                        <span className="text-red-500 text-xs">{formikHandlers?.errors?.password}</span>
                                    }
								</div>
								<Button
									type="submit"
									className='text-base font-medium text-center text-white bg-primary-700 rounded-lg hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 sm:w-auto dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"'
								>
									Sign In
								</Button>
							</Form>
						)}
					</Formik>
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
				        Not registered? 
                        <a 
                            href="authentication/sign-up"
					        className="text-primary-700 hover:underline dark:text-primary-500"
					    >
                        Create account
                        </a>
			        </div>
				</div>
			</div>
		</div>
	);
};

export default SignInUser;
