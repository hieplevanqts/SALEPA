interface CardPaymentFormProps {
  amount: number;
  onSuccess: (cardData: CardData) => void;
  onCancel: () => void;
}

export interface CardData {
  cardNumber: string;
  cardholderName: string;
  expiryDate: string;
  cvv: string;
  cardType: 'visa' | 'mastercard' | 'amex' | 'unknown';
}

export function CardPaymentForm({
  amount: _amount,
  onSuccess: _onSuccess,
  onCancel: _onCancel,
}: CardPaymentFormProps) {

  return (
    <div className="py-8">
      {/* Card Payment Icon */}
      

      {/* Payment Instruction */}
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-3">
          Quẹt thẻ trên máy POS
        </h3>
        <p className="text-base text-gray-600 mb-2">
          Vui lòng quẹt thẻ hoặc chạm thẻ trên máy POS
        </p>
        
      </div>

    </div>
  );
}