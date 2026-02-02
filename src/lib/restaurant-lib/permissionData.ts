import type { Permission, RoleGroup } from './store';

// Danh sách tất cả các quyền trong hệ thống
// Phân quyền dựa 100% trên nghiệp vụ thực tế - các hành động được thực hiện
export const systemPermissions: Permission[] = [
  // ===== HỆ THỐNG =====
  {
    id: 'view_dashboard',
    name: 'Xem Dashboard',
    description: 'Xem trang tổng quan Dashboard với thống kê tổng hợp',
    category: 'system',
  },
  {
    id: 'manage_settings',
    name: 'Quản lý cài đặt',
    description: 'Thay đổi cài đặt hệ thống, cấu hình chung',
    category: 'system',
  },
  {
    id: 'manage_shifts',
    name: 'Quản lý ca làm việc',
    description: 'Mở/đóng ca, xem lịch sử ca làm việc',
    category: 'system',
  },
  
  // ===== BÁN HÀNG =====
  {
    id: 'create_order',
    name: 'Tạo đơn hàng',
    description: 'Tạo đơn hàng mới, bán hàng cho khách',
    category: 'sales',
  },
  {
    id: 'view_orders',
    name: 'Xem đơn hàng',
    description: 'Xem danh sách và chi tiết đơn hàng',
    category: 'sales',
  },
  {
    id: 'edit_order',
    name: 'Sửa đơn hàng',
    description: 'Chỉnh sửa thông tin đơn hàng đã tạo',
    category: 'sales',
  },
  {
    id: 'delete_order',
    name: 'Xóa đơn hàng',
    description: 'Xóa đơn hàng khỏi hệ thống',
    category: 'sales',
  },
  {
    id: 'apply_discount',
    name: 'Áp dụng giảm giá',
    description: 'Áp dụng giảm giá cho đơn hàng',
    category: 'sales',
  },
  {
    id: 'apply_voucher',
    name: 'Áp dụng voucher',
    description: 'Nhập và áp dụng mã voucher giảm giá',
    category: 'sales',
  },
  {
    id: 'override_price',
    name: 'Sửa giá sản phẩm',
    description: 'Thay đổi giá sản phẩm trong đơn hàng',
    category: 'sales',
  },
  {
    id: 'process_refund',
    name: 'Hoàn tiền',
    description: 'Xử lý hoàn tiền cho đơn hàng',
    category: 'sales',
  },
  {
    id: 'split_payment',
    name: 'Thanh toán chia',
    description: 'Chia nhỏ thanh toán nhiều phương thức',
    category: 'sales',
  },
  {
    id: 'hold_recall_bill',
    name: 'Giữ/Gọi lại hóa đơn',
    description: 'Giữ hóa đơn tạm và gọi lại sau',
    category: 'sales',
  },
  
  // ===== SẢN PHẨM/DỊCH VỤ =====
  {
    id: 'view_products',
    name: 'Xem sản phẩm',
    description: 'Xem danh sách sản phẩm/dịch vụ',
    category: 'product',
  },
  {
    id: 'create_product',
    name: 'Tạo sản phẩm',
    description: 'Thêm sản phẩm/dịch vụ mới',
    category: 'product',
  },
  {
    id: 'edit_product',
    name: 'Sửa sản phẩm',
    description: 'Chỉnh sửa thông tin sản phẩm/dịch vụ',
    category: 'product',
  },
  {
    id: 'delete_product',
    name: 'Xóa sản phẩm',
    description: 'Xóa sản phẩm/dịch vụ khỏi hệ thống',
    category: 'product',
  },
  {
    id: 'manage_product_categories',
    name: 'Quản lý danh mục',
    description: 'Thêm, sửa, xóa danh mục sản phẩm',
    category: 'product',
  },
  
  // ===== KHÁCH HÀNG =====
  {
    id: 'view_customers',
    name: 'Xem khách hàng',
    description: 'Xem danh sách và thông tin khách hàng',
    category: 'customer',
  },
  {
    id: 'create_customer',
    name: 'Tạo khách hàng',
    description: 'Thêm khách hàng mới vào hệ thống',
    category: 'customer',
  },
  {
    id: 'edit_customer',
    name: 'Sửa khách hàng',
    description: 'Chỉnh sửa thông tin khách hàng',
    category: 'customer',
  },
  {
    id: 'delete_customer',
    name: 'Xóa khách hàng',
    description: 'Xóa khách hàng khỏi hệ thống',
    category: 'customer',
  },
  {
    id: 'view_customer_history',
    name: 'Xem lịch sử KH',
    description: 'Xem lịch sử mua hàng của khách hàng',
    category: 'customer',
  },
  
  // ===== LỊCH HẸN (SPA) =====
  {
    id: 'view_appointments',
    name: 'Xem lịch hẹn',
    description: 'Xem danh sách lịch hẹn',
    category: 'appointment',
  },
  {
    id: 'create_appointment',
    name: 'Tạo lịch hẹn',
    description: 'Đặt lịch hẹn mới cho khách',
    category: 'appointment',
  },
  {
    id: 'edit_appointment',
    name: 'Sửa lịch hẹn',
    description: 'Chỉnh sửa thông tin lịch hẹn',
    category: 'appointment',
  },
  {
    id: 'cancel_appointment',
    name: 'Hủy lịch hẹn',
    description: 'Hủy lịch hẹn đã đặt',
    category: 'appointment',
  },
  
  // ===== BÀN (F&B) =====
  {
    id: 'view_tables',
    name: 'Xem danh sách bàn',
    description: 'Xem trạng thái và thông tin bàn',
    category: 'table',
  },
  {
    id: 'manage_tables',
    name: 'Quản lý bàn',
    description: 'Thêm, sửa, xóa bàn, thay đổi trạng thái',
    category: 'table',
  },
  {
    id: 'assign_table',
    name: 'Gán bàn cho đơn',
    description: 'Gán bàn cho đơn hàng tại bàn',
    category: 'table',
  },
  
  // ===== KHO =====
  {
    id: 'view_inventory',
    name: 'Xem tồn kho',
    description: 'Xem số lượng tồn kho sản phẩm',
    category: 'inventory',
  },
  {
    id: 'stock_in',
    name: 'Nhập kho',
    description: 'Tạo phiếu nhập kho hàng',
    category: 'inventory',
  },
  {
    id: 'stock_out',
    name: 'Xuất kho',
    description: 'Tạo phiếu xuất kho hàng',
    category: 'inventory',
  },
  {
    id: 'adjust_stock',
    name: 'Điều chỉnh kho',
    description: 'Điều chỉnh số lượng tồn kho',
    category: 'inventory',
  },
  
  // ===== BÁO CÁO =====
  {
    id: 'view_reports',
    name: 'Xem báo cáo',
    description: 'Xem các báo cáo doanh thu, khách hàng',
    category: 'report',
  },
  {
    id: 'export_reports',
    name: 'Xuất báo cáo',
    description: 'Xuất báo cáo ra Excel, PDF',
    category: 'report',
  },
  {
    id: 'view_revenue_reports',
    name: 'Xem BC doanh thu',
    description: 'Xem báo cáo doanh thu chi tiết',
    category: 'report',
  },
  {
    id: 'view_staff_performance',
    name: 'Xem BC nhân viên',
    description: 'Xem hiệu suất làm việc của nhân viên',
    category: 'report',
  },
  
  // ===== NGƯỜI DÙNG & PHÂN QUYỀN =====
  {
    id: 'view_users',
    name: 'Xem người dùng',
    description: 'Xem danh sách người dùng',
    category: 'user',
  },
  {
    id: 'create_user',
    name: 'Tạo người dùng',
    description: 'Thêm người dùng mới',
    category: 'user',
  },
  {
    id: 'edit_user',
    name: 'Sửa người dùng',
    description: 'Chỉnh sửa thông tin người dùng',
    category: 'user',
  },
  {
    id: 'delete_user',
    name: 'Xóa người dùng',
    description: 'Xóa người dùng khỏi hệ thống',
    category: 'user',
  },
  {
    id: 'manage_roles',
    name: 'Quản lý nhóm quyền',
    description: 'Tạo, sửa, xóa nhóm quyền',
    category: 'user',
  },
  {
    id: 'assign_permissions',
    name: 'Phân quyền',
    description: 'Gán quyền cho người dùng',
    category: 'user',
  },
];

