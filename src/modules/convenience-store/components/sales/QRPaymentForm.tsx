import { useState, useEffect } from 'react';
import { useTranslation } from '../../../../lib/convenience-store-lib/useTranslation';
import { QrCode, Copy, CheckCircle, AlertCircle, Clock, Building2, ChevronDown, ExternalLink, Settings } from 'lucide-react';

interface QRPaymentFormProps {
  amount: number;
  orderCode: string;
  onSuccess: (paymentData: QRPaymentData) => void;
  onCancel: () => void;
  paymentType: 'transfer' | 'momo' | 'zalopay' | 'vnpay';
}

export interface QRPaymentData {
  method: string;
  bankCode: string;
  accountNumber: string;
  accountName: string;
  amount: number;
  content: string;
  transactionId?: string;
}

const BANKS = [
  { code: 'VCB', name: 'Vietcombank', logo: '🏦', accountNumber: '1234567890', accountName: 'CONG TY POS SYSTEM' },
  { code: 'TCB', name: 'Techcombank', logo: '🏦', accountNumber: '9876543210', accountName: 'CONG TY POS SYSTEM' },
  { code: 'MB', name: 'MB Bank', logo: '🏦', accountNumber: '1122334455', accountName: 'CONG TY POS SYSTEM' },
  { code: 'VPB', name: 'VPBank', logo: '🏦', accountNumber: '5544332211', accountName: 'CONG TY POS SYSTEM' },
  { code: 'ACB', name: 'ACB', logo: '🏦', accountNumber: '6677889900', accountName: 'CONG TY POS SYSTEM' },
  { code: 'BIDV', name: 'BIDV', logo: '🏦', accountNumber: '0099887766', accountName: 'CONG TY POS SYSTEM' },
];

