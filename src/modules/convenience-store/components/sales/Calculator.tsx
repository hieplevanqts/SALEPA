import { useState } from 'react';
import { X, Delete } from 'lucide-react';

interface CalculatorProps {
  onConfirm: (value: number) => void;
  onClose: () => void;
  title: string;
  initialValue?: number;
}

export function Calculator({ onConfirm, onClose, title, initialValue = 0 }: CalculatorProps) {
  const [display, setDisplay] = useState(initialValue.toString());

  const handleNumber = (num: string) => {
    if (display === '0') {
      setDisplay(num);
    } else {
      setDisplay(display + num);
    }
  };

  const handleClear = () => {
    setDisplay('0');
  };

  const handleBackspace = () => {
    if (display.length === 1) {
      setDisplay('0');
    } else {
      setDisplay(display.slice(0, -1));
    }
  };

  const handleConfirm = () => {
    const value = parseFloat(display) || 0;
    onConfirm(value);
    onClose();
  };

  const buttons = [
    ['7', '8', '9'],
    ['4', '5', '6'],
    ['1', '2', '3'],
    ['0', '000', '.'],
  ];

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-t-2xl">
          <h3 className="text-white">{title}</h3>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Display */}
          <div className="bg-gray-100 rounded-xl p-4 mb-4 border-2 border-gray-300">
            <div className="text-right text-4xl font-mono text-gray-900 break-all">
              {display}
            </div>
          </div>

          {/* Numpad */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {buttons.map((row, i) => (
              row.map((btn) => (
                <button
                  key={btn}
                  onClick={() => handleNumber(btn)}
                  className="bg-white border-2 border-gray-300 hover:bg-gray-50 hover:border-blue-500 text-2xl py-4 rounded-xl transition-all active:scale-95 font-medium"
                >
                  {btn}
                </button>
              ))
            ))}
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <button
              onClick={handleBackspace}
              className="bg-orange-100 border-2 border-orange-300 hover:bg-orange-200 text-orange-700 py-3 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <Delete className="w-5 h-5" />
              Xóa
            </button>
            <button
              onClick={handleClear}
              className="bg-red-100 border-2 border-red-300 hover:bg-red-200 text-red-700 py-3 rounded-xl transition-all"
            >
              Clear
            </button>
          </div>

          {/* Confirm Button */}
          <button
            onClick={handleConfirm}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg font-medium text-lg"
          >
            ✓ Xác Nhận
          </button>
        </div>
      </div>
    </div>
  );
}
