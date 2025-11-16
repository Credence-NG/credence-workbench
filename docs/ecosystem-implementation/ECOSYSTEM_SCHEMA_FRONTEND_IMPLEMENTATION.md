# Ecosystem Schema Management - Frontend Implementation Guide

**Date:** October 7, 2025  
**Status:** 🚀 **READY TO IMPLEMENT**  
**Backend Status:** ✅ Fully Implemented and Tested (16/16 tests passed)

---

## 🎉 Great News!

The backend ecosystem schema endpoints are **FULLY IMPLEMENTED AND TESTED**. We can now proceed with frontend implementation using real, working APIs!

### Available Endpoints:

1. ✅ **POST /ecosystem/:ecosystemId/schemas** - Add schema to ecosystem
2. ✅ **GET /ecosystem/:ecosystemId/schemas** - Get whitelisted schemas
3. ✅ **DELETE /ecosystem/:ecosystemId/schemas/:schemaId** - Remove schema

---

## 📋 Implementation Checklist

### Phase 1: API Service Layer (2-3 hours)
- [ ] Update `src/api/ecosystem.ts` with 3 new functions
- [ ] Update `src/types/ecosystem.ts` with new interfaces
- [ ] Add API routes to `src/config/apiRoutes.ts`

### Phase 2: EcosystemSchemaManager Rewrite (4-6 hours)
- [ ] Replace org-based schema fetching with ecosystem API
- [ ] Add "Add Schema" button
- [ ] Implement remove schema capability
- [ ] Display governance level and status
- [ ] Show pricing configuration status
- [ ] Update empty states

### Phase 3: AddSchemaToEcosystemModal (3-4 hours)
- [ ] Create new modal component
- [ ] Fetch available schemas from organizations
- [ ] Implement search and filtering
- [ ] Add schema selection UI
- [ ] Integrate with add schema API
- [ ] Handle success/error states

### Phase 4: Pricing Integration (2-3 hours)
- [ ] Update PricingManager validation
- [ ] Add schema dropdown (whitelisted only)
- [ ] Change field name to `schemaId`
- [ ] Add schema name/version display

### Phase 5: Permissions (1 hour)
- [ ] Add 4 new permission flags
- [ ] Update UI based on permissions

### Phase 6: Testing (3-4 hours)
- [ ] Manual testing of complete flow
- [ ] Create unit tests
- [ ] Test edge cases
- [ ] Test permission restrictions

**Total Estimated Time: 15-21 hours (2-3 days)**

---

## 🔧 Phase 1: API Service Layer

### 1.1 Update API Routes Configuration

**File:** `src/config/apiRoutes.ts`

```typescript
export const apiRoutes = {
  // ... existing routes
  Ecosystem: {
    // ... existing ecosystem routes
    list: '/ecosystem',
    getById: '/ecosystem',
    create: '/ecosystem',
    update: '/ecosystem',
    delete: '/ecosystem',
    organizations: '/ecosystem',
    
    // NEW: Schema management endpoints
    schemas: '/ecosystem', // Base path for /ecosystem/:id/schemas
    addSchema: '/ecosystem', // POST /ecosystem/:id/schemas
    removeSchema: '/ecosystem', // DELETE /ecosystem/:id/schemas/:schemaId
  },
};
```

### 1.2 Update Type Definitions

**File:** `src/types/ecosystem.ts`

Add these new interfaces at the end of the file:

