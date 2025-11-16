import React, { useState, useEffect } from 'react';
import { Field, Form, Formik } from 'formik';
import type { FormikHelpers } from 'formik';
import * as yup from 'yup';
import { Button, Card, Label } from 'flowbite-react';
import { AlertComponent } from '../AlertComponent';
import CustomSpinner from '../CustomSpinner';
import {
	registerOrganization,
	type OrganizationRegistrationRequest
} from '../../api/organization';
import {
	getCountriesWithCodes,
	getStatesByCountryCode,
	getCitiesByStateCode,
	getRegulatorsByCountryCode,
	getCitiesByCountryAndState,
	validateGeographicCodes,
	type Country,
	type State,
	type City,
	type Regulator
} from '../../api/locations';
import { apiStatusCodes } from '../../config/CommonConstant';
import type { AxiosResponse } from 'axios';

interface IProps {
	onSuccess?: () => void;
	onCancel?: () => void;
}

// Loading skeleton component for better UX
const LoadingSkeleton: React.FC<{ height?: string }> = ({ height = "h-10" }) => (
	<div className={`animate-pulse bg-gray-200 dark:bg-gray-600 rounded-lg ${height} w-full`}></div>
);

// Step progress indicator
const StepIndicator: React.FC<{ currentStep: number; totalSteps: number }> = ({ currentStep, totalSteps }) => (
	<div className="mb-8">
		<div className="flex items-center justify-between">
			{Array.from({ length: totalSteps }, (_, index) => {
				const stepNumber = index + 1;
				const isActive = stepNumber === currentStep;
				const isCompleted = stepNumber < currentStep;

				return (
					<React.Fragment key={stepNumber}>
						<div className="flex flex-col items-center">
							<div
								className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-200 ${isCompleted
									? 'bg-green-600 text-white'
									: isActive
										? 'bg-blue-600 text-white'
										: 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
									}`}
							>
								{isCompleted ? (
									<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
									</svg>
								) : (
									stepNumber
								)}
							</div>
							<span className={`mt-2 text-xs font-medium ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>
								{stepNumber === 1 ? 'Basic Info' : 'Regulatory'}
							</span>
						</div>

						{stepNumber < totalSteps && (
							<div className="flex-1 mx-4">
								<div
									className={`h-1 rounded transition-all duration-200 ${stepNumber < currentStep ? 'bg-green-600' : 'bg-gray-200 dark:bg-gray-600'
										}`}
								></div>
							</div>
						)}
					</React.Fragment>
				);
			})}
		</div>
	</div>
);

