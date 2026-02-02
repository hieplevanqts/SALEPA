import { useState } from 'react';
import { X, Camera } from 'lucide-react';
import { useStore } from '../../../../lib/fashion-shop-lib/store';
import type { Customer } from '../../../../lib/fashion-shop-lib/store';
import { useTranslation } from '../../../../lib/fashion-shop-lib/useTranslation';

interface CustomerFormProps {
  customer: Customer | null;
  onClose: () => void;
}

// Vietnam Banks
const VIETNAM_BANKS = [
  'Vietcombank',
  'VietinBank',
  'BIDV',
  'Agribank',
  'Techcombank',
  'MB Bank',
  'ACB',
  'VPBank',
  'TPBank',
  'HDBank',
  'SHB',
  'VIB',
  'MSB',
  'OCB',
  'SeABank',
  'LienVietPostBank',
  'SCB',
  'VietBank',
  'PVcomBank',
  'Sacombank',
];

// Major provinces in Vietnam
const PROVINCES = [
  { id: 'HN', name: 'Hà Nội' },
  { id: 'HCM', name: 'TP. Hồ Chí Minh' },
  { id: 'DN', name: 'Đà Nẵng' },
  { id: 'HP', name: 'Hải Phòng' },
  { id: 'CT', name: 'Cần Thơ' },
  { id: 'BD', name: 'Bình Dương' },
  { id: 'DNA', name: 'Đồng Nai' },
  { id: 'KH', name: 'Khánh Hòa' },
  { id: 'BN', name: 'Bà Rịa - Vũng Tàu' },
  { id: 'QN', name: 'Quảng Nam' },
  { id: 'QB', name: 'Quảng Bình' },
  { id: 'TH', name: 'Thanh Hóa' },
  { id: 'NA', name: 'Nghệ An' },
];

// Sample wards mapped by province (simplified)
const WARDS: Record<string, string[]> = {
  'HN': ['Phường Phúc Xá', 'Phường Trúc Bạch', 'Phường Vĩnh Phúc', 'Phường Cống Vị', 'Phường Liễu Giai', 'Phường Nguyễn Trung Trực', 'Phường Quán Thánh', 'Phường Ngọc Hà', 'Phường Điện Biên', 'Phường Đội Cấn'],
  'HCM': ['Phường Bến Nghé', 'Phường Bến Thành', 'Phường Nguyễn Thái Bình', 'Phường Phạm Ngũ Lão', 'Phường Cầu Ông Lãnh', 'Phường Cô Giang', 'Phường Nguyễn Cư Trinh', 'Phường Cầu Kho', 'Phường Đa Kao', 'Phường Tân Định'],
  'DN': ['Phường Thanh Bình', 'Phường Thạch Thang', 'Phường Hải Châu 1', 'Phường Hải Châu 2', 'Phường Phước Ninh', 'Phường Hòa Thuận Tây', 'Phường Hòa Thuận Đông', 'Phường Nam Dương', 'Phường Bình Hiên', 'Phường Bình Thuận'],
  'HP': ['Phường Hoàng Văn Thụ', 'Phường Trại Cau', 'Phường Đông Hải', 'Phường Phan Bội Châu', 'Phường Máy Chai', 'Phường Minh Khai', 'Phường Quán Toan', 'Phường Hạ Lý', 'Phường Nam Hải', 'Phường Cầu Đất'],
  'CT': ['Phường An Hòa', 'Phường An Cư', 'Phường An Khánh', 'Phường An Nghiệp', 'Phường An Phú', 'Phường Xuân Khánh', 'Phường Hưng Lợi', 'Phường Thới Bình', 'Phường Cái Khế', 'Phường An Hội'],
};

export function CustomerForm({ customer, onClose }: CustomerFormProps) {
  const { t } = useTranslation();
  const { addCustomer, updateCustomer } = useStore();
  const isEdit = !!customer;

  const [formData, setFormData] = useState({
    name: customer?.name || '',
    phone: customer?.phone || '',
    email: customer?.email || '',
    address: customer?.address || '',
    dateOfBirth: customer?.dateOfBirth || '',
    gender: customer?.gender || '' as '' | 'male' | 'female' | 'other',
    taxCode: customer?.taxCode || '',
    avatar: customer?.avatar || '',
    
    // Invoice Information Fields
    customerType: customer?.customerType || 'individual' as 'individual' | 'organization',
    companyName: customer?.companyName || '',
    buyerName: customer?.buyerName || '',
    invoiceAddress: customer?.invoiceAddress || '',
    province: customer?.province || '',
    ward: customer?.ward || '',
    idNumber: customer?.idNumber || '',
    phoneInvoice: customer?.phoneInvoice || '',
    bank: customer?.bank || '',
    bankAccount: customer?.bankAccount || '',
    accountHolder: customer?.accountHolder || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value };
      
      // Reset dependent fields when parent changes
      if (field === 'province') {
        newData.ward = '';
      } else if (field === 'customerType') {
        // Clear type-specific fields when switching type
        if (value === 'individual') {
          newData.companyName = '';
        } else {
          newData.idNumber = '';
        }
      }
      
      return newData;
    });
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    // Basic info validation - only name and phone are required
    if (!formData.name.trim()) {
      newErrors.name = t.customerData?.errors?.nameRequired || 'Tên là bắt buộc';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = t.customerData?.errors?.phoneRequired || 'Số điện thoại là bắt buộc';
    } else if (!/^[0-9]{10,11}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = t.customerData?.errors?.phoneInvalid || 'Số điện thoại không hợp lệ (10-11 chữ số)';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t.customerData?.errors?.emailInvalid || 'Định dạng email không hợp lệ';
    }

    // Invoice information - validate format but not required
    if (formData.taxCode && !/^[0-9]{10}$|^[0-9]{13}$/.test(formData.taxCode.replace(/\s/g, ''))) {
      newErrors.taxCode = t.customerData?.errors?.taxCodeInvalid || 'Mã số thuế phải có 10 hoặc 13 số';
    }

    if (formData.phoneInvoice && !/^[0-9]{10}$/.test(formData.phoneInvoice.replace(/\s/g, ''))) {
      newErrors.phoneInvoice = t.customerData?.errors?.phoneInvoiceInvalid || 'Số điện thoại không hợp lệ (10 số)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    if (isEdit && customer) {
      updateCustomer(customer.id, formData);
    } else {
      addCustomer(formData);
    }

    onClose();
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleChange('avatar', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Get available wards based on selected province
  const availableWards = formData.province ? WARDS[formData.province] || [] : [];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-2xl max-w-5xl w-full my-8" style={{ maxHeight: 'calc(100vh - 4rem)' }}>
        {/* Header - Orange Theme (Softer) */}
        <div className="sticky top-0 bg-[#FE7410] text-white px-6 py-4 flex justify-between items-center rounded-t-lg z-10">
          <h3 className="text-xl font-bold">
            {isEdit ? (t.customerData?.editTitle || 'Chỉnh sửa Khách hàng') : (t.customerData?.addTitle || 'Thêm Khách hàng')}
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="overflow-y-auto p-6" style={{ maxHeight: 'calc(100vh - 12rem)' }}>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Avatar Section */}
            <div className="flex justify-center mb-4">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                  {formData.avatar ? (
                    <img src={formData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <Camera className="w-10 h-10 text-gray-400" />
                  )}
                </div>
                <label className="absolute bottom-0 right-0 p-2 bg-[#FE7410] text-white rounded-full cursor-pointer hover:bg-[#E56809] transition-colors">
                  <Camera className="w-4 h-4" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Personal Information */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">{t.customerData?.personalInfo || 'Thông tin cá nhân'}</h4>
              
              <div className="grid grid-cols-2 gap-4">
                {/* Name */}
                <div>
                  <label className="block text-gray-700 mb-2">{t.customerData?.name || 'Họ và tên'} *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="Nguyễn Văn A"
                    className={`w-full px-4 py-2.5 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-[#FE7410] focus:border-transparent`}
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-gray-700 mb-2">{t.customerData?.phone || 'Số điện thoại'} *</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    placeholder="0912345678"
                    className={`w-full px-4 py-2.5 border ${errors.phone ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-[#FE7410] focus:border-transparent`}
                    inputMode="numeric"
                  />
                  {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="email@example.com"
                    className={`w-full px-4 py-2.5 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-[#FE7410] focus:border-transparent`}
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="block text-gray-700 mb-2">{t.customerData?.dateOfBirth || 'Ngày sinh'}</label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FE7410] focus:border-transparent"
                  />
                </div>

                {/* Gender - Radio buttons */}
                <div className="col-span-2">
                  <label className="block text-gray-700 mb-2">{t.customerData?.gender || 'Giới tính'}</label>
                  <div className="flex gap-6">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="gender"
                        value="male"
                        checked={formData.gender === 'male'}
                        onChange={(e) => handleChange('gender', e.target.value)}
                        className="w-4 h-4 text-[#FE7410] focus:ring-[#FE7410] border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-700 text-[16px]">{t.customerData?.male || 'Nam'}</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="gender"
                        value="female"
                        checked={formData.gender === 'female'}
                        onChange={(e) => handleChange('gender', e.target.value)}
                        className="w-4 h-4 text-[#FE7410] focus:ring-[#FE7410] border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-700 text-[16px]">{t.customerData?.female || 'Nữ'}</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="gender"
                        value="other"
                        checked={formData.gender === 'other'}
                        onChange={(e) => handleChange('gender', e.target.value)}
                        className="w-4 h-4 text-[#FE7410] focus:ring-[#FE7410] border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-700 text-[16px]">{t.customerData?.other || 'Khác'}</span>
                    </label>
                  </div>
                </div>

                {/* Address */}
                <div className="col-span-2">
                  <label className="block text-gray-700 mb-2">{t.customerData?.address || 'Địa chỉ'}</label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                    placeholder="123 Đường ABC, Phường XYZ"
                    rows={2}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FE7410] focus:border-transparent resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Invoice Information */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">{t.customerData?.invoiceInfo || 'Thông tin xuất hóa đơn'}</h4>
              
              <div className="grid grid-cols-2 gap-4">
                {/* Customer Type - Radio */}
                <div className="col-span-2">
                  <label className="block text-gray-700 mb-2">{t.customerData?.customerType || 'Loại khách hàng'}</label>
                  <div className="flex gap-6">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="customerType"
                        value="individual"
                        checked={formData.customerType === 'individual'}
                        onChange={(e) => handleChange('customerType', e.target.value)}
                        className="w-4 h-4 text-[#FE7410] focus:ring-[#FE7410] border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-700 text-[16px]">{t.customerData?.individual || 'Cá nhân'}</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="customerType"
                        value="organization"
                        checked={formData.customerType === 'organization'}
                        onChange={(e) => handleChange('customerType', e.target.value)}
                        className="w-4 h-4 text-[#FE7410] focus:ring-[#FE7410] border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-700 text-[16px]">{t.customerData?.organization || 'Tổ chức'}</span>
                    </label>
                  </div>
                </div>

                {/* Tax Code */}
                <div>
                  <label className="block text-gray-700 mb-2">{t.customerData?.taxCode || 'Mã số thuế'}</label>
                  <input
                    type="text"
                    value={formData.taxCode}
                    onChange={(e) => handleChange('taxCode', e.target.value)}
                    placeholder="0123456789"
                    className={`w-full px-4 py-2.5 border ${errors.taxCode ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-[#FE7410] focus:border-transparent`}
                  />
                  {errors.taxCode && <p className="text-red-500 text-sm mt-1">{errors.taxCode}</p>}
                </div>

                {/* Company Name - Only for Organization */}
                {formData.customerType === 'organization' && (
                  <div>
                    <label className="block text-gray-700 mb-2">{t.customerData?.companyName || 'Tên công ty'}</label>
                    <input
                      type="text"
                      value={formData.companyName}
                      onChange={(e) => handleChange('companyName', e.target.value)}
                      placeholder="Công ty TNHH ABC"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FE7410] focus:border-transparent"
                    />
                  </div>
                )}

                {/* Buyer Name */}
                <div>
                  <label className="block text-gray-700 mb-2">{t.customerData?.buyerName || 'Tên người mua'}</label>
                  <input
                    type="text"
                    value={formData.buyerName}
                    onChange={(e) => handleChange('buyerName', e.target.value)}
                    placeholder="Nguyễn Văn B"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FE7410] focus:border-transparent"
                  />
                </div>

                {/* ID Number - Only for Individual */}
                {formData.customerType === 'individual' && (
                  <div>
                    <label className="block text-gray-700 mb-2">{t.customerData?.idNumber || 'Số CCCD/CMND'}</label>
                    <input
                      type="text"
                      value={formData.idNumber}
                      onChange={(e) => handleChange('idNumber', e.target.value)}
                      placeholder="001234567890"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FE7410] focus:border-transparent"
                      inputMode="numeric"
                    />
                  </div>
                )}

                {/* Invoice Address */}
                <div className="col-span-2">
                  <label className="block text-gray-700 mb-2">{t.customerData?.invoiceAddress || 'Địa chỉ xuất hóa đơn'}</label>
                  <textarea
                    value={formData.invoiceAddress}
                    onChange={(e) => handleChange('invoiceAddress', e.target.value)}
                    placeholder="123 Đường ABC, Phường XYZ"
                    rows={2}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FE7410] focus:border-transparent resize-none"
                  />
                </div>

                {/* Province */}
                <div>
                  <label className="block text-gray-700 mb-2">{t.customerData?.province || 'Tỉnh/Thành phố'}</label>
                  <select
                    value={formData.province}
                    onChange={(e) => handleChange('province', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FE7410] focus:border-transparent"
                  >
                    <option value="">{t.customerData?.selectProvince || 'Chọn Tỉnh/Thành phố'}</option>
                    {PROVINCES.map((province) => (
                      <option key={province.id} value={province.id}>
                        {province.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Ward */}
                <div>
                  <label className="block text-gray-700 mb-2">{t.customerData?.ward || 'Phường/Xã'}</label>
                  <select
                    value={formData.ward}
                    onChange={(e) => handleChange('ward', e.target.value)}
                    disabled={!formData.province}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FE7410] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">{t.customerData?.selectWard || 'Chọn Phường/Xã'}</option>
                    {availableWards.map((ward) => (
                      <option key={ward} value={ward}>
                        {ward}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Phone Invoice */}
                <div>
                  <label className="block text-gray-700 mb-2">{t.customerData?.phoneInvoice || 'Số điện thoại'}</label>
                  <input
                    type="tel"
                    value={formData.phoneInvoice}
                    onChange={(e) => handleChange('phoneInvoice', e.target.value)}
                    placeholder="0912345678"
                    className={`w-full px-4 py-2.5 border ${errors.phoneInvoice ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-[#FE7410] focus:border-transparent`}
                    inputMode="numeric"
                  />
                  {errors.phoneInvoice && <p className="text-red-500 text-sm mt-1">{errors.phoneInvoice}</p>}
                </div>

                {/* Bank */}
                <div>
                  <label className="block text-gray-700 mb-2">{t.customerData?.bank || 'Ngân hàng'}</label>
                  <select
                    value={formData.bank}
                    onChange={(e) => handleChange('bank', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FE7410] focus:border-transparent"
                  >
                    <option value="">{t.customerData?.selectBank || 'Chọn ngân hàng'}</option>
                    {VIETNAM_BANKS.map((bank) => (
                      <option key={bank} value={bank}>
                        {bank}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Bank Account */}
                <div>
                  <label className="block text-gray-700 mb-2">{t.customerData?.bankAccount || 'Số tài khoản NH'}</label>
                  <input
                    type="text"
                    value={formData.bankAccount}
                    onChange={(e) => handleChange('bankAccount', e.target.value)}
                    placeholder="1234567890"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FE7410] focus:border-transparent"
                    inputMode="numeric"
                  />
                </div>

                {/* Account Holder */}
                <div>
                  <label className="block text-gray-700 mb-2">{t.customerData?.accountHolder || 'Chủ tài khoản'}</label>
                  <input
                    type="text"
                    value={formData.accountHolder}
                    onChange={(e) => handleChange('accountHolder', e.target.value)}
                    placeholder="NGUYEN VAN A"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FE7410] focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {t.common?.cancel || t.cancel || 'Hủy'}
              </button>
              <button
                type="submit"
                disabled={!formData.name.trim() || !formData.phone.trim()}
                className="px-6 py-3 bg-[#FE7410] text-white rounded-lg hover:bg-[#E56809] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed shadow-lg"
              >
                {t.common?.save || t.save || 'Lưu'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}