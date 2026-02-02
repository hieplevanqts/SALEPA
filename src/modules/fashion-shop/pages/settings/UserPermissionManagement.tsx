import { useState, useMemo } from 'react';
import { useStore, type User } from '../../../../lib/fashion-shop-lib/store';
import { systemPermissions, getUserEffectivePermissions } from '../../../../lib/fashion-shop-lib/permissionData';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../../../components/ui/dialog';
import { Label } from '../../../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';
import { Search, Plus, Minus, ShieldCheck, Trash2 } from 'lucide-react';
import { useTranslation } from '../../../../lib/fashion-shop-lib/useTranslation';
import { toast } from 'sonner';
import { Pagination } from '../../components/common/Pagination';

export function UserPermissionManagement() {
  const { t } = useTranslation();
  const { language } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleteConfirmUser, setDeleteConfirmUser] = useState<{ id: string; name: string } | null>(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Form state
  const [addedPermissions, setAddedPermissions] = useState<string[]>([]);
  const [removedPermissions, setRemovedPermissions] = useState<string[]>([]);

  const users = useStore((state) => state.users);
  const roleGroups = useStore((state) => state.roleGroups);
  const userPermissionOverrides = useStore((state) => state.userPermissionOverrides);

  // Filter users
  const filteredUsers = useMemo(() => {
    return users.filter((user) =>
      user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [users, searchQuery]);

  // Pagination logic
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(start, start + itemsPerPage);
  }, [filteredUsers, currentPage, itemsPerPage]);

  const getUserRoleGroup = (user: User) => {
    return roleGroups.find((rg) => rg.id === user.roleGroupId);
  };

  const handleOpenForm = (userId?: string) => {
    if (userId) {
      setSelectedUserId(userId);
      // Load existing overrides
      const override = userPermissionOverrides.find((uo) => uo.userId === userId);
      setAddedPermissions(override?.addedPermissions || []);
      setRemovedPermissions(override?.removedPermissions || []);
    } else {
      setSelectedUserId('');
      setAddedPermissions([]);
      setRemovedPermissions([]);
    }
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedUserId('');
    setAddedPermissions([]);
    setRemovedPermissions([]);
  };

  const handleUserChange = (userId: string) => {
    setSelectedUserId(userId);
    // Load existing overrides
    const override = userPermissionOverrides.find((uo) => uo.userId === userId);
    setAddedPermissions(override?.addedPermissions || []);
    setRemovedPermissions(override?.removedPermissions || []);
  };

  const handleSubmit = () => {
    if (!selectedUserId) {
      toast.error(language === 'vi' ? 'Vui lòng chọn nhân viên' : 'Please select a user');
      return;
    }

    // Remove existing override for this user
    useStore.setState((state) => ({
      userPermissionOverrides: state.userPermissionOverrides.filter((uo) => uo.userId !== selectedUserId),
    }));

    // Add new override if there are any changes
    if (addedPermissions.length > 0 || removedPermissions.length > 0) {
      useStore.setState((state) => ({
        userPermissionOverrides: [
          ...state.userPermissionOverrides,
          {
            userId: selectedUserId,
            addedPermissions,
            removedPermissions,
          },
        ],
      }));
    }

    toast.success(language === 'vi' ? 'Cập nhật phân quyền thành công' : 'Permissions updated successfully');
    handleCloseForm();
  };

  const toggleAddPermission = (permissionId: string) => {
    setAddedPermissions((prev) => {
      if (prev.includes(permissionId)) {
        return prev.filter((p) => p !== permissionId);
      } else {
        // Remove from removed list if exists
        setRemovedPermissions((r) => r.filter((p) => p !== permissionId));
        return [...prev, permissionId];
      }
    });
  };

  const toggleRemovePermission = (permissionId: string) => {
    setRemovedPermissions((prev) => {
      if (prev.includes(permissionId)) {
        return prev.filter((p) => p !== permissionId);
      } else {
        // Remove from added list if exists
        setAddedPermissions((a) => a.filter((p) => p !== permissionId));
        return [...prev, permissionId];
      }
    });
  };

  const selectedUser = users.find((u) => u.id === selectedUserId);
  const selectedUserRoleGroup = selectedUser ? getUserRoleGroup(selectedUser) : null;

  // Group permissions by category
  const permissionsByCategory = useMemo(() => {
    const categories: Record<string, typeof systemPermissions> = {};
    systemPermissions.forEach((perm) => {
      if (!categories[perm.category]) {
        categories[perm.category] = [];
      }
      categories[perm.category].push(perm);
    });
    return categories;
  }, []);

  const getCategoryName = (category: string) => {
    const names: Record<string, { vi: string; en: string }> = {
      system: { vi: 'Hệ thống', en: 'System' },
      sales: { vi: 'Bán hàng', en: 'Sales' },
      management: { vi: 'Quản lý', en: 'Management' },
      reports: { vi: 'Báo cáo', en: 'Reports' },
    };
    return names[category]?.[language] || category;
  };

  const getPermissionStatus = (permissionId: string): 'role' | 'added' | 'removed' | 'none' => {
    if (addedPermissions.includes(permissionId)) return 'added';
    if (removedPermissions.includes(permissionId)) return 'removed';
    if (selectedUserRoleGroup?.permissions.includes(permissionId)) return 'role';
    return 'none';
  };

  const handleDeleteClick = (userId: string, userName: string) => {
    const overrideCount = countOverrides(userId);
    if (overrideCount === 0) {
      toast.error(
        language === 'vi'
          ? 'Người dùng này chưa có phân quyền tùy chỉnh nào'
          : 'This user has no custom permissions'
      );
      return;
    }

    setDeleteConfirmUser({ id: userId, name: userName });
  };

  const handleDeleteConfirm = () => {
    if (deleteConfirmUser) {
      useStore.setState((state) => ({
        userPermissionOverrides: state.userPermissionOverrides.filter((uo) => uo.userId !== deleteConfirmUser.id),
      }));
      toast.success(language === 'vi' ? 'Xóa phân quyền tùy chỉnh thành công' : 'Custom permissions deleted successfully');
      setDeleteConfirmUser(null);
    }
  };

  const countOverrides = (userId: string) => {
    const override = userPermissionOverrides.find((uo) => uo.userId === userId);
    if (!override) return 0;
    return override.addedPermissions.length + override.removedPermissions.length;
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        <div>
          <h2 className="page-title">{language === 'vi' ? 'Phân quyền' : 'User Permissions'}</h2>
          <p className="text-gray-500 text-sm mt-2">
            {filteredUsers.length} / {users.length} {language === 'vi' ? 'người dùng' : 'users'}
          </p>
        </div>
        
        <button
          onClick={() => handleOpenForm()}
          className="flex items-center gap-2 px-4 py-2.5 text-white rounded-lg transition-colors font-medium"
          style={{ backgroundColor: '#FE7410' }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#E56809'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FE7410'}
        >
          <Plus className="w-5 h-5" />
          {language === 'vi' ? 'Thêm mới' : 'Add New'}
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder={language === 'vi' ? 'Tìm kiếm người dùng...' : 'Search users...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            style={{ fontSize: '16px' }}
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="modern-table">
            <thead>
              <tr>
                <th className="table-header">{language === 'vi' ? 'Người dùng' : 'User'}</th>
                <th className="table-header">{language === 'vi' ? 'Tên đăng nhập' : 'Username'}</th>
                <th className="table-header">{language === 'vi' ? 'Nhóm quyền' : 'Role Group'}</th>
                <th className="table-header">{language === 'vi' ? 'Quyền tổng' : 'Total Permissions'}</th>
                <th className="table-header">{language === 'vi' ? 'Quyền tùy chỉnh' : 'Custom'}</th>
                <th className="table-header">{language === 'vi' ? 'Hành động' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="table-content text-center text-gray-500 py-8">
                    {language === 'vi' ? 'Không tìm thấy người dùng' : 'No users found'}
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((user) => {
                  const roleGroup = getUserRoleGroup(user);
                  const effectivePermissions = getUserEffectivePermissions(
                    user.id,
                    users,
                    roleGroups,
                    userPermissionOverrides
                  );
                  const overrideCount = countOverrides(user.id);

                  return (
                    <tr key={user.id}>
                      <td className="table-content">
                        <div>
                          <div className="font-medium text-gray-900">{user.fullName}</div>
                          {user.email && <div className="text-sm text-gray-500">{user.email}</div>}
                        </div>
                      </td>
                      <td className="table-content text-gray-600">
                        {user.username}
                      </td>
                      <td className="table-content">
                        {roleGroup ? roleGroup.name : <span className="text-gray-400">{language === 'vi' ? 'Chưa có' : 'None'}</span>}
                      </td>
                      <td className="table-content">
                        {effectivePermissions.length} {language === 'vi' ? 'quyền' : 'permissions'}
                      </td>
                      <td className="table-content">
                        {overrideCount > 0 ? (
                          <span className="text-[#FE7410] font-medium">
                            {overrideCount} {language === 'vi' ? 'tùy chỉnh' : 'custom'}
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="table-content">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenForm(user.id)}
                            disabled={!user.isActive}
                            className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title={language === 'vi' ? 'Phân quyền' : 'Assign permissions'}
                          >
                            <ShieldCheck className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(user.id, user.fullName)}
                            disabled={!user.isActive}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title={language === 'vi' ? 'Xóa phân quyền' : 'Delete permissions'}
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {filteredUsers.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredUsers.length}
            itemsPerPage={itemsPerPage}
            onPageChange={(page) => setCurrentPage(page)}
            onItemsPerPageChange={(items) => {
              setItemsPerPage(items);
              setCurrentPage(1);
            }}
          />
        )}
      </div>

      {/* Permission Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={handleCloseForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle style={{ fontSize: '20px' }}>
              {language === 'vi' ? 'Phân quyền cho nhân viên' : 'Assign User Permissions'}
            </DialogTitle>
            <DialogDescription style={{ fontSize: '14px' }}>
              {language === 'vi'
                ? 'Chọn nhân viên và điều chỉnh quyền cá nhân của họ'
                : 'Select a user and adjust their individual permissions'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* User Selection Dropdown */}
            <div>
              <label className="block text-gray-700 mb-2">
                {language === 'vi' ? 'Chọn nhân viên' : 'Select User'} <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedUserId}
                onChange={(e) => handleUserChange(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FE7410] focus:border-transparent"
              >
                <option value="">{language === 'vi' ? 'Chọn nhân viên...' : 'Select a user...'}</option>
                {users.filter(u => u.isActive).map((user) => {
                  return (
                    <option key={user.id} value={user.id}>
                      {user.fullName}
                    </option>
                  );
                })}
              </select>
            </div>

            {selectedUser && (
              <>
                {/* Instructions */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p style={{ fontSize: '14px' }} className="text-blue-800">
                    {language === 'vi' ? (
                      <>
                        <strong>Hướng dẫn:</strong> Sử dụng <Plus className="inline" size={14} /> để <strong>thêm quyền</strong> ngoài quyền nhóm,
                        hoặc <Minus className="inline" size={14} /> để <strong>gỡ quyền</strong> từ quyền nhóm.
                      </>
                    ) : (
                      <>
                        <strong>Instructions:</strong> Use <Plus className="inline" size={14} /> to <strong>add permissions</strong> beyond role permissions,
                        or <Minus className="inline" size={14} /> to <strong>remove permissions</strong> from role permissions.
                      </>
                    )}
                  </p>
                </div>

                {/* Permissions by Category */}
                <div className="border rounded-lg p-4 space-y-4 max-h-96 overflow-y-auto">
                  {Object.entries(permissionsByCategory).map(([category, perms]) => (
                    <div key={category} className="space-y-2">
                      <h3 className="font-medium text-[#FE7410]" style={{ fontSize: '14px' }}>
                        {getCategoryName(category)}
                      </h3>
                      <div className="space-y-2 ml-4">
                        {perms.map((perm) => {
                          const status = getPermissionStatus(perm.id);
                          const hasRolePermission = selectedUserRoleGroup?.permissions.includes(perm.id);

                          return (
                            <div key={perm.id} className="flex items-center justify-between p-2 rounded border">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span style={{ fontSize: '14px' }} className="font-medium">{perm.name}</span>
                                  {status === 'role' && (
                                    <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                                      {language === 'vi' ? 'Từ nhóm' : 'From role'}
                                    </span>
                                  )}
                                  {status === 'added' && (
                                    <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded">
                                      {language === 'vi' ? 'Đã thêm' : 'Added'}
                                    </span>
                                  )}
                                  {status === 'removed' && (
                                    <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded">
                                      {language === 'vi' ? 'Đã gỡ' : 'Removed'}
                                    </span>
                                  )}
                                </div>
                                <p className="text-gray-500 text-xs">{perm.description}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                {!hasRolePermission && (
                                  <Button
                                    variant={status === 'added' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => toggleAddPermission(perm.id)}
                                    style={status === 'added' ? { backgroundColor: '#22c55e' } : {}}
                                  >
                                    <Plus size={14} />
                                  </Button>
                                )}
                                {hasRolePermission && (
                                  <Button
                                    variant={status === 'removed' ? 'destructive' : 'outline'}
                                    size="sm"
                                    onClick={() => toggleRemovePermission(perm.id)}
                                  >
                                    <Minus size={14} />
                                  </Button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Summary */}
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded font-medium">
                      +{addedPermissions.length}
                    </span>
                    <span>{language === 'vi' ? 'Quyền thêm' : 'Added'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-red-100 text-red-700 rounded font-medium">
                      -{removedPermissions.length}
                    </span>
                    <span>{language === 'vi' ? 'Quyền gỡ' : 'Removed'}</span>
                  </div>
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseForm}>
              {language === 'vi' ? 'Hủy' : 'Cancel'}
            </Button>
            <Button 
              onClick={handleSubmit} 
              style={{ backgroundColor: '#FE7410' }} 
              className="hover:opacity-90"
              disabled={!selectedUserId}
            >
              {language === 'vi' ? 'Lưu phân quyền' : 'Save Permissions'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmUser !== null} onOpenChange={() => setDeleteConfirmUser(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle style={{ fontSize: '20px', color: '#dc2626' }}>
              {language === 'vi' ? 'Xác nhận xóa' : 'Confirm Delete'}
            </DialogTitle>
            <DialogDescription>
              {language === 'vi'
                ? `Bạn có chắc chắn muốn xóa phân quyền của "${deleteConfirmUser?.name}" không?`
                : `Are you sure you want to delete permissions for "${deleteConfirmUser?.name}"?`}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmUser(null)}>
              {language === 'vi' ? 'Hủy' : 'Cancel'}
            </Button>
            <Button 
              onClick={handleDeleteConfirm} 
              style={{ backgroundColor: '#dc2626' }} 
              className="hover:opacity-90"
            >
              {language === 'vi' ? 'Xóa' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default UserPermissionManagement;