const MultiStepRegisterOrganization: React.FC<IProps> = ({ onSuccess, onCancel }) => {
	const [currentStep, setCurrentStep] = useState(1);
	const [loading, setLoading] = useState(false);
	const [alertMessage, setAlertMessage] = useState<string | null>(null);
	const [alertType, setAlertType] = useState<'success' | 'failure'>('success');

	// Location state management with better UX
	const [countries, setCountries] = useState<Country[]>([]);
	const [states, setStates] = useState<State[]>([]);
	const [cities, setCities] = useState<City[]>([]);
	const [regulators, setRegulators] = useState<Regulator[]>([]);
	const [loadingCountries, setLoadingCountries] = useState(true);
	const [loadingStates, setLoadingStates] = useState(false);
	const [loadingCities, setLoadingCities] = useState(false);
	const [loadingRegulators, setLoadingRegulators] = useState(false);

	// Track initialization status
	const [isInitialized, setIsInitialized] = useState(false);

	// Load countries on component mount with better error handling
	useEffect(() => {
		const loadCountries = async () => {
			setLoadingCountries(true);
			try {
				// Use only the new code-based API since we know it works
				const response = await getCountriesWithCodes();
				const { data } = response as AxiosResponse;

				console.log('Countries API response:', data);

				if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
					const countries = data.data || [];
					console.log('Raw countries data:', countries);
					console.log('First country structure:', countries[0]);
					console.log('Total countries received:', countries.length);

					// Check if Nigeria is in the list
					const nigeria = countries.find(c => c.name?.toLowerCase().includes('nigeria') || c.countryCode === 'NG');
					console.log('Nigeria found in countries:', nigeria);

					// Log all country names to see what's available
					console.log('All country names:', countries.map(c => c.name).sort());

					// Check for specific countries
					const testCountries = ['Nigeria', 'Canada', 'United States', 'United Kingdom'];
					testCountries.forEach(countryName => {
						const found = countries.find(c => c.name?.toLowerCase().includes(countryName.toLowerCase()));
						console.log(`${countryName} found:`, found || 'NOT FOUND');
					});

					setCountries(countries);
					console.log('Countries loaded successfully:', countries.length);

					// Log a sample of countries to see their structure
					console.log('Sample countries with their properties:', countries.slice(0, 10));
				} else {
					console.error('Countries API error:', data);
					setAlertMessage('Failed to load countries. Please refresh the page.');
					setAlertType('failure');
				}
			} catch (error) {
				console.error('Error loading countries:', error);
				setAlertMessage('Failed to load countries. Please check your connection and refresh.');
				setAlertType('failure');
			} finally {
				setLoadingCountries(false);
				setIsInitialized(true);
			}
		};

		loadCountries();
	}, []);

	// Function to load states and regulators when country changes
	const handleCountryChange = async (countryId: string, setFieldValue: any) => {
		console.log('Country changed to:', countryId);

		// Reset dependent fields immediately for better UX
		setFieldValue('countryId', countryId);
		setFieldValue('stateId', '');
		setFieldValue('cityId', '');
		setFieldValue('regulatorId', '');

		// Clear dependent arrays
		setStates([]);
		setCities([]);
		setRegulators([]);

		if (!countryId) {
			return;
		}

		// Find the selected country to get its code and name for logging
		console.log('Looking for country with ID:', countryId, 'Type:', typeof countryId);
		console.log('Available countries:', countries.map(c => ({ id: c.id, name: c.name, countryCode: c.countryCode, type: typeof c.id })));

		// Try both string and number comparison to handle type mismatches
		const selectedCountry = countries.find(country =>
			country.id === countryId ||
			country.id === String(countryId) ||
			String(country.id) === String(countryId)
		);
		const countryCode = selectedCountry?.countryCode;
		console.log('Selected country countryCode:', countryCode);
		console.log('Selected country object:', selectedCountry);
		console.log('Country ID:', countryId, 'Country Code:', countryCode, 'Country Name:', selectedCountry?.name);

		// Debug: Show which country we found and verify it's correct
		if (selectedCountry) {
			console.log('FOUND COUNTRY - ID:', selectedCountry.id, 'Name:', selectedCountry.name, 'Code:', selectedCountry.countryCode);
		} else {
			console.error('NO COUNTRY FOUND for ID:', countryId);
			console.log('All available country IDs:', countries.map(c => c.id));
		}

		if (!countryCode) {
			console.error('Country code not found for country:', selectedCountry);
			setAlertMessage('Selected country does not have a valid country code. Please try a different country.');
			setAlertType('failure');
			return;
		}

		console.log('Using code-based API with country code:', countryCode);

		// Load states and regulators in parallel for better performance
		const loadStatesPromise = (async () => {
			setLoadingStates(true);
			try {
				const response = await getStatesByCountryCode(countryCode);
				console.log('States API response for country code', countryCode, ':', response);

				const { data } = response as AxiosResponse;

				if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
					const statesData = data.data || [];
					console.log('Raw states data:', statesData);
					console.log('Total states received:', statesData.length);
					console.log('First state structure:', statesData[0]);

					// Log all state details to see what's available
					console.log('All states with IDs and codes:', statesData.map(s => ({
						id: s.id,
						name: s.name,
						stateCode: s.stateCode,
						idType: typeof s.id
					})));

					setStates(statesData);
					console.log('States loaded successfully:', statesData.length);
				} else {
					console.error('States API error:', data);
					setAlertMessage('Failed to load states for selected country.');
					setAlertType('failure');
				}
			} catch (error) {
				console.error('Error loading states:', error);
				setAlertMessage('Failed to load states. Please try again.');
				setAlertType('failure');
			} finally {
				setLoadingStates(false);
			}
		})();

		const loadRegulatorsPromise = (async () => {
			setLoadingRegulators(true);
			try {
				console.log('Loading regulators for country code:', countryCode);
				const response = await getRegulatorsByCountryCode(countryCode);
				console.log('Regulators API response for country code', countryCode, ':', response);

				const { data } = response as AxiosResponse;

				if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
					const regulatorsData = data.data || [];
					console.log('Raw regulators data:', regulatorsData);
					console.log('Total regulators received:', regulatorsData.length);
					console.log('First regulator structure:', regulatorsData[0]);

					// Log all regulator details to see what's available
					console.log('All regulators with IDs:', regulatorsData.map(r => ({
						id: r.id,
						name: r.name,
						abbreviation: r.abbreviation,
						idType: typeof r.id
					})));

					setRegulators(regulatorsData);
					console.log('Regulators loaded successfully:', regulatorsData.length);
				} else {
					console.error('Regulators API error:', data);
					console.log('Regulators API status code:', data?.statusCode);
					console.log('Regulators API message:', data?.message);
					// Don't show error immediately, might be expected for some countries
					console.log('No regulators found for country:', countryCode);
				}
			} catch (error) {
				console.error('Error loading regulators:', error);
				console.log('Regulators API error details:', {
					message: error.message,
					status: error.response?.status,
					statusText: error.response?.statusText,
					data: error.response?.data
				});
				console.log('Failed to load regulators for country:', countryCode);
			} finally {
				setLoadingRegulators(false);
			}
		})();

		// Wait for both operations to complete
		await Promise.all([loadStatesPromise, loadRegulatorsPromise]);
	};

	// Function to load cities when state changes
	const handleStateChange = async (stateId: string, setFieldValue: any) => {
		console.log('State changed to:', stateId);

		// Update field value and reset dependent fields immediately
		setFieldValue('stateId', stateId);
		setFieldValue('cityId', '');
		setCities([]);

		if (!stateId) {
			return;
		}

		// Find the selected state to get its code and name for logging
		console.log('Looking for state with ID:', stateId, 'Type:', typeof stateId);
		console.log('Available states:', states.map(s => ({ id: s.id, name: s.name, stateCode: s.stateCode, type: typeof s.id })));

		// Try both string and number comparison to handle type mismatches
		const selectedState = states.find(state =>
			state.id === stateId ||
			state.id === String(stateId) ||
			String(state.id) === String(stateId)
		);
		const stateCode = selectedState?.stateCode;
		console.log('Selected state object:', selectedState);
		console.log('State ID:', stateId, 'State Code:', stateCode, 'State Name:', selectedState?.name);

		// Debug: Show which state we found and verify it's correct
		if (selectedState) {
			console.log('FOUND STATE - ID:', selectedState.id, 'Name:', selectedState.name, 'Code:', selectedState.stateCode);
		} else {
			console.error('NO STATE FOUND for ID:', stateId);
			console.log('All available state IDs:', states.map(s => s.id));
			console.log('Total states available:', states.length);
		}

		if (!stateCode) {
			console.error('State code not found for state:', selectedState);
			setAlertMessage('Selected state does not have a valid state code. Please try a different state.');
			setAlertType('failure');
			return;
		}

		console.log('Using code-based API with state code:', stateCode);

		setLoadingCities(true);
		try {
			const response = await getCitiesByStateCode(stateCode);
			console.log('Cities API response for state code', stateCode, ':', response);

			const { data } = response as AxiosResponse;

			if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
				setCities(data.data || []);
				console.log('Cities loaded successfully:', data.data?.length || 0);
			} else {
				console.error('Cities API error:', data);
				setAlertMessage('Failed to load cities for selected state.');
				setAlertType('failure');
			}
		} catch (error) {
			console.error('Error loading cities:', error);
			setAlertMessage('Failed to load cities. Please try again.');
			setAlertType('failure');
		} finally {
			setLoadingCities(false);
		}
	};

	// Validation schemas for each step
	const step1ValidationSchema = yup.object().shape({
		legalName: yup
			.string()
			.required('Legal name is required')
			.min(2, 'Legal name must be at least 2 characters')
			.max(100, 'Legal name must be at most 100 characters')
			.trim(),
		publicName: yup
			.string()
			.required('Public name is required')
			.min(2, 'Public name must be at least 2 characters')
			.max(100, 'Public name must be at most 100 characters')
			.trim(),
		companyRegistrationNumber: yup
			.string()
			.required('Company registration number is required')
			.trim(),
		website: yup
			.string()
			.url('Please enter a valid website URL')
			.required('Website is required'),
		countryId: yup
			.string()
			.required('Country is required'),
		stateId: yup
			.string()
			.required('State is required'),
		cityId: yup
			.string()
			.required('City is required'),
		address: yup
			.string()
			.required('Address is required')
			.min(10, 'Address must be at least 10 characters')
			.trim(),
		officialContactFirstName: yup
			.string()
			.required('Official contact first name is required')
			.min(2, 'First name must be at least 2 characters')
			.max(50, 'First name must be at most 50 characters')
			.trim(),
		officialContactLastName: yup
			.string()
			.required('Official contact last name is required')
			.min(2, 'Last name must be at least 2 characters')
			.max(50, 'Last name must be at most 50 characters')
			.trim(),
		officialContactPhoneNumber: yup
			.string()
			.required('Official contact phone number is required')
			.matches(
				/^(\+234|0)[7-9][0-1]\d{8}$/,
				'Please enter a valid Nigerian phone number'
			),
	});

	const step2ValidationSchema = yup.object().shape({
		regulatorId: yup
			.string()
			.required('Please select a regulator'),
		regulationRegistrationNumber: yup
			.string()
			.required('Regulation registration number is required')
			.trim(),
	});

	const initialValues: OrganizationRegistrationRequest = {
		legalName: '',
		publicName: '',
		companyRegistrationNumber: '',
		website: '',
		regulatorId: '',
		regulationRegistrationNumber: '',
		countryId: '',
		stateId: '',
		cityId: '',
		address: '',
		officialContactFirstName: '',
		officialContactLastName: '',
		officialContactPhoneNumber: '',
	};

	const handleSubmit = async (
		values: OrganizationRegistrationRequest,
		{ setSubmitting }: FormikHelpers<OrganizationRegistrationRequest>
	) => {
		console.log('Form submission values:', values);
		setLoading(true);
		setSubmitting(true);

		try {
			const response = await registerOrganization(values);
			const { data } = response as AxiosResponse;

			console.log('Registration response:', data);

			if (data?.statusCode === apiStatusCodes.API_STATUS_CREATED) {
				setAlertType('success');
				setAlertMessage('Organization registration submitted successfully! You will receive an email notification once reviewed.');

				// Redirect after success
				setTimeout(() => {
					if (onSuccess) {
						onSuccess();
					} else {
						window.location.href = '/organizations/dashboard';
					}
				}, 3000);
			} else {
				setAlertType('failure');
				setAlertMessage(data?.message || 'Registration failed. Please try again.');
			}
		} catch (error) {
			console.error('Organization registration error:', error);
			setAlertType('failure');
			setAlertMessage('An error occurred while submitting your registration. Please try again.');
		} finally {
			setLoading(false);
			setSubmitting(false);
		}
	};

	// Function to validate current step before proceeding
	const validateStep = async (values: any, errors: any) => {
		if (currentStep === 1) {
			const step1Fields = ['legalName', 'publicName', 'companyRegistrationNumber', 'website', 'countryId', 'stateId', 'cityId', 'address', 'officialContactFirstName', 'officialContactLastName', 'officialContactPhoneNumber'];
			const step1Errors = step1Fields.filter(field => errors[field]);

			if (step1Errors.length > 0) {
				setAlertMessage('Please fill in all required fields before proceeding to the next step.');
				setAlertType('failure');
				return false;
			}
		}
		return true;
	};

	const nextStep = async (values: any, errors: any) => {
		const isValid = await validateStep(values, errors);
		if (isValid) {
			setCurrentStep(currentStep + 1);
			setAlertMessage(null);
		}
	};

	const prevStep = () => {
		setCurrentStep(currentStep - 1);
		setAlertMessage(null);
	};

	if (!isInitialized) {
		return (
			<div className="mx-auto max-w-4xl p-6">
				<Card className="border-gray-200 bg-white shadow-md dark:border-gray-700 dark:bg-gray-800">
					<div className="p-6">
						<div className="flex items-center justify-center py-12">
							<CustomSpinner />
							<span className="ml-3 text-gray-600 dark:text-gray-300">
								Loading registration form...
							</span>
						</div>
					</div>
				</Card>
			</div>
		);
	}

	return (
		<div className="mx-auto max-w-4xl p-6">
			<Card className="border-gray-200 bg-white shadow-md dark:border-gray-700 dark:bg-gray-800">
				<div className="p-6">
					<div className="mb-6">
						<h2 className="text-2xl font-bold text-gray-900 dark:text-white">
							Organization Registration
						</h2>
						<p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
							Complete the form below to register your organization. All fields are required.
						</p>
					</div>

					<StepIndicator currentStep={currentStep} totalSteps={2} />

					{alertMessage && (
						<div className="mb-6 animate-fadeIn">
							<AlertComponent
								message={alertMessage}
								type={alertType}
								onAlertClose={() => setAlertMessage(null)}
							/>
						</div>
					)}

					<Formik
						initialValues={initialValues}
						validationSchema={currentStep === 1 ? step1ValidationSchema : step2ValidationSchema}
						onSubmit={handleSubmit}
					>
						{({ errors, touched, values, setFieldValue }) => (
							<Form className="space-y-6">
								{currentStep === 1 && (
									<div className="space-y-6">
										{/* Basic Information Section */}
										<div className="border-b border-gray-200 pb-6 dark:border-gray-700">
											<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
												Basic Information
											</h3>
											<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
												<div>
													<Label
														htmlFor="legalName"
														className="block text-sm font-medium text-gray-700 dark:text-gray-300"
													>
														Legal Name <span className="text-red-500">*</span>
													</Label>
													<Field
														type="text"
														id="legalName"
														name="legalName"
														className={`mt-1 block w-full rounded-lg border px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors duration-200 ${errors.legalName && touched.legalName
															? 'border-red-500'
															: 'border-gray-300 dark:border-gray-600'
															} dark:bg-gray-700 dark:text-white`}
														placeholder="Enter legal organization name"
													/>
													{errors.legalName && touched.legalName && (
														<p className="mt-1 text-sm text-red-500 animate-fadeIn">{errors.legalName}</p>
													)}
												</div>

												<div>
													<Label
														htmlFor="publicName"
														className="block text-sm font-medium text-gray-700 dark:text-gray-300"
													>
														Public Name <span className="text-red-500">*</span>
													</Label>
													<Field
														type="text"
														id="publicName"
														name="publicName"
														className={`mt-1 block w-full rounded-lg border px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors duration-200 ${errors.publicName && touched.publicName
															? 'border-red-500'
															: 'border-gray-300 dark:border-gray-600'
															} dark:bg-gray-700 dark:text-white`}
														placeholder="Enter public display name"
													/>
													{errors.publicName && touched.publicName && (
														<p className="mt-1 text-sm text-red-500 animate-fadeIn">{errors.publicName}</p>
													)}
												</div>

												<div>
													<Label
														htmlFor="companyRegistrationNumber"
														className="block text-sm font-medium text-gray-700 dark:text-gray-300"
													>
														Company Registration Number <span className="text-red-500">*</span>
													</Label>
													<Field
														type="text"
														id="companyRegistrationNumber"
														name="companyRegistrationNumber"
														className={`mt-1 block w-full rounded-lg border px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors duration-200 ${errors.companyRegistrationNumber && touched.companyRegistrationNumber
															? 'border-red-500'
															: 'border-gray-300 dark:border-gray-600'
															} dark:bg-gray-700 dark:text-white`}
														placeholder="Enter CAC registration number"
													/>
													{errors.companyRegistrationNumber && touched.companyRegistrationNumber && (
														<p className="mt-1 text-sm text-red-500 animate-fadeIn">{errors.companyRegistrationNumber}</p>
													)}
												</div>

												<div>
													<Label
														htmlFor="website"
														className="block text-sm font-medium text-gray-700 dark:text-gray-300"
													>
														Website <span className="text-red-500">*</span>
													</Label>
													<Field
														type="url"
														id="website"
														name="website"
														className={`mt-1 block w-full rounded-lg border px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors duration-200 ${errors.website && touched.website
															? 'border-red-500'
															: 'border-gray-300 dark:border-gray-600'
															} dark:bg-gray-700 dark:text-white`}
														placeholder="https://www.example.com"
													/>
													{errors.website && touched.website && (
														<p className="mt-1 text-sm text-red-500 animate-fadeIn">{errors.website}</p>
													)}
												</div>
											</div>
										</div>

										{/* Location Information Section */}
										<div className="border-b border-gray-200 pb-6 dark:border-gray-700">
											<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
												Location Information
											</h3>
											<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
												<div>
													<Label
														htmlFor="countryId"
														className="block text-sm font-medium text-gray-700 dark:text-gray-300"
													>
														Country <span className="text-red-500">*</span>
													</Label>
													{loadingCountries ? (
														<LoadingSkeleton />
													) : (
														<Field
															as="select"
															id="countryId"
															name="countryId"
															className={`mt-1 block w-full rounded-lg border px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors duration-200 ${errors.countryId && touched.countryId
																? 'border-red-500'
																: 'border-gray-300 dark:border-gray-600'
																} dark:bg-gray-700 dark:text-white`}
															onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
																handleCountryChange(e.target.value, setFieldValue);
															}}
														>
															<option value="">Select a country</option>
															{countries.map((country) => (
																<option key={country.id} value={country.id}>
																	{country.name}
																</option>
															))}
														</Field>
													)}
													{errors.countryId && touched.countryId && (
														<p className="mt-1 text-sm text-red-500 animate-fadeIn">{errors.countryId}</p>
													)}
												</div>

												<div>
													<Label
														htmlFor="stateId"
														className="block text-sm font-medium text-gray-700 dark:text-gray-300"
													>
														State <span className="text-red-500">*</span>
													</Label>
													{loadingStates ? (
														<LoadingSkeleton />
													) : (
														<Field
															as="select"
															id="stateId"
															name="stateId"
															disabled={!values.countryId || states.length === 0}
															className={`mt-1 block w-full rounded-lg border px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all duration-200 ${errors.stateId && touched.stateId
																? 'border-red-500'
																: 'border-gray-300 dark:border-gray-600'
																} dark:bg-gray-700 dark:text-white disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed dark:disabled:bg-gray-600`}
															onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
																handleStateChange(e.target.value, setFieldValue);
															}}
														>
															<option value="">
																{!values.countryId ? 'Select a country first' : 'Select a state'}
															</option>
															{states.map((state) => (
																<option key={state.id} value={state.id}>
																	{state.name}
																</option>
															))}
														</Field>
													)}
													{errors.stateId && touched.stateId && (
														<p className="mt-1 text-sm text-red-500 animate-fadeIn">{errors.stateId}</p>
													)}
												</div>

												<div>
													<Label
														htmlFor="cityId"
														className="block text-sm font-medium text-gray-700 dark:text-gray-300"
													>
														City <span className="text-red-500">*</span>
													</Label>
													{loadingCities ? (
														<LoadingSkeleton />
													) : (
														<Field
															as="select"
															id="cityId"
															name="cityId"
															disabled={!values.stateId || cities.length === 0}
															className={`mt-1 block w-full rounded-lg border px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all duration-200 ${errors.cityId && touched.cityId
																? 'border-red-500'
																: 'border-gray-300 dark:border-gray-600'
																} dark:bg-gray-700 dark:text-white disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed dark:disabled:bg-gray-600`}
														>
															<option value="">
																{!values.stateId ? 'Select a state first' : 'Select a city'}
															</option>
															{cities.map((city) => (
																<option key={city.id} value={city.id}>
																	{city.name}
																</option>
															))}
														</Field>
													)}
													{errors.cityId && touched.cityId && (
														<p className="mt-1 text-sm text-red-500 animate-fadeIn">{errors.cityId}</p>
													)}
												</div>

												<div className="md:col-span-3">
													<Label
														htmlFor="address"
														className="block text-sm font-medium text-gray-700 dark:text-gray-300"
													>
														Address <span className="text-red-500">*</span>
													</Label>
													<Field
														as="textarea"
														id="address"
														name="address"
														rows={3}
														className={`mt-1 block w-full rounded-lg border px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors duration-200 ${errors.address && touched.address
															? 'border-red-500'
															: 'border-gray-300 dark:border-gray-600'
															} dark:bg-gray-700 dark:text-white`}
														placeholder="Enter complete address"
													/>
													{errors.address && touched.address && (
														<p className="mt-1 text-sm text-red-500 animate-fadeIn">{errors.address}</p>
													)}
												</div>
											</div>
										</div>

										{/* Official Contact Information Section */}
										<div className="pb-6">
											<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
												Official Contact Information
											</h3>
											<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
												<div>
													<Label
														htmlFor="officialContactFirstName"
														className="block text-sm font-medium text-gray-700 dark:text-gray-300"
													>
														First Name <span className="text-red-500">*</span>
													</Label>
													<Field
														type="text"
														id="officialContactFirstName"
														name="officialContactFirstName"
														className={`mt-1 block w-full rounded-lg border px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors duration-200 ${errors.officialContactFirstName && touched.officialContactFirstName
															? 'border-red-500'
															: 'border-gray-300 dark:border-gray-600'
															} dark:bg-gray-700 dark:text-white`}
														placeholder="Enter first name"
													/>
													{errors.officialContactFirstName && touched.officialContactFirstName && (
														<p className="mt-1 text-sm text-red-500 animate-fadeIn">{errors.officialContactFirstName}</p>
													)}
												</div>

												<div>
													<Label
														htmlFor="officialContactLastName"
														className="block text-sm font-medium text-gray-700 dark:text-gray-300"
													>
														Last Name <span className="text-red-500">*</span>
													</Label>
													<Field
														type="text"
														id="officialContactLastName"
														name="officialContactLastName"
														className={`mt-1 block w-full rounded-lg border px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors duration-200 ${errors.officialContactLastName && touched.officialContactLastName
															? 'border-red-500'
															: 'border-gray-300 dark:border-gray-600'
															} dark:bg-gray-700 dark:text-white`}
														placeholder="Enter last name"
													/>
													{errors.officialContactLastName && touched.officialContactLastName && (
														<p className="mt-1 text-sm text-red-500 animate-fadeIn">{errors.officialContactLastName}</p>
													)}
												</div>

												<div>
													<Label
														htmlFor="officialContactPhoneNumber"
														className="block text-sm font-medium text-gray-700 dark:text-gray-300"
													>
														Phone Number <span className="text-red-500">*</span>
													</Label>
													<Field
														type="tel"
														id="officialContactPhoneNumber"
														name="officialContactPhoneNumber"
														className={`mt-1 block w-full rounded-lg border px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors duration-200 ${errors.officialContactPhoneNumber && touched.officialContactPhoneNumber
															? 'border-red-500'
															: 'border-gray-300 dark:border-gray-600'
															} dark:bg-gray-700 dark:text-white`}
														placeholder="Enter phone number"
													/>
													{errors.officialContactPhoneNumber && touched.officialContactPhoneNumber && (
														<p className="mt-1 text-sm text-red-500 animate-fadeIn">{errors.officialContactPhoneNumber}</p>
													)}
												</div>
											</div>
										</div>
									</div>
								)}

								{currentStep === 2 && (
									<div className="space-y-6">
										{/* Regulatory Information Section */}
										<div className="pb-6">
											<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
												Regulatory Information
											</h3>
											<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
												<div>
													<Label
														htmlFor="regulator"
														className="block text-sm font-medium text-gray-700 dark:text-gray-300"
													>
														Regulator <span className="text-red-500">*</span>
													</Label>
													{loadingRegulators ? (
														<LoadingSkeleton />
													) : (
														<Field
															as="select"
															id="regulatorId"
															name="regulatorId"
															disabled={!values.countryId || regulators.length === 0}
															className={`mt-1 block w-full rounded-lg border px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all duration-200 ${errors.regulatorId && touched.regulatorId
																? 'border-red-500'
																: 'border-gray-300 dark:border-gray-600'
																} dark:bg-gray-700 dark:text-white disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed dark:disabled:bg-gray-600`}
														>
															<option value="">
																{!values.countryId
																	? 'Please complete Step 1 first'
																	: regulators.length === 0
																		? 'No regulators available for this country'
																		: 'Select a regulator'}
															</option>
															{regulators.map((regulator) => (
																<option key={regulator.id} value={regulator.id}>
																	{regulator.name} ({regulator.abbreviation})
																</option>
															))}
														</Field>
													)}
													{errors.regulatorId && touched.regulatorId && (
														<p className="mt-1 text-sm text-red-500 animate-fadeIn">{errors.regulatorId}</p>
													)}
													{values.countryId && !loadingRegulators && regulators.length === 0 && (
														<div className="mt-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
															<div className="flex items-start">
																<svg className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
																	<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z"></path>
																</svg>
																<div>
																	<p className="text-sm text-amber-800 dark:text-amber-300 font-medium">
																		No Regulators Available
																	</p>
																	<p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
																		There are currently no regulatory bodies configured for the selected country. Please contact our platform administrators for assistance or proceed with manual review.
																	</p>
																</div>
															</div>
														</div>
													)}
												</div>

												<div>
													<Label
														htmlFor="regulationRegistrationNumber"
														className="block text-sm font-medium text-gray-700 dark:text-gray-300"
													>
														Registration Number <span className="text-red-500">*</span>
													</Label>
													<Field
														type="text"
														id="regulationRegistrationNumber"
														name="regulationRegistrationNumber"
														className={`mt-1 block w-full rounded-lg border px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors duration-200 ${errors.regulationRegistrationNumber && touched.regulationRegistrationNumber
															? 'border-red-500'
															: 'border-gray-300 dark:border-gray-600'
															} dark:bg-gray-700 dark:text-white`}
														placeholder="Enter regulatory registration number"
													/>
													{errors.regulationRegistrationNumber && touched.regulationRegistrationNumber && (
														<p className="mt-1 text-sm text-red-500 animate-fadeIn">{errors.regulationRegistrationNumber}</p>
													)}
												</div>
											</div>
										</div>

										{/* Review Section */}
										<div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
											<h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Review Your Information</h4>
											<div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
												<div>
													<p className="text-gray-800 dark:text-gray-200"><span className="font-medium text-gray-900 dark:text-white">Legal Name:</span> {values.legalName || 'Not provided'}</p>
													<p className="text-gray-800 dark:text-gray-200"><span className="font-medium text-gray-900 dark:text-white">Public Name:</span> {values.publicName || 'Not provided'}</p>
													<p className="text-gray-800 dark:text-gray-200"><span className="font-medium text-gray-900 dark:text-white">Registration #:</span> {values.companyRegistrationNumber || 'Not provided'}</p>
													<p className="text-gray-800 dark:text-gray-200"><span className="font-medium text-gray-900 dark:text-white">Website:</span> {values.website || 'Not provided'}</p>
												</div>
												<div>
													<p className="text-gray-800 dark:text-gray-200"><span className="font-medium text-gray-900 dark:text-white">Contact:</span> {values.officialContactFirstName} {values.officialContactLastName}</p>
													<p className="text-gray-800 dark:text-gray-200"><span className="font-medium text-gray-900 dark:text-white">Phone:</span> {values.officialContactPhoneNumber || 'Not provided'}</p>
													<p className="text-gray-800 dark:text-gray-200"><span className="font-medium text-gray-900 dark:text-white">Location:</span> {countries.find(c => c.id === values.countryId)?.name}, {states.find(s => s.id === values.stateId)?.name}</p>
													<p className="text-gray-800 dark:text-gray-200"><span className="font-medium text-gray-900 dark:text-white">Regulator:</span> {regulators.find(r => r.id === values.regulatorId)?.name || 'Not selected'}</p>
												</div>
											</div>
										</div>
									</div>
								)}

								{/* Navigation Buttons */}
								<div className="flex flex-col sm:flex-row justify-between gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
									<div className="flex gap-3">
										{currentStep > 1 && (
											<Button
												type="button"
												color="gray"
												onClick={prevStep}
												className="flex-1 sm:flex-none"
											>
												<svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
												</svg>
												Previous
											</Button>
										)}

										{onCancel && (
											<Button
												type="button"
												color="gray"
												onClick={onCancel}
												className="flex-1 sm:flex-none"
											>
												Cancel
											</Button>
										)}
									</div>

									<div className="flex gap-3">
										{currentStep < 2 ? (
											<Button
												type="button"
												color="blue"
												onClick={() => nextStep(values, errors)}
												className="flex-1 sm:flex-none"
											>
												Next Step
												<svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
												</svg>
											</Button>
										) : (
											<Button
												type="submit"
												color="blue"
												disabled={loading}
												className="flex-1 sm:flex-none"
											>
												{loading ? (
													<>
														<CustomSpinner />
														<span className="ml-2">Submitting...</span>
													</>
												) : (
													<>
														<svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
															<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
														</svg>
														Submit for Review
													</>
												)}
											</Button>
										)}
									</div>
								</div>
							</Form>
						)}
					</Formik>
				</div>
			</Card>
		</div>
	);
};

export default MultiStepRegisterOrganization;
