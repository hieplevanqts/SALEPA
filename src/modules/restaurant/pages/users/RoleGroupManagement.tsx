import { useState, useMemo, useEffect } from 'react';
import { useStore } from '../../../../lib/restaurant-lib/store';
import { systemPermissions, defaultRoleGroups } from '../../../../lib/restaurant-lib/permissionData';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../../../components/ui/dialog';
import { Label } from '../../../../components/ui/label';
import { Checkbox } from '../../../../components/ui/checkbox';
import { Textarea } from '../../../../components/ui/textarea';
import { Edit, Trash2, Plus, Search } from 'lucide-react';
import { useTranslation } from '../../../../lib/restaurant-lib/useTranslation';
import { toast } from 'sonner';
import { Pagination } from '../../components/common/Pagination';

export function RoleGroupManagement() {
  const { t } = useTranslation();
  const { language, selectedIndustry } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<string | null>(null);
  const [deleteConfirmRole, setDeleteConfirmRole] = useState<{ id: string; name: string } | null>(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: [] as string[],
  });

  // Initialize role groups if empty
  const roleGroups = useStore((state) => state.roleGroups);
  const permissions = useStore((state) => state.permissions);
  
  // Initialize default data on first render
  useEffect(() => {
    if (roleGroups.length === 0) {
      useStore.setState({
        roleGroups: defaultRoleGroups,
        permissions: systemPermissions,
      });
    }
  }, []);

  // Filter role groups
  const filteredRoleGroups = useMemo(() => {
    return roleGroups.filter((role) =>
      role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      role.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [roleGroups, searchQuery]);

  // Pagination logic
  const totalPages = Math.ceil(filteredRoleGroups.length / itemsPerPage);
  const paginatedRoleGroups = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredRoleGroups.slice(start, start + itemsPerPage);
  }, [filteredRoleGroups, currentPage, itemsPerPage]);

  const handleOpenForm = (roleId?: string) => {
    if (roleId) {
      const role = roleGroups.find((r) => r.id === roleId);
      if (role) {
        setFormData({
          name: role.name,
          description: role.description,
          permissions: role.permissions,
        });
        setEditingRole(roleId);
      }
    } else {
      setFormData({
        name: '',
        description: '',
        permissions: [],
      });
      setEditingRole(null);
    }
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingRole(null);
    setFormData({
      name: '',
      description: '',
      permissions: [],
    });
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      toast.error(language === 'vi' ? 'Vui lòng nhập tên nhóm quyền' : 'Please enter role group name');
      return;
    }

    if (formData.permissions.length === 0) {
      toast.error(language === 'vi' ? 'Vui lòng chọn ít nhất một quyền' : 'Please select at least one permission');
      return;
    }

    if (editingRole) {
      // Update existing role group
      useStore.setState((state) => ({
        roleGroups: state.roleGroups.map((r) =>
          r.id === editingRole
            ? { ...r, ...formData, updatedAt: new Date().toISOString() }
            : r
        ),
      }));
      toast.success(language === 'vi' ? 'Cập nhật nhóm quyền thành công' : 'Role group updated successfully');
    } else {
      // Create new role group
      const newRole = {
        id: Date.now().toString(),
        ...formData,
        isSystem: false,
        createdAt: new Date().toISOString(),
      };
      useStore.setState((state) => ({
        roleGroups: [...state.roleGroups, newRole],
      }));
      toast.success(language === 'vi' ? 'Tạo nhóm quyền thành công' : 'Role group created successfully');
    }

    handleCloseForm();
  };

  const handleDeleteClick = (roleId: string, roleName: string) => {
    // Check if any user is using this role
    const users = useStore.getState().users;
    const usersWithRole = users.filter((u) => u.roleGroupId === roleId);
    if (usersWithRole.length > 0) {
      toast.error(
        language === 'vi'
          ? `Không thể xóa. Có ${usersWithRole.length} người dùng đang sử dụng nhóm quyền này`
          : `Cannot delete. ${usersWithRole.length} users are using this role group`
      );
      return;
    }

    setDeleteConfirmRole({ id: roleId, name: roleName });
  };

  const handleDeleteConfirm = () => {
    if (deleteConfirmRole) {
      useStore.setState((state) => ({
        roleGroups: state.roleGroups.filter((r) => r.id !== deleteConfirmRole.id),
      }));
      toast.success(language === 'vi' ? 'Xóa nhóm quyền thành công' : 'Role group deleted successfully');
      setDeleteConfirmRole(null);
    }
  };

  const togglePermission = (permissionId: string) => {
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter((p) => p !== permissionId)
        : [...prev.permissions, permissionId],
    }));
  };

  // Group permissions by category, filtering based on industry
  const permissionsByCategory = useMemo(() => {
    const categories: Record<string, typeof systemPermissions> = {};
    
    // Filter out appointment and inventory categories for F&B industry
    const filteredPermissions = systemPermissions.filter((perm) => {
      if (selectedIndustry === 'food-beverage') {
        // Exclude appointment and inventory permissions for F&B
        return perm.category !== 'appointment' && perm.category !== 'inventory';
      }
      return true; // Show all permissions for other industries
    });
    
    filteredPermissions.forEach((perm) => {
      if (!categories[perm.category]) {
        categories[perm.category] = [];
      }
      categories[perm.category].push(perm);
    });
    return categories;
  }, [selectedIndustry]);

  const getCategoryName = (category: string) => {
    const names: Record<string, { vi: string; en: string }> = {
      system: { vi: 'Hệ thống', en: 'System' },
      sales: { vi: 'Bán hàng', en: 'Sales' },
      product: { vi: 'Sản phẩm', en: 'Product' },
      customer: { vi: 'Khách hàng', en: 'Customer' },
      appointment: { vi: 'Lịch hẹn', en: 'Appointment' },
      table: { vi: 'Bàn', en: 'Table' },
      inventory: { vi: 'Kho hàng', en: 'Inventory' },
      report: { vi: 'Báo cáo', en: 'Reports' },
      user: { vi: 'Người dùng', en: 'User' },
      management: { vi: 'Quản lý', en: 'Management' },
    };
    return names[category]?.[language] || category;
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        <div>
          <h2 className="page-title">{language === 'vi' ? 'Nhóm quyền' : 'Role Groups'}</h2>
          <p className="text-gray-500 text-sm mt-2">
            {language === 'vi'
              ? 'Quản lý các nhóm quyền và phân quyền cho từng vai trò'
              : 'Manage role groups and assign permissions to each role'}
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
            placeholder={language === 'vi' ? 'Tìm kiếm nhóm quyền...' : 'Search role groups...'}
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
                <th className="table-header">{language === 'vi' ? 'Tên nhóm quyền' : 'Role Group Name'}</th>
                <th className="table-header">{language === 'vi' ? 'Mô tả' : 'Description'}</th>
                <th className="table-header text-right">{language === 'vi' ? 'Số quyền' : 'Permissions'}</th>
                <th className="table-header text-center">{language === 'vi' ? 'Loại' : 'Type'}</th>
                <th className="table-header actions-center">{language === 'vi' ? 'Hành động' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody>
              {paginatedRoleGroups.length === 0 ? (
                <tr>
                  <td colSpan={5} className="table-content text-center text-gray-500 py-8">
                    {language === 'vi' ? 'Không tìm thấy nhóm quyền' : 'No role groups found'}
                  </td>
                </tr>
              ) : (
                paginatedRoleGroups.map((role) => (
                  <tr key={role.id}>
                    <td className="table-content">
                      <span className="font-medium text-gray-900">{role.name}</span>
                    </td>
                    <td className="table-content text-gray-600">
                      {role.description}
                    </td>
                    <td className="table-content text-right">
                      {role.permissions.length} {language === 'vi' ? 'quyền' : 'permissions'}
                    </td>
                    <td className="table-content text-center">
                      {role.isSystem ? (
                        <span className="text-blue-600">{language === 'vi' ? 'Hệ thống' : 'System'}</span>
                      ) : (
                        <span className="text-gray-600">{language === 'vi' ? 'Tùy chỉnh' : 'Custom'}</span>
                      )}
                    </td>
                    <td className="table-content actions-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenForm(role.id)}
                          className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                          title={language === 'vi' ? 'Sửa' : 'Edit'}
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(role.id, role.name)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title={language === 'vi' ? 'Xóa' : 'Delete'}
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {filteredRoleGroups.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredRoleGroups.length}
            itemsPerPage={itemsPerPage}
            onPageChange={(page) => setCurrentPage(page)}
            onItemsPerPageChange={(items) => {
              setItemsPerPage(items);
              setCurrentPage(1);
            }}
          />
        )}
      </div>

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={handleCloseForm}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle style={{ fontSize: '20px' }}>
              {editingRole
                ? language === 'vi' ? 'Chỉnh sửa nhóm quyền' : 'Edit Role Group'
                : language === 'vi' ? 'Thêm nhóm quyền mới' : 'Add New Role Group'}
            </DialogTitle>
            <DialogDescription style={{ fontSize: '14px' }}>
              {language === 'vi'
                ? t.roleGroupSelectPermissions
                : 'Enter information and select permissions for the role group'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Name */}
            <div>
              <label className="block text-gray-700 mb-2">
                {language === 'vi' ? 'Tên nhóm quyền' : 'Role Group Name'} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={language === 'vi' ? 'Nhập tên nhóm quyền' : 'Enter role group name'}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FE7410] focus:border-transparent"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-gray-700 mb-2">
                {language === 'vi' ? 'Mô tả' : 'Description'}
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder={language === 'vi' ? 'Nhập mô tả' : 'Enter description'}
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FE7410] focus:border-transparent resize-none"
              />
            </div>

            {/* Permissions */}
            <div>
              <label className="block text-gray-700 mb-2">
                {language === 'vi' ? 'Quyền truy cập' : 'Permissions'} <span className="text-red-500">*</span>
              </label>
              <div className="border rounded-lg p-4 space-y-4 max-h-96 overflow-y-auto">
                {Object.entries(permissionsByCategory).map(([category, perms]) => (
                  <div key={category} className="space-y-2">
                    <h3 className="font-semibold text-[#FE7410] text-sm">
                      {getCategoryName(category)}
                    </h3>
                    <div className="grid grid-cols-2 gap-3 ml-4">
                      {perms.map((perm) => (
                        <div key={perm.id} className="flex items-start space-x-2">
                          <Checkbox
                            id={`perm-${perm.id}`}
                            checked={formData.permissions.includes(perm.id)}
                            onCheckedChange={() => togglePermission(perm.id)}
                          />
                          <div className="grid gap-1.5 leading-none">
                            <label
                              htmlFor={`perm-${perm.id}`}
                              className="text-sm cursor-pointer text-gray-700"
                            >
                              {perm.name}
                            </label>
                            <p className="text-xs text-gray-500">
                              {perm.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-2">
                {language === 'vi'
                  ? `Đã chọn ${formData.permissions.length} quyền`
                  : `Selected ${formData.permissions.length} permissions`}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseForm}>
              {language === 'vi' ? 'Hủy' : 'Cancel'}
            </Button>
            <Button onClick={handleSubmit} style={{ backgroundColor: '#FE7410' }} className="hover:opacity-90">
              {editingRole
                ? language === 'vi' ? 'Cập nhật' : 'Update'
                : language === 'vi' ? 'Tạo mới' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmRole !== null} onOpenChange={() => setDeleteConfirmRole(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle style={{ fontSize: '20px', color: '#dc2626' }}>
              {language === 'vi' ? 'Xác nhận xóa' : 'Confirm Delete'}
            </DialogTitle>
            <DialogDescription>
              {language === 'vi'
                ? `Bạn có chắc chắn muốn xóa nhóm quyền "${deleteConfirmRole?.name}" không?`
                : `Are you sure you want to delete role group "${deleteConfirmRole?.name}"?`}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmRole(null)}>
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

export default RoleGroupManagement;