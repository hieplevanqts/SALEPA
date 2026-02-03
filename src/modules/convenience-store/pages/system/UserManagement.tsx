import { useState, useEffect } from 'react';
import { useStore } from '../../../../lib/convenience-store-lib/store';
import { 
  Search, Filter, Plus, Edit, Trash2, Key, Power, 
  UserCircle, Mail, Phone, Shield,
  AlertCircle, Eye, EyeOff, X, Check
} from 'lucide-react';
import type { User } from '../../../../lib/convenience-store-lib/store';
import { Pagination } from '../../components/pagination/Pagination';

export function UserManagement() {
  const { users, createUser, updateUser, deleteUser, toggleUserStatus, changeUserPassword } = useStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState<User | null>(null);
  const [deleteConfirmUser, setDeleteConfirmUser] = useState<User | null>(null);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  
  const roleGroups = useStore((state) => state.roleGroups);
  
  // Form states
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    fullName: '',
    email: '',
    phone: '',
    roleGroupId: '',
    isActive: true,
    notes: '',
  });
  
  // Password modal states
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      (user.fullName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.username || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.phone || '').includes(searchQuery);
    
    const matchesRole = filterRole === 'all' || user.roleGroupId === filterRole;
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'active' ? user.isActive : !user.isActive);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterRole, filterStatus]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const handleOpenForm = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        username: user.username,
        password: '',
        fullName: user.fullName,
        email: user.email || '',
        phone: user.phone || '',
        roleGroupId: user.roleGroupId,
        isActive: user.isActive,
        notes: user.notes || '',
      });
    } else {
      setEditingUser(null);
      setFormData({
        username: '',
        password: '',
        fullName: '',
        email: '',
        phone: '',
        roleGroupId: '',
        isActive: true,
        notes: '',
      });
    }
    setShowUserForm(true);
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingUser) {
      // Update existing user
      updateUser(editingUser.id, {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        roleGroupId: formData.roleGroupId,
        isActive: formData.isActive,
        notes: formData.notes,
      });
    } else {
      // Create new user
      if (!formData.username || !formData.password || !formData.fullName) {
        alert('Vui lòng điền đầy đủ thông tin bắt buộc!');
        return;
      }
      
      // Check if username already exists
      if (users.some(u => u.username === formData.username)) {
        alert('Tên đăng nhập đã tồn tại!');
        return;
      }
      
      createUser({
        username: formData.username,
        password: formData.password,
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        roleGroupId: formData.roleGroupId,
        isActive: formData.isActive,
        notes: formData.notes,
      });
    }
    
    setShowUserForm(false);
  };

  const handleChangePassword = () => {
    if (!showPasswordModal) return;
    
    if (newPassword !== confirmPassword) {
      alert('Mật khẩu xác nhận không khớp!');
      return;
    }
    
    if (newPassword.length < 6) {
      alert('Mật khẩu phải có ít nhất 6 ký tự!');
      return;
    }
    
    changeUserPassword(showPasswordModal.id, newPassword);
    setShowPasswordModal(null);
    setNewPassword('');
    setConfirmPassword('');
  };

  const getRoleGroupBadge = (roleGroupId: string) => {
    const roleGroup = roleGroups.find(rg => rg.id === roleGroupId);
    if (!roleGroup) return <span className="text-gray-400">-</span>;
    
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
        {roleGroup.name}
      </span>
    );
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-3 sm:p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sm:mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Quản lý người dùng</h2>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            {filteredUsers.length} / {users.length} người dùng
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
          <span>Thêm người dùng</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-xl border border-gray-200 dark:border-gray-700 mb-4 sm:mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, username, email, SĐT..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FE7410] focus:border-transparent text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
            />
          </div>

          {/* Filter by Role */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 dark:text-gray-500" />
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value as any)}
              className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FE7410] focus:border-transparent appearance-none bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white"
            >
              <option value="all">Tất cả vai trò</option>
              {roleGroups.map(roleGroup => (
                <option key={roleGroup.id} value={roleGroup.id}>{roleGroup.name}</option>
              ))}
            </select>
          </div>

          {/* Filter by Status */}
          <div className="relative">
            <Power className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 dark:text-gray-500" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FE7410] focus:border-transparent appearance-none bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Đang hoạt động</option>
              <option value="inactive">Ngừng hoạt động</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      {paginatedUsers.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 sm:p-12 text-center">
          <UserCircle className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 text-gray-300 dark:text-gray-600" />
          <p className="text-sm sm:text-base font-medium text-gray-500 dark:text-gray-400">Không tìm thấy người dùng</p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#FEF7ED] dark:bg-gray-700/50">
                  <tr>
                    <th className="table-header">Người dùng</th>
                    <th className="table-header">Tên đăng nhập</th>
                    <th className="table-header">Liên hệ</th>
                    <th className="table-header text-center">Vai trò</th>
                    <th className="table-header text-center">Trạng thái</th>
                    <th className="table-header text-center">Đăng nhập cuối</th>
                    <th className="table-header actions-left">Hành động</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800">
                  {paginatedUsers.map((user) => (
                    <tr key={user.id} className="transition-colors hover:bg-[#FEF7ED] dark:hover:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700 last:border-0">
                      <td className="table-content">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                            {user.fullName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{user.fullName}</p>
                            {user.createdBy && (
                              <p className="text-xs text-gray-500 dark:text-gray-400">Tạo bởi: {user.createdBy}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="table-content">
                        {user.username}
                      </td>
                      <td className="table-content">
                        <div className="space-y-0.5">
                          {user.email && (
                            <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                              <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                              <span>{user.email}</span>
                            </div>
                          )}
                          {user.phone && (
                            <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                              <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                              <span>{user.phone}</span>
                            </div>
                          )}
                          {!user.email && !user.phone && (
                            <span className="text-gray-400 dark:text-gray-500">-</span>
                          )}
                        </div>
                      </td>
                      <td className="table-content text-center">
                        {getRoleGroupBadge(user.roleGroupId)}
                      </td>
                      <td className="table-content text-center">
                        {user.isActive ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700 border border-green-200">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-600"></div>
                            Hoạt động
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-600 border border-gray-200">
                            <div className="w-1.5 h-1.5 rounded-full bg-gray-600"></div>
                            Ngừng
                          </span>
                        )}
                      </td>
                      <td className="table-content text-center">
                        {formatDate(user.lastLogin)}
                      </td>
                      <td className="actions-left">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => toggleUserStatus(user.id)}
                            className="action-icon p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            title={user.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'}
                          >
                            <Power className={`w-5 h-5 ${user.isActive ? 'text-gray-500' : 'text-green-600'}`} />
                          </button>
                          <button
                            onClick={() => handleOpenForm(user)}
                            className="action-icon p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Sửa"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => setShowPasswordModal(user)}
                            className="action-icon p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Đổi mật khẩu"
                          >
                            <Key className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmUser(user)}
                            className="action-icon p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Xóa"
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
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredUsers.length}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-3">
            {paginatedUsers.map((user) => (
              <div
                key={user.id}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4"
              >
                {/* User Header */}
                <div className="flex items-start gap-3 mb-3 pb-3 border-b border-gray-200 dark:border-gray-700">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                    {user.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-gray-900 dark:text-white text-base truncate">
                      {user.fullName}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      🔑 {user.username}
                    </div>
                    {user.createdBy && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        Tạo bởi: {user.createdBy}
                      </div>
                    )}
                  </div>
                  <div>
                    {user.isActive ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-600"></div>
                        Hoạt động
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                        <div className="w-1.5 h-1.5 rounded-full bg-gray-600"></div>
                        Ngừng
                      </span>
                    )}
                  </div>
                </div>

                {/* User Info */}
                <div className="space-y-2 mb-3">
                  {/* Contact */}
                  {(user.email || user.phone) && (
                    <div className="space-y-1.5">
                      {user.email && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <Mail className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">{user.email}</span>
                        </div>
                      )}
                      {user.phone && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <Phone className="w-4 h-4 flex-shrink-0" />
                          <span>{user.phone}</span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Role */}
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="text-sm">{getRoleGroupBadge(user.roleGroupId)}</span>
                  </div>
                  
                  {/* Last Login */}
                  {user.lastLogin && (
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Đăng nhập cuối: {formatDate(user.lastLogin)}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="grid grid-cols-4 gap-2">
                  <button
                    onClick={() => toggleUserStatus(user.id)}
                    className={`flex flex-col items-center justify-center gap-1 px-2 py-2 rounded-lg transition-colors ${
                      user.isActive 
                        ? 'bg-gray-50 text-gray-700 hover:bg-gray-100' 
                        : 'bg-green-50 text-green-600 hover:bg-green-100'
                    }`}
                    title={user.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'}
                  >
                    <Power className="w-4 h-4" />
                    <span className="text-xs font-medium">{user.isActive ? 'Tắt' : 'Bật'}</span>
                  </button>
                  <button
                    onClick={() => handleOpenForm(user)}
                    className="flex flex-col items-center justify-center gap-1 px-2 py-2 bg-orange-50 text-[#FE7410] rounded-lg hover:bg-orange-100 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    <span className="text-xs font-medium">Sửa</span>
                  </button>
                  <button
                    onClick={() => setShowPasswordModal(user)}
                    className="flex flex-col items-center justify-center gap-1 px-2 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <Key className="w-4 h-4" />
                    <span className="text-xs font-medium">MK</span>
                  </button>
                  <button
                    onClick={() => setDeleteConfirmUser(user)}
                    className="flex flex-col items-center justify-center gap-1 px-2 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="text-xs font-medium">Xóa</span>
                  </button>
                </div>
              </div>
            ))}

            {/* Mobile Pagination */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredUsers.length}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
          </div>
        </>
      )}

      {/* User Form Modal */}
      {showUserForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingUser ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}
              </h3>
              <button
                onClick={() => setShowUserForm(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Họ tên đầy đủ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Nguyễn Văn A"
                  />
                </div>

                {/* Username */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Tên đăng nhập <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    disabled={!!editingUser}
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="username"
                  />
                </div>

                {/* Password - Only for new user */}
                {!editingUser && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Mật khẩu <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="••••••••"
                      minLength={6}
                    />
                  </div>
                )}

                {/* Role */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Vai trò <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.roleGroupId}
                    onChange={(e) => setFormData({ ...formData, roleGroupId: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none bg-white dark:bg-gray-700"
                  >
                    {roleGroups.map(roleGroup => (
                      <option key={roleGroup.id} value={roleGroup.id}>{roleGroup.name}</option>
                    ))}
                  </select>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="email@example.com"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="0901234567"
                  />
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500"
                  />
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Kích hoạt tài khoản</span>
                </label>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Ghi chú
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                  placeholder="Ghi chú về người dùng..."
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setShowUserForm(false)}
                  className="flex-1 px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-[#FE7410] text-white rounded-xl font-semibold hover:bg-orange-600 transition-colors"
                >
                  {editingUser ? 'Cập nhật' : 'Thêm mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Key className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Đổi mật khẩu</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{showPasswordModal.fullName}</p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              {/* New Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Mật khẩu mới
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-2.5 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Xác nhận mật khẩu
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2.5 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowPasswordModal(null);
                  setNewPassword('');
                  setConfirmPassword('');
                }}
                className="flex-1 px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleChangePassword}
                className="flex-1 px-4 py-3 bg-[#FE7410] text-white rounded-xl font-semibold hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
              >
                <Check className="w-5 h-5" />
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Xóa người dùng</h3>
                
              </div>
            </div>

            

            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Bạn có chắc chắn muốn xóa người dùng này không? Tất cả dữ liệu liên quan sẽ bị xóa vĩnh viễn.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirmUser(null)}
                className="flex-1 px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  deleteUser(deleteConfirmUser.id);
                  setDeleteConfirmUser(null);
                }}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserManagement;