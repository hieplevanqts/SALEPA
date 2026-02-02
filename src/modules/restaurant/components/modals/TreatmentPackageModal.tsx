import { useState } from 'react';
import { X, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import type { CustomerTreatmentPackage } from '../../../../lib/restaurant-lib/store';
import { loadDemoPackagesV2 } from '../../../../lib/restaurant-lib/demoPackagesV2';

interface TreatmentPackageModalProps {
  isOpen: boolean;
  onClose: () => void;
  packages: CustomerTreatmentPackage[];
  onSelectSession: (packageId: string, sessionNumbers: number[], packageName: string) => void;
}

export default function TreatmentPackageModal({
  isOpen,
  onClose,
  packages,
  onSelectSession,
}: TreatmentPackageModalProps) {
  const [selectedSessions, setSelectedSessions] = useState<{[key: string]: number[]}>({});
  const [collapsedPackages, setCollapsedPackages] = useState<{[key: string]: boolean}>({});

  if (!isOpen) return null;

  // Debug logging
  console.log('📦 TreatmentPackageModal - Received packages:', packages);
  
  // Filter packages to only show V2 packages with sessions
  const validPackages = packages.filter(pkg => pkg.sessions && pkg.sessions.length > 0);
  
  console.log('📦 TreatmentPackageModal - Valid packages:', validPackages);

  const handleToggleSession = (packageId: string, sessionNumber: number) => {
    setSelectedSessions(prev => {
      const currentSelections = prev[packageId] || [];
      const isSelected = currentSelections.includes(sessionNumber);
      
      if (isSelected) {
        return {
          ...prev,
          [packageId]: currentSelections.filter(s => s !== sessionNumber)
        };
      } else {
        return {
          ...prev,
          [packageId]: [...currentSelections, sessionNumber].sort((a, b) => a - b)
        };
      }
    });
  };

  const handleToggleCollapse = (packageId: string) => {
    setCollapsedPackages(prev => ({
      ...prev,
      [packageId]: !prev[packageId]
    }));
  };

  const handleConfirmAllSelections = () => {
    // Xác nhận tất cả selections từ tất cả packages
    Object.entries(selectedSessions).forEach(([packageId, sessionNumbers]) => {
      if (sessionNumbers.length > 0) {
        const pkg = validPackages.find(p => p.id === packageId);
        if (pkg) {
          onSelectSession(packageId, sessionNumbers, pkg.treatmentName);
        }
      }
    });
    setSelectedSessions({});
    onClose();
  };

  // Đếm tổng số buổi đã chọn
  const totalSelectedSessions = Object.values(selectedSessions).reduce(
    (sum, sessions) => sum + sessions.length, 
    0
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col font-['Inter']">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-bold text-gray-900">Chọn gói liệu trình</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {validPackages.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-500 mb-4">
                Khách hàng chưa có gói liệu trình nào
              </div>
              
              <button
                onClick={() => {
                  loadDemoPackagesV2();
                  setTimeout(() => window.location.reload(), 500);
                }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#FE7410] text-white rounded-lg hover:bg-[#E56509] transition-colors font-medium mb-4"
              >
                <RefreshCw className="w-4 h-4" />
                Tải demo packages V2
              </button>
              
              <div className="text-xs text-gray-400 bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p className="font-semibold mb-2">💡 Hoặc tải thủ công:</p>
                <p className="mb-1">1. Mở Console (F12)</p>
                <p className="mb-1">2. Chạy lệnh: <code className="bg-gray-200 px-2 py-1 rounded">loadDemoPackagesV2()</code></p>
                <p>3. Trang sẽ tự động reload với demo data</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {validPackages.map((pkg) => {
                const usedSessionNumbers = pkg.usedSessionNumbers || [];
                const selectedCount = (selectedSessions[pkg.id] || []).length;
                
                return (
                  <div key={pkg.id} className="border rounded-lg">
                    {/* Package Header - Clickable to collapse */}
                    <button
                      onClick={() => handleToggleCollapse(pkg.id)}
                      className="w-full bg-gray-50 px-4 py-3 border-b flex items-center justify-between hover:bg-gray-100 transition-colors text-left"
                    >
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900">{pkg.treatmentName}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Đã sử dụng: {usedSessionNumbers.length}/{pkg.totalSessions} buổi
                          {selectedCount > 0 && (
                            <span className="ml-2 text-[#FE7410] font-semibold">
                              • Đang chọn: {selectedCount} buổi
                            </span>
                          )}
                        </p>
                      </div>
                      {collapsedPackages[pkg.id] ? (
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                      ) : (
                        <ChevronUp className="w-5 h-5 text-gray-500" />
                      )}
                    </button>

                    {/* Sessions List - Collapsible */}
                    {!collapsedPackages[pkg.id] && (
                      <div className="divide-y">
                        {pkg.sessions.map((session) => {
                          const isUsed = usedSessionNumbers.includes(session.sessionNumber);
                          const isSelected = (selectedSessions[pkg.id] || []).includes(session.sessionNumber);
                          
                          return (
                            <div
                              key={session.sessionNumber}
                              className={`px-4 py-3 ${
                                isUsed ? 'bg-gray-50' : isSelected ? 'bg-orange-50' : 'bg-white'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex items-start gap-3 flex-1">
                                  {/* Checkbox */}
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    disabled={isUsed}
                                    onChange={() => handleToggleSession(pkg.id, session.sessionNumber)}
                                    className="mt-1 w-4 h-4 text-[#FE7410] border-gray-300 rounded focus:ring-[#FE7410] disabled:opacity-50 disabled:cursor-not-allowed"
                                  />
                                  
                                  <div className="flex-1">
                                    <div className="font-medium text-gray-900">
                                      {session.sessionName}
                                    </div>
                                    <ul className="mt-1.5 space-y-0.5 text-sm text-gray-600">
                                      {session.items.map((item, idx) => (
                                        <li key={idx}>
                                          • {item.productName}
                                          {item.quantity > 1 && ` (x${item.quantity})`}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                </div>
                                
                                {isUsed && (
                                  <span className="px-3 py-1.5 bg-gray-200 text-gray-500 rounded text-sm font-medium">
                                    Đã dùng
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className={`${totalSelectedSessions > 0 ? 'flex-1' : 'w-full'} px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium`}
            >
              Đóng
            </button>
            {totalSelectedSessions > 0 && (
              <button
                onClick={handleConfirmAllSelections}
                className="flex-1 px-4 py-2 bg-[#FE7410] text-white rounded-lg hover:bg-[#E56509] transition-colors font-medium"
              >
                Xác nhận tất cả {totalSelectedSessions} buổi
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}