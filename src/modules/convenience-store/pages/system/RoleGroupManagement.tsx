import { useState, useMemo, useEffect } from 'react';
import { useStore } from '../../../../lib/convenience-store-lib/store';
import { systemPermissions, defaultRoleGroups } from '../../../../lib/convenience-store-lib/permissionData';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../../../components/ui/dialog';
import { Checkbox } from '../../../../components/ui/checkbox';
import { Edit, Trash2, Plus, Search } from 'lucide-react';
import { useTranslation } from '../../../../lib/convenience-store-lib/useTranslation';
import { toast } from 'sonner';
import { Pagination } from '../../components/pagination/Pagination';

export function RoleGroupManagement() {
  const { t } = useTranslation();
  const { language } = useStore();
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
      (role.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (role.description || '').toLowerCase().includes(searchQuery.toLowerCase())
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
      toast.error(t('roleGroups.errors.nameRequired'));
      return;
    }

    if (formData.permissions.length === 0) {
      toast.error(t('roleGroups.errors.permissionRequired'));
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
      toast.success(t('roleGroups.success.updated'));
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
      toast.success(t('roleGroups.success.created'));
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
      toast.success(t('roleGroups.success.deleted'));
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
      invoices: { vi: 'Hóa đơn', en: 'Invoices' },
      customers: { vi: 'Khách hàng', en: 'Customers' },
      products: { vi: 'Sản phẩm', en: 'Products' },
      inventory: { vi: 'Kho', en: 'Inventory' },
      account: { vi: 'Tài khoản', en: 'Account' },
      reports: { vi: 'Báo cáo', en: 'Reports' },
      product_categories: { vi: 'Danh mục sản phẩm', en: 'Product Categories' },
      customer_types: { vi: 'Loại khách hàng', en: 'Customer Types' },
    };
    return names[category]?.[language] || category;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-3 sm:p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sm:mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{t('roleGroups.title')}</h2>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            {t('roleGroups.description')}
          </p>
        </div>
        
        <button
          onClick={() => handleOpenForm()}
          className="flex items-center justify-center gap-2 px-4 py-2.5 text-white rounded-lg transition-colors font-medium w-full sm:w-auto"
          style={{ backgroundColor: '#FE7410' }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#E56809'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FE7410'}
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
          <span>{t('common.addNew')}</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-xl border border-gray-200 dark:border-gray-700 mb-4 sm:mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
          <Input
            placeholder={t('roleGroups.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 sm:pl-10 text-sm"
            style={{ fontSize: '16px' }}
          />
        </div>
      </div>

      {/* Content */}
      {paginatedRoleGroups.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 sm:p-12 text-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
            <Search className="w-6 h-6 sm:w-8 sm:h-8 text-gray-300 dark:text-gray-600" />
          </div>
          <p className="text-sm sm:text-base font-medium text-gray-500 dark:text-gray-400">{t('roleGroups.noData')}</p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#FEF7ED] dark:bg-gray-700/50">
                  <tr>
                    <th className="table-header">
                      {t('roleGroups.table.name')}
                    </th>
                    <th className="table-header">
                      {t('roleGroups.table.description')}
                    </th>
                    <th className="table-header text-right">
                      {t('roleGroups.table.permissions')}
                    </th>
                    <th className="table-header text-center">
                      {t('roleGroups.table.type')}
                    </th>
                    <th className="table-header text-center">
                      {t('common.actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800">
                  {paginatedRoleGroups.map((role) => (
                    <tr key={role.id} className="transition-colors hover:bg-[#FEF7ED] dark:hover:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700 last:border-0">
                      <td className="table-content font-medium">
                        {role.name}
                      </td>
                      <td className="table-content text-gray-600 dark:text-gray-400">
                        {role.description}
                      </td>
                      <td className="table-content text-right">
                        {role.permissions.length} {t('roleGroups.permissionsCount')}
                      </td>
                      <td className="table-content text-center">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                          {role.isSystem 
                            ? t('roleGroups.type.system')
                            : t('roleGroups.type.custom')
                          }
                        </span>
                      </td>
                      <td className="table-content">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenForm(role.id)}
                            className="action-icon p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
                            title={t('common.edit')}
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(role.id, role.name)}
                            className="action-icon p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
                            title={t('common.delete')}
                          >
                            <Trash2 className="w-5 h-5 text-red-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Desktop Pagination */}
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

          {/* Mobile Card View */}
          <div className="md:hidden space-y-3">
            {paginatedRoleGroups.map((role) => (
              <div
                key={role.id}
                className="bg-white rounded-xl border border-gray-200 p-4"
              >
                {/* Role Header */}
                <div className="flex items-start justify-between mb-3 pb-3 border-b border-gray-200">
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-gray-900 text-base mb-1">
                      {role.name}
                    </div>
                    <div className="text-sm text-gray-600">
                      {role.description}
                    </div>
                  </div>
                  <div className="ml-3">
                    {role.isSystem ? (
                      <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                        {t('roleGroups.type.system')}
                      </span>
                    ) : (
                      <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        {t('roleGroups.type.custom')}
                      </span>
                    )}
                  </div>
                </div>

                {/* Permissions Count */}
                <div className="mb-3">
                  <div className="inline-flex items-center gap-2 px-3 py-2 bg-orange-50 text-[#FE7410] rounded-lg">
                    <span className="text-2xl font-bold">{role.permissions.length}</span>
                    <span className="text-sm font-medium">{t('roleGroups.permissionsCount')}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleOpenForm(role.id)}
                    className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-orange-50 text-[#FE7410] rounded-lg hover:bg-orange-100 transition-colors font-medium"
                  >
                    <Edit className="w-4 h-4" />
                    <span>{t('common.edit')}</span>
                  </button>
                  <button
                    onClick={() => handleDeleteClick(role.id, role.name)}
                    className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>{t('common.delete')}</span>
                  </button>
                </div>
              </div>
            ))}

            {/* Mobile Pagination */}
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
        </>
      )}

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={handleCloseForm}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle style={{ fontSize: '20px' }}>
              {editingRole ? t('roleGroups.form.editTitle') : t('roleGroups.form.addTitle')}
            </DialogTitle>
            <DialogDescription style={{ fontSize: '14px' }}>
              {t('roleGroups.form.description')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Name */}
            <div>
              <label className="block text-gray-700 mb-2">
                {t('roleGroups.form.name')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={t('roleGroups.form.namePlaceholder')}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FE7410] focus:border-transparent"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-gray-700 mb-2">
                {t('roleGroups.form.descriptionLabel')}
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder={t('roleGroups.form.descriptionPlaceholder')}
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FE7410] focus:border-transparent resize-none"
              />
            </div>

            {/* Permissions */}
            <div>
              <label className="block text-gray-700 mb-2">
                {t('roleGroups.form.permissions')} <span className="text-red-500">*</span>
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
              {t('common.cancel')}
            </Button>
            <Button onClick={handleSubmit} style={{ backgroundColor: '#FE7410' }} className="hover:opacity-90">
              {editingRole ? t('common.update') : t('common.create')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmRole !== null} onOpenChange={() => setDeleteConfirmRole(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle style={{ fontSize: '20px', color: '#dc2626' }}>
              {t('common.confirmDelete')}
            </DialogTitle>
            <DialogDescription>
              {language === 'vi'
                ? `Bạn có chắc chắn muốn xóa nhóm quyền "${deleteConfirmRole?.name}" không?`
                : `Are you sure you want to delete role group "${deleteConfirmRole?.name}"?`}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmRole(null)}>
              {t('common.cancel')}
            </Button>
            <Button 
              onClick={handleDeleteConfirm} 
              style={{ backgroundColor: '#dc2626' }} 
              className="hover:opacity-90"
            >
              {t('common.delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default RoleGroupManagement;