import type { Permission, RoleGroup } from "./store";

// Danh sách tất cả các quyền trong hệ thống
export const systemPermissions: Permission[] = [
  // Hệ thống
  {
    id: "dashboard",
    name: "Dashboard",
    description: "Xem trang tổng quan Dashboard",
    category: "system",
  },
  {
    id: "settings",
    name: "Cài đặt",
    description: "Truy cập và thay đổi cài đặt hệ thống",
    category: "system",
  },

  // Bán hàng
  {
    id: "sales_add_customer",
    name: "Thêm khách hàng (Bán hàng)",
    description: "Thêm khách hàng mới khi bán hàng",
    category: "sales",
  },
  {
    id: "sales_sell",
    name: "Bán hàng",
    description: "Thực hiện bán hàng",
    category: "sales",
  },
  {
    id: "sales_create_invoice",
    name: "Tạo hóa đơn",
    description: "Tạo hóa đơn bán hàng",
    category: "sales",
  },

  // Hóa đơn
  {
    id: "invoices_view",
    name: "Xem hóa đơn",
    description: "Xem danh sách và chi tiết hóa đơn",
    category: "invoices",
  },
  {
    id: "invoices_print",
    name: "In hóa đơn",
    description: "In hóa đơn",
    category: "invoices",
  },
  {
    id: "invoices_delete",
    name: "Xóa hóa đơn",
    description: "Xóa hóa đơn",
    category: "invoices",
  },

  // Khách hàng
  {
    id: "customers_view",
    name: "Xem khách hàng",
    description: "Xem danh sách và chi tiết khách hàng",
    category: "customers",
  },
  {
    id: "customers_add",
    name: "Thêm khách hàng",
    description: "Thêm khách hàng mới",
    category: "customers",
  },
  {
    id: "customers_edit",
    name: "Sửa khách hàng",
    description: "Chỉnh sửa thông tin khách hàng",
    category: "customers",
  },
  {
    id: "customers_delete",
    name: "Xóa khách hàng",
    description: "Xóa khách hàng",
    category: "customers",
  },

  // Sản phẩm
  {
    id: "products_view",
    name: "Xem sản phẩm",
    description: "Xem danh sách và chi tiết sản phẩm",
    category: "products",
  },
  {
    id: "products_add",
    name: "Thêm sản phẩm",
    description: "Thêm sản phẩm mới",
    category: "products",
  },
  {
    id: "products_edit",
    name: "Sửa sản phẩm",
    description: "Chỉnh sửa thông tin sản phẩm",
    category: "products",
  },
  {
    id: "products_delete",
    name: "Xóa sản phẩm",
    description: "Xóa sản phẩm",
    category: "products",
  },

  // Kho - Nhập kho
  {
    id: "stock_in_view",
    name: "Xem nhập kho",
    description: "Xem danh sách và chi tiết phiếu nhập kho",
    category: "inventory",
  },
  {
    id: "stock_in_create",
    name: "Tạo phiếu nhập kho",
    description: "Tạo phiếu nhập kho mới",
    category: "inventory",
  },
  {
    id: "stock_in_edit",
    name: "Chỉnh sửa phiếu nhập kho",
    description: "Chỉnh sửa phiếu nhập kho",
    category: "inventory",
  },
  {
    id: "stock_in_delete",
    name: "Xóa phiếu nhập kho",
    description: "Xóa phiếu nhập kho",
    category: "inventory",
  },
  // Kho - Xuất kho
  {
    id: "stock_out_view",
    name: "Xem xuất kho",
    description: "Xem danh sách và chi tiết phiếu xuất kho",
    category: "inventory",
  },
  {
    id: "stock_out_create",
    name: "Tạo phiếu xuất kho",
    description: "Tạo phiếu xuất kho mới",
    category: "inventory",
  },
  {
    id: "stock_out_edit",
    name: "Chỉnh sửa phiếu xuất kho",
    description: "Chỉnh sửa phiếu xuất kho",
    category: "inventory",
  },
  {
    id: "stock_out_delete",
    name: "Xóa phiếu xuất kho",
    description: "Xóa phiếu xuất kho",
    category: "inventory",
  },

  // Tài khoản - Người dùng
  {
    id: "users_view",
    name: "Xem người dùng",
    description: "Xem danh sách và chi tiết người dùng",
    category: "account",
  },
  {
    id: "users_add",
    name: "Thêm người dùng",
    description: "Thêm người dùng mới",
    category: "account",
  },
  {
    id: "users_edit",
    name: "Sửa người dùng",
    description: "Chỉnh sửa thông tin người dùng",
    category: "account",
  },
  {
    id: "users_delete",
    name: "Xóa người dùng",
    description: "Xóa người dùng",
    category: "account",
  },
  {
    id: "users_disable",
    name: "Vô hiệu hóa người dùng",
    description: "Vô hiệu hóa tài khoản người dùng",
    category: "account",
  },
  {
    id: "users_change_password",
    name: "Đổi mật khẩu người dùng",
    description: "Đổi mật khẩu cho người dùng",
    category: "account",
  },
  // Tài khoản - Nhóm quyền
  {
    id: "roles_view",
    name: "Xem nhóm quyền",
    description: "Xem danh sách và chi tiết nhóm quyền",
    category: "account",
  },
  {
    id: "roles_add",
    name: "Thêm nhóm quyền",
    description: "Thêm nhóm quyền mới",
    category: "account",
  },
  {
    id: "roles_edit",
    name: "Sửa nhóm quyền",
    description: "Chỉnh sửa nhóm quyền",
    category: "account",
  },
  {
    id: "roles_delete",
    name: "Xóa nhóm quyền",
    description: "Xóa nhóm quyền",
    category: "account",
  },

  // Báo cáo
  {
    id: "reports_revenue_summary",
    name: "Báo cáo DT tổng hợp",
    description: "Xem báo cáo doanh thu tổng hợp",
    category: "reports",
  },
  {
    id: "reports_revenue_staff",
    name: "Báo cáo DT nhân viên",
    description: "Xem báo cáo doanh thu theo nhân viên",
    category: "reports",
  },
  {
    id: "reports_revenue_product",
    name: "Báo cáo DT sản phẩm",
    description: "Xem báo cáo doanh thu theo sản phẩm",
    category: "reports",
  },
  {
    id: "reports_customer_overview",
    name: "Báo cáo KH tổng quan",
    description: "Xem báo cáo tổng quan khách hàng",
    category: "reports",
  },
  {
    id: "reports_inventory",
    name: "Báo cáo tồn kho",
    description: "Xem báo cáo tồn kho",
    category: "reports",
  },

  // Danh mục sản phẩm
  {
    id: "product_categories_view",
    name: "Xem danh mục sản phẩm",
    description: "Xem danh sách danh mục sản phẩm",
    category: "product_categories",
  },
  {
    id: "product_categories_add",
    name: "Thêm danh mục sản phẩm",
    description: "Thêm danh mục sản phẩm mới",
    category: "product_categories",
  },
  {
    id: "product_categories_edit",
    name: "Sửa danh mục sản phẩm",
    description: "Chỉnh sửa danh mục sản phẩm",
    category: "product_categories",
  },
  {
    id: "product_categories_delete",
    name: "Xóa danh mục sản phẩm",
    description: "Xóa danh mục sản phẩm",
    category: "product_categories",
  },

  // Loại khách hàng
  {
    id: "customer_types_view",
    name: "Xem loại khách hàng",
    description: "Xem danh sách loại khách hàng",
    category: "customer_types",
  },
  {
    id: "customer_types_add",
    name: "Thêm loại khách hàng",
    description: "Thêm loại khách hàng mới",
    category: "customer_types",
  },
  {
    id: "customer_types_edit",
    name: "Sửa loại khách hàng",
    description: "Chỉnh sửa loại khách hàng",
    category: "customer_types",
  },
  {
    id: "customer_types_delete",
    name: "Xóa loại khách hàng",
    description: "Xóa loại khách hàng",
    category: "customer_types",
  },
];

