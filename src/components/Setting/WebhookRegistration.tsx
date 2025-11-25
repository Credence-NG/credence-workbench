import React, { useState, useEffect, useCallback } from 'react';
import { Button, Label, TextInput, Card, Modal } from 'flowbite-react';
import { Field, Form, Formik } from 'formik';
import * as yup from 'yup';
import { AlertComponent } from '../AlertComponent';
import CustomSpinner from '../CustomSpinner';
import { createOrgApp, getOrgApps, deleteOrgApp, updateOrgApp, type OrgApp, type CreateOrgAppPayload, type UpdateOrgAppPayload } from '../../api/organizationApps';

interface WebhookRegistrationProps {
	className?: string;
}

const WebhookRegistration: React.FC<WebhookRegistrationProps> = ({ className = '' }) => {
	const [webhooks, setWebhooks] = useState<OrgApp[]>([]);
	const [loading, setLoading] = useState(false);
	const [formLoading, setFormLoading] = useState(false);
	const [success, setSuccess] = useState<string | null>(null);
	const [failure, setFailure] = useState<string | null>(null);

	// Form state
	const [name, setName] = useState('');
	const [description, setDescription] = useState('');
	const [webhookUrl, setWebhookUrl] = useState('');
	const [webhookSecret, setWebhookSecret] = useState('');
	const [showSecret, setShowSecret] = useState(false);

	// Edit state
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [editingWebhook, setEditingWebhook] = useState<OrgApp | null>(null);
	const [editFormData, setEditFormData] = useState({
		name: '',
		description: '',
		webhookUrl: '',
		webhookSecret: '',
	});
	const [showEditSecret, setShowEditSecret] = useState(false);
	const [editFailure, setEditFailure] = useState<string | null>(null);

	// Track which webhook secrets are visible (by webhook ID)
	const [visibleSecrets, setVisibleSecrets] = useState<Set<string>>(new Set());

	const toggleSecretVisibility = useCallback((webhookId: string) => {
		setVisibleSecrets(prev => {
			const newSet = new Set(prev);
			if (newSet.has(webhookId)) {
				newSet.delete(webhookId);
			} else {
				newSet.add(webhookId);
			}
			return newSet;
		});
	}, []);

	useEffect(() => {
		fetchWebhooks();
	}, []);

	const fetchWebhooks = async () => {
		setLoading(true);
		setFailure(null);
		try {
			const response = await getOrgApps();
			if (response?.data?.data) {
				setWebhooks(response.data.data);
			}
		} catch (error) {
			const err = error as Error;
			setFailure(err.message || 'Failed to fetch webhooks');
		} finally {
			setLoading(false);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!name.trim() || !description.trim() || !webhookUrl.trim() || !webhookSecret.trim()) {
			setFailure('All fields are required');
			return;
		}

		// Validate webhook secret length (16-200 characters)
		if (webhookSecret.trim().length < 16) {
			setFailure('Webhook secret must be at least 16 characters for security');
			return;
		}
		if (webhookSecret.trim().length > 200) {
			setFailure('Webhook secret must be at most 200 characters');
			return;
		}

		// Basic URL validation - allow Docker internal URLs
		const url = webhookUrl.trim();
		const urlPattern = /^https?:\/\/.+/;
		if (!urlPattern.test(url)) {
			setFailure('Please enter a valid webhook URL starting with http:// or https://');
			return;
		}

		setFormLoading(true);
		setSuccess(null);
		setFailure(null);

		try {
			const payload: CreateOrgAppPayload = {
				name: name.trim(),
				description: description.trim(),
				webhookUrl: webhookUrl.trim(),
				webhookSecret: webhookSecret.trim(),
			};

			console.log("📤 Submitting webhook registration:", payload);

			const response = await createOrgApp(payload);

			console.log("✅ Webhook registration response:", response);

			if (response?.data) {
				setSuccess('Webhook registered successfully');
				setName('');
				setDescription('');
				setWebhookUrl('');
				setWebhookSecret('');
				fetchWebhooks(); // Refresh the list
			}
		} catch (error) {
			const err = error as any;
			console.error("❌ Webhook registration error:", err);
			console.error("❌ Error details:", {
				message: err?.message,
				response: err?.response?.data,
				status: err?.response?.status
			});

			// Extract detailed error message
			const errorMessage =
				err?.response?.data?.message ||
				err?.response?.data?.error ||
				err?.message ||
				'Failed to register webhook';

			// Add helpful context for 500 errors
			const displayMessage = err?.response?.status === 500
				? `${errorMessage}. This may be a backend issue - please check the server logs or contact support.`
				: errorMessage;

			setFailure(displayMessage);
		} finally {
			setFormLoading(false);
		}
	};

	const handleDelete = async (appId: string, appName: string) => {
		if (!confirm(`Are you sure you want to delete webhook "${appName}"?`)) {
			return;
		}

		setLoading(true);
		setFailure(null);
		setSuccess(null);

		try {
			await deleteOrgApp(appId);
			setSuccess(`Webhook "${appName}" deleted successfully`);
			fetchWebhooks(); // Refresh the list
		} catch (error) {
			const err = error as Error;
			setFailure(err.message || 'Failed to delete webhook');
		} finally {
			setLoading(false);
		}
	};

	const handleEdit = (webhook: OrgApp) => {
		setEditingWebhook(webhook);
		setEditFormData({
			name: webhook.name,
			description: webhook.description || '',
			webhookUrl: webhook.webhookUrl,
			webhookSecret: '', // Don't pre-fill secret for security
		});
		setShowEditSecret(false);
		setIsEditModalOpen(true);
		setEditFailure(null); // Clear any previous errors
	};

	const handleEditSubmit = async (values: typeof editFormData) => {
		setEditFailure(null);
		setFormLoading(true);

		try {
			const payload: UpdateOrgAppPayload = {
				name: values.name.trim(),
				description: values.description.trim(),
				webhookUrl: values.webhookUrl.trim(),
			};

			// Only include secret if it was provided
			if (values.webhookSecret.trim()) {
				payload.webhookSecret = values.webhookSecret.trim();
			}

			await updateOrgApp(editingWebhook!.id, payload);
			setSuccess(`Webhook "${values.name}" updated successfully`);
			setIsEditModalOpen(false);
			setEditingWebhook(null);
			setEditFormData({
				name: '',
				description: '',
				webhookUrl: '',
				webhookSecret: '',
			});
			setEditFailure(null);
			fetchWebhooks(); // Refresh the list
		} catch (error) {
			const err = error as any;
			console.error("❌ Update webhook error:", err);
			console.error("❌ Error details:", {
				message: err?.message,
				response: err?.response?.data,
				status: err?.response?.status
			});

			const errorMessage =
				err?.response?.data?.message ||
				err?.response?.data?.error ||
				err?.message ||
				'Failed to update webhook';

			const displayMessage = err?.response?.status === 500
				? `${errorMessage}. This may be a backend issue - please check the server logs or contact support.`
				: errorMessage;

			setEditFailure(displayMessage);
		} finally {
			setFormLoading(false);
		}
	}; const handleCancelEdit = () => {
		setIsEditModalOpen(false);
		setEditingWebhook(null);
		setEditFormData({
			name: '',
			description: '',
			webhookUrl: '',
			webhookSecret: '',
		});
		setShowEditSecret(false);
		setEditFailure(null);
	};

	const formatDate = (dateString?: string) => {
		if (!dateString) return 'N/A';
		try {
			return new Date(dateString).toLocaleString();
		} catch {
			return dateString;
		}
	};

	return (
		<div className={`space-y-6 ${className}`}>
			{/* Alert Messages */}
			{success && (
				<AlertComponent
					message={success}
					type="success"
					onAlertClose={() => setSuccess(null)}
				/>
			)}
			{failure && (
				<AlertComponent
					message={failure}
					type="failure"
					onAlertClose={() => setFailure(null)}
				/>
			)}

			{/* Registration Form */}
			<Card>
				<h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
					Register New Webhook
				</h3>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<Label htmlFor="webhook-name" value="Application Name" />
						<TextInput
							id="webhook-name"
							type="text"
							placeholder="My Application"
							value={name}
							onChange={(e) => setName(e.target.value)}
							required
							disabled={formLoading}
						/>
					</div>

					<div>
						<Label htmlFor="webhook-description" value="Description" />
						<TextInput
							id="webhook-description"
							type="text"
							placeholder="Main webhook receiver for production"
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							required
							disabled={formLoading}
						/>
						<p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
							Brief description of this webhook integration
						</p>
					</div>

					<div>
						<Label htmlFor="webhook-url" value="Webhook URL" />
						<TextInput
							id="webhook-url"
							type="text"
							placeholder="http://demo-app:3300/api/webhooks/confirmd"
							value={webhookUrl}
							onChange={(e) => setWebhookUrl(e.target.value)}
							required
							disabled={formLoading}
						/>
						<p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
							Enter the URL where webhook events will be sent (supports Docker internal URLs)
						</p>
					</div>

					<div>
						<Label htmlFor="webhook-secret" value="Webhook Secret" />
						<div className="relative">
							<TextInput
								id="webhook-secret"
								type={showSecret ? "text" : "password"}
								placeholder="Enter a secure secret (16-200 characters)"
								value={webhookSecret}
								onChange={(e) => setWebhookSecret(e.target.value)}
								required
								disabled={formLoading}
								minLength={16}
								maxLength={200}
							/>
							<button
								type="button"
								onClick={() => setShowSecret(!showSecret)}
								className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
								disabled={formLoading}
							>
								{showSecret ? (
									<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
										<path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
									</svg>
								) : (
									<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
										<path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
										<path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
									</svg>
								)}
							</button>
						</div>
						<p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
							This secret will be used to sign webhook requests (16-200 characters)
						</p>
					</div>

					<Button type="submit" disabled={formLoading} className="w-full">
						{formLoading ? (
							<>
								<CustomSpinner />
								<span className="ml-2">Registering...</span>
							</>
						) : (
							'Register Webhook'
						)}
					</Button>
				</form>
			</Card>

			{/* Registered Webhooks List */}
			<Card>
				<div className="flex items-center justify-between mb-4">
					<h3 className="text-xl font-semibold text-gray-900 dark:text-white">
						Registered Webhooks
					</h3>
					<Button size="sm" onClick={fetchWebhooks} disabled={loading}>
						{loading ? <CustomSpinner /> : 'Refresh'}
					</Button>
				</div>

				{loading && webhooks.length === 0 ? (
					<div className="flex justify-center py-8">
						<CustomSpinner />
					</div>
				) : webhooks.length === 0 ? (
					<p className="text-gray-500 dark:text-gray-400 text-center py-8">
						No webhooks registered yet. Register your first webhook above.
					</p>
				) : (
					<div className="space-y-4">
						{webhooks.map((webhook) => (
							<div
								key={webhook.id}
								className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
							>
								<div className="flex justify-between items-start">
									<div className="flex-1">
										<h4 className="text-lg font-semibold text-gray-900 dark:text-white">
											{webhook.name}
										</h4>
										<p className="text-sm text-gray-600 dark:text-gray-400 mt-1 break-all">
											<span className="font-medium">URL:</span> {webhook.webhookUrl}
										</p>
										<div className="flex items-center gap-2 mt-1">
											<p className="text-sm text-gray-600 dark:text-gray-400">
												<span className="font-medium">Secret:</span>{' '}
												{webhook.webhookSecret ? (
													visibleSecrets.has(webhook.id)
														? webhook.webhookSecret
														: `${webhook.webhookSecret.substring(0, 8)}...••••`
												) : (
													<span className="text-gray-500 italic">Not available</span>
												)}
											</p>
											{webhook.webhookSecret && (
												<button
													type="button"
													onClick={() => toggleSecretVisibility(webhook.id)}
													className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
													title={visibleSecrets.has(webhook.id) ? "Hide secret" : "Show secret"}
												>
													{visibleSecrets.has(webhook.id) ? (
														<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
															<path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
														</svg>
													) : (
														<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
															<path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
															<path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
														</svg>
													)}
												</button>
											)}
										</div>
										<p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
											Created: {formatDate(webhook.createdAt || webhook.createDateTime)}
										</p>
										{(webhook.updatedAt || webhook.lastChangedDateTime) &&
											(webhook.updatedAt !== webhook.createdAt || webhook.lastChangedDateTime !== webhook.createDateTime) && (
												<p className="text-xs text-gray-500 dark:text-gray-500">
													Updated: {formatDate(webhook.updatedAt || webhook.lastChangedDateTime)}
												</p>
											)}
									</div>
									<div className="flex gap-2">
										<Button
											color="gray"
											size="sm"
											onClick={() => handleEdit(webhook)}
											disabled={loading}
										>
											Edit
										</Button>
										<Button
											color="failure"
											size="sm"
											onClick={() => handleDelete(webhook.id, webhook.name)}
											disabled={loading}
										>
											Delete
										</Button>
									</div>
								</div>
							</div>
						))}
					</div>
				)}
			</Card>

			{/* Edit Modal */}
			<Modal show={isEditModalOpen} onClose={handleCancelEdit}>
				<Modal.Header>Edit Webhook</Modal.Header>
				<Modal.Body>
					{editFailure && (
						<div className="mb-4">
							<AlertComponent
								message={editFailure}
								type="failure"
								onAlertClose={() => setEditFailure(null)}
							/>
						</div>
					)}
					<Formik
						initialValues={editFormData}
						validationSchema={yup.object().shape({
							name: yup
								.string()
								.min(2, 'Name must be at least 2 characters')
								.max(200, 'Name must be at most 200 characters')
								.required('Name is required')
								.trim(),
							description: yup
								.string()
								.min(2, 'Description must be at least 2 characters')
								.max(500, 'Description must be at most 500 characters')
								.required('Description is required')
								.trim(),
							webhookUrl: yup
								.string()
								.matches(/^https?:\/\/.+/, 'Must be a valid URL starting with http:// or https://')
								.required('Webhook URL is required')
								.trim(),
							webhookSecret: yup
								.string()
								.min(16, 'Secret must be at least 16 characters')
								.max(200, 'Secret must be at most 200 characters')
								.notRequired(),
						})}
						enableReinitialize
						onSubmit={handleEditSubmit}
					>
						{(formik) => (
							<Form className="space-y-4">
								<div>
									<div className="mb-2 block">
										<Label htmlFor="edit-name" value="Webhook Name" />
									</div>
									<Field
										id="edit-name"
										name="name"
										type="text"
										value={formik.values.name}
										className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
										placeholder="My Webhook"
										disabled={formLoading}
										onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
											formik.setFieldValue('name', e.target.value);
											formik.setFieldTouched('name', true, false);
										}}
									/>
									{formik.errors.name && formik.touched.name && (
										<span className="text-red-500 text-xs">{formik.errors.name}</span>
									)}
								</div>

								<div>
									<div className="mb-2 block">
										<Label htmlFor="edit-description" value="Description" />
									</div>
									<Field
										id="edit-description"
										name="description"
										type="text"
										value={formik.values.description}
										className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
										placeholder="Webhook description"
										disabled={formLoading}
										onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
											formik.setFieldValue('description', e.target.value);
											formik.setFieldTouched('description', true, false);
										}}
									/>
									{formik.errors.description && formik.touched.description && (
										<span className="text-red-500 text-xs">{formik.errors.description}</span>
									)}
								</div>

								<div>
									<div className="mb-2 block">
										<Label htmlFor="edit-webhookUrl" value="Webhook URL" />
									</div>
									<Field
										id="edit-webhookUrl"
										name="webhookUrl"
										type="text"
										value={formik.values.webhookUrl}
										className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
										placeholder="http://demo-app:3300/api/webhooks/confirmd"
										disabled={formLoading}
										onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
											formik.setFieldValue('webhookUrl', e.target.value);
											formik.setFieldTouched('webhookUrl', true, false);
										}}
									/>
									{formik.errors.webhookUrl && formik.touched.webhookUrl && (
										<span className="text-red-500 text-xs">{formik.errors.webhookUrl}</span>
									)}
								</div>

								<div>
									<div className="mb-2 block">
										<Label htmlFor="edit-webhookSecret" value="Webhook Secret (Optional)" />
									</div>
									<div className="relative">
										<Field
											id="edit-webhookSecret"
											name="webhookSecret"
											type={showEditSecret ? 'text' : 'password'}
											value={formik.values.webhookSecret}
											className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
											placeholder="Leave blank to keep existing secret"
											disabled={formLoading}
											onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
												formik.setFieldValue('webhookSecret', e.target.value);
												formik.setFieldTouched('webhookSecret', true, false);
											}}
										/>
										<button
											type="button"
											onClick={() => setShowEditSecret(!showEditSecret)}
											className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
											disabled={formLoading}
										>
											{showEditSecret ? (
												<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
													<path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
												</svg>
											) : (
												<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
													<path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
													<path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
												</svg>
											)}
										</button>
									</div>
									{formik.errors.webhookSecret && formik.touched.webhookSecret && (
										<span className="text-red-500 text-xs">{formik.errors.webhookSecret}</span>
									)}
									<p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
										Leave blank to keep the existing secret, or enter a new one (16-200 characters)
									</p>
								</div>

								<div className="flex gap-2 justify-end">
									<Button color="gray" onClick={handleCancelEdit} disabled={formLoading} type="button">
										Cancel
									</Button>
									<Button type="submit" disabled={formLoading}>
										{formLoading ? (
											<>
												<CustomSpinner />
												<span className="ml-2">Updating...</span>
											</>
										) : (
											'Update Webhook'
										)}
									</Button>
								</div>
							</Form>
						)}
					</Formik>
				</Modal.Body>
			</Modal>
		</div>
	);
};

WebhookRegistration.displayName = 'WebhookRegistration';

// Memoize to prevent parent re-renders from affecting this component
export default React.memo(WebhookRegistration);