// Nhóm quyền mặc định dựa trên nghiệp vụ thực tế
export const defaultRoleGroups: RoleGroup[] = [
  {
    id: '1',
    name: 'Quản trị viên',
    description: 'Toàn quyền quản lý hệ thống',
    permissions: systemPermissions.map(p => p.id), // Full permissions
    isSystem: true,
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: '2',
    name: 'Quản lý',
    description: 'Quản lý cửa hàng, xem báo cáo, không quản lý người dùng',
    permissions: [
      'view_dashboard',
      'manage_settings',
      'manage_shifts',
      'create_order',
      'view_orders',
      'edit_order',
      'delete_order',
      'apply_discount',
      'apply_voucher',
      'override_price',
      'process_refund',
      'split_payment',
      'hold_recall_bill',
      'view_products',
      'create_product',
      'edit_product',
      'delete_product',
      'manage_product_categories',
      'view_customers',
      'create_customer',
      'edit_customer',
      'delete_customer',
      'view_customer_history',
      'view_appointments',
      'create_appointment',
      'edit_appointment',
      'cancel_appointment',
      'view_tables',
      'manage_tables',
      'assign_table',
      'view_inventory',
      'stock_in',
      'stock_out',
      'adjust_stock',
      'view_reports',
      'export_reports',
      'view_revenue_reports',
      'view_staff_performance',
    ],
    isSystem: true,
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: '3',
    name: 'Thu ngân',
    description: 'Bán hàng, quản lý đơn hàng và khách hàng cơ bản',
    permissions: [
      'create_order',
      'view_orders',
      'apply_discount',
      'apply_voucher',
      'hold_recall_bill',
      'view_products',
      'view_customers',
      'create_customer',
      'edit_customer',
      'view_customer_history',
      'view_appointments',
      'create_appointment',
      'view_tables',
      'assign_table',
    ],
    isSystem: true,
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: '4',
    name: 'Kỹ thuật viên / Đội bếp',
    description: 'Kỹ thuật viên (Spa) hoặc Đội bếp (F&B) - Xem đơn hàng, lịch hẹn để thực hiện dịch vụ/chế biến món',
    permissions: [
      'view_orders',
      'view_products',
      'view_appointments',
      'view_customers',
    ],
    isSystem: true,
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: '5',
    name: 'Nhân viên kho',
    description: 'Quản lý nhập xuất kho, tồn kho',
    permissions: [
      'view_products',
      'view_inventory',
      'stock_in',
      'stock_out',
      'adjust_stock',
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