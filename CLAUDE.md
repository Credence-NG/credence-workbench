# CLAUDE.md - AI Assistant Standing Instructions

This document contains important patterns, solutions, and best practices discovered while working on this project. Future AI assistants should reference this file to avoid repeating solved problems.

---

## Table of Contents
1. [Modal Form Focus Loss Issues](#modal-form-focus-loss-issues)
2. [React Hydration Errors](#react-hydration-errors)
3. [Project Structure](#project-structure)
4. [Common Patterns](#common-patterns)
5. [Known Issues and Solutions](#known-issues-and-solutions)

---

## Modal Form Focus Loss Issues

### Problem Pattern
**Symptom**: Input fields in modals lose focus after every keystroke, making typing impossible. Users resort to copy-pasting text.

**Root Cause**: 
- Forms using `useState` for controlled inputs in modals
- Parent component conditionally renders the modal/component
- Each keystroke → state update → parent re-render → modal remount → focus loss

### ✅ Solution: Use Formik
Convert modal forms to use **Formik** for form state management.

**Why it works**:
1. Formik isolates form state from component state
2. Field components are optimized to prevent unnecessary re-renders
3. Form context prevents parent re-render cascades
4. Focus is preserved during input updates

**Implementation**:

```tsx
// ❌ DON'T: Regular useState with controlled inputs in modals
const [editName, setEditName] = useState('');

<Modal show={isOpen}>
  <TextInput
    value={editName}
    onChange={(e) => setEditName(e.target.value)}
  />
</Modal>

// ✅ DO: Use Formik for modal forms
import { Field, Form, Formik } from 'formik';
import * as yup from 'yup';

const [editFormData, setEditFormData] = useState({
  name: '',
  description: '',
});

<Modal show={isOpen}>
  <Formik
    initialValues={editFormData}
    validationSchema={yup.object().shape({
      name: yup.string().min(2).max(200).required(),
      description: yup.string().min(2).max(500).required(),
    })}
    enableReinitialize
    onSubmit={handleSubmit}
  >
    {(formik) => (
      <Form>
        <Field
          name="name"
          value={formik.values.name}
          className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
          onChange={(e) => {
            formik.setFieldValue('name', e.target.value);
            formik.setFieldTouched('name', true, false);
          }}
        />
        {formik.errors.name && formik.touched.name && (
          <span className="text-red-500 text-xs">{formik.errors.name}</span>
        )}
      </Form>
    )}
  </Formik>
</Modal>
```

**Reference Examples**:
- ✅ Working: `src/components/CreateOrgModal/index.tsx` - Uses Formik
- ✅ Fixed: `src/components/Setting/WebhookRegistration.tsx` - Edit modal converted to Formik
- 📚 Full details: `docs/WEBHOOK_MODAL_FIX.md`

**Dependencies** (already installed):
- `formik: ^2.4.6`
- `yup: ^1.4.0`

---

## React Hydration Errors

### Problem Pattern
**Symptom**: Console error "Hydration failed because the initial UI does not match what was rendered on the server" followed by "entire root will switch to client rendering".

**Root Causes**:
1. Components accessing browser-only APIs (`window`, `localStorage`, `document`) during initial render
2. Conditional rendering based on client-side state (e.g., data from localStorage)
3. Components rendering differently on server vs client
4. State initialized from browser APIs that differ between SSR and CSR

### ✅ Solution: Use `client:only` Directive

For components that rely on browser APIs or client-side state, use the `client:only="react"` directive in Astro instead of `client:visible` or `client:load`.

**Why it works**:
- Skips server-side rendering entirely
- Component only renders on the client
- No hydration mismatch possible
- Access to browser APIs guaranteed

**When to use**:
- Component uses `localStorage`, `sessionStorage`, or `window` APIs
- Component has conditional rendering based on client-only state
- Component renders differently based on user roles from localStorage
- Component uses browser-specific features

**Implementation**:

```astro
// ❌ DON'T: client:visible with localStorage-dependent rendering
<Dashboard client:visible />
// This will cause hydration errors if Dashboard reads from localStorage
// and conditionally renders UI elements

// ✅ DO: Use client:only for client-dependent components
<Dashboard client:only="react" />
// Component only renders on client, no hydration mismatch
```

**Real Example - Organization Dashboard**:
```tsx
// src/components/organization/Dashboard.tsx
const Dashboard = () => {
  const [userRoles, setUserRoles] = useState<string[]>([]); // Empty on server

  useEffect(() => {
    const orgRoles = await getFromLocalStorage(storageKeys.ORG_ROLES); // Only on client
    const roles = orgRoles.split(',');
    setUserRoles(roles); // Populates on client
  }, []);

  // This conditional rendering differs server vs client!
  {(userRoles.includes(Roles.OWNER) || userRoles.includes(Roles.ADMIN)) && (
    <EditButton />
  )}
}

// ❌ Causes hydration error:
<Dashboard client:visible />

// ✅ Fixed:
<Dashboard client:only="react" />
```

**Reference Examples**:
- ✅ Fixed: `src/pages/organizations/dashboard/index.astro` - Dashboard uses `client:only="react"`
- ✅ Fixed: `src/app/SideBar.astro` - DynamicSidebar uses `client:only="react"`
- ❌ Problematic: Components using `localStorage` with `client:visible` or `client:load`

**Alternative Solution** (if SSR is needed):
```tsx
// Use a hydration-safe pattern
const [isMounted, setIsMounted] = useState(false);
const [userRoles, setUserRoles] = useState<string[]>([]);

useEffect(() => {
  setIsMounted(true);
  // Load client-side data here
  const roles = getFromLocalStorage(storageKeys.ORG_ROLES);
  setUserRoles(roles.split(','));
}, []);

// Render same UI structure on server and client
return (
  <div>
    {isMounted && (userRoles.includes(Roles.OWNER) || userRoles.includes(Roles.ADMIN)) ? (
      <EditButton />
    ) : (
      <div style={{ visibility: 'hidden' }}><EditButton /></div>
    )}
  </div>
);
```

**Trade-offs**:
- `client:only`: No SEO for component content, faster perceived load (no flash)
- Hydration-safe pattern: Better SEO, but more complex code

---

## Project Structure

### Key Directories
- `/src/components/` - React components
- `/src/api/` - API integration layer
- `/src/pages/` - Astro pages
- `/docs/` - Project documentation and fix guides
- `/public/images/` - Static assets

### UI Framework
- **Flowbite React** - Component library
- **Tailwind CSS** - Styling
- **Astro** - Static site generator with React integration

---

## Common Patterns

### 1. Form Management in Modals
**Always use Formik** for any form inside a modal to prevent focus loss issues.

### 2. API Error Handling
```tsx
try {
  const response = await apiCall();
  // Success handling
} catch (error) {
  const err = error as any;
  const errorMessage =
    err?.response?.data?.message ||
    err?.response?.data?.error ||
    err?.message ||
    'Default error message';
  
  const displayMessage = err?.response?.status === 500
    ? `${errorMessage}. This may be a backend issue.`
    : errorMessage;
  
  setFailure(displayMessage);
}
```

### 3. Component Memoization
While `React.memo` is useful for optimization, **it doesn't solve modal remounting issues**. Use Formik instead for modal forms.

### 4. State Management
- Use `useState` for simple component state
- Use Formik for form state in modals
- Keep edit/create form state isolated from list/display state

---

## Known Issues and Solutions

### Issue: Modal Form Focus Loss
**Status**: ✅ Solved  
**Solution**: Use Formik (see section above)  
**Affected Components**: Any modal with form inputs  
**Documentation**: `docs/WEBHOOK_MODAL_FIX.md`

### Issue: Copy-Paste Required for Modal Inputs
**Status**: ✅ Solved
**Root Cause**: Same as modal focus loss
**Solution**: Convert to Formik
**Red Flag**: If users need to copy-paste into inputs, it indicates remounting issues

### Issue: React Hydration Errors
**Status**: ✅ Solved
**Symptom**: Console error "Hydration failed because the initial UI does not match what was rendered on the server"
**Root Cause**: Components use `localStorage` to conditionally render UI elements, causing server/client mismatch
**Solution**: Change from `client:visible` or `client:load` to `client:only="react"` in Astro pages
**Affected Components**:
  - `src/pages/organizations/dashboard/index.astro` - Dashboard component reading user roles from localStorage
  - `src/app/SideBar.astro` - DynamicSidebar reading roles/permissions to conditionally render menu items
**Fixed in**: Organizations dashboard and DynamicSidebar (2025-11-04)

---

## Testing Guidelines

### Modal Form Testing Checklist
When working with modal forms, always test:
- [ ] Type continuously in each field (not just single characters)
- [ ] Tab between fields
- [ ] Validation errors appear correctly
- [ ] Submit button works
- [ ] Cancel button works
- [ ] Form persists data when switching between fields
- [ ] No focus loss during rapid typing

### Debugging Tips
1. If copy-paste works but typing doesn't → Input is being remounted
2. If React.memo doesn't help → State management issue, not render optimization
3. Check parent component for conditional rendering
4. Look for working examples in the codebase (e.g., CreateOrgModal)

---

## Best Practices

### 1. Before Creating New Modal Forms
- Check existing modals for patterns (especially CreateOrgModal)
- Use Formik from the start, don't try useState first
- Include validation schema with yup
- Use `enableReinitialize` when form data comes from external state

### 2. When Debugging Focus Issues
- Test typing continuously, not single keystrokes
- Try copy-paste as a diagnostic (if it works, remounting is the issue)
- Check for conditional rendering in parent components
- Look for `useState` in modal forms

### 3. Documentation
- Document complex fixes in `/docs/` folder
- Update this CLAUDE.md file with new patterns
- Include "before/after" code examples
- Reference working examples in the codebase

---

## Dependencies to Know

### Core
- React 18+
- TypeScript 5.x
- Astro 4.x

### UI
- Flowbite React (Modal, TextInput, Button, etc.)
- Tailwind CSS

### Forms
- **Formik** `^2.4.6` - Form state management (USE THIS FOR MODALS)
- **Yup** `^1.4.0` - Schema validation

### Others
- Axios - HTTP client
- Various Keycloak/auth libraries

---

## Quick Reference Commands

```bash
# Install dependencies
pnpm install

# Development server
pnpm dev

# Build
pnpm build

# Type check (ignore pre-existing errors in other files)
npx tsc --noEmit

# Docker
docker compose up --build --force-recreate -d
```

---

## Update History

- **2025-11-04**: React Hydration Error Solution
  - Added comprehensive React hydration error documentation
  - Documented `client:only` vs `client:visible` solution
  - Fixed organization dashboard hydration error
  - Added alternative hydration-safe pattern for SSR scenarios

- **2025-10-04**: Initial creation
  - Added modal form focus loss solution (Formik pattern)
  - Documented webhook registration edit modal fix
  - Established best practices for modal forms

---

## Contributing to This Document

When you discover a solution to a recurring problem or establish a new pattern:

1. Add it to the appropriate section
2. Include code examples (before/after)
3. Reference documentation files in `/docs/`
4. Update the "Update History" section
5. Keep it concise but complete

**Remember**: This document helps future AI assistants avoid repeating solved problems and maintains consistency across the project.
