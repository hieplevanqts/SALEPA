import type { Order, Customer } from '../../../../lib/spa-lib/store';
import { useTranslation } from '../../../../lib/spa-lib/useTranslation';
import logoSalepa from "../../../../assets/da526f2429ac0b8456776974a6480c4f4260145c.png";

interface InvoicePDFDocumentProps {
  order: Order;
  zoom: number;
  customer?: Customer; // Thông tin chi tiết khách hàng
}

export function InvoicePDFDocument({ order, zoom, customer }: InvoicePDFDocumentProps) {
  const { t } = useTranslation();
  
  // Company information (should be from settings)
  const companyInfo = {
    name: 'CÔNG TY CỔ PHẦN SALEPA',
    taxCode: '0123456789',
    address: '123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh',
    phone: '(028) 1234 5678',
    email: 'contact@salepa.vn',
  };

  // Calculate VAT (10%)
  const vatRate = 0.1;
  const subtotalBeforeVAT = order.subtotal / (1 + vatRate);
  const vatAmount = order.subtotal - subtotalBeforeVAT;

  // Get items array
  const items = Array.isArray(order.items) ? order.items : Object.values(order.items || {});

  // Format invoice number from order.id (HD + DDMMYY + 0001)
  const invoiceNumber = order.id;

  // Invoice status
  const isDraft = !order.invoiceStatus || order.invoiceStatus === 'not_issued';
  const isIssued = order.invoiceStatus === 'issued';
  const isError = order.invoiceStatus === 'error';

  return (
    <div 
      style={{ 
        backgroundColor: '#FFFFFF',
        width: '210mm',
        minHeight: '297mm',
        padding: '20mm',
        transform: `scale(${zoom})`,
        transformOrigin: 'top center',
        fontFamily: 'Inter, sans-serif',
        position: 'relative',
        margin: '0 auto',
      }}
    >
      {/* Watermark NHÁP hoặc LỖI */}
      {(isDraft || isError) && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%) rotate(-45deg)',
            fontSize: '140px',
            fontWeight: 'bold',
            color: isError ? 'rgba(220, 38, 38, 0.08)' : 'rgba(107, 114, 128, 0.08)',
            zIndex: 1,
            pointerEvents: 'none',
            userSelect: 'none',
            whiteSpace: 'nowrap',
            letterSpacing: '20px',
          }}
        >
          {isError ? 'LỖI' : 'NHÁP'}
        </div>
      )}

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 2 }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px', paddingBottom: '20px', borderBottom: '1px solid #E5E7EB' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#000000', marginBottom: '10px', textTransform: 'uppercase' }}>
              {companyInfo.name}
            </div>
            <div style={{ fontSize: '10px', color: '#000000', lineHeight: '1.8' }}>
              <div>Mã số thuế: {companyInfo.taxCode}</div>
              <div>Địa chỉ: {companyInfo.address}</div>
              <div>Điện thoại: {companyInfo.phone}</div>
              <div>Email: {companyInfo.email}</div>
            </div>
          </div>
          <div style={{ 
            width: '120px', 
            height: '50px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            flexShrink: 0,
            padding: '4px'
          }}>
            <img 
              src={logoSalepa} 
              alt="Salepa Logo" 
              style={{ 
                width: '100%', 
                height: '100%', 
                objectFit: 'contain' 
              }} 
            />
          </div>
        </div>

        {/* Invoice Title */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#B91C1C', marginBottom: '6px', letterSpacing: '1px' }}>
            HÓA ĐƠN BÁN HÀNG
          </div>
          <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '8px' }}>
            Ngày {new Date(order.date).getDate()} tháng {new Date(order.date).getMonth() + 1} năm {new Date(order.date).getFullYear()}
          </div>
        </div>

        {/* Invoice Info - Right aligned */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
          <div style={{ textAlign: 'right', fontSize: '11px', color: '#000000', lineHeight: '1.8' }}>
            <div>Mẫu số: <span style={{ fontWeight: '700', color: '#000000' }}>01GTKT</span></div>
            <div>Ký hiệu: <span style={{ fontWeight: '700', color: '#000000' }}>{invoiceNumber.slice(-8).toUpperCase()}</span></div>
          </div>
        </div>

        {/* Buyer Info */}
        <div style={{ marginBottom: '25px', fontSize: '11px', color: '#000000', lineHeight: '2' }}>
          <div style={{ display: 'flex' }}>
            <span style={{ width: '140px', flexShrink: 0, fontWeight: '500' }}>Họ tên người mua hàng:</span>
            <span style={{ flex: 1, borderBottom: '1px dotted #D1D5DB', fontWeight: '600', paddingBottom: '2px' }}>
              {customer?.buyerName || order.customerName || ''}
            </span>
          </div>
          <div style={{ display: 'flex', marginTop: '6px' }}>
            <span style={{ width: '140px', flexShrink: 0, fontWeight: '500' }}>Tên đơn vị:</span>
            <span style={{ flex: 1, borderBottom: '1px dotted #D1D5DB', paddingBottom: '2px' }}>
              {customer?.companyName || ''}
            </span>
          </div>
          <div style={{ display: 'flex', marginTop: '6px' }}>
            <span style={{ width: '140px', flexShrink: 0, fontWeight: '500' }}>Mã số thuế:</span>
            <span style={{ flex: 1, borderBottom: '1px dotted #D1D5DB', paddingBottom: '2px' }}>
              {customer?.taxCode || ''}
            </span>
          </div>
          <div style={{ display: 'flex', marginTop: '6px' }}>
            <span style={{ width: '140px', flexShrink: 0, fontWeight: '500' }}>Địa chỉ:</span>
            <span style={{ flex: 1, borderBottom: '1px dotted #D1D5DB', paddingBottom: '2px' }}>
              {customer?.invoiceAddress || customer?.address || ''}
            </span>
          </div>
          <div style={{ display: 'flex', marginTop: '6px' }}>
            <span style={{ width: '140px', flexShrink: 0, fontWeight: '500' }}>Hình thức thanh toán:</span>
            <span style={{ flex: 1, borderBottom: '1px dotted #D1D5DB', paddingBottom: '2px' }}>
              {
                order.paymentMethod === 'cash' ? 'Tiền mặt' : 'Chuyển khoản'
              }
            </span>
          </div>
          <div style={{ display: 'flex', marginTop: '6px' }}>
            <span style={{ width: '140px', flexShrink: 0, fontWeight: '500' }}>Số tài khoản:</span>
            <span style={{ flex: 1, borderBottom: '1px dotted #D1D5DB', paddingBottom: '2px' }}>
              {customer?.bankAccount || ''}
            </span>
          </div>
        </div>

        {/* Items Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '15px', fontSize: '10px', border: '1px solid #9CA3AF' }}>
          <thead>
            <tr style={{ backgroundColor: '#DBEAFE', color: '#000000' }}>
              <th style={{ border: '1px solid #9CA3AF', padding: '8px 6px', textAlign: 'center', width: '35px', fontWeight: '700' }}>STT</th>
              <th style={{ border: '1px solid #9CA3AF', padding: '8px 6px', textAlign: 'left', fontWeight: '700' }}>Tên hàng hóa, dịch vụ</th>
              <th style={{ border: '1px solid #9CA3AF', padding: '8px 6px', textAlign: 'center', width: '55px', fontWeight: '700' }}>Đơn vị tính</th>
              <th style={{ border: '1px solid #9CA3AF', padding: '8px 6px', textAlign: 'center', width: '60px', fontWeight: '700' }}>Số lượng</th>
              <th style={{ border: '1px solid #9CA3AF', padding: '8px 6px', textAlign: 'right', width: '90px', fontWeight: '700' }}>Đơn giá</th>
              <th style={{ border: '1px solid #9CA3AF', padding: '8px 6px', textAlign: 'right', width: '100px', fontWeight: '700' }}>Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index}>
                <td style={{ border: '1px solid #D1D5DB', padding: '7px 6px', textAlign: 'center', color: '#000000' }}>
                  {index + 1}
                </td>
                <td style={{ border: '1px solid #D1D5DB', padding: '7px 6px', color: '#000000', fontWeight: '500' }}>
                  {item.name}
                </td>
                <td style={{ border: '1px solid #D1D5DB', padding: '7px 6px', textAlign: 'center', color: '#000000' }}>
                  {item.unit || 'Cái'}
                </td>
                <td style={{ border: '1px solid #D1D5DB', padding: '7px 6px', textAlign: 'center', color: '#000000', fontWeight: '500' }}>
                  {item.quantity}
                </td>
                <td style={{ border: '1px solid #D1D5DB', padding: '7px 6px', textAlign: 'right', color: '#000000', fontWeight: '500' }}>
                  {item.price.toLocaleString('vi-VN')}
                </td>
                <td style={{ border: '1px solid #D1D5DB', padding: '7px 6px', textAlign: 'right', fontWeight: '700', color: '#000000' }}>
                  {(item.price * item.quantity).toLocaleString('vi-VN')}
                </td>
              </tr>
            ))}
            {/* Total row */}
            <tr style={{ backgroundColor: '#F3F4F6' }}>
              <td colSpan={5} style={{ border: '1px solid #9CA3AF', padding: '8px 6px', textAlign: 'right', fontWeight: '700', color: '#000000' }}>
                Cộng tiền hàng
              </td>
              <td style={{ border: '1px solid #9CA3AF', padding: '8px 6px', textAlign: 'right', fontWeight: '700', color: '#000000' }}>
                {subtotalBeforeVAT.toLocaleString('vi-VN')}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Amount in words */}
        <div style={{ marginBottom: '25px', fontSize: '11px', color: '#000000', fontWeight: '500' }}>
          <span style={{ fontWeight: '600' }}>Số tiền viết bằng chữ: </span>
          <span style={{ fontStyle: 'italic' }}>
            {numberToVietnameseWords(order.total)} đồng
          </span>
          {order.discount > 0 && (
            <span style={{ marginLeft: '20px' }}>
              (Giảm giá: <span style={{ fontWeight: '600', color: '#DC2626' }}>{order.discount.toLocaleString('vi-VN')}đ</span>)
            </span>
          )}
        </div>

        {/* Signatures - Only 2 columns */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '50px' }}>
          <div style={{ textAlign: 'center', flex: 1 }}>
            <div style={{ fontSize: '11px', fontWeight: '600', color: '#1F2937', marginBottom: '6px' }}>
              Người mua hàng
            </div>
            <div style={{ fontSize: '9px', color: '#9CA3AF', fontStyle: 'italic', marginBottom: '70px' }}>
              (Ký, ghi rõ họ tên)
            </div>
          </div>
          
          <div style={{ textAlign: 'center', flex: 1 }}>
            <div style={{ fontSize: '11px', fontWeight: '600', color: '#1F2937', marginBottom: '6px' }}>
              Người bán hàng
            </div>
            <div style={{ fontSize: '9px', color: '#9CA3AF', fontStyle: 'italic', marginBottom: '8px' }}>
              (Ký, ghi rõ họ tên)
            </div>
            
            {/* Digital Signature - Only show if issued */}
            {isIssued && (
              <div style={{ marginTop: '15px' }}>
                <div style={{ 
                  border: '1px solid #10B981', 
                  borderRadius: '4px', 
                  padding: '12px 16px', 
                  backgroundColor: '#D1FAE5',
                  display: 'inline-block',
                  minWidth: '200px'
                }}>
                  <div style={{ fontSize: '10px', fontWeight: '600', color: '#059669', marginBottom: '4px', textAlign: 'center' }}>
                    ✓ Đã ký điện tử
                  </div>
                  <div style={{ fontSize: '9px', color: '#047857', textAlign: 'center', fontWeight: '600' }}>
                    {companyInfo.name}
                  </div>
                  <div style={{ fontSize: '8px', color: '#6B7280', marginTop: '4px', textAlign: 'center' }}>
                    {new Date(order.date).toLocaleString('vi-VN')}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer note */}
        <div style={{ marginTop: '50px', paddingTop: '15px', borderTop: '1px solid #E5E7EB', fontSize: '9px', color: '#9CA3AF', textAlign: 'center' }}>
          <div>Hóa đơn được tạo bởi hệ thống Salepa POS - Mã: {invoiceNumber}</div>
        </div>
      </div>
    </div>
  );
}

