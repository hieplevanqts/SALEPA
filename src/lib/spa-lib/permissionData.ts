import type { Permission, RoleGroup } from './store';

// Danh sách tất cả các quyền trong hệ thống - DỰA TRÊN NGHIỆP VỤ THỰC TẾ
export const systemPermissions: Permission[] = [
  // ========== HỆ THỐNG (SYSTEM) ==========
  {
    id: 'dashboard_view',
    name: 'Xem Dashboard',
    description: 'Xem trang tổng quan Dashboard',
    category: 'system',
  },
  {
    id: 'settings_view',
    name: 'Xem cài đặt',
    description: 'Xem cài đặt hệ thống',
    category: 'system',
  },
  {
    id: 'settings_edit',
    name: 'Sửa cài đặt',
    description: 'Thay đổi cài đặt hệ thống',
    category: 'system',
  },
  
  // ========== BÁN HÀNG (SALES) - Màn hình POS ==========
  {
    id: 'sales_access',
    name: 'Truy cập màn hình bán hàng',
    description: 'Truy cập màn hình POS để bán hàng',
    category: 'sales',
  },
  {
    id: 'sales_create_order',
    name: 'Tạo đơn hàng',
    description: 'Tạo đơn hàng mới và thêm sản phẩm vào giỏ',
    category: 'sales',
  },
  {
    id: 'sales_checkout',
    name: 'Thanh toán',
    description: 'Thực hiện thanh toán đơn hàng',
    category: 'sales',
  },
  {
    id: 'sales_apply_discount',
    name: 'Áp dụng chiết khấu',
    description: 'Áp dụng chiết khấu cho đơn hàng',
    category: 'sales',
  },
  
  // ========== ĐƠN HÀNG (ORDERS) - Lịch sử đơn hàng ==========
  {
    id: 'orders_view',
    name: 'Xem danh sách đơn hàng',
    description: 'Xem lịch sử đơn hàng đã tạo',
    category: 'orders',
  },
  {
    id: 'orders_view_detail',
    name: 'Xem chi tiết đơn hàng',
    description: 'Xem thông tin chi tiết đơn hàng',
    category: 'orders',
  },
  {
    id: 'orders_delete',
    name: 'Xóa đơn hàng',
    description: 'Xóa đơn hàng khỏi hệ thống',
    category: 'orders',
  },
  {
    id: 'orders_print',
    name: 'In hóa đơn',
    description: 'In hóa đơn cho khách hàng',
    category: 'orders',
  },
  {
    id: 'orders_complete_payment',
    name: 'Thanh toán nợ',
    description: 'Thanh toán thêm cho đơn hàng còn nợ',
    category: 'orders',
  },
  
  // ========== SẢN PHẨM (PRODUCTS) ==========
  {
    id: 'products_view',
    name: 'Xem sản phẩm',
    description: 'Xem danh sách sản phẩm',
    category: 'products',
  },
  {
    id: 'products_view_detail',
    name: 'Xem chi tiết sản phẩm',
    description: 'Xem thông tin chi tiết sản phẩm',
    category: 'products',
  },
  {
    id: 'products_create',
    name: 'Thêm sản phẩm',
    description: 'Thêm sản phẩm mới vào hệ thống',
    category: 'products',
  },
  {
    id: 'products_edit',
    name: 'Sửa sản phẩm',
    description: 'Chỉnh sửa thông tin sản phẩm',
    category: 'products',
  },
  {
    id: 'products_delete',
    name: 'Xóa sản phẩm',
    description: 'Xóa sản phẩm khỏi hệ thống',
    category: 'products',
  },
  {
    id: 'products_duplicate',
    name: 'Nhân bản sản phẩm',
    description: 'Tạo bản sao của sản phẩm',
    category: 'products',
  },
  
  // ========== KHÁCH HÀNG (CUSTOMERS) ==========
  {
    id: 'customers_view',
    name: 'Xem khách hàng',
    description: 'Xem danh sách khách hàng',
    category: 'customers',
  },
  {
    id: 'customers_view_detail',
    name: 'Xem chi tiết khách hàng',
    description: 'Xem thông tin chi tiết khách hàng (lịch sử, liệu trình)',
    category: 'customers',
  },
  {
    id: 'customers_create',
    name: 'Thêm khách hàng',
    description: 'Thêm khách hàng mới',
    category: 'customers',
  },
  {
    id: 'customers_edit',
    name: 'Sửa khách hàng',
    description: 'Chỉnh sửa thông tin khách hàng',
    category: 'customers',
  },
  {
    id: 'customers_delete',
    name: 'Xóa khách hàng',
    description: 'Xóa khách hàng khỏi hệ thống',
    category: 'customers',
  },
  
  // ========== LỊCH HẸN (APPOINTMENTS) ==========
  {
    id: 'appointments_view',
    name: 'Xem lịch hẹn',
    description: 'Xem danh sách lịch hẹn',
    category: 'appointments',
  },
  {
    id: 'appointments_view_detail',
    name: 'Xem chi tiết lịch hẹn',
    description: 'Xem thông tin chi tiết lịch hẹn',
    category: 'appointments',
  },
  {
    id: 'appointments_create',
    name: 'Tạo lịch hẹn',
    description: 'Tạo lịch hẹn mới cho khách hàng',
    category: 'appointments',
  },
  {
    id: 'appointments_edit',
    name: 'Sửa lịch hẹn',
    description: 'Chỉnh sửa thông tin lịch hẹn',
    category: 'appointments',
  },
  {
    id: 'appointments_delete',
    name: 'Xóa lịch hẹn',
    description: 'Xóa lịch hẹn khỏi hệ thống',
    category: 'appointments',
  },
  
  // ========== DANH MỤC SẢN PHẨM (CATEGORIES) ==========
  {
    id: 'categories_view',
    name: 'Xem danh mục',
    description: 'Xem danh sách danh mục sản phẩm',
    category: 'categories',
  },
  {
    id: 'categories_create',
    name: 'Thêm danh mục',
    description: 'Thêm danh mục mới',
    category: 'categories',
  },
  {
    id: 'categories_edit',
    name: 'Sửa danh mục',
    description: 'Chỉnh sửa danh mục',
    category: 'categories',
  },
  {
    id: 'categories_delete',
    name: 'Xóa danh mục',
    description: 'Xóa danh mục',
    category: 'categories',
  },
  
  // ========== NHẬP KHO (STOCK IN) ==========
  {
    id: 'stock_in_view',
    name: 'Xem phiếu nhập kho',
    description: 'Xem danh sách phiếu nhập kho',
    category: 'stock',
  },
  {
    id: 'stock_in_view_detail',
    name: 'Xem chi tiết phiếu nhập',
    description: 'Xem chi tiết phiếu nhập kho',
    category: 'stock',
  },
  {
    id: 'stock_in_create',
    name: 'Tạo phiếu nhập kho',
    description: 'Tạo phiếu nhập kho mới',
    category: 'stock',
  },
  {
    id: 'stock_in_edit',
    name: 'Sửa phiếu nhập kho',
    description: 'Chỉnh sửa phiếu nhập kho',
    category: 'stock',
  },
  {
    id: 'stock_in_delete',
    name: 'Xóa phiếu nhập kho',
    description: 'Xóa phiếu nhập kho',
    category: 'stock',
  },
  {
    id: 'stock_in_print',
    name: 'In phiếu nhập kho',
    description: 'In phiếu nhập kho',
    category: 'stock',
  },
  
  // ========== XUẤT KHO (STOCK OUT) ==========
  {
    id: 'stock_out_view',
    name: 'Xem phiếu xuất kho',
    description: 'Xem danh sách phiếu xuất kho',
    category: 'stock',
  },
  {
    id: 'stock_out_view_detail',
    name: 'Xem chi tiết phiếu xuất',
    description: 'Xem chi tiết phiếu xuất kho',
    category: 'stock',
  },
  {
    id: 'stock_out_create',
    name: 'Tạo phiếu xuất kho',
    description: 'Tạo phiếu xuất kho mới',
    category: 'stock',
  },
  {
    id: 'stock_out_edit',
    name: 'Sửa phiếu xuất kho',
    description: 'Chỉnh sửa phiếu xuất kho',
    category: 'stock',
  },
  {
    id: 'stock_out_delete',
    name: 'Xóa phiếu xuất kho',
    description: 'Xóa phiếu xuất kho',
    category: 'stock',
  },
  {
    id: 'stock_out_print',
    name: 'In phiếu xuất kho',
    description: 'In phiếu xuất kho',
    category: 'stock',
  },
  
  // ========== QUẢN LÝ TÀI KHOẢN (ACCOUNT) ==========
  {
    id: 'users_view',
    name: 'Xem người dùng',
    description: 'Xem danh sách người dùng',
    category: 'account',
  },
  {
    id: 'users_create',
    name: 'Thêm người dùng',
    description: 'Thêm người dùng mới',
    category: 'account',
  },
  {
    id: 'users_edit',
    name: 'Sửa người dùng',
    description: 'Chỉnh sửa thông tin người dùng',
    category: 'account',
  },
  {
    id: 'users_delete',
    name: 'Xóa người dùng',
    description: 'Xóa người dùng khỏi hệ thống',
    category: 'account',
  },
  {
    id: 'users_activate',
    name: 'Kích hoạt/Vô hiệu hóa',
    description: 'Kích hoạt hoặc vô hiệu hóa tài khoản người dùng',
    category: 'account',
  },
  {
    id: 'role_groups_view',
    name: 'Xem nhóm quyền',
    description: 'Xem danh sách nhóm quyền',
    category: 'account',
  },
  {
    id: 'role_groups_create',
    name: 'Tạo nhóm quyền',
    description: 'Tạo nhóm quyền mới',
    category: 'account',
  },
  {
    id: 'role_groups_edit',
    name: 'Sửa nhóm quyền',
    description: 'Chỉnh sửa nhóm quyền',
    category: 'account',
  },
  {
    id: 'role_groups_delete',
    name: 'Xóa nhóm quyền',
    description: 'Xóa nhóm quyền',
    category: 'account',
  },
  
  // ========== BÁO CÁO (REPORTS) ==========
  {
    id: 'reports_revenue',
    name: 'Báo cáo doanh thu',
    description: 'Xem báo cáo doanh thu tổng hợp',
    category: 'reports',
  },
  {
    id: 'reports_staff',
    name: 'Báo cáo nhân viên',
    description: 'Xem báo cáo doanh thu theo nhân viên',
    category: 'reports',
  },
  {
    id: 'reports_service',
    name: 'Báo cáo dịch vụ',
    description: 'Xem báo cáo doanh thu theo dịch vụ',
    category: 'reports',
  },
  {
    id: 'reports_package',
    name: 'Báo cáo gói/liệu trình',
    description: 'Xem báo cáo doanh thu theo gói liệu trình',
    category: 'reports',
  },
  {
    id: 'reports_product',
    name: 'Báo cáo sản phẩm',
    description: 'Xem báo cáo doanh thu theo sản phẩm',
    category: 'reports',
  },
  {
    id: 'reports_customer',
    name: 'Báo cáo khách hàng',
    description: 'Xem báo cáo khách hàng',
    category: 'reports',
  },
  {
    id: 'reports_appointment',
    name: 'Báo cáo lịch hẹn',
    description: 'Xem báo cáo lịch hẹn',
    category: 'reports',
  },
  {
    id: 'reports_inventory',
    name: 'Báo cáo tồn kho',
    description: 'Xem báo cáo tồn kho',
    category: 'reports',
  },
];