export function QRPaymentForm({ amount, orderCode, onSuccess, onCancel, paymentType }: QRPaymentFormProps) {
  const { t } = useTranslation();
  const [selectedBank, setSelectedBank] = useState(BANKS[0]);
  const [showBankList, setShowBankList] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [transactionId, setTransactionId] = useState('');

  // Load payment settings from localStorage
  const [paymentSettings, setPaymentSettings] = useState<any>(null);
  const [isConfigured, setIsConfigured] = useState(false);

  useEffect(() => {
    const savedSettings = localStorage.getItem('pos-payment-settings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setPaymentSettings(settings);
      
      // Check if configured based on payment type
      if (paymentType === 'transfer') {
        setIsConfigured(!!(settings.bankName && settings.accountNumber && settings.accountName));
      } else if (paymentType === 'momo') {
        setIsConfigured(!!(settings.momoPhone && settings.momoName));
      } else if (paymentType === 'zalopay') {
        setIsConfigured(!!(settings.zalopayPhone && settings.zalopayName));
      } else if (paymentType === 'vnpay') {
        setIsConfigured(!!(settings.vnpayPhone && settings.vnpayName));
      }
    }
  }, [paymentType]);

  const paymentContent = `POS ${orderCode}`;
  
  // Get bank info from settings
  const getBankInfo = () => {
    if (!paymentSettings) return null;
    return {
      name: paymentSettings.bankName || 'Chưa cấu hình',
      accountNumber: paymentSettings.accountNumber || '',
      accountName: paymentSettings.accountName || '',
    };
  };

  // Get e-wallet info from settings
  const getEwalletInfo = () => {
    if (!paymentSettings) return null;
    
    if (paymentType === 'momo') {
      return {
        name: 'MoMo',
        logo: '💜',
        phone: paymentSettings.momoPhone || '',
        accountName: paymentSettings.momoName || '',
        color: '#A50064',
      };
    } else if (paymentType === 'zalopay') {
      return {
        name: 'ZaloPay',
        logo: '💙',
        phone: paymentSettings.zalopayPhone || '',
        accountName: paymentSettings.zalopayName || '',
        color: '#0068FF',
      };
    } else if (paymentType === 'vnpay') {
      return {
        name: 'VNPay',
        logo: '🔵',
        phone: paymentSettings.vnpayPhone || '',
        accountName: paymentSettings.vnpayName || '',
        color: '#0B59A0',
      };
    }
    return null;
  };
  
  // Generate VietQR URL
  const generateQRUrl = () => {
    if (paymentType === 'transfer') {
      // VietQR format
      const bankInfo = getBankInfo();
      if (!bankInfo) return '';
      
      const accountNo = bankInfo.accountNumber;
      const accountName = bankInfo.accountName;
      const bankCode = 'VCB'; // Default, should be configurable
      const template = 'compact2';
      
      return `https://img.vietqr.io/image/${bankCode}-${accountNo}-${template}.jpg?amount=${amount}&addInfo=${encodeURIComponent(paymentContent)}&accountName=${encodeURIComponent(accountName)}`;
    } else {
      // For e-wallets, use a placeholder QR
      return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(`${paymentType.toUpperCase()}:${amount}:${paymentContent}`)}`;
    }
  };

  // Timer countdown
  useEffect(() => {
    if (timeLeft > 0 && !isConfirmed) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft, isConfirmed]);

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Copy to clipboard
  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const walletInfo = paymentType !== 'transfer' ? getEwalletInfo() : null;

  return (
    <div className="py-6">
      {/* Payment Method Title */}
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          {paymentType === 'transfer' 
            ? 'Chuyển khoản ngân hàng'
            : paymentType === 'momo' ? 'MoMo'
            : paymentType === 'zalopay' ? 'ZaloPay'
            : 'VNPay'
          }
        </h3>
        <p className="text-gray-600">
          Quét mã QR để thanh toán
        </p>
      </div>

      {/* QR Code */}
      <div className="flex justify-center mb-6">
        <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-gray-200">
          <img
            src={generateQRUrl()}
            alt="QR Code"
            className="w-72 h-72 object-contain"
            onError={(e) => {
              // Fallback to generic QR if VietQR fails
              e.currentTarget.src = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(paymentContent)}`;
            }}
          />
        </div>
      </div>

      {/* Payment Info */}
      {paymentType === 'transfer' && getBankInfo() && (
        <div className="space-y-3 mb-6">
          <div className="flex justify-between items-center py-2 border-b border-gray-200">
            <span className="text-gray-600">Ngân hàng:</span>
            <span className="font-semibold text-gray-900">{getBankInfo()?.name}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-200">
            <span className="text-gray-600">Số tài khoản:</span>
            <div className="flex items-center gap-2">
              <span className="font-mono font-semibold text-gray-900">{getBankInfo()?.accountNumber}</span>
              <button
                onClick={() => handleCopy(getBankInfo()?.accountNumber || '', 'account')}
                className="p-1.5 hover:bg-gray-100 rounded transition-colors"
              >
                {copied === 'account' ? <CheckCircle className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-gray-400" />}
              </button>
            </div>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-200">
            <span className="text-gray-600">Chủ tài khoản:</span>
            <span className="font-semibold text-gray-900">{getBankInfo()?.accountName}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-200">
            <span className="text-gray-600">Nội dung:</span>
            <div className="flex items-center gap-2">
              <span className="font-mono font-semibold text-gray-900">{paymentContent}</span>
              <button
                onClick={() => handleCopy(paymentContent, 'content')}
                className="p-1.5 hover:bg-gray-100 rounded transition-colors"
              >
                {copied === 'content' ? <CheckCircle className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-gray-400" />}
              </button>
            </div>
          </div>
        </div>
      )}

      {walletInfo && (
        <div className="space-y-3 mb-6">
          <div className="flex justify-between items-center py-2 border-b border-gray-200">
            <span className="text-gray-600">Số điện thoại:</span>
            <div className="flex items-center gap-2">
              <span className="font-mono font-semibold text-gray-900">{walletInfo.phone}</span>
              <button
                onClick={() => handleCopy(walletInfo.phone, 'phone')}
                className="p-1.5 hover:bg-gray-100 rounded transition-colors"
              >
                {copied === 'phone' ? <CheckCircle className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-gray-400" />}
              </button>
            </div>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-200">
            <span className="text-gray-600">Tên tài khoản:</span>
            <span className="font-semibold text-gray-900">{walletInfo.accountName}</span>
          </div>
        </div>
      )}
    </div>
  );
}