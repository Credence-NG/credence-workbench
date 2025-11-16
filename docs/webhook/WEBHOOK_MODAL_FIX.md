# Webhook Edit Modal Focus Loss Fix

## Problem
The webhook edit modal was losing focus after every keystroke, making it impossible to type normally. Users had to copy-paste text as a workaround.

## Root Cause
The issue was caused by how form state was managed in the modal. When using regular `useState` hooks with controlled inputs in a modal, each keystroke triggered state updates that caused the parent component to re-render, which in turn remounted the modal inputs, causing focus loss.

Key factors:
1. **Parent component re-renders**: The Settings component conditionally renders WebhookRegistration based on `activeTab`
2. **State updates cascade**: Each keystroke → state update → parent re-render → child remount
3. **Modal remounting**: When the parent re-renders, the modal and its inputs get destroyed and recreated
4. **Focus lost**: Input remounting causes the active element to lose focus

## Why Previous Fixes Didn't Work
- **React.memo**: Didn't prevent remounting because the modal's internal state changes still triggered updates
- **useCallback**: Didn't help because the issue wasn't about recreating functions
- **Simplified inline handlers**: Same problem - still using useState which triggers parent re-renders
- **Matching Add form pattern**: The Add form is always rendered (not in a modal), so it doesn't have the same remounting issue

## The Solution: Formik
We converted the edit modal to use **Formik** for form state management, following the same pattern used successfully in `CreateOrgModal`.

### Why Formik Works
1. **Isolated form state**: Formik manages form state internally, preventing parent component re-renders
2. **Optimized Field components**: Formik's `Field` components are optimized to prevent unnecessary re-renders
3. **Form context**: Changes stay within Formik's context, not triggering React's normal re-render cascade
4. **Focus preservation**: Field components maintain focus during updates

### Key Changes

#### Before (Broken - using useState)
```tsx
// State declarations
const [editName, setEditName] = useState('');
const [editDescription, setEditDescription] = useState('');
// ...

// In modal
<TextInput
  value={editName}
  onChange={(e) => setEditName(e.target.value)}
/>
```

#### After (Fixed - using Formik)
```tsx
// State declaration
const [editFormData, setEditFormData] = useState({
  name: '',
  description: '',
  webhookUrl: '',
  webhookSecret: '',
});

// In modal
<Formik
  initialValues={editFormData}
  validationSchema={yup.object().shape({
    name: yup.string().min(2).max(200).required().trim(),
    // ... validation rules
  })}
  enableReinitialize
  onSubmit={handleEditSubmit}
>
  {(formik) => (
    <Form>
      <Field
        name="name"
        value={formik.values.name}
        onChange={(e) => {
          formik.setFieldValue('name', e.target.value);
          formik.setFieldTouched('name', true, false);
        }}
      />
      {/* Error handling */}
      {formik.errors.name && formik.touched.name && (
        <span className="text-red-500 text-xs">{formik.errors.name}</span>
      )}
    </Form>
  )}
</Formik>
```

### Benefits
1. ✅ **No more focus loss** - Inputs maintain focus during typing
2. ✅ **Better validation** - Integrated yup schema validation
3. ✅ **Cleaner error handling** - Built-in touched/error state
4. ✅ **Consistent pattern** - Matches CreateOrgModal implementation
5. ✅ **Future-proof** - Standard React form library used across the project

## Implementation Details

### Dependencies Added
```tsx
import { Field, Form, Formik } from 'formik';
import * as yup from 'yup';
```

### Validation Schema
```tsx
validationSchema={yup.object().shape({
  name: yup.string().min(2).max(200).required().trim(),
  description: yup.string().min(2).max(500).required().trim(),
  webhookUrl: yup.string().url().required().trim(),
  webhookSecret: yup.string().min(16).max(200).notRequired(),
})}
```

### Submit Handler Update
```tsx
const handleEditSubmit = async (values: typeof editFormData) => {
  // No need for manual validation - Formik handles it
  const payload: UpdateOrgAppPayload = {
    name: values.name.trim(),
    description: values.description.trim(),
    webhookUrl: values.webhookUrl.trim(),
  };
  
  if (values.webhookSecret.trim()) {
    payload.webhookSecret = values.webhookSecret.trim();
  }
  
  await updateOrgApp(editingWebhook!.id, payload);
  // ... rest of the logic
};
```

## Lessons Learned
1. **Modal forms need special handling**: Forms in modals that can be conditionally rendered are susceptible to remounting issues
2. **useState isn't always the answer**: For complex forms, especially in modals, use a form library like Formik
3. **Look for working patterns**: The CreateOrgModal was already using Formik successfully - we should have checked other modals first
4. **Copy-paste working = remounting issue**: When copy-paste is the only workaround, it indicates the input is being destroyed/recreated, not just re-rendering

## Best Practices Going Forward
1. **Use Formik for modal forms**: Any form in a modal should use Formik to avoid focus issues
2. **Follow existing patterns**: Check how other modals in the codebase handle forms
3. **Test modal forms thoroughly**: Always test typing continuously, not just single character inputs
4. **Consider enableReinitialize**: When form data comes from external state, use `enableReinitialize` prop

## References
- Working example: `src/components/CreateOrgModal/index.tsx`
- Fixed component: `src/components/Setting/WebhookRegistration.tsx`
- Formik documentation: https://formik.org/