// Nhóm quyền mặc định - DỰA TRÊN NGHIỆP VỤ THỰC TẾ
export const defaultRoleGroups: RoleGroup[] = [
  {
    id: '1',
    name: 'Quản trị viên',
    description: 'Toàn quyền truy cập hệ thống - Quản lý tất cả chức năng',
    permissions: systemPermissions.map(p => p.id), // Full permissions
    isSystem: true,
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: '2',
    name: 'Thu ngân',
    description: 'Bán hàng, quản lý đơn hàng và khách hàng',
    permissions: [
      // Dashboard
      'dashboard_view',
      
      // Bán hàng
      'sales_access',
      'sales_create_order',
      'sales_checkout',
      'sales_apply_discount',
      
      // Đơn hàng
      'orders_view',
      'orders_view_detail',
      'orders_print',
      'orders_complete_payment',
      
      // Sản phẩm (chỉ xem)
      'products_view',
      'products_view_detail',
      
      // Khách hàng
      'customers_view',
      'customers_view_detail',
      'customers_create',
      'customers_edit',
      
      // Lịch hẹn
      'appointments_view',
      'appointments_view_detail',
      'appointments_create',
      'appointments_edit',
    ],
    isSystem: true,
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: '3',
    name: 'Kỹ thuật viên',
    description: 'Xem sản phẩm, lịch hẹn và khách hàng',
    permissions: [
      // Dashboard
      'dashboard_view',
      
      // Sản phẩm (chỉ xem)
      'products_view',
      'products_view_detail',
      
      // Khách hàng (chỉ xem)
      'customers_view',
      'customers_view_detail',
      
      // Lịch hẹn (chỉ xem)
      'appointments_view',
      'appointments_view_detail',
    ],
    isSystem: true,
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: '4',
    name: 'Quản lý kho',
    description: 'Quản lý nhập xuất tồn kho và sản phẩm',
    permissions: [
      // Dashboard
      'dashboard_view',
      
      // Sản phẩm
      'products_view',
      'products_view_detail',
      'products_create',
      'products_edit',
      'products_duplicate',
      
      // Danh mục
      'categories_view',
      'categories_create',
      'categories_edit',
      'categories_delete',
      
      // Nhập kho
      'stock_in_view',
      'stock_in_view_detail',
      'stock_in_create',
      'stock_in_edit',
      'stock_in_delete',
      'stock_in_print',
      
      // Xuất kho
      'stock_out_view',
      'stock_out_view_detail',
      'stock_out_create',
      'stock_out_edit',
      'stock_out_delete',
      'stock_out_print',
      
      // Báo cáo
      'reports_inventory',
      'reports_product',
    ],
    isSystem: true,
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: '5',
    name: 'Nhân viên báo cáo',
    description: 'Xem tất cả báo cáo và thống kê',
    permissions: [
      // Dashboard
      'dashboard_view',
      
      // Đơn hàng (chỉ xem)
      'orders_view',
      'orders_view_detail',
      
      // Khách hàng (chỉ xem)
      'customers_view',
      'customers_view_detail',
      
      // Tất cả báo cáo
      'reports_revenue',
      'reports_staff',
      'reports_service',
      'reports_package',
      'reports_product',
      'reports_customer',
      'reports_appointment',
      'reports_inventory',
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