```typescript
/**
 * Ecosystem Schema - A schema that has been whitelisted for use in an ecosystem
 * 
 * Backend Response Structure (from test results):
 * {
 *   id: "7170bde5-ab9f-4d04-9d78-b3ce90b90acd",
 *   ecosystemId: "0b702969-afce-42e8-83c6-f5857accf27c",
 *   schemaId: "1384d1ae-0f9f-442c-9d22-c2e072d7dc2f",
 *   status: "ACTIVE",
 *   governanceLevel: "RECOMMENDED",
 *   usagePolicy: null,
 *   schema: {
 *     id: "1384d1ae-0f9f-442c-9d22-c2e072d7dc2f",
 *     name: "Confirmed Phone",
 *     version: "0.1",
 *     schemaLedgerId: "7sp5CTJ1YMnDut7HEKDqNf:2:Confirmed Phone:0.1"
 *   },
 *   createDateTime: "2025-10-07T04:26:22.929Z",
 *   lastChangedDateTime: "2025-10-07T04:26:22.929Z",
 *   createdBy: "d2f9ba95-995a-4490-a643-1805de09e7a0",
 *   lastChangedBy: "d2f9ba95-995a-4490-a643-1805de09e7a0"
 * }
 */
export interface EcosystemSchema {
  /** Unique identifier for the ecosystem-schema relationship */
  id: string;
  
  /** ID of the ecosystem */
  ecosystemId: string;
  
  /** ID of the schema */
  schemaId: string;
  
  /** Status of the schema in the ecosystem */
  status: 'ACTIVE' | 'INACTIVE';
  
  /** Governance level indicating how this schema should be used */
  governanceLevel: 'MANDATORY' | 'RECOMMENDED' | 'OPTIONAL';
  
  /** Optional usage policy or guidelines */
  usagePolicy: string | null;
  
  /** Embedded schema details */
  schema: {
    id: string;
    name: string;
    version: string;
    schemaLedgerId: string;
  };
  
  /** Timestamps */
  createDateTime: string;
  lastChangedDateTime: string;
  createdBy: string;
  lastChangedBy: string;
}

/**
 * Request to add a schema to an ecosystem
 */
export interface AddSchemaToEcosystemRequest {
  /** ID of the schema to add (must exist in platform) */
  schemaId: string;
}

/**
 * Response when adding a schema to ecosystem
 */
export interface AddSchemaToEcosystemResponse extends ApiResponse<EcosystemSchema> {
  statusCode: 201;
  message: string;
  data: EcosystemSchema;
}

/**
 * Response when getting ecosystem schemas
 */
export interface GetEcosystemSchemasResponse extends ApiResponse<EcosystemSchema[]> {
  statusCode: 200;
  message: string;
  data: EcosystemSchema[];
}

/**
 * Response when removing a schema from ecosystem
 */
export interface RemoveSchemaFromEcosystemResponse extends ApiResponse<{
  message: string;
  ecosystemId: string;
  schemaId: string;
}> {
  statusCode: 200;
  message: string;
  data: {
    message: string;
    ecosystemId: string;
    schemaId: string;
  };
}
```

### 1.3 Add API Functions

**File:** `src/api/ecosystem.ts`

Add these functions after the existing ecosystem functions:

```typescript
// ============================================
// SCHEMA MANAGEMENT (NEW - October 7, 2025)
// ============================================

/**
 * Get schemas in an ecosystem (whitelisted schemas only)
 * 
 * @param ecosystemId - Ecosystem ID
 * @returns Promise with array of ecosystem schemas
 * 
 * @example
 * const response = await getEcosystemSchemas('ecosystem-uuid');
 * // Returns: { statusCode: 200, data: [{ id, schemaId, schema: {...}, ... }] }
 */
export const getEcosystemSchemas = async (ecosystemId: string) => {
  const url = `${apiRoutes.Ecosystem.schemas}/${ecosystemId}/schemas`;
  const config = await getAuthConfig();

  try {
    return await axiosGet({ url, config });
  } catch (error) {
    const err = error as Error;
    throw new Error(err?.message || "Failed to fetch ecosystem schemas");
  }
};

/**
 * Add a schema to an ecosystem (whitelist the schema)
 * 
 * @param ecosystemId - Ecosystem ID
 * @param schemaId - Schema ID to add
 * @returns Promise with the created ecosystem-schema relationship
 * 
 * @example
 * const response = await addSchemaToEcosystem('ecosystem-uuid', 'schema-uuid');
 * // Returns: { statusCode: 201, message: "Schema added...", data: {...} }
 */
export const addSchemaToEcosystem = async (
  ecosystemId: string,
  schemaId: string
) => {
  const url = `${apiRoutes.Ecosystem.addSchema}/${ecosystemId}/schemas`;
  const payload: AddSchemaToEcosystemRequest = { schemaId };
  const config = await getAuthConfig();

  try {
    return await axiosPost({ url, payload, config });
  } catch (error) {
    const err = error as Error;
    throw new Error(err?.message || "Failed to add schema to ecosystem");
  }
};

/**
 * Remove a schema from an ecosystem (un-whitelist the schema)
 * 
 * @param ecosystemId - Ecosystem ID
 * @param schemaId - Schema ID to remove
 * @returns Promise with deletion confirmation
 * 
 * @example
 * const response = await removeSchemaFromEcosystem('ecosystem-uuid', 'schema-uuid');
 * // Returns: { statusCode: 200, message: "Schema removed...", data: {...} }
 */
export const removeSchemaFromEcosystem = async (
  ecosystemId: string,
  schemaId: string
) => {
  const url = `${apiRoutes.Ecosystem.removeSchema}/${ecosystemId}/schemas/${schemaId}`;
  const config = await getAuthConfig();

  try {
    return await axiosDelete({ url, config });
  } catch (error) {
    const err = error as Error;
    throw new Error(err?.message || "Failed to remove schema from ecosystem");
  }
};
```