// Nhóm quyền mặc định
export const defaultRoleGroups: RoleGroup[] = [
  {
    id: "1",
    name: "Chủ cửa hàng",
    description: "Quyền quản trị viên - Toàn quyền truy cập hệ thống",
    permissions: systemPermissions.map((p) => p.id), // Full permissions
    isSystem: true,
    createdAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "2",
    name: "Thu ngân",
    description: "Quyền thu ngân - Bán hàng và quản lý kho",
    permissions: [
      // Toàn quyền bán hàng
      "sales_add_customer",
      "sales_sell",
      "sales_create_invoice",
      // Xem hóa đơn
      "invoices_view",
      // Xem và thêm khách hàng
      "customers_view",
      "customers_add",
      // Xem và thêm sản phẩm
      "products_view",
      "products_add",
      // Toàn quyền kho - Nhập kho
      "stock_in_view",
      "stock_in_create",
      "stock_in_edit",
      "stock_in_delete",
      // Toàn quyền kho - Xuất kho
      "stock_out_view",
      "stock_out_create",
      "stock_out_edit",
      "stock_out_delete",
    ],
    isSystem: true,
    createdAt: "2024-01-01T00:00:00.000Z",
  },
];

// Helper function to get permission name by ID
export function getPermissionName(permissionId: string): string {
  const permission = systemPermissions.find((p) => p.id === permissionId);
  return permission ? permission.name : permissionId;
}

// Helper function to get role group by ID
export function getRoleGroupById(
  roleGroupId: string,
  roleGroups: RoleGroup[],
): RoleGroup | undefined {
  return roleGroups.find((rg) => rg.id === roleGroupId);
}

// Helper function to check if user has permission
export function userHasPermission(
  userId: string,
  permissionId: string,
  users: any[],
  roleGroups: RoleGroup[],
  userPermissionOverrides: any[],
): boolean {
  const user = users.find((u) => u.id === userId);
  if (!user) return false;

  const roleGroup = getRoleGroupById(user.roleGroupId, roleGroups);
  if (!roleGroup) return false;

  // Check if permission is in role group
  const hasRolePermission = roleGroup.permissions.includes(permissionId);

  // Check if permission is overridden for this user
  const userOverride = userPermissionOverrides.find(
    (uo) => uo.userId === userId,
  );
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
  userPermissionOverrides: any[],
): string[] {
  const user = users.find((u) => u.id === userId);
  if (!user) return [];

  const roleGroup = getRoleGroupById(user.roleGroupId, roleGroups);
  if (!roleGroup) return [];

  let permissions = [...roleGroup.permissions];

  const userOverride = userPermissionOverrides.find(
    (uo) => uo.userId === userId,
  );
  if (userOverride) {
    // Remove permissions
    permissions = permissions.filter(
      (p) => !userOverride.removedPermissions.includes(p),
    );
    // Add permissions
    permissions = [...permissions, ...userOverride.addedPermissions];
  }

  // Remove duplicates
  return Array.from(new Set(permissions));
}