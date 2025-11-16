# Ecosystem Dashboard - Quick Reference Guide

## Dashboard URL
```
http://localhost:3000/ecosystems/{ecosystemId}/dashboard
```

## Features Overview

### 📊 Dashboard Sections

1. **Header Section**
   - Ecosystem name and logo
   - Status badge (ACTIVE, INACTIVE, etc.)
   - Business model indicator
   - Edit button (platform admin only)

2. **Key Metrics Cards**
   - Organizations count
   - Total transactions
   - Total revenue
   - Health score

3. **Analytics Section** (if user has permission)
   - Monthly performance metrics
   - Issuances, verifications, revenue
   - Active and new organizations count

4. **Health Metrics** (if user has permission)
   - Active organizations status
   - Transaction volume trends
   - Revenue trends
   - Settlement health

5. **Management Tabs** ⭐ NEW
   - Organizations tab
   - Credential Definitions tab (coming soon)
   - Pricing tab

6. **Quick Actions**
   - View Organizations
   - View Transactions
   - View Analytics (if permitted)
   - Manage Settings (if permitted)

---

## 🆕 New: Management Tabs

### Tab 1: Organizations

**What you can do:**
- View all member organizations
- See their roles (Issuer, Verifier, or Both)
- View performance metrics per organization
- Add new organizations (platform admin only)
- Remove organizations (platform admin only)

**"Add Organization" Flow:**
```
1. Click "Add Organization" button
2. Search for organization (optional)
3. Browse paginated list
4. Click on organization to select
5. Choose role:
   - Issuer Only: Can only issue credentials
   - Verifier Only: Can only verify credentials  
   - Issuer & Verifier: Can do both
6. Click "Add Organization"
7. See success message
8. Organization appears in list
```

**Organization List Features:**
- Search by name
- Pagination (10 per page)
- Sort options
- Performance metrics displayed
- Remove button for each organization

---

### Tab 2: Credential Definitions

**Status:** Coming Soon

**Planned Features:**
- List supported credential types
- Add new credential definitions
- Edit credential metadata
- Link to pricing configuration
- View usage statistics

**When ready, you'll be able to:**
- Define what credentials can be issued in the ecosystem
- Specify credential attributes and schema
- Set versioning for credentials
- Enable/disable specific credential types

---

### Tab 3: Pricing

**What you can do:**
- Set pricing for credential operations
- Configure per credential definition
- Set issuance prices
- Set verification prices
- Set revocation prices (optional)
- Choose currency

**Pricing Form:**
```typescript
{
  credentialDefinitionId: string;  // Required
  issuancePrice: number;           // Required (can be 0)
  verificationPrice: number;       // Required (can be 0)
  revocationPrice: number;         // Optional
  currency: string;                // Default: USD
}
```

**Example Pricing Setup:**
```
Credential: "University Degree"
- Issuance: $5.00
- Verification: $0.50
- Revocation: $2.00
- Currency: USD
```

---

## 🎭 Roles and Permissions

### Platform Admin
✅ Can add organizations
✅ Can edit ecosystem
✅ Can set pricing
✅ Can view analytics
✅ Can manage settings
✅ Can remove organizations

### Ecosystem Owner
✅ Can view organizations
✅ Can view transactions
⚠️ May have limited edit permissions (depends on configuration)

### Organization Member
✅ Can view ecosystem details
✅ Can view their organization's data
❌ Cannot add/remove organizations
❌ Cannot set pricing

---

## 💡 Quick Tips

### Adding Your First Organization
1. Go to Organizations tab
2. Click "Add Organization"
3. Search for the organization name
4. Select it from the list
5. Choose "Issuer & Verifier" (most common)
6. Submit

### Setting Up Pricing
1. First, ensure credential definitions exist
2. Go to Pricing tab
3. Enter credential definition ID
4. Set prices (can be 0 for free)
5. Submit

### Best Practices
- **Issuer Only**: For organizations that only issue credentials (e.g., universities, government agencies)
- **Verifier Only**: For organizations that only verify credentials (e.g., background check services)
- **Both**: For organizations that both issue and verify (e.g., employers, professional associations)

---

## 🔍 Troubleshooting

### "Add Organization" button not visible
- ✅ Check: Are you logged in as platform admin?
- ✅ Check: Do you have `canCreate` or `canEdit` permission?
- ✅ Check: Are you viewing the Organizations tab?

### Organization not appearing in list
- ✅ Check: Does the organization exist on the platform?
- ✅ Check: Is the organization already a member of this ecosystem?
- ✅ Try: Refresh the page
- ✅ Try: Search by exact organization name

### Cannot set pricing
- ✅ Check: Do you have `canSetPricing` permission?
- ✅ Check: Does the credential definition ID exist?
- ✅ Check: Are all required fields filled?
- ✅ Try: Use valid credential definition ID from the ecosystem

### Search not working
- ✅ Try: Use partial name match
- ✅ Try: Wait for debounce (500ms)
- ✅ Try: Clear search and browse all organizations
- ✅ Check: Internet connection

---

## 📱 Mobile/Responsive Notes

The dashboard is fully responsive:
- Tabs stack vertically on mobile
- Tables scroll horizontally if needed
- Modals adapt to screen size
- Forms remain usable on small screens

---

## 🚀 Next Steps

After adding organizations:
1. Set up pricing for credential operations
2. Configure ecosystem settings
3. Monitor transactions
4. Review analytics
5. Process settlements

---

## 📞 Need Help?

- Review: `docs/ECOSYSTEM_DASHBOARD_MANAGEMENT.md` for technical details
- Check: `docs/BACKEND_API_REQUIREMENTS.md` for API reference
- Contact: Your platform administrator for permission issues

---

## Feature Status

| Feature | Status | Notes |
|---------|--------|-------|
| Add Organizations | ✅ Live | Fully functional |
| Remove Organizations | ✅ Live | Via OrganizationList |
| View Organizations | ✅ Live | With metrics |
| Set Pricing | ✅ Live | Via PricingManager |
| View Pricing | ✅ Live | List view available |
| Credential Definitions | ⏳ Coming Soon | Placeholder shown |
| Bulk Operations | ⏳ Future | Not yet available |
| Advanced Filters | ⏳ Future | Basic search only |

---

## Version Info
- Implementation Date: October 6, 2025
- Last Updated: October 6, 2025
- Version: 1.0.0
