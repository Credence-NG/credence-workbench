// Debug script to check Platform Admin permissions
import { RolePermissions } from './src/config/permissions.js';
import { Features } from './src/utils/enums/features.js';
import { PlatformRoles } from './src/common/enums.js';

console.log('Platform Admin role string:', PlatformRoles.platformAdmin);
console.log('Features.SETTINGS:', Features.SETTINGS);

const platformAdminPermissions = RolePermissions.find(
  item => item.role === PlatformRoles.platformAdmin
);

console.log('Platform Admin permissions:', platformAdminPermissions);

if (platformAdminPermissions) {
  console.log('Has SETTINGS feature:', platformAdminPermissions.features.includes(Features.SETTINGS));
  console.log('Total features count:', platformAdminPermissions.features.length);
  console.log('All features in Features enum count:', Object.values(Features).length);
}

const adminPermissions = RolePermissions.find(
  item => item.role === 'admin'
);

console.log('Admin permissions:', adminPermissions);

if (adminPermissions) {
  console.log('Admin has SETTINGS feature:', adminPermissions.features.includes(Features.SETTINGS));
}

const ownerPermissions = RolePermissions.find(
  item => item.role === 'owner'
);

console.log('Owner permissions:', ownerPermissions);

if (ownerPermissions) {
  console.log('Owner has SETTINGS feature:', ownerPermissions.features.includes(Features.SETTINGS));
}
