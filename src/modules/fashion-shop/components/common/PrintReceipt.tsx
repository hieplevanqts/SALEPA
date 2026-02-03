import { X, Printer } from 'lucide-react';
import { useStore } from '../../../../lib/fashion-shop-lib/store';
import type { Order } from '../../../../lib/fashion-shop-lib/store';

interface PrintReceiptProps {
  order: Order;
  onClose: () => void;
}

export function PrintReceipt({ order, onClose }: PrintReceiptProps) {
  const { settings } = useStore();

  const handlePrint = () => {
    window.print();
  };

  const paymentMethodLabels: Record<string, string> = {
    cash: 'Tiền mặt',
    card: 'Thẻ',
    transfer: 'Chuyển khoản',
    momo: 'MoMo',
    zalopay: 'ZaloPay',
    vnpay: 'VNPay',
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="sticky top-0 flex justify-between items-center p-6 border-b border-gray-200 rounded-t-2xl print:hidden" style={{ background: 'linear-gradient(to right, #FE7410, #FE7410, #C026D3)' }}>
          <div>
            <h3 className="text-white text-2xl font-bold">Hóa đơn</h3>
            <p className="text-orange-100 text-sm">#{order.id}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Receipt Content */}
        <div className="p-8 print:p-4" id="receipt-content">
          {/* Business Info */}
          <div className="text-center mb-6 border-b-2 border-dashed border-gray-300 pb-6">
            <h1 className="text-3xl font-bold" style={{ color: '#FE7410' }}>
              {settings.businessName || 'SALEPA POS'}
            </h1>
            {settings.businessAddress && (
              <p className="text-gray-600 mt-2">{settings.businessAddress}</p>
            )}
            {settings.businessPhone && (
              <p className="text-gray-600">SĐT: {settings.businessPhone}</p>
            )}
          </div>

          {/* Order Info */}
          <div className="mb-6 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Mã đơn:</span>
              <span className="font-semibold">{order.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Ngày:</span>
              <span className="font-semibold">{new Date(order.date).toLocaleString('vi-VN')}</span>
            </div>
            {order.customerName && (
              <div className="flex justify-between">
                <span className="text-gray-600">Khách hàng:</span>
                <span className="font-semibold">{order.customerName}</span>
              </div>
            )}
            {order.customerPhone && (
              <div className="flex justify-between">
                <span className="text-gray-600">SĐT:</span>
                <span className="font-semibold">{order.customerPhone}</span>
              </div>
            )}
          </div>

          {/* Items */}
          <div className="mb-6">
            <div className="border-b-2 border-dashed border-gray-300 pb-2 mb-3">
              <div className="grid grid-cols-12 gap-2 text-sm font-semibold text-gray-700">
                <div className="col-span-5">Sản phẩm</div>
                <div className="col-span-2 text-center">SL</div>
                <div className="col-span-2 text-right">Đơn giá</div>
                <div className="col-span-3 text-right">Thành tiền</div>
              </div>
            </div>
            <div className="space-y-3">
              {order.items.map((item, index) => (
                <div key={index} className="text-sm">
                  <div className="grid grid-cols-12 gap-2">
                    <div className="col-span-5">
                      <div className="font-medium text-gray-900">{item.name}</div>
                      {item.note && (
                        <div className="text-xs text-gray-500 italic mt-1">Ghi chú: {item.note}</div>
                      )}
                      {item.discount > 0 && (
                        <div className="text-xs text-orange-600 mt-1">
                          Giảm giá: -{item.discount.toLocaleString('vi-VN')}đ
                        </div>
                      )}
                    </div>
                    <div className="col-span-2 text-center text-gray-700">
                      {item.quantity}
                    </div>
                    <div className="col-span-2 text-right text-gray-700">
                      {item.price.toLocaleString('vi-VN')}đ
                    </div>
                    <div className="col-span-3 text-right font-semibold text-gray-900">
                      {((item.price * item.quantity) - (item.discount || 0)).toLocaleString('vi-VN')}đ
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="border-t-2 border-dashed border-gray-300 pt-4 space-y-2 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tạm tính:</span>
              <span className="font-semibold">{order.subtotal.toLocaleString('vi-VN')}đ</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-sm text-orange-600">
                <span>Giảm giá đơn hàng:</span>
                <span className="font-semibold">-{order.discount.toLocaleString('vi-VN')}đ</span>
              </div>
            )}
            <div className="flex justify-between items-center pt-3 border-t border-gray-200">
              <span className="text-lg font-bold text-gray-900">Tổng thanh toán:</span>
              <span className="text-2xl font-bold" style={{ color: '#FE7410' }}>
                {order.total.toLocaleString('vi-VN')}đ
              </span>
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Phương thức thanh toán:</span>
              <span className="font-semibold">{paymentMethodLabels[order.paymentMethod] || order.paymentMethod}</span>
            </div>
            {order.receivedAmount !== undefined && (
              <div className="flex justify-between">
                <span className="text-gray-600">Tiền khách đưa:</span>
                <span className="font-semibold">{order.receivedAmount.toLocaleString('vi-VN')}đ</span>
              </div>
            )}
            {order.changeAmount !== undefined && order.changeAmount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Tiền thừa trả khách:</span>
                <span className="font-semibold text-lg">{order.changeAmount.toLocaleString('vi-VN')}đ</span>
              </div>
            )}
            {order.changeAmount !== undefined && order.changeAmount < 0 && (
              <div className="flex justify-between text-red-600">
                <span>Còn thiếu:</span>
                <span className="font-semibold text-lg">{Math.abs(order.changeAmount).toLocaleString('vi-VN')}đ</span>
              </div>
            )}
          </div>

          {/* Note */}
          {order.note && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="text-xs text-gray-500 mb-1">Ghi chú:</div>
              <div className="text-sm text-gray-700">{order.note}</div>
            </div>
          )}

          {/* Footer */}
          <div className="text-center text-sm text-gray-600 border-t-2 border-dashed border-gray-300 pt-6">
            <p className="font-semibold mb-2">Cảm ơn quý khách!</p>
            <p>Hẹn gặp lại quý khách</p>
            {settings.businessWebsite && (
              <p className="mt-2">{settings.businessWebsite}</p>
            )}
          </div>

          {/* Barcode/QR placeholder */}
          <div className="flex justify-center mt-6">
            <div className="border-2 border-gray-300 px-8 py-3 rounded text-sm font-mono">
              {order.id}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="sticky bottom-0 p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl print:hidden">
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={onClose}
              className="px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
            >
              Đóng
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-3 text-white rounded-lg transition-colors font-medium"
              style={{ backgroundColor: '#FE7410' }}
            >
              <div className="flex items-center justify-center gap-2">
                <Printer className="w-5 h-5" />
                In hóa đơn
              </div>
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #receipt-content,
          #receipt-content * {
            visibility: visible;
          }
          #receipt-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
