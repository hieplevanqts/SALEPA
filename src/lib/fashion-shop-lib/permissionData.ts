import type { Permission, RoleGroup } from './store';

// Danh sách tất cả các quyền trong hệ thống
export const systemPermissions: Permission[] = [
  // System permissions
  {
    id: 'dashboard',
    name: 'Dashboard',
    description: 'Xem trang tổng quan Dashboard',
    category: 'system',
  },
  {
    id: 'settings',
    name: 'Cài đặt',
    description: 'Truy cập và thay đổi cài đặt hệ thống',
    category: 'system',
  },
  {
    id: 'shifts',
    name: 'Ca làm việc',
    description: 'Quản lý ca làm việc',
    category: 'system',
  },
  
  // Sales permissions
  {
    id: 'sales',
    name: 'Bán hàng',
    description: 'Truy cập màn hình bán hàng',
    category: 'sales',
  },
  {
    id: 'orders',
    name: 'Hóa đơn',
    description: 'Xem và quản lý hóa đơn',
    category: 'sales',
  },
  
  // Management permissions
  {
    id: 'products_view',
    name: 'Xem sản phẩm',
    description: 'Xem danh sách sản phẩm',
    category: 'management',
  },
  {
    id: 'products_edit',
    name: 'Sửa sản phẩm',
    description: 'Thêm, sửa, xóa sản phẩm',
    category: 'management',
  },
  {
    id: 'customers',
    name: 'Khách hàng',
    description: 'Quản lý khách hàng',
    category: 'management',
  },
  {
    id: 'appointments',
    name: 'Lịch hẹn',
    description: 'Quản lý lịch hẹn',
    category: 'management',
  },
  {
    id: 'users',
    name: 'Người dùng',
    description: 'Quản lý người dùng',
    category: 'management',
  },
  {
    id: 'role_groups',
    name: 'Nhóm quyền',
    description: 'Quản lý nhóm quyền',
    category: 'management',
  },
  {
    id: 'user_permissions',
    name: 'Phân quyền',
    description: 'Phân quyền cho người dùng',
    category: 'management',
  },
  {
    id: 'product_categories',
    name: 'Danh mục sản phẩm',
    description: 'Quản lý danh mục sản phẩm',
    category: 'management',
  },
  
  // Reports permissions
  {
    id: 'reports',
    name: 'Báo cáo',
    description: 'Xem báo cáo thống kê',
    category: 'reports',
  },
];

// Nhóm quyền mặc định
export const defaultRoleGroups: RoleGroup[] = [
  {
    id: '1',
    name: 'Quản trị',
    description: 'Quyền quản trị viên - Toàn quyền truy cập hệ thống',
    permissions: systemPermissions.map(p => p.id), // Full permissions
    isSystem: true,
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: '2',
    name: 'Thu ngân',
    description: 'Quyền thu ngân - Bán hàng và xem thông tin cơ bản',
    permissions: [
      'sales',
      'products_view',
      'orders',
      'reports',
      'customers',
      'appointments',
    ],
    isSystem: true,
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: '3',
    name: 'Kỹ thuật viên',
    description: 'Quyền kỹ thuật viên - Xem sản phẩm và lịch hẹn',
    permissions: [
      'products_view',
      'appointments',
    ],
    isSystem: true,
    createdAt: '2024-01-01T00:00:00.000Z',
  },
];

// Helper function to get permission name by ID
export function getPermissionName(permissionId: string): string {
  const permission = systemPermissions.find(p => p.id === permissionId);
  return permission ? permission.name : permissionId;
}

// Helper function to get role group by ID
export function getRoleGroupById(roleGroupId: string, roleGroups: RoleGroup[]): RoleGroup | undefined {
  return roleGroups.find(rg => rg.id === roleGroupId);
}

// Helper function to check if user has permission
export function userHasPermission(
  userId: string,
  permissionId: string,
  users: any[],
  roleGroups: RoleGroup[],
  userPermissionOverrides: any[]
): boolean {
  const user = users.find(u => u.id === userId);
  if (!user) return false;
  
  const roleGroup = getRoleGroupById(user.roleGroupId, roleGroups);
  if (!roleGroup) return false;
  
  // Check if permission is in role group
  const hasRolePermission = roleGroup.permissions.includes(permissionId);
  
  // Check if permission is overridden for this user
  const userOverride = userPermissionOverrides.find(uo => uo.userId === userId);
  if (userOverride) {
    // If permission was removed, return false
    if (userOverride.removedPermissions.includes(permissionId)) {
      return false;
    }
    // If permission was added, return true
    if (userOverride.addedPermissions.includes(permissionId)) {
      return true;
    }
  }
  
  return hasRolePermission;
}

// Get all effective permissions for a user
export function getUserEffectivePermissions(
  userId: string,
  users: any[],
  roleGroups: RoleGroup[],
  userPermissionOverrides: any[]
): string[] {
  const user = users.find(u => u.id === userId);
  if (!user) return [];
  
  const roleGroup = getRoleGroupById(user.roleGroupId, roleGroups);
  if (!roleGroup) return [];
  
  let permissions = [...roleGroup.permissions];
  
  const userOverride = userPermissionOverrides.find(uo => uo.userId === userId);
  if (userOverride) {
    // Remove permissions
    permissions = permissions.filter(p => !userOverride.removedPermissions.includes(p));
    // Add permissions
    permissions = [...permissions, ...userOverride.addedPermissions];
  }
  
  // Remove duplicates
  return Array.from(new Set(permissions));
}
