import { useStore } from './store';
import { userHasPermission } from './permissionData';

/**
 * Custom hook để kiểm tra quyền của user hiện tại
 * @example
 * const { hasPermission } = usePermissions();
 * const canCreate = hasPermission('products_create');
 */
export function usePermissions() {
  const { users, roleGroups, userPermissionOverrides, currentUser } = useStore();

  const hasPermission = (permissionId: string): boolean => {
    if (!currentUser) return false;
    
    return userHasPermission(
      currentUser.id,
      permissionId,
      users,
      roleGroups,
      userPermissionOverrides || []
    );
  };

  const hasAnyPermission = (permissionIds: string[]): boolean => {
    return permissionIds.some(id => hasPermission(id));
  };

  const hasAllPermissions = (permissionIds: string[]): boolean => {
    return permissionIds.every(id => hasPermission(id));
  };

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
  };
}

/**
 * Kiểm tra quyền CRUD cho một module
 * @example
 * const perms = useModulePermissions('products');
 * perms.canView // true/false
 * perms.canCreate // true/false
 */
export function useModulePermissions(module: string) {
  const { hasPermission } = usePermissions();

  return {
    canView: hasPermission(`${module}_view`),
    canCreate: hasPermission(`${module}_create`),
    canEdit: hasPermission(`${module}_edit`),
    canDelete: hasPermission(`${module}_delete`),
    canExport: hasPermission(`${module}_export`),
  };
}

/**
 * Higher Order Component để bảo vệ các component yêu cầu quyền
 * @example
 * export default withPermission(ProductForm, 'products_create');
 */
export function withPermission<P extends object>(
  Component: React.ComponentType<P>,
  requiredPermission: string,
  fallback?: React.ReactNode
) {
  return function PermissionProtectedComponent(props: P) {
    const { hasPermission } = usePermissions();

    if (!hasPermission(requiredPermission)) {
      return fallback || null;
    }

    return <Component {...props} />;
  };
}

/**
 * Component wrapper để hiển thị children chỉ khi có quyền
 * @example
 * <PermissionGuard permission="products_create">
 *   <button>Thêm sản phẩm</button>
 * </PermissionGuard>
 */
interface PermissionGuardProps {
  permission: string | string[];
  requireAll?: boolean; // Nếu true, yêu cầu tất cả quyền. Mặc định: false (chỉ cần 1 quyền)
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export function PermissionGuard({
  permission,
  requireAll = false,
  fallback = null,
  children,
}: PermissionGuardProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();

  const permissions = Array.isArray(permission) ? permission : [permission];
  
  let hasAccess: boolean;
  if (permissions.length === 1) {
    hasAccess = hasPermission(permissions[0]);
  } else {
    hasAccess = requireAll 
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions);
  }

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * Kiểm tra quyền cho các nghiệp vụ bán hàng
 */
export function useSalesPermissions() {
  const { hasPermission } = usePermissions();

  return {
    canCreateSale: hasPermission('sales_create'),
    canViewSale: hasPermission('sales_view'),
    canEditSale: hasPermission('sales_edit'),
    canCancelSale: hasPermission('sales_cancel'),
    canPayment: hasPermission('sales_payment'),
    canRefund: hasPermission('sales_refund'),
    canApplyDiscount: hasPermission('sales_discount'),
  };
}

/**
 * Kiểm tra quyền cho quản lý kho
 */
export function useStockPermissions() {
  const { hasPermission } = usePermissions();

  return {
    canViewStock: hasPermission('stock_view'),
    canViewStockIn: hasPermission('stock_in_view'),
    canCreateStockIn: hasPermission('stock_in_create'),
    canEditStockIn: hasPermission('stock_in_edit'),
    canDeleteStockIn: hasPermission('stock_in_delete'),
    canViewStockOut: hasPermission('stock_out_view'),
    canCreateStockOut: hasPermission('stock_out_create'),
    canEditStockOut: hasPermission('stock_out_edit'),
    canDeleteStockOut: hasPermission('stock_out_delete'),
    canExportStock: hasPermission('stock_export'),
  };
}

/**
 * Kiểm tra quyền báo cáo
 */
export function useReportsPermissions() {
  const { hasPermission } = usePermissions();

  return {
    canViewRevenue: hasPermission('reports_revenue'),
    canViewStaff: hasPermission('reports_staff'),
    canViewService: hasPermission('reports_service'),
    canViewPackage: hasPermission('reports_package'),
    canViewProduct: hasPermission('reports_product'),
    canViewCustomer: hasPermission('reports_customer'),
    canViewAppointment: hasPermission('reports_appointment'),
    canViewInventory: hasPermission('reports_inventory'),
    canExport: hasPermission('reports_export'),
  };
}

/**
 * Kiểm tra quyền quản lý tài khoản
 */
export function useAccountPermissions() {
  const { hasPermission } = usePermissions();

  return {
    canViewUsers: hasPermission('users_view'),
    canCreateUser: hasPermission('users_create'),
    canEditUser: hasPermission('users_edit'),
    canDeleteUser: hasPermission('users_delete'),
    canResetPassword: hasPermission('users_reset_password'),
    canViewRoleGroups: hasPermission('role_groups_view'),
    canCreateRoleGroup: hasPermission('role_groups_create'),
    canEditRoleGroup: hasPermission('role_groups_edit'),
    canDeleteRoleGroup: hasPermission('role_groups_delete'),
  };
}

/**
 * Utility function để disable button dựa trên quyền
 * @example
 * const disabled = shouldDisable('products_create');
 * <button disabled={disabled}>Thêm</button>
 */
export function useShouldDisable() {
  const { hasPermission } = usePermissions();

  return (permissionId: string): boolean => {
    return !hasPermission(permissionId);
  };
}

/**
 * Lấy danh sách các action được phép cho một module
 * @example
 * const actions = getAllowedActions('products');
 * // returns: ['view', 'create', 'edit'] nếu user có các quyền tương ứng
 */
export function useAllowedActions(module: string): string[] {
  const { hasPermission } = usePermissions();
  
  const possibleActions = ['view', 'create', 'edit', 'delete', 'export'];
  
  return possibleActions.filter(action => 
    hasPermission(`${module}_${action}`)
  );
}

/**
 * Kiểm tra xem user có phải admin không (có tất cả quyền)
 */
export function useIsAdmin(): boolean {
  const { roleGroups, currentUser } = useStore();
  
  if (!currentUser) return false;
  
  const userRole = roleGroups.find(rg => rg.id === currentUser.roleGroupId);
  
  // Admin là người có tất cả quyền hoặc role name là "Quản trị viên"
  return userRole?.name === 'Quản trị viên' || userRole?.name === 'Admin';
}
