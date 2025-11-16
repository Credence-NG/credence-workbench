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
	getCountries,
	getStates,
	getCities,
	getRegulators,
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

const RegisterOrganization: React.FC<IProps> = ({ onSuccess, onCancel }) => {
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
				const response = await getCountries();
				const { data } = response as AxiosResponse;

				console.log('Countries API response:', data);

				if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
					setCountries(data.data || []);
					console.log('Countries loaded successfully:', data.data?.length || 0);
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

		// Load states and regulators in parallel for better performance
		const loadStatesPromise = (async () => {
			setLoadingStates(true);
			try {
				const response = await getStates(countryId);
				const { data } = response as AxiosResponse;

				console.log('States API response for country', countryId, ':', data);

				if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
					setStates(data.data || []);
					console.log('States loaded successfully:', data.data?.length || 0);
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
				const response = await getRegulators(countryId);
				const { data } = response as AxiosResponse;

				console.log('Regulators API response for country', countryId, ':', data);

				if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
					setRegulators(data.data || []);
					console.log('Regulators loaded successfully:', data.data?.length || 0);
				} else {
					console.error('Regulators API error:', data);
					setAlertMessage('Failed to load regulators for selected country.');
					setAlertType('failure');
				}
			} catch (error) {
				console.error('Error loading regulators:', error);
				setAlertMessage('Failed to load regulators. Please try again.');
				setAlertType('failure');
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

		setLoadingCities(true);
		try {
			const response = await getCities(stateId);
			const { data } = response as AxiosResponse;

			console.log('Cities API response for state', stateId, ':', data);

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

	const validationSchema = yup.object().shape({
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
		regulatorId: yup
			.string()
			.required('Please select a regulator'),
		regulationRegistrationNumber: yup
			.string()
			.required('Regulation registration number is required')
			.trim(),
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
		{ setSubmitting, resetForm }: FormikHelpers<OrganizationRegistrationRequest>
	) => {
		setLoading(true);
		setAlertMessage(null);

		try {
			const response = await registerOrganization(values);
			const { data } = response as AxiosResponse;

			if (data?.statusCode === apiStatusCodes.API_STATUS_CREATED) {
				setAlertType('success');
				setAlertMessage(
					'Organization registration submitted successfully! Your application is now under review. You will receive an email notification once the review is complete.'
				);
				resetForm();
				setTimeout(() => {
					// Redirect to pending review page instead of calling onSuccess
					window.location.href = '/organizations/pending-organization-review';
				}, 3000);
			} else {
				setAlertType('failure');
				setAlertMessage(data?.message || 'Failed to submit organization registration');
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

	return (
		<div className="mx-auto max-w-4xl p-6">
			{!isInitialized ? (
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
			) : (
				<Card className="border-gray-200 bg-white shadow-md dark:border-gray-700 dark:bg-gray-800">
					<div className="mb-6">
						<h2 className="text-2xl font-bold text-gray-900 dark:text-white">
							Register Organization
						</h2>
						<p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
							Submit your organization for platform approval. All fields are required and will be reviewed by our platform administrators.
						</p>
					</div>

					{alertMessage && (
						<div className="mb-4 animate-fadeIn">
							<AlertComponent
								message={alertMessage}
								type={alertType}
								onAlertClose={() => setAlertMessage(null)}
							/>
						</div>
					)}

					<Formik
						initialValues={initialValues}
						validationSchema={validationSchema}
						onSubmit={handleSubmit}
					>
						{({ errors, touched, values, setFieldValue }) => (
							<Form className="space-y-6">
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
												className={`mt-1 block w-full rounded-lg border px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 ${errors.legalName && touched.legalName
													? 'border-red-500'
													: 'border-gray-300 dark:border-gray-600'
													} dark:bg-gray-700 dark:text-white`}
												placeholder="Enter legal organization name"
											/>
											{errors.legalName && touched.legalName && (
												<p className="mt-1 text-sm text-red-500">{errors.legalName}</p>
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
												className={`mt-1 block w-full rounded-lg border px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 ${errors.publicName && touched.publicName
													? 'border-red-500'
													: 'border-gray-300 dark:border-gray-600'
													} dark:bg-gray-700 dark:text-white`}
												placeholder="Enter public display name"
											/>
											{errors.publicName && touched.publicName && (
												<p className="mt-1 text-sm text-red-500">{errors.publicName}</p>
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
												className={`mt-1 block w-full rounded-lg border px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 ${errors.companyRegistrationNumber && touched.companyRegistrationNumber
													? 'border-red-500'
													: 'border-gray-300 dark:border-gray-600'
													} dark:bg-gray-700 dark:text-white`}
												placeholder="Enter CAC registration number"
											/>
											{errors.companyRegistrationNumber && touched.companyRegistrationNumber && (
												<p className="mt-1 text-sm text-red-500">{errors.companyRegistrationNumber}</p>
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
												className={`mt-1 block w-full rounded-lg border px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 ${errors.website && touched.website
													? 'border-red-500'
													: 'border-gray-300 dark:border-gray-600'
													} dark:bg-gray-700 dark:text-white`}
												placeholder="https://www.example.com"
											/>
											{errors.website && touched.website && (
												<p className="mt-1 text-sm text-red-500">{errors.website}</p>
											)}
										</div>
									</div>
								</div>

								{/* Regulatory Information Section */}
								<div className="border-b border-gray-200 pb-6 dark:border-gray-700">
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
															? 'Select a country first'
															: regulators.length === 0
																? 'No regulators available'
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
												<p className="mt-1 text-sm text-amber-600 dark:text-amber-400">
													No regulators found for this country. Please contact support.
												</p>
											)}
										</div>

										<div>
											<Label
												htmlFor="regulationRegistrationNumber"
												className="block text-sm font-medium text-gray-700 dark:text-gray-300"
											>
												Regulation Registration Number <span className="text-red-500">*</span>
											</Label>
											<Field
												type="text"
												id="regulationRegistrationNumber"
												name="regulationRegistrationNumber"
												className={`mt-1 block w-full rounded-lg border px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 ${errors.regulationRegistrationNumber && touched.regulationRegistrationNumber
													? 'border-red-500'
													: 'border-gray-300 dark:border-gray-600'
													} dark:bg-gray-700 dark:text-white`}
												placeholder="Enter regulation registration number"
											/>
											{errors.regulationRegistrationNumber && touched.regulationRegistrationNumber && (
												<p className="mt-1 text-sm text-red-500">{errors.regulationRegistrationNumber}</p>
											)}
										</div>
									</div>
								</div>

								{/* Location Information Section */}
								<div className="border-b border-gray-200 pb-6 dark:border-gray-700">
									<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
										Location Information
									</h3>
									<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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

										<div className="md:col-span-2">
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
												className={`mt-1 block w-full rounded-lg border px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 ${errors.address && touched.address
													? 'border-red-500'
													: 'border-gray-300 dark:border-gray-600'
													} dark:bg-gray-700 dark:text-white`}
												placeholder="Enter complete address"
											/>
											{errors.address && touched.address && (
												<p className="mt-1 text-sm text-red-500">{errors.address}</p>
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
												className={`mt-1 block w-full rounded-lg border px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 ${errors.officialContactFirstName && touched.officialContactFirstName
													? 'border-red-500'
													: 'border-gray-300 dark:border-gray-600'
													} dark:bg-gray-700 dark:text-white`}
												placeholder="Enter first name"
											/>
											{errors.officialContactFirstName && touched.officialContactFirstName && (
												<p className="mt-1 text-sm text-red-500">{errors.officialContactFirstName}</p>
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
												className={`mt-1 block w-full rounded-lg border px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 ${errors.officialContactLastName && touched.officialContactLastName
													? 'border-red-500'
													: 'border-gray-300 dark:border-gray-600'
													} dark:bg-gray-700 dark:text-white`}
												placeholder="Enter last name"
											/>
											{errors.officialContactLastName && touched.officialContactLastName && (
												<p className="mt-1 text-sm text-red-500">{errors.officialContactLastName}</p>
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
												className={`mt-1 block w-full rounded-lg border px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 ${errors.officialContactPhoneNumber && touched.officialContactPhoneNumber
													? 'border-red-500'
													: 'border-gray-300 dark:border-gray-600'
													} dark:bg-gray-700 dark:text-white`}
												placeholder="+234xxxxxxxxxx"
											/>
											{errors.officialContactPhoneNumber && touched.officialContactPhoneNumber && (
												<p className="mt-1 text-sm text-red-500">{errors.officialContactPhoneNumber}</p>
											)}
										</div>
									</div>
								</div>

								{/* Submit Buttons */}
								<div className="flex justify-end space-x-4 pt-6">
									{onCancel && (
										<Button
											type="button"
											color="light"
											onClick={onCancel}
											disabled={loading}
										>
											Cancel
										</Button>
									)}
									<Button
										type="submit"
										disabled={loading}
										className="bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
									>
										{loading ? (
											<>
												<CustomSpinner />
												<span className="ml-2">Submitting...</span>
											</>
										) : (
											'Submit for Review'
										)}
									</Button>
								</div>
							</Form>
						)}
					</Formik>
				</Card>
			)}
		</div>
	);
};

export default RegisterOrganization;