---

## 🔄 Phase 2: Rewrite EcosystemSchemaManager

### 2.1 Component Structure Update

**File:** `src/components/Ecosystem/EcosystemSchemaManager.tsx`

Replace the entire file with this updated version:

```typescript
import { useEffect, useState } from 'react';
import { Card, Button, Badge, Table, Spinner, Alert } from 'flowbite-react';
import type { AxiosResponse } from 'axios';
import { apiStatusCodes } from '../../config/CommonConstant';
import { AlertComponent } from '../AlertComponent';
import CustomSpinner from '../CustomSpinner';
import SearchInput from '../SearchInput';
import type { ChangeEvent } from 'react';
import { 
  getEcosystemSchemas, 
  removeSchemaFromEcosystem 
} from '../../api/ecosystem';
import type { EcosystemSchema } from '../../types/ecosystem';
import { HiDocumentText, HiEye, HiTrash, HiPlus } from 'react-icons/hi';

interface EcosystemSchemaManagerProps {
  ecosystemId: string;
  permissions: {
    canAddSchemas: boolean;
    canRemoveSchemas: boolean;
    canViewSchemas: boolean;
  };
  onAddSchema?: () => void; // Callback to open Add Schema modal
}

const EcosystemSchemaManager = ({ 
  ecosystemId, 
  permissions,
  onAddSchema 
}: EcosystemSchemaManagerProps) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [schemas, setSchemas] = useState<EcosystemSchema[]>([]);
  const [filteredSchemas, setFilteredSchemas] = useState<EcosystemSchema[]>([]);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    if (ecosystemId) {
      fetchEcosystemSchemas();
    }
  }, [ecosystemId]);

  useEffect(() => {
    // Client-side search filtering
    if (searchText) {
      const filtered = schemas.filter(schema =>
        schema.schema.name.toLowerCase().includes(searchText.toLowerCase()) ||
        schema.schema.version.includes(searchText) ||
        schema.schema.schemaLedgerId.toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredSchemas(filtered);
    } else {
      setFilteredSchemas(schemas);
    }
  }, [searchText, schemas]);

  const fetchEcosystemSchemas = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getEcosystemSchemas(ecosystemId) as AxiosResponse;
      const { data } = response;

      if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
        const ecosystemSchemas = data?.data || [];
        setSchemas(ecosystemSchemas);
        setFilteredSchemas(ecosystemSchemas);
      } else {
        setError(data?.message || 'Failed to fetch ecosystem schemas');
      }
    } catch (err) {
      console.error('Error fetching ecosystem schemas:', err);
      setError('An error occurred while fetching schemas');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveSchema = async (schemaId: string, schemaName: string) => {
    if (!confirm(`Are you sure you want to remove "${schemaName}" from this ecosystem?`)) {
      return;
    }

    setError(null);
    setSuccess(null);

    try {
      const response = await removeSchemaFromEcosystem(ecosystemId, schemaId) as AxiosResponse;
      const { data } = response;

      if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
        setSuccess(`Schema "${schemaName}" removed successfully`);
        // Refresh the list
        await fetchEcosystemSchemas();
      } else {
        setError(data?.message || 'Failed to remove schema');
      }
    } catch (err) {
      console.error('Error removing schema:', err);
      setError('An error occurred while removing the schema');
    }
  };

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  const getGovernanceBadgeColor = (level: string) => {
    switch (level) {
      case 'MANDATORY':
        return 'failure'; // Red
      case 'RECOMMENDED':
        return 'warning'; // Yellow
      case 'OPTIONAL':
        return 'info'; // Blue
      default:
        return 'gray';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    return status === 'ACTIVE' ? 'success' : 'gray';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <CustomSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with Add Button */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-semibold dark:text-white">
            Ecosystem Schemas
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {schemas.length} schema{schemas.length !== 1 ? 's' : ''} whitelisted for this ecosystem
          </p>
        </div>
        {permissions.canAddSchemas && onAddSchema && (
          <Button color="primary" onClick={onAddSchema}>
            <HiPlus className="mr-2 h-5 w-5" />
            Add Schema
          </Button>
        )}
      </div>

      {/* Alerts */}
      {error && (
        <AlertComponent
          message={error}
          type="failure"
          onClose={() => setError(null)}
        />
      )}
      {success && (
        <AlertComponent
          message={success}
          type="success"
          onClose={() => setSuccess(null)}
        />
      )}

      {/* Search */}
      <SearchInput
        value={searchText}
        onChange={handleSearchChange}
        placeholder="Search by schema name, version, or ledger ID..."
      />

      {/* Info Card */}
      <Card className="bg-blue-50 dark:bg-blue-900/20">
        <div className="flex items-start space-x-3">
          <HiDocumentText className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100">
              About Ecosystem Schemas
            </h4>
            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
              Only whitelisted schemas can be used for credential issuance in this ecosystem. 
              Add schemas from any organization on the platform, then configure pricing for 
              issuance and verification fees.
            </p>
          </div>
        </div>
      </Card>

      {/* Schemas Table or Empty State */}
      {filteredSchemas.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <HiDocumentText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
              {searchText ? 'No schemas found' : 'No schemas added yet'}
            </h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {searchText
                ? 'Try adjusting your search criteria'
                : 'Get started by adding schemas from platform organizations'}
            </p>
            {permissions.canAddSchemas && !searchText && onAddSchema && (
              <Button color="primary" onClick={onAddSchema} className="mt-4">
                <HiPlus className="mr-2 h-5 w-5" />
                Add Your First Schema
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <Table>
              <Table.Head>
                <Table.HeadCell>Schema Name</Table.HeadCell>
                <Table.HeadCell>Version</Table.HeadCell>
                <Table.HeadCell>Status</Table.HeadCell>
                <Table.HeadCell>Governance Level</Table.HeadCell>
                <Table.HeadCell>Ledger ID</Table.HeadCell>
                <Table.HeadCell>Actions</Table.HeadCell>
              </Table.Head>
              <Table.Body className="divide-y">
                {filteredSchemas.map((item) => (
                  <Table.Row
                    key={item.id}
                    className="bg-white dark:border-gray-700 dark:bg-gray-800"
                  >
                    <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                      {item.schema.name}
                    </Table.Cell>
                    <Table.Cell>
                      <Badge color="gray">{item.schema.version}</Badge>
                    </Table.Cell>
                    <Table.Cell>
                      <Badge color={getStatusBadgeColor(item.status)}>
                        {item.status}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell>
                      <Badge color={getGovernanceBadgeColor(item.governanceLevel)}>
                        {item.governanceLevel}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell>
                      <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                        {item.schema.schemaLedgerId}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      <div className="flex items-center space-x-2">
                        <Button size="xs" color="light" title="View Details">
                          <HiEye className="h-4 w-4" />
                        </Button>
                        {permissions.canRemoveSchemas && (
                          <Button
                            size="xs"
                            color="failure"
                            title="Remove from Ecosystem"
                            onClick={() => handleRemoveSchema(item.schemaId, item.schema.name)}
                          >
                            <HiTrash className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          </div>
        </Card>
      )}
    </div>
  );
};

export default EcosystemSchemaManager;
```