// Helper function to convert number to Vietnamese words
function numberToVietnameseWords(num: number): string {
  if (num === 0) return 'Không';
  
  const ones = ['', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];
  const teens = ['mười', 'mười một', 'mười hai', 'mười ba', 'mười bốn', 'mười lăm', 'mười sáu', 'mười bảy', 'mười tám', 'mười chín'];
  const tens = ['', '', 'hai mươi', 'ba mươi', 'bốn mươi', 'năm mươi', 'sáu mươi', 'bảy mươi', 'tám mươi', 'chín mươi'];
  const thousands = ['', 'nghìn', 'triệu', 'tỷ'];

  function convertLessThanThousand(n: number): string {
    if (n === 0) return '';
    if (n < 10) return ones[n];
    if (n < 20) return teens[n - 10];
    if (n < 100) {
      const ten = Math.floor(n / 10);
      const one = n % 10;
      return tens[ten] + (one > 0 ? ' ' + ones[one] : '');
    }
    const hundred = Math.floor(n / 100);
    const rest = n % 100;
    return ones[hundred] + ' trăm' + (rest > 0 ? ' ' + convertLessThanThousand(rest) : '');
  }

  let result = '';
  let thousandCounter = 0;
  
  while (num > 0) {
    const chunk = num % 1000;
    if (chunk > 0) {
      const chunkWords = convertLessThanThousand(chunk);
      result = chunkWords + (thousands[thousandCounter] ? ' ' + thousands[thousandCounter] : '') + (result ? ' ' + result : '');
    }
    num = Math.floor(num / 1000);
    thousandCounter++;
  }
  
  // Capitalize first letter
  return result.charAt(0).toUpperCase() + result.slice(1);
}