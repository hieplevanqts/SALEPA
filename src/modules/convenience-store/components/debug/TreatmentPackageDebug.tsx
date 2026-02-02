import { useStore } from '../../../../lib/convenience-store-lib/store';

export default function TreatmentPackageDebug() {
  const { customerTreatmentPackages, customers, orders } = useStore();
  
  const tranhMinhAnhCustomer = customers.find(c =>
    (c.name ?? c.full_name ?? '').includes('Trần Minh Anh'),
  );
  const tranhMinhAnhPackages = customerTreatmentPackages.filter(
    pkg => pkg.customerId === tranhMinhAnhCustomer?.id
  );
  const tranhMinhAnhOrders = orders.filter(
    order => order.customerPhone === tranhMinhAnhCustomer?.phone
  );
  
  return (
    <div className="fixed bottom-4 right-4 bg-white border-2 border-[#FE7410] rounded-lg p-4 shadow-xl max-w-md z-50">
      <h3 className="font-bold text-lg mb-2">🔍 Debug: Trần Minh Anh</h3>
      
      <div className="space-y-2 text-sm">
        <div>
          <strong>Customer:</strong>
          {tranhMinhAnhCustomer ? (
            <div className="ml-2 text-xs">
              <div>ID: {tranhMinhAnhCustomer.id}</div>
              <div>Tên: {tranhMinhAnhCustomer.name ?? tranhMinhAnhCustomer.full_name}</div>
              <div>SĐT: {tranhMinhAnhCustomer.phone}</div>
            </div>
          ) : (
            <span className="text-red-500 ml-2">Không tìm thấy</span>
          )}
        </div>
        
        <div>
          <strong>Orders ({tranhMinhAnhOrders.length}):</strong>
          {tranhMinhAnhOrders.length > 0 ? (
            <div className="ml-2 text-xs max-h-32 overflow-y-auto">
              {tranhMinhAnhOrders.map(order => (
                <div key={order.id} className="border-b py-1">
                  <div>ID: {order.id}</div>
                  <div>Items: {order.items.map(i => `${i.name} (${i.productType})`).join(', ')}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-yellow-600 ml-2">Chưa có đơn hàng</div>
          )}
        </div>
        
        <div>
          <strong>Treatment Packages ({tranhMinhAnhPackages.length}):</strong>
          {tranhMinhAnhPackages.length > 0 ? (
            <div className="ml-2 text-xs max-h-32 overflow-y-auto">
              {tranhMinhAnhPackages.map(pkg => (
                <div key={pkg.id} className="border-b py-1">
                  <div>ID: {pkg.id}</div>
                  <div>Gói: {pkg.treatmentName}</div>
                  <div>Đã dùng: {pkg.usedSessionNumbers.length}/{pkg.totalSessions} buổi</div>
                  <div>Sessions: {pkg.sessions?.length || 0} buổi</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-red-500 ml-2">Chưa có gói liệu trình</div>
          )}
        </div>
        
        <div className="pt-2 border-t">
          <strong>All Packages:</strong> {customerTreatmentPackages.length}
        </div>
      </div>
    </div>
  );
}