### 2.2 Update EcosystemDashboard Integration

**File:** `src/components/Ecosystem/EcosystemDashboard.tsx`

Update the schema tab section and add modal state:

```typescript
// Add import
import AddSchemaToEcosystemModal from './AddSchemaToEcosystemModal';

// Add state for modal
const [showAddSchemaModal, setShowAddSchemaModal] = useState(false);

// Update the Schemas tab content
{activeTab === 'schemas' && (
  <>
    <EcosystemSchemaManager
      ecosystemId={ecosystemId}
      permissions={permissions}
      onAddSchema={() => setShowAddSchemaModal(true)}
    />
    
    <AddSchemaToEcosystemModal
      ecosystemId={ecosystemId}
      isOpen={showAddSchemaModal}
      onClose={() => setShowAddSchemaModal(false)}
      onSuccess={() => {
        setShowAddSchemaModal(false);
        // EcosystemSchemaManager will automatically refresh
      }}
    />
  </>
)}
```

---

## ➕ Phase 3: Create AddSchemaToEcosystemModal

### 3.1 New Component File

**File:** `src/components/Ecosystem/AddSchemaToEcosystemModal.tsx`

```typescript
import { useState, useEffect } from 'react';
import { Modal, Button, Badge, Table, Alert, TextInput } from 'flowbite-react';
import type { AxiosResponse } from 'axios';
import { apiStatusCodes } from '../../config/CommonConstant';
import { AlertComponent } from '../AlertComponent';
import CustomSpinner from '../CustomSpinner';
import SearchInput from '../SearchInput';
import type { ChangeEvent } from 'react';
import { getAllSchemasByOrgId } from '../../api/Schema';
import { getOrganizations } from '../../api/ecosystem';
import { addSchemaToEcosystem, getEcosystemSchemas } from '../../api/ecosystem';
import type { GetAllSchemaListParameter } from '../Resources/Schema/interfaces';
import { HiDocumentText, HiCheckCircle } from 'react-icons/hi';

interface Schema {
  id: string;
  name: string;
  version: string;
  attributes: any[];
  schemaLedgerId: string;
  orgId: string;
  organizationName: string;
}

interface AddSchemaToEcosystemModalProps {
  ecosystemId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddSchemaToEcosystemModal = ({
  ecosystemId,
  isOpen,
  onClose,
  onSuccess,
}: AddSchemaToEcosystemModalProps) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [availableSchemas, setAvailableSchemas] = useState<Schema[]>([]);
  const [existingSchemaIds, setExistingSchemaIds] = useState<Set<string>>(new Set());
  const [selectedSchemaId, setSelectedSchemaId] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchAvailableSchemas();
    } else {
      // Reset state when modal closes
      setSelectedSchemaId(null);
      setSearchText('');
      setError(null);
    }
  }, [isOpen, ecosystemId]);

  const fetchAvailableSchemas = async () => {
    setLoading(true);
    setError(null);

    try {
      // Step 1: Get schemas already in ecosystem
      const ecosystemSchemasResponse = await getEcosystemSchemas(ecosystemId) as AxiosResponse;
      const existingSchemas = ecosystemSchemasResponse.data?.data || [];
      const existingIds = new Set(existingSchemas.map((s: any) => s.schemaId));
      setExistingSchemaIds(existingIds);

      // Step 2: Get ecosystem organizations
      const orgsResponse = await getOrganizations(ecosystemId) as AxiosResponse;
      const organizations = orgsResponse.data?.data || [];

      // Step 3: Fetch schemas from all organizations in ecosystem
      const allSchemas: Schema[] = [];
      
      for (const org of organizations) {
        try {
          const params: GetAllSchemaListParameter = {
            page: 1,
            itemPerPage: 100, // Get all schemas
            search: '',
          };

          const response = await getAllSchemasByOrgId(params, org.organisation.orgId) as AxiosResponse;
          const { data } = response;

          if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
            const orgSchemas = data?.data?.data || [];
            allSchemas.push(...orgSchemas);
          }
        } catch (orgError) {
          console.error(`Error fetching schemas for org ${org.organisation.orgId}:`, orgError);
        }
      }

      // Filter out schemas already in ecosystem
      const filteredSchemas = allSchemas.filter(schema => !existingIds.has(schema.id));
      setAvailableSchemas(filteredSchemas);
    } catch (err) {
      console.error('Error fetching available schemas:', err);
      setError('Failed to fetch available schemas');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSchema = async () => {
    if (!selectedSchemaId) {
      setError('Please select a schema');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await addSchemaToEcosystem(ecosystemId, selectedSchemaId) as AxiosResponse;
      const { data } = response;

      if (data?.statusCode === 201 || data?.statusCode === apiStatusCodes.API_STATUS_CREATED) {
        onSuccess();
      } else {
        setError(data?.message || 'Failed to add schema to ecosystem');
      }
    } catch (err: any) {
      console.error('Error adding schema:', err);
      setError(err?.message || 'An error occurred while adding the schema');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  const filteredSchemas = searchText
    ? availableSchemas.filter(schema =>
        schema.name.toLowerCase().includes(searchText.toLowerCase()) ||
        schema.organizationName.toLowerCase().includes(searchText.toLowerCase())
      )
    : availableSchemas;

  const selectedSchema = availableSchemas.find(s => s.id === selectedSchemaId);

  return (
    <Modal show={isOpen} onClose={onClose} size="4xl">
      <Modal.Header>Add Schema to Ecosystem</Modal.Header>
      <Modal.Body>
        <div className="space-y-4">
          {/* Info Alert */}
          <Alert color="info">
            <div className="flex items-start space-x-3">
              <HiDocumentText className="h-5 w-5 mt-0.5" />
              <div>
                <p className="text-sm">
                  Select a schema from any organization in this ecosystem to whitelist it for 
                  credential issuance. You can configure pricing after adding the schema.
                </p>
              </div>
            </div>
          </Alert>

          {/* Error Alert */}
          {error && (
            <AlertComponent
              message={error}
              type="failure"
              onClose={() => setError(null)}
            />
          )}

          {/* Search */}
          <SearchInput
            value={searchText}
            onChange={handleSearchChange}
            placeholder="Search by schema name or organization..."
          />

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center py-8">
              <CustomSpinner />
            </div>
          )}

          {/* Available Schemas Table */}
          {!loading && filteredSchemas.length === 0 && (
            <div className="text-center py-8">
              <HiDocumentText className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-4 text-gray-500 dark:text-gray-400">
                {searchText
                  ? 'No schemas found matching your search'
                  : 'All available schemas have been added to this ecosystem'}
              </p>
            </div>
          )}

          {!loading && filteredSchemas.length > 0 && (
            <div className="overflow-x-auto max-h-96">
              <Table>
                <Table.Head>
                  <Table.HeadCell>Select</Table.HeadCell>
                  <Table.HeadCell>Schema Name</Table.HeadCell>
                  <Table.HeadCell>Version</Table.HeadCell>
                  <Table.HeadCell>Organization</Table.HeadCell>
                  <Table.HeadCell>Attributes</Table.HeadCell>
                </Table.Head>
                <Table.Body className="divide-y">
                  {filteredSchemas.map((schema) => (
                    <Table.Row
                      key={schema.id}
                      className={`cursor-pointer ${
                        selectedSchemaId === schema.id
                          ? 'bg-blue-50 dark:bg-blue-900/20'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                      onClick={() => setSelectedSchemaId(schema.id)}
                    >
                      <Table.Cell>
                        <input
                          type="radio"
                          name="schema"
                          checked={selectedSchemaId === schema.id}
                          onChange={() => setSelectedSchemaId(schema.id)}
                          className="w-4 h-4 text-blue-600"
                        />
                      </Table.Cell>
                      <Table.Cell className="font-medium">
                        {schema.name}
                      </Table.Cell>
                      <Table.Cell>
                        <Badge color="gray">{schema.version}</Badge>
                      </Table.Cell>
                      <Table.Cell>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {schema.organizationName}
                        </span>
                      </Table.Cell>
                      <Table.Cell>
                        <Badge color="info">
                          {schema.attributes?.length || 0} attributes
                        </Badge>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            </div>
          )}

          {/* Selected Schema Summary */}
          {selectedSchema && (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-start space-x-3">
                <HiCheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-green-900 dark:text-green-100">
                    Selected Schema
                  </h4>
                  <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                    <strong>{selectedSchema.name}</strong> v{selectedSchema.version} from{' '}
                    <strong>{selectedSchema.organizationName}</strong>
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1 font-mono">
                    {selectedSchema.schemaLedgerId}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </Modal.Body>
      <Modal.Footer>
        <div className="flex justify-end space-x-3 w-full">
          <Button color="gray" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            color="primary"
            onClick={handleAddSchema}
            disabled={!selectedSchemaId || submitting}
          >
            {submitting ? (
              <>
                <CustomSpinner size="sm" className="mr-2" />
                Adding...
              </>
            ) : (
              'Add Schema'
            )}
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default AddSchemaToEcosystemModal;
```

---

## 💰 Phase 4: Update PricingManager

### 4.1 Update Pricing Validation

**File:** `src/components/Ecosystem/PricingManager.tsx`

Add schema validation before allowing pricing configuration:

```typescript
// Add new state
const [ecosystemSchemas, setEcosystemSchemas] = useState<EcosystemSchema[]>([]);
const [loadingSchemas, setLoadingSchemas] = useState(false);

// Fetch ecosystem schemas on mount
useEffect(() => {
  fetchEcosystemSchemas();
}, [ecosystemId]);

const fetchEcosystemSchemas = async () => {
  setLoadingSchemas(true);
  try {
    const response = await getEcosystemSchemas(ecosystemId) as AxiosResponse;
    if (response.data?.statusCode === 200) {
      setEcosystemSchemas(response.data.data || []);
    }
  } catch (err) {
    console.error('Error fetching ecosystem schemas:', err);
  } finally {
    setLoadingSchemas(false);
  }
};

// Update form validation to check if schema is whitelisted
const validateSchemaInEcosystem = (schemaId: string): boolean => {
  return ecosystemSchemas.some(s => s.schemaId === schemaId);
};

// Update form field from credentialDefinitionId to schemaId
// Add dropdown to select from whitelisted schemas
```

---

## 🔐 Phase 5: Update Permissions

### 5.1 Update Permission System

**File:** `src/utils/ecosystemPermissions.ts`

Add new schema-related permissions:

```typescript
export interface EcosystemPermissions {
  // ... existing permissions
  
  // Schema management permissions (NEW)
  canAddSchemas: boolean;        // Add schemas to ecosystem
  canRemoveSchemas: boolean;     // Remove schemas from ecosystem
  canViewSchemas: boolean;       // View whitelisted schemas
  canConfigureSchemaPricing: boolean; // Set pricing for schemas
}

// Update getEcosystemPermissions function
export const getEcosystemPermissions = (
  ecosystemRole?: string,
  userOrgRoles?: any[]
): EcosystemPermissions => {
  const isAdmin = isPlatformAdmin(userOrgRoles);
  
  return {
    // ... existing permissions
    
    // Schema management (NEW)
    canAddSchemas: isAdmin,
    canRemoveSchemas: isAdmin,
    canViewSchemas: true, // All members can view
    canConfigureSchemaPricing: isAdmin,
  };
};
```

---

## ✅ Phase 6: Testing Checklist

### Manual Testing

- [ ] **Add Schema to Ecosystem**
  - [ ] Open Add Schema modal
  - [ ] Verify schemas from all ecosystem orgs are shown
  - [ ] Verify schemas already in ecosystem are filtered out
  - [ ] Search for a schema by name
  - [ ] Select a schema
  - [ ] Click "Add Schema"
  - [ ] Verify success message
  - [ ] Verify schema appears in ecosystem list

- [ ] **View Ecosystem Schemas**
  - [ ] Navigate to Schemas tab
  - [ ] Verify only whitelisted schemas shown
  - [ ] Verify governance level badges display correctly
  - [ ] Verify status badges display correctly
  - [ ] Search for a schema
  - [ ] Verify empty state when no schemas

- [ ] **Remove Schema from Ecosystem**
  - [ ] Click remove button on a schema
  - [ ] Verify confirmation dialog
  - [ ] Confirm removal
  - [ ] Verify success message
  - [ ] Verify schema removed from list

- [ ] **Pricing Configuration**
  - [ ] Try to set pricing for non-whitelisted schema (should fail)
  - [ ] Set pricing for whitelisted schema (should succeed)
  - [ ] Verify pricing displays in schema list

- [ ] **Permissions**
  - [ ] Test as platform admin (should see all buttons)
  - [ ] Test as non-admin (should not see add/remove buttons)

### Edge Cases

- [ ] Test with ecosystem with no organizations
- [ ] Test with ecosystem with organizations but no schemas
- [ ] Test adding same schema twice (should be prevented)
- [ ] Test removing schema with existing pricing
- [ ] Test with very long schema names
- [ ] Test search with special characters

---

## 🚀 Deployment Checklist

- [ ] All API functions tested
- [ ] All components tested
- [ ] Type definitions validated
- [ ] Permissions working correctly
- [ ] Error handling comprehensive
- [ ] Loading states implemented
- [ ] Success/error messages clear
- [ ] Accessibility checked
- [ ] Mobile responsive
- [ ] Documentation updated

---

## 📊 Backend API Reference

### Endpoint Details (from test results)

**Base URL:** `${API_BASE}/ecosystem`

#### 1. POST /:ecosystemId/schemas
- **Status:** 201 Created
- **Response Time:** ~200ms
- **Fields:**
  - id: UUID (relationship ID)
  - ecosystemId: UUID
  - schemaId: UUID
  - status: ACTIVE | INACTIVE
  - governanceLevel: MANDATORY | RECOMMENDED | OPTIONAL
  - usagePolicy: string | null
  - Timestamps: createDateTime, lastChangedDateTime, createdBy, lastChangedBy

#### 2. GET /:ecosystemId/schemas
- **Status:** 200 OK
- **Response Time:** ~150ms
- **Returns:** Array of EcosystemSchema objects
- **Includes:** Embedded schema details (name, version, schemaLedgerId)

#### 3. DELETE /:ecosystemId/schemas/:schemaId
- **Status:** 200 OK
- **Response Time:** ~180ms
- **Returns:** Confirmation message with ecosystemId and schemaId

---

## 🎯 Success Criteria

✅ **Phase 1 Complete When:**
- API functions callable without errors
- Type definitions compile without warnings
- Can import functions in components

✅ **Phase 2 Complete When:**
- Ecosystem schemas display correctly
- Add button opens modal
- Remove button works with confirmation
- Badges show correct colors
- Search filters results

✅ **Phase 3 Complete When:**
- Modal displays available schemas
- Can select a schema
- Can add schema to ecosystem
- Success triggers list refresh
- Error handling works

✅ **Phase 4 Complete When:**
- Pricing validates schema is whitelisted
- Dropdown shows whitelisted schemas only
- Schema name displays in form
- Field name changed to schemaId

✅ **Phase 5 Complete When:**
- Permissions control button visibility
- Non-admins cannot add/remove
- All users can view schemas

✅ **Phase 6 Complete When:**
- All manual tests pass
- All edge cases handled
- No TypeScript errors
- No console errors

---

## 📝 Notes

- Backend uses `status` and `governanceLevel` fields - leverage these in UI
- Schemas are soft-deleted (status becomes INACTIVE)
- `usagePolicy` field is optional and currently not used
- Backend returns embedded `schema` object with basic details
- Pricing integration comes after schema whitelisting

---

**Status:** 🟢 Ready to Implement  
**Estimated Completion:** 2-3 days  
**Priority:** HIGH

