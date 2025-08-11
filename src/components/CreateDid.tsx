import React, { useState } from 'react';
import { Formik, Field, Form } from 'formik';

const CreateDIDModal = () => {
	// Initialize with empty strings, never null/undefined
	const initialValues = {
		didMethod: '',
		didValue: '',
		// ... other fields
	};

	return (
		<div>
			<Formik
				initialValues={initialValues}
				onSubmit={(values) => {
					// handle submit
				}}
			>
				{({ values, setFieldValue }) => (
					<Form>
						<div>
							<input
								value={values.didMethod || ''} // ✅ CORRECT - inside JSX component
								onChange={(e) => setFieldValue('didMethod', e.target.value)}
								placeholder="Enter DID method"
							/>
						</div>

						<div>
							<input
								value={values.didValue || ''} // ✅ CORRECT - inside JSX component
								onChange={(e) => setFieldValue('didValue', e.target.value)}
								placeholder="Enter DID value"
							/>
						</div>
					</Form>
				)}
			</Formik>
		</div>
	);
};

export default CreateDIDModal;
